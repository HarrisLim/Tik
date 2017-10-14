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
	res.redirect('/process/main/1');
});

app.get('/process/main/:page', function(req, res){
	if(req.user && req.user.email) { // after Signin
		var sql = 'SELECT p.title, p.created_at, p.views, p.getwant, p.postnum, p.picpath, m.nickname, m.flagpath FROM postings p JOIN members m ON m.id = p.members_id ORDER BY postnum DESC';
		conn.query(sql, function(err, results) {
			res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
			var page = req.params.page;
			var leng = Object.keys(results).length -1;
			var pagenum = 4;

			var context = {email : req.user.email, nickname : req.user.nickname, results : results, leng : leng, pagenum : pagenum, page : page};
			req.app.render('postlist', context, function(err, html) {
				if(err) {
					console.error('뷰 렌더링 중 오류 발생 : ' + err.stack);

					req.app.render('error', function(err, html) {
						res.end(html);
					});
				}
				console.log('rendered : ' + html);
				app.set('signinNickname', req.user.nickname);
				console.log('signinNickname --> ' + req.user.nickname);
				res.end(html);
			});
		});
	} else { // before Signin

		var sql = 'SELECT p.title, p.created_at, p.views, p.getwant, p.postnum, p.picpath, m.nickname, m.flagpath FROM postings p JOIN members m ON m.id = p.members_id ORDER BY postnum DESC';
		conn.query(sql, function(err, results) {
			res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
			var page = req.params.page;
			var leng = Object.keys(results).length -1;
			var pagenum = 4;

			var context = {results : results, leng : leng, pagenum : pagenum, page : page};
			console.log('results[0].members_id -->' + results[0].members_id);
			// app.set('mainMembersId', results[0].members_id); // 이것을 0으로 하면 안되고 클릭받은 값으로 해야되는데.
			req.app.render('index', context, function(err, html) {
				console.log('rendered : ' + html);
				console.log('Object xxx --> ' + leng); //<-- 글 목록 개수.
				console.log('pagenum  -- > ' + pagenum);
				console.log('page --> ' + req.params.page);
				res.end(html);
			});
		});
	}
});


app.post('/process/addcomment', function(req, res) {
	console.log('nickname ->' + req.body.nickname);
	var comment = {
		c_nickname : req.body.nickname,
		comment : req.body.comment,
		postings_postnum : req.body.postnum,
		members_id : req.body.id
	};
	var sql = 'INSERT INTO comments SET ?';
	conn.query(sql, comment, function(err, results) {
		if(err) {
			console.log(err);
			res.status(500);
		} else {
			res.redirect('/process/showpost?postnum='+app.get('curPostnum'));
		}
	});
});

app.get('/process/showpost', function(req, res) { // 여기에 자기 자신의 글이면 edit가능하게 하자.
 	if(req.user && req.user.email) {
	 	var postnum = req.query.postnum;
	 	var notSign = false;
	 	console.log(req.query.postnum);
	 	console.log('req.params.id --> ' + req.params.id);
	 	console.log('req.user.id --> ' + req.user.id);
	 	app.set('curPostnum', postnum);

	 	var sql = 'SELECT m.id, m.flagpath, m.nickname, m.insid, p.created_at, p.updated_at ,p.title, p.picpath, p.post, p.getwant, p.hashtag, p.postnum, p.views, p.howmanydays, c.c_nickname ,c.comment FROM (members m JOIN postings p ON m.id = p.members_id)LEFT JOIN comments c ON c.postings_postnum = p.postnum WHERE p.postnum=?';
	 	conn.query(sql, postnum, function(err, results) {
	 		console.log('results[0].id  -> ' + results[0].id);
			res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
			var context = {curSigninId : req.user.id, results : results, signNick : req.user.nickname, notSign : notSign};
			req.app.render('showpost', context,  function(err, html) {
			 	if(err) {
			 		console.log('뷰 렌더링 중 오류 발생 : ' + err.stack);
			 		req.app.render('error', function(err, html) {
			 			res.end(html);
			 		});
			 	}
			 	console.log('results --> ' + results[0].title);
			 	console.log('rendered : ' + html);
	 			res.end(html);
			});
		});
 	} else { // Signin 전에 req.user.id를 못가져오기 때문에 else 처리.
		console.log('postnum --->> ' + req.query.postnum);
	 	var postnum = req.query.postnum;
	 	var notSign = true;
	 	var sql = 'SELECT m.id, m.flagpath, m.nickname, m.insid, p.created_at, p.updated_at ,p.title, p.picpath, p.post, p.getwant, p.hashtag, p.postnum, p.views, p.howmanydays, c.c_nickname ,c.comment FROM (members m JOIN postings p ON m.id = p.members_id)LEFT JOIN comments c ON c.postings_postnum = p.postnum WHERE p.postnum=?';
	 	conn.query(sql, postnum, function(err, results) {
	 		// console.log('results[0].id  -> ' + results[0].members_id);
			res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
			var context = {curSigninId : false, results : results, notSign : notSign};
			req.app.render('showpost', context,  function(err, html) {
			 	if(err) {
			 		console.log('뷰 렌더링 중 오류 발생 : ' + err.stack);
			 		req.app.render('error', function(err, html) {
			 			res.end(html);
			 		});
			 	}
			 	// console.log('results --> ' + results[0].title);
			 	console.log('rendered : ' + html);
			 	console.log('resutls.commentlength ->' + results[0].comment);
	 			res.end(html);
			});
		});
 	}
});

app.get('/process/signout', function(req, res) {
	// delete req.session.userEmail;
	req.logout();
	req.session.save(function() {
		res.redirect('/process/main');
	})
});

app.post('/process/delete', function(req, res) {
	console.log('here is delete.');
	var curPostnum = app.get('curPostnum');
	var sql = "DELETE p, c FROM postings p LEFT JOIN comments c ON p.postnum = c.postings_postnum WHERE p.postnum = ?";
	conn.query(sql, [curPostnum, curPostnum], function(err, results) {
		if(err) {
			console.log(err);
			res.status(500);
		} else {
			console.log('delete post');
			res.redirect('/process/main');
		}
	});
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

app.get('/process/signin', function(req, res) {
	console.log('get.signin에 들어옴.');

	res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
	var context = {email : req.body.username, nickname : req.body.nickname};
	req.app.render('signin', context, function(err, html) {
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

app.get('/process/mypost', function(req, res) {
	res.redirect('/process/mypost/1');
});

app.get('/process/mypost/:page', function(req, res) {
	console.log('here is mypost.');
	if(req.user && req.user.email){ // check sign in
		console.log('req.user.email --> ' + req.user.email);
		console.log('req.user.nickname --> ' + req.user.nickname);

		var memberId = req.user.id;
		sql = 'SELECT p.title, p.created_at, p.views, p.getwant, p.postnum, p.picpath, m.nickname, m.flagpath FROM postings p JOIN members m ON m.id = p.members_id AND members_id=? ORDER BY p.postnum DESC';
		conn.query(sql, memberId, function(err, results){
			if(results[0] == undefined) { // 글이 없다면
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				var context = {curNickname : req.user.nickname, results : results};
				req.app.render('mypost', context, function(err, html) {
					if(err) {
						console.log('뷰 렌더링 중 오류 발생 : ' + err.stack);
						req.app.render('error', function(err, html) {
							res.end(html);
					});
				}
				console.log('rendered : ' + html);
					res.end(html);
				});
			} else { // 글이 있다면
			res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
			console.log('myPost results --> ' + req.user.id);
			var page = req.params.page;
			var leng = Object.keys(results).length -1;
			var pagenum = 4;

			var context = {curNickname : req.user.nickname, results : results, leng : leng, pagenum : pagenum, page : page};
			req.app.render('mypost', context, function(err, html) {
				if(err) {
					console.log('뷰 렌더링 중 오류 발생 : ' + err.stack);
					req.app.render('error', function(err, html) {
						res.end(html);
					});
				}
				// console.log('results --> ' + results[0].title);
				console.log('rendered : ' + html);
				res.end(html);
			});
		}
		});
	} else { // check sign in - here is sign in before
		console.log('should sign in.')
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		req.app.render('errsignin', function(err, html) {
			res.end(html);
		})
	}
});

app.get('/process/myinfo', function(req, res) {
	console.log("you're in myinfo");
	console.log('req.user.email --> ' + req.user.email);
	console.log('req.user.nickname --> ' + req.user.nickname);

	var memberEmail = req.user.email;
	console.log('email -> ' + req.user.email);
	sql = 'SELECT * FROM members WHERE email=?';
	conn.query(sql, memberEmail, function(err, results) {
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		var context = {curNickname : req.user.nickname, results : results[0]};
		req.app.render('myinfo', context, function(err, html) {
			if(err) {
				console.log('뷰 렌더링 중 오류 발생 : ' + err.stack);
				req.app.render('error', function(err, html){
					res.end(html);
				});
			}
			console.log('rendered : ' + html);
			res.end(html);
		});
	});
});

/* 이렇게 ejs로 변수나 함수를 보낼 수 있음.
	app.locals.somever = 'hello world'; 
	app.locals.someHelper = function(name) {
		return ('hello ' + name);
	}
	app.locals.useremail = req.user.email;
*/

app.post('/process/editinfo', function(req, res) {
	hasher({password:req.body.passwd}, function(err, pass, salt, hash){
		var member = {
			nickname : req.body.nickname || req.query.nickname,
			passwd : hash,
			salt : salt,
			country : req.body.country || req.query.country,
			agegroup : req.body.agegroup || req.query.agegroup,
			insid : req.body.insid || req.query.insid
		};
		var sql = 'UPDATE members SET ? WHERE email = ?';
		conn.query(sql, [member, req.user.email], function(err, results) {
			if(err) {
				console.log(err);
				res.status(500);
			} else {
				console.log('info 변경');
				res.redirect('/process/myinfo');
			}
		});
	});
});

app.get('/process/editinfo', function(req, res) {
	console.log("you're in editinfo");
	console.log('req.user.email --> ' + req.user.email);
	console.log('req.user.nickname --> ' + req.user.nickname);

	var memberEmail = req.user.email;
	console.log("ageGV -> " + req.query.agegroup);
	console.log('email -> ' + req.user.email);
	sql = 'SELECT * FROM members WHERE email=?';
	conn.query(sql, memberEmail, function(err, results) {
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		var context = {curNickname : req.user.nickname, results : results[0]};
		req.app.render('editinfo', context, function(err, html) {
			if(err) {
				console.log('뷰 렌더링 중 오류 발생 : ' + err.stack);
				req.app.render('error', function(err, html){
					res.end(html);
				});
			}
			console.log('rendered : ' + html);
			console.log('results[0].agegroup -> ' + results[0].agegroup);
			res.end(html);
		});
	});
});

app.post('/process/editpost', function(req, res) {
	console.log("you're in editpost");
		console.log('this is curPostnum --> ' + app.get('curPostnum'));

	var posting = {
		howmanydays : req.body.howmanydays || req.query.howmanydays,
		title : req.body.title || req.query.title,
		picpath : req.body.picpath || req.query.picpath,
		post : req.body.post || req.query.post,
		hashtag : req.body.hashtag || req.query.hashtag
	};
	var sql = 'UPDATE postings SET ? WHERE postnum=?';
	conn.query(sql, [posting, app.get('curPostnum')], function(err, results) {
		if(err) {
			console.log(err);
			res.status(500);
		} else {
			console.log('post 변경');
			backURL = req.header('Referer') || '/';
			res.redirect('/process/showpost?postnum='+app.get('curPostnum'));
		}
	});
});

app.get('/process/editpost', function(req, res) {
	console.log('this is curPostnum --> ' + app.get('curPostnum'));
	var sql = 'SELECT m.flagpath, m.nickname, m.insid, p.created_at, p.title, p.picpath, p.post, p.getwant, p.hashtag, p.postnum, p.views, p.howmanydays FROM members m JOIN postings p ON m.id = p.members_id AND postnum=?';
	conn.query(sql, app.get('curPostnum'), function(err, results) {
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		var context = {results : results[0]};
		req.app.render('editpost', context, function(err, html) {
			if(err) {
				console.log('뷰 렌더링 중 오류 발생 : ' + err.stack);
				req.app.render('error', function(err, html) {
					res.end(html);
				});
			}
			console.log('rendered : ' + html)
			res.end(html);
		});
	});
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
	 console.log('signup 호출.');
	 res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
	 req.app.render('signup', function(err, html) {
	 	if(err) {
	 		console.log('뷰 렌더링 중 오류 발생 : ' + err.stack);
	 		req.app.render('error', function(err, html) {
	 			res.end(html);
	 		});
	 	}
	 	console.log('rendered : ' + html);
	 	res.end(html);
	 });
});

app.post('/process/addpost', function(req, res) { // 로그인한 아이디로 확인하려면 sessions아이디를 가져오는 건가 ?
	var posting = {
		id : req.body.id,
		howmanydays : req.body.howmanydays || req.query.howmanydays,
		title : req.body.title || req.query.title,
		picpath : req.body.picpath || req.query.picpath,
		post : req.body.post || req.query.post,
		views : req.body.views || req.query.views,
		hashtag : req.body.hashtag || req.query.hashtag,
		members_id : req.body.id
	};
	var sql = 'INSERT INTO postings SET ?';
	conn.query(sql, posting, function(err, results) {
		if(err) {
			console.log(err);
			res.status(500);
		} else {
			res.redirect('/process/main');
		}
	});
});

app.get('/process/addpost', function(req, res) { // photo추가 기능 넣고, picpath도 넣자.
	var sql = 'SELECT * FROM members WHERE email=?';
	conn.query(sql, req.user.email, function(err, results) {
		console.log('results --> ' + results[0].email);
		// app.set('showpostMembersId', results[0].id);
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		var context = {results : results[0]};
		req.app.render('addpost', context,  function(err, html) {
			if(err) {
				console.log('뷰 렌더링 중 오류 발생 : ' + err.stack);

				req.app.render('error', function(err, html) {
					res.end(html);
				});
			}
			console.log('rendered : ' + html)
			res.end(html);
		});
	});
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