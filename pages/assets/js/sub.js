const LOCAL_SUBMISSION_DATA = {
    'submissao.json': {
        date: '2025-11-14',
        descricao: 'Os autores interessados em apresentar trabalhos na Semana Nacional de Ciência e Tecnologia (SNCT) 2025 poderão submeter seus resumos simples no período de 27 de outubro a 14 de novembro de 2025. A apresentação dos banners será realizada no dia 28 de novembro de 2025, na Praça da Bonelle, a partir das 18h. A confecção e impressão dos banners serão de responsabilidade dos autores. Antes de realizar a submissão, é indispensável a leitura do regulamento disponível no site oficial do evento, onde constam as normas de formatação, critérios de avaliação e demais orientações para participação. Trabalhos enviados fora do prazo ou em desacordo com o regulamento não serão aceitos.',
        regulamento: 'pages/assets/documents/eventos/submissao/submissao_2025_regulamento.docx',
        modelo: 'pages/assets/documents/eventos/submissao/submissao_2025_modelo_resumo.docx',
        template: 'pages/assets/documents/eventos/submissao/submissao_2025_banner_template.pptx'
    },
    'submissao_2025.json': {
        date: '2025-11-14',
        descricao: 'Os autores interessados em apresentar trabalhos na Semana Nacional de Ciência e Tecnologia (SNCT) 2025 poderão submeter seus resumos simples no período de 27 de outubro a 14 de novembro de 2025. A apresentação dos banners será realizada no dia 28 de novembro de 2025, na Praça da Bonelle, a partir das 18h. A confecção e impressão dos banners serão de responsabilidade dos autores. Antes de realizar a submissão, é indispensável a leitura do regulamento disponível no site oficial do evento, onde constam as normas de formatação, critérios de avaliação e demais orientações para participação. Trabalhos enviados fora do prazo ou em desacordo com o regulamento não serão aceitos.',
        regulamento: 'pages/assets/documents/eventos/submissao/submissao_2025_regulamento.docx',
        modelo: 'pages/assets/documents/eventos/submissao/submissao_2025_modelo_resumo.docx',
        template: 'pages/assets/documents/eventos/submissao/submissao_2025_banner_template.pptx'
    },
    'submissao_2026.json': {
        date: '2026-11-13',
        descricao: 'Os autores interessados em apresentar trabalhos na Semana Nacional de Ciência e Tecnologia (SNCT) 2026 poderão submeter seus resumos simples no período da edição, conforme edital oficial. Acompanhe os prazos e normas no regulamento disponível no site e nas redes sociais da organização.',
        regulamento: 'pages/assets/documents/eventos/submissao/submissao_2025_regulamento.docx',
        modelo: 'pages/assets/documents/eventos/submissao/submissao_2025_modelo_resumo.docx',
        template: 'pages/assets/documents/eventos/submissao/submissao_2025_banner_template.pptx'
    }
};

function getAnoSubmissao() {
    const ano = new URLSearchParams(window.location.search).get('ano');
    return ano ? parseInt(ano, 10) : 2026;
}

function getLocalSubmissionData(file) {
    return LOCAL_SUBMISSION_DATA[file] || null;
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
            const fallback = getLocalSubmissionData(arquivo.split('/').pop());
            if (window.location.protocol === 'file:' && fallback) {
                d = fallback;
                break;
            }

            try {
                const r = await fetch(arquivo);
                if (!r.ok) throw new Error('HTTP ' + r.status);
                d = await r.json();
                break;
            } catch (error) {
                if (fallback) {
                    d = fallback;
                    break;
                }
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
