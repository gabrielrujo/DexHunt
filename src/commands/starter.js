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

    const usersDb = readJson(USERS_DB_PATH, {})

    // verifica se usuário já tem Pokémon
    if (usersDb[userId] && usersDb[userId].captured?.length > 0) {
      return interaction.reply({
        content: 'Você já possui Pokémon e não pode escolher um starter.',
        ephemeral: true
      })
    }

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
      pokemon.sprites?.front_default

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

      if (i.customId === 'starter_confirm') {

        usersDb[userId] = {
          captured: [
            {
              id: pokemon.id,
              name: pokemon.name,
              types: pokemon.types.map(t => t.type.name),
              image: image,
              rarity: 'starter',
              isStarter: true,
              capturedAt: Date.now(),
              serverId: interaction.guildId
            }
          ],
          createdAt: Date.now()
        }

        writeJson(USERS_DB_PATH, usersDb)

        await i.update({
          content: `✅ ${pokemon.name} foi escolhido como seu starter!`,
          embeds: [],
          components: []
        })

      }

      if (i.customId === 'starter_cancel') {

        await i.update({
          content: 'Starter cancelado.',
          embeds: [],
          components: []
        })

      }

    })

    collector.on('end', async collected => {
      if (collected.size === 0) {
        await interaction.editReply({
          content: '⏳ Tempo para escolher o starter expirou.',
          embeds: [],
          components: []
        })
      }
    })
  }
}