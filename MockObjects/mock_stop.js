var request = require('request');

module.exports = function(id, routeList, url) {

	return {
		id:id,
		mapRouteServer:{},
		routeList:routeList,
		schedule:[],
		url:url,
		initalize: function() {
			request.get(this.url + "appdata", (error, response, body) => {
				if(error) {
					console.log(error);
				} else {
					body = JSON.parse(body);
					this.mapRouteServer = body.mapRouteServer;
				}
			});
		},
		update: function() {
			this.schedule = [];
			for(var i = 0 ; i < routeList.length ; i++) {
				request.post(
					{
						headers: {'content-type' : 'application/json'},
						url:this.mapRouteServer["r" + routeList[i]] + "routedata",
						body:JSON.stringify({
							route:routeList[i],
							station:this.id,
						})
					},
					function(error, response, body){
						if (error) {
							console.log(error); // TODO: select another server from serverList in case of error
						} else {
							body = JSON.parse(body);
							if (!body.schedule) {
								this.mapRouteServer["r" + routeList[i]] = body.serverOfRoute;
								this.update();
							} else {
								this.schedule = this.schedule.concat(body.schedule);
							}
						}

					}.bind(this)
				);
			}
		},
		display: function() {
			this.schedule.sort(function(a , b) {
				return a.arrivalTime - b.arrivalTime;
			})
			for(var i = 0 ; i < this.schedule.length ; i++) {
				console.log("Route: " + this.schedule[i].route + " Arrival Time: " + this.covertToCurrTime(this.schedule[i].arrivalTime));
			}
		},
		covertToCurrTime: function(time) {
			var date = new Date();
			date.setSeconds(date.getSeconds() + time);
			var minutes = date.getMinutes();
			if(minutes < 10) {
				minutes = '0' + minutes;
			}
			return date.getHours() + ':' + minutes;
  		},
		start: function(delay = 60000) {
			this.initalize();
			this.stop();
			this.interval = setInterval(this.update.bind(this), delay);
		},
		stop: function() {
			clearInterval(this.interval);
		},
	}
}