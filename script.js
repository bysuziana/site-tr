/* =====================================================================
   TR Interiores — comportamentos da página
   Sem dependências. Tudo degrada para uma página estática funcional.
   ===================================================================== */
(function () {
  'use strict';

  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------- Ano do rodapé ------------------------- */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = String(new Date().getFullYear());

  /* --------------------- Fio do cabeçalho ao rolar ------------------ */
  var cabecalho = document.getElementById('cabecalho');
  if (cabecalho) {
    var atualizarCabecalho = function () {
      cabecalho.classList.toggle('rolado', window.scrollY > 8);
    };
    atualizarCabecalho();
    window.addEventListener('scroll', atualizarCabecalho, { passive: true });
  }

  /* ------------------------- Menu mobile --------------------------- */
  var botaoMenu = document.getElementById('menu-btn');
  var nav = document.getElementById('nav');

  if (botaoMenu && nav) {
    var fecharMenu = function () {
      nav.classList.remove('aberto');
      botaoMenu.setAttribute('aria-expanded', 'false');
      botaoMenu.setAttribute('aria-label', 'Abrir menu');
      document.body.classList.remove('menu-aberto');
    };

    var abrirMenu = function () {
      nav.classList.add('aberto');
      botaoMenu.setAttribute('aria-expanded', 'true');
      botaoMenu.setAttribute('aria-label', 'Fechar menu');
      document.body.classList.add('menu-aberto');
    };

    botaoMenu.addEventListener('click', function () {
      if (botaoMenu.getAttribute('aria-expanded') === 'true') fecharMenu();
      else abrirMenu();
    });

    // Fecha ao clicar em um link do menu
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) fecharMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('aberto')) {
        fecharMenu();
        botaoMenu.focus();
      }
    });

    // Se a tela crescer com o menu aberto, volta ao estado normal
    window.matchMedia('(min-width: 48.0625rem)').addEventListener('change', function (e) {
      if (e.matches) fecharMenu();
    });
  }

  /* ------------------ Revelação em scroll (fade-up) ---------------- */
  var alvos = document.querySelectorAll('.revelar');

  if (semMovimento || !('IntersectionObserver' in window)) {
    alvos.forEach(function (el) { el.classList.add('visivel'); });
  } else {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visivel');
          observador.unobserve(entrada.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    alvos.forEach(function (el) { observador.observe(el); });
  }

  /* ------------------------ FAQ: um por vez ------------------------ */
  var itensFaq = document.querySelectorAll('.item-faq');
  itensFaq.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      itensFaq.forEach(function (outro) {
        if (outro !== item) outro.open = false;
      });
    });
  });

  /* ---------------------- Formulário de contato --------------------
     Sem backend: o envio monta um e-mail pré-preenchido no cliente do
     usuário. Para receber direto na caixa de entrada, troque por um
     serviço de formulário (Formspree, Netlify Forms, Basin) — veja o
     README.
     ---------------------------------------------------------------- */
  var DESTINO = 'tr.dinteriores@gmail.com';
  var formulario = document.getElementById('formulario');

  if (formulario) {
    var mostrarErro = function (campo, mostrar) {
      var bloco = campo.closest('.campo');
      var erro = bloco ? bloco.querySelector('.campo__erro') : null;
      if (bloco) bloco.classList.toggle('campo--invalido', mostrar);
      if (erro) erro.hidden = !mostrar;
      campo.setAttribute('aria-invalid', mostrar ? 'true' : 'false');
    };

    var validar = function (campo) {
      var ok = campo.value.trim() !== '';
      if (ok && campo.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(campo.value.trim());
      mostrarErro(campo, !ok);
      return ok;
    };

    var obrigatorios = formulario.querySelectorAll('[required]');

    obrigatorios.forEach(function (campo) {
      campo.addEventListener('blur', function () { validar(campo); });
      campo.addEventListener('input', function () {
        if (campo.getAttribute('aria-invalid') === 'true') validar(campo);
      });
    });

    formulario.addEventListener('submit', function (e) {
      e.preventDefault();

      var valido = true;
      var primeiroInvalido = null;

      obrigatorios.forEach(function (campo) {
        if (!validar(campo)) {
          valido = false;
          if (!primeiroInvalido) primeiroInvalido = campo;
        }
      });

      if (!valido) {
        primeiroInvalido.focus();
        return;
      }

      var d = new FormData(formulario);
      var v = function (campo) { return (d.get(campo) || '—').toString().trim() || '—'; };

      var assunto = 'Contato pelo site — ' + v('interesse') + ' — ' + v('cidade');

      var corpo = [
        'VOCÊ',
        'Nome: '            + v('nome'),
        'E-mail: '          + v('email'),
        'WhatsApp: '        + v('whatsapp'),
        'Como chegou: '     + v('origem'),
        '',
        'O IMÓVEL',
        'Cidade: '          + v('cidade'),
        'Tipo: '            + v('tipo'),
        'Área: '            + v('area'),
        'Pretende obra: '   + v('obra'),
        '',
        'O PROJETO',
        'Finalidade: '      + v('finalidade'),
        'Serviço: '         + v('interesse'),
        'Prazo: '           + v('prazo'),
        'Investimento: '    + v('investimento'),
        '',
        'O QUE INCOMODA HOJE',
        v('mensagem')
      ].join('\n');

      window.location.href = 'mailto:' + DESTINO +
        '?subject=' + encodeURIComponent(assunto) +
        '&body='    + encodeURIComponent(corpo);
    });
  }
})();
