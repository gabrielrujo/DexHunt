async function getPokemonById(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!response.ok) {
        throw new Error('Erro ao buscar Pokémon');
    }

    const data = await response.json();
    return data;
}

module.exports = {
    getPokemonById
}
