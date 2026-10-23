const DATA = 'pages/assets/data/';

async function getJSON(file) {
    const r = await fetch(DATA + file);
    if (!r.ok) throw new Error(`${file}: HTTP ${r.status}`);
    return r.json();
}

async function loadInfo() {
    try {
        const ficto = await getJSON('ficto.json');
        const $desc = document.getElementById('descricao');
        const $docs = document.getElementById('ficto-docs-container');
        $desc.innerHTML = '';
        $docs.innerHTML = '';

        (ficto.documentos || []).forEach(doc => {
            $desc.insertAdjacentHTML('beforeend', `<p>${doc.descricao || ''}</p>`);

            if (doc.edital) {
                const a = document.createElement('a');
                a.href = doc.edital;
                a.download = doc.edital.split('/').pop();
                a.className = 'text-capitalize ficto-docs';
                a.innerHTML = `
                    <img src="pages/assets/Css/images/pdfimg.png" class="ficto-img p-2">
                    download ${doc.title || 'Edital'}
                `;
                $docs.appendChild(a);
            }
        });
    } catch (e) {
        console.error('Erro ao carregar dados da FICTO:', e);
    }
}

async function loadCarousel(file, innerId, indicatorsId, carouselId) {
    try {
        const data = await getJSON(file);
        const images = (data.images || []).slice().sort((a, b) => a.posicao - b.posicao);
        const inner = document.getElementById(innerId);
        const indicators = document.getElementById(indicatorsId);
        inner.innerHTML = '';
        indicators.innerHTML = '';

        images.forEach((img, i) => {
            inner.insertAdjacentHTML('beforeend',
                `<div class="carousel-item ${i === 0 ? 'active' : ''}">
                    <img src="${img.caminho}" class="d-block w-100" alt="Imagem ${i + 1}">
                </div>`);
            indicators.insertAdjacentHTML('beforeend',
                `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${i}"
                    ${i === 0 ? 'class="active" aria-current="true"' : ''}></button>`);
        });

        if (images.length) bootstrap.Carousel.getOrCreateInstance('#' + carouselId);
    } catch (e) {
        console.error(`Erro ao carregar ${file}:`, e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadInfo();
    loadCarousel('ficto_trabalhos.json', 'innerTrabalhos', 'indicatorsTrabalhos', 'carouselTrabalhos');
    loadCarousel('ficto_bonelle.json', 'innerFicto', 'indicatorsFicto', 'carouselFicto');
});
