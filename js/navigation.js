const navigationButtons = document.querySelectorAll('.btn-header');
const btnBatalla = document.querySelector('.btn-batalla');

const isHtmlFolder = window.location.pathname.includes('/html/');
const pokemonPagePath = isHtmlFolder ? './pokemon.html' : './html/pokemon.html';
const batallaPagePath = isHtmlFolder ? './batalla.html' : './html/batalla.html';

if (btnBatalla) {
    btnBatalla.addEventListener('click', () => {
        window.open(batallaPagePath, '_blank');
    });
}

navigationButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        if (btn.id === 'ver-todos') {
            window.open(pokemonPagePath, '_blank');
            return;
        }

        window.open(`${pokemonPagePath}?tipo=${btn.id}`, '_blank');
    });
});
