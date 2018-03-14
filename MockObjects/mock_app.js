var request = require('request');

module.exports = function(serverList) {

	return {
		serverList:serverList,
		mapRouteServer:{},
		serverIdx:0, // increment in case of error
		getRouteData: function(routeId, stationId, time, callback) {
			if (!this.mapRouteServer["r" + routeId])
				this.mapRouteServer["r" + routeId] = serverList[this.serverIdx];
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
					console.log(error); // TODO: select another server from serverList in case of error
					if (body.serverOfRoute !== this.mapRouteServer["r" + routeId]) {
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