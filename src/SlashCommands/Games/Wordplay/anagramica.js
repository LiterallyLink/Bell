const { MessageCollector, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const anagramScores = require('../../../../assets/JSON/anagramicaScores.json');
const request = require('node-superfetch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('anagramica')
		.setDescription('Rearrange letters to form as many words as you can within a limited time period.'),
	async run({ client, application }) {
		const consonants = client.utils.shuffle(['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'x', 'w', 'z']);
		const vowels = client.utils.shuffle(['a', 'e', 'i', 'o', 'u', 'y']);

		let randomLetters = vowels.slice(0, 3).concat(consonants.slice(0, 7));
		randomLetters = client.utils.shuffle(randomLetters);

		const { body } = await request.get(`http://www.anagramica.com/all/${randomLetters.join('')}`).catch(() =>
			application.followUp({ content: 'An error has occured. Please try again later.', ephemeral: true })
		);
		const { all: validWords } = body;

		const wordsFound = [];
		let score = 0;

		const anagramEmbed = new EmbedBuilder()
			.setTitle('Anagramica - Start Guessing!')
			.setDescription(`\`${randomLetters.join('` `').toUpperCase()}\`\n\n`)
			.addFields([{ name: `__Words Found__ — Score: ${score}`, value: `\`\`\`\u200b\`\`\``, inline: true }])
			.setFooter({ text: 'You have 60 seconds to provide anagrams for the following letters.' })
			.setColor('000000');
		const anagramMessage = await application.followUp({ embeds: [anagramEmbed] });

		const filter = (i) => i.author.id === application.user.id;
		const collector = new MessageCollector(application.channel, { filter, time: 60000 });

		collector.on('collect', (res) => {
			const word = res.content.toLowerCase();

			if (wordsFound.includes(word)) return res.react('🟡');
			if (!validWords.includes(word)) return res.react('❌');

			res.react('✅');

			score = this.updateScore(word, score);

			wordsFound.push(word);

			anagramEmbed.data.fields.splice(0, 1, {
				name: `__Words Found__ — Score: ${score}`,
				value: `\`\`\`\n${wordsFound.join('\n')}\`\`\``,
				inline: true
			});

			return anagramMessage.edit({ embeds: [anagramEmbed] });
		});

		collector.on('end', () => {
			anagramEmbed.data.fields.splice(0, 1, { name: `__Words Found__`, value: `${wordsFound.length ? wordsFound.join('\n') : 'None'}`, inline: true });

			let remainingWords = validWords.filter(word => !wordsFound.includes(word));

			remainingWords = remainingWords.length > 10 ?
				`${remainingWords.slice(0, 10).join('\n')} \n *${remainingWords.length - 10} more...*` :
				wordsFound.join('\n') || 'None';

			anagramEmbed.setTitle('Anagramica - Gameover!');
			anagramEmbed.addFields({ name: '__Remaining Words__', value: `${remainingWords}`, inline: true });
			anagramEmbed.setDescription(`Final Score: **${score}**`);
			anagramEmbed.setFooter({ text: '\n' });

			anagramMessage.edit({ embeds: [anagramEmbed] });
		});
	},

	updateScore(word, currentScore) {
		return word.split('').reduce((score, letter) => score + anagramScores[letter], currentScore);
	}
};
