var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var dateFormat = require('dateformat');

var complaint_logger = require('./routes/complaint_logger');
//var users = require('./routes/users');
var home = require('./routes/home');
var passport = require('./auth.js');
var admin_complaint_view = require('./routes/admin_complaint_view');
//var admin_complaint_view_edit = require('./routes/admin_complaint_view_edit');
var subscription = require('./routes/subscription');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//app.use('/users', users);
//app.use('/complaint_logger/home/admin_complaint_view/id',admin_complaint_view_edit);
app.use('/complaint_logger', complaint_logger);
app.post('/complaint_logger', passport.authenticate('local', {
    failureRedirect: '/complaint_logger',
    successRedirect: '/complaint_logger/home'
}));
app.use('/complaint_logger/home', home);
app.use('/complaint_logger/home/subscription', subscription);
app.post('/complaint_logger/home/admin_complaint_view/', passport.authenticate('local', {
    failureRedirect: '/complaint_logger',
    successRedirect: '/complaint_logger/home/admin_complaint_view/:id?'
}));

app.use('/complaint_logger/home/admin_complaint_view/:id?', function(req, res, next) {
    app.locals.id = req.params.id;
    next();
});
app.use('/complaint_logger/home/admin_complaint_view/:id?', admin_complaint_view);


app.post('/complaint_logger/home/admin_complaint_view/:id', function(req, res) {
    var cId = req.params.id;
    var status = req.body.status;
    var remark = req.body.remark;
    var t = new Date();
    var time = dateFormat(time, "isoDateTime");
    //  console.log(dateFormat(time,"isoDateTime"));console.log('dsadsdasda');
    var mysql = require('mysql');
    var config = require('./config');
    var db = config.database;
    var connection = mysql.createConnection({host: db.host, user: db.user, password: db.password, database: db.database});
    if (status == 1)
    {
        connection.query("UPDATE complaints SET ? WHERE ?", [{processing_time: time, status: status}, {id: cId}]);
    }
    else if (status == 2)
    {
        connection.query("UPDATE complaints SET ? WHERE ?", [{completed_time: time, status: status}, {id: cId}]);
    }
    else if (status == 3)
    {
        connection.query("UPDATE complaints SET ? WHERE ?", [{discarded_time: time, status: status}, {id: cId}]);
    }
    else
    {
        connection.query("UPDATE complaints SET ? WHERE ?", [{status: status}, {id: cId}]);
    }
    connection.query("INSERT INTO complaint_remarks SET ? ON DUPLICATE KEY UPDATE ?", [{remark: remark, complaint_id: cId}, {remark: remark}]);
    function getRecords(cb) {

        connection.query("select complaints.id as cId,complaints.complaint_id,complaints.header,description, DATE_FORMAT(complaints.created_time,'%d.%m.%Y') as date,complaints.status,users.name,users.username,users.email,users.mobile,complaint_photos.photo_url,complaint_remarks.remark from complaints LEFT JOIN users ON complaints.user_id = users.id LEFT JOIN complaint_photos ON complaints.id = complaint_photos.complaint_id LEFT JOIN complaint_remarks ON complaints.id = complaint_remarks.complaint_id where complaints.id = ?", cId, function(err, result) {
            if (err)
                throw(err);
            cb(result);
        });
    }

    getRecords(function(result) {
        connection.query("select organizations.organization_name as OrganizationName,users.email as OrganizationMail from organizations LEFT JOIN users ON users.id = organizations.user_id LEFT JOIN complaints ON complaints.organization_id = organizations.id where complaints.id = ?", cId, function(err, Orgres) {
            if (err)
                throw(err);
            res.render('admin_complaint_view', {cData: result[0], imageUrl: result, OrgMail: Orgres[0]['OrganizationMail']});
        });
    });
});

// catch 404 and forward to error handler

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
