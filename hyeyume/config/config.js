var dotenv = require('dotenv');
dotenv.config();

const development = {
    "username": process.env.DB_USER,
    "password": process.env.DB_PWD,
    "database": process.env.DB_DB,
    "host": process.env.DB_HOST,
    "dialect": process.env.DB_DIAL,
    "operatorsAliases": false,
    "timezone" : "+09:00"
  };

const test = {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "operatorsAliases": false
  };

const production = {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "operatorsAliases": false
  };

module.exports = { development, production, test };