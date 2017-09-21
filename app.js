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

// MySQL 데이터베이스 연결 설정
var pool = mysql.createPool({
	connectionLimit : 10,	// 커넥션 풀에서 만들 수 있는 최대 연결 개수를 설정합니다.
	host : 'localhost',		// 연결할 호스트 이름을 설정합니다.
	user : 'root',			// port : 데이터베이스가 사용하는 포트 번호를 설정합니다., // user : 데이터베이스 사용자 아이디를 설정합니다.
	password : 'dksuek',	// 데이터베이스 사용자의 비밀번호를 설정합니다.
	database : 'tik',		// 데이터베이스 이름을 설정합니다.
	debug : false			// 데이터베이스 처리 과정을 로그로 남길 것인지 설정합니다.
});

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
	resave : true,
	saveUninitialized : true,
	store: new MySQLStore({
		host : 'localhost',
		port : 3306,
		user : 'root',
		password : 'dksuek',
		database : 'tik'
	})
}));

app.use(passport.initialize());
app.use(passport.session());

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

// 사용자를 등록하는 함수
var signUp = function(nickname, email, passwd, salt, country, agegroup, insid, callback) {
	console.log('signUp 호출됨.');

	// 커넥션 풀에서 연결 객체를 가져옵니다.
	pool.getConnection(function(err, conn) {
		if(err) {
			if(conn) {
			conn.release(); // 반드시 해제해야 합니다.
			}

			callback(err, null);
			return;
		}
		console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

		// 데이터를 객체로 만듭니다.
		var data = {nickname : nickname, email : email, passwd : passwd, salt : salt, country : country, agegroup : agegroup, insid : insid};

		// SQL문을 실행합니다.
		var exec = conn.query('insert into members set ?', data, function(err, result) {
			conn.release();	// 반드시 해제해야 합니다.
			console.log('실행 대상 SQL : ' + exec.sql);

			if(err) {
				console.log('SQL 실행 시 오류 발생함.');
				console.dir(err);

				callback(err, null);

				return;
			}

			callback(null, result);
		});
	});
};

// 사용자를 인증하는 함수
var authUser = function(email, password, callback) {
	console.log('authUser 호출됨.');

	// 커넥션 풀에서 연결 객체를 가져옵니다.
	pool.getConnection(function(err, conn) {
		if(err) {
			if(conn) {
				conn.release(); // 반드시 해제해야 합니다.
			}
			callback(err, null);
			return;
		}
		console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

		var columns = ['nickname', 'email', 'country'];
		var tablename = 'members';

		// SQL문을 실행합니다.
		var exec = conn.query("select ?? from ?? where email = ? and passwd = ?",[columns, tablename, email, password], function(err, rows) {
			conn.release(); // 반드시 해제해야 합니다.
			console.log('실행 대상 SQL : ' + exec.sql);

			if(rows.length > 0) {
				console.log('아이디 [%s], 패스워드 [%s]가 일치하는 사용자 찾음.', email, password);
				callback(null, rows);
			} else {
				console.log('일치하는 사용자를 찾지 못함.');
				callback(null, null);
			}
		});
	});
};

app.post('/process/signup', function(req, res) {
	hasher({paramPasswd : req.body.passwd}, function(err, pass, salt, hash){
		console.log('/process/signup 호출됨.');

		var paramNickname = req.body.nickname || req.query.nickname;
		var paramEmail = req.body.email || req.query.email;
		var paramPasswd = hash;
		var salt = salt;
		var paramCountry = req.body.country || req.query.country;
		var paramAgegroup = req.body.agegroup || req.query.agegroup;
		var paramInsid = req.body.insid || req.query.insid;

		console.log('요청 파라미터 : ' + paramNickname + ', ' + paramEmail + ', ' + paramPasswd + ', ' + paramCountry + ', ' + paramAgegroup + ', ' + paramInsid);

		// pool 객체가 초기화된 경우, signup 함수 호출하여 사용자 추가
		if(pool) {
			signUp(paramNickname, paramEmail, paramPasswd, salt, paramCountry, paramAgegroup, paramInsid, function(err, addedUser) {
				// 동일한 id로 추가할 때 오류 발생 - 클라이언트로 오류 전송
				if(err) {
					console.error('사용자 추가 중 오류 발생 : ' + err.stack);

					res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
					res.write('<h2>사용자 추가 중 오류 발생</h2>');
					res.write('<p>' + err.stack + '</p>');
					res.end();

					return;
				}

				// 결과 객체 있으면 성공 응답 전송
				if(addedUser) {
					console.dir(addedUser);

					console.log('inserted ' + addedUser.affectedRows + ' rows');

					var insertId = addedUser.insertId;
					console.log('추가한 레코드의 아이디 : ' + insertId);

					res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
					res.write('<h2>사용자 추가 성공</h2>');
					res.end();
				} else {
					res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
					res.write('<h2>사용자 추가 실패</h2>');
					res.end();
				}
			});
		} else { // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
			res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
			res.write('<h2>데이터베이스 연결 실패</h2>');
			res.end();
		}
	});
});

app.post('/process/signin', function(req, res) {
	console.log('/process/signin 호출됨.');

	// 요청 파라미터 확인
	var paramEmail = req.body.email || req.query.email;
	var paramPassword = req.body.passwd || req.query.passwd;

	console.log('요청 파라미터 : ' + paramEmail + ', ' + paramPassword);

	// pool 객체가 초기화된 경우, authUser 함수 호출하여 사용자 인증
	if(pool) {
		authUser(paramEmail, paramPassword, function(err, rows) {
			// 오류가 발생했을 때 클라이언트로 오류 전송
			if(err) {
				console.error('사용자 로그인 중 오류 발생 : ' + err.stack);

				res.writeHead('200', {'Countent-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 로그인 중 오류 발생</h2>');
				res.write('<p>' + err.stack + '</p>');
				res.end();

				return;
			}

			if(rows) {

				var usernickname = rows[0].nickname;
				req.session.userEmail = rows[0].email;

				res.writeHead('200', {'Countent-Type':'text/html;charset=utf8'});
				res.write('<h1>로그인 성공</h1>');
				res.write('<div><p>사용자 아이디 : ' + paramEmail + '</p></div>');
				res.write('<div><p>사용자 이름 : ' + usernickname + '</p></div>');
				res.write("<br><br><a href='/public/signin.html'>로그아웃</a>");
				res.end('');
			}
		});
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

passport.serializeUser(function(user, done) {
	console.log('serializeUser', user);
	done(null, user.email);
});

passport.deserializeUser(function(id, done) {
	console.log('deserializeUser', id);
	for(var i = 0; i<members.length; i++) {
		var user = members[i];
		if(user.email === id) {
			return done(null, user);
			var sql = 'SELECT * FROM members WHERE email=?';
			conn.query(sql, [id], function(err, results) {
				if(err) {
					console.log(err);
					done('There is no user.');
				} else {
					done(null, results[0]);
				}
			})
		done('There is no user.');
		}
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