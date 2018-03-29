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

/** 
 * This sets up a socket connection to another server if a SPAWN server is specified.
**/
function init_socketConnection(sockets, serverData){
  	sockets.client = new JsonSocket(new net.Socket());
  	sockets.client.connect(process.env.SPAWN, '127.0.0.1', function() {
      	console.log('Connected\n');
      	sockets.client.sendMessage({message : 'Requesting send ServerMap', 
				    		host: sockets.netServer.address().address,
				    		port: sockets.netServer.address().port, 
				    		payload: 'myInfo'});
  	});

    sockets.client.on('message', function(data) {
      	console.log('Received: ' + data.message);
      	console.log('Address: ' + data.host);
      	console.log('Port: ' + data.port);
      	console.log('Payload: ' + data.payload);

      	if(data.command == "loadList"){
      		serverData.updateServerMap(serverData, data.payload);
      	}
	});

	sockets.client.on('close', function() {
        console.log('Connection closed');
	});
	console.log("Socket Connected to SPAWN server Online");
}

/** 
 * This section sets up a socket server on the server's port + 1000.
**/
function init_socketServer(sockets, serverData){
	sockets.netServer = net.createServer(function(socket) {
		console.log('Client Connected');
		var socket = new JsonSocket(socket); //decorate net.Socket as JSONSocket

		socket.on('end', function() {
	    	console.log('Client Disconnected');
	  	});

	  	socket.on('message', function (data) {
	    	console.log('Received: ' + data.message);
	    	console.log('Address: ' + data.host);
	    	console.log('Port: ' + data.port);
	    	socket.sendMessage({message : 'Data Sent', 
	      						host: sockets.netServer.address().address, 
	      						port: sockets.netServer.address().port, 
	      						command : "loadList",
	      						payload: serverData.mapRouteServer});
	  	});
	});
	sockets.netServer.listen(normalizeValue(process.env.PORT) + 1000, '127.0.0.1');
	console.log("Socket Server Initialized");
	if(process.env.SPAWN){
		init_socketConnection(sockets, serverData);
	}
}

module.exports = {
	init:function(serverData){
		init_socketServer(this, serverData);
	}
}