const Event = require('../Event.js');

const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));

require('dotenv').config();
const { token, clientId, guildId } = process.env;

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const fetch = require('node-superfetch');
const cheerio = require('cheerio');

module.exports = class Util {

	constructor(client) {
		this.client = client;
	}

	get directory() {
		return `${path.dirname(require.main.filename)}${path.sep}`;
	}

	async sleep(ms) {
		if (typeof ms !== 'number') return new TypeError('ms must be a number');
		return await new Promise(resolve => setTimeout(resolve, ms));
	}

	shuffle(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	async fetchHtmlContent(url) {
		const { body } = await fetch.get(url);
		return cheerio.load(body);
	}

	async loadSlashCommands() {
		const slashCommandArray = [];

		const commands = await glob(`${this.directory.replace(/\\/g, '/')}slashcommands/**/*.js`);

		for (const commandFile of commands) {
			const command = require(commandFile);
			slashCommandArray.push(command.data.toJSON());

			this.client.slashCommands.set(command.data.name, command);
		}

		const rest = new REST({ version: '9' }).setToken(token);

		await this.registerSlashCommands(rest, slashCommandArray);
	}

	async registerSlashCommands(rest, slashCommandArray) {
		try {
			if (guildId) {
				await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: slashCommandArray });
			} else {
				await rest.put(Routes.applicationCommands(clientId), { body: slashCommandArray });
			}
		} catch (error) {
			if (error) return console.error(error);
		}

		return console.log(`Registered ${slashCommandArray.length} Slashcommands.`);
	}

	async clearSlashCommands() {
		const rest = new REST({ version: '9' }).setToken(token);

		rest.get(Routes.applicationCommands(clientId)).then(data => {
			const promises = [];

			for (const command of data) {
				const deleteUrl = `${Routes.applicationCommands(clientId)}/${command.id}`;
				promises.push(rest.delete(deleteUrl));
			}

			return Promise.all(promises);
		});
	}

	async loadEvents() {
		const events = await glob(`${this.directory.replace(/\\/g, '/')}events/*.js`);

		for (const file of events) {
			delete require.cache[file];

			const { name } = path.parse(file);
			const EventFile = require(file);
			const event = new EventFile(this.client, name);

			if (!(event instanceof Event)) throw new TypeError(`Event ${name} doesn't belong in Events`);

			this.client.events.set(event.name, event);
			event.emitter[event.type](name, (...args) => event.run(...args));
		}
	}

};
