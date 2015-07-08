var express = require('express');
var mysql = require('mysql');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.session.passport.user === undefined)
    {
        res.redirect('../../../complaint_logger');
    }
    else
    {
        // console.log(req.app.locals.id);
        var config = require('../config');
        var db = config.database;
        var connection = mysql.createConnection({host: db.host, user: db.user, password: db.password, database: db.database});
        var cid = req.app.locals.id;
        function getRecords(cb) {
            
            connection.query("select complaints.id as cId,complaints.complaint_id,complaints.header,description, DATE_FORMAT(complaints.created_time,'%d.%m.%Y') as date,complaints.status,users.name,users.username,users.email,users.mobile,complaint_photos.photo_url,complaint_remarks.remark from complaints LEFT JOIN users ON complaints.user_id = users.id LEFT JOIN complaint_photos ON complaints.id = complaint_photos.complaint_id LEFT JOIN complaint_remarks ON complaints.id = complaint_remarks.complaint_id where complaints.id = ?", cid, function(err, result) {
                if (err)
                    throw(err);
                cb(result);
            });
        }
        getRecords(function(result) {
            //console.log(result);
           connection.query("select organizations.organization_name as OrganizationName,users.email as OrganizationMail from organizations LEFT JOIN users ON users.id = organizations.user_id LEFT JOIN complaints ON complaints.organization_id = organizations.id where complaints.id = ?", cid, function(err, Orgres) {
                if (err)
                    throw(err);
            res.render('admin_complaint_view', {cData: result[0],imageUrl:result,OrgMail:Orgres[0]['OrganizationMail']});
            });  
        });
        // res.render('admin_complaint_view');
    }
});

module.exports = router;
