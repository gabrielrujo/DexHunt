const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { getPokemonById } = require('../services/pokeapi')
const path = require('path')
const { readJson, writeJson } = require('../utils/jsonStore')
const { rollRarity } = require('../game/rarity')

const SERVERS_DB_PATH = path.resolve(__dirname, '../data/servers.json')

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text
}

function getDespawnMs(rarity) {
  // 1 min para lendários, 2 min para o resto
  return rarity === 'legendary' ? 60 * 1000 : 2 * 60 * 1000
}

function isExpired(spawnedAt, ttlMs) {
  return !spawnedAt || (Date.now() - spawnedAt) >= ttlMs
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spawn')
    .setDescription('Spawna um Pokémon aleatório'),

  async execute(interaction) {
    const serverId = interaction.guildId
    const channelId = interaction.channelId

    const serversDb = readJson(SERVERS_DB_PATH, {})
    let current = serversDb[serverId]?.activePokemon

    // 1) Se existe spawn, verifica expiração usando o TTL dele
    if (current) {
      const ttlMs = getDespawnMs(current.rarity)
      if (isExpired(current.spawnedAt, ttlMs)) {
        delete serversDb[serverId].activePokemon
        writeJson(SERVERS_DB_PATH, serversDb)
        current = null
      }
    }

    // 2) Se ainda existe, bloqueia
    if (current) {
      return interaction.reply({
        content: `🚫 Já existe um Pokémon selvagem ativo (**${capitalize(current.name)}**).\nUse **/catch** ou **/clearspawn**.`,
        ephemeral: true
      })
    }

    await interaction.deferReply()

    // 3) Gerar Pokémon + raridade
    const id = randomInt(1, 1025)
    const pokemon = await getPokemonById(id)
    const rarity = rollRarity()
    const ttlMs = getDespawnMs(rarity)

    const image =
      pokemon.sprites?.other?.['official-artwork']?.front_default ||
      pokemon.sprites?.front_default ||
      null

    // 4) Salvar no JSON
    serversDb[serverId] = {
      activePokemon: {
        id: pokemon.id,
        name: pokemon.name,
        rarity,
        types: pokemon.types.map((t) => t.type.name),
        image,
        spawnedAt: Date.now(),
        spawnedBy: interaction.user.id,
        channelId
      }
    }

    writeJson(SERVERS_DB_PATH, serversDb)

    // 5) Embed
    const name = capitalize(pokemon.name)

    const types = pokemon.types
      .map((t) => capitalize(t.type.name))
      .join(' • ')

    const despawnText = rarity === 'legendary' ? '1 minuto' : '2 minutos'

    const embed = new EmbedBuilder()
      .setTitle('🌿 Um Pokémon selvagem apareceu!')
      .setDescription(`**${name}**`)
      .addFields(
        { name: 'Tipos', value: types || '—', inline: true },
        { name: 'ID', value: String(pokemon.id), inline: true }
      )
      .setFooter({ text: `DexHunt • Use /catch antes que ele fuja em ${despawnText}!` })

    if (image) embed.setImage(image)

    await interaction.editReply({ embeds: [embed] })

    // 6) Timer "ao vivo": quando expirar, limpa e avisa no canal
    setTimeout(async () => {
      const db = readJson(SERVERS_DB_PATH, {})
      const active = db[serverId]?.activePokemon

      // nada ativo ou já mudou (outro spawn/catch)
      if (!active) return
      if (active.id !== pokemon.id) return

      // confirma que realmente expirou
      const expired = isExpired(active.spawnedAt, ttlMs)
      if (!expired) return

      delete db[serverId].activePokemon
      writeJson(SERVERS_DB_PATH, db)

      try {
        const channel = await interaction.client.channels.fetch(channelId)
        if (channel) {
          await channel.send(`💨 **${capitalize(active.name)}** fugiu antes de ser capturado!`)
        }
      } catch {
        // ignora (permissão, canal deletado, etc.)
      }
    }, ttlMs)
  }
}