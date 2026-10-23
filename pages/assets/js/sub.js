document.addEventListener('DOMContentLoaded', async () => {
    try {
        const r = await fetch('pages/assets/data/submissao.json');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const d = await r.json();

        document.getElementById('descricao').innerHTML = d.descricao || '';
        document.getElementById('regulamento').href = d.regulamento || '#';
        document.getElementById('modelo').href = d.modelo || '#';
        document.getElementById('template').href = d.template || '#';
        // Data limite (opcional): descomente o <p id="date"> em submissao.html
        const $date = document.getElementById('date');
        if ($date && d.date) $date.textContent = 'Data Limite: ' + d.date;
    } catch (e) {
        console.error('Erro ao carregar os dados de submissão:', e);
    }
});
