/*============================================
도메인 정보 엔터티 스크립트
테이블 이름 : Domain
DOMAINURL : STRING(190), PK,
DOMAINKEY : STRING(255), NOT NULL
CREATEAT : DATETIME DEFAULT CURRENT_TIMESTAMP
============================================*/
module.exports = function(sequelize, DataTypes){
  return sequelize.define('Domain',{
    domainUrl:{type:DataTypes.STRING(190), primaryKey:true},
    domainKey:{type:DataTypes.STRING(255), allowNull:false},
    createdAt:{type:DataTypes.DATE, defaultValue:sequelize.literal('CURRENT_TIMESTAMP')}
  },{
    tableName:'domains',
    undersocred:true,
    timestamps:false
  })
}
