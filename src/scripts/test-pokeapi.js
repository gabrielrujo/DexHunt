const idArg = process.argv[2]
const id = Number(idArg || 1)

if (!Number.isInteger(id) || id <= 0) {
  console.error('Uso: node src/scripts/test-pokeapi.js <id>')
  process.exit(1)
}

async function main() {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
  if (!response.ok) {
    throw new Error(`Erro ao buscar Pokémon: ${response.status}`)
  }

  const data = await response.json()
  const sprite =
    data.sprites?.other?.['official-artwork']?.front_default ||
    data.sprites?.front_default ||
    null

  console.log({
    id: data.id,
    name: data.name,
    sprite
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
