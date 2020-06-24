'use strict';

module.exports = (sequelize, DataType) => {
    var contest = sequelize.define('contest', {
        no : {
            type : DataType.INTEGER,
            primaryKey: true,
            autoIncrement : true
        },
        writer : {
            type : DataType.STRING,
        },
        title : {
            type: DataType.STRING,
            allowNull: false
        },
        content : {
            type: DataType.STRING,
            allowNull : false
        },
        createTime : {
            type : DataType.DATE,
            allowNull:false
        }
    },
    {
        timestamps: false
    });
    return contest;
};