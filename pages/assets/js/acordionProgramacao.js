function getAnoFromUrl() {
    const ano = new URLSearchParams(window.location.search).get('ano');
    return ano ? parseInt(ano, 10) : undefined;
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
        const r = await fetch('pages/assets/data/programacao.json');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const data = await r.json();

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
                            ${item.image_path ? `<img src="${item.image_path}" class="arteprogram">` : ''}
                            <h2 class="h2-destaque text-start text">${item.text}</h2>
                        </div>
                    </div>
                    <hr>
                </div>`);
        });
    } catch (e) {
        console.error('Erro ao carregar a programação:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => fetchItems(getAnoFromUrl()));
