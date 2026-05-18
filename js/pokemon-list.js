const listaPokemonElement = document.getElementById('listaPokemon');
const searchInput = document.getElementById('searchInput') || document.getElementById('searchInputTipo');
const btnBuscar = document.querySelector('.btn-search');
const sugerencias = document.getElementById('sugerencias');
const selectTipo = document.getElementById('select-tipo');
const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
const isPokemonPage = window.location.pathname.endsWith('pokemon.html') || window.location.pathname.includes('/html/pokemon.html');
const params = new URLSearchParams(window.location.search);
const tipoQuery = params.get('tipo');

let pokemonesCargados = [];
let cargandoDatos = false;

function formatPokemonId(id) {
    let pokeId = id.toString();
    if (pokeId.length === 1) pokeId = `00${pokeId}`;
    else if (pokeId.length === 2) pokeId = `0${pokeId}`;
    return pokeId;
}

function getCurrentFilterType() {
    if (selectTipo && selectTipo.value !== 'todos') {
        return selectTipo.value;
    }
    return tipoQuery || null;
}

function getCurrentPageList() {
    const tipo = getCurrentFilterType();
    if (!tipo) {
        return pokemonesCargados;
    }
    return pokemonesCargados.filter((pokemon) =>
        pokemon.types.some((type) => type.type.name === tipo)
    );
}

function crearCartaPokemon(data) {
    const pokeId = formatPokemonId(data.id);
    const hp = data.stats[0].base_stat;
    const ataque = data.stats[1].base_stat;
    const defensa = data.stats[2].base_stat;
    const totalStats = Math.round((hp + ataque + defensa) / 3);
    const totalPercent = totalStats;
    const tiposHtml = data.types.map((item) =>
        `<span class="pokemon-type ${item.type.name}">${item.type.name}</span>`
    ).join('');

    const div = document.createElement('div');
    div.classList.add('pokemon');
    div.innerHTML = `
        <p class="pokemon-id-back">#${pokeId}</p>
        <div class="pokemon-imagen">
            <img src="${data.sprites.other['official-artwork'].front_default}" alt="${data.name}">
        </div>
        <div class="pokemon-info">
            <div class="nombre-contenedor">
                <p class="pokemon-id">#${pokeId}</p>
                <h2 class="pokemon-nombre">${data.name}</h2>
                
            </div>
            <div class="pokemon-types">${tiposHtml}</div>
            <div class="pokemon-stats">
                <div class="stat-row">
                    <span class="stat-name">vida</span>
                    <span class="stat-value">${hp}</span>
                </div>
                <div class="barra"><div class="fill" style="width: ${hp}%;"></div></div>
                <div class="stat-row">
                    <span class="stat-name">ataque</span>
                    <span class="stat-value">${ataque}</span>
                </div>
                <div class="barra"><div class="fill" style="width: ${ataque}%;"></div></div>
                <div class="stat-row">
                    <span class="stat-name">defensa</span>
                    <span class="stat-value">${defensa}</span>
                </div>
                <div class="barra"><div class="fill" style="width: ${defensa}%;"></div></div>
            </div>
            <div class="pokemon-total">
                <div class="total-meta">
                    <span>Total stats</span>
                    <strong>${totalStats}</strong>
                </div>
                <div class="total-bar"><div class="fill" style="width: ${totalPercent}%;"></div></div>
                <p class="total-helper">Promedio de estadísticas: ${totalPercent}%</p>
            </div>
        </div>
    `;

    if (isPokemonPage) {
        div.addEventListener('click', () => {
            window.location.href = `detalle.html?id=${data.id}`;
        });
    }

    return div;
}

function renderizarPokemones(lista) {
    if (!listaPokemonElement) return;

    listaPokemonElement.innerHTML = '';

    if (!lista || lista.length === 0) {
        listaPokemonElement.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No se encontraron Pokémon</p>';
        return;
    }

    lista.forEach((pokemon) => {
        listaPokemonElement.appendChild(crearCartaPokemon(pokemon));
    });
}

function filtrarPokemons(texto) {
    if (!texto) {
        mostrarSugerencias([]);
        if (!isIndexPage && listaPokemonElement) {
            renderizarPokemones(getCurrentPageList());
        } else if (listaPokemonElement) {
            listaPokemonElement.innerHTML = '';
        }
        return;
    }

    const listaBase = getCurrentPageList();
    const filtrados = listaBase.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(texto)
    );

    mostrarSugerencias(filtrados.slice(0, 10));
}

async function buscarPokemon(event) {
    if (event) {
        event.preventDefault();
    }

    if (!listaPokemonElement || !searchInput) return;

    const texto = searchInput.value.trim().toLowerCase();
    const listaBase = isIndexPage ? pokemonesCargados : getCurrentPageList();

    if (!texto) {
        if (!isIndexPage) {
            renderizarPokemones(listaBase);
        } else if (listaPokemonElement) {
            listaPokemonElement.innerHTML = '';
        }
        return;
    }

    if (pokemonesCargados.length === 0) {
        await cargarDatosPokemon();
    }

    const exacto = listaBase.filter((pokemon) => pokemon.name.toLowerCase() === texto);
    if (exacto.length > 0) {
        renderizarPokemones(exacto);
        return;
    }

    const parciales = listaBase.filter((pokemon) => pokemon.name.toLowerCase().includes(texto));
    if (parciales.length > 0) {
        renderizarPokemones(parciales);
        return;
    }

    listaPokemonElement.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No se encontró ningún Pokémon con ese nombre.</p>';
}

function mostrarSugerencias(lista) {
    if (!sugerencias) return;

    sugerencias.innerHTML = '';

    lista.forEach((pokemon) => {
        const div = document.createElement('div');
        div.textContent = pokemon.name;
        div.classList.add('sugerencia-item');

        div.addEventListener('click', () => {
            if (!searchInput) return;
            searchInput.value = pokemon.name;
            sugerencias.innerHTML = '';
            searchInput.focus();
        });

        sugerencias.appendChild(div);
    });
}

async function cargarDatosPokemon(limit = 151) {
    if (pokemonesCargados.length > 0 || cargandoDatos) return;
    cargandoDatos = true;
    try {
        pokemonesCargados = await fetchPokemonDetails(limit);
    } catch (error) {
        console.error('Error cargando datos de Pokémon', error);
    } finally {
        cargandoDatos = false;
    }
}

async function cargarPokemon(tipoSeleccionado = null) {
    if (!listaPokemonElement) return;

    listaPokemonElement.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">Cargando...</p>';

    if (tipoSeleccionado === 'todos') {
        tipoSeleccionado = null;
    }

    if (pokemonesCargados.length === 0) {
        await cargarDatosPokemon();
    }

    const listaFiltrada = tipoSeleccionado
        ? pokemonesCargados.filter((pokemon) => pokemon.types.some((type) => type.type.name === tipoSeleccionado))
        : pokemonesCargados;

    renderizarPokemones(listaFiltrada);
}

if (searchInput) {
    searchInput.addEventListener('input', (event) => {
        const texto = event.target.value.toLowerCase();
        if (pokemonesCargados.length === 0) {
            cargarDatosPokemon();
        }
        filtrarPokemons(texto);
    });
}

if (btnBuscar) {
    btnBuscar.addEventListener('click', buscarPokemon);
}

if (selectTipo) {
    selectTipo.addEventListener('change', (event) => {
        if (isIndexPage) {
            const texto = searchInput ? searchInput.value.trim().toLowerCase() : '';
            if (texto) {
                filtrarPokemons(texto);
            }
            return;
        }
        cargarPokemon(event.target.value);
    });
}

if (listaPokemonElement) {
    const params = new URLSearchParams(window.location.search);
    const tipoQuery = params.get('tipo');
    if (selectTipo && tipoQuery) {
        selectTipo.value = tipoQuery;
    }
    if (!isIndexPage) {
        cargarPokemon(tipoQuery);
    }
}
