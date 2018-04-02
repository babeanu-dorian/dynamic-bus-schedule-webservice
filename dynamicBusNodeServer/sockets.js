const SELF_IDENTIFIER = -1;
const httpAddress = require('./utility/http_address');
const socket_address_list = require('./utility/socket_address_list');

var net = require('net');
	JsonSocket = require('json-socket');
//DEFINES
var INTERVAL = 5000; //Defines an interval in milliseconds

/*
 * Connects the server to the cluster by requesting data 
 * to fill its volatile memory and
 * then requesting a split of routes to handle.
 */
function connectToCluster(serverData){
	let socket = new JsonSocket(new net.Socket());
	let socketConnection = (process.env.SPAWN).split(':');
  	socket.connect(socketConnection[1], socketConnection[0], function() {
      	socket.sendMessage( { 
      		command : 'requestData',
			host : serverData.address,
			httpPort : serverData.httpPort,
			socketPort : serverData.socketPort }, function(err) {
				if(err)
					throw err;
				socket.sendMessage( { 
					command : 'requestWork',
						host : serverData.address,
					httpPort : serverData.httpPort,
					socketPort : serverData.socketPort}, function(err) {
						if(err)
							throw err;
				});
			});

      	socketProtocol(socket, serverData);
  	});
}
/**
 * Makes a batch of data that is the relevant data to running a route and sends it
 * to all other servers such that they may take over that route in case of failure.
 */
function updateOtherServers(serverData){
	let batch = [];
	for(var r in serverData.routeStations) {
		if(serverData.mapRouteServer[r] === serverData.fullHttpAddress) {
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
/**
 * Broadcasts a message to all servers in the socketMap
 */
function broadcast(socketMap, message) {
	for(let s in socketMap) {
		if(socketMap[s].socket !== SELF_IDENTIFIER) {
			socketMap[s].socket.sendMessage(message);
		}
	}
}
/**
 * TODO :: describe this function
 */
function handleConnectionClose(socket, serverData){
	let deadAddress;
    for ( let s in serverData.socketMap ) {
    	if ( serverData.socketMap[s].socket === socket ) {
    		deadAddress = serverData.socketMap[s].httpAddress;
    		delete serverData.socketMap[s];
    	}
    }
    for ( let r in serverData.mapRouteServer ) { 
    	if(serverData.mapRouteServer[r] !== deadAddress ) {
    		if( serverData.mapRouteServer[r] === serverData.fullHttpAddress ) {
    			for( let route in serverData.mapRouteServer ) {
    				if (serverData.mapRouteServer[route] === deadAddress) {
    					serverData.mapRouteServer[route] = serverData.fullHttpAddress;
    				}
    			}
				broadcast(serverData.socketMap, {
					command : "updateServerMap",
					host : serverData.address,
					httpPort : serverData.httpPort,
					socketPort : serverData.socketPort,
					mapRouteServer : serverData.mapRouteServer
				});
		    }
    		break;
    	}
    }
}
/**
 * For an action on a socket, checks if the socket has already been added to the socketMap
 * Then, takes action based on the command that was sent with the message on the socket. 
 * If the action was close, handles the close closed connection.
 */
function socketProtocol(socket, serverData) {
	socket.on('close', function() {
        console.log('Connection closed on socket');
        handleConnectionClose(socket, serverData);
	});
	socket.on('message', function(data) {
		if (data.success === false) {
			console.log('Failed: ' + data.error);
		} 
		else {
			console.log("Message received from " + data.host + ':' + data.socketPort);
			if(serverData.socketMap[data.host + ':' + data.socketPort] == undefined) {
				serverData.socketMap[data.host + ':' + data.socketPort] =  {
					socket : socket,
					httpAddress : httpAddress(data.host, data.httpPort)
				};
			}

			switch(data.command) {
				case 'initialize' : 
		      		handleInitialize(socket, serverData, data);
		      		break;
	      		case 'requestWork' :
	      			handleWorkRequest(socket, serverData, httpAddress( data.host, data.httpPort ));
	      			break;
			    case'requestData' :
	      			handleDataRequest(socket, serverData);
	      			break;
		    	case 'establishConnection' :
		    		console.log("Server established Socket");
		    		break;
		    	case 'updateServerMap' :
	      			serverData.setMapRouteServer(data.mapRouteServer);
	      			break;
		    	case 'updateRouteStations' :
		    		serverData.unionRouteStations(data.payload);
		    		break;
		    }
		}
	});
}
/**
 * Handles data sent from another server for the purpose of intializing this server
 * In addition to setting all the data in this server, it also tries to connect to all
 * the servers provided in the socketAddressList and make socket connections with them.
 */
function handleInitialize(socket, serverData, data){
	serverData.mapRouteServer = data.appData.mapRouteServer;
	serverData.stationRoutes = data.appData.stationRoutes;
	serverData.routeStations = data.routeStations;
	serverData.appData = data.appData;

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
					command : 'establishConnection',
					host : serverData.address,
					httpPort : serverData.httpPort,
					socketPort : serverData.socketPort
				});
		      	socketProtocol(serverData.socketMap[data.socketAddressList[i].socketAddress].socket, serverData);
		  	});
		}
	}
}
/**
 * Handles a request for data from another server and sends
 * that server data such that it can intialize itself
 */
function handleDataRequest(socket, serverData){
	socket.sendMessage({ 
		command : "initialize",
		host : serverData.address,
		httpPort : serverData.httpPort,
		socketPort : serverData.socketPort,
		appData : serverData.appData,
		routeStations : serverData.routeStations, 
		socketAddressList : socket_address_list(serverData.socketMap)
	});
}
/**
 * Splits the load equally in the mapRouteserver between 
 * this server and the server specified in httpAddress
 */
function handleWorkRequest(socket, serverData, httpAddress){
	serverData.splitLoad( httpAddress, broadcast.bind( null, serverData.socketMap, { 
		command : "updateServerMap",
		host : serverData.address,
		httpPort : serverData.httpPort,
		socketPort : serverData.socketPort,
		mapRouteServer : serverData.mapRouteServer})
	);
	console.log(serverData.mapRouteServer);
}

/** 
 * This function initalizes a socket server on the defined socketPort
 * or the next available port.  
**/
function init_socketServer(sockets, serverData){
	serverData.socketMap = {};
	 //ensure this server is in the list
	sockets.netServer = net.createServer(function(socket) {
		console.log('Client Connected');
		socket = new JsonSocket(socket); //decorate net.Socket as JSONSocket
		socketProtocol(socket, serverData);
	});

	sockets.netServer.listen(serverData.socketPort, serverData.address, function() {
		serverData.socketPort = sockets.netServer.address().port;
		serverData.socketMap[serverData.address + ':' + serverData.socketPort] = {
			socket : SELF_IDENTIFIER,
			httpAddress : serverData.fullHttpAddress
		}
		console.log('To add a server to the cluster on via this server :\n export SPAWN=' 
			+  serverData.address + ':' + serverData.socketPort + '; npm start;');
		setInterval(updateOtherServers.bind(null, serverData), INTERVAL);
	});
	//If a SPAWN server has been specified, connect to it.
	if(process.env.SPAWN){
		connectToCluster(serverData);
	}
}

module.exports = {
	init:function(serverData){
		init_socketServer(this, serverData);
	}
}