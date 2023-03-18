import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentBuilder, Message, SlashCommandBuilder, StringSelectMenuBuilder,  } from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction: Message) {
		await interaction.reply({content: 'Ping'})
	},
};