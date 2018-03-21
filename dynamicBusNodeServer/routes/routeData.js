var express = require('express');
var path = require('path');
var router = express.Router();
var mysql = require('mysql');

//TODO :: use real values here
var con = mysql.createConnection({
    host: "localhost",
    user: "yourusername",
    password: "yourpassword",
    database: "mydb"
});

/* GET data. */
router.get('/', function(req, res, next) {
	console.log(req.body);
	//TODO:: MAKE TEST THIS WITH ACTUAL DB CONNECTION to ensure functionality
    con.connect(function(err) {
        if (err) throw err;
        if(!req.body.routeSelect){ // wants info on a route
            con.query("SELECT " + req.body.num + " FROM Routes", function (err, result, fields) {
                if (err) throw err;
                    res.json(result);//TODO :: Make this get all the data we actually need, not just the route, but template is there
                });
            }
        else{
            con.query("SELECT " + req.body.num + " FROM StationsOnRoute", function (err, result, fields) {
                if (err) throw err;
                    res.json(result)//TODO :: Make this get all the data we actually need, not just the route, but template is there
                });
            }
        }
    });
});

/* POST data */
router.post('/', function(req, res, next) {
	//TODO :: Store data in DB
	console.log(req.body);

    con.connect(function(err) {
        if (err) throw err;
        con.query("SELECT " + req.body.id + " FROM Buses", function (err, result, fields) {
            if (err) throw err;
                if(result.AuthenticationKey == req.body.key){
                    if(result.route == req.body.route){
                        var sql = "INSERT INTO RecordedTimes (Bus, Route, Progress) VALUES (" 
                                + req.body.id + "," + req.body.route + "," + req.body.progress + ")";
                        con.query(sql, function (err, result) {
                            if (err) throw err;
                            console.log("1 record inserted");
                        });
                    }
                    else {
                        //TODO :: Return server which handles route
                    }
                }
            });
        }
        res.json(data);//TODO :: return data to bus based on protocol
});

module.exports = router;
