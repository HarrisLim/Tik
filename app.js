// Project 시작 - 2017.09.18(Mon)


// Express 기본 모듈 불러오기
var express = require('express');
var http = require('http');
var path = require('path');

// Express의 미들웨어 불러오기;
var static = require('serve-static');
var cookieParser = require('cookie-parser');
var bkfd2Password = require('pbkdf2-password');

// Session 미들웨어 불러오기
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var hasher = bkfd2Password();
var bodyParser = require('body-parser')
// var flash = require('connect-flash');

// MySQL 데이터베이스를 사용할 수 있는 mysql 모듈 불러오기
var mysql = require('mysql');
var conn = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : 'dksuek',
	database : 'tik'
});
conn.connect();

// 오류 핸들러 사용
var expressErrorHandler = require('express-error-handler');

// 파일 업로드용 미들웨어
var multer = require('multer');
var fs = require('fs');

// 클라이언트에서 ajax로 요청했을 때 CORS(다중 서버 접속) 지원
var cors = require('cors');

// 익스프레스 객체 생성
var app = express();

// 뷰 엔진 설정
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
console.log('뷰 엔진이 ejs로 설정되었습니다.');

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

// app.use(flash());
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

app.get('/process/main', function(req, res){
	if(req.user && req.user.email) {
		res.writeHead('200', {'Countent-Type':'text/html;charset=utf8'});
		var context = {email : req.user.email, nickname : req.user.nickname};
		req.app.render('postlist', context, function(err, html) {
			if(err) {
				console.error('뷰 렌더링 중 오류 발생 : ' + err.stack);

				req.app.render('error', function(err, html) {
					res.end(html);
				})
			}
			console.log('rendered : ' + html);

			res.end(html);
		});
	} else {
		res.writeHead('200', {'Countent-Type':'text/html;charset=utf8'});
		req.app.render('index', function(err, html) {
		res.end(html);
		})
	}
});

app.get('/process/signout', function(req, res) {
	// delete req.session.userEmail;
	req.logout();
	req.session.save(function() {
		res.redirect('/process/main')
	})
});

passport.serializeUser(function(member, done) {
	console.log('serializeUser', member);
	done(null, member.email);
});

passport.deserializeUser(function(id, done) {
	console.log('deserializeUser', id);	
	var sql = 'SELECT * FROM members WHERE email=?';
	conn.query(sql, id, function(err, results) {
		if(err){
			console.log(err);
			done('There is no member.');
		} else {
			done(null, results[0]);
		}
	});
});

passport.use(new LocalStrategy( //{passReqToCallback : true},
	function(username, password, done) {
		var paramEmail = username;
		var paramPassword = password;
		var sql = 'SELECT * FROM members WHERE email=?';
		conn.query(sql, paramEmail, function(err, results) {
			console.log(results);
			if(err) {
				console.log('err 잡았나 ?'); // email을 잘못쓰면 err로 잡아서 보내고 싶은데 안잡히고 Cannot read property 'salt' of undefined라는 에러만.
				return done('There is no member.');
			}
			if(results[0] !== undefined){
				var member = results[0];
				return hasher({password:paramPassword, salt:member.salt}, function(err, pass, salt, hash) {
					if(hash === member.passwd) {
						console.log('LocalStrategy', member);
						return done(null, member); // 이거면 serializeUser가 실행됨.
					} else {
						console.log('비밀번호가 다릅니다.');
						return done(null, false); // 이거면 deserializeUser가 실행됨.
					}
				});
			} else {
				console.log("I can't find your email.");
				return done(null, false);
			}
		});
	}
));

app.post('/process/signin', 
	passport.authenticate('local', { 
		successRedirect: '/process/main',
        failureRedirect: '/process/signin',
        failureFlash: true 
    })
);

// pp.get('/process/main', function(req, res){
// 	if(req.user && req.user.email) {
// 		res.writeHead('200', {'Countent-Type':'text/html;charset=utf8'});
// 		var context = {email : req.user.email, nickname : req.user.nickname};
// 		req.app.render('postlist', context, function(err, html) {
// 			if(err) {
// 				console.error('뷰 렌더링 중 오류 발생 : ' + err.stack);

// 				req.app.render('error', function(err, html) {
// 					res.end(html);
// 				})
// 			}
// 			console.log('rendered : ' + html);

// 			res.end(html);
// 		});
// 	} else {
// 		res.writeHead('200', {'Countent-Type':'text/html;charset=utf8'});
// 		req.app.render('index', function(err, html) {
// 		res.end(html);
// 		})
// 	}
// });

app.get('/view/showpost', function(req, res){
	res.writeHead('200', {'Countent-Type':'text/html;charset=utf8'});
	var context = {flagpath : req.user.flagpath, nickname : req.user.nickname, insid : req.user.insid};
	req.app.render('showpost', context, function(err, html) {
		if(err) {
			console.error('뷰 렌더링 중 오류 발생 : ' + err.stack);

			req.app.render('error', function(err, html) {
				res.end(html);
			});
		}
		console.log('rendered : ' + html);

		res.end(html);
	});
});

app.get('/process/signin', function(req, res) {
	console.log('get.signin에 들어옴.');
	var output = `
	<h1>Login !</h1>
		<br>
		<form method="post" action="/process/signin">
			<table>
				<tr>
					<td><label>Email : </label></td>
					<td><input type="text" name="username"></td> <!--name을 email로 하면 LocalStrategy가 못받아. 그래서 username으로 했다. -->
				</tr>
				<tr>
					<td><label>Password : </label></td>
					<td><input type="password" name="password"></td><!-- name을 passwd로 하면 LocalStrategy가 못받아. 그래서 password 했다. -->
				</tr>
			</table>
			<input type="submit" value="submit" name="">
		</form>
   `;
   res.send(output);
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

app.get('/process/signup', function(req, res) {
	  var output = `
	<h1>Welcome my new friend !</h1>
	<h1>Tik sign up !</h1>
   <br><br>
		<form method="post" action="/process/signup">
			<table>
				<tr>
					<td><label>Nickname : </label></td>
					<td><input type="text" name="nickname"></td>
				</tr>
				<tr>
					<td><label>Email : </label></td>
					<td><input type="email" name="email"></td>
					<td><input type="button" value="Verify Email"></td>
				</tr>
				<tr>
					<td><label>Password : </label></td>
					<td><input type="password"></td>
				</tr>
				<tr>
					<td><label>Password (repeat) : </label></td>
					<td><input type="password" name="passwd"></td>
					<td><input type="button" value="Check password"></td>
				</tr>
				<tr>
					<td><label>Country : </label></td>
					<td><input type="text" name="country"></td>
				</tr>
				<tr>
					<td><label>Age group : </label></td>
					<td>
						<input type="radio" name="agegroup"> 10s
						<input type="radio" name="agegroup"> 20s
						<input type="radio" name="agegroup"> 30s
						<input type="radio" name="agegroup"> 40s
						<input type="radio" name="agegroup"> 50s
						<input type="radio" name="agegroup"> 60s
						<input type="radio" name="agegroup"> 70s
						<input type="radio" name="agegroup"> 80s
						<input type="radio" name="agegroup"> 90s
						<input type="radio" name="agegroup"> 100s
					</td>
				</tr>
				<tr>
					<td><label>Instagram ID : </label></td>
					<td><input type="text" name="insid"></td>
				</tr>
			</table>
			<input type="submit" value="Sign Up : )">
			<input type="button" value="Cancle : (">
		</form>
   `;
   res.send(output);
});

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