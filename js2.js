 let dst = cv.Mat.zeros(src.rows,src.cols, cv.CV_8UC3);
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
      cv.bitwise_not(gray, binary);
      //cv.threshold(src, src, 120, 200, cv.THRESH_BINARY);
      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();
      // You can try more different parameters
      cv.findContours(binary, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
      // draw contours with random Scalar
      for (let i = 0; i < contours.size(); ++i) {
        let contour = contours.get(i);
        let approx = new cv.Mat();
        cv.approxPolyDP(contour,approx, 0.01 * cv.arcLength(contour, true), true)
        if (approx.rows == 4) {
          let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
                                      Math.round(Math.random() * 255));
          cv.drawContours(dst, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
        }
      }
      return dst;