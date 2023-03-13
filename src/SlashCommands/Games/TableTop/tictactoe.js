const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tictactoe')
		.setDescription('Aim to get 3 in a row on a 3x3 grid.')
		.addSubcommand(subcommand => subcommand
			.setName('player-vs-player')
			.setDescription('Challenge a human opponent')
			.addUserOption(option => option
				.setName('user')
				.setDescription('Choose your opponent')
				.setRequired(true)
			))
		.addSubcommand(subcommand => subcommand
			.setName('ai-vs-player')
			.setDescription('Challenge an AI opponent')
			.addStringOption(option => option
				.setName('difficulty')
				.setDescription('Set the AIs difficulty level')
				.setRequired(true)
				.addChoices(
					{ name: 'Easy', value: '0' },
					{ name: 'Advanced', value: '1' },
					{ name: 'Unbeatable', value: '2' }
				)
			)
		),
	async run({ client, application }) {
		const board = this.generateTicTacToeBoard();

		const symbols = ['X', 'O'];
		const styles = ['Success', 'Danger'];

		let gameover = false;
		let turnCount = 0;

		const pvp = application.options.getSubcommand() === 'player-vs-player';
		const ai = application.options.getSubcommand() === 'player-vs-ai';

		if (pvp) {
			const challenger = this.createPlayer(application.user, symbols, styles);
			const opponent = this.createPlayer(application.options.getUser('user'), symbols, styles);

			const players = client.utils.shuffle([challenger, opponent]);
			let currentPlayer = players.shift();

			const tictactoeEmbed = new EmbedBuilder()
				.setFooter({ text: `${currentPlayer.username} is first up!` })
				.setColor('#FFFF00');
			const tictactoeMessage = await application.followUp({ embeds: [tictactoeEmbed], components: board });

			while (!gameover) {
				const filter = (i) => {
					i.deferUpdate();
					return i.user.id === currentPlayer.playerId;
				};

				try {
					const { customId } = await tictactoeMessage.awaitMessageComponent({ filter, max: 1, time: 60000, componentType: ComponentType.Button });

					const [row, column] = customId.split('').map(Number);
					const selectedButton = board[row].components[column];

					if (selectedButton.data.label !== '➖') continue;

					turnCount++;

					selectedButton.setLabel(currentPlayer.symbol);
					selectedButton.setStyle(currentPlayer.style);
				} catch (err) {
					tictactoeEmbed.setFooter({ text: 'Gameover - Time Ran Out.' }).setColor('#FFFF00');
					tictactoeMessage.edit({ embeds: [tictactoeEmbed], components: board });

					break;
				}

				gameover = this.checkHorizontalWin(board) || this.checkVerticalWin(board) || this.checkDiagonalWin(board);

				if (turnCount > 4 && gameover) {
					tictactoeEmbed.setFooter({ text: `Gameover - ${currentPlayer.username} is the Winner!` });
					tictactoeMessage.edit({ embeds: [tictactoeEmbed], components: board });

					break;
				}

				if (turnCount === 9) {
					gameover = true;

					tictactoeEmbed.setFooter({ text: "Gameover - It's a draw!" }).setColor('#FFFF00');
					tictactoeMessage.edit({ embeds: [tictactoeEmbed], components: board });

					break;
				}

				currentPlayer = currentPlayer === challenger ? opponent : challenger;

				tictactoeEmbed
					.setFooter({ text: `${currentPlayer.username} is making their next move. . .` })
					.setColor(`${currentPlayer.style === 'Success' ? '#00FF00' : '#FF0000'}`);
				tictactoeMessage.edit({ embeds: [tictactoeEmbed], components: board });
			}
		}

		if (ai) {
			console.log('ai');
		}
	},

	generateTicTacToeBoard() {
		const board = [];

		for (let i = 0; i < 3; i++) {
			const buttonBuilders = [];

			for (let j = 0; j < 3; j++) {
				const buttonBuilder = new ButtonBuilder()
					.setCustomId(`${i}${j}`)
					.setLabel('➖')
					.setStyle('Secondary');

				buttonBuilders.push(buttonBuilder);
			}

			const rowBuilder = new ActionRowBuilder()
				.addComponents(...buttonBuilders);

			board.push(rowBuilder);
		}

		return board;
	},

	createPlayer(user, symbols, styles) {
		return {
			username: user.username,
			playerId: user.id,
			style: styles.shift(),
			symbol: symbols.shift()
		};
	},

	checkHorizontalWin(board) {
		let winCondition;

		for (let i = 0; i < 3; i++) {
			const row = board[i].components.map(comp => comp.data.label);
			winCondition = this.allEqual(row, 'X') || this.allEqual(row, 'O');
			if (winCondition) break;
		}

		return winCondition;
	},

	checkVerticalWin(board) {
		let winCondition;

		for (let i = 0; i < 3; i++) {
			const column = board.map(row => row.components[i].data.label);
			winCondition = this.allEqual(column, 'X') || this.allEqual(column, 'O');
			if (winCondition) break;
		}

		return winCondition;
	},

	checkDiagonalWin(board) {
		const leftDiagonal = [];
		const rightDiagonal = [];

		for (let i = 0; i < 3; i++) {
			leftDiagonal.push(board[i].components[i].data.label);
			rightDiagonal.push(board[i].components[2 - i].data.label);
		}

		return this.allEqual(leftDiagonal, 'X') || this.allEqual(leftDiagonal, 'O') || this.allEqual(rightDiagonal, 'X') || this.allEqual(rightDiagonal, 'O');
	},

	allEqual(array, toEqual) {
		return array.every(symbol => symbol === toEqual);
	}
};
