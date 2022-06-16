/**
 * Will set all command for the slash integration.
 * Only run once to set the stuff, usless to run eatch time.
 */

import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import dotenv from 'dotenv';

dotenv.config();

const commands = [
	new SlashCommandBuilder().setName('uwu').setDescription('Be gentle with me ~UwU~'),
	new SlashCommandBuilder().setName('ping').setDescription('Dont !'),
	new SlashCommandBuilder().setName('time').setDescription('Get current date'),
	new SlashCommandBuilder().setName('ip').setDescription('Get home IP'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENTID, process.env.GUILDID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);