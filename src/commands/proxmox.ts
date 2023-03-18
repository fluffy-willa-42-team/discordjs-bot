import { ActionRowBuilder, BaseInteraction, CommandInteraction, Interaction, Message, SlashCommandBuilder, StringSelectMenuBuilder,  } from 'discord.js';

import { bot } from '../index';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('proxmox')
		.setDescription('Manage dev VM'),
	async execute(interaction: CommandInteraction) {
		
		const nodes : Array<any> = await bot.getProxNodes();
		const options = nodes.map(({ node }) => {
			return {label: node, value: node}
		})

		const row: ActionRowBuilder<any> = new ActionRowBuilder()
		.addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('selectNodeToManage')
				.setPlaceholder('Nothing selected')
				.addOptions(options),
		);
		await interaction.reply({ content: 'Select the node to manage', components: [row] });
	},
};