const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ComponentType } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

const avatarWidth = 150;
const avatarHeight = 150;

const avatarWidthSpacing = 30;
const avatarWidthMargin = 50;

const avatarHeightSpacing = 130;
const avatarHeightMargin = 180;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hungergames')
		.setDescription('Put server members head to head in a fierce competition of Hunger Games')
		.addStringOption(option => option
			.setName('location')
			.setDescription('The location of the Hunger Games')
			.addChoices(
				{ name: 'Forest', value: 'forest' },
				{ name: 'Jungle', value: 'jungle' },
				{ name: 'Desert', value: 'forest' },
				{ name: 'Arctic', value: 'arctic' }
			)
			.setRequired(true))
		.addUserOption(option => option.setName('tribute-1').setDescription('The 1st tribute.').setRequired(true))
		.addUserOption(option => option.setName('tribute-2').setDescription('The 2nd tribute.').setRequired(true))
		.addUserOption(option => option.setName('tribute-3').setDescription('The 3rd tribute.'))
		.addUserOption(option => option.setName('tribute-4').setDescription('The 4th tribute.'))
		.addUserOption(option => option.setName('tribute-5').setDescription('The 5th tribute.'))
		.addUserOption(option => option.setName('tribute-6').setDescription('The 6th tribute.'))
		.addUserOption(option => option.setName('tribute-7').setDescription('The 7th tribute.'))
		.addUserOption(option => option.setName('tribute-8').setDescription('The 8th tribute.'))
		.addUserOption(option => option.setName('tribute-9').setDescription('The 9th tribute.'))
		.addUserOption(option => option.setName('tribute-10').setDescription('The 10th tribute.'))
		.addUserOption(option => option.setName('tribute-11').setDescription('The 11th tribute.'))
		.addUserOption(option => option.setName('tribute-12').setDescription('The 12th tribute.'))
		.addUserOption(option => option.setName('tribute-13').setDescription('The 13th tribute.'))
		.addUserOption(option => option.setName('tribute-14').setDescription('The 14th tribute.'))
		.addUserOption(option => option.setName('tribute-15').setDescription('The 15th tribute.'))
		.addUserOption(option => option.setName('tribute-16').setDescription('The 16th tribute.'))
		.addUserOption(option => option.setName('tribute-17').setDescription('The 17th tribute.'))
		.addUserOption(option => option.setName('tribute-18').setDescription('The 18th tribute.'))
		.addUserOption(option => option.setName('tribute-19').setDescription('The 19th tribute.'))
		.addUserOption(option => option.setName('tribute-20').setDescription('The 20th tribute.'))
		.addUserOption(option => option.setName('tribute-21').setDescription('The 21st tribute.'))
		.addUserOption(option => option.setName('tribute-22').setDescription('The 22nd tribute.'))
		.addUserOption(option => option.setName('tribute-23').setDescription('The 23rd tribute.'))
		.addUserOption(option => option.setName('tribute-24').setDescription('The 24th tribute.')),
	async run({ client, application }) {
		const selectedTributes = application.options._hoistedOptions.filter(option => option.type === 6).map(user => user);
		const tributes = this.generateTributeData(selectedTributes);

		const theReapingCanvas = await this.generateReapingCanvas(client, tributes);

		const theReapingButtons = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('proceed')
					.setLabel('Proceed ✔️')
					.setStyle('Success'),
				new ButtonBuilder()
					.setCustomId('randomize')
					.setLabel('Randomize ♻️')
					.setStyle('Primary'),
				new ButtonBuilder()
					.setCustomId('delete')
					.setLabel('Quit 🗑️')
					.setStyle('Danger')
			);

		const theReapingEmbed = new EmbedBuilder()
			.setImage('attachment://theReaping.png')
			.setColor('#5d5050');

		const theReapingMessage = await application.followUp({
			embeds: [theReapingEmbed],
			files: [{ attachment: Buffer.from(theReapingCanvas.toBuffer()), name: 'theReaping.png' }],
			components: [theReapingButtons]
		});

		let gameover = false;
		

		while (gameover) {

		}
	},

	generateTributeData(tributes) {
		const tributeData = [];

		tributes.forEach(({ user }, i) => {
			const iterator = i + 1;
			const assignDistrict = () => tributes.length === 2 ? iterator : Math.ceil(iterator / 2);

			const tributeObj = {
				id: user.id,
				username: user.username,
				avatar: user.displayAvatarURL({ extension: 'png' }),
				district: assignDistrict(),
				alive: true,
				kills: [],
				killedBy: null
			};

			tributeData.push(tributeObj);
		});

		return tributeData;
	},

	async generateReapingCanvas(client, tributes) {
		const rowCapacity = Math.min(tributes.length, 6);
		const totalAvatarWidth = rowCapacity * avatarWidth;
		const totalAvatarXSpacing = (rowCapacity - 1) * avatarWidthSpacing;

		const canvasWidth = (totalAvatarWidth + totalAvatarXSpacing) + (avatarWidthMargin * 2);

		const columnCapacity = Math.ceil(tributes.length / 6);
		const totalAvatarHeight = columnCapacity * avatarHeight;
		const totalAvatarYSpacing = (columnCapacity - 1) * avatarHeightSpacing;

		const canvasHeight = (totalAvatarHeight + totalAvatarYSpacing) + (avatarHeightMargin * 2);

		const canvas = createCanvas(canvasWidth, canvasHeight);
		const ctx = canvas.getContext('2d');

		client.canvas.fillBackground(ctx, '#5d5050');

		await this.generateTributeImages(client, ctx, tributes);

		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'bottom';
		this.drawDistricts(ctx, tributes);

		ctx.font = 'bold 20px arial';
		this.drawNames(ctx, tributes);
		this.drawStatuses(ctx, tributes);

		ctx.font = '35px arial';
		this.drawHeader(ctx, ['The Reaping']);

		return Buffer.from(canvas.toBuffer());
	},

	async generateTributeImages(client, ctx, tributes, displayStatuses = false) {
		ctx.strokeStyle = '#000000';

		const loadedAvatar = await Promise.all(tributes.map(tribute => loadImage(tribute.avatar)));

		for (let i = 0; i < tributes.length; i++) {
			const rowIndex = i % 6;
			const columnIndex = Math.floor(i / 6);

			const xPos = (rowIndex * (avatarWidth + avatarWidthSpacing)) + avatarWidthMargin;
			const yPos = (columnIndex * (avatarHeight + avatarHeightSpacing)) + avatarHeightMargin;

			ctx.drawImage(loadedAvatar[i], xPos, yPos, avatarWidth, avatarHeight);
			ctx.strokeRect(xPos, yPos, avatarWidth, avatarHeight);

			if (displayStatuses && !tributes[i].alive) {
				client.canvas.greyScale(ctx, xPos, yPos, avatarWidth, avatarHeight);
			}
		}
	},

	drawHeader(ctx, text) {
		const headerText = ['The Hunger Games', ...text];

		const canvasCenter = ctx.canvas.width / 2;

		const textXPos = canvasCenter;
		let textYPos = 0;

		let { alphabeticBaseline: startingBoxYPos } = ctx.measureText('The Hunger Games');

		for (let i = 0; i < headerText.length; i++) {
			const { width, actualBoundingBoxAscent, alphabeticBaseline, actualBoundingBoxLeft } = ctx.measureText(headerText[i]);

			ctx.fillStyle = '#232323';
			const startingBoxXPos = canvasCenter - actualBoundingBoxLeft;
			const endingBoxXPos = width;
			const endingBoxYPos = actualBoundingBoxAscent + alphabeticBaseline;

			ctx.fillRect(startingBoxXPos, startingBoxYPos, endingBoxXPos, endingBoxYPos);

			ctx.strokeStyle = '#ffffff';
			ctx.strokeRect(startingBoxXPos, startingBoxYPos, endingBoxXPos, endingBoxYPos);

			startingBoxYPos += endingBoxYPos + alphabeticBaseline;

			ctx.fillStyle = '#e4ae24';
			textYPos += actualBoundingBoxAscent + (alphabeticBaseline * 2);
			ctx.fillText(headerText[i], textXPos, textYPos);
		}
	},

	drawDistricts(ctx, tributes) {
		ctx.font = 'bold 28px arial';

		let yPos = avatarHeightMargin;
		const { alphabeticBaseline } = ctx.measureText('District');
		yPos -= alphabeticBaseline;

		if (tributes.length === 2) {
			let xPos = avatarWidthMargin + (avatarWidth / 2);
			ctx.fillText('District 1', xPos, yPos);

			xPos += avatarWidth + avatarWidthSpacing;
			ctx.fillText('District 2', xPos, yPos);

			return;
		}

		const districtCount = tributes[tributes.length - 1].district;
		const tributesAreUneven = tributes.length % 2 !== 0;
		const iterator = tributesAreUneven ? districtCount - 1 : districtCount;

		let xPos = avatarWidthMargin + avatarWidth + (avatarWidthSpacing / 2);

		for (let i = 0; i < iterator; i++) {
			ctx.fillText(`District ${i + 1}`, xPos, yPos);

			xPos += (avatarWidth * 2) + (avatarWidthSpacing * 2);

			if ((i + 1) % 3 === 0) {
				xPos = avatarWidthMargin + avatarWidth + (avatarWidthSpacing / 2);
				yPos += avatarHeight + avatarHeightSpacing;
			}
		}

		if (tributesAreUneven) {
			xPos -= (avatarWidth * 2) + (avatarWidthSpacing * 2);

			if (tributes.length === 7 || tributes.length === 13 || tributes.length === 19) xPos = avatarWidthMargin + (avatarWidth / 2);
			else xPos += (avatarWidth * 1.5) + (avatarWidthSpacing * 1.5);

			ctx.fillText(`District ${districtCount}`, xPos, yPos);
		}
	},

	drawNames(ctx, tributes) {
		let xPos = avatarWidthMargin + (avatarWidth / 2);

		const { actualBoundingBoxAscent, alphabeticBaseline } = ctx.measureText('|');
		const adjustmentMetric = Math.round(actualBoundingBoxAscent + alphabeticBaseline);

		let yPos = avatarHeightMargin + avatarHeight + adjustmentMetric;

		for (let i = 0; i < tributes.length; i++) {
			ctx.fillText(`${tributes[i].username}`, xPos, yPos);

			xPos += avatarWidth + avatarWidthSpacing;

			if ((i + 1) % 6 === 0) {
				xPos = avatarWidthMargin + (avatarWidth / 2);
				yPos += avatarHeightSpacing + avatarHeight;
			}
		}
	},

	drawStatuses(ctx, tributes) {
		const { actualBoundingBoxAscent, alphabeticBaseline } = ctx.measureText('|');
		const adjustmentMetric = Math.round(actualBoundingBoxAscent + alphabeticBaseline) * 2;

		let xPos = avatarWidthMargin + (avatarWidth / 2);
		let yPos = avatarHeightMargin + avatarWidth + adjustmentMetric;

		for (let i = 0; i < tributes.length; i++) {
			ctx.fillStyle = tributes[i].alive ? '#70ec25' : '#fa6666';
			ctx.fillText(`${tributes[i].alive ? 'Alive' : 'Deceased'}`, xPos, yPos);

			xPos += avatarWidth + avatarWidthSpacing;

			if ((i + 1) % 6 === 0) {
				xPos = avatarWidthMargin + (avatarWidth / 2);
				yPos += avatarHeightMargin + avatarWidth;
			}
		}
	}
};
