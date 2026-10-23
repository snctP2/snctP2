# Site SNCT (estático)

Sem PHP e sem banco de dados. O conteúdo vem de arquivos JSON em `pages/assets/data/`.
Para editar o site, altere o JSON e coloque as imagens/documentos nas pastas abaixo.

## Onde colocar os arquivos
- Imagens e vídeos: `pages/assets/Css/images/`
- Documentos (PDF, DOCX, PPTX): `pages/assets/Css/documents/`

## Arquivos de dados (`pages/assets/data/`)
| Arquivo | Página | O que controla |
|---|---|---|
| `ficto.json` | ficto.html | lista `documentos` (descrição, título e arquivo de cada um) |
| `ficto_trabalhos.json` | ficto.html | carrossel "lista de trabalhos inscritos" |
| `ficto_bonelle.json` | ficto.html | segundo carrossel |
| `submissao.json` | submissao.html | descrição, regulamento, modelo, template |
| `programacao.json` | programacao.html | itens do acordeão; `date` em `AAAA-MM-DD` (o ano filtra `?ano=2025`) |
| `midias.json` | midia2024.html / midia2025.html | eventos e suas mídias (`foto`, `video` ou `embed`) |
| `carrossel.json` | midia2024.html | carrossel do topo |

Em `midias.json`, `foto`/`video` usam só o nome do arquivo (que fica em `Css/images/`);
`embed` recebe o código embed completo (Instagram, YouTube...).

