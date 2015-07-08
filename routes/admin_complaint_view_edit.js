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
       res.send("fdsfsdfds");
    }
});

module.exports = router;
