var request = require('request');

module.exports = function(id, route, key, serverList, speed) {

	return {
		id:id,
		route:route,
		key:key,
		serverList:serverList,
		routeServer:serverList[0],
		speed:speed,
		progress:0.0,
		interval:undefined,
		sendData: function() {
			this.progress += this.speed;
			if (this.progress > 1.0)
				this.progress -= 1.0;
			request.post(
				{
					url:this.routeServer + "/routeData",
					body:JSON.stringify({
						id:this.id,
						key:this.key,
						route:this.route,
						progress:this.progress
					})
				},
				function(error, response, body){
					if (error) {
						console.log(error); // TODO: select another server from serverList in case of error
					} else if (body.serverOfRoute !== this.routeServer) {
						// the server was not the one handling route,
						// update server address and send the data there
						this.routeServer = body.serverOfRoute;
						this.sendData();
					}
				}.bind(this)
			);
		},
		stop: function() {
			clearInterval(this.interval);
		},
		start: function(delay = 60000) {
			this.stop();
			this.interval = setInterval(this.sendData.bind(this), delay);
		}
	}
}