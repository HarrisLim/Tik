#!/usr/bin/env node

/*============================================
의존성 모듈을 통해서 서버 애플리케이션을 동작하도록 합니다.
============================================*/
var app = require('../app');
var debug = require('debug')('www:server');
var http = require('http');

/*============================================
Express의 환경변수로 등록된 포트 또는 지정된 포트로 지정합니다.
============================================*/
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/*============================================
HTTP 서버의 생성 및 시작
============================================*/
var server = http.createServer(app);

var models = require('../models/config');
 models.sequelize.sync({force: false, logging: console.log}).done(function(){
   server.listen(port);
   server.on('error', onError);
   server.on('listening', onListening);
 });

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


/*============================================
socket.io
============================================*/
var io = require('socket.io')(server);
io.on('connect', function(socket){
  var domain = null;
  socket.on('join', function(response){
    domain = response.domain;
    socket.join(domain);
  })

  socket.on('push', function(response){
    /*============================================
    도메인 단위로 메시지를 푸시합니다.
    ============================================*/
    if(domain != null){
      io.sockets.in(domain).emit("push_message",response);
      console.log("message push : "+response);
    }

  });

  socket.on('disconnect', function(response){
  })
});

var router = require('express').Router();
var cors = require('cors');

/*============================================
 푸시 API 스크립트
 socket.io와 함께 모듈화할 수는 없는 것인가?
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
        res.json(dataSet);
      }else if(data.dataValues.domainKey == apiKey){
        /*============================================
         인증키 검증 성공 시 해당 도메인으로 연결된 웹소켓으로 메시지 푸시
        ============================================*/
        io.sockets.in(domain).emit('push_message', req.body.message);

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

        res.json(dataSet);
      }
    });
  }
});
app.use('/push', router);