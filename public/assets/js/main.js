var filePicked = false;
    var imgElement = $('#imageSrc');
    var inputElement = $('#fileInput');

    inputElement.on("change",function(e){
       var reader = new FileReader();

        reader.onload = function (e) {
          imgElement.attr('src', e.target.result);
        }
       reader.readAsDataURL(this.files[0]);
       filePicked = true;
    });
    
    imgElement.on('load', function(){
      console.log('in'); 
      let mat = cv.imread(imgElement.attr('id'));
      mat = contours(mat);
      cv.imshow('canvasOutput', mat);
      mat.delete();

      $("#btnRotate").show();

      let template = cv.imread($('#template').attr('id'));

      let i =0;
      let matched= false;
      for (i=0;i<4;i++)
      {
        let src = cv.imread(canvasOutput);
        if (!match(src, template))
        {
          cv.rotate(src, src, cv.ROTATE_90_CLOCKWISE);          
        }
        else
        {
          matched = true;
          break;
        }
      }
      if (!matched)
      {
        alert("Couldnt determined is an NRIC. Pls retry.");
        return;
      }

      OverlayWatermark();
      
    });

    // function CureImg(mat)
    // {
    //   mat = contours(mat);
    //   cv.imshow('canvasOutput', mat);
    //   mat.delete();
    //   OverlayWatermark();
    // }

    function Rotate180()
    {
      let mat = cv.imread('canvasOutput');
      cv.rotate(mat, mat, cv.ROTATE_90_CLOCKWISE);      
      cv.imshow('canvasOutput', mat);
      OverlayWatermark();
    }

    function OverlayWatermark()
    {
      var canvas = document.getElementById("canvasOutput");
      var ctx = canvas.getContext("2d");

      ctx.font = "20px serif";
      ctx.fillStyle = "red";
      ctx.textAlign = "right";
      ctx.fillText("ALLIANCE BANK ONLY", 256,256); 
    }
    
    function onOpenCvReady() {
      //document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
    }

    function contours(imageOriginal) {      
      let imageGray = new cv.Mat();
      let imageDestination = new cv.Mat();
      let imageThresh = new cv.Mat();
      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();
      let imageROI = new cv.Mat();
      let imageResized = new cv.Mat();
      let imageOverlay = new cv.Mat();
      var p = 0.1;//transparency

      //convert original BGR image to GRAY
      cv.cvtColor(imageOriginal, imageGray, cv.COLOR_BGR2GRAY);

      //Threshold the image https://docs.opencv.org/3.4/d7/dd0/tutorial_js_thresholding.html
      cv.threshold(imageGray, imageThresh, 120, 200, cv.THRESH_BINARY);

      //Step 1: Find the Contours
      //Good reference: https://docs.opencv.org/master/d0/d43/tutorial_js_table_of_contents_contours.html
      //Good reference: https://docs.opencv.org/master/d4/d73/tutorial_py_contours_begin.html
      //RETR_LIST - Retrieves all the contours, but doesn't create any parent-child relationship.
      //RETR_EXTERNAL - Returns only extreme outer contour
      //RETR_CCOMP - Retrieves all the contours and arranges them to a 2-level hierarchy.
      //RETR_TREE - Retrieves all the contours and creates a full family hierarchy list.
      //CHAIN_APPROX_NONE - Stores all the contour points. That is, any 2 subsequent points (x1,y1) and (x2,y2) of the contour will be either horizontal, vertical or diagonal neighbors
      //CHAIN_APPROX_SIMPLE - Compresses horizontal, vertical, and diagonal segments and leaves only their end points. For example, an up-right rectangular contour is encoded with 4 points
      cv.findContours(imageThresh, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

      //Ignore any contour that looks like it's the entire image
      // area_of_75_percent_of_entire_image = (imageOriginal.rows * imageOriginal.cols) - (imageOriginal.rows * imageOriginal.cols) * .25;
      // console.log("entire area: ", area_of_75_percent_of_entire_image);
      let seq = getBiggestCountours(contours);
      console.log(seq);
      //let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),Math.round(Math.random() * 255));
      let contour = contours.get(seq);
      let rect = cv.boundingRect(contour);

      imageROI = imageOriginal.roi(rect);
      var maxWidth = 480;
      var newHeight = rect.height * (maxWidth/rect.width);
      
      let dsize = new cv.Size(maxWidth, newHeight);
      // You can try more different parameters
      cv.resize(imageROI, imageResized, dsize, 0, 0, cv.INTER_AREA);

      imageDestination.delete();
      imageGray.delete();
      contours.delete();
      hierarchy.delete();
      imageROI.delete();
      imageOverlay.delete();
      imageThresh.delete();

      return imageResized;
    }

    function match(src, template)
    {
      let dst = new cv.Mat();
      let mask = new cv.Mat();
      cv.matchTemplate(src, template, dst, cv.TM_CCOEFF, mask);
      let result = cv.minMaxLoc(dst, mask);
      console.log(result);
      dst.delete(); mask.delete();
      if (result.maxLoc.x>340 && result.maxLoc.y <60)
      {        
        let maxPoint = result.maxLoc;
        let color = new cv.Scalar(255, 0, 0, 255);
        let point = new cv.Point(maxPoint.x + template.cols, maxPoint.y + template.rows);
        cv.rectangle(src, maxPoint, point, color, 2, cv.LINE_8, 0);
        cv.imshow('canvasOutput', src);
        return true;
      }
      else
      {        
        return false;
      }

    }

    function getBiggestCountours(contours)
    {
      let sortableContours = [];
      for (let i = 0; i < contours.size(); i++) {
        let contour = contours.get(i);
        let approx = new cv.Mat();
        cv.approxPolyDP(contour,approx, 0.01 * cv.arcLength(contour, true), true)
        if (approx.rows == 4) {          
          let area = cv.contourArea(contour, false);
          let perim = cv.arcLength(contour, false);
          sortableContours.push({ areaSize: area, perimiterSize: perim, contour: contour, seq:i });
        }
      }

      sortableContours = sortableContours.sort((item1, item2) => { return (item1.areaSize > item2.areaSize) ? -1 : (item1.areaSize < item2.areaSize) ? 1 : 0; }).slice(0, 5);
      return sortableContours[0].seq;
    }
    
    $(document).ready(function() {
        //$('#token').val((Math.random() * 10000000) + 1);
        var submitbut= $("#btnSubmit");
        submitbut.click(function() {
            console.log('submit')
            if ($('#txtstaffid').val()=='')
            {
              alert('Please enter your staff id');
              return;
            }
            if (!filePicked)
            {
              alert('Please enter your staff id');
              return;
            }
            submitbut.html('Processing')
            event.preventDefault();
           
            var canvas = document.getElementById('canvasOutput');
            canvas.toBlob(function(blob) {             
              var fd = new FormData();
              console.log(blob)
              fd.append('image', blob, $('#txtstaffid').val());         
              fd.append('userid', $('#txtstaffid').val());
              fd.append('fingerprint', $('#fprint').val());
              Upload(fd); //upload the "formData", not the "blob"
            },'image/jpeg', 0.95);
            
        });
        $("#btnRotate").click(function(){
          Rotate180();
        })
    });

    function Upload(fd)
    {
      var submitbut= $("#btnSubmit");
      $.ajax({
          url: '/profile',
          type: 'post',
          data: fd,
          contentType: false,
          processData: false,
          success: function(response){
              
              submitbut.html('Submit')
              console.log(response);
              if(response != 0){
                
                var canvas = document.getElementById('canvasOutput');
                const context = canvas.getContext('2d');
                context.clearRect(0, 0, canvas.width, canvas.height);
                $('#txtstaffid').val('');
                alert('Your image has been uploaded successfully!');
              }
              else{
                  alert('file not uploaded');
              }
          },
          error: function(XMLHttpRequest, textStatus, errorThrown) {
              console.log(errorThrown);
              alert(errorThrown);
          }
      });
    }