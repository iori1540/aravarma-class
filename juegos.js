/* =====================================================================
   Aravarma class · juegos.js
   Actividades nuevas: Escribe la palabra, Anagramas, arrastrar y soltar,
   cuestionarios de Básico 3, Practiquemos con imágenes y audios propios.
   Se carga antes de app.js; las funciones se usan cuando app.js las llama.
   ===================================================================== */

/* ---------- ayudas ---------- */
const slug = s => fold(String(s)).replace(/ñ/g, 'n').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const letterFile = l => (l === 'ñ' ? 'enie' : l);

/** Reproduce tu audio (carpeta audio/…); si el archivo no existe, habla la voz del navegador. */
function playClip(url, fallback) {
  if (!state.sound) return;
  let fell = false;
  const fb = () => { if (!fell) { fell = true; if (fallback) speak(fallback); } };
  try {
    const a = new Audio(url);
    a.addEventListener('error', fb);
    const p = a.play();
    if (p && p.catch) p.catch(fb);
  } catch (e) { fb(); }
}

const shuffle = arr => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const fmtTime = ms => { const t = Math.floor(ms / 1000); return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); };
const loadBest = id => { try { return +localStorage.getItem('aravarma-best-' + id) || 0; } catch (e) { return 0; } };
const saveBest = (id, v) => { try { localStorage.setItem('aravarma-best-' + id, String(v)); } catch (e) { /* nada */ } };

/** Barra estándar de cada actividad: Borrar y Rehacer (siempre fuera del área de trabajo). */
function actionBar(onErase, onRedo, ...extra) {
  return h('div', { class: 'row-actions act-bar' },
    h('button', { class: 'btn pink', type: 'button', html: ICON_ERASE + '<span>Borrar</span>', onclick: onErase }),
    h('button', { class: 'btn', type: 'button', html: ICON_REDO + '<span>Rehacer</span>', onclick: onRedo }),
    ...extra);
}

/* ---------- dibujos ---------- */
const MASCOT = `<svg class="mascot" viewBox="0 0 100 100" aria-hidden="true">
  <path d="M30 90 C12 80 8 44 24 26 C38 10 66 10 78 26 C92 44 88 80 70 90 Z" fill="#b79af5" stroke="#7f58d6" stroke-width="3" stroke-linejoin="round"/>
  <path d="M34 90 C26 78 28 62 50 62 C72 62 74 78 66 90 Z" fill="#d9c8ff"/>
  <path d="M14 56 C4 52 4 40 10 34 M86 56 C96 52 96 40 90 34" fill="none" stroke="#7f58d6" stroke-width="4" stroke-linecap="round"/>
  <circle cx="38" cy="40" r="9" fill="#fff"/><circle cx="62" cy="40" r="9" fill="#fff"/>
  <circle cx="39" cy="41" r="4.5" fill="#4a1650"/><circle cx="61" cy="41" r="4.5" fill="#4a1650"/>
  <circle cx="30" cy="54" r="5" fill="#ff9ab8" opacity=".7"/><circle cx="70" cy="54" r="5" fill="#ff9ab8" opacity=".7"/>
  <path d="M42 54 q8 9 16 0" fill="none" stroke="#4a1650" stroke-width="3" stroke-linecap="round"/>
</svg>`;
const GAME_MASCOT = `<img class="mascot mascot-bf" src="images/mariposas/mariposa-colores.webp" alt="" aria-hidden="true">`;
const ART = {
  chocolate: `<svg viewBox="0 0 80 110" role="img" aria-label="Una barra de chocolate"><rect x="8" y="6" width="64" height="72" rx="9" fill="#8a4b2f" stroke="#5c2f1b" stroke-width="3"/><path d="M40 6v72M8 42h64" stroke="#5c2f1b" stroke-width="3"/><rect x="13" y="11" width="22" height="26" rx="4" fill="#a8603d"/><rect x="45" y="11" width="22" height="26" rx="4" fill="#a8603d"/><path d="M8 70 L40 60 L72 70 V98 a9 9 0 0 1-9 9 H17 a9 9 0 0 1-9-9Z" fill="#ef5b5b" stroke="#a52f3b" stroke-width="3" stroke-linejoin="round"/><path d="M8 70 L40 60 L72 70 L72 78 L40 70 L8 78Z" fill="#ffc2d6"/><circle cx="30" cy="88" r="4" fill="#4a1650"/><circle cx="50" cy="88" r="4" fill="#4a1650"/><path d="M34 95 q6 5 12 0" fill="none" stroke="#4a1650" stroke-width="2.6" stroke-linecap="round"/></svg>`,
  sol: `<svg viewBox="0 0 100 100" role="img" aria-label="El sol"><g stroke="#f0a91f" stroke-width="6" stroke-linecap="round"><path d="M50 6v14M50 80v14M6 50h14M80 50h14M19 19l10 10M71 71l10 10M81 19L71 29M29 71L19 81"/></g><circle cx="50" cy="50" r="26" fill="#ffd84a" stroke="#f0a91f" stroke-width="4"/><circle cx="41" cy="46" r="3.5" fill="#4a1650"/><circle cx="59" cy="46" r="3.5" fill="#4a1650"/><path d="M42 58 q8 8 16 0" fill="none" stroke="#4a1650" stroke-width="3" stroke-linecap="round"/></svg>`,
  casa: `<svg viewBox="0 0 100 100" role="img" aria-label="Una casa"><path d="M12 48 L50 14 L88 48Z" fill="#e0399c" stroke="#8a1f66" stroke-width="4" stroke-linejoin="round"/><rect x="20" y="46" width="60" height="42" rx="3" fill="#ffd6ea" stroke="#8a1f66" stroke-width="4"/><rect x="42" y="60" width="16" height="28" rx="3" fill="#b79af5" stroke="#8a1f66" stroke-width="3"/><rect x="26" y="54" width="12" height="12" rx="2" fill="#fff" stroke="#8a1f66" stroke-width="3"/><rect x="62" y="54" width="12" height="12" rx="2" fill="#fff" stroke="#8a1f66" stroke-width="3"/></svg>`,
  luna: `<svg viewBox="0 0 100 100" role="img" aria-label="La luna"><path d="M64 10 A40 40 0 1 0 90 62 A32 32 0 1 1 64 10Z" fill="#ffe27a" stroke="#d9a41f" stroke-width="4" stroke-linejoin="round"/><circle cx="38" cy="52" r="3.5" fill="#4a1650"/><path d="M34 66 q8 8 16 0" fill="none" stroke="#4a1650" stroke-width="3" stroke-linecap="round"/></svg>`,
  mariposa: `<svg viewBox="0 0 100 80" role="img" aria-label="Una mariposa de colores"><use href="#butterfly"/></svg>`,
  tulipan: `<svg viewBox="0 0 40 80" role="img" aria-label="Un tulipán"><use href="#tulip"/></svg>`,
  img: (n, alt) => `<img src="images/ejercicios/${n}.webp" alt="${alt}" loading="lazy">`,
};
const ICO = {
  restart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5v6h6"/><path d="M4 11a8 8 0 1 1 2.3 6.3"/></svg>',
  sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/></svg>',
  full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  hint: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 9a3 3 0 1 1 4.2 2.7c-.8.4-1.2 1-1.2 1.8"/><path d="M12 17.5v.1"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M12 11v6M12 7v.1"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 5H9l-6 7 6 7h12z"/><path d="M13 9l4 6M17 9l-4 6"/></svg>',
};

/* =====================================================================
   Panel de juego (Escribe la palabra · Anagramas)
   Con cuenta regresiva, tiempo, mejor tiempo y puntaje.
   ===================================================================== */
function createGame(mount, cfg) {
  const total = cfg.items.length;
  const g = { phase: 'idle', i: 0, score: 0, t0: 0, ms: 0, tick: null, best: loadBest(cfg.id), timers: [] };
  let mode = null;

  const later = (fn, ms) => { const t = setTimeout(fn, ms); g.timers.push(t); return t; };
  const clearLater = () => { g.timers.forEach(clearTimeout); g.timers = []; };

  /* --- piezas fijas --- */
  const timeEl = h('div', { class: 'gp-time', role: 'timer', 'aria-label': 'Tiempo' }, '00:00');
  const bestEl = h('div', { class: 'gp-best' }, h('small', null, 'Mejor tiempo'), h('b', null, g.best ? fmtTime(g.best) : '–'));
  const scoreEl = h('div', { class: 'gp-score', 'aria-live': 'polite' }, h('small', null, 'Puntaje'), h('b', null, '0'));
  const clue = h('div', { class: 'gp-clue' });
  const info = h('div', { class: 'gp-info', hidden: true, role: 'note' }, cfg.info);
  const msg = h('p', { class: 'gp-msg', role: 'status', 'aria-live': 'polite' });
  const main = h('div', { class: 'gp-main' });

  const ctl = (label, ico, fn) => h('button', { class: 'gp-ctl', type: 'button', 'aria-label': label, title: label, html: ico, onclick: fn });
  const btnRestart = ctl('Empezar de nuevo', ICO.restart, () => start());
  const btnSound = ctl('Escuchar', ICO.sound, () => mode && mode.say());
  const btnFull = ctl('Pantalla completa', ICO.full, () => {
    try { if (document.fullscreenElement) document.exitFullscreen(); else root.requestFullscreen(); } catch (e) { /* sin pantalla completa */ }
  });
  const btnHint = ctl('Pista', ICO.hint, () => mode && mode.hint());
  const btnInfo = ctl('Cómo se juega', ICO.info, () => { info.hidden = !info.hidden; });
  const side = h('aside', { class: 'gp-side' },
    h('div', { class: 'gp-mascot', html: GAME_MASCOT }),
    h('div', { class: 'gp-ctls' }, btnRestart, btnSound, btnFull, btnHint, btnInfo),
    timeEl, bestEl, scoreEl, clue);

  const playBtn = h('button', { class: 'gp-play', type: 'button', onclick: () => start() }, 'PLAY');
  const startView = h('div', { class: 'gp-start' },
    h('div', { class: 'gp-mascot big', html: GAME_MASCOT }), h('h4', null, cfg.title), h('p', null, cfg.blurb), playBtn);
  const countView = h('div', { class: 'gp-count', hidden: true, 'aria-live': 'assertive' });
  const stage = h('div', { class: 'gp-stage', hidden: true }, main, side);
  const endView = h('div', { class: 'gp-end', hidden: true });
  const root = h('div', { class: 'gp', 'data-phase': 'idle', tabindex: '-1' },
    h('div', { class: 'gp-bg' }, startView, countView, stage, endView));

  mount.replaceChildren(root, info, actionBar(() => mode && mode.erase(), () => mode && mode.redo()));

  /* --- flujo --- */
  function setPhase(p) {
    g.phase = p; root.dataset.phase = p;
    startView.hidden = p !== 'idle'; countView.hidden = p !== 'count';
    stage.hidden = p !== 'play'; endView.hidden = p !== 'end';
  }
  function tickStart() { clearInterval(g.tick); g.t0 = Date.now(); g.tick = setInterval(() => { g.ms = Date.now() - g.t0; timeEl.textContent = fmtTime(g.ms); }, 250); }
  function setScoreView() { scoreEl.lastChild.textContent = String(g.score); setScore(cfg.id, g.score); }

  function start() {
    clearLater(); clearInterval(g.tick); g.i = 0; g.score = 0; g.ms = 0;
    timeEl.textContent = '00:00'; msg.textContent = ''; info.hidden = true;
    setScoreView(); setPhase('count');
    const seq = ['3', '2', '1', '¡Ya!'];
    seq.forEach((t, k) => later(() => {
      countView.replaceChildren(h('span', { class: 'gp-num' }, t));
      if (k === seq.length - 1) later(() => { setPhase('play'); tickStart(); loadItem(); root.focus(); }, 650);
    }, k * 800));
  }
  function loadItem() {
    msg.textContent = '';
    const item = cfg.items[g.i];
    clue.innerHTML = item.pic || '';
    clue.hidden = !item.pic;
    mode = cfg.mode === 'spell' ? spellMode(item) : anagramMode(item);
    main.replaceChildren(...mode.nodes, msg);
    mode.say();
  }
  function win(extra) {
    g.score++; setScoreView();
    msg.className = 'gp-msg ok'; msg.textContent = extra || '¡Muy bien!';
    root.classList.add('good'); later(() => root.classList.remove('good'), 700);
    later(() => { g.i++; if (g.i >= total) finish(); else loadItem(); }, 1300);
  }
  function wrong(text) {
    msg.className = 'gp-msg no'; msg.textContent = text;
    root.classList.add('shake'); later(() => root.classList.remove('shake'), 500);
  }
  function finish() {
    clearInterval(g.tick);
    const first = !g.best || g.ms < g.best;
    if (first) { g.best = g.ms; saveBest(cfg.id, g.ms); bestEl.lastChild.textContent = fmtTime(g.best); }
    setPhase('end');
    endView.replaceChildren(
      h('div', { class: 'gp-mascot big', html: GAME_MASCOT }),
      h('h4', null, '¡Lo lograste!'),
      h('p', null, `Puntaje: ${g.score} de ${total} · Tiempo: ${fmtTime(g.ms)}${first ? ' · ¡Nuevo mejor tiempo!' : ''}`),
      h('button', { class: 'gp-play', type: 'button', onclick: () => start() }, 'Jugar otra vez'));
  }
  root.addEventListener('keydown', e => { if (g.phase === 'play' && mode && mode.key && !e.ctrlKey && !e.metaKey && !e.altKey) mode.key(e); });

  /* --- modo: Escribe la palabra (Spell it) --- */
  function spellMode(item) {
    const word = item.word.toUpperCase(), len = word.length;
    let typed = [], removed = [], busy = false;
    const pill = h('div', { class: 'gp-pill', 'aria-label': 'Palabra que escribes' });
    function draw() {
      pill.replaceChildren(...[...word].map((_, i) => h('span', { class: 'gp-slot' + (typed[i] ? ' on' : '') }, typed[i] || '')));
      pill.setAttribute('aria-label', typed.length ? 'Escribiste: ' + typed.join('') : 'Palabra que escribes, vacía');
    }
    const add = ch => {
      if (busy || typed.length >= len) return;
      typed.push(ch); removed = []; draw();
      if (typed.length === len) check();
    };
    function check() {
      const r = grade(typed.join(''), [item.word]);
      if (r === 'no') { wrong('Casi. Borra y corrige las letras.'); return; }
      busy = true; typed = [...word]; draw();
      if (window.Registro) Registro.earn(item.word, 'write');
      speak(item.word);
      win(r === 'accent' ? `¡Bien! Se escribe «${item.word}», con tilde.` : '¡Muy bien!');
    }
    const row = letters => h('div', { class: 'gp-krow' }, ...[...letters].map(ch => h('button', { class: 'gp-key', type: 'button', 'aria-label': ch, onclick: () => add(ch) }, ch)));
    const back = h('button', { class: 'gp-key wide', type: 'button', 'aria-label': 'Borrar la última letra', html: ICO.back, onclick: () => api.erase() });
    const kb = h('div', { class: 'gp-kb' }, row('QWERTYUIOP'), row('ASDFGHJKL'),
      h('div', { class: 'gp-krow' }, ...[...'ZXCVBNM'].map(ch => h('button', { class: 'gp-key', type: 'button', 'aria-label': ch, onclick: () => add(ch) }, ch)), back),
      row('ÁÉÍÓÚÑ'));
    const api = {
      nodes: [h('p', { class: 'gp-ask' }, 'Escribe la palabra que ves.'), pill, kb],
      say: () => playClip(`audio/palabras/${slug(item.word)}.mp3`, item.word),
      erase: () => { if (busy || !typed.length) return; removed.push(typed.pop()); draw(); msg.textContent = ''; },
      redo: () => { if (busy || !removed.length || typed.length >= len) return; typed.push(removed.pop()); draw(); if (typed.length === len) check(); },
      hint: () => { if (busy || typed.length >= len) return; add(word[typed.length]); },
      key: e => {
        if (e.key === 'Backspace') { api.erase(); e.preventDefault(); }
        else if (e.key.length === 1 && /[\p{L}]/u.test(e.key)) { add(e.key.toUpperCase()); e.preventDefault(); }
      },
    };
    draw();
    return api;
  }

  /* --- modo: Anagramas (forma la frase con las letras) --- */
  function anagramMode(item) {
    const target = [...item.phrase.toUpperCase()];
    const slotsAt = []; target.forEach((c, i) => { if (c !== ' ') slotsAt.push(i); });
    const letters = slotsAt.map(i => target[i]);
    let order = shuffle(letters.map((c, k) => k));
    for (let tries = 0; tries < 8 && order.every((k, i) => letters[k] === letters[i]); tries++) order = shuffle(order);
    const tiles = order.map((k, id) => ({ id, ch: letters[k], slot: -1 }));
    const fill = Array(letters.length).fill(-1); // slot -> id de ficha
    let removed = [], busy = false, blink = true;
    const slotsBox = h('div', { class: 'gp-slots', role: 'group', 'aria-label': 'Casillas' });
    const tilesBox = h('div', { class: 'gp-tiles', role: 'group', 'aria-label': 'Letras disponibles' });
    function draw() {
      let n = 0;
      slotsBox.replaceChildren(...target.map(c => {
        if (c === ' ') return h('span', { class: 'gp-gap', 'aria-hidden': 'true' });
        const k = n++, id = fill[k];
        return h('button', { class: 'gp-box' + (id >= 0 ? ' on' : ''), type: 'button', 'aria-label': id >= 0 ? `Casilla ${k + 1}: ${tiles[id].ch}. Toca para quitar` : `Casilla ${k + 1}, vacía`, onclick: () => free(k) }, id >= 0 ? tiles[id].ch : '');
      }));
      tilesBox.replaceChildren(...tiles.map(t => h('button', { class: 'gp-tile' + (t.slot >= 0 ? ' used' : '') + (blink ? ' blink' : ''), type: 'button', disabled: t.slot >= 0 ? true : null, 'aria-label': `Letra ${t.ch}`, onclick: () => put(t.id) }, t.ch)));
    }
    function put(id) {
      if (busy) return;
      const k = fill.indexOf(-1); if (k < 0) return;
      fill[k] = id; tiles[id].slot = k; removed = []; blink = false; draw();
      if (fill.indexOf(-1) < 0) check();
    }
    function free(k) { if (busy || fill[k] < 0) return; tiles[fill[k]].slot = -1; fill[k] = -1; draw(); }
    function check() {
      if (fill.map(id => tiles[id].ch).join('') === letters.join('')) {
        busy = true; speak(item.phrase); win('¡Muy bien!');
      } else {
        wrong('Casi. Inténtalo otra vez.');
        busy = true;
        later(() => { fill.fill(-1); tiles.forEach(t => { t.slot = -1; }); busy = false; draw(); }, 900);
      }
    }
    const api = {
      nodes: [h('p', { class: 'gp-ask' }, 'Forma la palabra con las letras disponibles.'), slotsBox, tilesBox],
      say: () => playClip(`audio/palabras/${slug(item.phrase)}.mp3`, item.phrase),
      erase: () => {
        if (busy) return;
        let k = fill.length - 1; while (k >= 0 && fill[k] < 0) k--;
        if (k >= 0) { removed.push(fill[k]); free(k); }
      },
      redo: () => { if (!busy && removed.length) put(removed.pop()); },
      hint: () => {
        if (busy) return;
        const k = fill.findIndex((id, i) => id < 0 || tiles[id].ch !== letters[i]);
        if (k < 0) return;
        if (fill[k] >= 0) free(k);
        const t = tiles.find(x => x.slot < 0 && x.ch === letters[k]);
        if (t) { fill[k] = t.id; t.slot = k; blink = false; draw(); if (fill.indexOf(-1) < 0) check(); }
      },
    };
    draw();
    later(() => { blink = false; draw(); }, 2200);
    return api;
  }

  return { reset: () => { clearLater(); clearInterval(g.tick); setScore(cfg.id, 0); } };
}

/* =====================================================================
   Arrastrar y soltar (Verbo SER C · Verbo TENER A)
   ===================================================================== */
function makeDrop(mount, cfg) {
  const rows = cfg.rows, st = Array(rows.length).fill(null);
  let sel = null, saved = null;
  const bank = h('div', { class: 'dd-bank', role: 'group', 'aria-label': 'Palabras para arrastrar' });
  const list = h('div', { class: 'dd-rows' });
  const fb = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });

  function place(i, chip) {
    st.forEach((c, k) => { if (c === chip) st[k] = null; });
    st[i] = chip; sel = null; paint();
  }
  function paint() {
    const used = new Set(st.filter(Boolean));
    bank.replaceChildren(...cfg.chips.map(c => {
      const b = h('button', { class: 'cloud' + (sel === c ? ' sel' : '') + (used.has(c) ? ' used' : ''), type: 'button', 'aria-pressed': String(sel === c), disabled: used.has(c) ? true : null }, c);
      b.addEventListener('pointerdown', e => beginDrag(e, c, b));
      return b;
    }));
    let right = 0;
    list.replaceChildren(...rows.map((r, i) => {
      const chip = st[i], ok = chip && chip === r.ans;
      if (ok) right++;
      const slot = h('button', { class: 'slot' + (chip ? (ok ? ' ok' : ' no') : ''), type: 'button', 'data-i': i,
        'aria-label': chip ? `${chip}, ${ok ? 'correcto' : 'incorrecto'}. Toca para quitar` : 'Espacio vacío',
        onclick: () => { if (sel) place(i, sel); else if (chip) { st[i] = null; paint(); } } }, chip || '', chip ? h('span', { class: 'ic', 'aria-hidden': 'true' }, ok ? ' ✓' : ' ✕') : null);
      return h('div', { class: 'dd-row' }, h('span', { class: 'dd-pre' }, r.pre), slot, r.post ? h('span', { class: 'dd-post' }, r.post) : null);
    }));
    setScore(cfg.id, right);
    fb.className = 'feedback ok';
    fb.textContent = right === rows.length ? '¡Muy bien! Todas las formas están en su lugar.' : '';
  }
  function beginDrag(e, chip, btn) {
    if (btn.disabled) return;
    const x0 = e.clientX, y0 = e.clientY; let ghost = null;
    const move = ev => {
      if (!ghost && Math.hypot(ev.clientX - x0, ev.clientY - y0) > 6) {
        ghost = h('div', { class: 'cloud ghost' }, chip); document.body.append(ghost); btn.classList.add('drag');
      }
      if (ghost) { ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; ev.preventDefault(); }
    };
    const up = ev => {
      document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up);
      if (ghost) {
        ghost.remove(); btn.classList.remove('drag');
        const t = document.elementFromPoint(ev.clientX, ev.clientY), slot = t && t.closest && t.closest('.slot');
        if (slot && list.contains(slot)) place(+slot.dataset.i, chip);
      } else { sel = sel === chip ? null : chip; paint(); }
    };
    document.addEventListener('pointermove', move, { passive: false }); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
  }
  mount.replaceChildren(bank, list, fb, actionBar(
    () => { if (st.some(Boolean)) saved = st.slice(); st.fill(null); sel = null; paint(); },
    () => { if (saved) { saved.forEach((v, i) => { st[i] = v; }); saved = null; paint(); } }));
  paint();
}

/* =====================================================================
   Cuestionarios (Verbo SER A · Verbo TENER B)
   tipos: mc (opciones), fill (uno o más espacios), text (respuesta corta)
   ===================================================================== */
function quizList(mount, cfg) {
  const items = cfg.items;
  const st = items.map(it => (it.type === 'fill' ? Array(it.ans.length).fill('') : '')), ok = items.map(() => null);
  let saved = null;
  const list = h('div', { class: 'ql' });
  const fb = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });

  function check(i) {
    const it = items[i];
    if (it.type === 'mc') { ok[i] = st[i] === it.ans; return; }
    const vals = it.type === 'fill' ? st[i] : [st[i]];
    const accepted = it.type === 'fill' ? it.ans : [it.ans];
    if (vals.some(v => !String(v).trim())) { ok[i] = null; return; }
    const gs = vals.map((v, k) => grade(v, [accepted[k]]));
    ok[i] = gs.every(x => x !== 'no') ? (gs.some(x => x === 'accent') ? 'accent' : true) : false;
  }
  function paint() {
    let right = 0;
    list.replaceChildren(...items.map((it, i) => {
      const state = ok[i];
      if (state === true || state === 'accent') right++;
      const cls = 'qitem' + (state === true || state === 'accent' ? ' ok' : state === false ? ' no' : '');
      const num = h('b', { class: 'qn' }, it.ex ? 'Ej.' : `${it.n}.`);
      let body;
      if (it.type === 'mc') {
        body = [h('span', { class: 'qt' }, it.q), h('span', { class: 'qopts', role: 'radiogroup', 'aria-label': `Opciones de la oración ${it.n}` },
          ...it.opts.map((o, k) => h('button', { class: 'qopt' + (st[i] === o ? (o === it.ans ? ' ok' : ' no') : ''), type: 'button', role: 'radio', 'aria-checked': String(st[i] === o),
            onclick: () => { st[i] = o; check(i); paint(); } }, `${'abc'[k]}) ${o}`)))];
      } else if (it.ex) {
        body = [h('span', { class: 'qt' }, it.q)];
      } else {
        const parts = it.q.split('___'); let k = 0; const nodes = [];
        const mk = idx => {
          const inp = h('input', { type: 'text', class: 'qin', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': `Respuesta ${it.n}${it.type === 'fill' && it.ans.length > 1 ? ', espacio ' + (idx + 1) : ''}`,
            value: it.type === 'fill' ? st[i][idx] : st[i], size: Math.max(6, (it.type === 'fill' ? it.ans[idx] : (it.ans || '')).length + 2) });
          inp.addEventListener('input', () => { if (it.type === 'fill') st[i][idx] = inp.value; else st[i] = inp.value; ok[i] = null; });
          inp.addEventListener('keydown', e => { if (e.key === 'Enter') { check(i); paint(); } });
          return inp;
        };
        if (it.type === 'text') { nodes.push(h('span', { class: 'qt' }, it.q), mk(0)); }
        else parts.forEach((p, pi) => { nodes.push(p); if (pi < parts.length - 1) nodes.push(mk(k++)); });
        body = [h('span', { class: 'qt' }, ...nodes), h('button', { class: 'btn sm', type: 'button', onclick: () => { check(i); paint(); } }, 'Comprobar')];
      }
      const extra = state === 'accent' ? h('span', { class: 'qmsg' }, `Bien. Se escribe con tilde: ${it.show || it.ans}.`)
        : state === false && it.hint ? h('span', { class: 'qmsg no' }, it.hint)
          : state === true && it.why ? h('span', { class: 'qmsg' }, it.why) : null;
      return h('div', { class: cls }, num, h('div', { class: 'qbody' }, ...body, extra),
        h('span', { class: 'ic', 'aria-hidden': 'true' }, state === true || state === 'accent' ? '✓' : state === false ? '✕' : ''));
    }));
    const scored = items.filter(it => !it.ex).length;
    setScore(cfg.id, right);
    fb.className = 'feedback ok';
    fb.textContent = right === scored ? cfg.done || '¡Todo correcto!' : '';
  }
  mount.replaceChildren(list, fb, actionBar(
    () => { if (st.some(v => (Array.isArray(v) ? v.some(Boolean) : v))) saved = { st: JSON.parse(JSON.stringify(st)), ok: ok.slice() }; items.forEach((it, i) => { st[i] = it.type === 'fill' ? Array(it.ans.length).fill('') : ''; ok[i] = null; }); paint(); },
    () => { if (saved) { saved.st.forEach((v, i) => { st[i] = v; }); saved.ok.forEach((v, i) => { ok[i] = v; }); saved = null; paint(); } }));
  paint();
}

/* =====================================================================
   Contenido
   ===================================================================== */
const SER_A = [
  { n: 1, type: 'mc', q: 'Hola, ___ Ana.', opts: ['soy', 'es', 'eres'], ans: 'soy' },
  { n: 2, type: 'mc', q: 'Ella ___ de Colombia.', opts: ['soy', 'es', 'son'], ans: 'es' },
  { n: 3, type: 'mc', q: '¿Tú ___ médico?', opts: ['es', 'eres', 'soy'], ans: 'eres' },
  { n: 4, type: 'mc', q: 'Nosotros ___ estudiantes.', opts: ['somos', 'son', 'sois'], ans: 'somos' },
  { n: 5, type: 'mc', q: 'Te presento a Luis. Él ___ mi amigo.', opts: ['es', 'soy', 'eres'], ans: 'es' },
  { n: 6, type: 'mc', q: '¿De dónde ___ ellos?', opts: ['son', 'es', 'somos'], ans: 'son' },
  { n: 7, type: 'fill', q: 'Completa: «Yo ___ de Perú y ___ profesora.»', ans: ['soy', 'soy'], why: 'Con «yo» se usa «soy».' },
  { n: 8, type: 'text', q: 'Corrige: «Ella es una médica.» → ', ans: 'Ella es médica', hint: 'Con las profesiones normalmente no se usa artículo.', why: 'Ella es médica.' },
];
const SER_B_TEXT = 'Mi nombre {1} Lucía. {2} de Lima, Perú, pero ahora vivo en Madrid. {3} estudiante de Medicina. Te presento a Carlos: él {4} mi amigo. Carlos {5} de México y {6} ingeniero. Él {7} alto, delgado y muy simpático; también {8} trabajador. Su hermana, Marta, {9} mi compañera de piso. Ella {10} baja y tiene el pelo rizado, pero {11} muy alegre y extrovertida. ¿Y tú? ¿Cómo {12}? ¿De dónde {13}? ¿{14} estudiante o trabajas? Mis amigos y yo {15} un grupo muy unido. Ellos {16} mis mejores amigos y siempre {17} muy divertidos.';
const SER_B = [
  ['es', 'Decir el nombre: Mi nombre es Lucía.'], ['soy', 'Decir de dónde es: Soy de Lima.'], ['soy', 'Decir la profesión: Soy estudiante.'],
  ['es', 'Identificar a una persona: Él es mi amigo.'], ['es', 'Decir de dónde es: Carlos es de México.'], ['es', 'Decir la profesión: Es ingeniero.'],
  ['es', 'Describir físicamente: Es alto, delgado.'], ['es', 'Describir psicológicamente: Es trabajador.'], ['es', 'Identificar a una persona: Ella es mi compañera.'],
  ['es', 'Describir físicamente: Es baja.'], ['es', 'Describir psicológicamente: Es alegre y extrovertida.'], ['eres', 'Describir física/psicológicamente: ¿Cómo eres?'],
  ['eres', 'Decir de dónde es: ¿De dónde eres?'], ['eres', 'Decir la profesión/ocupación: ¿Eres estudiante?'], ['somos', 'Identificar un grupo: Nosotros somos un grupo unido.'],
  ['son', 'Identificar personas: Ellos son mis mejores amigos.'], ['son', 'Describir psicológicamente: Son muy divertidos.'],
];
const SER_C = ['Yo', 'Tú', 'Él / Ella / Usted', 'Nosotros / Nosotras', 'Vosotros / Vosotras', 'Ellos / Ellas / Ustedes'];
const SER_C_ANS = ['soy', 'eres', 'es', 'somos', 'sois', 'son'];
const TEN_A = [
  ['Yo', '20 años.', 'tengo'], ['Nosotros', 'que hacer la tarea.', 'tenemos'], ['¿Tú', 'frío?', 'tienes'],
  ['Ellos', 'una casa muy grande.', 'tienen'], ['Él', 'mucha sed.', 'tiene'], ['Vosotros', 'un examen mañana.', 'tenéis'],
];
const TEN_B = [
  { ex: true, q: 'La mesa tiene cuatro patas.' },
  { n: 2, type: 'fill', q: 'Nosotros no ___ ni un duro, pero somos felices.', ans: ['tenemos'] },
  { n: 3, type: 'fill', q: 'No he dormido bien, ___ mucho sueño.', ans: ['tengo'] },
  { n: 4, type: 'fill', q: '¿Cuántos años ___ Javier?', ans: ['tiene'] },
  { n: 5, type: 'fill', q: 'Mis amigos ___ hambre.', ans: ['tienen'] },
  { n: 6, type: 'fill', q: 'Vosotros ___ dos perros.', ans: ['tenéis'] },
];
const ANAGRAMAS = [{ phrase: 'Tú tienes' }, { phrase: 'Ellos tienen' }, { phrase: 'Nosotros tenemos' }, { phrase: 'Vosotros tenéis' }];

/* Practiquemos: sonido inicial con imágenes */
const PRACTICA = [
  { word: 'mariposa', art: ART.mariposa, opts: ['/p/', '/m/', '/s/'], ans: '/m/' },
  { word: 'pato', art: ART.img('pato', 'Un patito amarillo'), opts: ['/p/', '/b/', '/t/'], ans: '/p/' },
  { word: 'balón', art: ART.img('balon', 'Un balón de fútbol'), opts: ['/d/', '/b/', '/v/'], ans: '/b/' },
  { word: 'mano', art: ART.img('mano', 'Una mano abierta'), opts: ['/n/', '/m/', '/l/'], ans: '/m/' },
  { word: 'chocolate', art: ART.chocolate, opts: ['/ch/', '/s/', '/k/'], ans: '/ch/' },
  { word: 'sol', art: ART.sol, opts: ['/s/', '/z/', '/l/'], ans: '/s/' },
  { word: 'casa', art: ART.img('casa', 'Una casa'), opts: ['/c/', '/s/', '/g/'], ans: '/c/' },
  { word: 'luna', art: ART.luna, opts: ['/l/', '/n/', '/m/'], ans: '/l/' },
  { word: 'dado', art: ART.img('dado', 'Un dado'), opts: ['/d/', '/b/', '/t/'], ans: '/d/' },
  { word: 'hipopótamo', art: ART.img('hipopotamo', 'Un hipopótamo'), opts: ['/h/', '/j/', '/p/'], ans: '/h/' },
  { word: 'rinoceronte', art: ART.img('rinoceronte', 'Un rinoceronte'), opts: ['/r/', '/l/', '/s/'], ans: '/r/' },
  { word: 'barco', art: ART.img('barco', 'Un barco'), opts: ['/b/', '/p/', '/d/'], ans: '/b/' },
  { word: 'chimenea', art: ART.img('chimenea', 'Una chimenea con fuego'), opts: ['/ch/', '/s/', '/m/'], ans: '/ch/' },
  { word: 'llama', art: ART.img('llama', 'Una llama'), opts: ['/ll/', '/l/', '/n/'], ans: '/ll/' },
  { word: 'faro', art: ART.img('faro', 'Un faro sobre rocas'), opts: ['/f/', '/p/', '/b/'], ans: '/f/' },
  { word: 'xilófono', art: ART.img('xilofono', 'Un xilófono de colores'), opts: ['/x/', '/s/', '/j/'], ans: '/x/' },
  { word: 'wafer', art: ART.img('wafer', 'Un wafer de chocolate'), opts: ['/w/', '/g/', '/b/'], ans: '/w/' },
  { word: 'tortuga', art: ART.img('tortuga', 'Una tortuga marina'), opts: ['/t/', '/d/', '/p/'], ans: '/t/' },
  { word: 'queso', art: ART.img('queso', 'Queso'), opts: ['/q/', '/g/', '/ch/'], ans: '/q/' },
  { word: 'jarra', art: ART.img('jarra', 'Una jarra'), opts: ['/j/', '/g/', '/ll/'], ans: '/j/' },
  { word: 'uvas', art: ART.img('uvas', 'Un racimo de uvas'), opts: ['/u/', '/o/', '/b/'], ans: '/u/' },
  { word: 'nido', art: ART.img('nido', 'Un nido'), opts: ['/n/', '/m/', '/d/'], ans: '/n/' },
  { word: 'avestruz', art: ART.img('avestruz', 'Un avestruz'), opts: ['/a/', '/e/', '/o/'], ans: '/a/' },
  { word: 'olla', art: ART.img('olla', 'Una olla'), opts: ['/o/', '/u/', '/a/'], ans: '/o/' },
  { word: 'gato', art: ART.img('gato', 'Un gato'), opts: ['/g/', '/k/', '/d/'], ans: '/g/' },
  { word: 'yoyó', art: ART.img('yoyo', 'Un yoyó rojo'), opts: ['/y/', '/l/', '/m/'], ans: '/y/' },
  { word: 'vaca', art: ART.img('vaca', 'Una vaca'), opts: ['/v/', '/p/', '/m/'], ans: '/v/' },
  { word: 'zorro', art: ART.img('zorro', 'Un zorro'), opts: ['/z/', '/r/', '/ch/'], ans: '/z/' },
  { word: 'rana', art: ART.img('rana', 'Una rana verde'), opts: ['/r/', '/l/', '/n/'], ans: '/r/' },
  { word: 'kiwi', art: ART.img('kiwi', 'Un kiwi'), opts: ['/k/', '/g/', '/p/'], ans: '/k/' },
  { word: 'iglesia', art: ART.img('iglesia', 'Una iglesia'), opts: ['/i/', '/e/', '/l/'], ans: '/i/' },
  { word: 'ñu', art: ART.img('nu', 'Un ñu'), opts: ['/ñ/', '/n/', '/m/'], ans: '/ñ/' },
];
const ESCRIBE = [
  { word: 'chocolate', pic: ART.chocolate }, { word: 'pato', pic: ART.img('pato', 'Un patito amarillo') }, { word: 'balón', pic: ART.img('balon', 'Un balón de fútbol') },
  { word: 'mano', pic: ART.img('mano', 'Una mano abierta') }, { word: 'mariposa', pic: ART.mariposa }, { word: 'tulipán', pic: ART.tulipan },
  { word: 'sol', pic: ART.sol }, { word: 'casa', pic: ART.img('casa', 'Una casa') }, { word: 'luna', pic: ART.luna },
  { word: 'dado', pic: ART.img('dado', 'Un dado') },
  { word: 'hipopótamo', pic: ART.img('hipopotamo', 'Un hipopótamo') },
  { word: 'rinoceronte', pic: ART.img('rinoceronte', 'Un rinoceronte') },
  { word: 'barco', pic: ART.img('barco', 'Un barco') },
  { word: 'chimenea', pic: ART.img('chimenea', 'Una chimenea con fuego') },
  { word: 'llama', pic: ART.img('llama', 'Una llama') },
  { word: 'faro', pic: ART.img('faro', 'Un faro sobre rocas') },
  { word: 'xilófono', pic: ART.img('xilofono', 'Un xilófono de colores') },
  { word: 'wafer', pic: ART.img('wafer', 'Un wafer de chocolate') },
  { word: 'tortuga', pic: ART.img('tortuga', 'Una tortuga marina') },
  { word: 'queso', pic: ART.img('queso', 'Queso') },
  { word: 'jarra', pic: ART.img('jarra', 'Una jarra') },
  { word: 'uvas', pic: ART.img('uvas', 'Un racimo de uvas') },
  { word: 'nido', pic: ART.img('nido', 'Un nido') },
  { word: 'avestruz', pic: ART.img('avestruz', 'Un avestruz') },
  { word: 'olla', pic: ART.img('olla', 'Una olla') },
  { word: 'gato', pic: ART.img('gato', 'Un gato') },
  { word: 'yoyó', pic: ART.img('yoyo', 'Un yoyó rojo') },
  { word: 'vaca', pic: ART.img('vaca', 'Una vaca') },
  { word: 'zorro', pic: ART.img('zorro', 'Un zorro') },
  { word: 'rana', pic: ART.img('rana', 'Una rana verde') },
  { word: 'kiwi', pic: ART.img('kiwi', 'Un kiwi') },
  { word: 'iglesia', pic: ART.img('iglesia', 'Una iglesia') },
  { word: 'ñu', pic: ART.img('nu', 'Un ñu') },
];

/* ---------- Practiquemos ---------- */
function initPractica() {
  const m = $('#practice-mount');
  const st = Array(PRACTICA.length).fill(''); let saved = null;
  const grid = h('div', { class: 'pr-grid' });
  const fb = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
  function paint() {
    let right = 0;
    grid.replaceChildren(...PRACTICA.map((p, i) => {
      const done = st[i] === p.ans; if (done) right++;
      return h('div', { class: 'pr-card' + (done ? ' done' : '') },
        h('p', { class: 'q-bubble' }, `${i + 1}. ¿Qué sonido inicial tiene la palabra ${p.word}?`),
        h('div', { class: 'pr-pic', html: p.art }),
        h('button', { class: 'btn sm', type: 'button', html: ICO.sound + '<span>Escuchar</span>', onclick: () => playClip(`audio/palabras/${slug(p.word)}.mp3`, p.word) }),
        h('div', { class: 'opts' }, ...p.opts.map(o => {
          const on = st[i] === o, good = on && o === p.ans;
          return h('button', { class: 'opt-btn' + (on ? (good ? ' ok' : ' no') : ''), type: 'button', onclick: () => { st[i] = o; paint(); } },
            h('span', { class: 'dot', 'aria-hidden': 'true' }, on ? (good ? '✓' : '✕') : ''), o);
        })),
        st[i] && st[i] !== p.ans ? h('p', { class: 'feedback no' }, 'Casi. Escucha otra vez e inténtalo.') : (done ? h('p', { class: 'feedback ok' }, `¡Muy bien! ${p.word[0].toUpperCase() + p.word.slice(1)} empieza con ${p.ans}.`) : null));
    }));
    setScore('prac', right);
    fb.className = 'feedback ok'; fb.textContent = right === PRACTICA.length ? '¡Terminaste Practiquemos!' : '';
  }
  m.replaceChildren(grid, fb, actionBar(
    () => { if (st.some(Boolean)) saved = st.slice(); st.fill(''); paint(); },
    () => { if (saved) { saved.forEach((v, i) => { st[i] = v; }); saved = null; paint(); } }));
  paint();
}

/* ---------- Verbo SER B: espacios con lista ---------- */
function initSerB() {
  const m = $('#act-ser-b');
  const OPT = ['soy', 'eres', 'es', 'somos', 'son'];
  const st = Array(17).fill(''); let saved = null, showTable = false;
  const para = h('p', { class: 'cloze' }), fb = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
  const tableBox = h('div', { class: 'scroll-x', hidden: true });
  const toggle = h('button', { class: 'btn', type: 'button', onclick: () => { showTable = !showTable; tableBox.hidden = !showTable; toggle.textContent = showTable ? 'Ocultar la tabla de respuestas' : 'Ver tabla de respuestas y usos'; } }, 'Ver tabla de respuestas y usos');
  tableBox.append(h('table', { class: 't' }, h('thead', null, h('tr', null, h('th', null, 'N.º'), h('th', null, 'Respuesta'), h('th', null, 'Uso'))),
    h('tbody', null, ...SER_B.map(([a, u], i) => h('tr', null, h('td', null, String(i + 1)), h('td', null, h('b', null, i < 3 && i !== 0 || i === 1 ? a[0].toUpperCase() + a.slice(1) : a)), h('td', null, u))))));
  function paint() {
    let right = 0, n = 0;
    const parts = SER_B_TEXT.split(/\{(\d+)\}/); const nodes = [];
    parts.forEach((p, i) => {
      if (i % 2 === 0) { nodes.push(p); return; }
      const k = +p - 1, v = st[k], good = v && v === SER_B[k][0];
      if (good) right++;
      const sel = h('select', { class: 'cz' + (v ? (good ? ' ok' : ' no') : ''), 'aria-label': `Espacio ${k + 1}`, onchange: e => { st[k] = e.target.value; paint(); } },
        h('option', { value: '' }, `${k + 1}`), ...OPT.map(o => h('option', { value: o, selected: v === o ? true : null }, o)));
      nodes.push(sel);
    });
    para.replaceChildren(...nodes);
    setScore('serB', right);
    fb.className = 'feedback ok'; fb.textContent = right === 17 ? '¡Excelente! Los diecisiete espacios están correctos.' : '';
  }
  m.replaceChildren(
    h('div', { class: 'story-box' }, h('h5', null, 'Mi grupo de amigos'), para,
      h('p', { class: 'reminder' }, h('b', null, 'Recordatorio: '), 'con profesiones normalmente no se usa artículo. ✓ Soy estudiante. / Él es ingeniero. ✕ Soy un estudiante. / Él es un ingeniero.')),
    fb, h('div', { class: 'row-actions' }, toggle), tableBox,
    actionBar(() => { if (st.some(Boolean)) saved = st.slice(); st.fill(''); paint(); }, () => { if (saved) { saved.forEach((v, i) => { st[i] = v; }); saved = null; paint(); } }));
  paint();
}

/* ---------- Pestañas internas de Básico 3 ---------- */
function initSubtabs() {
  const tabs = $$('.stab'), panels = $$('.subpanel');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.setAttribute('aria-selected', String(x === t)));
    panels.forEach(p => { p.hidden = p.dataset.sub !== t.dataset.sub; });
    window.dispatchEvent(new Event('resize'));
  }));
}

/* ---------- Inicio de todo lo nuevo ---------- */
/* ---------- Tarjetas que muestran la información al tocarlas (Básico 3) ---------- */
const USE_ICON = ['🪪', '🌍', '💼', '⭐', '👥'];
/** Tarjetas (solo título) + un cuadro de información que muestra lo de la tarjeta tocada. */
function infoGroup(items, compact) {
  const info = h('div', { class: 'infobox', role: 'region', 'aria-live': 'polite' }, h('p', { class: 'ib-hint' }, 'Toca una tarjeta para ver la información.'));
  const cards = items.map(it => {
    const c = h('button', { class: 'rcard', type: 'button', 'aria-pressed': 'false' },
      it.icon ? h('span', { class: 'rc-ic', 'aria-hidden': 'true' }, it.icon) : null, h('span', { class: 'rc-front' }, it.front));
    c.addEventListener('click', () => {
      cards.forEach(x => x.setAttribute('aria-pressed', String(x === c)));
      info.replaceChildren(h('h5', { class: 'ib-title' }, it.title), h('div', { class: 'ib-body' }, ...it.body.filter(Boolean)));
      info.classList.add('on');
    });
    return c;
  });
  return h('div', { class: 'infogroup' }, h('div', { class: 'rcards' + (compact ? ' conjcards' : '') }, ...cards), info);
}
function revealCard(front, back, icon, sub) {
  const c = h('button', { class: 'rcard', type: 'button', 'aria-expanded': 'false' },
    icon ? h('span', { class: 'rc-ic', 'aria-hidden': 'true' }, icon) : null,
    h('span', { class: 'rc-front' }, front),
    sub ? h('span', { class: 'rc-sub' }, sub) : null,
    h('span', { class: 'rc-tap' }, 'Toca para ver'),
    h('span', { class: 'rc-back', hidden: true }, ...(Array.isArray(back) ? back : [back])));
  c.addEventListener('click', () => {
    const open = c.getAttribute('aria-expanded') !== 'true';
    c.setAttribute('aria-expanded', String(open));
    $('.rc-back', c).hidden = !open; $('.rc-tap', c).hidden = open;
  });
  return c;
}
function initRevealCards() {
  // primero la información como en el archivo antiguo (lista y tabla juntas); al final de cada cuadro, un solo juego de tarjetas
  $$('.subpanel[data-sub=ser] > .card, .subpanel[data-sub=tener] > .card').forEach(card => {
    const items = [], tener = !!card.closest('[data-sub=tener]');
    const uses = $('.uses', card), conj = $('table.conj', card);
    if (!uses && !conj) return;
    if (uses) {
      const us = $$('.use', uses);
      us.forEach((u, i) => items.push({ front: $('b', u).textContent, icon: tener ? ['🎁', '🎂', '🥶', '📋', '🍀'][i] : USE_ICON[i], title: $('b', u).textContent, body: [h('span', null, $('span', u).textContent)] }));
      uses.replaceWith(h('ul', { class: 'uso-list' }, ...us.map(u => h('li', null, h('b', null, $('b', u).textContent + ': '), $('span', u).textContent))));
    }
    if (conj) $$('tbody tr', conj).forEach(tr => { const td = $$('td', tr).map(x => x.textContent); items.push({ front: td[0], title: td[0], body: [h('b', { class: 'rc-form' }, td[1]), td[2] ? h('span', null, td[2]) : null] }); });
    card.append(h('p', { class: 'cards-label' }, '👆 Repasa con las tarjetas: toca una para ver la información.'), infoGroup(items));
  });
  // números: cardinales y ordinales
  const num = $('.subpanel[data-sub=num]'), anchor = num && $('.banner.big', num);
  if (anchor) {
    const W = ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte',
      'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve', 'treinta',
      'treinta y uno', 'treinta y dos', 'treinta y tres', 'treinta y cuatro', 'treinta y cinco', 'treinta y seis'];
    const box = h('div', { class: 'card' },
      h('h4', { class: 'pill-title' }, 'Cardinales del 1 al 36'),
      h('div', { class: 'rcards small' }, ...W.map((w, i) => revealCard(String(i + 1), h('b', { class: 'rc-form' }, w)))));
    const tableCard = $('table.nums', num); (tableCard ? tableCard.closest('.card') : anchor).after(box);
  }
}

function initErrCards() {
  $$('.errcard').forEach(c => c.addEventListener('click', () => {
    const open = c.getAttribute('aria-expanded') !== 'true';
    c.setAttribute('aria-expanded', String(open));
    $('.ec-ok', c).hidden = !open; $('.ec-tap', c).hidden = open;
  }));
}

function initJuegos() {
  initRevealCards();
  initErrCards();
  initPractica();
  quizList($('#act-ser-a'), { id: 'serA', items: SER_A, done: '¡Excelente! Usaste bien el verbo SER.' });
  initSerB();
  makeDrop($('#act-ser-c'), { id: 'serC', chips: ['somos', 'eres', 'soy', 'son', 'sois', 'es'], rows: SER_C.map((p, i) => ({ pre: p, post: '', ans: SER_C_ANS[i] })) });
  makeDrop($('#act-ten-a'), { id: 'tenA', chips: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'], rows: TEN_A.map(([pre, post, ans]) => ({ pre, post, ans })) });
  quizList($('#act-ten-b'), { id: 'tenB', items: TEN_B, done: '¡Excelente! Usaste bien el verbo TENER.' });
  createGame($('#act-ten-c'), {
    id: 'tenC', mode: 'anagram', items: ANAGRAMAS, title: 'Anagramas', blurb: 'Ordena las letras y forma la frase.',
    info: 'Toca las letras en orden para llenar las casillas. Toca una casilla para quitar la letra. Usa ? si necesitas una pista.',
  });
  createGame($('#spellit-mount'), {
    id: 'escribe', mode: 'spell', items: ESCRIBE, title: 'Escribe la palabra', blurb: 'Mira la imagen y escribe la palabra.',
    info: 'Mira la imagen y escucha la palabra. Escríbela con las letras de la pantalla o con tu teclado. Usa ? si necesitas una pista.',
  });
  createBoard($('#act-tablero'), { placeholder: 'Arrastra o escribe aquí los números cardinales…' });
  initSubtabs();
}
