const SELF_IDENTIFIER = -1;
const httpAddress = require('./utility/http_address');
const socket_address_list = require('./utility/socket_address_list');

var net = require('net');
	JsonSocket = require('json-socket');
/*
 *  serverData.routeStations;
 */
function updateOtherServers(serverData){
	let batch = [];
	for(var r in serverData.routeStations) {
		if(serverData.mapRouteServer[r] === httpAddress(serverData.address, serverData.httpPort)) {
			for(var s in serverData.routeStations[r].stations) {
				let currentStation = {
					delay : s.delay,
					buses : s.buses
				}
				batch[r] = currentStation;
			}
		}
	}

	let message = {
		command : 'updateRouteStations',
		host : serverData.address,
		httpPort : serverData.httpPort,
		socketPort : serverData.socketPort,
		payload : batch

	}
	broadcast(serverData.socketMap, message);
	serverData.overLoadCheck();
}	

function broadcast(socketMap, message) {
	for(let s in socketMap) {
		if(socketMap[s].socket !== SELF_IDENTIFIER) {
			socketMap[s].socket.sendMessage(message);
		}
	}
}

function socketProtocol(socket, serverData) {
	//TODO :: check if it already is in the map
	socket.on('close', function() {
        console.log('Connection closed on socket');
        //Removes closed socket from socketMap
        console.log(serverData.socketMap);
        let deadAddress;
        for ( let s in serverData.socketMap ) {
        	if ( serverData.socketMap[s].socket === socket ) {
        		console.log("DEAD ADDRESS SET");
        		deadAddress = serverData.socketMap[s].httpAddress;

        		delete serverData.socketMap[s];
        	}
        }
        //TODO :: Ensure mapRouteServer is equal on all servers
        //TODO :: Redistribute load
        for ( let r in serverData.mapRouteServer ) { 
        	if(serverData.mapRouteServer[r] !== deadAddress ) {
        		if( serverData.mapRouteServer[r] === httpAddress(serverData.address, serverData.httpPort) ) {
        			//TODO :: MAKE THIS IN A FUNCTION
        			for( let route in serverData.mapRouteServer ) {
        				//console.log("DEAD ADDRESS SET TO" + deadAddress);
        				if (serverData.mapRouteServer[route] === deadAddress) {
        					//console.log("DEAD ADDRESS FOUND");
        					serverData.mapRouteServer[route] = httpAddress(serverData.address, serverData.httpPort);
        				}
        			}
        			let message = {
						command : "updateServerMap",
						host : serverData.address,
						httpPort : serverData.httpPort,
						socketPort : serverData.socketPort,
						mapRouteServer : serverData.mapRouteServer
					}
					broadcast(serverData.socketMap, message);
			    }
        		break;
        	}
        }
	});
	socket.on('message', function(data) {
		if (data.success === false) {
			console.log('Failed: ' + data.error);
		} else {
			//TODO :: httpAddress in socketMap undefined
			console.log("Message received from " + data.host + ':' + data.socketPort);
			if(serverData.socketMap[data.host + ':' + data.socketPort] == undefined) {
				console.log("Adding Socket  " + data.host + ':' + data.socketPort);
				serverData.socketMap[data.host + ':' + data.socketPort] =  {
																socket : socket,
																httpAddress : httpAddress(data.host, data.httpPort)
															};
			}
	      	if(data.command === 'initialize'){
	      		console.log("Address List " + data.socketAddressList);
	      		serverData.mapRouteServer = data.appData.mapRouteServer;
				serverData.stationRoutes = data.appData.stationRoutes;
				serverData.routeStations = data.routeStations;
				serverData.appData = data.appData;

				//Connects to all servers in socketMap
				console.log( data.socketAddressList);
				for(let i = 0; i < data.socketAddressList.length; ++i) {
					let address = data.socketAddressList[i].socketAddress.split(':');

					if(serverData.socketMap[data.socketAddressList[i].socketAddress] == undefined) {
						serverData.socketMap[data.socketAddressList[i].socketAddress] = {
																			socket : new JsonSocket(new net.Socket()),
																			httpAddress : data.socketAddressList[i].httpAddress
																		}

						console.log('Address ' + data.socketAddressList[i].socketAddress);

						serverData.socketMap[data.socketAddressList[i].socketAddress].socket.connect(address[1], address[0], function() {
							console.log('Established Connection with ' + address[1]);

							serverData.socketMap[data.socketAddressList[i].socketAddress].socket.sendMessage({
												command : 'hello',
					      						host : serverData.address,
						    					httpPort : serverData.httpPort,
					    						socketPort : serverData.socketPort });

					      	socketProtocol(serverData.socketMap[data.socketAddressList[i].socketAddress].socket, serverData);
					  	});
					}
				}
	      		console.log('initialize');
	      	}
	      	if(data.command === 'requestWork'){
	      		serverData.splitLoad(httpAddress(data.host, data.httpPort), broadcast.bind( null,
	      							serverData.socketMap, 
	      							{ command : "updateServerMap",
		    						host : serverData.address,
		    						httpPort : serverData.httpPort,
		    						socketPort : serverData.socketPort,
									mapRouteServer : serverData.mapRouteServer})
	      		);
	      		console.log(serverData.mapRouteServer);
			    console.log('requestWork');
		    }
		    if(data.command === 'requestData') {
	      		socket.sendMessage({ command : "initialize",
		    						host : serverData.address,
		    						httpPort : serverData.httpPort,
		    						socketPort : serverData.socketPort,
									appData : serverData.appData,
									routeStations : serverData.routeStations, 
									socketAddressList : socket_address_list(serverData.socketMap)});
	      		console.log('requestData');
		    }
		    if(data.command === 'hello') {
		    	console.log("Server established Socket");
		    }
		    if(data.command === 'updateServerMap') {
	      		serverData.setMapRouteServer(data.mapRouteServer);
		    }
		    if(data.command === 'updateRouteStations') {
		    	serverData.unionRouteStations(data.payload);
		    }
		}
	});
}

/** 
 * This section sets up a socket server on the server's port + 1000.
**/
function init_socketServer(sockets, serverData){
	serverData.socketMap = {};
	 //ensure yourself is in the list
	sockets.netServer = net.createServer(function(socket) {
		console.log('Client Connected');
		socket = new JsonSocket(socket); //decorate net.Socket as JSONSocket
		socketProtocol(socket, serverData);
	});
	sockets.netServer.listen(serverData.socketPort, serverData.address, function() {
		serverData.socketPort = sockets.netServer.address().port;
		serverData.socketMap[serverData.address + ':' + serverData.socketPort] = {
																					socket : SELF_IDENTIFIER,
																					httpAddress : httpAddress(serverData.address, serverData.httpPort)
																				}
		console.log('To add a server to the cluster on via this server :\n export SPAWN=' 
			+  serverData.address + ':' + serverData.socketPort + '; npm start;');
		setInterval(updateOtherServers.bind(null, serverData), 5000);
	});
	console.log('Socket Server Initialized');
	if(process.env.SPAWN){
		let socket = new JsonSocket(new net.Socket());
		let socketConnection = (process.env.SPAWN).split(':');
	  	socket.connect(socketConnection[1], socketConnection[0], function() {
	      	console.log('Connected\n');
	      	socket.sendMessage({command : 'requestData',
	      						host : serverData.address,
		    					httpPort : serverData.httpPort,
	    						socketPort : serverData.socketPort }, function(err) {
	    							if(err)
	    								throw err;
	    							socket.sendMessage( {command : 'requestWork',
							      						host : serverData.address,
								    					httpPort : serverData.httpPort,
							    						socketPort : serverData.socketPort}, function(err) {
							    							if(err)
							    								throw err;
							    						});
	    							});

	      	socketProtocol(socket, serverData);

	      	console.log("Socket Connected to SPAWN server Online");
	  	});
	}
}

module.exports = {
	init:function(serverData){
		init_socketServer(this, serverData);
	}
}