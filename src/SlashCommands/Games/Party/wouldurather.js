const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, EmbedBuilder } = require('discord.js');

const { createCanvas, registerFont } = require('canvas');
registerFont('assets/fonts/selawksb.ttf', { family: 'Selawksb-Bold' });

const canvasHeight = 750;
const canvasWidth = 1200;
const halfCanvasHeight = 375;
const halfCanvasWidth = 600;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wouldurather')
		.setDescription('Choose between two challenging scenarios.'),
	async run({ client, application }) {
		const canvas = createCanvas(canvasWidth, canvasHeight);
		const ctx = canvas.getContext('2d');

		let html = await client.utils.fetchHtmlContent('https://either.io');
		let choices = this.indexWebdata(html, 'span.option-text:lt(2)');

		this.drawBackground(ctx, client);
		this.drawChoices(ctx, choices);

		const wouldYouRatherEmbed = new EmbedBuilder()
			.setTitle('Would You Rather')
			.setImage('attachment://wouldyourather.png')
			.setFooter({ text: '\u200b' })
			.setColor('#000000');

		const buttonRow = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('blue')
					.setLabel('🟦')
					.setStyle('Secondary'),
				new ButtonBuilder()
					.setCustomId('red')
					.setLabel('🟥')
					.setStyle('Secondary'),
				new ButtonBuilder()
					.setCustomId('next')
					.setLabel('♻️')
					.setStyle('Secondary'),
				new ButtonBuilder()
					.setCustomId('delete')
					.setLabel('🗑️')
					.setStyle('Secondary')
			);

		let attachment = Buffer.from(canvas.toBuffer());

		const wouldYouRatherMessage = await application.followUp({
			embeds: [wouldYouRatherEmbed],
			components: [buttonRow],
			files: [{ attachment, name: 'wouldyourather.png' }]
		});

		const filter = (i) => {
			i.deferUpdate();
			return i.user.id === application.user.id;
		};

		const collector = wouldYouRatherMessage.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 300000 });

		collector.on('collect', async (i) => {
			const choice = i.customId;

			if (choice === 'delete' || !choice) {
				collector.stop();
				return wouldYouRatherMessage.delete();
			}

			if (choice === 'next') {
				html = await client.utils.fetchHtmlContent('https://either.io');
				choices = this.indexWebdata(html, 'span.option-text:lt(2)');

				this.drawBackground(ctx, client);
				this.drawChoices(ctx, choices);

				buttonRow.components.slice(0, 2).map(btn => btn.setDisabled(false));

				wouldYouRatherEmbed.setFooter({ text: '\u200b' });

				attachment = Buffer.from(canvas.toBuffer());

				return wouldYouRatherMessage.edit({
					embeds: [wouldYouRatherEmbed],
					components: [buttonRow],
					files: [{ attachment, name: 'wouldyourather.png' }]
				});
			}

			buttonRow.components.slice(0, 2).map(btn => btn.setDisabled(true));

			const statistics = this.indexWebdata(html, 'span.count:lt(2)');

			this.drawStatistics(ctx, choices, statistics, choice);
			this.drawPercentages(ctx, statistics);

			const chosenOption = choice === 'blue' ? choices[0] : choices[1];

			wouldYouRatherEmbed.setFooter({ text: `${i.user.username} would rather ${chosenOption.toLowerCase()}` });

			attachment = Buffer.from(canvas.toBuffer());

			return wouldYouRatherMessage.edit({
				embeds: [wouldYouRatherEmbed],
				components: [buttonRow],
				files: [{ attachment, name: 'wouldyourather.png' }]
			});
		});
	},

	drawBackground(ctx, client) {
		client.canvas.fillBackground(ctx, '#5ebee4');
		client.canvas.fillBackground(ctx, '#e43130');

		const dividerWidth = 10;
		client.canvas.drawRect(ctx, 0, halfCanvasHeight - dividerWidth, canvasWidth, dividerWidth * 2, '#303434');

		const radius = 75;
		client.canvas.drawCircle(ctx, halfCanvasWidth, halfCanvasHeight, radius, '#303434', '#303434');

		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = '#FFFFFF';
		ctx.font = '70px Selawksb-Bold';

		const { actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText('OR');
		const adjustmentMetric = actualBoundingBoxDescent - actualBoundingBoxAscent;

		ctx.fillText('OR', halfCanvasWidth, halfCanvasHeight - adjustmentMetric);
	},

	drawChoices(ctx, choices) {
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = '#FFFFFF';
		ctx.font = `45px Selawksb-Bold`;

		let choiceYPosition = halfCanvasHeight / 2;

		for (let i = 0; i < choices.length; i++) {
			const { width } = ctx.measureText(choices[i]);

			if (width > 1000) {
				const choiceToArray = choices[i].split(' ');
				const midpoint = Math.ceil(choiceToArray.length / 2);

				const topText = choiceToArray.splice(0, midpoint).join(' ');
				const bottomText = choiceToArray.join(' ');

				ctx.fillText(topText, halfCanvasWidth, choiceYPosition);

				const { actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(topText);
				const verticalAdjustmentMetric = actualBoundingBoxDescent + actualBoundingBoxAscent;

				ctx.fillText(bottomText, halfCanvasWidth, choiceYPosition + verticalAdjustmentMetric);
			} else {
				ctx.fillText(choices[i], halfCanvasWidth, choiceYPosition);
			}

			choiceYPosition += halfCanvasHeight;
		}
	},

	drawPercentages(ctx, statistics) {
		ctx.fillStyle = '#FFFFFF';
		ctx.font = '40px Selawksb-Bold';
		ctx.textAlign = 'left';

		let yPos = 40;
		const xPos = canvasWidth;

		const parsedStats = statistics.map(str => parseInt(str.replace(/,/g, '')));
		const totalVotes = parsedStats.reduce((acc, val) => acc + val);

		const percentages = [`${Math.round((parsedStats.shift() / totalVotes) * 100)}%`, `${Math.round((parsedStats.shift() / totalVotes) * 100)}%`];

		for (let i = 0; i < percentages.length; i++) {
			const { width } = ctx.measureText(percentages[i]);

			ctx.fillText(percentages[i], xPos - width, yPos);

			yPos += halfCanvasHeight;
		}
	},

	drawStatistics(ctx, choices, statistics, choice) {
		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = 'center';

		const xPos = halfCanvasWidth;
		let yPos = canvasHeight / 4;

		const agreements = ['agree', 'disagree'];

		for (let i = 0; i < 2; i++) {
			ctx.font = '45px Selawksb-Bold';

			const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(choices[i]);
			let adjustmentMetric = actualBoundingBoxAscent + actualBoundingBoxDescent;

			if (width > 1000) adjustmentMetric *= 2;

			ctx.font = '30px Selawksb-Bold';
			ctx.fillText(`${statistics[i]} ${choice === 'blue' ? agreements[0] : agreements[1]}`, xPos, yPos + adjustmentMetric);

			yPos += halfCanvasHeight;

			agreements.reverse();
		}
	},

	indexWebdata(html, query) {
		return html(query).map((_i, elem) => html(elem).text()).get();
	}
};
