const db = require("../models");
const logger = require('../infrastructure/logger');

class TransactionModel{

    constructor () {     
        this.TransacDB = db.Transaction;  
    }

    Create = async (userid, image_1,image_1_url, filename, fingerprint, ipaddress, useragent)=>{
        console.log('TransactionModel:Create');
        
        this.TransacDB.create({              
            userid: userid,
            image_1: image_1,
            image_1_url: image_1_url, 
            filename: filename,
            fingerprint: fingerprint,
            ipaddress: ipaddress,
            useragent: useragent,
            transdate: new Date().getTime(),
            
        }).then((result)=>{
            return result;
        }).catch((err)=>{
            console.log(`TransactionModel=>Create: Error: ${err.message}`);            
            logger.log.error(`TransactionModel=>Create: Error: ${err.message}`);
            throw new Error(`TransactionModel=>Create: Error: ${err.message}`);
        })
        
    }

    Get = async (id) =>{
        console.log('TransactionModel:Get');

        const transaction = await this.TransacDB.findOne({where:{id:id}});
        if (transaction === null) {
            return null;
        } else {
            return transaction;
        }
    }

    GetAll = async () =>{
        console.log('TransactionModel:GetAll');

        const transaction = await this.TransacDB.findAll()
        .catch(err => {
            console.log(err.message);          
            logger.log.error(err.message);
            throw new Error('DB error:' + err.message);
        });

        if (transaction === null) {
            return null;
        } else {
            return transaction;
        }
    }

    Update = async (id, faceapijs) =>{
        console.log('TransactionModel:Update');

        await this.TransacDB.update({ faceapijs: faceapijs }, {
            where: {
                id: id
            }
        });
       return true;
    }

}

exports.Transaction = new TransactionModel();
