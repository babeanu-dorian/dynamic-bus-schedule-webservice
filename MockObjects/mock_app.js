var request = require('request');

module.exports = function(url) {

	return {
		serverList:[url],
		mapRouteServer:{},
		workingServer: 0,
		allServersMightBeDown:false,
		getRouteData: function(routeId, stationId, time, callback) {
			if (!this.mapRouteServer["r" + routeId])
				this.mapRouteServer["r" + routeId] = serverList[this.workingServer];
			request.get(
				{
					url:this.mapRouteServer["r" + routeId] + "/schedule",
					body:JSON.stringify({
						route:routeId,
						station:stationId,
						time:time
					})
				},
				function(error, response, body){
					if (error) {
						console.log(error); // TODO: select another server from serverList in case of error
					} else if (body.serverOfRoute !== this.mapRouteServer["r" + routeId]) {
						// the server was not the one handling route,
						// update server address and get the schedule from there
						this.mapRouteServer["r" + routeId] = body.serverOfRoute;
						this.getRouteData(routeId, stationId, time, callback);
					} else if (body.schedule) {
						callback(body.schedule);
					}
				}.bind(this)
			);
		}
	}
}