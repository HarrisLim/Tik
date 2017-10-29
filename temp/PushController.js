var express = require('express');
var router = express.Router();
var models = require('../models/config');
var cors = require('cors');
/*============================================
 푸시 API 스크립트
 다른 도메인에서도 해당 주소로 메시지를 보낼 수 있게 하기 위해서 크로스 도메인에 대해서 허용을 합니다.
============================================*/
router.use(cors()); // CORS 정책 활성화
router.post('/', function(req, res, next) {

  var apiKey = req.query.apiKey;
  var domain = req.query.domain;

  if(apiKey == null || domain == null){
    /*============================================
     필수 요청 파라미터 검증
    ============================================*/
    var dataSet = {
      "message" : "요청 파라미터가 올바르지 않습니다."
    };
    res.status(400);
    res.json(dataSet);
  }else{
    models.Domain.findOne({
      where : {domainUrl : domain}
    }).then((data) => {
      if(data == null){
        /*============================================
         등록된 도메인 정보가 없을 경우
        ============================================*/
        var dataSet = {
          "message" : "등록된 도메인이 아닙니다."
        };
        res.status(403);
        res.json(dataSet);
      }else if(data.dataValues.domainKey == apiKey){
        /*============================================
         인증키 검증 성공 시 해당 도메인으로 연결된 웹소켓으로 메시지 푸시
        ============================================*/
        req.io.sockets.in(domain).emit('pushed', req.body.message);

        var dataSet = {
          "apiKey" : apiKey,
          "domain" : domain,
          "message" : req.body.message
        };
        res.json(dataSet);
      }else{
        /*============================================
         인증키가 올바르지 않을 경우
        ============================================*/
        var dataSet = {
          "message" : "인증키가 올바르지 않습니다."
        };
        res.status(403);
        res.json(dataSet);
      }
    });
  }
});

module.exports = router;