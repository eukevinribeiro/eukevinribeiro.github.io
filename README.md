# Kevin Ribeiro · site

Site profissional. Governança de TI e IA: IA com regra, dono e métrica.

HTML estático, sem build. `index.html` e `404.html` são autocontidos (única dependência externa: Google Fonts).

## Publicação

- **Cloudflare Pages**: projeto `kevinribeiro`, no ar em https://kevinribeiro.pages.dev.
  Publicado por API como um único módulo (`_worker.js`) que serve `index.html`, `404.html` e `og.png`:
  `node deploy/build-worker.js` gera `deploy/_worker.js`, enviado em
  `POST /accounts/<id>/pages/projects/kevinribeiro/deployments` (campos `manifest={}`, `branch=main`, `_worker.js`).
  Alternativa mais simples: conectar este repositório ao projeto pelo painel (Connect to Git).
- GitHub Pages: https://eukevinribeiro.github.io (publica a branch `main`).

## Kapi

O mascote da marca (capivara em pixel com cursor âmbar) vive no topo do cartão do agente,
no bloco de contato e na página 404. Regras de uso no Brand Book V3 · Planta.
