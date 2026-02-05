const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { getPokemonById } = require('../services/pokeapi')
const path = require('path')
const { readJson, writeJson } = require('../utils/jsonStore')

const SERVERS_DB_PATH = path.resolve(__dirname, '../data/servers.json')

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spawn')
    .setDescription('Spawna um Pokémon aleatório'),

  async execute(interaction) {
    const serverId = interaction.guildId

    // 1️⃣ Ler estado atual do servidor
    const serversDb = readJson(SERVERS_DB_PATH, {})
    const current = serversDb[serverId]?.activePokemon

    // 2️⃣ Bloquear se já existir Pokémon ativo
    if (current) {
      return interaction.reply({
        content: `🚫 Já existe um Pokémon selvagem ativo (**${capitalize(current.name)}**).\nUse **/catch** ou **/clearspawn**.`,
        ephemeral: true
      })
    }

    // 3️⃣ Agora sim deferimos a resposta
    await interaction.deferReply()

    // 4️⃣ Gerar Pokémon
    const id = randomInt(1, 1025)
    const pokemon = await getPokemonById(id)

    // 5️⃣ Salvar no JSON
    serversDb[serverId] = {
      activePokemon: {
        id: pokemon.id,
        name: pokemon.name,
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

    // 6️⃣ Preparar embed
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

    if (image) embed.setImage(image)

    // 7️⃣ Responder
    await interaction.editReply({ embeds: [embed] })
  }
}
