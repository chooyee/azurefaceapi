function contours(img) {
    let gray = new cv.Mat();
    let edgeDetected = new cv.Mat();
    let thresh = new cv.Mat();
    //let binary = new cv.Mat();
    let dst = cv.Mat.zeros(img.rows,img.cols, cv.CV_8UC3);
    cv.cvtColor(img, gray, cv.COLOR_RGBA2GRAY, 0);
    
    //cv.bitwise_not(gray, binary);
    cv.threshold(gray, thresh, 120, 200, cv.THRESH_BINARY);
    //cv.Canny(gray, edgeDetected, 100, 200, 3, true);

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    // You can try more different parameters
    cv.findContours(thresh, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    // draw contours with random Scalar
    /*for (let i = 0; i < contours.size(); ++i) {
      let contour = contours.get(i);
      let approx = new cv.Mat();
      cv.approxPolyDP(contour,approx, 0.01 * cv.arcLength(contour, true), true)
      if (approx.rows == 4) {
        console.log('seq' + i);
        let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
                                    Math.round(Math.random() * 255));
        //cv.drawContours(dst, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
        let rect = cv.boundingRect(contour);
        console.log("width: " + rect.width);
        console.log("height: " + rect.height);
        let rectangleColor = new cv.Scalar(255, 255, 0);        
        let point1 = new cv.Point(rect.x, rect.y);
        let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
        //cv.rectangle(dst, point1, point2, rectangleColor, 2, cv.LINE_AA, 0);
      }
    }*/
    let seq = getBiggestCountours(contours);
    console.log(seq);
    //let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),Math.round(Math.random() * 255));
    let contour = contours.get(seq);
    let rect = cv.boundingRect(contour);
  
    console.log("width: " + rect.width);
    console.log("height: " + rect.height);
    // let rectangleColor = new cv.Scalar(255, 0, 0);        
    // let point1 = new cv.Point(rect.x+3, rect.y+3);
    // let point2 = new cv.Point(rect.x + rect.width -3, rect.y + rect.height-3);
    // console.log(point1);
    // console.log(point2);
    
    //cv.rectangle(img, point1, point2, color, 2);
    return img.roi(rect);
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