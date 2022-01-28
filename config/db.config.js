module.exports = {
    HOST: "adjustdb.c4ltbhanigkc.ap-southeast-1.rds.amazonaws.com",
    USER: "admin",
    PASSWORD: "Adjust123$",
    DB: "facereplus",
    dialect: "mysql",
    port:3306,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};
