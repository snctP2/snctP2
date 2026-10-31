const DATA = 'pages/assets/data/';

const LOCAL_FALLBACK_DATA = {
    'ficto.json': {
        documentos: [
            {
                title: 'Edital',
                descricao: 'Venha participar do FICTO 2025, confira as regras logo abaixo no edital.',
                edital: 'pages/assets/documents/eventos/ficto_2025/ficto_2025_edital.pdf'
            },
            {
                title: 'Lista de trabalhos inscritos',
                descricao: 'Lista de trabalhos inscritos do FICTO 2025.',
                edital: 'pages/assets/documents/eventos/ficto_2025/ficto_2025_lista_trabalhos.pdf'
            },
            {
                title: 'Template do banner - FICTO',
                descricao: 'Template do banner do FICTO 2025.',
                edital: 'pages/assets/documents/eventos/ficto_2025/ficto_2025_banner_template.pptx'
            }
        ],
        trabalhos: [
            { posicao: 1, caminho: 'pages/assets/images/eventos/ficto_trabalhos_2025/ficto_2025_trabalho_01.png' },
            { posicao: 2, caminho: 'pages/assets/images/eventos/ficto_trabalhos_2025/ficto_2025_trabalho_02.png' },
            { posicao: 3, caminho: 'pages/assets/images/eventos/ficto_trabalhos_2025/ficto_2025_trabalho_03.png' },
            { posicao: 4, caminho: 'pages/assets/images/eventos/ficto_trabalhos_2025/ficto_2025_trabalho_04.png' },
            { posicao: 5, caminho: 'pages/assets/images/eventos/ficto_trabalhos_2025/ficto_2025_trabalho_05.png' },
            { posicao: 6, caminho: 'pages/assets/images/eventos/ficto_trabalhos_2025/ficto_2025_trabalho_06.png' },
            { posicao: 7, caminho: 'pages/assets/images/eventos/ficto_trabalhos_2025/ficto_2025_trabalho_07.png' },
            { posicao: 8, caminho: 'pages/assets/images/eventos/ficto_trabalhos_2025/ficto_2025_trabalho_08.png' }
        ],
        bonelle: [
            { posicao: 1, caminho: 'pages/assets/images/eventos/ficto_praca_2025/snct_01.jpeg' },
            { posicao: 2, caminho: 'pages/assets/images/eventos/ficto_praca_2025/snct_02.jpeg' },
            { posicao: 3, caminho: 'pages/assets/images/eventos/ficto_praca_2025/snct_03.jpeg' },
            { posicao: 4, caminho: 'pages/assets/images/eventos/ficto_praca_2025/snct_04.jpeg' },
            { posicao: 5, caminho: 'pages/assets/images/eventos/ficto_praca_2025/snct_05.jpeg' },
            { posicao: 6, caminho: 'pages/assets/images/eventos/ficto_praca_2025/snct_06.jpeg' },
            { posicao: 7, caminho: 'pages/assets/images/eventos/ficto_praca_2025/snct_07.jpeg' },
            { posicao: 8, caminho: 'pages/assets/images/eventos/ficto_praca_2025/snct_08.jpeg' },
            { posicao: 9, caminho: 'pages/assets/images/eventos/ficto_praca_2025/snct_09.jpeg' }
        ]
    }
};

function getLocalFallback(file) {
    return LOCAL_FALLBACK_DATA[file] || null;
}

async function getJSON(file) {
    const fallback = getLocalFallback(file);
    if (window.location.protocol === 'file:' && fallback) {
        return fallback;
    }

    try {
        const r = await fetch(DATA + file);
        if (!r.ok) throw new Error(`${file}: HTTP ${r.status}`);
        return await r.json();
    } catch (error) {
        if (fallback) {
            console.warn(`Usando fallback local para ${file}`);
            return fallback;
        }
        throw error;
    }
}

function getPageYear() {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('ano');
    if (fromQuery) return Number(fromQuery);

    const match = window.location.pathname.match(/ficto(\d{4})(?:\.html)?$/i);
    return match ? Number(match[1]) : 2026;
}

async function loadInfo() {
    try {
        const ficto = await getJSON('ficto.json');

        const $desc = document.getElementById('descricao');
        const $docs = document.getElementById('ficto-docs-container');
        $desc.innerHTML = '';
        $docs.innerHTML = '';

        (ficto.documentos || []).forEach(doc => {
            if (doc.descricao) {
                $desc.insertAdjacentHTML('beforeend', `<p>${doc.descricao}</p>`);
            }

            if (doc.edital) {
                const row = document.createElement('div');
                row.className = 'submit-item ficto-doc-row';
                row.innerHTML = `
                    <h2>${doc.title || 'Documento'}</h2>
                    <div class="arquivo ficto-doc-card">
                        <h5>Baixar arquivo</h5>
                        <a href="${doc.edital}" download="${doc.edital.split('/').pop()}" aria-label="Baixar ${doc.title || 'documento'}">
                            <img src="pages/assets/images/geral/pdf_icon.png" alt="Ícone de documento" class="ficto-img">
                        </a>
                    </div>
                `;
                $docs.appendChild(row);
            }
        });
    } catch (e) {
        console.error('Erro ao carregar dados da FICTO:', e);
    }
}

async function loadCarousel(key, innerId, indicatorsId, carouselId) {
    try {
        const data = await getJSON('ficto.json');
        const images = (data[key] || []).slice().sort((a, b) => a.posicao - b.posicao);
        const inner = document.getElementById(innerId);
        const indicators = document.getElementById(indicatorsId);
        if (!inner || !indicators) return;

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
        console.error(`Erro ao carregar ${key}:`, e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const year = getPageYear();
    const title = document.querySelector('.ficto-main h1');
    if (title) title.textContent = `FICTO ${year}`;
    document.title = `FICTO ${year}`;

    loadInfo();
    loadCarousel('trabalhos', 'innerTrabalhos', 'indicatorsTrabalhos', 'carouselTrabalhos');
    loadCarousel('bonelle', 'innerFicto', 'indicatorsFicto', 'carouselFicto');
});
