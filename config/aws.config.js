require('dotenv').config();
//require('dotenv').config({path:'../config.env'});

module.exports = {
    ACCESS_KEY : process.env.AWS_ACCESS_KEY,
    SECRET_ACCESS_KEY : process.env.AWS_SECRET_ACCESS_KEY,
    S3BUCKET : process.env.S3Bucket
};
