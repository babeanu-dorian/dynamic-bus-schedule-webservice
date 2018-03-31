const SELF_IDENTIFIER = -1;
const httpAddress = require('./utility/http_address');
const socket_address_list = require('./utility/socket_address_list');

var net = require('net');
	JsonSocket = require('json-socket');

function broadcast(socketMap, message) {
	for(let s in socketMap) {
		if(socketMap[s] !== SELF_IDENTIFIER) {
			socketMap[s].sendMessage(message);
		}
	}
}

function socketProtocol(socket, serverData) {
	//TODO :: check if it already is in the map
	socket.on('close', function() {
		//TODO :: Find socket in socket map and remove it.
        console.log('Connection closed on socket');
        //TODO :: Redistribute load
	});
	socket.on('message', function(data) {
		if (data.success === false) {
			console.log('Failed: ' + data.error);
		} else {
			console.log("Message received from " + data.host + ':' + data.socketPort);
			if(serverData.socketMap[data.host + ':' + data.socketPort] == undefined) {
				console.log("Adding Socket  " + data.host + ':' + data.socketPort);
				serverData.socketMap[data.host + ':' + data.socketPort] =  socket;
			}
	      	if(data.command === 'initialize'){
	      		console.log("Address List " + data.socketAddressList);
	      		serverData.mapRouteServer = data.appData.mapRouteServer;
				serverData.stationRoutes = data.appData.stationRoutes;
				serverData.routeStations = data.routeStations;
				serverData.appData = data.appData;

				for(let i = 0; i < data.socketAddressList.length; ++i) {
					let address = data.socketAddressList[i].split(':');
					if(serverData.socketMap[data.socketAddressList[i]] == undefined) {
						serverData.socketMap[data.socketAddressList[i]] = new JsonSocket(new net.Socket());
						console.log('Address ' + data.socketAddressList[i]);
						serverData.socketMap[data.socketAddressList[i]].connect(address[1], address[0], function() {
							console.log('Established Connection with ' + address[1]);
							serverData.socketMap[data.socketAddressList[i]].sendMessage({
												command : 'hello',
					      						host : serverData.address,
						    					httpPort : serverData.httpPort,
					    						socketPort : serverData.socketPort });
					      	socketProtocol(serverData.socketMap[data.socketAddressList[i]], serverData);
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
		}
	});
}

/** 
 * This section sets up a socket server on the server's port + 1000.
**/
function init_socketServer(sockets, serverData){
	serverData.socketMap = {};
	serverData.socketMap[serverData.address + ':' + serverData.socketPort] = SELF_IDENTIFIER; //ensure yourself is in the list

	sockets.netServer = net.createServer(function(socket) {
		console.log('Client Connected');
		socket = new JsonSocket(socket); //decorate net.Socket as JSONSocket
		socketProtocol(socket, serverData);
	});
	sockets.netServer.listen(serverData.socketPort, serverData.address, function() {
		serverData.socketPort = sockets.netServer.address().port;
		console.log("This socketPort is " + serverData.socketPort);
	});
	console.log('Socket Server Initialized');
	if(process.env.SPAWN){
		let socket = new JsonSocket(new net.Socket());
	  	socket.connect(process.env.SPAWN, serverData.address, function() {
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