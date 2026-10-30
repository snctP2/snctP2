function getAnoFromUrl() {
    const ano = new URLSearchParams(window.location.search).get('ano');
    return ano ? parseInt(ano, 10) : 2026;
}

// "2025-10-20" -> "20 de outubro de 2025" (sem problemas de fuso horário)
function formatarDataCompleta(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
}

async function fetchItems(ano) {
    const accordion = document.getElementById('accordionExample');
    try {
        const arquivos = [
            `pages/assets/data/programacao_${ano}.json`,
            'pages/assets/data/programacao.json'
        ];

        let data = null;
        for (const arquivo of arquivos) {
            try {
                const url = `${arquivo}?v=${Date.now()}`;
                const r = await fetch(url);
                if (!r.ok) throw new Error('HTTP ' + r.status);
                data = await r.json();
                break;
            } catch (error) {
                continue;
            }
        }

        if (!data) throw new Error('Nenhum arquivo de programação encontrado.');

        let items = (data.items || []).slice().sort((a, b) => a.date.localeCompare(b.date));
        if (ano) items = items.filter(i => parseInt(i.date.slice(0, 4), 10) === ano);

        accordion.innerHTML = '';

        if (items.length === 0) {
            accordion.innerHTML = `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button" type="button" disabled>
                            Nenhum item disponível
                        </button>
                    </h2>
                    <hr>
                </div>`;
            return;
        }

        items.forEach((item, idx) => {
            const media = item.embed || item.image_path;
            const mediaMarkup = media
                ? (String(media).includes('<blockquote') || String(media).includes('<iframe')
                    ? `<div class="programacao-media">${media}</div>`
                    : `<div class="programacao-media"><img src="${media}" class="arteprogram"></div>`)
                : '';

            accordion.insertAdjacentHTML('beforeend', `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-outline-btn" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${idx}">
                            <p class="date">${formatarDataCompleta(item.date)}</p>
                            <hr class="hr-programação">
                            <p class="location">${item.location}</p>
                        </button>
                    </h2>
                    <div id="collapse${idx}" class="accordion-collapse collapse">
                        <div class="accordion-body">
                            ${mediaMarkup}
                            <h2 class="h2-destaque text-start text">${item.text}</h2>
                        </div>
                    </div>
                    <hr>
                </div>`);
        });

        const renderInstagramEmbeds = () => {
            if (window.instgrm && window.instgrm.Embeds) {
                window.instgrm.Embeds.process();
            }

            setTimeout(() => {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    const instagramFrames = document.querySelectorAll('.programacao-media iframe.instagram-media');
                    instagramFrames.forEach((frame) => {
                        const fallback = document.createElement('a');
                        fallback.href = 'https://www.instagram.com/snctp2/p/Dd6WOMXlf4D/';
                        fallback.target = '_blank';
                        fallback.rel = 'noopener noreferrer';
                        fallback.className = 'instagram-fallback';
                        fallback.textContent = 'Ver publicação no Instagram';
                        frame.parentElement.replaceChild(fallback, frame);
                    });
                }
            }, 1200);
        };

        renderInstagramEmbeds();
        if (!window.instgrm) {
            const script = document.createElement('script');
            script.async = true;
            script.defer = true;
            script.src = 'https://www.instagram.com/embed.js';
            script.onload = renderInstagramEmbeds;
            document.body.appendChild(script);
        }
    } catch (e) {
        console.error('Erro ao carregar a programação:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => fetchItems(getAnoFromUrl()));
