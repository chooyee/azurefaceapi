const db = require(".");
const logger = require('../infrastructure/logger');
const { Op } = require("sequelize");

class BlinkModel{

    constructor () {     
        this.BlinkMainDB = db.BlinkMain;  
        this.BlinkLogDB = db.BlinkLog;  
    }

    CreateMain = async(userid, fingerprint, ipaddress, useragent)=>{

        return this.BlinkMainDB.create({              
            userid: userid,
            fingerprint: fingerprint,
            ipaddress: ipaddress,
            useragent: useragent,
        }).then((result)=>{
            console.log(result.id);
            return result.id;
        }).catch((err)=>{
            console.log(`BlinkModel=>CreateMain: Error: ${err.message}`);            
            logger.log.error(`BlinkModel=>CreateMain: Error: ${err.message} : ${userid} : ${fingerprint} : ${ipaddress} : ${useragent}`);
            logger.log.error(`BlinkModel=>CreateMain: Error: ${err.message}`);
            throw new Error(`BlinkModel=>CreateMain: Error: ${err.message}`);
        })
    }

    CreateLog = async(blinkmainId, image, image_url, filename, message,lefteye,righteye)=>{
        return this.BlinkLogDB.create({    
            blinkmainId: blinkmainId,          
            image: image,
            image_url: image_url,
            filename: filename,
            message: message,
            lefteye: lefteye,
            righteye: righteye,
        }).then((result)=>{
            console.log(result.id);
            return result.id;
        }).catch((err)=>{
            console.log(`BlinkModel=>CreateLog: Error: ${err.message}`);            
            logger.log.error(`BlinkModel=>CreateLog: Error: ${err.message}`);
            throw new Error(`BlinkModel=>CreateLog: Error: ${err.message}`);
        })
    }
    
    Update = async (blinkmainId, message, status) =>{
        console.log(`BlinkModel:Update: ${blinkmainId} : ${message} : ${status}`);
        try{
        return this.BlinkMainDB.update({ message: message,  status:status}, {
            where: {
                id: blinkmainId
            }
        });
        }
        catch(err)
        {
            console.log(`BlinkModel=>Update: Error: ${err.message}`);            
            logger.log.error(`BlinkModel=>Update: Error: ${err.message}`);
        }
      
    }

}

exports.Blink = new BlinkModel();
