/* Golden Palace — интерфейс сайта */
(function () {
  'use strict';

  var PHONE = '79272684888';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- шапка, свой ползунок прокрутки, виджет связи ---------- */
  var hdr = document.querySelector('.hdr');
  var sbar = document.querySelector('.scrollbar');
  var thumb = document.querySelector('.scrollbar-thumb');
  var fab = document.querySelector('[data-fab]');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || 0;
    if (hdr) hdr.classList.toggle('stuck', y > 40);

    if (sbar && thumb) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      sbar.classList.toggle('on', max > 300 && y > 120);
      if (max > 0) {
        var rail = sbar.clientHeight - thumb.offsetHeight;
        thumb.style.transform = 'translate(-50%,' + (Math.min(1, y / max) * rail).toFixed(1) + 'px)';
      }
    }

    /* виджет связи не закрывает первый экран */
    if (fab) fab.classList.toggle('on', y > window.innerHeight * 0.55);
  }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  /* вернулись на вкладку или назад по истории — пересчитываем сразу,
     иначе кнопка и ползунок остались бы в старом положении */
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) onScroll();
  });
  window.addEventListener('pageshow', onScroll);
  onScroll();

  if (fab) {
    var fabBtn = fab.querySelector('.fab-btn');
    fabBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = fab.classList.toggle('open');
      fabBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (fab.classList.contains('open') && !fab.contains(e.target)) {
        fab.classList.remove('open');
        fabBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- меню на телефоне ---------- */
  var burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
      document.body.classList.toggle('lock', document.body.classList.contains('menu-open'));
    });
    document.querySelectorAll('.menu a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-open', 'lock');
      });
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.body.classList.remove('menu-open', 'lock');
      var lb = document.querySelector('.lb.on');
      if (lb) lb.classList.remove('on');
      var f = document.querySelector('.fab.open');
      if (f) f.classList.remove('open');
    }
  });

  /* ---------- появление блоков ---------- */
  var reveals = document.querySelectorAll('[data-reveal]');
  if (reveals.length) {
    if (!('IntersectionObserver' in window) || reduce) {
      reveals.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
      reveals.forEach(function (el) { io.observe(el); });

      /* если страницу открыли по якорю или вернулись назад — всё, что осталось
         выше экрана, показываем сразу, иначе оно останется невидимым */
      var showSkipped = function () {
        reveals.forEach(function (el) {
          if (el.classList.contains('in')) return;
          if (el.getBoundingClientRect().bottom < 0) { el.classList.add('in'); io.unobserve(el); }
        });
      };
      window.addEventListener('load', showSkipped);
      window.addEventListener('hashchange', function () { setTimeout(showSkipped, 60); });
      setTimeout(showSkipped, 400);
    }
  }

  /* ---------- счётчики ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        co.unobserve(en.target);
        var el = en.target;
        var target = parseFloat(el.dataset.count);
        var dec = (el.dataset.count.indexOf('.') > -1) ? 1 : 0;
        if (reduce) { el.textContent = fmt(target, dec); return; }
        var t0 = performance.now(), dur = 1300;
        (function step(t) {
          var p = Math.min(1, (t - t0) / dur);
          var e = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(target * e, dec);
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { co.observe(el); });
  }
  function fmt(v, dec) {
    return dec ? v.toFixed(1).replace('.', ',') : Math.round(v).toString();
  }

  /* ---------- заголовок собирается из букв ----------
     Разбиваем слово на буквы, каждой — свой номер для задержки.
     Текст для скринридеров остаётся в aria-label на заголовке. */
  var split = document.querySelector('[data-split]');
  if (split && !reduce) {
    var n = 0;
    split.querySelectorAll('i').forEach(function (word) {
      var text = word.textContent;
      word.textContent = '';
      word.setAttribute('aria-hidden', 'true');
      text.split('').forEach(function (ch) {
        var u = document.createElement('u');
        u.textContent = ch;
        u.style.setProperty('--i', n++);
        word.appendChild(u);
      });
    });
  }

  /* ---------- пылинки света в первом экране ---------- */
  var motes = document.querySelector('.motes');
  if (motes && !reduce) {
    for (var i = 0; i < 18; i++) {
      var s = document.createElement('span');
      s.className = 'mote';
      s.style.left = (Math.random() * 100).toFixed(2) + '%';
      s.style.top = (55 + Math.random() * 45).toFixed(2) + '%';
      s.style.animationDuration = (7 + Math.random() * 9).toFixed(1) + 's';
      s.style.animationDelay = (Math.random() * 8).toFixed(1) + 's';
      s.style.opacity = '0';
      s.style.transform = 'scale(' + (0.5 + Math.random()).toFixed(2) + ')';
      motes.appendChild(s);
    }
  }

  /* ---------- конструктор рассадки ---------- */
  var seat = document.querySelector('[data-seat]');
  if (seat) {
    var range = seat.querySelector('input[type=range]');
    var plan = seat.querySelector('.seat-plan');
    var outN = seat.querySelector('[data-seat-n]');
    var outFormat = seat.querySelector('[data-seat-format]');
    var outTables = seat.querySelector('[data-seat-tables]');
    var outFloor = seat.querySelector('[data-seat-floor]');
    var outWord = seat.querySelector('[data-seat-word]');

    var draw = function () {
      var n = parseInt(range.value, 10);
      outN.textContent = n;
      if (outWord) outWord.textContent = plural(n, 'гость', 'гостя', 'гостей');

      var longTable = n <= 60;
      var perTable = 10;
      var tables = Math.ceil(n / perTable);

      outFormat.textContent = longTable
        ? 'Общий стол, камерная часть зала'
        : (n <= 150 ? 'Круглые столы и танцпол в центре'
          : (n <= 280 ? 'Круглые столы по всему залу' : 'Полная посадка зала'));
      outTables.textContent = longTable
        ? (n <= 30 ? 'Один общий стол' : 'Два общих стола')
        : tables + ' ' + plural(tables, 'круглый стол', 'круглых стола', 'круглых столов') + ' по 10 гостей';
      outFloor.textContent = longTable
        ? 'Свободная зона у сцены'
        : (n <= 280 ? 'Танцпол в центре зала' : 'Танцпол у сцены');

      plan.innerHTML = svg(n, longTable, tables);
    };

    var svg = function (n, longTable, tables) {
      var s = '<svg viewBox="0 0 400 300" role="img" aria-label="Схема расстановки в зале на ' + n + ' гостей">';
      /* стены зала */
      s += '<rect x="10" y="10" width="380" height="280" fill="none" stroke="rgba(200,164,92,.35)"/>';
      /* четыре экрана на дальней стене — ровным рядом, без наложений */
      for (var sx = 0; sx < 4; sx++) {
        s += '<rect x="' + (36 + sx * 86) + '" y="15" width="70" height="10" rx="1" fill="none" stroke="rgba(200,164,92,.5)"/>';
      }
      /* сцена по центру, ниже экранов */
      s += '<rect x="140" y="32" width="120" height="17" rx="1" fill="rgba(200,164,92,.26)" stroke="rgba(200,164,92,.55)"/>';
      s += '<text x="200" y="44" text-anchor="middle" font-size="8" letter-spacing="1.8" fill="#EFD9A4" font-family="Manrope,sans-serif">СЦЕНА</text>';
      /* вход в нижней стене */
      s += '<rect x="170" y="286" width="60" height="8" fill="rgba(200,164,92,.35)"/>';
      s += '<text x="200" y="292.5" text-anchor="middle" font-size="6.5" letter-spacing="1.4" fill="#14100E" font-family="Manrope,sans-serif">ВХОД</text>';

      var d = 0;
      if (longTable) {
        var rows = n <= 30 ? 1 : 2;
        for (var r = 0; r < rows; r++) {
          var x = rows === 1 ? 130 : (r === 0 ? 74 : 226);
          s += '<rect class="tbl" style="animation-delay:' + (d += 60) + 'ms" x="' + x + '" y="98" width="100" height="120" rx="3" fill="rgba(239,217,164,.14)" stroke="rgba(200,164,92,.7)"/>';
          for (var c = 0; c < 6; c++) {
            var cy = 110 + c * 20;
            s += '<circle cx="' + (x - 9) + '" cy="' + cy + '" r="5" fill="rgba(200,164,92,.45)"/>';
            s += '<circle cx="' + (x + 109) + '" cy="' + cy + '" r="5" fill="rgba(200,164,92,.45)"/>';
          }
        }
        s += '<text x="200" y="252" text-anchor="middle" font-size="7.5" letter-spacing="1.6" fill="rgba(245,239,228,.45)" font-family="Manrope,sans-serif">СВОБОДНАЯ ЗОНА</text>';
        return s + '</svg>';
      }

      var g = tables <= 8 ? { c: 4, r: 3, rad: 21 }
        : (tables <= 15 ? { c: 5, r: 4, rad: 17 }
          : (tables <= 24 ? { c: 6, r: 5, rad: 14 } : { c: 8, r: 6, rad: 11 }));
      var x0 = 32, x1 = 368, y0 = 60, y1 = 278;
      var cw = (x1 - x0) / g.c, ch = (y1 - y0) / g.r;
      /* танцпол — два центральных места в среднем ряду */
      var mid = Math.floor((g.c - 1) / 2);
      var floorCols = (g.c % 2 === 0) ? [mid, mid + 1] : [mid];
      var floorRows = [Math.floor(g.r / 2)];
      var cells = [];
      for (var rr = 0; rr < g.r; rr++) {
        for (var cc = 0; cc < g.c; cc++) {
          var isFloor = floorRows.indexOf(rr) > -1 && floorCols.indexOf(cc) > -1;
          if (!isFloor) cells.push([cc, rr]);
        }
      }
      var placed = Math.min(tables, cells.length);
      for (var k = 0; k < placed; k++) {
        var cx = x0 + cells[k][0] * cw + cw / 2;
        var cy2 = y0 + cells[k][1] * ch + ch / 2;
        s += '<g class="tbl" style="animation-delay:' + (k * 28) + 'ms">';
        s += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy2.toFixed(1) + '" r="' + g.rad + '" fill="rgba(239,217,164,.13)" stroke="rgba(200,164,92,.65)"/>';
        if (g.rad >= 14) {
          for (var a = 0; a < 10; a++) {
            var ang = (a / 10) * Math.PI * 2;
            s += '<circle cx="' + (cx + Math.cos(ang) * (g.rad + 5)).toFixed(1) + '" cy="' + (cy2 + Math.sin(ang) * (g.rad + 5)).toFixed(1) + '" r="2.3" fill="rgba(200,164,92,.5)"/>';
          }
        }
        s += '</g>';
      }
      if (floorRows.length) {
        var fx = x0 + floorCols[0] * cw, fy = y0 + floorRows[0] * ch;
        s += '<rect x="' + fx.toFixed(1) + '" y="' + fy.toFixed(1) + '" width="' + (cw * floorCols.length).toFixed(1) + '" height="' + ch.toFixed(1) + '" fill="rgba(200,164,92,.07)" stroke="rgba(200,164,92,.3)" stroke-dasharray="4 4"/>';
        s += '<text x="' + (fx + cw * floorCols.length / 2).toFixed(1) + '" y="' + (fy + ch / 2 + 3).toFixed(1) + '" text-anchor="middle" font-size="7.5" letter-spacing="1.3" fill="rgba(245,239,228,.55)" font-family="Manrope,sans-serif">ТАНЦПОЛ</text>';
      }
      return s + '</svg>';
    };

    range.addEventListener('input', draw);
    draw();

    seat.querySelectorAll('[data-seat-preset]').forEach(function (b) {
      b.addEventListener('click', function () {
        range.value = b.dataset.seatPreset;
        draw();
      });
    });
  }

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }

  /* ---------- форма брони ---------- */
  var form = document.querySelector('[data-booking]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (el) {
        var bad = !el.value.trim();
        el.closest('.field').classList.toggle('err', bad);
        if (bad) ok = false;
      });
      if (!ok) return;

      var v = function (name) {
        var el = form.querySelector('[name=' + name + ']');
        return el ? el.value.trim() : '';
      };
      var lines = [
        'Здравствуйте! Хочу забронировать дату в Golden Palace.',
        'Повод: ' + v('occasion'),
        'Дата: ' + (v('date') ? niceDate(v('date')) : 'уточню'),
        'Гостей: ' + (v('guests') || 'уточню'),
        'Имя: ' + v('name'),
        'Телефон: ' + v('phone')
      ];
      if (v('comment')) lines.push('Комментарий: ' + v('comment'));

      window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(lines.join('\n')), '_blank');
      var okBox = form.querySelector('.form-ok');
      if (okBox) okBox.classList.add('on');
    });

    form.querySelectorAll('input,select,textarea').forEach(function (el) {
      el.addEventListener('input', function () { el.closest('.field').classList.remove('err'); });
    });

    var dateInput = form.querySelector('input[type=date]');
    if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10);
  }

  function niceDate(iso) {
    var m = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    return d.getDate() + ' ' + m[d.getMonth()] + ' ' + d.getFullYear();
  }

  /* ---------- фотографии вместо плашек ----------
     Кладём файл в папку «фото» с именем из подписи плашки — картинка
     подставится сама, править вёрстку не нужно. */
  document.querySelectorAll('.ph[data-file]').forEach(function (fig) {
    var src = fig.getAttribute('data-file');
    if (!src) return;
    var img = new Image();
    img.decoding = 'async';
    img.loading = 'lazy';
    var cap = fig.querySelector('figcaption');
    img.alt = cap ? cap.textContent.trim() : 'Golden Palace';
    img.onload = function () {
      fig.classList.add('has-img');
      fig.insertBefore(img, fig.firstChild);
    };
    img.src = encodeURI(src);
  });

  /* ---------- просмотр фотографии на весь экран ---------- */
  var gals = document.querySelectorAll('.gal .ph img');
  if (gals.length) {
    var lb = document.createElement('div');
    lb.className = 'lb';
    lb.innerHTML = '<button class="lb-close" aria-label="Закрыть">\u00d7</button><img alt="">';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector('img');
    gals.forEach(function (im) {
      im.parentElement.addEventListener('click', function () {
        lbImg.src = im.currentSrc || im.src;
        lbImg.alt = im.alt;
        lb.classList.add('on');
        document.body.classList.add('lock');
      });
    });
    lb.addEventListener('click', function () {
      lb.classList.remove('on');
      document.body.classList.remove('lock');
    });
  }

  /* ---------- год в подвале ---------- */
  var yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
})();
