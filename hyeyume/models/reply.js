'use strict';

module.exports = (sequelize, DataType) => {
    var reply = sequelize.define('reply', {
        replyno : {
            type : DataType.INTEGER,
            primaryKey:true,
            autoIncrement: true
        },
        postno : {
            type : DataType.INTEGER,
            allowNull : false
        },
        writer : {
            type : DataType.STRING,
            allowNull : false
        },
        reply : {
            type : DataType.STRING,
            allowNull:true
        },
        createTime : {
            type : DataType.DATE,
            allowNull:false
        }
    },
    {
        timestamps: false
    });
    
    return reply;
};