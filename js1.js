let color = new cv.Scalar(0, 255, 0);
      let edgeDetected = new cv.Mat();
      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();
      cv.Canny(img, edgeDetected, 100, 200, 3, true);
      cv.findContours(edgeDetected, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_NONE);

      //let foundContour = new cv.MatVector();

      //Get area for all contours so we can find the biggest
      let sortableContours = [];
      for (let i = 0; i < contours.size(); i++) {
        let cnt = contours.get(i);
        let area = cv.contourArea(cnt, false);
        let perim = cv.arcLength(cnt, false);

        sortableContours.push({ areaSize: area, perimiterSize: perim, contour: cnt });
      }

      sortableContours = sortableContours.sort((item1, item2) => { return (item1.areaSize > item2.areaSize) ? -1 : (item1.areaSize < item2.areaSize) ? 1 : 0; }).slice(0, 5);

      //Ensure the top area contour has 4 corners (NOTE: This is not a perfect science and likely needs more attention)
      let approx = new cv.Mat();
      cv.approxPolyDP(sortableContours[0].contour, approx, .05 * sortableContours[0].perimiterSize, true);

      if (approx.rows == 4) {
        console.log('Found a 4-corner approx');
        foundContour = approx;
      }
      else{
        console.log('No 4-corner large contour!');
        return;
      }

      //Find the corners
      let corner1 = new cv.Point(foundContour.data32S[0], foundContour.data32S[1]);
      let corner2 = new cv.Point(foundContour.data32S[2], foundContour.data32S[3]);
      let corner3 = new cv.Point(foundContour.data32S[4], foundContour.data32S[5]);
      let corner4 = new cv.Point(foundContour.data32S[6], foundContour.data32S[7]);

      //Order the corners
      let cornerArray = new cv.MatVector();
      cornerArray = [{ corner: corner1 }, { corner: corner2 }, { corner: corner3 }, { corner: corner4 }];
      //Sort by Y position (to get top-down)
      cornerArray.sort((item1, item2) => { 
        return (item1.corner.y < item2.corner.y) ? -1 : (item1.corner.y > item2.corner.y) ? 1 : 0; 
      }).slice(0, 5);

      for (c of cornerArray) {
        cv.drawContours(img, c.corner, -1, color, 1, cv.LINE_8, hierarchy, 100);
      }

      return img;