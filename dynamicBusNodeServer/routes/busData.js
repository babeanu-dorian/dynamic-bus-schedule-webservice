var router = require('express').Router();

var serverData = require('../serverData');
const httpAddress = require('../utility/http_address');

const keyLength = 16;

// POST data
router.post('/', function(req, res, next) {

    // TODO: puth these requests in a queue and do this processing in order

	//console.log(req.body);

    let busId = parseInt(req.body.id);
    let key = req.body.key;
    let route = parseInt(req.body.route);
    let progress = parseFloat(req.body.progress);

    if (
        isNaN(busId) || busId < 0 || key.length !== keyLength ||
        isNaN(route) || route < 0 || serverData.routeStations['r' + route] === undefined ||
        isNaN(progress) || progress < 0.0 || progress > 1.0
    ) {
        res.status(400);
        res.send();
    } else {
        // check if the bus exists, if it handles the provided route, if the provided key is correct
        serverData.database.query('SELECT Route AS route, AuthenticationKey AS \'key\' FROM Buses WHERE Id = ?', [busId],
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
                        if (response.serverOfRoute === httpAddress(serverData.address, serverData.httpPort)) {
                            serverData.setBusArrivalTimes(busId, route, progress)
                        }
                        res.json(response);
                    }
                }
            }
        );
    }

});

module.exports = router;
