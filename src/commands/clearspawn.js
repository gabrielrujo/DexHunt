const { SlashCommandBuilder } = require('discord.js')
const path = require('path')
const { readJson, writeJson } = require('../utils/jsonStore')

const SERVERS_DB_PATH = path.resolve(__dirname, '../data/servers.json')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearspawn')
    .setDescription('Remove o Pokémon ativo do servidor (apenas para testes)'),

  async execute(interaction) {
    const serverId = interaction.guildId
    const serversDb = readJson(SERVERS_DB_PATH, {})
    const current = serversDb[serverId]?.activePokemon

    if (!current) {
      return interaction.reply({
        content: 'Não existe nenhum Pokémon ativo neste servidor.',
        ephemeral: true
      })
    }

    delete serversDb[serverId].activePokemon
    writeJson(SERVERS_DB_PATH, serversDb)

    return interaction.reply({
      content: `✅ Pokémon ativo removido (**${current.name}**). Agora você pode usar **/spawn** de novo.`,
      ephemeral: true
    })
  }
}
