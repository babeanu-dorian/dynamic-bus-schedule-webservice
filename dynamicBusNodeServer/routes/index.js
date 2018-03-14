var express = require('express');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../views', 'placeHolder.html'));
});

// TODO: this post option will probably be removed if Angular can make data requests to /routeData
/*
router.post('/', function(req, res, next) {
    console.log(req.body.routeSelect);
	console.log(req.body.user);
    res.sendFile(path.join(__dirname, '../views', 'placeHolder.html'));
});*/

module.exports = router;
