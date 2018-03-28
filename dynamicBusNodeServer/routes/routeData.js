var router = require('express').Router();
var serverData = require('../serverData');

// POST data
router.post('/', function(req, res, next) {
	// TODO: handle the time as well
	let route = req.body.route;
	let station = req.body.station;
	let time = req.body.time;

	// TODO: make a function that does this check, the condition of this 'if' is ridiculous
	// test for bad requests; TODO: check for time once the type is decided
	if (
		!Number.isInteger(route) || route < 0 ||
		(typeof station !== 'undefined' && station !== null &&
		(!Number.isInteger(station) || station < 0 ||
		typeof serverData.routeStations.stations['s' + station] === 'undefined')) //|| (typeof time !== 'undefined' && ...)
	) {
		res.status(400);
		res.send();
	} else {
		let response = {
			serverOfRoute:serverData.mapRouteServer['r' + route],
			schedule:[]
		};
		if (response.serverOfRoute === serverData.address) {
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
