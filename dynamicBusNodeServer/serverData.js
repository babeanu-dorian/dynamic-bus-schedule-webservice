var ip = require('ip');
const httpAddress = require('./utility/http_address');

//DEFINES
var MAX_LOAD = 5; //The arbitrary maximum load of routes a server can handle.

/**
 * This function has the following : 
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

/**
 * TODO :: describe this function
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
	// Initialize sockets after all serverData has been initialized.
	sockets.init(serverData);
}
/**
 * TODO :: describe this function
 */
function init_appData(serverData, sockets) {
	serverData.appData = {
		mapRouteServer: serverData.mapRouteServer,
		stationRoutes: serverData.stationRoutes
	}
	console.log("ServerMap Initialized");

	init_routeStations(serverData, sockets);
}
/**
 * TODO :: describe this function
 */
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
/**
 * TODO :: describe this function
 */
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
					serverData.mapRouteServer['r' + results[i].id] = httpAddress(serverData.address, serverData.httpPort);
				}
			}
		});
	}
	init_stationRoutes(serverData, sockets);
}

module.exports = {
	// TODO ::
	// - update the station delay in the database (table StationsOnRoute)
	// - update the expected times in the database based on the recorded times (once a day ?)
	/**
	 * Ensures necessary environment variables are set for database connection.
	 * Connects to database and sets up address and port variables in serverData.
	 */
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

		this.address = ip.address();
		this.httpPort = port;
		this.fullHttpAddress = httpAddres(this.address, this.httpPort);
		/* It is possible to set an environment port for testing purposes.  
		If it is set the socket port will be env.Port + 1000, 
		otherwise both httpPort and socketPort will be chosen as the
		 next available port because they are set to 0*/
		if(process.env.PORT)
			this.socketPort = port + 1000;
		else 	
			this.socketPort = 0;

		console.log("This address is : " + httpAddress(this.address, this.httpPort));

		init_mapRouteServer(this, sockets);
	},
	/**
	 * TODO :: describe this function
	 */
	setBusArrivalTimes:function(bus, route, progress) {
		let stationOrder = this.routeStations['r' + route].stationOrder;
		let stations = this.routeStations['r' + route].stations;
		let nextStationIdx = 0; // assumption: there's at least a station on that route

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
		count = Math.floor(count / 2);
		for(let route in this.mapRouteServer) {
			if(this.mapRouteServer[route] === httpAddress(this.address, this.httpPort)){
				this.mapRouteServer[route] = address;
				--count;
				if(count == 0) {
					break;
				}
			}
		}
		callback();
	},
	/**
	 * Updates the references to mapRouteServer on the server
	 * with the data provided in the parameter
	 */
	setMapRouteServer:function(mapRouteServer) {
		this.mapRouteServer = mapRouteServer;
		this.appData.mapRouteServer = mapRouteServer;
		console.log(this.mapRouteServer);
	},
	/**
	 * This function checks if the server is overloaded.
	 * The current implementation simply checks if this server is handling
	 * more than a value 'MAX_LOAD' routes.  It could be implemented to check
	 * any number of things in a production scenario.
	 */
	overLoadCheck:function() {
		let count = 0;
		for(let i in this.mapRouteServer) {
			if(this.mapRouteServer[i] === httpAddress(this.address, this.httpPort)) {
				++count;
			}
		}
		if (count > MAX_LOAD) {
			console.log('This Server is overloaded, spawn a new server with :\n' +
						'export SPAWN=' +  this.address + ':' + this.socketPort + '; npm start;');
		}
	},
	/**
	 * This takes the payload provided in intervals regarding
	 * bus delays and bus locations and unions them into the current
	 * working serverData.  This ensures semi-smooth transition
	 * in case of server failure.
	 */
	unionRouteStations:function(payload) {
		for(let r in payload) {
			this.routeStations[r].delay = payload[r].delay;
			this.routeStations[r].buses = payload[r].buses;
		}
		console.log('Route Stations Updated');
	}
}