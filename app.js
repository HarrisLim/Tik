// Project 시작 - 2017.09.18(Mon)


// Express 기본 모듈 불러오기
var express = require('express');
var http = require('http');
var path = require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser');
var static = require('serve-static');
var cookieParser = require('cookie-parser');
var bkfd2Password = require('pbkdf2-password');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var hasher = bkfd2Password();

// Session 미들웨어 불러오기
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

// MySQL 데이터베이스를 사용할 수 있는 mysql 모듈 불러오기
var mysql = require('mysql');
var conn = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : 'dksuek',
	database : 'tik'
});
conn.connect();
// // MySQL 데이터베이스 연결 설정
// var pool = mysql.createPool({
// 	connectionLimit : 10,	// 커넥션 풀에서 만들 수 있는 최대 연결 개수를 설정합니다.
// 	host : 'localhost',		// 연결할 호스트 이름을 설정합니다.
// 	user : 'root',			// port : 데이터베이스가 사용하는 포트 번호를 설정합니다., // user : 데이터베이스 사용자 아이디를 설정합니다.
// 	password : 'dksuek',	// 데이터베이스 사용자의 비밀번호를 설정합니다.
// 	database : 'tik',		// 데이터베이스 이름을 설정합니다.
// 	debug : false			// 데이터베이스 처리 과정을 로그로 남길 것인지 설정합니다.
// });

// 오류 핸들러 사용
var expressErrorHandler = require('express-error-handler');

// 파일 업로드용 미들웨어
var multer = require('multer');
var fs = require('fs');

// 클라이언트에서 ajax로 요청했을 때 CORS(다중 서버 접속) 지원
var cors = require('cors');

// 익스프레스 객체 생성
var app = express();

// 기본 속성 설정
app.set('port', process.env.PORT || 10468);

// body-parser를 사용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended : false }));

// body-parser를 사용해 application/json 파싱
app.use(bodyParser.json());

app.use('/public', static(path.join(__dirname, 'public')));

// cookie-parser 설정
app.use(cookieParser());

// session 설정
app.use(session({
	secret : 'my key',
	resave : false,
	saveUninitialized : true,
	store: new MySQLStore({
		host : 'localhost',
		port : 3306,
		user : 'root',
		password : 'dksuek',
		database : 'tik'
	})
}));

app.use(passport.initialize());		// 패스포트 초기화하여 사용
app.use(passport.session());		// 패스포트를 사용할 때 session을 사용한다.

// 클라이언트에서 ajax로 요청헀을 때 CORS(다중 서버 접속) 지원
app.use(cors());

// multer 미들웨어 사용 : 미들웨어 사용 순서 중요 body-parser -> multer -> router
// 파일 제한 : 10개, 1G
var storage = multer.diskStorage({
	destination : function(req, file, callback) {
		callback(null, 'uploads')
	},
	filename : function(req, file, callback) {
		callback(null, file.originalname + Date.now());
	}
});

var upload = multer({
	storage : storage,
	limits : {
		files: 10,
		fileSize : 1024 * 1024 * 1024
	}
});

app.post('/process/signup', function(req, res) {
	hasher({password:req.body.passwd}, function(err, pass, salt, hash){
		var member = {
			nickname : req.body.nickname || req.query.nickname,
			email : req.body.email || req.query.email,
			passwd : hash,
			salt : salt,
			country : req.body.country || req.query.country,
			agegroup : req.body.agegroup || req.query.agegroup,
			insid : req.body.insid || req.query.insid
		};
		var sql = 'INSERT INTO members SET ?';
		conn.query(sql, member, function(err, results) {
			if(err) {
				console.log(err);
				res.status(500);
			} else {
				req.login(member, function(err) {
					req.session.save(function() {
						res.redirect('/process/main');
					});
				});
			}
		});
	});
});

passport.serializeUser(function(member, done) {
	console.log('serializeUser', member);
	done(null, member.email);
});

passport.deserializeUser(function(id, done) {
	console.log('deserializeUser', id);
	var sql = 'SELECT * FROM members WHERE email=?';
	conn.query(sql, [id], function(err, results) {
		if(err){
			console.log(err);
			done('There is no member.');
		} else {
			done(null, results[0]);
		}
	});
});

passport.use(new LocalStrategy(
	function(email, password, done) {
		var paramEmail = email;
		var paramPassword = password;
		var sql = 'SELECT * FROM members WHERE email=?';
		conn.query(sql, [paramEmail], function(err, results) {
			console.log(results);
			if(err) {
				return done('There is no member.');
			}
			var member = results[0];
			return hasher({password:paramPassword, salt:member.salt}, function(err, pass, salt, hash) {
				if(hash === mamber.passwd) {
					console.log('LocalStrategy', mamber);
					done(null, mamber);
				} else {
					done(null, false);
				}
			});
		});
	}
));

app.get('/process/signin', 
	passport.authenticate('local', { 
		successRedirect: '/process/main', // 일단 photo로 놓고 나중에 메인 페이지로 바꾸자.
        failureRedirect: '/public/signin.html',
        failureFlash: false 
    })
);

app.post('/process/signin', function(req, res) {
	console.log('/process/signin 호출됨.');

	// 요청 파라미터 확인
	var paramEmail = req.body.email || req.query.email;
	var paramPassword = req.body.passwd || req.query.passwd;

	console.log('요청 파라미터 : ' + paramEmail + ', ' + paramPassword);

	res.writeHead('200', {'Countent-Type':'text/html;charset=utf8'});
	res.write('<h1>로그인 성공</h1>');
	res.write('<div><p>사용자 아이디 : ' + paramEmail + '</p></div>');
	res.write("<br><br><a href='/public/signin.html'>로그아웃</a>");
	res.end('');
});

// app.post('/process/signin', function(req, res) {
// 	console.log('/process/signin 호출됨.');

// 	// 요청 파라미터 확인
// 	var paramEmail = req.body.email || req.query.email;
// 	var paramPassword = req.body.passwd || req.query.passwd;

// 	console.log('요청 파라미터 : ' + paramEmail + ', ' + paramPassword);

// 	// pool 객체가 초기화된 경우, authUser 함수 호출하여 사용자 인증
// 	if(pool) {
// 		authUser(paramEmail, paramPassword, function(err, rows) {
// 			// 오류가 발생했을 때 클라이언트로 오류 전송
// 			if(err) {
// 				console.error('사용자 로그인 중 오류 발생 : ' + err.stack);

// 				res.writeHead('200', {'Countent-Type':'text/html;charset=utf8'});
// 				res.write('<h2>사용자 로그인 중 오류 발생</h2>');
// 				res.write('<p>' + err.stack + '</p>');
// 				res.end();

// 				return;
// 			}

// 			if(rows) {

// 				var usernickname = rows[0].nickname;
// 				req.session.userEmail = rows[0].email;
				
// 				res.writeHead('200', {'Countent-Type':'text/html;charset=utf8'});
// 				res.write('<h1>로그인 성공</h1>');
// 				res.write('<div><p>사용자 아이디 : ' + paramEmail + '</p></div>');
// 				res.write('<div><p>사용자 이름 : ' + usernickname + '</p></div>');
// 				res.write("<br><br><a href='/public/signin.html'>로그아웃</a>");
// 				res.end('');
// 			}
// 		});
// 	}
// });

app.get('/process/main', function(req, res){
	if(req.user && req.user.email) {
		res.writeHead('200', {'Countent-Type':'text/html;charset=utf8'});
		res.write('<h1>Hello,'+ req.user.email +'</h1>');
		res.write("<a href='/process/singout'>singout</a>");
		res.end();
	} else {
		console.log(req.member + ', ' + req.member.eamil);
		res.writeHead('200', {'Countent-Type':'text/html;charset=utf8'});
		res.write('<a href="/public/signin.html">signin</a>');
		res.write("<br><br><a href='/public/signup.html'>signup</a>");
		res.end();
	}
});

app.get('/process/singout', function(req, res) {
	delete req.session.userEmail;
	req.session.save(function() {
		res.redirect('/public/signin.html')
	})
})

app.post('/process/photo', upload.array('photo', 1), function(req, res) {
	console.log('/process/photo 호출됨.');

	try {
		var files = req.files;

		console.dir('#===== 업로드된 첫번 째 파일 정보 =====#');
		console.dir(req.files[0]);
		console.dir('#=====#');
		// 현재의 파일 정보를 저장할 변수 선언
		var originalname = '';
		var filename = '';
		var mimetype = '';
		var size = 0;

		if(Array.isArray(files)) {
			console.log('배열에 들어있는 파일 갯수 : %d', files.length);

			for(var index=0; index < files.length; index++) {
				originalname = files[index].originalname;
				filename = files[index].filename;
				mimetype = files[index].mimetype;
				size = files[index].size;
			}
		} else {
			console.log('파일 갯수 : 1');

			originalname = files[index].originalname;
			filename = files[index].name;
			mimetype = files[index].mimetype;
			size = files[index].size;
		}

		console.log('현재 파일 정보 : ' + originalname + ', ' + filename + ', ' + mimetype + ', ' + size);

		// 클라이언트에 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h3>파일 업로드 성공</h3>');
		res.write('<hr>');
		res.write('<p>원본 파일 이름 : ' + originalname + ' -> 파일 저장명 : ' + filename + '</p>');
		res.write('<p>MIME TYPE : ' + mimetype + '</p>');
		res.write('<p>파일 크기 : '+ size +'</p>');
		res.end();
	} catch(err) {
		console.dir(err.stack);
	}
});

// 모든 router 처리 끝난 후 404 오류 페이지 처리
var errorHandler = expressErrorHandler({
	static : {
		'404' : './public/404.html'
	}
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

http.createServer(app).listen(app.get('port'), function() {
	console.log('익스프레스 서버를 시작했습니다 : ' + app.get('port'));
});