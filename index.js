import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

// Create a new client instance
const client = new Client({ intents: [
	Intents.FLAGS.GUILDS,] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

import http from "node:http";

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	console.log(`Get command ${interaction}`);

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'uwu') {
		await interaction.reply('~UwU~ u have been gentle!');
	} else if (commandName === 'time') {
		await interaction.reply(`${Date()}`);
	} else if (commandName === 'ip') {
		http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, (resp) => {
			resp.on('data', function(ip) {
				console.log("public IP: " + ip);
				interaction.reply(`U ur i-i-ip is \`${ip}\` sempaii~~`);
			});
		});
	}
});

// debug
/* Emitted for general debugging information.
PARAMETER    TYPE         DESCRIPTION
info         string       The debug information    */
client.on("debug", function(info){
    console.log(`debug -> ${info}`);
});

// disconnect
/* Emitted when the client's WebSocket disconnects and will no longer attempt to reconnect.
PARAMETER    TYPE              DESCRIPTION
Event        CloseEvent        The WebSocket close event    */
client.on("disconnect", function(event){
    console.log(`The WebSocket has closed and will no longer attempt to reconnect`);
});


// error
/* Emitted whenever the client's WebSocket encounters a connection error.
PARAMETER    TYPE     DESCRIPTION
error        Error    The encountered error    */
client.on("error", function(error){
    console.error(`client's WebSocket encountered a connection error: ${error}`);
});


// ready
/* Emitted when the client becomes ready to start working.    */
client.on("ready", function(){
    console.log(`the client becomes ready to start`);
	console.log(`I am ready! Logged in as ${client.user.tag}!`);
	console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 

  	client.user.setActivity("UwU b..be..be gentle with m-mm-mee~~");
	// client.generateInvite(['SEND_MESSAGES', 'MANAGE_GUILD', 'MENTION_EVERYONE'])
	// .then(link => {
	// 	console.log(`Generated bot invite link: ${link}`);
	// 	inviteLink = link;
	// });
});

// reconnecting
/* Emitted whenever the client tries to reconnect to the WebSocket.    */
client.on("reconnecting", function(){
    console.log(`client tries to reconnect to the WebSocket`);
});

// resume
/* Emitted whenever a WebSocket resumes.
PARAMETER    TYPE          DESCRIPTION
replayed     number        The number of events that were replayed    */
client.on("resume", function(replayed){
    console.log(`whenever a WebSocket resumes, ${replayed} replays`);
});


// warn
/* Emitted for general warnings. 
PARAMETER    TYPE       DESCRIPTION
info         string     The warning   */
client.on("warn", function(info){
    console.log(`warn: ${info}`);
});

// Login to Discord with your client's token
client.login(process.env.TOKEN);