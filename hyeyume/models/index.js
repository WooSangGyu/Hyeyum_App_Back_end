'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.community = require('./community')(sequelize, Sequelize);
db.communityreply = require('./communityreply')(sequelize, Sequelize);
db.contest = require('./contest')(sequelize, Sequelize);
db.contestreply = require('./contestreply')(sequelize, Sequelize);
db.user = require('./user')(sequelize, Sequelize);

// user and community
db.user.hasMany(db.community, {foreignKey: 'writer', sourceKey: 'id', onDelete:'cascade', onUpdate: 'cascade'});
db.community.belongsTo(db.user, {foreignKey: 'writer', targetKey: 'id'});

db.user.hasMany(db.communityreply, {foreignKey: 'writer', sourceKey: 'id', onDelete:'cascade', onUpdate: 'cascade'});
db.communityreply.belongsTo(db.user, {foreignKey: 'writer', targetKey: 'id'});

db.community.hasMany(db.communityreply, {foreignKey: 'postno', sourceKey: 'no', onDelete:'cascade', onUpdate: 'cascade'});
db.communityreply.belongsTo(db.community, {foreignKey: 'postno', targetKey: 'no'});

// user and contest
db.user.hasMany(db.contest, {foreignKey: 'writer', sourceKey: 'id', onDelete:'cascade', onUpdate: 'cascade'});
db.contest.belongsTo(db.user, {foreignKey: 'writer', targetKey: 'id'});

db.user.hasMany(db.contestreply, {foreignKey: 'writer', sourceKey: 'id', onDelete:'cascade', onUpdate: 'cascade'});
db.contestreply.belongsTo(db.user, {foreignKey: 'writer', targetKey: 'id'});

db.contest.hasMany(db.contestreply, {foreignKey: 'postno', sourceKey: 'no', onDelete:'cascade', onUpdate: 'cascade'});
db.contestreply.belongsTo(db.contest, {foreignKey: 'postno', targetKey: 'no'});

module.exports = db;
