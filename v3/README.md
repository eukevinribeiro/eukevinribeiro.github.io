# Site v3

Versão do site do Cloudflare (kevinribeiro.pages.dev) com melhorias, para validação antes de substituir a atual.
Arquivo único: `index.html` (mais `og.png`). Para publicar no Cloudflare depois da validação, basta subir esses arquivos.

Novidades: tema claro/escuro, WhatsApp (85) 92002-0587 no menu, no topo e flutuante, filtro de projetos com transição deslizante,
seis portas de serviço, Kapi como agente de IA no método e no contato, seção Em campo, trajetória horizontal e animação do logo original ⇄ IA.

## Colocar fotos em "Em campo"
1. Salve a foto em `v3/media/` (ex.: `palestra.jpg`).
2. No `index.html`, procure o título do registro e preencha `data-img="media/palestra.jpg"` no botão `class="shot"` correspondente.

## Colocar a foto de rosto
Salve a foto em `v3/media/` (ex.: `kevin.jpg`) e no `index.html` preencha `data-img="media/kevin.jpg"` no elemento `id="me-ph"`.
