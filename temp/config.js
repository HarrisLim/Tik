
var fs = require('fs');
var path = require('path');

var Sequelize = require('sequelize');
/*============================================
노드JS의 ORM 모듈을 소개합니다.
Sequelize ORM Module
Database, Username, Password
Dialect : mysql, mariadb, sqlite, postgres, mssql
============================================*/
var sequelize = new Sequelize('sample', 'test', 'test',{
  host : 'localhost',
  dialect : 'mariadb',
  pool : {
    max: 5,
    min: 0,
    idel: 10000
  }
});

var db = {};
/*============================================
models폴더에 존재하는 엔터티 스크립트 파일을 불러와서 테이블을 생성합니다.
이때, config.js은 현재 파일이기 때문에 제외하도록 되어집니다.
============================================*/
fs.readdirSync(__dirname).filter(function(file){
  return (file.indexOf('.') !== 0 && (file !== "config.js"));
}).forEach(function(file){
  var model = sequelize['import'](path.join(__dirname, file));
  db[model.name] = model;
})

db.sequelize = sequelize;
db.Sequelize = Sequelize;

/*============================================
DB 설정 모듈을 외부에서 활용하도록 합니다.
============================================*/
module.exports = db;