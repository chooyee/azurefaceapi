module.exports = (sequelize, DataTypes) => {
    const transaction = sequelize.define("transaction", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },          
        userid: DataTypes.TEXT,
        image_1: DataTypes.TEXT, 
        image_1_url: DataTypes.TEXT,
        filename: DataTypes.TEXT,
        confidence: DataTypes.DECIMAL(10, 2) ,
        identical: DataTypes.BOOLEAN,
        fingerprint: DataTypes.TEXT,
        ipaddress: DataTypes.TEXT,
        useragent: DataTypes.TEXT,
        transdate: DataTypes.DATE,
    },{
        tableName: 'tbl_azure_faceapi'
      });
        
    // (async () => {
    // await sequelize.sync({ force: true });
    //     // Code here
    // })();
    return transaction;
}