const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js')

const path = require('path')

const { STARTERS } = require('../game/starters')
const { getPokemonById } = require('../services/pokeapi')
const { readJson, writeJson } = require('../utils/jsonStore')

const USERS_DB_PATH = path.resolve(__dirname, '../data/users.json')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('starter')
    .setDescription('Escolha seu primeiro Pokémon!')
    .addIntegerOption(option =>
      option
        .setName('generation')
        .setDescription('Escolha a geração')
        .setRequired(true)
        .addChoices(
          { name: 'Gen 1', value: 1 },
          { name: 'Gen 2', value: 2 },
          { name: 'Gen 3', value: 3 },
          { name: 'Gen 4', value: 4 },
          { name: 'Gen 5', value: 5 },
          { name: 'Gen 6', value: 6 },
          { name: 'Gen 7', value: 7 },
          { name: 'Gen 8', value: 8 },
          { name: 'Gen 9', value: 9 }
        )
    )
    .addStringOption(option =>
      option
        .setName('pokemon')
        .setDescription('Nome do Pokémon inicial')
        .setRequired(true)
    ),

  async execute(interaction) {
    const generation = interaction.options.getInteger('generation')
    const pokemonName = interaction.options.getString('pokemon').toLowerCase()
    const userId = interaction.user.id

    // lê base
    const usersDb = readJson(USERS_DB_PATH, {})
    const userData = usersDb[userId]

    // starter permitido mesmo se já tiver capturas,
    // mas bloqueia se já tiver escolhido um starter antes
    if (userData?.captured?.some(p => p.isStarter)) {
      return interaction.reply({
        content: 'Você já escolheu um Pokémon inicial.',
        ephemeral: true
      })
    }

    // valida se o pokemon pertence à geração escolhida
    const starters = STARTERS[generation]
    if (!starters || !starters.includes(pokemonName)) {
      return interaction.reply({
        content: 'Esse Pokémon não é um starter dessa geração.',
        ephemeral: true
      })
    }

    await interaction.deferReply()

    const pokemon = await getPokemonById(pokemonName)

    const image =
      pokemon.sprites?.other?.['official-artwork']?.front_default ||
      pokemon.sprites?.front_default ||
      null

    // embed preview
    const embed = new EmbedBuilder()
      .setTitle(`Escolher ${pokemon.name}?`)
      .setDescription('Você deseja escolher este Pokémon como seu starter?')
      .setThumbnail(image)

    // botões
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('starter_confirm')
        .setLabel('Confirmar')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('starter_cancel')
        .setLabel('Cancelar')
        .setStyle(ButtonStyle.Danger)
    )

    const message = await interaction.editReply({
      embeds: [embed],
      components: [row]
    })

    const filter = i => i.user.id === interaction.user.id

    const collector = message.createMessageComponentCollector({
      filter,
      time: 30000
    })

    collector.on('collect', async i => {
      if (i.customId === 'starter_cancel') {
        collector.stop('cancelled')
        return i.update({
          content: 'Starter cancelado.',
          embeds: [],
          components: []
        })
      }

      if (i.customId === 'starter_confirm') {
        // recarrega do disco pra evitar sobrescrever capturas recentes
        const freshDb = readJson(USERS_DB_PATH, {})
        const existing = freshDb[userId]

        // se já tem starter, bloqueia
        if (existing?.captured?.some(p => p.isStarter)) {
          collector.stop('already_has_starter')
          return i.update({
            content: 'Você já escolheu um Pokémon inicial.',
            embeds: [],
            components: []
          })
        }

        // garante estrutura do usuário
        if (!freshDb[userId]) {
          freshDb[userId] = { captured: [], createdAt: Date.now() }
        }
        if (!Array.isArray(freshDb[userId].captured)) {
          freshDb[userId].captured = []
        }

        // adiciona starter sem apagar capturas antigas
        freshDb[userId].captured.push({
          id: pokemon.id,
          name: pokemon.name,
          types: pokemon.types.map(t => t.type.name),
          image,
          rarity: 'starter',
          isStarter: true,
          capturedAt: Date.now(),
          serverId: interaction.guildId
        })

        writeJson(USERS_DB_PATH, freshDb)

        collector.stop('confirmed')
        return i.update({
          content: `✅ ${pokemon.name} foi escolhido como seu starter!`,
          embeds: [],
          components: []
        })
      }
    })

    collector.on('end', async (_collected, reason) => {
      if (reason === 'time') {
        await interaction.editReply({
          content: '⏳ Tempo para escolher o starter expirou.',
          embeds: [],
          components: []
        })
      }
    })
  }
}