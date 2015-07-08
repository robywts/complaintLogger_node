var MD5 = require('MD5');
var mysql = require('mysql');

var config = require('./config');
var db = config.database;
var connection = mysql.createConnection({host: db.host, user: db.user, password: db.password, database: db.database});

function getRecords(cb) {
    connection.query("select users.email as email,users.username as username,users.password as password,organizations.id orgId from users LEFT JOIN organizations ON organizations.user_id = users.id where users.user_type = ?",2, function(err, result) {
        if (err)
            throw(err);
        cb(result);
    });
}
var passport = require('passport'),
        LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(function(username, password, done) {
    getRecords(function(res) {
        for (var i = 0; i < res.length; i++) {
            // console.log(res[i]['password']);
            if (username == res[i]['username'] && MD5(password) == res[i]['password']) {
                return done(null, {userId: res[i]['orgId']});
            }
        }
        return done(null, false);
    });
}
));
passport.serializeUser(function(user, done) {
    done(null, user.userId);
});
passport.deserializeUser(function(userId, done) {
    done(null, {userId: userId});
});
module.exports = passport;
