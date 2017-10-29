var express = require('express');
var router = express.Router();
var models = require('../models/config');
var properties = require('../properties');
var crypto = require('crypto');
/*============================================
 노드JS - 메일 모듈
 지메일의 SMTP 기능을 활성화해야 사용가능 합니다.
============================================*/
var nodemailer = require('nodemailer');
var smtp = nodemailer.createTransport({
  service : 'gmail',
  auth : {
    user : properties.email, // SMTP 기능이 활성화된 지메일
    pass : properties.pass // 지메일의 비밀번호
  }
});

/*============================================
 도메인 발급 라우팅 스크립트
============================================*/
router.post('/', function(req, res, next) {

  // 도메인 관리자의 비밀키가 인증코드로 제공되는지를 확인합니다.
  // 인증코드가 일치하지 않을 경우는 403 Forbidden을 응답처리 합니다.
  var authKey = req.session.authKey;
  if(authKey != properties.key){
    var dataSet = {
      "message" : "인증코드가 일치하지 않습니다."
    };
    res.status(403);
    return res.json(dataSet);
  }

  var domain = req.body.domainUrl;
  if(!domain.match('[\\w\\~\\-\\.]+@[\\w\\~\\-]+(\\.[\\w\\~\\-]+)+')){
    var dataSet = {
      "message" : "도메인 형식이 아닙니다."
    };
    res.status(403);
    return res.json(dataSet);
  }

  // 발급된 도메인의 정보가 있으면 400 에러를 응답합니다.
  models.Domain.findOne({
    where : {domainUrl : req.body.domainUrl}
  }).then((data) => {

    if(data != null){
      var mailOption = {
        from : 'kdevkr push server <'+properties.email+'>',
        to : req.body.domainUrl,
        subject : '도메인 인증키 발급 안내',
        html : '<h3>인증키는 다음과 같습니다.</h3><p>'+data.dataValues.domainKey+'</p>'
      };

      smtp.sendMail(mailOption, function(error, response){
        if(error){
          var dataSet = {
            "message" : "이미 발급된 도메인입니다.",
            "domainUrl" : data.dataValues.domainUrl,
            "domainKey" : "인증키 이메일 발송 실패"
          };
          res.status(400);
          return res.json(dataSet);
        }else{
          var dataSet = {
            "message" : "이미 발급된 도메인입니다.",
            "domainUrl" : data.dataValues.domainUrl,
            "domainKey" : "인증키 이메일 발송 완료"
          };
          res.status(400);
          return res.json(dataSet);
        }
      });
  }

    /*============================================
     도메인에 대한 인증키 발급 기능
     이때 인증키는 AES-256-CTR 방식으로 암호화해서 생성합니다.
    ============================================*/
    var domainUrl = req.body.domainUrl;
    var cipher = crypto.createCipher('aes-256-ecb', properties.key);
    cipher.update(domainUrl, 'utf8', 'base64');
    var domainKey = cipher.final('base64');

    // 생성된 도메인 정보를 데이터베이스에 저장합니다.
    models.Domain.create({
      domainUrl : req.body.domainUrl,
      domainKey : domainKey
    }).then((data) => {
      console.log("Created new domain!");
    });

    // 생성된 도메인 정보와 함께 201 Created를 응답합니다.
    var mailOption = {
      from : 'kdevkr push server',
      to : req.body.domainUrl,
      subject : '신규 도메인 등록 안내',
      html : '<h3>인증키는 다음과 같습니다.</h3><p>'+domainKey+'</p>'
    };

    smtp.sendMail(mailOption, function(error, response){
      if(error){
        var dataSet = {
          "message" : "새로운 도메인으로 등록되었습니다. 하지만 이메일은 정상적이지 않습니다.",
          "domainUrl" : domainUrl,
          "domainKey" : domainKey
        };
        return res.json(dataSet);
      }
      var dataSet = {
        "message" : "새로운 도메인으로 등록되었습니다.",
        "domainUrl" : domainUrl,
        "domainKey" : "인증키 이메일 발급 완료"
      };
      return res.json(dataSet);
    });
    // end sendMail
});
// end findOne
});
// end

module.exports = router;