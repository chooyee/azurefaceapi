const dbConfig = require("../config/db.config.js");

console.log("dbConfig.HOST: " + dbConfig.HOST);

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  port:dbConfig.port,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

//db.Sequelize = Sequelize;
db.sequelize = sequelize;

//db.tutorials = require("./tutorial.model.js")(sequelize, Sequelize);
db.Transaction = require("../entity/transaction.entity")(sequelize, DataTypes);
db.BlinkMain = require("../entity/blinkmain.entity")(sequelize, DataTypes);
db.BlinkLog = require("../entity/blinklog.entity")(sequelize, DataTypes);

db.BlinkMain.hasMany(db.BlinkLog, { as: "blinklog" });
// db.BlinkLog.belongsTo(db.BlinkMain, {
//   foreignKey: "blinkmainid",
//   as: "blinkmain",
// });

module.exports = db;