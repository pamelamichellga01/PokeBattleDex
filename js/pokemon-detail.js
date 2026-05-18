const detailMain = document.querySelector('main.main-pokemon');
const btnBack = document.querySelector('.btn-back');

function formatPokemonId(id) {
    let pokeId = id.toString();
    if (pokeId.length === 1) pokeId = `00${pokeId}`;
    else if (pokeId.length === 2) pokeId = `0${pokeId}`;
    return pokeId;
}

function createTypeBadges(types) {
    return types.map((item) => {
        const nombre = item.type.name;
        return `<span class="${nombre}">${nombre.charAt(0).toUpperCase() + nombre.slice(1)}</span>`;
    }).join('');
}

function createAbilitiesList(abilities) {
    return abilities.map((ability) => {
        const nombre = ability.ability.name.replace('-', ' ');
        const label = ability.is_hidden ? ' (oculta)' : '';
        return `<span class="ability-item">${nombre.charAt(0).toUpperCase() + nombre.slice(1)}${label}</span>`;
    }).join('');
}

function createMovesList(moves) {
    return moves.map((move) => {
        const nombre = move.move.name.replace('-', ' ');
        return `<span class="move-item">${nombre.charAt(0).toUpperCase() + nombre.slice(1)}</span>`;
    }).join('');
}

async function cargarDetalle(id) {
    try {
        const data = await fetchPokemonById(id);
        const pokeId = formatPokemonId(data.id);
        const hp = data.stats[0].base_stat;
        const ataque = data.stats[1].base_stat;
        const defensa = data.stats[2].base_stat;
        const ataqueEspecial = data.stats[3].base_stat;
        const defensaEspecial = data.stats[4].base_stat;
        const velocidad = data.stats[5].base_stat;
        const altura = (data.height / 10).toFixed(1);
        const peso = (data.weight / 10).toFixed(1);
        const tiposHtml = createTypeBadges(data.types);
        const habilidadesHtml = createAbilitiesList(data.abilities);
        const movimientosHtml = createMovesList(data.moves.slice(0, 12));
        const totalMovimientos = data.moves.length;

        if (!detailMain) return;

        detailMain.innerHTML = `
            <div class="header-main-pokemon">
                <span class="number-pokemon">#${pokeId}</span>
                <div class="container-img-pokemon">
                    <img src="${data.sprites.other['official-artwork'].front_default}" alt="${data.name}">
                </div>
                <div class="container-info-pokemon">
                    <h1>${data.name}</h1>
                    <div class="card-types">
                        ${tiposHtml}
                    </div>
                    <div class="info-pokemon">
                        <div class="group-info">
                            <p>Altura</p>
                            <span>${altura} m</span>
                        </div>
                        <div class="group-info">
                            <p>Peso</p>
                            <span>${peso} Kg</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="container-stats">
                <div class="stats-section">
                    <h2>Estadísticas</h2>
                    <div class="stats">
                        <div class="stat-group">
                            <span class="stat-name">Hp</span>
                            <div class="progress-bar"><div class="fill" style="width: ${Math.min(hp, 100)}%;">${hp}</div></div>
                            <span class="stat-value">${hp}</span>
                        </div>
                        <div class="stat-group">
                            <span class="stat-name">Attack</span>
                            <div class="progress-bar"><div class="fill" style="width: ${Math.min(ataque, 100)}%;">${ataque}</div></div>
                            <span class="stat-value">${ataque}</span>
                        </div>
                        <div class="stat-group">
                            <span class="stat-name">Defense</span>
                            <div class="progress-bar"><div class="fill" style="width: ${Math.min(defensa, 100)}%;">${defensa}</div></div>
                            <span class="stat-value">${defensa}</span>
                        </div>
                        <div class="stat-group">
                            <span class="stat-name">Special Attack</span>
                            <div class="progress-bar"><div class="fill" style="width: ${Math.min(ataqueEspecial, 100)}%;">${ataqueEspecial}</div></div>
                            <span class="stat-value">${ataqueEspecial}</span>
                        </div>
                        <div class="stat-group">
                            <span class="stat-name">Special Defense</span>
                            <div class="progress-bar"><div class="fill" style="width: ${Math.min(defensaEspecial, 100)}%;">${defensaEspecial}</div></div>
                            <span class="stat-value">${defensaEspecial}</span>
                        </div>
                        <div class="stat-group">
                            <span class="stat-name">Speed</span>
                            <div class="progress-bar"><div class="fill" style="width: ${Math.min(velocidad, 100)}%;">${velocidad}</div></div>
                            <span class="stat-value">${velocidad}</span>
                        </div>
                    </div>
                </div>
                <div class="details-section">
                    <div class="pokemon-abilities">
                        <h2>Habilidades</h2>
                        <div class="ability-list">${habilidadesHtml}</div>
                    </div>
                    <div class="moves-section">
                        <h2>Movimientos</h2>
                        <div class="move-list">${movimientosHtml}</div>
                        <p class="move-note">Mostrando ${Math.min(12, totalMovimientos)} de ${totalMovimientos} movimientos.</p>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error(error);
        if (detailMain) {
            detailMain.innerHTML = '<p style="text-align: center; padding: 2rem;">No se pudo cargar el Pokémon. Intenta nuevamente.</p>';
        }
    }
}

if (detailMain) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
        cargarDetalle(id);
    } else {
        console.error('No se encontró el parámetro id en detalle.html');
    }
}

if (btnBack) {
    btnBack.addEventListener('click', () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'pokemon.html';
        }
    });
}
