const logger = require('../infrastructure/logger');
const Enum = require('../infrastructure/enum.util');
const S3Service = require('../service/s3.service');
const AzureFaceApi = require('../service/azure.service');
const TransacDB = require('../models/transaction.model');
const s3BucketName = "faceapi.chooyee.co/azure";

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
            TransacDB.Transaction.Create(req.body.userid,file.path, uploadS3Result.s3Loc,file.filename, req.body.fingerprint, ip, useragent)
            
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

