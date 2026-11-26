/* Aravarma class · Básico 3 · La hora
   Relojes dibujados en SVG, escucha y repite, y las actividades A, B, C y D
   (C y D usan tarjetas deslizantes). Usa h, $, speak y setScore de app.js. */
(function () {
  'use strict';

  /* ---------- Palabras de la hora ---------- */
  const UN = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
  const DEC = { 30: 'treinta', 40: 'cuarenta', 50: 'cincuenta' };
  function num(n) {
    if (n < 30) return UN[n];
    const d = Math.floor(n / 10) * 10, u = n % 10;
    return DEC[d] + (u ? ' y ' + UN[u] : '');
  }
  const hn = hh => { hh = ((hh + 11) % 12) + 1; return hh === 1 ? 'una' : num(hh); };
  const art = hh => (((hh + 11) % 12) + 1) === 1 ? 'Es la' : 'Son las';

  /* Frase principal (la que se enseña) */
  function frase(hh, mm) {
    if (mm === 0) return `${art(hh)} ${hn(hh)} en punto`;
    if (mm === 15) return `${art(hh)} ${hn(hh)} y cuarto`;
    if (mm === 30) return `${art(hh)} ${hn(hh)} y media`;
    if (mm === 45) return `${art(hh + 1)} ${hn(hh + 1)} menos cuarto`;
    if (mm > 30) return `${art(hh + 1)} ${hn(hh + 1)} menos ${num(60 - mm)}`;
    return `${art(hh)} ${hn(hh)} y ${num(mm)}`;
  }

  /* ---------- Normalización y variantes aceptadas ---------- */
  const plain = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const clean = s => plain(s).replace(/\b(son|es|las|la|de|por|el|a)\b/g, ' ').replace(/\s+/g, ' ').trim();
  const PER = { m: 'manana', t: 'tarde', n: 'noche' };

  function variantes(hh, mm) {
    const a = hn(hh), b = hn(hh + 1), out = [];
    if (mm === 0) out.push(`${a} en punto`, a);
    else if (mm === 15) out.push(`${a} y cuarto`, `${a} y quince`);
    else if (mm === 30) out.push(`${a} y media`, `${a} y treinta`);
    else if (mm === 45) out.push(`${b} menos cuarto`, `${a} y cuarenta y cinco`);
    else if (mm > 30) out.push(`${b} menos ${num(60 - mm)}`, `${a} y ${num(mm)}`);
    else out.push(`${a} y ${num(mm)}`);
    return out.map(clean);
  }
  /* devuelve {ok, falta} comparando con la hora (y el momento del día si se pide) */
  function evalua(texto, hh, mm, per) {
    let t = clean(texto);
    if (!t) return { vacio: true };
    let gotPer = null;
    Object.entries(PER).forEach(([k, w]) => { if (new RegExp('\\b' + w + '\\b').test(t)) { gotPer = k; t = t.replace(new RegExp('\\b' + w + '\\b'), ' ').replace(/\s+/g, ' ').trim(); } });
    const horaOk = variantes(hh, mm).includes(t);
    if (!per) return { ok: horaOk };
    return { ok: horaOk && gotPer === per, horaOk, perOk: gotPer === per, sinPer: !gotPer };
  }

  /* ---------- Relojes SVG ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  function sv(tag, attrs, ...kids) {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v));
    kids.forEach(k => e.append(k));
    return e;
  }
  const RING = { v: '#8a52c9', p: '#d8479a', b: '#4a7fb5' };
  function reloj(hh, mm, color, label) {
    const s = sv('svg', { viewBox: '0 0 200 200', class: 'hr-clock', role: 'img', 'aria-label': label || `Reloj que marca ${hn(hh)} y ${mm} minutos` });
    s.append(sv('circle', { cx: 104, cy: 106, r: 90, fill: 'rgba(120,80,190,.18)' }));
    s.append(sv('circle', { cx: 100, cy: 100, r: 90, fill: '#fff', stroke: RING[color] || RING.v, 'stroke-width': 8 }));
    for (let i = 0; i < 60; i++) {
      const a = i * 6 * Math.PI / 180, big = i % 5 === 0, r1 = big ? 76 : 80, r2 = 84;
      s.append(sv('line', { x1: 100 + r1 * Math.sin(a), y1: 100 - r1 * Math.cos(a), x2: 100 + r2 * Math.sin(a), y2: 100 - r2 * Math.cos(a), stroke: big ? '#8a52c9' : '#cdbbea', 'stroke-width': big ? 2.4 : 1 }));
    }
    for (let n = 1; n <= 12; n++) {
      const a = n * 30 * Math.PI / 180;
      const t = sv('text', { x: 100 + 62 * Math.sin(a), y: 100 - 62 * Math.cos(a) + 6, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: '#3b1f66', 'font-family': 'Lilita One, Baloo 2, system-ui, sans-serif' });
      t.textContent = n; s.append(t);
    }
    const hand = (ang, len, w, col) => sv('line', { x1: 100 - len * 0.12 * Math.sin(ang), y1: 100 + len * 0.12 * Math.cos(ang), x2: 100 + len * Math.sin(ang), y2: 100 - len * Math.cos(ang), stroke: col, 'stroke-width': w, 'stroke-linecap': 'round' });
    s.append(hand(((hh % 12) * 30 + mm * 0.5) * Math.PI / 180, 44, 7, '#2e1a54'));
    s.append(hand(mm * 6 * Math.PI / 180, 66, 4, '#d8479a'));
    s.append(sv('circle', { cx: 100, cy: 100, r: 6, fill: '#8a52c9' }));
    return s;
  }

  /* Reloj digital (siete segmentos) */
  const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
  function digital(hh, mm, label) {
    const W = 250, H = 150, s = sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'hr-digi', role: 'img', 'aria-label': label || `Reloj digital: ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}` });
    s.append(sv('rect', { x: 40, y: 8, width: 56, height: 16, rx: 6, fill: '#a56ad6' }), sv('rect', { x: 128, y: 8, width: 86, height: 16, rx: 6, fill: '#a56ad6' }));
    s.append(sv('rect', { x: 52, y: 128, width: 36, height: 14, rx: 6, fill: '#a56ad6' }), sv('rect', { x: 166, y: 128, width: 36, height: 14, rx: 6, fill: '#a56ad6' }));
    s.append(sv('rect', { x: 14, y: 18, width: 222, height: 114, rx: 24, fill: '#b985e6', stroke: '#8a52c9', 'stroke-width': 4 }));
    s.append(sv('rect', { x: 28, y: 34, width: 194, height: 82, rx: 14, fill: '#e6d3fb', stroke: '#5b2a97', 'stroke-width': 4 }));
    const P = { a: [8, 0, 20, 4], b: [28, 6, 4, 22], c: [28, 34, 4, 22], d: [8, 56, 20, 4], e: [4, 34, 4, 22], f: [4, 6, 4, 22], g: [8, 28, 20, 4] };
    const dig = (d, x0) => {
      const g = sv('g', { transform: `translate(${x0},48)` });
      Object.entries(P).forEach(([k, [x, y, w, hgt]]) => { if (SEG[d].includes(k)) g.append(sv('rect', { x, y, width: w, height: hgt, rx: 2, fill: '#3b1f66' })); });
      return g;
    };
    const t = String(hh).padStart(2, '0') + String(mm).padStart(2, '0');
    [[t[0], 46], [t[1], 84], [t[2], 134], [t[3], 172]].forEach(([d, x]) => s.append(dig(+d, x)));
    s.append(sv('circle', { cx: 125, cy: 66, r: 3.5, fill: '#3b1f66' }), sv('circle', { cx: 125, cy: 90, r: 3.5, fill: '#3b1f66' }));
    return s;
  }

  /* ---------- Información: relojes de las tarjetas ---------- */
  function mountClocks() {
    document.querySelectorAll('[data-clock]').forEach(el => {
      const [hh, mm, col] = el.dataset.clock.split(',');
      el.replaceChildren(reloj(+hh, +mm, col || 'v', el.dataset.label));
    });
    document.querySelectorAll('[data-digital]').forEach(el => {
      const [hh, mm] = el.dataset.digital.split(',');
      el.replaceChildren(digital(+hh, +mm));
    });
  }

  /* ---------- Escucha y repite ---------- */
  function initEscucha() {
    document.querySelectorAll('.hr-say').forEach(b => {
      b.addEventListener('click', () => { if (typeof speak === 'function') speak(b.dataset.say); b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 900); });
    });
  }

  /* ---------- Carrusel de tarjetas deslizantes ---------- */
  function carrusel(cards, onActive) {
    const track = h('div', { class: 'hr-track', tabindex: '0', 'aria-label': 'Tarjetas deslizantes' }, ...cards);
    const dots = cards.map((_, i) => h('button', { class: 'hr-dot', type: 'button', 'aria-label': `Ir a la tarjeta ${i + 1}`, onclick: () => go(i) }));
    const prev = h('button', { class: 'btn sm hr-nav', type: 'button', 'aria-label': 'Tarjeta anterior', onclick: () => go(cur - 1) }, '‹');
    const next = h('button', { class: 'btn sm hr-nav', type: 'button', 'aria-label': 'Tarjeta siguiente', onclick: () => go(cur + 1) }, '›');
    let cur = 0;
    function pos() { const c = cards[0]; return c.offsetWidth + parseFloat(getComputedStyle(track).columnGap || 14); }
    function go(i) {
      i = Math.max(0, Math.min(cards.length - 1, i));
      track.scrollTo({ left: i * pos(), behavior: 'smooth' });
      mark(i);
    }
    function mark(i) {
      cur = i;
      cards.forEach((c, k) => c.classList.toggle('on', k === i));
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      prev.disabled = i === 0; next.disabled = i === cards.length - 1;
      if (onActive) onActive(i);
    }
    let t;
    track.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(() => { const i = Math.round(track.scrollLeft / pos()); if (i !== cur) mark(Math.max(0, Math.min(cards.length - 1, i))); }, 80); });
    track.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); } });
    mark(0);
    const el = h('div', { class: 'hr-car' }, track, h('div', { class: 'hr-ctrl' }, prev, h('div', { class: 'hr-dots' }, ...dots), next));
    el.go = go;
    return el;
  }

  /* ---------- Actividad A: ¿Qué hora es? (6:30) ---------- */
  function initA() {
    const mount = $('#act-hora-a'); if (!mount) return;
    const OPC = [['A', '6:00', false], ['B', '12:30', false], ['C', '6:30', true]];
    const fb = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    const btns = OPC.map(([l, t, ok]) => {
      const b = h('button', { class: 'hr-opt', type: 'button' }, h('b', null, l + ')'), ' ' + t);
      b.addEventListener('click', () => {
        btns.forEach(x => x.classList.remove('ok', 'no'));
        b.classList.add(ok ? 'ok' : 'no');
        fb.className = 'feedback ' + (ok ? 'ok' : 'no');
        fb.textContent = ok ? '¡Muy bien! El minutero está en el 6: son las seis y media.' : 'Casi. Mira el minutero (la aguja larga): ¿en qué número está?';
        setScore('horaA', ok ? 1 : 0);
      });
      return b;
    });
    mount.replaceChildren(h('div', { class: 'hr-a' },
      h('div', { class: 'hr-qbox' }, h('small', null, '¿QUÉ HORA ES?'), h('span', { 'data-clock': '6,30,v', 'data-label': 'Reloj que marca las seis y media' })),
      h('div', { class: 'hr-opts' }, ...btns)), fb);
    mountClocks();
  }

  /* ---------- Actividad B: escribe la hora de cada reloj ---------- */
  const B_ITEMS = [[1, 0, 'v'], [3, 15, 'p'], [6, 30, 'b'], [8, 45, 'v'], [11, 20, 'p']];
  function initB() {
    const mount = $('#act-hora-b'); if (!mount) return;
    const fb = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    const cols = ['c1', 'c2', 'c3', 'c4', 'c5'];
    const rows = B_ITEMS.map(([hh, mm, col], i) => {
      const inp = h('input', { class: 'hr-in', type: 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': `Hora del reloj ${i + 1}`, placeholder: 'Escribe la hora' });
      const ic = h('span', { class: 'ic', 'aria-hidden': 'true' });
      const tip = h('small', { class: 'hr-ans', hidden: true }, frase(hh, mm) + '.');
      inp.addEventListener('input', () => { inp.closest('.hr-bcard').classList.remove('ok', 'no'); ic.textContent = ''; tip.hidden = true; });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      const el = h('div', { class: 'hr-bcard ' + cols[i] }, h('span', { class: 'hr-n' }, String(i + 1)), h('span', { 'data-clock': `${hh},${mm},${col}` }), inp, h('span', { class: 'hr-row' }, ic), tip);
      return { el, inp, ic, tip, hh, mm };
    });
    let tries = 0;
    function check() {
      let right = 0, filled = 0; tries++;
      rows.forEach(r => {
        r.el.classList.remove('ok', 'no'); r.ic.textContent = ''; r.tip.hidden = true;
        if (!clean(r.inp.value)) return; filled++;
        const ok = evalua(r.inp.value, r.hh, r.mm).ok;
        r.el.classList.add(ok ? 'ok' : 'no'); r.ic.textContent = ok ? '✓' : '✕';
        if (ok) right++; else if (tries > 1) r.tip.hidden = false;
      });
      setScore('horaB', right);
      fb.className = 'feedback ' + (right === rows.length ? 'ok' : 'no');
      fb.textContent = right === rows.length ? '¡Excelente! Las cinco horas son correctas.'
        : !filled ? 'Escribe la hora que indica cada reloj. Por ejemplo: Son las dos y media.'
        : 'Revisa los relojes con ✕. Mira primero la aguja corta (hora) y luego la larga (minutos).';
    }
    function clear() { tries = 0; rows.forEach(r => { r.inp.value = ''; r.el.classList.remove('ok', 'no'); r.ic.textContent = ''; r.tip.hidden = true; }); fb.textContent = ''; setScore('horaB', 0); }
    const ref = h('div', { class: 'hr-ref', hidden: true }, h('b', null, 'Respuestas de referencia'),
      h('ol', null, ...B_ITEMS.map(([hh, mm]) => h('li', null, frase(hh, mm) + '.'))));
    const refBtn = h('button', { class: 'btn sm', type: 'button', 'aria-expanded': 'false', onclick: () => { ref.hidden = !ref.hidden; refBtn.setAttribute('aria-expanded', String(!ref.hidden)); refBtn.textContent = ref.hidden ? 'Ver respuestas de referencia' : 'Ocultar respuestas'; } }, 'Ver respuestas de referencia');
    mount.replaceChildren(h('div', { class: 'hr-bgrid' }, ...rows.map(r => r.el)), fb,
      h('div', { class: 'row-actions', style: 'margin-top:12px' },
        h('button', { class: 'btn go', type: 'button', onclick: check }, 'Validar'),
        h('button', { class: 'btn pink', type: 'button', onclick: clear }, 'Borrar'), refBtn), ref);
    mountClocks();
  }

  /* ---------- Actividad C: 12 relojes, tarjetas deslizantes + tablero ---------- */
  // [hora, minutos, momento (m/t/n), color]
  const C_ITEMS = [
    [6, 0, 'm', 'v'], [7, 30, 't', 'p'], [8, 15, 'n', 'b'], [9, 45, 'm', 'p'], [10, 20, 'n', 'b'], [11, 55, 'm', 'v'],
    [12, 30, 't', 'b'], [2, 0, 't', 'v'], [4, 30, 't', 'p'], [7, 45, 'm', 'v'], [8, 10, 'n', 'p'], [10, 50, 'm', 'b'],
  ];
  const PER_TXT = { m: 'de la mañana', t: 'de la tarde', n: 'de la noche' };
  const PER_ICO = { m: ['🌅', 'amanecer'], t: ['☀️', 'sol de la tarde'], n: ['🌙', 'luna'] };
  function initC() {
    const mount = $('#act-hora-c'); if (!mount) return;
    const ok = new Array(C_ITEMS.length).fill(false), tries = new Array(C_ITEMS.length).fill(0), given = new Array(C_ITEMS.length).fill('');
    const board = [];
    const cards = C_ITEMS.map(([hh, mm, per, col], i) => {
      const inp = h('input', { class: 'hr-in2', type: 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': `Respuesta del reloj ${i + 1}`, placeholder: 'Tu respuesta' });
      const fbk = h('p', { class: 'hr-fb', role: 'status', 'aria-live': 'polite' });
      const btn = h('button', { class: 'btn go hr-check', type: 'button' }, 'Comprobar');
      const card = h('div', { class: 'hr-card c-' + col, 'data-i': i },
        h('span', { class: 'hr-badge' }, `Reloj ${i + 1} de ${C_ITEMS.length}`),
        h('div', { class: 'hr-face' }, h('span', { 'data-clock': `${hh},${mm},${col}` }), h('span', { class: 'hr-sky', title: PER_ICO[per][1], 'aria-label': PER_ICO[per][1] }, PER_ICO[per][0])),
        h('div', { class: 'hr-line' }, inp, btn), fbk);
      function check() {
        if (ok[i]) return;
        const r = evalua(inp.value, hh, mm, per); tries[i]++;
        card.classList.remove('ok', 'no'); fbk.textContent = '';
        if (r.vacio) { fbk.textContent = 'Escribe la hora con palabras. Por ejemplo: Son las dos y media de la tarde.'; return; }
        if (r.ok) {
          ok[i] = true; given[i] = inp.value.trim(); card.classList.add('ok'); inp.readOnly = true; btn.disabled = true;
          fbk.textContent = '✓ ¡Correcto!';
          board[i].textContent = given[i]; board[i].parentNode.classList.add('ok');
          const n = ok.filter(Boolean).length; setScore('horaC', n);
          if (n < ok.length) setTimeout(() => car.go(i + 1), 700);
        } else {
          card.classList.add('no');
          fbk.textContent = r.sinPer && r.horaOk ? '✕ Falta decir si es de la mañana, de la tarde o de la noche.'
            : r.horaOk && !r.perOk ? '✕ La hora está bien, pero revisa el momento del día (mira el dibujo 🌅 ☀️ 🌙).'
            : '✕ Revisa la hora: mira la aguja corta (hora) y la larga (minutos).';
          if (tries[i] > 1) fbk.textContent += ' Respuesta: ' + frase(hh, mm) + ' ' + PER_TXT[per] + '.';
        }
      }
      btn.addEventListener('click', check);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      inp.addEventListener('input', () => { card.classList.remove('no'); fbk.textContent = ''; });
      card.reset = () => { inp.value = ''; inp.readOnly = false; btn.disabled = false; card.classList.remove('ok', 'no'); fbk.textContent = ''; };
      return card;
    });
    const car = carrusel(cards);
    const slots = C_ITEMS.map((_, i) => { const v = h('span', { class: 'hr-bv' }); board[i] = v; return h('li', { class: 'hr-slot', onclick: () => car.go(i) }, h('span', { class: 'hr-bn' }, String(i + 1)), v); });
    const reset = h('button', { class: 'btn pink', type: 'button', onclick: () => {
      ok.fill(false); tries.fill(0); given.fill(''); cards.forEach(c => c.reset());
      board.forEach(b => { b.textContent = ''; b.parentNode.classList.remove('ok'); }); setScore('horaC', 0); car.go(0);
    } }, 'Borrar todo');
    mount.replaceChildren(car,
      h('div', { class: 'hr-board' }, h('h5', null, 'TABLERO DE RESPUESTAS'), h('ol', { class: 'hr-slots' }, ...slots),
        h('small', null, 'Escribe con letra clara y utiliza «de la mañana», «de la tarde» o «de la noche».')),
      h('div', { class: 'row-actions', style: 'margin-top:10px' }, reset));
    mountClocks();
  }

  /* ---------- Actividad D: ¿Qué hora es? (6 ejercicios) ---------- */
  // [tipo, hora, minutos]
  const D_ITEMS = [['d', 8, 15], ['a', 3, 0], ['d', 12, 30], ['a', 5, 45], ['d', 9, 10], ['a', 1, 20]];
  function initD() {
    const mount = $('#act-hora-d'); if (!mount) return;
    const N = D_ITEMS.length, ok = new Array(N).fill(false), tries = new Array(N).fill(0);
    const head = h('div', { class: 'hr-dhead' }, h('b', null, 'D.- ¿Qué hora es? '), 'Selecciona la respuesta correcta. ', h('b', { id: 'hr-dn' }, `(Ejercicio 1 de ${N})`));
    const cards = D_ITEMS.map(([tipo, hh, mm], i) => {
      const inp = h('input', { class: 'hr-in2', type: 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': `Respuesta del ejercicio ${i + 1}`, placeholder: 'Tu respuesta' });
      const fbk = h('p', { class: 'hr-fb', role: 'status', 'aria-live': 'polite' });
      const btn = h('button', { class: 'btn go hr-check', type: 'button' }, 'Comprobar');
      const card = h('div', { class: 'hr-card hr-dcard', 'data-i': i },
        h('div', { class: 'hr-dface' }, tipo === 'd' ? h('span', { 'data-digital': `${hh},${mm}` }) : h('span', { 'data-clock': `${hh},${mm},v` })),
        h('div', { class: 'hr-line' }, inp, btn), fbk);
      function check() {
        if (ok[i]) return;
        const r = evalua(inp.value, hh, mm, null); tries[i]++;
        card.classList.remove('ok', 'no'); fbk.textContent = '';
        if (r.vacio) { fbk.textContent = 'Escribe la hora con palabras. Por ejemplo: Son las dos y media.'; return; }
        if (r.ok) {
          ok[i] = true; card.classList.add('ok'); inp.readOnly = true; btn.disabled = true; fbk.textContent = '✓ ¡Correcto! ' + frase(hh, mm) + '.';
          setScore('horaD', ok.filter(Boolean).length);
          if (i < N - 1) setTimeout(() => car.go(i + 1), 900);
        } else {
          card.classList.add('no'); fbk.textContent = '✕ Inténtalo otra vez.' + (tries[i] > 1 ? ' Respuesta: ' + frase(hh, mm) + '.' : '');
        }
      }
      btn.addEventListener('click', check);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      inp.addEventListener('input', () => { card.classList.remove('no'); fbk.textContent = ''; });
      card.reset = () => { inp.value = ''; inp.readOnly = false; btn.disabled = false; card.classList.remove('ok', 'no'); fbk.textContent = ''; };
      return card;
    });
    const car = carrusel(cards, i => { const e = $('#hr-dn'); if (e) e.textContent = `(Ejercicio ${i + 1} de ${N})`; });
    const reset = h('button', { class: 'btn pink', type: 'button', onclick: () => { ok.fill(false); tries.fill(0); cards.forEach(c => c.reset()); setScore('horaD', 0); car.go(0); } }, 'Borrar todo');
    mount.replaceChildren(head, car, h('div', { class: 'row-actions', style: 'margin-top:10px' }, reset));
    mountClocks();
  }

  mountClocks(); initEscucha(); initA(); initB(); initC(); initD();
})();
