const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const path = require('path')
const { readJson } = require('../utils/jsonStore')

const USERS_DB_PATH = path.resolve(__dirname, '../data/users.json')

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Mostra seu perfil e Pokémons capturados'),

  async execute(interaction) {
    const userId = interaction.user.id
    const usersDb = readJson(USERS_DB_PATH, {})

    const userData = usersDb[userId]

    if (!userData || !userData.captured.length) {
      return interaction.reply({
        content: 'Você ainda não capturou nenhum Pokémon 😢\nUse **/spawn** e **/catch**!',
        ephemeral: true
      })
    }

    const total = userData.captured.length

    // Limitar pra não estourar embed
    const list = userData.captured
      .slice(0, 20)
      .map(p => `• ${capitalize(p.name)}`)
      .join('\n')

    const embed = new EmbedBuilder()
      .setTitle(`📘 Perfil de ${interaction.user.username}`)
      .setDescription(`Pokémons capturados: **${total}**`)
      .addFields({
        name: 'Coleção',
        value: list || '—'
      })
      .setFooter({ text: 'DexHunt • Continue capturando!' })

    return interaction.reply({ embeds: [embed] })
  }
}
