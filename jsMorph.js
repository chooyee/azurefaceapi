cropImage = function(el) {

    let imageOriginal = cv.imread('imageDestination');
    let imageGray = new cv.Mat();
    let imageDestination = new cv.Mat();
    let imageDestination_all_contours = new cv.Mat();
    let imageDestination_masked = new cv.Mat();
    let imageDestination_cropped = new cv.Mat();
    let imageDestination_resized = new cv.Mat();
    let imageDestination_convex_hull = new cv.Mat();
    let imageMorphed = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    let Color_red = new cv.Scalar(255, 0, 0, 255);
    let Color_white = new cv.Scalar(255, 255, 255, 255);

    //convert original BGR image to GRAY
    cv.cvtColor(imageOriginal, imageGray, cv.COLOR_BGR2GRAY);

    //Threshold the image https://docs.opencv.org/3.4/d7/dd0/tutorial_js_thresholding.html
    cv.threshold(imageGray, imageDestination, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)[1];

    // apply morphology Open and Close https://docs.opencv.org/master/d4/d76/tutorial_js_morphological_ops.html
    kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(3,3));

    // MORPH_OPEN = removes noise (erosion then dilation)
    cv.morphologyEx(imageDestination, imageMorphed, cv.MORPH_OPEN, kernel);

    kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(21,21));

    // MORPH_CLOSE - closes small holes inside the foreground objects, or small black points on the object (dilation then erosion)
    cv.morphologyEx(imageMorphed, imageMorphed, cv.MORPH_CLOSE, kernel);

    //Step 1: Find the Contours
    //Good reference: https://docs.opencv.org/master/d0/d43/tutorial_js_table_of_contents_contours.html
    //Good reference: https://docs.opencv.org/master/d4/d73/tutorial_py_contours_begin.html
    //RETR_LIST - Retrieves all the contours, but doesn't create any parent-child relationship.
    //RETR_EXTERNAL - Returns only extreme outer contour
    //RETR_CCOMP - Retrieves all the contours and arranges them to a 2-level hierarchy.
    //RETR_TREE - Retrieves all the contours and creates a full family hierarchy list.
    //CHAIN_APPROX_NONE - Stores all the contour points. That is, any 2 subsequent points (x1,y1) and (x2,y2) of the contour will be either horizontal, vertical or diagonal neighbors
    //CHAIN_APPROX_SIMPLE - Compresses horizontal, vertical, and diagonal segments and leaves only their end points. For example, an up-right rectangular contour is encoded with 4 points
    cv.findContours(imageMorphed, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

    //Ignore any contour that looks like it's the entire image
    area_of_75_percent_of_entire_image = (imageOriginal.rows * imageOriginal.cols) - (imageOriginal.rows * imageOriginal.cols) * .25;
    console.log("entire area: ", area_of_75_percent_of_entire_image);

    //find the contour that looks like a coin
    let area_max =0;
    let i_max = 0;
    let cnt_max = 0;
    var ii = 0;
    for (let i = 0; i < contours.size(); i++) {
        let cnt = contours.get(i);
        let area = cv.contourArea(cnt, false);
        console.log("i: ", i, " area: ", area, " area_max: ", area_max, " delta: ", area/1000000);
        if((area >= area_max) && (area < area_of_75_percent_of_entire_image)){
            console.log("winner: (", i, ") ", area, " >= ", area_max)
            area_max = area;
            i_max = i;
            cnt_max = cnt;
            ii = i;
        }
    }

    //no max contour found above
    if(ii === 0){
        cnt_max = contours.get(0);
    }

    imageDestination_all_contours = imageOriginal.clone();
    cv.drawContours(imageDestination_all_contours, contours, -1, Color_red, 3);
    cv.imshow('imageDestination_all_contours', imageDestination_all_contours);
    $('#messagetouser_all_contours').html("area_max: " + area_max + " i_max: " + i_max + " ii: " + ii);

    //test convex hull. see reference: https://docs.opencv.org/3.4/dc/dcf/tutorial_js_contour_features.html
    let hull_max = 0;
    let hull = new cv.MatVector();
    imageDestination_convex_hull = imageOriginal.clone();
    // approximates each contour to convex hull
    for (let i = 0; i < contours.size(); ++i) {
        let tmp = new cv.Mat();
        let cnt = contours.get(i);

        let area = cv.contourArea(cnt, false);
        console.log("console_hull i: ", i, " area: ", area, " area_max: ", area_max, " delta: ", area/1000000);
        if((area >= area_max) && (area < area_of_75_percent_of_entire_image)){
            console.log("console_hull winner: (", i, ") ", area, " >= ", area_max)
            area_max = area;
            i_max = i;
            cnt_max = cnt;
            ii = i;
            cv.convexHull(cnt, tmp, false, true);
            hull_max = tmp;
            hull.push_back(tmp);
        }
    }

    // draw contours with random Scalar
    for (let i = 0; i < hull.size(); ++i) {
        cv.drawContours(imageDestination_convex_hull, hull, i, Color_red, 3, 8, hierarchy, 0);
    }
    cv.imshow('imageDestination_convex_hull', imageDestination_convex_hull);
    $('#messagetouser_convex_hull').html("rows: " + imageDestination_convex_hull.rows + " cols: " + imageDestination_convex_hull.cols + " type: " + imageDestination_convex_hull.type() + " depth: " + imageDestination_convex_hull.depth() + " channels: " + imageDestination_convex_hull.channels());
    //end test

    //Step 2: Mask the contour selected
    //let rotatedRect = cv.fitEllipse(cnt_max); //a rectangle around the largest contour
    let rotatedRect = cv.fitEllipse(hull_max); //a rectangle around the largest contour
    cv.ellipse1(imageOriginal, rotatedRect, Color_white, 1, cv.LINE_8);
    let mask = new cv.Mat.ones(imageOriginal.size(), cv.CV_8UC3);
    cv.ellipse1(mask, rotatedRect, Color_white, -1, cv.LINE_8);
    cv.cvtColor(mask, mask, cv.COLOR_BGR2GRAY);
    cv.bitwise_and(imageOriginal, imageOriginal, imageDestination_masked, mask);
    cv.imshow('imageDestination_masked', mask);
    $('#messagetouser_masked').html("rows: " + mask.rows + " cols: " + mask.cols + " type: " + mask.type() + " depth: " + mask.depth() + " channels: " + mask.channels());

    //Step 3: Crop the contour
    imageDestination_cropped = imageDestination_masked.clone();
    let boundingRect = cv.boundingRect(cnt_max);
    let point1 = new cv.Point(boundingRect.x, boundingRect.y);
    let point2 = new cv.Point(boundingRect.x + boundingRect.width, boundingRect.y + boundingRect.height);
    cv.rectangle(imageDestination_cropped, point1, point2, new cv.Scalar(255, 255, 255, 0), 0, cv.LINE_8, 0);
    cv.imshow('imageDestination_cropped', imageDestination_cropped);
    $('#messagetouser_cropped').html("rows: " + imageDestination_cropped.rows + " cols: " + imageDestination_cropped.cols + " type: " + imageDestination_cropped.type() + " depth: " + imageDestination_cropped.depth() + " channels: " + imageDestination_cropped.channels());

    //Step 4: Resize the contour
    let dsize = new cv.Size(1000, 1000);
    cv.resize(imageDestination_cropped, imageDestination_resized, dsize, 0, 0, cv.INTER_AREA);
    cv.imshow('imageDestination_resized', imageDestination_resized);
    $('#messagetouser_resized').html("rows: " + imageDestination_resized.rows + " cols: " + imageDestination_resized.cols + " type: " + imageDestination_resized.type() + " depth: " + imageDestination_resized.depth() + " channels: " + imageDestination_resized.channels());

    imageOriginal.delete();
    imageDestination.delete();
    imageDestination_all_contours.delete();
    imageDestination_masked.delete();
    imageDestination_cropped.delete();
    imageDestination_resized.delete();
    imageDestination_convex_hull.delete();
    imageMorphed.delete();
    contours.delete();
    hierarchy.delete();
    cnt.delete();
    tmp.delete();

};