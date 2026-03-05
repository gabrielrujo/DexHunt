const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { getPokemonById } = require('../services/pokeapi')
const path = require('path')
const { readJson, writeJson } = require('../utils/jsonStore')
const { rollRarity } = require('../game/rarity')

const SERVERS_DB_PATH = path.resolve(__dirname, '../data/servers.json')

// tempo de vida do spawn (2 minutos)
const DESPAWN_MINUTES = 2
const TTL_MS = DESPAWN_MINUTES * 60 * 1000

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text
}

function isExpired(spawnedAt) {
  return !spawnedAt || (Date.now() - spawnedAt) >= TTL_MS
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spawn')
    .setDescription('Spawna um Pokémon aleatório'),

  async execute(interaction) {
    const serverId = interaction.guildId

    const serversDb = readJson(SERVERS_DB_PATH, {})
    let current = serversDb[serverId]?.activePokemon

    // verifica se o spawn atual expirou
    if (current && isExpired(current.spawnedAt)) {
      delete serversDb[serverId].activePokemon
      writeJson(SERVERS_DB_PATH, serversDb)
      setTimeout(async () => {
      const db = readJson(SERVERS_DB_PATH, {})
      const active = db[serverId]?.activePokemon

      if (!active) return

      const expired = !active.spawnedAt || (Date.now() - active.spawnedAt) >= TTL_MS
      if (!expired) return

      delete db[serverId].activePokemon
      writeJson(SERVERS_DB_PATH, db)

      try {
        await interaction.followUp({
        content: `💨 **${capitalize(active.name)}** fugiu de volta para a natureza...`
      })
    } catch {}
  }, TTL_MS)
      current = null
    }

    // bloqueia se ainda existir um spawn ativo
    if (current) {
      return interaction.reply({
        content: `🚫 Já existe um Pokémon selvagem ativo (**${capitalize(current.name)}**).\nUse **/catch** ou **/clearspawn**.`,
        ephemeral: true
      })
    }

    await interaction.deferReply()

    // gerar pokemon
    const id = randomInt(1, 1025)
    const pokemon = await getPokemonById(id)

    const rarity = rollRarity()

    serversDb[serverId] = {
      activePokemon: {
        id: pokemon.id,
        name: pokemon.name,
        rarity: rarity,
        types: pokemon.types.map(t => t.type.name),
        image:
          pokemon.sprites?.other?.['official-artwork']?.front_default ||
          pokemon.sprites?.front_default ||
          null,
        spawnedAt: Date.now(),
        spawnedBy: interaction.user.id
      }
    }

    writeJson(SERVERS_DB_PATH, serversDb)

    const name = capitalize(pokemon.name)

    const image =
      pokemon.sprites?.other?.['official-artwork']?.front_default ||
      pokemon.sprites?.front_default

    const types = pokemon.types
      .map(t => capitalize(t.type.name))
      .join(' • ')

    const embed = new EmbedBuilder()
      .setTitle('🌿 Um Pokémon selvagem apareceu!')
      .setDescription(`**${name}**`)
      .addFields(
        { name: 'Tipos', value: types || '—', inline: true },
        { name: 'ID', value: String(pokemon.id), inline: true }
      )
      .setFooter({ text: 'DexHunt • Use /catch para tentar capturar' })
      .setFooter({ text: 'DexHunt • Use /catch antes que ele fuja!' })

    if (image) embed.setImage(image)

    await interaction.editReply({ embeds: [embed] })
  }
}