# TR Interiores — site institucional

Site estático de duas páginas, sem build e sem dependências. Dá para editar em
qualquer editor de texto e publicar arrastando a pasta para um serviço de
hospedagem.

## Estrutura

| Arquivo | O que é |
|---|---|
| `index.html` | Página principal: hero, método, produtos, sobre e FAQ |
| `contato.html` | Página de contato: formulário e canais diretos |
| `styles.css` | Todo o visual das duas páginas (paleta, tipografia, responsivo) |
| `script.js` | Menu mobile, revelação em scroll, FAQ e validação do formulário |

O botão "Fale conosco" do topo e os botões "Solicitar proposta" dos produtos
levam para `contato.html`.

## Ver o site no computador

Basta abrir `index.html` com duplo clique no navegador. Funciona direto do
arquivo, sem servidor.

## Antes de publicar — pendências

Estes pontos ficaram com valor de exemplo porque eu não tinha o dado real.
Procure por `TODO` nos dois arquivos `.html`.

1. **Número de WhatsApp** — só em `contato.html`, em três lugares (dois links
   `wa.me` e o texto exibido). O link usa o formato internacional apenas com
   dígitos: `https://wa.me/5545999999999`.
2. **Perfil do Instagram** — link e texto `@tr.interiores`, em `contato.html`.
3. **Domínio** — as tags `og:url` e `canonical` das duas páginas apontam para
   `https://trinteriores.com.br/`. Ajuste para o domínio real.
4. **Imagem de compartilhamento** — criar `assets/og-image.jpg` em 1200×630 px.
   É a imagem que aparece quando alguém manda o link no WhatsApp.

## Trocar as fotos

As duas fotos da home ficam em `assets/`:

| Arquivo | Onde aparece | Proporção esperada |
|---|---|---|
| `assets/hero.jpg` | Abertura da página (hero) | Retrato, 3:4 |
| `assets/sobre.jpg` | Seção "Sobre" | Paisagem, 4:3 |

Para trocar uma foto, basta **substituir o arquivo mantendo o mesmo nome** —
não é preciso mexer em HTML ou CSS. Se a foto nova tiver proporção diferente da
esperada, o `object-fit: cover` corta o excesso a partir do centro da imagem;
quanto mais perto da proporção indicada acima, menor o corte.

Recomendações: ambas as fotos atuais pesam ~5 MB cada, bem acima do ideal —
antes de publicar, comprima com uma ferramenta como
[Squoosh](https://squoosh.app) ou [TinyPNG](https://tinypng.com), buscando
algo entre 200 e 400 KB por imagem, largura máxima de 2000 px. Isso reduz
bastante o tempo de carregamento, principalmente no celular.

## Fazer o formulário chegar na caixa de entrada

Hoje o botão "Enviar mensagem" abre o aplicativo de e-mail do visitante com a
mensagem pronta. Funciona sem nenhuma configuração, mas depende de o visitante
concluir o envio.

Para receber direto, use um serviço de formulário. Com o
[Formspree](https://formspree.io) (tem plano gratuito):

1. Crie um formulário lá e copie o endereço que eles fornecem.
2. Em `contato.html`, troque `<form class="formulario revelar" id="formulario" novalidate>` por:
   ```html
   <form class="formulario" id="formulario" novalidate
         action="https://formspree.io/f/SEU_CODIGO" method="POST">
   ```
3. Em `script.js`, apague o bloco `formulario.addEventListener('submit', ...)`
   inteiro (a validação nos campos continua funcionando).

Se hospedar na Netlify, é ainda mais simples: adicione `netlify` ao `<form>` e
os envios aparecem no painel deles.

## Publicar

Qualquer uma destas opções serve para site estático e tem plano gratuito:

- **Netlify** — arraste a pasta em app.netlify.com/drop. É o caminho mais rápido.
- **Vercel** — mesmo princípio.
- **GitHub Pages** — se você quiser manter o histórico de versões.

Depois é só apontar o domínio próprio para a hospedagem escolhida.

## Editar o conteúdo

- **Texto**: tudo está nos arquivos `.html`, em português, na ordem em que
  aparece na página. Não há sistema de templates — o que você lê no arquivo é o
  que sai na tela.
- **Nova pergunta no FAQ**: copie um bloco `<details class="item-faq revelar">`
  inteiro e troque o texto.
- **Menu**: o cabeçalho e o rodapé estão duplicados nas duas páginas. Ao incluir
  ou renomear um item, altere nos dois arquivos.
- **Cores**: estão todas no topo do `styles.css`, no bloco `:root`. Mudando ali,
  muda no site inteiro.
- **Tabela de escopo**: fica em `index.html`, dentro de `.tabela-bloco`. Use
  `<span class="sim">✓</span>` para incluso e `<span class="nao">—</span>` para
  não incluso — e ajuste o `aria-label` junto, que é o que leitores de tela leem.

## Notas de acessibilidade

O que já está contemplado, para não se perder em futuras edições: navegação por
teclado com foco visível, link de pular para o conteúdo, `aria-expanded` no menu,
mensagens de erro do formulário associadas aos campos, contraste dentro do
padrão WCAG AA e respeito à preferência de movimento reduzido do sistema.
