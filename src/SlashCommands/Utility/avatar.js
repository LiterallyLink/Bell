const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Retrieve the avatar of a user')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('the specific member you want to retrieve')
				.setRequired(true)
		),
	async run({ application }) {
		const user = application.options.getUser('user');
		const avatarURL = user.displayAvatarURL({ size: 1024, dynamic: true });

		const avatarEmbed = new EmbedBuilder()
			.setTitle(`${user.username}'s Avatar`)
			.setDescription(`[Image URL](${avatarURL})`)
			.setImage(avatarURL)
			.setColor('#FFFFFF');

		application.followUp({ embeds: [avatarEmbed] });
	}
};
