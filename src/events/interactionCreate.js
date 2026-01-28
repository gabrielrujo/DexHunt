module.exports = async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
    if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'Deu erro ao executar o comando.', ephemeral: true })
    } else {
      await interaction.reply({ content: 'Deu erro ao executar o comando.', ephemeral: true })
    }
  }
};
