var express = require('express');
var path = require('path');
var router = express.Router();

/* GET data. */
router.get('/', function(req, res, next) {
	console.log(req.body);
	//TODO:: search DB for relevant info and insert into data variable.
    var data = {
    	route : "1",
    	serverOfRoute : "2",
    	schedule : [1, 2, 3]
    }
    res.json(data);
});

/* POST data */
router.post('/', function(req, res, next) {
	//TODO :: Store data in DB
	console.log(req.body);
	//TODO :: Return relevant data from DB to data variable for app
	var data = {
    	route : "7",
    	serverOfRoute : "127.0.0.1:3000"
    }
    res.json(data);
});

module.exports = router;
