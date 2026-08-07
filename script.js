/* =====================================================================
   TR Interiores — comportamentos da página
   Sem dependências. Tudo degrada para uma página estática funcional.
   ===================================================================== */
(function () {
  'use strict';

  // Ao recarregar a página, volta ao topo (ou à âncora da URL) em vez de
  // manter a posição de rolagem anterior — é o navegador quem restaura
  // isso por padrão, e aqui desligamos essa restauração.
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

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
     Sem backend: o envio monta a mensagem e entrega pelo WhatsApp
     (canal principal, mais confiável — não depende de o visitante ter
     um cliente de e-mail configurado) ou por e-mail, como alternativa.
     Para receber direto num servidor, troque por um serviço de
     formulário (Formspree, Netlify Forms, Basin) — veja o README.
     ---------------------------------------------------------------- */
  var DESTINO_EMAIL = 'tr.dinteriores@gmail.com';
  var DESTINO_WHATSAPP = '5545991186057';
  var formulario = document.getElementById('formulario');
  var botaoEmail = document.getElementById('enviar-email');

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

    // Uma vez escolhida uma opção real, a opção "Selecione" some da lista
    // para não poder ser escolhida de novo por engano.
    formulario.querySelectorAll('select').forEach(function (select) {
      select.addEventListener('change', function () {
        if (select.value === '') return;
        var placeholder = select.querySelector('option[value=""]');
        if (placeholder) placeholder.disabled = true;
      });
    });

    var obrigatorios = formulario.querySelectorAll('[required]');

    obrigatorios.forEach(function (campo) {
      campo.addEventListener('blur', function () { validar(campo); });
      campo.addEventListener('input', function () {
        if (campo.getAttribute('aria-invalid') === 'true') validar(campo);
      });
    });

    var validarFormulario = function () {
      var valido = true;
      var primeiroInvalido = null;

      obrigatorios.forEach(function (campo) {
        if (!validar(campo)) {
          valido = false;
          if (!primeiroInvalido) primeiroInvalido = campo;
        }
      });

      if (!valido) primeiroInvalido.focus();
      return valido;
    };

    var montarResumo = function () {
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

      return { assunto: assunto, corpo: corpo };
    };

    // Canal principal: WhatsApp. Não depende de o visitante ter um
    // aplicativo de e-mail configurado — abre numa aba nova, como os
    // outros links externos do site.
    formulario.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validarFormulario()) return;

      var resumo = montarResumo();
      var texto = resumo.assunto + '\n\n' + resumo.corpo;
      var url = 'https://wa.me/' + DESTINO_WHATSAPP + '?text=' + encodeURIComponent(texto);
      window.open(url, '_blank', 'noopener');
    });

    // Canal alternativo: e-mail, para quem preferir.
    if (botaoEmail) {
      botaoEmail.addEventListener('click', function () {
        if (!validarFormulario()) return;

        var resumo = montarResumo();
        window.location.href = 'mailto:' + DESTINO_EMAIL +
          '?subject=' + encodeURIComponent(resumo.assunto) +
          '&body='    + encodeURIComponent(resumo.corpo);
      });
    }
  }
})();
