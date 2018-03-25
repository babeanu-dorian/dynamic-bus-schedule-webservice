var router = require('express').Router();

var serverData = require('../serverData');

const keyLength = 16;

// POST data
router.post('/', function(req, res, next) {

    // TODO: puth these requests in a queue and do this processing in order

	console.log(req.body);

    let busId = req.body.id;
    let key = req.body.key;
    let route = req.body.route;
    let progress = req.body.progress;

    if (
        !Number.isInteger(busId) || busId < 0 ||
        typeof key !== 'string' || key.length !== keyLength ||
        !Number.isInteger(route) || route < 0 ||
        Number(progress) !== progress || progress < 0.0 || progress > 1.0
    ) {
        res.status(400);
        res.send();
    } else {
        // check if the bus exists, if it handles the provided route, if the provided key is correct
        serverData.database.query('SELECT Route AS route, AuthenticationKey AS key FROM Buses WHERE Id = ?', [busId],
            function (error, results, fields) {
                if (error) {
                    console.log(error);
                }
                else {
                    if (results.length === 0 || route !== results[0].route || key !== results[0].key) {
                        // bad request
                        res.status(400);
                        res.send();
                    } else {
                        let response = {
                            serverOfRoute:serverData.mapRouteServer['r' + route],
                            route:route
                        };
                        if (response.serverOfRoute === serverData.address) {
                            serverData.setBusArrivalTimes(busId, route, progress)
                        }
                        res.json(response);
                    }
                }
            }
        );
    }

    res.json(data);

});

module.exports = router;
