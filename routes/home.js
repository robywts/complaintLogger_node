var express = require('express');  
var mysql = require('mysql');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.session.passport.user === undefined)
    {
        res.redirect('../complaint_logger');
    }
    else
    {   
        var config = require('../config');
        var db = config.database;
        var connection = mysql.createConnection({host: db.host, user: db.user, password: db.password, database: db.database});
        var Org_id = req.user.userId;
        function getRecords(cb) {
            
           // console.log(Org_id);
            connection.query("select complaints.id as cId,complaints.header, DATE_FORMAT(complaints.created_time,'%d.%m.%Y') as date,complaints.status,users.name,users.email,organizations.organization_name from complaints LEFT JOIN users ON complaints.user_id = users.id LEFT JOIN organizations ON complaints.organization_id = organizations.id where complaints.organization_id = ?", Org_id, function(err, result) {
                if (err)
                    throw(err);
                cb(result);
            });
        }
        getRecords(function(result) {
         connection.query("select organizations.organization_name as OrganizationName,users.email as OrganizationMail from organizations LEFT JOIN users ON users.id = organizations.user_id where organizations.id = ?", Org_id, function(err, Orgres) {
                if (err)
                    throw(err);
              res.render('home', {user: result, organization: Orgres[0]['OrganizationName'],OrgMail:Orgres[0]['OrganizationMail']}); 
         }); 
        });
    }
});

module.exports = router;
