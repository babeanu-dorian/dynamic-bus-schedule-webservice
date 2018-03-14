var express = require('express');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    //res.render('index', { title: 'Express' });
    /*it seems the best way to send a .html file is to use ejs and 
    just use it to render the html file with .sendFile.  Trying
    to hack out of a view engine seems to break Express so it's better
    to just comply and use ejs*/
    res.sendFile(path.join(__dirname, '../views', 'placeHolder.html'));
});

// TODO: handle bus data
router.post('/busData', function(req, res, next) {
	console.log(req.body);
	res.body.route = req.body.route;
	res.body.serverOfRoute = 'this_is_a_wrong_address';
	next();
});

// TODO: serve schedules
router.get('/schedule', function(req, res, next) {
	console.log(req.body);
	next();
});

module.exports = router;
