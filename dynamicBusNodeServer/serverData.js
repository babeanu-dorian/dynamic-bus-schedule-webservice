var ip = require('ip');
const httpAddress = require('./utility/http_address');

/**
 * members :
 *	database
 *  mapRouteServer
 *  stationRoutes
 *  appData
 *  routeStations
 *  address
 *  httpPort
 *  socketPort
 *  socketMap
 */

function init_routeStations(serverData, sockets) {
	// TODO: take current month and time of day into account, instead of 0
	serverData.database.query('SELECT StationsOnRoute.Route AS route, StationsOnRoute.Station AS station, StationsOnRoute.Location AS location, StationsOnRoute.CurrentDelay AS delay, ExpectedTimes.Duration AS duration FROM StationsOnRoute INNER JOIN ExpectedTimes ON StationsOnRoute.Route = ExpectedTimes.Route AND StationsOnRoute.Station = ExpectedTimes.Station AND ExpectedTimes.Hour = 0 AND ExpectedTimes.Month = 0 ORDER BY route, location',
		function (error, results, fields) {
			serverData.routeStations = {};
			if (error) {
				console.log(error);
			} else {
				for (let i = 0; i != results.length; ++i) {
					if (typeof serverData.routeStations['r' + results[i].route] === 'undefined') {
						serverData.routeStations['r' + results[i].route] = {stationOrder:[], stations:{}};
					}
					serverData.routeStations['r' + results[i].route].stationOrder.push(results[i].station);
					serverData.routeStations['r' + results[i].route].stations['s' + results[i].station] = {
						location:results[i].location,
						duration:results[i].duration,
						delay:results[i].delay,
						buses:{}
					};
				}
				serverData.database.query('SELECT Id AS id, Route AS route FROM Buses', function (error, results, fields) {
					if (error) {
						console.log(error);
					} else {
						for (let i = 0; i != results.length; ++i) {
							serverData.setBusArrivalTimes(results[i].id, results[i].route, 0.0);
						}
					}
				});
			}
		}
	);
	sockets.init(serverData);
}

function init_appData(serverData, sockets) {
	serverData.appData = {
		mapRouteServer: serverData.mapRouteServer,
		stationRoutes: serverData.stationRoutes
	}
	console.log("ServerMap Initialized");

	init_routeStations(serverData, sockets);
}

function init_stationRoutes(serverData, sockets) {
	serverData.database.query('SELECT Stations.Id AS id, Stations.Name AS name, StationsOnRoute.Route AS route FROM Stations INNER JOIN StationsOnRoute ON Stations.Id = StationsOnRoute.Station ORDER BY id', 
		function (error, results, fields) {
			serverData.stationRoutes = [];
			if (error) {
				console.log(error);
			}
			else {
				let station = {};
				for (let i = 0; i != results.length; ++i) {
					//console.log(station);
					if (station.id === results[i].id) {
						station.routes.push(results[i].route);
					} else {
						if (typeof station.id !== 'undefined')
							serverData.stationRoutes.push(station);
						station = {
							id:results[i].id,
							name:results[i].name,
							routes:[results[i].route]
						};
					}
				}
				if (typeof station.id !== 'undefined')
					serverData.stationRoutes.push(station);
			}
			init_appData(serverData, sockets);
		}
	);
}

function init_mapRouteServer(serverData, sockets) {
	// setup route to server map
	serverData.mapRouteServer = {};
	if(!process.env.SPAWN){
		serverData.database.query('SELECT Id AS id FROM Routes', function (error, results, fields) {	
			if (error) {
				console.log(error);
			}
			else {
				for (let i = 0; i != results.length; ++i) {
					serverData.mapRouteServer['r' + results[i].id] = 'http://' + serverData.address + ':' + serverData.httpPort + '/';
				}
			}
		});
	}
	init_stationRoutes(serverData, sockets);
}

function unionObjects (obj1, obj2) {
	for(var i in obj2) {
		obj1[i] = obj2[i];
	}
}

module.exports = {
	// TODO: use setInterval to schedule these actions:
	// - update station delay from individual bus delays
	//   (keep in mind that the bus delays per station are relative to the station delay)
	// - update the station delay in the database (table StationsOnRoute)
	// - update the expected times in the database based on the recorded times (once a day ?)
	init:function(port, sockets) {
		if (!process.env.MY_SQL_USER) {
			console.log('Environment variable MY_SQL_USER not set, abort');
			process.exit();
		}
		if (!process.env.MY_SQL_PASS) {
			console.log('Environment variable MY_SQL_PASS not set, abort');
			process.exit();
		}

		// setup database connection
		this.database = require('mysql').createConnection({
			host: 'localhost',
			user: process.env.MY_SQL_USER,
			password: process.env.MY_SQL_PASS,
			database: 'DynamicBusSchedulingServer'
		});

		//this.address = 'http://' + ip.address() + ':' + port + '/';
		this.address = '127.0.0.1';
		this.httpPort = port;
		this.socketPort = port + 1000;

		init_mapRouteServer(this, sockets);
	},
	setBusArrivalTimes:function(bus, route, progress) {
		let stationOrder = this.routeStations['r' + route].stationOrder;
		let stations = this.routeStations['r' + route].stations;
		let nextStationIdx = 0; // assumpton: there's at least a station on that route

		// find the next station for the bus
		for (let i = 1; i != stationOrder.length; ++i) {
			if (stations['s' + stationOrder[i]].location > progress) {
				nextStationIdx = i;
				break;
			}
		}

		let prevStationIdx = (nextStationIdx ? nextStationIdx - 1 : stationOrder.length - 1);
		let distance = (nextStationIdx ?
			            stations['s' + stationOrder[nextStationIdx]].location - stations['s' + stationOrder[prevStationIdx]].location
			            : 1.0 - stations['s' + stationOrder[prevStationIdx]].location);

		// starts with a negative value to amount for the portion already traveled
		let prevStationTime = (stations['s' + stationOrder[prevStationIdx]].location - progress) * stations['s' + stationOrder[nextStationIdx]].duration / distance;

		// set the bus' arrival time and delay for each station on the route
		for (let i = 0; i != stationOrder.length; ++i) {
			let station = stations['s' + stationOrder[(nextStationIdx + i) % stationOrder.length]];
			let arrivalTime = prevStationTime + station.duration + station.delay;
			if (typeof station.buses['b' + bus] === 'undefined') {
				station.buses['b' + bus] = {
					arrivalTime:arrivalTime,
					delay:0
				};
			} else {
				station.buses['b' + bus].delay = arrivalTime - station.buses['b' + bus].arrivalTime;
				station.buses['b' + bus].arrivalTime = arrivalTime;
			}
			prevStationTime = arrivalTime;
		}
	},
	/**
	 * Splits the load of routes handled by this server in half
	 * and assigns them to the address provided in the parameters
	 */
	splitLoad:function(address, callback) {
		let count = 0;

		for(let route in this.mapRouteServer) {
			if(this.mapRouteServer[route] === httpAddress(this.address, this.httpPort)){
				++count;
			}
		}
		count /= 2;
		for(let route in this.mapRouteServer) {
			if(this.mapRouteServer[route] === httpAddress(this.address, this.httpPort)){
				this.mapRouteServer[route] = address;
				console.log(address);
				--count;
				if(count == 0) {
					break;
				}
			}
		}
		callback();
	}
}