const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('snail-race')
		.setDescription('Bet on which snail will reach the finish line first.'),
	async run({ client, application }) {
		const totalRacers = 5;
		const trackLength = 5;

		const racetrack = this.generateRacetrack(totalRacers, trackLength);

		const raceEmbed = new EmbedBuilder()
			.setTitle('Ready. . .')
			.setDescription(racetrack.join(''))
			.setColor('Red');
		const raceMessage = await application.followUp({ embeds: [raceEmbed] });

		const startingEmbedColors = ['Yellow', 'Green'];
		const startingTitles = ['Set. . .', 'Go !'];

		for (let i = 0; i < 2; i++) {
			await client.utils.sleep(3000);

			raceEmbed.setTitle(`${startingTitles[i]}`);
			raceEmbed.setColor(startingEmbedColors[i]);

			raceMessage.edit({ embeds: [raceEmbed] });
		}

		await client.utils.sleep(3000);
		raceEmbed.setTitle('Snail Race');

		let gameover = false;
		const regex = '/ - /';

		while (!gameover) {
			for (let i = 0; i < racetrack.length; i++) {
				const canMove = Math.random() < 0.5;

				if (canMove) {
					const track = racetrack[i].replace(regex, '');
					racetrack[i] = track;
				}
			}

			raceEmbed.setDescription(racetrack.join(''));
			raceMessage.edit({ embeds: [raceEmbed] });

			gameover = racetrack.some(track => !track.includes('-'));
			await client.utils.sleep(3000);
		}

		const listOfFinished = [];

		for (let i = 0; i < racetrack.length; i++) {
			if (!racetrack[i].includes('-')) listOfFinished.push(i + 1);
		}

		if (listOfFinished.length > 1) {
			const finishers = `${listOfFinished.slice(0, -1).join(', ')} and ${listOfFinished.slice(-1)}`;

			raceEmbed.setTitle(`It's a tie! Snails ${finishers} are the Winners!`);
		} else {
			raceEmbed.setTitle(`Race Over - Snail ${listOfFinished.shift()} is the Winner!`);
		}

		raceMessage.edit({ embeds: [raceEmbed] });
	},

	generateRacetrack(totalRacers, trackLength) {
		let racetrack = [];

		for (let i = 0; i < totalRacers; i++) {
			const finish = '🧂';
			const track = ' - '.repeat(trackLength);

			const start = `🐌 **${i + 1}.**\n\n`;

			racetrack.push(`${finish}${track}${start}`);
		}

		return racetrack;
	}
};
