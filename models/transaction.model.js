const db = require("../models");
const logger = require('../infrastructure/logger');
const { Op } = require("sequelize");

class TransactionModel{

    constructor () {     
        this.TransacDB = db.Transaction;  
    }

    Create = async (userid, image_1,image_1_url, filename, fingerprint, ipaddress, useragent)=>{
        console.log('TransactionModel:Create');
        
        return this.TransacDB.create({              
            userid: userid,
            image_1: image_1,
            image_1_url: image_1_url, 
            filename: filename,
            fingerprint: fingerprint,
            ipaddress: ipaddress,
            useragent: useragent,
            transdate: new Date().getTime(),
            
        }).then((result)=>{
            console.log(result.id);
            return result.id;
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

    GetAllNew = async () =>{
        console.log('TransactionModel:GetAllNew');

        const transaction = await this.TransacDB.findAll({
            where: {
                status: {
                  [Op.ne]: true
                }
              }
        })
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

    Update = async (id, confidence, identical, message, status) =>{
        console.log('TransactionModel:Update');

        await this.TransacDB.update({ confidence: confidence,  identical:identical, message:message, status:status}, {
            where: {
                id: id
            }
        });
       return true;
    }

}

exports.Transaction = new TransactionModel();
