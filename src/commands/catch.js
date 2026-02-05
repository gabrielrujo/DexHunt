const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const path = require('path')
const { readJson, writeJson } = require('../utils/jsonStore')

const SERVERS_DB_PATH = path.resolve(__dirname, '../data/servers.json')
const USERS_DB_PATH = path.resolve(__dirname, '../data/users.json')

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text
}

function chance(prob) {
  return Math.random() < prob
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('catch')
    .setDescription('Tenta capturar o Pokémon selvagem ativo'),

  async execute(interaction) {
    const serverId = interaction.guildId
    const userId = interaction.user.id

    const serversDb = readJson(SERVERS_DB_PATH, {})
    const active = serversDb[serverId]?.activePokemon

    if (!active) {
      return interaction.reply({
        content: 'Não existe nenhum Pokémon selvagem ativo aqui. Use **/spawn**.',
        ephemeral: true
      })
    }

    // Chance fixa v1 (depois a gente usa raridade)
    const success = chance(0.5)

    if (!success) {
      const failEmbed = new EmbedBuilder()
        .setTitle('❌ A captura falhou!')
        .setDescription(`**${capitalize(active.name)}** escapou... tente novamente!`)
        .setFooter({ text: 'DexHunt • Use /catch para tentar de novo' })

      return interaction.reply({ embeds: [failEmbed] })
    }

    // ✅ Capturou: salvar no users.json
    const usersDb = readJson(USERS_DB_PATH, {})

    if (!usersDb[userId]) {
      usersDb[userId] = {
        captured: [],
        createdAt: Date.now()
      }
    }

    usersDb[userId].captured.push({
      id: active.id,
      name: active.name,
      types: active.types,
      image: active.image,
      capturedAt: Date.now(),
      serverId
    })

    writeJson(USERS_DB_PATH, usersDb)

    // ✅ Remover do servers.json
    delete serversDb[serverId].activePokemon
    writeJson(SERVERS_DB_PATH, serversDb)

    const winEmbed = new EmbedBuilder()
      .setTitle('✅ Capturado com sucesso!')
      .setDescription(`Você capturou **${capitalize(active.name)}**!`)
      .setFooter({ text: 'DexHunt • Pokédex atualizada' })

    if (active.image) winEmbed.setThumbnail(active.image)

    return interaction.reply({ embeds: [winEmbed] })
  }
}
