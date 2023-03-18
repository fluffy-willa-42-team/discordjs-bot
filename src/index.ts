import { readFileSync, readdirSync } from "fs";
import {parse} from 'yaml';
import { join } from "path";
import axios from "axios";
import {ActionRowBuilder, BaseInteraction, ButtonBuilder, ButtonStyle, Client, Collection, CommandInteraction, Component, Events, GatewayIntentBits, Message, StringSelectMenuBuilder} from "discord.js"

export class DevBot {

	private config: any;

	private async loadConfig () : Promise<void> {
		try {
			const file = readFileSync(join(__dirname, 'config.yml'), 'utf8');
			this.config = parse(file);
		} catch (error) {
			console.log(error);
		}
		console.log(`[INFO] config load: `, this.config);
	}

	private async testProxmoxConnection(): Promise<void> {
		try {
			const options = {
			  method: 'GET',
			  url: `${this.config.proxmox.url}/api2/json/nodes`,
			  headers: {
				Authorization: `PVEAPIToken=${this.config.proxmox.tokenID}=${this.config.proxmox.secret}`
			  }
			};
			
			axios.request(options)
			.then((response) => {
				const data: Array<any> = response.data.data;
				const nodes = data.map(({ node }) => node)
			  console.log("Connected to proxmox api", nodes);
			})
			.catch(function (error) {
			  console.error("Connection faild to proxmox api", error.response.status, error.response.statusText);
			});
		} catch (error) {
			console.log(error);
			process.exit(0);
		}
		return;
	}

	async getProxNodes () : Promise<any> {
		try {
			const options = {
			  method: 'GET',
			  url: `${this.config.proxmox.url}/api2/json/nodes`,
			  headers: {
				Authorization: `PVEAPIToken=${this.config.proxmox.tokenID}=${this.config.proxmox.secret}`
			  }
			};
			
			return await axios.request(options)
			.then((response) => {
				const data: Array<any> = response.data.data;
				return data;
			})
			.catch(function (error) {
				console.error("Connection faild to proxmox api", error.response.status, error.response.statusText);
			});
		} catch (error) {
			console.log(error);
		}
		return;
	}


	async getProxQemu (node: string) : Promise<any> {
		try {
			const options = {
			  method: 'GET',
			  url: `${this.config.proxmox.url}/api2/json/nodes/${node}/qemu`,
			  headers: {
				Authorization: `PVEAPIToken=${this.config.proxmox.tokenID}=${this.config.proxmox.secret}`
			  }
			};
			
			return await axios.request(options)
			.then((response) => {
				const data: Array<any> = response.data.data;
				return data;
			})
			.catch(function (error) {
				console.error("Connection faild to proxmox api", error.response.status, error.response.statusText);
			});
		} catch (error) {
			console.log(error);
		}
		return;
	}


	async wolProxNode (node: string) : Promise<any> {
		try {
			const options = {
			  method: 'POST',
			  url: `${this.config.proxmox.url}/api2/json/nodes/${node}/wakeonlan`,
			  headers: {
				Authorization: `PVEAPIToken=${this.config.proxmox.tokenID}=${this.config.proxmox.secret}`
			  }
			};
			
			return await axios.request(options)
			.then((response) => {
				return 'OK';
			})
			.catch(function (error) {
				console.error("Connection faild to proxmox api", error.response.status, error.response.statusText);
				return error;
			});
		} catch (error) {
			console.log(error);
			return error;
		}
		return;
	}

	private discordClient: any;

	private async connectDiscord () : Promise<void> {

		this.discordClient = new Client({ intents: [GatewayIntentBits.Guilds] });
		this.discordClient.commands = new Collection();


		this.discordClient.once(Events.ClientReady, (c: { user: { tag: any; }; }) => {
			console.log(`Ready! Logged in as ${c.user.tag}`);
		});

		await this.discordClient.login(this.config.discordBot.TOKEN);

		const commandsPath = join(__dirname, 'commands');
		const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		
		for (const file of commandFiles) {
			const filePath = join(commandsPath, file);
			const command = require(filePath);
			// Set a new item in the Collection with the key as the command name and the value as the exported module
			if ('data' in command && 'execute' in command) {
				console.log(`[INFO] The command ${command.data.name} is set`)
				this.discordClient. commands.set(command.data.name, command);
			} else {
				console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		}

		this.discordClient.on(Events.InteractionCreate, async (interaction: any) => {
			if (!interaction.isChatInputCommand()) return;
			
			const command = interaction.client.commands.get(interaction.commandName);
		
			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}
			
			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
				} else {
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			}
		})

		this.discordClient.on(Events.InteractionCreate,async (interaction:any) : Promise<any> => {
			if (!interaction.isButton()) return;
			const id : string = interaction.customId;
			if (id === "abort") {
				interaction.update({ content: 'Aborted', components: [] });
				return;
			}
			if (id.startsWith("nodeWOL:")) {
				const nodeId = id.substring("nodeWOL:".length);
				const errCheck = await this.wolProxNode(nodeId);
				if (errCheck === "OK")
					interaction.update({ content: `Try to WOL ${nodeId}`, components: [] });
				else
					interaction.update({ content: `Faild to WOL ${nodeId}, ${errCheck}`, components: [] });
				return;
			}
			interaction.update({ content: 'Error', components: [] });
			return;
		})

		this.discordClient.on(Events.InteractionCreate, async (interaction: any) => {
			if (!interaction.isStringSelectMenu()) return;
			
			if (interaction.customId === "selectNodeToManage") {
				const selected = interaction.values[0];
				const nodesData: Array<any> = await this.getProxNodes();
				const nodesArray = nodesData.map(({ node, status, id }) => ({ node, status, id }))
				const selectedNode = nodesArray.find(node => {
						if (node.node === selected)
							return node
						return null;
					});

				if (!selectedNode) {
					await interaction.update(`Error ${selectedNode} node is not reachable !`);
					return ;
				}

				if (selectedNode.status === "offline")
				{
					const startButton = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId(`nodeWOL:${selectedNode.node}`)
							.setLabel(`Try WOL ${selectedNode.node}`)
							.setStyle(ButtonStyle.Primary)
					)
					const stopButton = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId('abort')
							.setLabel('Abort')
							.setStyle(ButtonStyle.Danger)
					);
					await interaction.update({ content: `Node ${selectedNode.node} is offline`, components: [startButton, stopButton] });
				}

				const nodes : Array<any> = await bot.getProxQemu(selectedNode.node);
				const options = nodes.map((vm) => {
					return {label: vm.name, value: new Number(vm.vmid).toString()}
				})
		
				const row: ActionRowBuilder<any> = new ActionRowBuilder()
				.addComponents(
					new StringSelectMenuBuilder()
						.setCustomId('selectQemuToManage')
						.setPlaceholder('Nothing selected')
						.addOptions(options),
				);
				await interaction.update({ content: 'Select the VM to manage', components: [row] });
				return;
			}
			if (interaction.customId === "selectQemuToManage") {
				const selected = interaction.values[0];
				await interaction.update({ content: `//TODO show ${selected} status and option to start, stop and reboot`, components: [] });
				return
			}
		});

		return;
	}

	async connect () : Promise<void> {
		await this.loadConfig();
		await this.testProxmoxConnection();
		await this.connectDiscord();
		return;
	}
}


export const bot = new DevBot;

bot.connect();