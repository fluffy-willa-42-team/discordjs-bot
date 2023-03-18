import { REST, Routes } from 'discord.js';
import { readFileSync, readdirSync } from "fs";
import {parse} from 'yaml';
import { join } from "path";
const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

let config;

try {
	const file = readFileSync(join(__dirname, 'config.yml'), 'utf8');
	config = parse(file);
} catch (error) {
	console.log(error);
}
console.log(`[INFO] config load: `, config);

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(config.discordBot.TOKEN);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data: any = await rest.put(
			Routes.applicationGuildCommands(config.discordBot.APPLICATION_ID, config.discordBot.GUILD_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();