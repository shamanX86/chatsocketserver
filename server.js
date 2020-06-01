const http = require('http');
const WebSocketServer = require('websocket').server;

const httpServer = http.createServer();
const port = process.env.PORT || 8765;

try{
	httpServer.listen(port, () => {
		console.log(`Server running on port: ${port}`);
	});
} catch(err){
	console.log("[ERROR]");
	console.log("Please check if the server has permission to run on the host provided.");
	process.exit(0);
}

// creating the server
const wss = new WebSocketServer({ httpServer });
const commands = require('./commands/server');
const setUsername = require('./functions/setUsername');
const relayMessage = require('./functions/relayMessage');

// on receiving new connection request
wss.on('request', req => {
	// accept the connection
	const conn = req.accept(null, req.origin);
	// middleware - get the username from request header and attach to connection
	setUsername(req,conn);
	// log messages
	console.log(`[NETWORK] Connected to ${conn.remoteAddress}`);
	conn.sendUTF('[SERVER] Connection estabilished');
	// notify all other connections of new connection
	relayMessage(wss,`${conn.username} has joined`, true);
	// handle disconnect
	conn.on('close', (code,desc) => {
		// log message
		console.log(`[NETWORK] ${conn.remoteAddress} disconnected`);
		// notify all other connections of disconnect
		relayMessage(wss, `[${conn.username} has disconnected`, true);
	});
	// on receiving message from a connection
	conn.on('message', msg => {
		// log message
		console.log(`[MESSAGE] ${msg.utf8Data}`);
		// relay to all other connections
		relayMessage(wss, msg.utf8Data, false);
	});
});
