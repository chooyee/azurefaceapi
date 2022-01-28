const pino = require('pino')

function getFuncName() {
    return getFuncName.caller.name
}
exports.getFuncName=getFuncName;

Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
  }
  
exports.log = pino({
    level : process.env.loglevel || 'debug',
    timestamp: () => `,"time":"${new Date(Date.now()).addHours(8).toISOString()}"`
    //prettyPrint: {translateTime:true }
    },
    pino.destination(`./log/${getDate()}.log`)
)

function getDate(){
    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);
    
    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    
    // current year
    let year = date_ob.getFullYear();

    return `${year}_${month}_${date}`;
}