const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const WebSocketClient = require('websocket').client;
const client = new WebSocketClient();

let username;

const commands = {
	'/disconnect': function(conn){
		conn.close();
		console.log('Disconnected');
		process.exit(0);
	}
}

client.on('connectFailed', error => {
	console.log(`[ERROR] Error while connecting: ${error.toString()}`);
});

client.on('connect', conn => {
	conn.on('error', error => {
		console.log(`[ERROR] Error in connection: ${error.toString()}`);
	});
	conn.on('close', () => {
		console.log('Disconnected');
	});
	conn.on('message', msg => {
		if(msg.type === 'utf8') console.log(msg.utf8Data);
	});
	rl.on('SIGINT', () => {
		conn.close();
		console.log('Disconnected');
		process.exit(0);
	});
	rl.on('line', data => {
		if(commands.hasOwnProperty(data)) commands[data](conn);
		else conn.send(`[${username}] ${data}`);
	});	
});


rl.question('Enter a nickname: ', answer => {
	username = answer || (`user${Math.floor(Math.random() * 100)}`);
	let context = process.argv[2] || 'heroku';
	let url;
	switch(context){
		case 'heroku':
			url = 'ws://chatsocketserver.herokuapp.com/';
			break;
		default :
			url = `ws://${context}:8765`;
			break;
	}
	client.connect(url);
});


