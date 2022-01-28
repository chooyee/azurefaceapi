const AWS = require('aws-sdk');
const config = require("../config/aws.config.js");
const s3 = new AWS.S3({
  accessKeyId: config.ACCESS_KEY,
  secretAccessKey:config.SECRET_ACCESS_KEY
});
//const s3Bucket = config.S3BUCKET;
const logger = require('../infrastructure/logger');
const Enum = require('../infrastructure/enum.util');
const fs = require("fs");

class S3 {

    _uploadS3 = async (fileName, key, bucket) => {   
        
        logger.log.info(`_uploadS3: ${fileName} ${key} ${bucket}`);     
        try{
            const params = {
                Bucket: bucket,
                Key: key, 
                Body: fs.createReadStream(fileName),
                ACL:'public-read'
            };

            const s3UploadResult = await s3.upload(params).promise();
          
            logger.log.info(`_uploadS3: File uploaded successfully at ${s3UploadResult.Location}`);
            return {status:Enum.Status.Success, s3Loc:s3UploadResult.Location};
        }
        catch(e){
            console.log(e);
            logger.log.error(e);
            return {status:Enum.Status.Fail, message:e.message};
        }
       
    }

}

module.exports = new S3();