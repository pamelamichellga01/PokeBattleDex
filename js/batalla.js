const searchInput = document.getElementById('searchInput');
const sugerencias = document.getElementById('sugerencias');
const btnAgregar = document.querySelector('.btn-search');
const btnHuman = document.getElementById('btn-human');
const btnMaquina = document.getElementById('btn-maquina');
const btnCombat = document.querySelector('.btn-combate');
const selectTipo = document.getElementById('select-tipo');
const resultadoBatalla = document.getElementById('resultado-batalla');

let pokemonesCargados = [];
let cargandoDatos = false;

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

function getCurrentFilterType() {
    if (selectTipo && selectTipo.value !== 'todos') {
        return selectTipo.value;
    }
    return null;
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

function filtrarPokemons(texto) {
    if (!texto) {
        mostrarSugerencias([]);
        return;
    }

    const listaBase = getCurrentPageList();
    const filtrados = listaBase.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(texto.toLowerCase())
    );

    mostrarSugerencias(filtrados.slice(0, 5));
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

const contenedor = document.querySelector('#jugador-uno .contenedor-batalla');
const contenedorDos = document.querySelector('#jugador-dos .contenedor-batalla');
const contMaquina = document.querySelector('#maquina .contenedor-batalla');
let cards = [];
let cardsDos = [];
let cardsMaquina = [];
let mode = 'human';
let nextIndexUno = 0;
let nextIndexDos = 0;

function createEmptySlot() {
    const div = document.createElement('div');
    div.classList.add('pokemon');
    div.dataset.empty = 'true';
    return div;
}

function createBattleCard(data) {
    const pokeId = String(data.id).padStart(3, '0');
    const hp = data.stats[0].base_stat;
    const ataque = data.stats[1].base_stat;
    const defensa = data.stats[2].base_stat;
    const score = ((hp + ataque + defensa) / 3).toFixed(2);
    const totalStats = Math.round((hp + ataque + defensa) / 3);
    const totalPercent = totalStats;
    const tiposHtml = data.types.map((item) =>
        `<span class="pokemon-type ${item.type.name}">${item.type.name}</span>`
    ).join('');
    
    const card = document.createElement('div');
    card.classList.add('pokemon');
    card.dataset.empty = 'false';
    card.dataset.score = score;
    card.innerHTML = `
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

    return card;
}

function renderizar(container, cardList, showSwap = true) {
    if (!container) return;

    container.innerHTML = '';

    cardList.forEach((card, i) => {
        container.appendChild(card);

        if (showSwap && i < cardList.length - 1) {
            const btn = document.createElement('button');
            btn.innerHTML = '<i class="fas fa-exchange-alt"></i>';
            btn.classList.add('btn-vs');
            btn.dataset.index = i;
            container.appendChild(btn);
        }
    });
}

function setupSwap(container, cardList) {
    if (!container) return;

    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-vs');
        if (!btn) return;

        const index = parseInt(btn.dataset.index, 10);
        if (Number.isNaN(index) || index < 0 || index >= cardList.length - 1) return;

        [cardList[index], cardList[index + 1]] = [cardList[index + 1], cardList[index]];
        renderizar(container, cardList);
    });
}

function countSelected(cardList) {
    return cardList.filter((card) => card.dataset.empty !== 'true').length;
}

function battleScore(card) {
    return Number(card.dataset.score) || 0;
}

function updateCombatButtonState() {
    if (!btnCombat) return;

    const playerReady = countSelected(cards) === 3;
    if (mode === 'machine') {
        btnCombat.disabled = !(playerReady && countSelected(cardsMaquina) === 3);
    } else {
        btnCombat.disabled = !(playerReady && countSelected(cardsDos) === 3);
    }
}

function buildBattleSummary(matches) {
    const summary = matches.map((match, i) => {
        return `
            <div class="battle-match">
                <strong>Enfrentamiento ${i + 1}:</strong>
                ${match.aName} (${match.aScore}) vs ${match.bName} (${match.bScore}) — <strong>${match.winner}</strong>
            </div>`;
    });
    return summary.join('');
}

function hideLoserCards(teamA, teamB, containerA, containerB) {
    for (let i = 0; i < 3; i += 1) {
        const pokemonA = teamA[i];
        const pokemonB = teamB[i];
        const scoreA = battleScore(pokemonA);
        const scoreB = battleScore(pokemonB);

        if (scoreA > scoreB) {
            teamB[i] = createEmptySlot();
        } else if (scoreB > scoreA) {
            teamA[i] = createEmptySlot();
        }
    }

    renderizar(containerA, teamA, containerA !== contMaquina);
    renderizar(containerB, teamB, containerB !== contMaquina);
    updateCombatButtonState();
}

function computeBattleResult() {
    const teamA = cards;
    const teamB = mode === 'machine' ? cardsMaquina : cardsDos;
    const matches = [];
    let winsA = 0;
    let winsB = 0;
    const winnersA = [];
    const winnersB = [];

    for (let i = 0; i < 3; i += 1) {
        const pokemonA = teamA[i];
        const pokemonB = teamB[i];
        const scoreA = battleScore(pokemonA);
        const scoreB = battleScore(pokemonB);
        const nameA = pokemonA.querySelector('.pokemon-nombre')?.textContent || 'A';
        const nameB = pokemonB.querySelector('.pokemon-nombre')?.textContent || 'B';
        let winner = 'Empate';

        if (scoreA > scoreB) {
            winner = 'Jugador 1';
            winsA += 1;
            winnersA.push({ name: nameA, score: scoreA });
        } else if (scoreB > scoreA) {
            winner = mode === 'machine' ? 'Máquina' : 'Jugador 2';
            winsB += 1;
            winnersB.push({ name: nameB, score: scoreB });
        }

        matches.push({ aName: nameA, aScore: scoreA.toFixed(2), bName: nameB, bScore: scoreB.toFixed(2), winner });
    }

    const containerB = mode === 'machine' ? contMaquina : contenedorDos;
    hideLoserCards(teamA, teamB, contenedor, containerB);

    let finalMessage = '';
    if (winsA > winsB) {
        finalMessage = 'Ganador: Jugador 1';
    } else if (winsB > winsA) {
        finalMessage = mode === 'machine' ? 'Ganador: Máquina' : 'Ganador: Jugador 2';
    } else {
        if (winnersA.length > 0 && winnersB.length > 0) {
            const topA = winnersA.reduce((max, p) => (p.score > max.score ? p : max), winnersA[0]);
            const topB = winnersB.reduce((max, p) => (p.score > max.score ? p : max), winnersB[0]);
            if (topA.score > topB.score) {
                finalMessage = `Desempate: Ganador Jugador 1 con ${topA.name} (${topA.score.toFixed(2)})`;
            } else if (topB.score > topA.score) {
                finalMessage = `Desempate: Ganador ${mode === 'machine' ? 'Máquina' : 'Jugador 2'} con ${topB.name} (${topB.score.toFixed(2)})`;
            } else {
                finalMessage = 'Empate final: los dos equipos quedaron igualados';
            }
        } else {
            finalMessage = 'Empate final: no hay un ganador definido';
        }
    }

    return {
        html: `
            <div class="resultado-card">
                <h3>Resultado del combate</h3>
                <div class="battle-summary">${buildBattleSummary(matches)}</div>
                <p class="battle-final">${finalMessage}</p>
            </div>`,
    };
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomIds(count, max) {
    const ids = new Set();
    while (ids.size < count) {
        ids.add(getRandomIntInclusive(1, max));
    }
    return Array.from(ids);
}

function resetContainer(container, cardList, showSwap = true) {
    if (!container) return;
    for (let i = 0; i < cardList.length; i += 1) {
        cardList[i] = createEmptySlot();
    }
    renderizar(container, cardList, showSwap);
}

async function fillMachineSlotsRandomly() {
    if (!contMaquina) return;
    const ids = getRandomIds(3, 151);

    for (let i = 0; i < 3; i += 1) {
        try {
            const data = await fetchPokemonById(ids[i]);
            cardsMaquina[i] = createBattleCard(data);
        } catch (error) {
            console.error('Error cargando Pokémon de la máquina', error);
            cardsMaquina[i] = createEmptySlot();
        }
    }
    renderizar(contMaquina, cardsMaquina, false);
    updateCombatButtonState();
}

async function addPokemonToBattle(name) {
    if (!name) return;
    try {
        const data = await fetchPokemonById(name.toLowerCase());
        const card = createBattleCard(data);

        if (mode === 'machine') {
            if (nextIndexUno >= 3) return;
            cards[nextIndexUno] = card;
            nextIndexUno += 1;
            renderizar(contenedor, cards);
            return;
        }

        if (nextIndexUno < 3) {
            cards[nextIndexUno] = card;
            nextIndexUno += 1;
            renderizar(contenedor, cards);
            return;
        }

        if (nextIndexDos < 3) {
            cardsDos[nextIndexDos] = card;
            nextIndexDos += 1;
            renderizar(contenedorDos, cardsDos);
            return;
        }
    } catch (error) {
        console.error('No se pudo agregar Pokémon al combate', error);
    }
}

if (contenedor) {
    cards = Array.from(contenedor.querySelectorAll('.pokemon'));
    cards.forEach((slot) => {
        slot.dataset.empty = slot.children.length === 0 ? 'true' : 'false';
    });
    renderizar(contenedor, cards);
    setupSwap(contenedor, cards);
}

if (contenedorDos) {
    cardsDos = Array.from(contenedorDos.querySelectorAll('.pokemon'));
    cardsDos.forEach((slot) => {
        slot.dataset.empty = slot.children.length === 0 ? 'true' : 'false';
    });
    renderizar(contenedorDos, cardsDos);
    setupSwap(contenedorDos, cardsDos);
}

if (contMaquina) {
    cardsMaquina = Array.from(contMaquina.querySelectorAll('.pokemon'));
    cardsMaquina.forEach((slot) => {
        slot.dataset.empty = slot.children.length === 0 ? 'true' : 'false';
    });
    renderizar(contMaquina, cardsMaquina, false);
}

updateCombatButtonState();

const jugadorUno = document.getElementById('jugador-uno');
const jugadorDos = document.getElementById('jugador-dos');
const maquina = document.getElementById('maquina');

if (jugadorUno && jugadorDos && maquina) {
    jugadorUno.style.display = 'none';
    jugadorDos.style.display = 'none';
    maquina.style.display = 'none';

    if (btnHuman) {
        btnHuman.addEventListener('click', () => {
            mode = 'human';
            jugadorUno.style.display = 'block';
            jugadorDos.style.display = 'block';
            maquina.style.display = 'none';
            nextIndexUno = countSelected(cards);
            nextIndexDos = countSelected(cardsDos);
            updateCombatButtonState();
        });
    }

    if (btnMaquina) {
        btnMaquina.addEventListener('click', async () => {
            mode = 'machine';
            jugadorUno.style.display = 'block';
            jugadorDos.style.display = 'none';
            maquina.style.display = 'block';
            nextIndexUno = countSelected(cards);
            await fillMachineSlotsRandomly();
            updateCombatButtonState();
        });
    }
}

if (btnAgregar) {
    btnAgregar.addEventListener('click', async () => {
        const name = searchInput ? searchInput.value.trim() : '';
        if (!name) return;
        await addPokemonToBattle(name);
        updateCombatButtonState();
    });
}

if (btnCombat) {
    btnCombat.disabled = true;
    btnCombat.addEventListener('click', () => {
        if (!resultadoBatalla) return;
        const result = computeBattleResult();
        resultadoBatalla.innerHTML = result.html;
        resultadoBatalla.scrollIntoView({ behavior: 'smooth' });
    });
}

if (searchInput) {
    searchInput.addEventListener('input', (event) => {
        if (pokemonesCargados.length === 0) cargarDatosPokemon();
        filtrarPokemons(event.target.value);
    });
    cargarDatosPokemon();
}

if (selectTipo) {
    selectTipo.addEventListener('change', () => {
        const texto = searchInput ? searchInput.value.trim() : '';
        if (texto) {
            filtrarPokemons(texto);
        }
    });
}
