var router = require('express').Router();
var serverData = require('../serverData');
const httpAddress = require('../utility/http_address');

// POST data
router.post('/', function(req, res, next) {

	let route = parseInt(req.body.route);
	// set station to undefined if it is null or undefined (use ==, not ===)
	let station = (req.body.station == null ? undefined : parseInt(req.body.station));
	let time = req.body.time; // TODO: process this somehow

	// test for bad requests; TODO: check for time once the type is decided
	if (
		isNaN(route) || route < 0 || serverData.routeStations['r' + route] === undefined ||
		(station !== undefined && (isNaN(station) || station < 0 ||
		serverData.routeStations['r' + route].stations['s' + station] === undefined))
	) {
		res.status(400);
		res.send();
	} else {
		let response = {
			serverOfRoute:serverData.mapRouteServer['r' + route],
			schedule:[]
		};
		if (response.serverOfRoute === httpAddress(serverData.address, serverData.httpPort)) {
			if (typeof station === 'undefined' || station === null) {
				for (let station in serverData.routeStations['r' + route].stations) {
					for (let bus in serverData.routeStations['r' + route].stations[station].buses) {
						response.schedule.push({
							route:route,
							station:parseInt(station.substring(1)),
							arrivalTime:serverData.routeStations['r' + route].stations[station].buses[bus].arrivalTime
						});
					}
				}
			} else {
				for (let bus in serverData.routeStations['r' + route].stations['s' + station].buses) {
					response.schedule.push({
						route:route,
						station:station,
						arrivalTime:serverData.routeStations['r' + route].stations['s' + station].buses[bus].arrivalTime
					});
				}
			}
		}
		res.json(response);
	}
});
module.exports = router;
