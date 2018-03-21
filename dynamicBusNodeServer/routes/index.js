var express = require('express');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    //res.render('index', { title: 'Express' });
    /*it seems the best way to send a .html file is to use ejs and 
    just use it to render the html file with .sendFile.  Trying
    to hack out of a view engine seems to break Express so its better
    to just comply and use ejs*/
    var route = req.query.route;
    if(route) {
    	console.log(route);
    }
    res.sendFile(path.join(__dirname, '../views', 'placeHolder.html'));
});

module.exports = router;
