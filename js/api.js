const POKE_API_BASE = 'https://pokeapi.co/api/v2/pokemon/';

async function fetchPokemonById(id) {
    const response = await fetch(`${POKE_API_BASE}${id}`);
    if (!response.ok) {
        throw new Error(`Error cargando Pokémon ${id}`);
    }
    return response.json();
}

async function fetchPokemonList(limit = 151) {
    const response = await fetch(`${POKE_API_BASE}?limit=${limit}`);
    if (!response.ok) {
        throw new Error('Error cargando lista de Pokémon');
    }
    const data = await response.json();
    return data.results;
}

async function fetchPokemonDetails(limit = 500) {
    const requests = [];
    for (let id = 1; id <= limit; id += 1) {
        requests.push(fetchPokemonById(id));
    }
    return Promise.all(requests);
}
