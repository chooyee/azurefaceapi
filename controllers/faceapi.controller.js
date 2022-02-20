const logger = require('../infrastructure/logger');
const Enum = require('../infrastructure/enum.util');
const S3Service = require('../service/s3.service');
const AzureFaceApi = require('../service/azure.service');
const TransacDB = require('../models/transaction.model');
const BlinkDB = require('../models/blink.model');
const s3BucketName = "faceapi.chooyee.co/azure";
var sleep = require('sleep');

exports.Upload = async(req, res, next)=>{
    console.log(req.body.userid);
    const file = req.file;
    console.log(file);
    if (!file) {
        const error = new Error('Please upload a file');
        error.httpStatusCode = 400;
        return next(error);
    }
    try{
        console.log('Upload to s3');
        const uploadS3Result = await S3Service._uploadS3(file.path, file.filename, s3BucketName);
       
        if (uploadS3Result.status==Enum.Status.Success)
        {
            logger.log.info(`uploaded to ${uploadS3Result.s3Loc}`);
            console.log(`uploaded to ${uploadS3Result.s3Loc}`);
            // let result = await AzureFaceApi.faceMatch(uploadS3Result.s3Loc);
            // if (result.status==Enum.Status.Success){
            //     logger.log.info(`FaceMatch Result: ${result.result.confidence}`);
            //     console.log(`FaceMatch Result: ${result.result.confidence}`);
            // }
            // else{
            //     logger.log.info(`FaceMatch Result: ${result.message}`);
            //     console.log(`FaceMatch Result: ${result.message}`);
            // }
            var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
            var useragent = req.headers["user-agent"]
            let transId = await TransacDB.Transaction.Create(req.body.userid,file.path, uploadS3Result.s3Loc,file.filename, req.body.fingerprint, ip, useragent);
            console.log("transId: " + transId);
            
            res.status(200).send({status: Enum.Status.Success, message: uploadS3Result.s3Loc});
        }
        else{
            res.status(500).send({status: Enum.Status.Fail, message: uploadS3Result.message});
        }
    }
    catch(err)
    {
        res.status(500).send({status: Enum.Status.Fail, message: err.message});
    }
}

exports.UploadMultiple = async(req, res, next)=>{
    console.log(req.body.userid);
    let s3BucketName = "faceapi.chooyee.co/blinktest";

    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
    var useragent = req.headers["user-agent"]
    var blinkmainId = await BlinkDB.Blink.CreateMain(req.body.userid, req.body.fingerprint, ip, useragent);
    console.log("blinkmainId: " + blinkmainId);

    let blinkStatus = false;
    let leftEyeOpen = 0;
    let leftEyeClose = 0;
    let rightEyeOpen = 0;
    let rightEyeClose = 0;


    for(i=0;i<req.files.length;i++)
    {
        let file = req.files[i];
        console.log('Upload to s3');
        const uploadS3Result = await S3Service._uploadS3(file.path, file.filename, s3BucketName);

        if (uploadS3Result.status==Enum.Status.Success)
        {
            logger.log.info(`uploaded to ${uploadS3Result.s3Loc}`);
            console.log(`uploaded to ${uploadS3Result.s3Loc}`);
            
            let result = await AzureFaceApi.detect(uploadS3Result.s3Loc, true);
            let eyeBlinkResult = {};
          
            if (result.length>0)
            {
                let eyeCloseValue = 4;
                faceLandmarks = result[0].faceLandmarks;
                let leftEye = faceLandmarks.eyeLeftBottom.y - faceLandmarks.eyeLeftTop.y;
                let rightEye = faceLandmarks.eyeRightBottom.y - faceLandmarks.eyeRightTop.y;
        
                if (leftEye<eyeCloseValue)
                {
                    eyeBlinkResult["left"] = true;
                    leftEyeClose++;
                }
                else
                {
                    eyeBlinkResult["left"] = false;
                    leftEyeOpen++;
                }
        
                if (rightEye<eyeCloseValue)
                {
                    eyeBlinkResult["right"] = true;
                    rightEyeClose++;
                }
                else
                {
                    eyeBlinkResult["right"] = false;
                    rightEyeOpen++;
                }
            }
            BlinkDB.Blink.CreateLog(blinkmainId, file.path,uploadS3Result.s3Loc, file.filename,JSON.stringify(result),  eyeBlinkResult["left"],  eyeBlinkResult["right"]);
        }
    }

    
    if (leftEyeOpen>0 && leftEyeClose>0 && rightEyeOpen>0 && rightEyeClose >0)
        res.status(200).send({status: Enum.Status.Success, message: "Success"});
    else
        res.status(200).send({status: Enum.Status.Fail, message: "Fail"});
    
}

exports.FaceMatch = async(req, res)=>{
    let result = await AzureFaceApi.faceMatch(req.query.url);
    if (result.status==Enum.Status.Success){
        logger.log.info(`FaceMatch Result: ${result.result.confidence}`);
        console.log(`FaceMatch Result: ${result.result.confidence}`);
    }
    else{
        logger.log.info(`FaceMatch Result: ${result.message}`);
        console.log(`FaceMatch Result: ${result.message}`);
    }
    res.status(200).send(result);
}

exports.FaceDetect = async(req, res)=>{
    let result = await AzureFaceApi.detect(req.query.url, true);
    let eyeBlinkResult = {};
  
    if (result.length>0)
    {
        let eyeCloseValue = 4;
        faceLandmarks = result[0].faceLandmarks;
        let leftEye = faceLandmarks.eyeLeftBottom.y - faceLandmarks.eyeLeftTop.y;
        let rightEye = faceLandmarks.eyeRightBottom.y - faceLandmarks.eyeRightTop.y;

        if (leftEye<eyeCloseValue)
        {
            eyeBlinkResult["left"] = true;
        }
        else
        {
            eyeBlinkResult["left"] = false;
        }

        if (rightEye<eyeCloseValue)
        {
            eyeBlinkResult["right"] = true;
        }
        else
        {
            eyeBlinkResult["right"] = false;
        }
    }
    res.status(200).send(eyeBlinkResult);
}

exports.GetAllNew = async(req, res)=>{
    let results = await TransacDB.Transaction.GetAllNew();
    const records = results.map(function(result) {
        console.log(`User ID: ${result.userid}`);
        return result.userid,result.image_1
    })
    res.status(200).send(records);
}

exports.ProcessNew = async(req, res)=>{
    let results = await TransacDB.Transaction.GetAllNew();
    json = [];
    for (i=0;i<results.length;i++)
    {
        timeout = 1;
        record = results[i];
        confidence = 0;
        identical = false;
        message = '';
        let azureResult = await AzureFaceApi.faceMatch(record.image_1_url);
        if (azureResult.status==Enum.Status.Success){
            logger.log.info(`${record.userid} : ${record.image_1_url} : FaceMatch Result: ${azureResult.result.confidence}`);
            console.info(`${record.userid} : ${record.image_1_url} : FaceMatch Result: ${azureResult.result.confidence}`);
            confidence = azureResult.result.confidence;
            identical = azureResult.result.isIdentical;
        }
        else{
            logger.log.info(`${record.userid} : ${record.image_1_url} : FaceMatch Result: ${azureResult.message}`);
            console.log(`${record.userid} : ${record.image_1_url} : FaceMatch Result: ${azureResult.message}`);
            message = azureResult.message;
        }
        await TransacDB.Transaction.Update(record.id, confidence,identical, message, true);
        json.push({userid:record.userid, image:record.image_1_url, confidence:azureResult.result.confidence, isIdentical:azureResult.result.isIdentical});
        startTimeout(timeout, i);
        //timeout += 1000;
    }
    // results.forEach( 
    //     (record) => { 
    //         console.log(record.userid);
    //         let azureResult = await AzureFaceApi.faceMatch(record.image_1_url);
    //         if (azureResult.status==Enum.Status.Success){
    //             logger.log.info(`${record.userid} : ${record.image_1_url} : FaceMatch Result: ${azureResult.result.confidence}`);
    //             logger.log.info(`${record.userid} : ${record.image_1_url} : FaceMatch Result: ${azureResult.result.confidence}`);
    //         }
    //         else{
    //             logger.log.info(`${record.userid} : ${record.image_1_url} : FaceMatch Result: ${result.message}`);
    //             console.log(`${record.userid} : ${record.image_1_url} : FaceMatch Result: ${result.message}`);
    //         }
    //     }
    // );
    
    res.status(200).send(json);
}

var startTimeout = function(timeoutSeconds, i){
    sleep.sleep(timeoutSeconds);    
}