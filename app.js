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
var flash = require('connect-flash');

// 오류 핸들러 사용
var expressErrorHandler = require('express-error-handler');

// 파일 업로드용 미들웨어
var multer = require('multer');
var fs = require('fs');

// 이것은 mysql의 user, password와 nodemailer에 필요한 정보가 있는 JSON파일을 가져오는 것.
var data = fs.readFileSync("../Tik's_secret/client_id.json");
var jsonData = JSON.parse(data);

// 클라이언트에서 ajax로 요청했을 때 CORS(다중 서버 접속) 지원
var cors = require('cors');

// nodemailer 사용
var nodemailer = require('nodemailer');

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

app.use(express.static(path.join(__dirname, './')));

// cookie-parser 설정
app.use(cookieParser());

// MySQL 데이터베이스를 사용할 수 있는 mysql 모듈 불러오기
var mysql = require('mysql');
var conn = mysql.createConnection({
	host : 'localhost',
	user : jsonData.web.mysql.user,
	password : jsonData.web.mysql.password,
	database : 'tik',
	multipleStatements: true
});
conn.connect();


app.use(flash());
// session 설정
app.use(session({
	secret : 'my key',
	resave : false,
	saveUninitialized : true,
	store: new MySQLStore({
		host : 'localhost',
		port : 3306,
		user : jsonData.web.mysql.user,
		password : jsonData.web.mysql.password,
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

app.get('/process/main', function(req, res){
	res.redirect('/process/main/1');
});

app.get('/process/main/:page', function(req, res){
	if(req.user && req.user.email) { // Signin
		var sql = 'SELECT p.title, p.p_created_at, p.views, p.getwant, p.postnum, p.picpath, m.nickname, m.permission FROM postings p JOIN members m ON m.id = p.members_id ORDER BY postnum DESC';
		conn.query(sql, function(err, results) {
			res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
			var page = req.params.page;
			console.log('page -> ' + page);
			console.log('permission -> '+ req.user.permission);
			var countMypost = 0;
			for (var i = 0; i < results.length ; i++) {
				if(results[i].nickname === req.user.nickname) {
					countMypost++;
				}
			};
			app.set('countMypost',countMypost);
			console.log('results[0].nickname -> ' + results[1].nickname)
			console.log('countMypost -> ' + app.get('countMypost'));
			console.log('req.get(host) -> ' + req.get('host'));

			app.set('curPage', page);
			var leng = Object.keys(results).length -1;
			var pagenum = 4;
			var signTld = req.user.tld;
			var context = {email : req.user.email, nickname : req.user.nickname, results : results, leng : leng, pagenum : pagenum, page : page, signTld : signTld, permission : req.user.permission, permissionMessage : req.flash('permissionMessage'), curPermissionpost : req.user.permissionpost, countMypost : countMypost};
			req.app.render('postlist', context, function(err, html) {
				if(err) {
					console.error('뷰 렌더링 중 오류 발생 : ' + err.stack);

					req.app.render('error', function(err, html) {
						res.end(html);
					});
				}
				console.log('*** rendered, /process/main(postlist) ***');
				if (req.query.id !== app.get('emailCode')) { // 이메일 인증.
					if((req.protocol+"://"+req.get('host')) == ("http://localhost:10468")) {
					// if((req.protocol+"://"+req.get('host')) == ("http://192.168.219.194:10468")) {
						console.log('domain is matched.');
						if(req.query.id == app.get('emailCode')) {
							console.log('email is verified');
							app.set('signinNickname', req.user.nickname);
							app.set('okPermission', 'okPermission');
							res.end(html);

						} else if(req.query.id === undefined) {
							console.log('req.query.id -> ' + req.query.id);
							res.end(html);
						} else {
							console.log('email is not verified');
							res.end('<h1>bad request</h1>');
						}
					} else {
						res.end('<h1>request is from unknown source</h1>');
					}
				} else {
					console.log('req.query.id -> ' + req.query.id);
					console.log('signinNickname --> ' + req.user.nickname);
					res.end(html);
					console.log(req.protocol+"://"+req.get('host')+"/process/main/1")
				}
			});
		});
	} else { // not Signin

		var sql = 'SELECT p.title, p.p_created_at, p.views, p.getwant, p.postnum, p.picpath, m.nickname, m.permission FROM postings p JOIN members m ON m.id = p.members_id ORDER BY postnum DESC';
		conn.query(sql, function(err, results) {
			res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
			var page = req.params.page;
			var leng = Object.keys(results).length -1;
			var pagenum = 4;

			var context = {results : results, leng : leng, pagenum : pagenum, page : page};
			console.log('results[0].members_id -->' + results[0].members_id);
			// app.set('mainMembersId', results[0].members_id); // 이것을 0으로 하면 안되고 클릭받은 값으로 해야되는데.
			req.app.render('index', context, function(err, html) {
				console.log('*** rendered, /process/main(index) ***');
				console.log('Object xxx --> ' + leng); //<-- 글 목록 개수.
				console.log('pagenum  -- > ' + pagenum);
				console.log('page --> ' + req.params.page);
				res.end(html);
			});
		});
	}
});

app.get('/process/authorize', function(req, res) {
	console.log('this is authorize(get)');
	var sql = 'select * from members';
	conn.query(sql, function(err, results) {
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		var context = {results : results, email : req.user.email, nickname : req.user.nickname, permission : req.user.permission, permissionMessage : req.flash('permissionMessage'), signTld : req.user.tld, countMypost : app.get('countMypost'), curPermissionpost : req.user.permissionpost};
		req.app.render('authorize', context, function(err, html) {
			if(err) {
				console.error('뷰 렌더링 중 오류 발생 : ' + err.stack);

				req.app.render('error', function(err, html) {
					res.end(html);
				});
			}
		console.log('*** rendered, /process/authorize ***');
		res.end(html);
		});
	});
});

app.post('/process/authorize', function(req, res) {
	console.log('this is authorize(post)');
	console.log('req.body.curEmail -> ' + req.body.curEmail);
	console.log('req.body.curPermissionpost -> ' + parseInt(req.body.curPermissionpost) + 1);
	var permissionpost = parseInt(req.body.curPermissionpost);
	permissionpost = permissionpost || 0;
	var authorize = {
		permissionpost : permissionpost + 1
	}
	var sql = 'UPDATE members SET ? WHERE email=?';
	conn.query(sql, [authorize, req.body.curEmail], function(err, results) {
		if(err) {
			console.log(err);
			res.status(500);
		} else {
			res.redirect('/process/authorize');
		}
	})
})

app.post('/process/addcomment', function(req, res) {
	console.log('nickname ->' + req.body.nickname);
	var maxGroupnum = parseInt(req.body.maxGroupnum);
	console.log('groupnum --> ' + maxGroupnum);
	var comment = {
		c_nickname : req.body.nickname,
		comment : req.body.comment,
		c_tld : req.body.tld,
		postings_postnum : req.body.postnum,
		c_members_id : app.get('curId'),
		members_id : app.get('curId'),
		groupnum : maxGroupnum + 1,
		grconum : 1,
		depth : 1
	};
	var sql = 'INSERT INTO comments SET ?, c_created_at = now()';
	conn.query(sql, comment, function(err, results) {
		if(err) {
			console.log(err);
			res.status(500);
		} else {
			res.redirect('/process/showpost?postnum='+app.get('curPostnum'));
		}
	});
});

app.post('/process/updatecomment', function(req, res) {
	var comment = req.body.updacomment;
	console.log(comment)
	var c_id = req.body.updaC_id;
	var sql = 'UPDATE comments SET comment = ?, c_updated_at = now() WHERE c_id=?';
	conn.query(sql, [comment, c_id], function(err, results) {
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

app.locals.maxHelper = function(arr) { // showpost에서 grconum의 max값을 구하기 위해.
	var maxarr = Math.max.apply(null, arr);
	return maxarr;
};

app.locals.formatDateHelper = function(date) { // showpost에서 created_Date의 formatDate
	var d = new Date(date),c                                                                                           
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
};

app.post('/process/addsecomment', function(req, res) {
	var curDepth = parseInt(req.body.curDepth);
	console.log('curDepth -> ' + curDepth)
	var curGroupnum = parseInt(req.body.curGroupnum);
	var maxGrconum = parseInt(req.body.maxGrconum);
	console.log('maxGrconum --> ' + req.body.maxGrconum);
	console.log('curGroupnum ->', curGroupnum);
	console.log('tld ->-> ' + req.body.tld)
	var comment = {
		c_nickname : req.body.nickname,
		comment : req.body.secomment,
		c_tld : req.body.tld,
		postings_postnum : req.body.postnum,
		c_members_id : app.get('curId'),
		members_id : app.get('curId'),
		groupnum : curGroupnum,
		depth : 2,
		grconum : maxGrconum + 1
	};
	var sql = 'INSERT INTO comments SET ?, c_created_at = now()';
	conn.query(sql, [comment, curGroupnum], function(err, results) {
		if(err) {
			console.log(err);
			res.status(500);
		} else {
			res.redirect('/process/showpost?postnum='+app.get('curPostnum'));
		}
	});
});

app.post('/process/updatesecomment', function(req, res) {
	var secomment = req.body.updaSecomment;
	console.log(secomment);
	var c_id = req.body.updaSeC_id;
	var sql = 'UPDATE comments SET comment = ?, c_updated_at = now() WHERE c_id=?';
	conn.query(sql, [secomment, c_id], function(err, results) {
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

app.post('/process/permission', function(req, res) {
	// console.log('permission -> ' + permission);
	console.log('app.get(okPermission) -> ' + app.get('okPermission'));
	if(app.get('okPermission') !== undefined) {
		var sql = "UPDATE members SET permission = 'ok' where email=?";
		conn.query(sql, req.user.email, function(err, results) {
			if(err) {
		 		console.log('뷰 렌더링 중 오류 발생 : ' + err.stack);
		 		req.app.render('error', function(err, html) {
		 			res.end(html);
		 		});
		 	}

		 	app.set('okPermission', undefined);
		 	res.redirect('/process/main/1');
		});
	} else {
		console.log('no email code');
		req.flash('permissionMessage', 'Retry after click link in mail I sent.');
		res.redirect('/process/main/1');
	}
});

app.post('/process/resend', function(req, res) {
	// console.log('permission -> ' + permission);
	console.log('app.get(okPermission) -> ' + app.get('okPermission'));
	console.log('req.user.email -> ' + req.user.email);
	console.log('req.user.nickname -> ' + req.user.nickname);
	console.log('req.get(host) -> '+ req.get('host'));
	sendEmail(req.get('host'), req.user.email, req.user.nickname);
	res.redirect('/process/main/1');
});

app.get('/process/showpost', function(req, res) { 
 	if(req.user && req.user.email) {
	 	var postnum = req.query.postnum;
	 	var notSign = false;
	 	var curTld = req.user.tld;
	 	console.log(req.query.postnum);
	 	console.log('req.params.id --> ' + req.params.id);
	 	console.log('req.user.id --> ' + req.user.id);
	 	app.set('curId', req.user.id);
	 	app.set('curPostnum', postnum);
	 	console.log('curTld -> ' + req.user.tld);
	 	console.log('curPermission -> ' + req.user.permission);
		
	 	var sql = 'SELECT m.id, m.nickname, m.tld, m.insid, p.p_created_at, p.p_updated_at ,p.title, p.picpath, p.post, p.getwant, p.hashtag, p.postnum, p.views, p.howmanydays, p.members_id, c.c_id, c.groupnum, c.grconum ,c.c_nickname ,c.comment, c.c_tld ,c.c_members_id, c.postings_postnum, c.depth, c.c_created_at FROM (members m JOIN postings p ON m.id = p.members_id)LEFT JOIN comments c ON c.postings_postnum = p.postnum WHERE p.postnum=? ORDER BY c.groupnum ASC, c.grconum ASC';
	 	conn.query(sql, postnum, function(err, results) {
			var leng = Object.keys(results).length -1;
			console.log('created_at -> ' + results[0].p_created_at);
	 		// console.log('results[0].id  -> ' + results[0].id);
			res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
			var context = {curSigninId : req.user.id, results : results, signNick : req.user.nickname, signTld : req.user.tld, notSign : notSign, curTld : curTld, curPermission : req.user.permission};
			req.app.render('showpost', context,  function(err, html) {
			 	if(err) {
			 		console.log('뷰 렌더링 중 오류 발생 : ' + err.stack);
			 		req.app.render('error', function(err, html) {
			 			res.end(html);
			 		});
			 	}
			 	console.log('curGisninID --> ' + req.user.id);
			 	// console.log('results --> ' + results[0].id);
			 	console.log('*** rendered, /process/showpost ***');
	 			res.end(html);
			});
		});
 	} else { // Signin 전에 req.user.id를 못가져오기 때문에 else 처리.
		console.log('postnum --->> ' + req.query.postnum);
	 	var postnum = req.query.postnum;
	 	var notSign = true;
	 	var sql = 'SELECT m.id, m.nickname, m.tld, m.insid, p.p_created_at, p.p_updated_at ,p.title, p.picpath, p.post, p.getwant, p.hashtag, p.postnum, p.views, p.howmanydays, p.members_id, c.c_id, c.groupnum, c.grconum ,c.c_nickname ,c.comment, c.c_tld, c.c_members_id, c.postings_postnum, c.depth, c.c_created_at FROM (members m JOIN postings p ON m.id = p.members_id)LEFT JOIN comments c ON c.postings_postnum = p.postnum WHERE p.postnum=? ORDER BY c.groupnum ASC, c.grconum ASC';
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
				console.log('*** rendered, /process/showpost ***');
			 	console.log('results.commentlength ->' + results[0].comment);
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

app.post('/process/deletepost', function(req, res) {
	console.log('here is deletepost.');
	var curPostnum = app.get('curPostnum');
	var sql = "DELETE p, c FROM postings p LEFT JOIN comments c ON p.postnum = c.postings_postnum WHERE p.postnum = ?";
	conn.query(sql, curPostnum, function(err, results) {
		if(err) {
			console.log(err);
			res.status(500);
		} else {
			console.log('delete post');
			res.redirect('/process/main/'+app.get('curPage'));
		}
	});
});

app.post('/process/deletecomm', function(req, res) {
	console.log('here is deletecomm.');
	
	var curGroupnum = req.body.curGroupnum;
	console.log('delete curGroupnum --> ' + curGroupnum);
	var curPostnum = app.get('curPostnum');
	var sql = "DELETE FROM comments WHERE groupnum=?";
	conn.query(sql, curGroupnum, function(err, results) {
		if(err) {
			console.log(err);
			res.status(500);
		} else {
			console.log('delete post');
			res.redirect('/process/showpost?postnum='+app.get('curPostnum'));
		}
	});
});

app.post('/process/deletesecomm', function(req, res) {
	console.log('here is deletecomm.');
	
	var curC_id = req.body.c_id;
	console.log('delete c_id --> ' + curC_id);
	var curPostnum = app.get('curPostnum');
	var sql = "DELETE FROM comments WHERE c_id=?";
	conn.query(sql, curC_id, function(err, results) {
		if(err) {
			console.log(err);
			res.status(500);
		} else {
			console.log('delete post');
			res.redirect('/process/showpost?postnum='+app.get('curPostnum'));
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

passport.use(new LocalStrategy(  {passReqToCallback : true},
	function(req, username, password, done) {
		var paramEmail = username;
		var paramPassword = password;
		var sql = 'SELECT * FROM members WHERE email=?';
		conn.query(sql, paramEmail, function(err, results) {
			console.log(results);
			if(err) {
				return done('There is no member.');
			}
			if(results[0] !== undefined){
				var member = results[0];
				return hasher({password:paramPassword, salt:member.salt}, function(err, pass, salt, hash) {
					if(hash === member.passwd) {
						console.log('LocalStrategy', member);
						return done(null, member); // 이거면 serializeUser가 실행됨.
					} else {
						// console.log('비밀번호를 확인하십시오..');
						return done(null, false, req.flash('signinmessage', 'Invalid your Email or Password.'), req.flash('checkoriginpw', 'Incorrect password. Plz enter correct password.')); // 이거면 deserializeUser가 실행됨.
					}
				});
			} else {
				// console.log("I can't find your email.");
				return done(null, false, req.flash('signinmessage', 'Invalid your Email or Password.')); // 이거면 deserializeUser가 실행됨.
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
	var sql = "SELECT * FROM members;"
	conn.query(sql, function(err, results) {
		var emailLeng = results.length;
		var arrEmail = [];
		for(var i = 0; i < emailLeng; i++) {
			arrEmail.push(results[i].email);
		}
		console.log('arrEmail -> ' + arrEmail);
	 	res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
	 	var context = {email : req.body.username, nickname : req.body.nickname, signinmessage : req.flash('signinmessage'), results : results, arrEmail : arrEmail};
	 	req.app.render('signin', context, function(err, html) {
	 		if(err) {
	 			console.error('뷰 렌더링 중 오류 발생 : ' + err.stack);
	 			req.app.render('error', function(err, html) {
	 				res.end(html);
	 			});
	 		}
	 		console.log('*** rendered, /process/signin ***');
			res.end(html);
	 	});
 	});
});

app.post('/process/editpw', passport.authenticate('local', { 
        failureRedirect: '/process/editinfo',
        failureFlash: true
    }), function(req, res) {
	console.log('app.get(forgotemail) -> ' + app.get('forgotEmail'));
	hasher({password:req.body.passwd}, function(err, pass, salt, hash){
		var member = {
			nickname : req.body.nickname || req.query.nickname,
			passwd : hash,
			salt : salt,
			country : req.body.country || req.query.country,
			agegroup : req.body.agegroup || req.query.agegroup,
			insid : req.body.insid || req.query.insid
		};
		var sql = 'UPDATE members SET ?, m_updated_at = now() WHERE email = ?';
		conn.query(sql, [member, req.user.email || app.get('forgotEmail')], function(err, results) {
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

app.post('/process/sendpw', function(req, res) {
	console.log('post.forgotpw에 들어옴.');
	console.log('req.body.forgotEmail -> ' + req.body.forgotEmail);
	app.set('forgotEmail', req.body.forgotEmail);
	sendEmail(req.get('host'), req.body.forgotEmail, '', "forgotpw");
	res.redirect('/process/signin');
});

app.post('/process/forgotpw', function(req, res) {
	console.log('post.forgotpw에 들어옴.');
	console.log('req.body.email ->' + req.body.email);
	hasher({password:req.body.passwd}, function(err, pass, salt, hash){
		var member = {
			passwd : hash,
			salt : salt
		};
		var sql = 'UPDATE members SET ?, m_updated_at = now() WHERE email = ?';
		conn.query(sql, [member, req.body.email], function(err, results) {
			if(err) {
				console.log(err);
				res.status(500);
			} else {
				console.log('pw 변경');
				res.redirect('/process/signin');
			}
		});
	});
});

app.get('/process/forgotpw', function(req, res) {
	console.log('get.forgotpw에 들어옴.');
	res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
 	var context = {email : app.get('forgotEmail')};
 	req.app.render('forgotpw', context, function(err, html) {
 		if(err) {
 			console.error('뷰 렌더링 중 오류 발생 : ' + err.stack);
 			req.app.render('error', function(err, html) {
 				res.end(html);
 			});
 		}
 		console.log('req.query.id -> '+ req.query.id);
 		console.log('app.get(emailCode) -> '+ app.get('emailCode'));

 		console.log('*** rendered, /process/forgotpw ***');
 		if (req.query.id !== app.get('emailCode')) { // password 변경 시에 살짝의 보안 ?
			if((req.protocol+"://"+req.get('host')) == ("http://localhost:10468")) {
			// if((req.protocol+"://"+req.get('host')) == ("http://192.168.219.194:10468")) {
				console.log('domain is matched.');
				if(req.query.id == app.get('emailCode')) {
					console.log('email is verified');
					res.end(html);

				} else if(req.query.id === undefined) {
					console.log('req.query.id -> ' + req.query.id);
					res.end('<h1>bad request</h1>');
				} else {
					console.log('email is not verified');
					res.end('<h1>bad request</h1>');
				}
			} else {
				res.end('<h1>request is from unknown source</h1>');
			}
		} else {
			console.log('req.query.id -> ' + req.query.id);
			res.end(html);
			console.log(req.protocol+"://"+req.get('host')+"/process/main/1")
		}
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
		sql = 'SELECT p.title, p.p_created_at, p.views, p.getwant, p.postnum, p.picpath, m.nickname, m.permission FROM postings p JOIN members m ON m.id = p.members_id AND members_id=? ORDER BY p.postnum DESC';
		conn.query(sql, memberId, function(err, results){
			if(results[0] == undefined) { // 글이 없다면
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				var context = {nickname : req.user.nickname, email : req.user.email, signTld : req.user.tld, results : results, permission : req.user.permission, curPermissionpost : req.user.permissionpost, countMypost : app.get('countMypost')};
				req.app.render('mypost', context, function(err, html) {
					if(err) {
						console.log('뷰 렌더링 중 오류 발생 : ' + err.stack);
						req.app.render('error', function(err, html) {
							res.end(html);
					});
				}
				console.log('*** rendered, /process/mypage ***');
					res.end(html);
				});
			} else { // 글이 있다면
			res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
			console.log('myPost results --> ' + req.user.id);
			var page = req.params.page;
			var leng = Object.keys(results).length -1;
			var pagenum = 4;

			var context = {nickname : req.user.nickname, email : req.user.email, signTld : req.user.tld, results : results, leng : leng, pagenum : pagenum, page : page, permission : req.user.permission, curPermissionpost : req.user.permissionpost, countMypost : app.get('countMypost')};
			req.app.render('mypost', context, function(err, html) {
				if(err) {
					console.log('뷰 렌더링 중 오류 발생 : ' + err.stack);
					req.app.render('error', function(err, html) {
						res.end(html);
					});
				}
				// console.log('results --> ' + results[0].title);
				console.log('*** rendered, /process/mypage ***');
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
	console.log('permission -> '+ req.user.permission);
	sql = 'SELECT * FROM members WHERE email=?';
	conn.query(sql, memberEmail, function(err, results) {
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		var context = {nickname : req.user.nickname, email : req.user.email, signTld : req.user.tld, permission : req.user.permission, results : results[0], curPermissionpost : req.user.permissionpost, countMypost : app.get('countMypost'), permissionMessage : req.flash('permissionMessage')};
		req.app.render('myinfo', context, function(err, html) {
			if(err) {
				console.log('뷰 렌더링 중 오류 발생 : ' + err.stack);
				req.app.render('error', function(err, html){
					res.end(html);
				});
			}
			console.log('*** rendered, /process/myinfo ***');
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

app.post('/process/cancelmember', function(req, res) {
	console.log("you're in cancelmember");
	var curEmail = req.body.curEmail;
	var cancelId = req.body.cancelId;
	console.log('curEmail ->' + curEmail);
	var member = {
		email : null,
		passwd : null,
		salt : null,
		country : null,
		agegroup : null,
		insid : null,
		m_created_at : null,
		m_updated_at : null,
		flag : 'deleted'
	}
	var sql ="UPDATE members SET ? WHERE email=?; DELETE p, c FROM postings p LEFT JOIN comments c ON p.postnum = c.postings_postnum WHERE id = ?";
	conn.query(sql, [member, curEmail, cancelId], function(err, results) {
		if(err) {
			console.log(err);
			res.status(500);
		} else {
			console.log('cancelmembership.');
			req.logout();
			req.session.save(function() {
				res.redirect('/process/main');
			})
		}
	})
});

app.post('/process/editinfo', passport.authenticate('local', { 
        failureRedirect: '/process/editinfo',
        failureFlash: true
    }), function(req, res) {
	console.log('app.get(forgotemail) -> ' + app.get('forgotEmail'));
	hasher({password:req.body.passwd}, function(err, pass, salt, hash){
		var member = {
			nickname : req.body.nickname || req.query.nickname,
			passwd : hash,
			salt : salt,
			country : req.body.country || req.query.country,
			agegroup : req.body.agegroup || req.query.agegroup,
			insid : req.body.insid || req.query.insid
		};
		var sql = 'UPDATE members SET ?, m_updated_at = now() WHERE email = ?';
		conn.query(sql, [member, req.user.email || app.get('forgotEmail')], function(err, results) {
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
	console.log('Nicklist ->' + app.get('Nicklist'));
	var memberEmail = req.user.email;
	console.log("ageGV -> " + req.query.agegroup);
	console.log('email -> ' + req.user.email);
	var sql = "SELECT * FROM members LEFT JOIN postings ON members.id = postings.members_id WHERE email=?; SELECT m.nickname FROM members m";
	conn.query(sql, memberEmail, function(err, results) {

		var nickLeng = results[1].length;
		var arrNick = [];
		for(var i = 0; i < nickLeng; i++) {
			arrNick.push(results[1][i].nickname);
		}
		console.log('arr -> ' + arrNick);
		console.log('nickLeng ->' + nickLeng);
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		var context = {curNickname : req.user.nickname, curEmail : req.user.email, results : results, arrNick : arrNick, checkoriginpw : req.flash('checkoriginpw')};
		app.set('postLeng', Object.keys(results).length);
		console.log('results[1] -> ' + results[1][1].nickname);
		req.app.render('editinfo', context, function(err, html) {
			if(err) {
				console.log('뷰 렌더링 중 오류 발생 : ' + err.stack);
				req.app.render('error', function(err, html){
					res.end(html);
				});
			}
			console.log('*** rendered, /process/editinfo ***');
			console.log('results[0].agegroup -> ' + results[0].agegroup);
			res.end(html);
		});
	});
});

app.post('/process/editpost', function(req, res) {
	console.log("you're in editpost");
	console.log('this is curPostnum --> ' + app.get('curPostnum'));

	var dateRange = req.body.startDate + ' ~ ' + req.body.endDate;
	var posting = {
		howmanydays : dateRange,
		title : req.body.title,
		picpath : req.body.picpath,
		post : req.body.post,
		hashtag : req.body.hashtag
	};
	var sql = 'UPDATE postings SET ?, p_updated_at = now() WHERE postnum=?';
	conn.query(sql, [posting, app.get('curPostnum')], function(err, results) {
		if(err) {
			console.log(err);
			res.status(500);
		} else {
			console.log('podst 변경');
			backURL = req.header('Referer') || '/';
			res.redirect('/process/showpost?postnum='+app.get('curPostnum'));
		}
	});
});

app.get('/process/editpost', function(req, res) {
	console.log('this is curPostnum --> ' + app.get('curPostnum'));
	var sql = 'SELECT m.nickname, m.tld, m.insid, p.p_created_at, p.title, p.picpath, p.post, p.getwant, p.hashtag, p.postnum, p.views, p.howmanydays FROM members m JOIN postings p ON m.id = p.members_id AND postnum=?';
	conn.query(sql, app.get('curPostnum'), function(err, results) {
		console.log('howmanydays => ' + results[0].howmanydays);
		var howmanydays = results[0].howmanydays;
		var startDate = howmanydays.split(' ~ ')[0];
		var endDate = howmanydays.split(' ~ ')[1];

		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		var context = {results : results[0], startDate : startDate, endDate : endDate, signTld : req.user.tld};
		req.app.render('editpost', context, function(err, html) {
			if(err) {
				console.log('뷰 렌더링 중 오류 발생 : ' + err.stack);
				req.app.render('error', function(err, html) {
					res.end(html);
				});
			}
			console.log('*** rendered, /process/editpost ***');
			res.end(html);
		});
	});
});

// 이메일 인증
var rand, mailOptions, host, link;
function sendEmail(cliHost, cliTo, userNickname, way) {
	var transporter = nodemailer.createTransport({
		service : 'gmail',
		auth : {
			user : 'harris19921204@gmail.com',
			pass : jsonData.web.gmail.password
		}
	});
	rand = Math.floor((Math.random() * 100) + 54)
	host = cliHost;
	console.log('rand -> ' + rand); // rand로 보내고 바로 rand값을 가져오면 그 값은 같다.
	app.set('emailCode', rand);
	console.log("app.get(emailCode) -> " + app.get('emailCode'));
	console.log('way -> ' + way);
	console.log('userNickname -> '+ userNickname)
	if(way === "forgotpw") {
		link = 'http://' + cliHost + '/process/forgotpw?id='+rand;
		mailOptions = {
			from : 'TiK(Travel in Korea) <harris19921204@gmail.com>', // sender address
			to : cliTo, // list of receivers
				subject : "Hello. This is TiK ! forgot password ?",
				html : "Hello, " +userNickname+ "<br> Please Click on the link and then set new password.<br><a href="+link+">Click here to set new password</a>"
		};
	} else {
		link = 'http://' + cliHost + '/process/main/1?id='+rand;
		mailOptions = {
			from : 'TiK(Travel in Korea) <harris19921204@gmail.com>', // sender address
			to : cliTo, // list of receivers
				subject : "Welcome to TiK ! This is the permission Email.", // Subject line
				html : "Hello, " +userNickname+ "<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>" // html body
		};
	}

	transporter.sendMail(mailOptions, function(error, response) {
		if(error) {
			console.log(error);
		} else {
			console.log('message sent : ' + response.message);
		}
	});
};

app.post('/process/signup', function(req, res) {
	hasher({password:req.body.passwd}, function(err, pass, salt, hash){
		var member = {
			nickname : req.body.nickname,
			email : req.body.email,
			passwd : hash,
			salt : salt,
			country : req.body.country,
			tld : req.body.tld,
			agegroup : req.body.agegroup,
			insid : req.body.insid
		};
		console.log('111 -> ' + req.get('host'));
		var sql = 'INSERT INTO members SET ?, m_created_at = now()';
		conn.query(sql, member, function(err, results) {
			if(err) {
				console.log(err);
				res.status(500);
			} else {
				req.login(member, function(err) {
					req.session.save(function() {
						sendEmail(req.get('host'), req.body.email, req.user.nickname);
						res.redirect('/process/main');
					});
				});
			}
		});
	});
});

app.get('/process/signup', function(req, res) {
	console.log('signup 호출.');
	var sql = 'SELECT * FROM members m';
	conn.query(sql, function(err, results) {
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		var nickLeng = results.length;
		var arrNick = [];
		var arrEmail = [];
		for(var i = 0; i < nickLeng; i++) {
			arrNick.push(results[i].nickname);
			arrEmail.push(results[i].email);
		}
		console.log('arrNick -> ' + arrNick);
		console.log('arrEmail -> ' + arrEmail);
	 	var context = {results : results, arrNick : arrNick, arrEmail : arrEmail};
	 	req.app.render('signup', context, function(err, html) {
	 		if(err) {
	 			console.log('뷰 렌더링 중 오류 발생 : ' + err.stack);
	 			req.app.render('error', function(err, html) {
	 				res.end(html);
	 			});
	 		}
	 	console.log('*** rendered, /process/signup ***');
	 	res.end(html);
		});
	});
});

app.post('/process/addpost', function(req, res) { // 로그인한 아이디로 확인하려면 sessions아이디를 가져오는 건가 ?
	var dateRange = req.body.startDate + ' ~ ' + req.body.endDate;
	var posting = {
		id : req.body.id,
		howmanydays : dateRange,
		title : req.body.title,
		picpath : req.body.picpath,
		post : req.body.post,
		views : req.body.views,
		hashtag : req.body.hashtag,
		members_id : req.body.id
	};
	var sql = 'INSERT INTO postings SET ?, p_created_at = now()';
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
		var context = {results : results[0], email : req.user.email, nickname : req.user.nickname, signTld : req.user.tld, permission : req.user.permission, countMypost : app.get('countMypost'), curPermissionpost : req.user.permissionpost};
		req.app.render('addpost', context,  function(err, html) {
			if(err) {
				console.log('뷰 렌더링 중 오류 발생 : ' + err.stack);

				req.app.render('error', function(err, html) {
					res.end(html);
				});
			}
			console.log('*** rendered, /process/addpost ***');
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

			for(var i = 0; i < files.length; i++) {
				originalname = files[i].originalname;
				filename = files[i].filename;
				mimetype = files[i].mimetype;
				size = files[i].size;
			}
		} else {
			console.log('파일 갯수 : 1');

			originalname = files[i].originalname;
			filename = files[i].name;
			mimetype = files[i].mimetype;
			size = files[i].size;
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