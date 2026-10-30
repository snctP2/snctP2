function getAnoSubmissao() {
    const ano = new URLSearchParams(window.location.search).get('ano');
    return ano ? parseInt(ano, 10) : 2026;
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const ano = getAnoSubmissao();
        const arquivos = [
            `pages/assets/data/submissao_${ano}.json`,
            'pages/assets/data/submissao.json'
        ];

        let d = null;
        for (const arquivo of arquivos) {
            try {
                const r = await fetch(arquivo);
                if (!r.ok) throw new Error('HTTP ' + r.status);
                d = await r.json();
                break;
            } catch (error) {
                continue;
            }
        }

        if (!d) throw new Error('Nenhum arquivo de submissão encontrado.');

        document.getElementById('descricao').innerHTML = d.descricao || '';
        document.getElementById('regulamento').href = d.regulamento || '#';
        document.getElementById('modelo').href = d.modelo || '#';
        document.getElementById('template').href = d.template || '#';
        const $date = document.getElementById('date');
        if ($date && d.date) $date.textContent = 'Data Limite: ' + d.date;
    } catch (e) {
        console.error('Erro ao carregar os dados de submissão:', e);
    }
});
