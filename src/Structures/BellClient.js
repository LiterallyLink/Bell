const { Client, Collection, GatewayIntentBits } = require('discord.js');

require('dotenv').config();
const { token } = process.env;

const Util = require('../Structures/Utilities/Util');
const Canvas = require('../Structures/Utilities/Canvas');

module.exports = class BellClient extends Client {

	constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent
			],
			allowedMentions: {
				parse: ['users']
			}
		});

		this.slashCommands = new Collection();
		this.events = new Collection();

		this.utils = new Util(this);
		this.canvas = new Canvas(this);
	}

	async start() {
		await this.utils.loadSlashCommands();

		this.utils.loadEvents();

		await super.login(token);
	}

};
