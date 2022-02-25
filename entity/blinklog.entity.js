module.exports = (sequelize, DataTypes) => {
    const blinklog = sequelize.define("blinklog", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },          
        image: DataTypes.TEXT,
        image_url: DataTypes.TEXT,
        filename: DataTypes.TEXT,
        message: DataTypes.TEXT,
        lefteye: DataTypes.DECIMAL(10, 2),
        righteye: DataTypes.DECIMAL(10, 2),
    },{
        tableName: 'tbl_azure_blinklog'
      });
        
    // (async () => {
    // await sequelize.sync({ force: true });
    //     // Code here
    // })();
    return blinklog;
}