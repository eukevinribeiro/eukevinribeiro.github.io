# Site v2 · "Pranchas"

Nova versão do site, **separada** da que está no ar no Cloudflare (kevinribeiro.pages.dev) e da versão do GitHub Pages (raiz deste repositório). Nada aqui substitui o que já está publicado.

## O que mudou em relação à versão atual

- **Pranchas flutuantes:** cada seção é uma prancha técnica sobre um fundo mais escuro, com marcas de registro em âmbar nos cantos e uma faixa de título (PR-01, PR-02...). Cantos retos, coerentes com a marca.
- **Camadas de cor com contraste:** fundo `#050B18` → prancha `#0B1730` → cartão `#13254D` → recorte `#071024`, mais uma prancha âmbar (números) e cartões azuis de destaque.
- **Filtro de projetos com transição:** quem sai recolhe, quem fica desliza até a nova posição (FLIP), quem entra é "desenhado" de cima para baixo, uma linha âmbar varre a grade e o marcador do filtro desliza. O inventário filtra junto.
- **Celular mais denso:** projetos e capacidades viram trilhos horizontais com indicador de posição, opções de contato em 2 colunas, botão de WhatsApp flutuante.
- **Contato "Do que a sua operação precisa?":** marque as necessidades, a "planta" acende os itens e a mensagem é montada para o WhatsApp **(85) 92002-0587**.
- **Em campo:** galeria para fotos de eventos, evidências e certificados, com filtro e ampliação.
- **Trajetória:** linha do tempo com experiências, formações e certificações, com destaque por tipo.
- **Serviços:** seis portas de entrada, cada uma já marca o item no formulário de contato.
- **Notas (blog):** aparece sozinha quando houver a primeira publicação.
- Tema claro e escuro, respeito a "reduzir movimento", navegação por teclado.

## Como editar sem pedir para ninguém

Todo o conteúdo está em `content/*.json`. As fotos ficam em `media/`.

1. **Pelo painel:** abra `seu-site/admin`, entre com o GitHub e edite. Cada "Publicar" vira um commit; a Vercel republica sozinha em ~1 minuto.
2. **Pelo GitHub:** edite o JSON direto no navegador (ícone de lápis) e faça commit.

Para adicionar uma foto de evento: painel → *Em campo* → *Registros* → escolha o item (ou crie um) → *Foto*.
Para pôr sua foto no topo: painel → *Site* → *Perfil* → *Foto do topo*.

## Publicar na Vercel

1. vercel.com → *Add New Project* → importe este repositório.
2. Em *Root Directory*, escolha `v2`. Framework: *Other*. Sem comando de build.
3. Deploy. Cada push no ramo configurado republica o site.

> O painel `/admin` usa o login do GitHub. No primeiro acesso, use a opção de entrar com um token de acesso pessoal do GitHub (permissão de conteúdo no repositório). Se o repositório mudar de nome, atualize `admin/config.yml`.

## Testar no computador

```bash
cd v2 && python3 -m http.server 8080
```

Abra http://localhost:8080 (o site precisa de um servidor para ler os arquivos JSON).
