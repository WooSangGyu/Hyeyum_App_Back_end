'use strict';

module.exports = (sequelize, DataType) => {
    var user = sequelize.define('user', {
        id : {
            type: DataType.STRING,
            unique : true,
            primaryKey : true,
            allowNull: false
        },
        password : {
            type: DataType.STRING,
            allowNull : true
        },
        name : {
            type : DataType.STRING,
            allowNull:false
        },
        studentCode : {
            type : DataType.INTEGER,
            allowNull:true
        },
        Th : {
            type : DataType.INTEGER,
            allowNull:true
        },
        profilejpg : {
            type : DataType.STRING,
            allowNull:true
        }
    },
    {
        timestamps: false
    });
    return user;
};