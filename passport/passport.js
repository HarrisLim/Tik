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

module.exports = passport;