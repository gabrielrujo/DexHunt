const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { getPokemonById } = require('../services/pokeapi')

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spawn')
    .setDescription('Spawna um Pokémon aleatório'),

  async execute(interaction) {
    await interaction.deferReply()

    const id = randomInt(1, 1025) // pode ajustar depois
    const pokemon = await getPokemonById(id)

    const sprite =
      pokemon.sprites?.other?.['official-artwork']?.front_default ||
      pokemon.sprites?.front_default

    const types = pokemon.types.map((t) => t.type.name).join(', ')
    const content = `🐾 **Spawnou:** **${pokemon.name}** (ID ${pokemon.id})\nTipos: ${types}`

    if (sprite) {
      const embed = new EmbedBuilder().setImage(sprite)
      await interaction.editReply({ content, embeds: [embed] })
    } else {
      await interaction.editReply(content)
    }
  }
}
