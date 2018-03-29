var net = require('net');
	JsonSocket = require('json-socket');

/**
 * Normalize a value into a number, string, or false.
 */
function normalizeValue(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function socketProtocol(socket, socketMap, serverData){
	//TODO :: check if it already is in the map
	console.log("Socket ID " + socket._socket.address().address + ':' + socket._socket.address().port);
	console.log("Local " + socket._socket.localAddress + ':' + socket._socket.localPort);
	console.log("Remote " + socket._socket.remoteAddress + ':' + socket._socket.remotePort);
	//socketMap[socket._socket.address().address + socket._socket.address().port] = socket;

	socket.on('close', function() {
        console.log('Connection closed on socket');
        socketMap[socket.localAddress + socket.localPort] = undefined;
	});
	socket.on('message', function(data) {
      	console.log(data.payload);

      	if(data.command === 'loadList'){
      		serverData.updateServerMap(serverData, data.payload);
      		console.log('loadList');
      	}
      	if(data.command === 'requestMap'){
	    	socket.sendMessage({command : "loadList",
								payload: serverData.mapRouteServer});
		    console.log('requestMap');
	    }
	});
}

/** 
 * This sets up a socket connection to another server if a SPAWN server is specified.
**/
function init_socketConnection(sockets, serverData, host, port){
  	let socket = new JsonSocket(new net.Socket());
  	socket.connect(port, host, function() {
      	console.log('Connected\n');
      	socket.sendMessage({command : 'requestMap',
				    		payload: 'myInfo'});
      	socketProtocol(socket, sockets.socketMap, serverData);
      	console.log("Socket Connected to SPAWN server Online");
  	});
}

/** 
 * This section sets up a socket server on the server's port + 1000.
**/
function init_socketServer(sockets, serverData){
	sockets.socketMap = {};
	sockets.netServer = net.createServer(function(socket) {
		console.log('Client Connected');
		socket = new JsonSocket(socket); //decorate net.Socket as JSONSocket
		socketProtocol(socket, sockets.socketMap, serverData);
	});
	sockets.netServer.listen(normalizeValue(process.env.PORT) + 1000, '127.0.0.1');
	console.log('Socket Server Initialized');
	if(process.env.SPAWN){
		init_socketConnection(sockets, serverData, '127.0.0.1', process.env.SPAWN, );
	}
}

module.exports = {
	init:function(serverData){
		init_socketServer(this, serverData);
	}
}