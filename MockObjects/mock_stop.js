var request = require('request');

module.exports = function(key, id, routeList, url) {

	return {
		key:key,
		id:id,
		mapRouteServer:{},
		routeList:routeList,
		schedule:[],
		url:url,
		initalize: function() {
			request.get(this.url + "/appData", (error, response, body) => {
				if(error) {
					console.log(error);
				} else {
					this.mapRouteServer = body.mapRouteServer;
				}
			});
		}
		update: function() {
			schedule = [];
			for(int i = 0 ; i < routeList.length ; i++) {
				request.post(
				{
					url:this.mapRouteServer["r" + routeList[i]] + "/routeData",
					body:JSON.stringify({
						route:routeList[i],
						station:this.id,
					})
				},
				function(error, response, body){
					if (error) {
						console.log(error); // TODO: select another server from serverList in case of error
					} else if (!body.schedule) {
						this.mapRouteServer["r" + routeList[i]] = body.serverOfRoute;
						this.update();
					} else {
						schedule.concat(body.schedule);
					}
				})
			}
		}
		display: function() {
			schedule.sort(function(a , b) {
				return a.arrivalTime - b.arrivalTime;
			})
		}
	}
}