module.exports = (sequelize, DataTypes) => {
    const blinkmain = sequelize.define("blinkmain", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },          
        userid: DataTypes.TEXT,
        fingerprint: DataTypes.TEXT,
        ipaddress: DataTypes.TEXT,
        useragent: DataTypes.TEXT,        
        message: DataTypes.TEXT,
        status: {
            type:DataTypes.BOOLEAN,  
            defaultValue: false
        },
    },{
        tableName: 'tbl_azure_blinkmain'
      });
        
    // (async () => {
    // await sequelize.sync({ force: true });
    //     // Code here
    // })();
    return blinkmain;
}