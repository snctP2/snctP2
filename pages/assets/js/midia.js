const DATA_DIR = 'pages/assets/data/';
const MEDIA_DIR = 'pages/assets/images/eventos/';

function getEventMediaDirectory(event) {
  if (!event) return '';

  const tema = (event.tema || '').toLowerCase();
  const data = event.data_evento || '';

  if (data === '2024-10-16' || tema.includes('meliponicultura')) return `${MEDIA_DIR}nazare_16_10_24/`;
  if (data === '2024-10-25' && tema.includes('abertura')) return `${MEDIA_DIR}abertura_2024/`;
  if (data === '2024-10-25' && tema.includes('mesa redonda')) return `${MEDIA_DIR}mesa_redonda_25_10_2024/`;
  if (data === '2024-10-30' || tema.includes('lagoa')) return `${MEDIA_DIR}lagoa_SF_30_10_2024/`;
  if (data === '2024-11-14' || tema.includes('milton')) return `${MEDIA_DIR}milton_brandao_14_11_2024/`;
  if (data === '2024-11-22' || tema.includes('praça') || tema.includes('praca')) return `${MEDIA_DIR}snct_praca_22_11_2024/`;
  if (data === '2025-02-11' || tema.includes('7 cidades')) return `${MEDIA_DIR}parque_7_cidades_11_02_2025/`;
  if (data === '2025-11-27' || tema.includes('auditorio')) return `${MEDIA_DIR}ficto_auditorio_27_11_2025/`;
  if (tema.includes('ficto') || tema.includes('trabalho')) return `${MEDIA_DIR}ficto_praca_2025/`;

  return '';
}

function buildMediaCandidates(rawUrl, eventDir = '') {
  if (!rawUrl || rawUrl.startsWith('http') || rawUrl.startsWith('data:') || rawUrl.startsWith('<')) {
    return rawUrl ? [rawUrl] : [];
  }

  const normalizedUrl = rawUrl.replace(/^\/+/, '');
  const basename = normalizedUrl.split('/').pop();
  if (!basename) return [];

  const candidates = new Set([rawUrl, normalizedUrl]);

  if (eventDir) candidates.add(`${eventDir}${basename}`);

  const fallbackDirs = [
    `${MEDIA_DIR}abertura_2024/`,
    `${MEDIA_DIR}ficto_auditorio_27_11_2025/`,
    `${MEDIA_DIR}ficto_praca_2025/`,
    `${MEDIA_DIR}lagoa_SF_30_10_2024/`,
    `${MEDIA_DIR}mesa_redonda_25_10_2024/`,
    `${MEDIA_DIR}milton_brandao_14_11_2024/`,
    `${MEDIA_DIR}nazare_16_10_24/`,
    `${MEDIA_DIR}parque_7_cidades_11_02_2025/`,
    `${MEDIA_DIR}snct_praca_2024/`
  ];

  fallbackDirs.forEach(dir => candidates.add(`${dir}${basename}`));
  return [...candidates];
}

async function resolveMediaSource(rawUrl, eventDir = '') {
  if (!rawUrl || rawUrl.startsWith('http') || rawUrl.startsWith('data:') || rawUrl.startsWith('<')) {
    return rawUrl;
  }

  const candidates = buildMediaCandidates(rawUrl, eventDir);

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, { method: 'HEAD' });
      if (response.ok) return candidate;
    } catch (error) {
      // Ignora caminhos inexistentes e tenta o próximo candidato.
    }
  }

  return rawUrl;
}

/* ---------- Slideshow ---------- */
function showSlide(n, slideshow) {
  const container = document.getElementById(slideshow);
  const slides = container.getElementsByClassName('mySlideVideo');
  if (!slides.length) return;

  if (n >= slides.length) n = 0;
  if (n < 0) n = slides.length - 1;

  for (const s of slides) s.style.display = 'none';
  slides[n].style.display = 'block';
}

function passaSlide(n, slideshow) {
  const container = document.getElementById(slideshow);
  const slides = Array.from(container.getElementsByClassName('mySlideVideo'));
  const current = slides.findIndex(s => s.style.display === 'block');
  showSlide(current + n, slideshow);
}

function currentSlide(n, slideshow) {
  showSlide(n, slideshow);
}

/* ---------- Eventos / mídias por ano ---------- */
function formatarData(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
}

async function mediaHTML(m, event) {
  const eventDir = getEventMediaDirectory(event);
  const resolvedUrl = await resolveMediaSource(m.url, eventDir);

  if (m.tipo === 'foto') {
    return `<div class="mySlideVideo"><img src="${resolvedUrl}" class="d-block w-100" alt="Imagem"></div>`;
  }
  if (m.tipo === 'video') {
    return `<div class="mySlideVideo"><video class="d-block w-100" src="${resolvedUrl}" autoplay loop muted controls>Seu navegador não suporta a tag de vídeo.</video></div>`;
  }
  if (m.tipo === 'embed') {
    return `<div class="mySlideVideo">${m.url}</div>`;
  }
  return '';
}

async function fetchEventosPorAno(ano) {
  const container = document.getElementById(`eventos${ano}`) || document.getElementById('eventos');
  if (!container) {
    console.error(`Container de eventos não encontrado para o ano ${ano}.`);
    return;
  }

  try {
    const r = await fetch(DATA_DIR + 'midias.json');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();

    const eventos = (data.eventos || [])
      .filter(e => parseInt(e.data_evento.slice(0, 4), 10) === ano)
      .sort((a, b) => a.data_evento.localeCompare(b.data_evento));

    container.innerHTML = '';

    if (!eventos.length) {
      container.innerHTML = `<div class="media-empty"><p>Nenhum evento disponível para ${ano}.</p></div>`;
      return;
    }

    for (const [i, ev] of eventos.entries()) {
      const id = `slideshow${ano}_${i}`;
      const wrap = document.createElement('div');
      const midias = ev.midias || [];

      let inner;
      if (midias.length) {
        const slides = await Promise.all(midias.map(async (m) => mediaHTML(m, ev)));
        inner = slides.join('') + `
          <a class="prev" onclick="passaSlide(-1, '${id}')">❮</a>
          <a class="next" onclick="passaSlide(1, '${id}')">❯</a>`;
      } else {
        inner = '<div class="media-empty"><p>Nenhuma mídia disponível para este evento.</p></div>';
      }

      wrap.innerHTML = `
        <h1>${formatarData(ev.data_evento)}</h1>
        <h6 class="h6midia">${ev.tema}</h6>
        <hr>
        <div class="slideshow-container" id="${id}">${inner}</div>`;
      container.appendChild(wrap);

      if (midias.length) showSlide(0, id);
    }

    if (window.instgrm) instgrm.Embeds.process();
  } catch (e) {
    console.error('Erro ao carregar eventos:', e);
  }
}

/* ---------- Carrossel (opcional; só roda se existir no HTML) ---------- */
async function loadCarousel() {
  const inner = document.getElementById('carouselInner');
  const indicators = document.getElementById('carouselIndicators');
  const el = document.getElementById('carouselExampleCaptions');
  if (!inner || !indicators || !el) return;

  try {
    const r = await fetch(DATA_DIR + 'carrossel.json');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    const images = (data.images || []).slice().sort((a, b) => a.posicao - b.posicao);

    inner.innerHTML = '';
    indicators.innerHTML = '';

    images.forEach((image, i) => {
      const item = document.createElement('div');
      item.className = 'carousel-item' + (i === 0 ? ' active' : '');
      item.innerHTML = image.caminho.toLowerCase().endsWith('.mp4')
        ? `<video class="d-block w-100" autoplay loop muted controls>
             <source src="${image.caminho}" type="video/mp4">
             Seu navegador não suporta o elemento de vídeo.
           </video>`
        : `<img src="${image.caminho}" class="d-block w-100" alt="Imagem ${i + 1}">`;
      inner.appendChild(item);

      const ind = document.createElement('button');
      ind.type = 'button';
      ind.setAttribute('data-bs-target', '#carouselExampleCaptions');
      ind.setAttribute('data-bs-slide-to', i);
      if (i === 0) ind.className = 'active';
      indicators.appendChild(ind);
    });

    if (images.length) bootstrap.Carousel.getOrCreateInstance(el);
  } catch (e) {
    console.error('Erro ao carregar o carrossel:', e);
  }
}

function getPageYear() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('ano');
  if (fromQuery) return parseInt(fromQuery, 10);

  const match = window.location.pathname.match(/midia(\d{4})(?:\.html)?$/i);
  return match ? parseInt(match[1], 10) : 2026;
}

document.addEventListener('DOMContentLoaded', () => {
  const ano = getPageYear();
  const container = document.getElementById(`eventos${ano}`) || document.getElementById('eventos');
  const title = document.getElementById('tituloEvento');

  if (container) container.id = `eventos${ano}`;
  if (title) title.textContent = `Eventos de ${ano}`;
  if (container) fetchEventosPorAno(ano);
  else console.error('Elemento de eventos não encontrado para o ano informado.');

  loadCarousel();
});
