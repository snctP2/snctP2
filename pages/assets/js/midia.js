const DATA_DIR = 'pages/assets/data/';
const MEDIA_DIR = 'pages/assets/Css/images/';

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

function mediaHTML(m) {
  if (m.tipo === 'foto') {
    return `<div class="mySlideVideo"><img src="${MEDIA_DIR}${m.url}" class="d-block w-100" alt="Imagem"></div>`;
  }
  if (m.tipo === 'video') {
    return `<div class="mySlideVideo"><video class="d-block w-100" src="${MEDIA_DIR}${m.url}" autoplay loop muted controls>Seu navegador não suporta a tag de vídeo.</video></div>`;
  }
  if (m.tipo === 'embed') {
    // "url" contém o código embed completo (ex.: blockquote do Instagram, iframe do YouTube)
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

    eventos.forEach((ev, i) => {
      const id = `slideshow${ano}_${i}`;
      const wrap = document.createElement('div');
      const midias = ev.midias || [];

      let inner;
      if (midias.length) {
        inner = midias.map(mediaHTML).join('') + `
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
    });

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
