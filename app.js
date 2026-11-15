/* Aravarma class · Unidad 1. Primeros pasos en español
   Todo el código está en este archivo. No usa librerías. */
'use strict';

/* ============================================================
   Utilidades
   ============================================================ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(kid));
  }
  return el;
}
const fromHTML = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };

const PUNCT = /[¿?¡!.,;:«»"“”]/g;
const exact = s => s.toLowerCase().normalize('NFC').replace(PUNCT, '').replace(/\s+/g, ' ').trim();
const fold = s => s.toLowerCase().replace(/ñ/g, '\u0001').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\u0001/g, 'ñ').replace(PUNCT, '').replace(/\s+/g, ' ').trim();
/** 'ok' = igual, 'accent' = igual sin tildes, 'no' = distinto */
function grade(input, accepted) {
  const e = exact(input), f = fold(input);
  if (accepted.some(a => exact(a) === e)) return 'ok';
  if (accepted.some(a => fold(a) === f)) return 'accent';
  return 'no';
}

const state = { sound: true, tab: 'bas-01', last: null };

/* ---- voz ---- */
let voice = null;
function pickVoice() {
  try {
    const vs = speechSynthesis.getVoices();
    voice = vs.find(v => /^es[-_]PE/i.test(v.lang)) || vs.find(v => /^es/i.test(v.lang)) || null;
  } catch (e) { voice = null; }
}
try { speechSynthesis.onvoiceschanged = pickVoice; pickVoice(); } catch (e) { /* sin voz */ }
function speak(text) {
  if (!state.sound || !text) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice ? voice.lang : 'es-PE';
    if (voice) u.voice = voice;
    u.rate = 0.85;
    speechSynthesis.speak(u);
  } catch (e) { /* sin voz */ }
}

/* ============================================================
   Datos de la clase
   ============================================================ */
const ALPHA = [
  ['A', 'a', 'a'], ['B', 'b', 'be'], ['C', 'c', 'ce'], ['D', 'd', 'de'], ['E', 'e', 'e'], ['F', 'f', 'efe'], ['G', 'g', 'ge'],
  ['H', 'h', 'hache'], ['I', 'i', 'i'], ['J', 'j', 'jota'], ['K', 'k', 'ka'], ['L', 'l', 'ele'], ['M', 'm', 'eme'], ['N', 'n', 'ene'],
  ['Ñ', 'ñ', 'eñe'], ['O', 'o', 'o'], ['P', 'p', 'pe'], ['Q', 'q', 'cu'], ['R', 'r', 'erre'], ['S', 's', 'ese'], ['T', 't', 'te'],
  ['U', 'u', 'u'], ['V', 'v', 'uve'], ['W', 'w', 'uve doble'], ['X', 'x', 'equis'], ['Y', 'y', 'i griega'], ['Z', 'z', 'zeta'],
];
const NAME_OF = {};
ALPHA.forEach(([u, l, n]) => { NAME_OF[l] = n; });
function letterName(ch) {
  const l = ch.toLowerCase();
  if (NAME_OF[l]) return NAME_OF[l];
  const acc = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' };
  if (acc[l]) return NAME_OF[acc[l]] + ' con tilde';
  if (l === 'ü') return 'u con diéresis';
  if (/\d/.test(l)) return l;
  return '';
}

const ORDENA = [
  { w: 'Hola', s: 'L-O-A-H', e: '👋', bg: '#ffd9ec' },
  { w: 'Chao', s: 'O-A-H-C', e: '🖐️', bg: '#e0d4ff' },
  { w: 'Hasta luego', s: 'A-S-T-H-A / U-E-G-L-O', e: '⏳', bg: '#d4eefc' },
  { w: 'Hasta mañana', s: 'T-A-S-H-A / Ñ-A-M-A-N-A', e: '🌅', bg: '#ffe6c2' },
  { w: 'Nos vemos', s: 'S-O-N / M-O-V-E-S', e: '👀', bg: '#d8f3e2' },
  { w: 'Adiós', s: 'S-Ó-I-D-A', e: '🚶', bg: '#ffd9ec' },
  { w: 'Hasta pronto', s: 'A-H-T-S-A / O-T-N-O-R-P', e: '🔜', bg: '#e0d4ff' },
  { w: 'Buenos días', s: 'S-O-N-E-U-B / S-A-Í-D', e: '☀️', bg: '#fff1b8' },
  { w: 'Buenas tardes', s: 'S-A-N-E-U-B / S-E-D-R-A-T', e: '🌇', bg: '#ffd9b8' },
  { w: 'Buenas noches', s: 'N-A-S-E-U-B / S-E-H-C-O-N', e: '🌙', bg: '#d6d2ff' },
];

const SOUP_WORDS = [
  ['Hola', 'HOLA'], ['Chao', 'CHAO'], ['Hasta luego', 'HASTALUEGO'], ['Hasta mañana', 'HASTAMAÑANA'],
  ['Nos vemos', 'NOSVEMOS'], ['Adiós', 'ADIÓS'], ['Hasta pronto', 'HASTAPRONTO'], ['Buenos días', 'BUENOSDÍAS'],
  ['Buenas tardes', 'BUENASTARDES'], ['Buenas noches', 'BUENASNOCHES'],
];

// 'S' saludo, 'D' despedida. «Buenas noches» sirve para las dos cosas.
const SALUDO_DESP = [
  ['Buenos días', 'S'], ['Buenas tardes', 'S'], ['Buenas noches', 'SD'], ['Hola', 'S'], ['Chao', 'D'],
  ['Hasta luego', 'D'], ['Hasta mañana', 'D'], ['Nos vemos', 'D'], ['Adiós', 'D'], ['Hasta pronto', 'D'],
];

const DIALOGOS = [
  {
    t: 'Diálogo 1', answer: 'F',
    lines: ['A: Buenos días, Rosa.', 'B: Hola, Valentino. ¿Cómo está?', 'A: Estoy muy bien, gracias. ¿Y usted?', 'B: Bien.', 'A: Nos vemos, que tenga un buen día.', 'B: Igualmente.'],
    why: 'Es formal: usan «usted» («¿Cómo está?», «¿Y usted?») y «que tenga un buen día».',
  },
  {
    t: 'Diálogo 2', answer: 'I',
    lines: ['Ana: ¡Hola, Luis! ¿Qué tal?', 'Luis: ¡Hola, Ana! ¡Muy bien! ¿Y tú? ¿Cómo estás?', 'Ana: Estoy muy bien, gracias. ¡Cuánto tiempo sin verte!', 'Luis: ¡Sí, hace mucho que no nos vemos! ¿Qué haces?', 'Ana: Voy a la universidad. ¿Y tú?', 'Luis: Estoy trabajando en una empresa.', 'Ana: ¡Qué bien! ¿Cómo está tu familia?', 'Luis: Todos están muy bien, gracias. ¿Y la tuya?', 'Ana: También están muy bien.', 'Luis: Bueno, Ana, me alegro de verte.', 'Ana: ¡Igualmente! Nos vemos pronto.', 'Luis: ¡Claro! ¡Cuídate! ¡Chao!', 'Ana: ¡Chao, Luis!'],
    why: 'Es informal: usan «tú» («¿Qué tal?», «¿Y tú?», «¿Cómo estás?») y se despiden con «¡Chao!».',
  },
];

const PRONOUNS = ['yo', 'tú', 'usted', 'él', 'ella', 'nosotros', 'nosotras', 'vosotros', 'vosotras', 'ustedes', 'ellos', 'ellas'];
const SUSTITUYE = [
  ['Virginia', 'ella'], ['Sara', 'ella'], ['Olivia', 'ella'], ['Marcelo', 'él'],
  ['Rolando y yo', 'nosotros'], ['Sebastian y Rafael', 'ellos'], ['Amanda y Carlos', 'ellos'],
];

const STORY = [
  'Cuando Paco Yunque y su madre llegaron a la puerta del colegio, los niños estaban jugando en el patio. Ella lo dejó y se fue. Él, paso a paso, fue adelantándose al centro del patio, con su libro, su cuaderno y su lápiz. Paco estaba con miedo, porque era la primera vez que venía a un colegio y porque nunca había visto a tantos niños juntos. Ellos se le acercaron a Paco, cada vez más tímido, se pegó a la pared y se puso colorado: ¡Qué listos eran!',
  'Un profesor lo vio, le tomó de la mano y lo llevó a su salón. El profesor le preguntó:',
  '—¿Cómo se llama usted?',
  'Con voz temblorosa, Paco respondió:',
  '—Yo me llamo Paco.',
  'El profesor lo observó y agregó señalando a los niños del salón:',
  '—Cuente con nosotros para lo que quiera.',
];
const STORY_PRON = new Set(['ella', 'él', 'ellos', 'usted', 'yo', 'nosotros']);
const CLS_EXPECT = { s1: ['yo'], s2: ['usted'], s3: ['ella', 'él'], p1: ['nosotros'], p2: [], p3: ['ellos'] };

const RULETA = [
  { n: 2, q: '¿Cómo se dice "Good morning" en español?', a: ['Buenos días'], show: 'Buenos días' },
  { n: 3, q: 'Completa la frase: "Buenas ________, ¿cómo está usted?"', a: ['tardes', 'noches'], show: 'tardes (o noches)' },
  { n: 4, q: '¿Cuál es el pronombre de la 1ª persona del singular?', a: ['yo'], show: 'Yo' },
  { n: 5, q: 'Si tengo "María y yo", ¿qué pronombre plural uso?', a: ['nosotros', 'nosotras'], show: 'Nosotros' },
  { n: 6, q: '¿Cuál es el pronombre formal para "tú" en singular?', a: ['usted'], show: 'Usted' },
  { n: 7, q: '¿Qué pronombre uso para un grupo de puras chicas/niñas?', a: ['ellas'], show: 'Ellas' },
  { n: 8, q: '¿Cómo se dice "They" (masculino) en español?', a: ['ellos'], show: 'Ellos' },
  { n: 9, q: 'Deletrea tu nombre completo en voz alta.', free: true },
  { n: 10, q: '¿Qué letra va después de la "H"?', a: ['i', 'la i'], show: 'La I' },
  { n: 11, q: '¿Cómo se deletrea la palabra "HOLA"?', a: ['hache o ele a'], show: 'Hache, O, Ele, A', hint: 'Escribe el nombre de cada letra y usa «Separar» entre una y otra.' },
  { n: 12, q: '¿Cuál es la letra que es muda (no tiene sonido) en español?', a: ['h', 'la h'], show: 'La H' },
  { n: 13, q: 'Deletrea la palabra "RULETA".', a: ['erre u ele e te a'], show: 'Erre, U, Ele, E, Te, A', hint: 'Escribe el nombre de cada letra y usa «Separar» entre una y otra.' },
  { n: 14, q: '"Hasta ________" (cuando vas a ver a alguien al día siguiente).', a: ['mañana'], show: 'mañana' },
  { n: 15, q: '¿Cómo se dice "See you later"?', a: ['hasta luego', 'nos vemos luego'], show: 'Hasta luego / Nos vemos luego' },
  { n: 16, q: '¿Qué despedida usas antes de irte a dormir?', a: ['buenas noches'], show: 'Buenas noches' },
  { n: 17, q: '"Nos ________" (expresión muy común para despedirse).', a: ['vemos'], show: 'vemos' },
  { n: 18, q: '¿Cómo se dice "Take care" en español?', a: ['cuídate'], show: 'Cuídate' },
];

/* ============================================================
   Progreso
   ============================================================ */
const PG = [
  ['ordena', 'Ordena', 10], ['sopa', 'Sopa', 10], ['sd', 'Saludos', 10], ['dial', 'Diálogos', 2],
  ['sust', 'Sustituye', 7], ['texto', 'Texto', 6], ['tabla', 'Tabla', 6], ['prac', 'Practiquemos', 1], ['ruleta', 'Ruleta', RULETA.length],
];
let score = {};
function setScore(id, got) {
  score[id] = got;
  renderProgress();
}
function renderProgress() {
  const box = $('#progress');
  box.replaceChildren(...PG.map(([id, label, total]) => {
    const got = score[id] || 0;
    return h('span', { class: 'pg' + (got === total ? ' full' : '') }, `${label} ${got}/${total}`);
  }));
}

/* ============================================================
   Tablero de escritura (letras tipo imán)
   ============================================================ */
const KEYSETS = {
  up: ['Letras mayúsculas', 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'],
  lo: ['Letras minúsculas', 'abcdefghijklmnñopqrstuvwxyz'],
  num: ['Números', '0123456789'],
  aup: ['Acento mayúscula', 'ÁÉÍÓÚÜ'],
  alo: ['Acento minúscula', 'áéíóúü'],
};
const SIGNS = '¿?¡!.,';
const SWATCHES = [['Rosa intenso', '#ff2f8e'], ['Fucsia', '#d11fc2'], ['Lavanda claro', '#a58af0']];
const ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="#4a1650" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';
const ICON_REDO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 5v6h-6"/><path d="M20 11a8 8 0 1 0-2.3 6.3"/></svg>';
const ICON_ERASE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>';

function createBoard(root, opts = {}) {
  let color = SWATCHES[0][1], set = 'up';
  let tokens = [], redoStack = [];

  const surface = h('div', { class: 'surface', tabindex: '0', role: 'group', 'aria-label': 'Tablero de escritura. Escribe con las letras de abajo o con tu teclado.' });
  const keys = h('div', { class: 'keys', role: 'group', 'aria-label': 'Letras' });
  const signs = h('div', { class: 'keys signs', role: 'group', 'aria-label': 'Signos' });
  const tabs = h('div', { class: 'kt', role: 'group', 'aria-label': 'Tipo de teclado' });
  const swatchBox = h('div', { class: 'wb-top', role: 'radiogroup', 'aria-label': 'Color de las letras' });

  function render(newIdx = -1) {
    surface.replaceChildren();
    if (!tokens.length) surface.append(h('span', { class: 'ph' }, opts.placeholder || 'Toca las letras para escribir aquí…'));
    tokens.forEach((t, i) => {
      if (t.gap) surface.append(h('span', { class: 'mg gap' }));
      else surface.append(h('span', { class: 'mg' + (i === newIdx ? ' new' : ''), style: `color:${t.color}` }, t.ch));
    });
    if (opts.onChange) opts.onChange(getText());
  }
  function getText() { return tokens.map(t => (t.gap ? ' ' : t.ch)).join('').replace(/\s+/g, ' ').trim(); }
  function add(ch) {
    tokens.push({ ch, color });
    redoStack = [];
    render(tokens.length - 1);
    if (opts.speakKeys) speak(letterName(ch) || ch);
  }
  function separate() {
    if (!tokens.length || tokens[tokens.length - 1].gap) return;
    tokens.push({ gap: true }); redoStack = []; render();
  }
  function erase() {
    if (!tokens.length) return;
    redoStack.push([tokens.pop()]);
    render();
  }
  function clearAll() {
    if (!tokens.length) return;
    redoStack.push(tokens.slice()); tokens = []; render();
  }
  function redo() {
    const g = redoStack.pop();
    if (g) { tokens.push(...g); render(); }
  }

  function drawKeys() {
    keys.replaceChildren(...[...KEYSETS[set][1]].map(ch =>
      h('button', { class: 'mk', type: 'button', 'aria-label': letterName(ch) ? `${ch}, ${letterName(ch)}` : ch, onclick: () => add(ch) }, ch)));
    $$('button', tabs).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.set === set)));
  }
  Object.entries(KEYSETS).forEach(([k, [label]]) => {
    tabs.append(h('button', { type: 'button', 'data-set': k, 'aria-pressed': String(k === set), onclick: () => { set = k; drawKeys(); } }, label));
  });
  signs.replaceChildren(...[...SIGNS].map(ch => h('button', { class: 'mk', type: 'button', 'aria-label': ch, onclick: () => add(ch) }, ch)));

  SWATCHES.forEach(([name, c]) => {
    swatchBox.append(h('button', {
      class: 'sw', type: 'button', role: 'radio', 'aria-label': name, title: name, 'aria-checked': String(c === color), style: `background:${c}`,
      onclick: ev => { color = c; $$('.sw', swatchBox).forEach(s => s.setAttribute('aria-checked', String(s === ev.currentTarget))); },
    }));
  });
  swatchBox.append(h('button', { class: 'trash', type: 'button', 'aria-label': 'Borrar todo el tablero', title: 'Borrar todo', html: ICON_TRASH, onclick: clearAll }));

  surface.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Backspace') { erase(); e.preventDefault(); }
    else if (e.key === ' ') { separate(); e.preventDefault(); }
    else if (e.key.length === 1 && /[\p{L}\d¿?¡!.,]/u.test(e.key)) { add(e.key); e.preventDefault(); }
  });

  const actions = h('div', { class: 'row-actions' },
    h('button', { class: 'btn pink', type: 'button', onclick: erase, html: ICON_ERASE + '<span>Borrar</span>' }),
    h('button', { class: 'btn', type: 'button', onclick: redo, html: ICON_REDO + '<span>Rehacer</span>' }),
    h('button', { class: 'btn', type: 'button', onclick: separate }, 'Separar'),
    ...(opts.extra || []));

  root.replaceChildren(h('div', { class: 'wb' }, swatchBox, surface, keys, signs, tabs, actions));
  drawKeys(); render();
  return { getText, clear: () => { tokens = []; redoStack = []; render(); }, focus: () => surface.focus() };
}

/* ============================================================
   Alfabeto
   ============================================================ */
function initAlphabet() {
  const grid = $('#alpha-grid'), cap = $('#alpha-caption');
  grid.replaceChildren(...ALPHA.map(([u, l, n]) => h('button', {
    class: 'key', type: 'button', 'aria-label': `${u}, ${n}`,
    onclick: ev => {
      $$('.key', grid).forEach(k => k.classList.remove('on'));
      ev.currentTarget.classList.add('on');
      cap.replaceChildren(h('b', null, `${u}${l}`), ` · ${n}`, l === 'h' ? ' (¡es muda!)' : '');
      speak(n);
    },
  }, h('span', { class: 'up' }, u), h('span', { class: 'lo' }, l), h('span', { class: 'nm' }, n))));
}

/* ============================================================
   3. Practiquemos
   ============================================================ */
function initPractice() {
  const m = $('#practice-mount');
  const OPTS = ['/p/', '/m/', '/s/'], RIGHT = 1;
  let pick = null, erased = null, tries = 0;

  m.innerHTML = `
    <div class="q-bubble">¿Qué sonido inicial tiene la palabra mariposa?</div>
    <div class="practice">
      <svg class="butterfly-pic" viewBox="0 0 100 80" role="img" aria-label="Una mariposa rosada"><use href="#butterfly"/></svg>
      <div class="opts"></div>
    </div>
    <div class="row-actions"><button class="btn sm" type="button" data-a="listen">🔊 Escuchar</button></div>
    <p class="feedback" role="status" aria-live="polite"></p>
    <div class="row-actions">
      <button class="btn" type="button" data-a="redo"></button>
      <button class="btn pink" type="button" data-a="erase"></button>
    </div>
    <audio preload="none" src="audio/mariposa.mp3"></audio>`;
  $('[data-a="redo"]', m).innerHTML = ICON_REDO + '<span>Rehacer</span>';
  $('[data-a="erase"]', m).innerHTML = ICON_ERASE + '<span>Borrar</span>';
  const box = $('.opts', m), fb = $('.feedback', m), audio = $('audio', m);

  function draw() {
    box.replaceChildren(...OPTS.map((o, i) => {
      let cls = 'opt-btn';
      if (pick === i) cls += i === RIGHT ? ' ok' : ' no';
      return h('button', { class: cls, type: 'button', onclick: () => choose(i) },
        h('span', { class: 'dot', 'aria-hidden': 'true' }, pick === i ? (i === RIGHT ? '✓' : '✕') : ''), o);
    }));
  }
  function choose(i) {
    pick = i; tries++; draw();
    if (i === RIGHT) { fb.className = 'feedback ok'; fb.textContent = '¡Muy bien! Mariposa empieza con /m/.'; setScore('prac', 1); }
    else { fb.className = 'feedback no'; fb.textContent = 'Casi. Escucha otra vez: ma-ri-po-sa.'; }
  }
  m.addEventListener('click', e => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'listen') {
      // Si hay un audio de la profesora en audio/mariposa.mp3 se usa; si no, habla la voz del navegador.
      let played = false;
      try {
        const p = audio.play();
        if (p && p.then) p.then(() => { played = true; }).catch(() => speak('mariposa'));
        else played = true;
      } catch (err) { speak('mariposa'); }
    } else if (a === 'erase') {
      if (pick !== null) { erased = pick; pick = null; fb.className = 'feedback'; fb.textContent = ''; draw(); }
    } else if (a === 'redo') {
      if (erased !== null) { const i = erased; erased = null; choose(i); tries--; }
      else if (pick !== null) { pick = null; fb.textContent = ''; draw(); }
    }
  });
  draw();
}

/* ============================================================
   4. Deletrea
   ============================================================ */
const SPELL = ['Hola', 'Buenos días', 'Buenas tardes', 'Chao', 'Buenas noches', 'Hasta mañana', 'Hasta luego', 'Nos vemos', '¿Qué tal?'];
function initSpell() {
  const m = $('#spell-mount');
  let idx = -1, sep = false, hidden = false, hiddenFrom = -1;

  const top = h('div', { class: 'spell-chips' });
  const bottom = h('div', { class: 'spell-chips' });
  const slate = h('div', { class: 'slate', role: 'button', tabindex: '0', 'aria-label': 'Pizarra. Toca para ver la siguiente palabra.' });
  const pencil = fromHTML('<svg class="pencil" viewBox="0 0 30 54" aria-hidden="true"><path d="M7 4h16l2 36-10 12L5 40z" fill="#ffd84a" stroke="#c98a00" stroke-width="2" stroke-linejoin="round"/><path d="M15 52l-8-12h16z" fill="#ffe3c2" stroke="#c98a00" stroke-width="2" stroke-linejoin="round"/><path d="M13 48l2 4 2-4z" fill="#4a1650"/><path d="M7 4h16v6H7z" fill="#ff8cc6" stroke="#c98a00" stroke-width="2"/></svg>');
  const mini = h('div', { class: 'mini-row' },
    h('button', { class: 'btn sm pink', type: 'button', onclick: () => { if (idx >= 0 && !hidden) { hidden = true; hiddenFrom = idx; draw(); } } }, 'Borrar'),
    h('button', { class: 'btn sm', type: 'button', onclick: () => { if (idx < 0) go(0); else { hidden = false; draw(); } } }, 'Rehacer'),
    h('button', { class: 'btn sm', type: 'button', 'aria-pressed': 'false', onclick: ev => { sep = !sep; ev.currentTarget.setAttribute('aria-pressed', String(sep)); draw(false); } }, 'Separar'));

  SPELL.forEach((w, i) => {
    (i < 4 ? top : bottom).append(h('button', { class: 'chip-w', type: 'button', 'data-i': i, 'aria-pressed': 'false', onclick: () => go(i) }, w));
  });

  function draw(animate = true) {
    $$('.chip-w', m).forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.i === idx)));
    slate.classList.toggle('sep', sep);
    slate.replaceChildren();
    if (idx < 0 || hidden) {
      slate.append(h('span', { class: 'ph' }, idx < 0 ? 'Toca una palabra o la pizarra' : 'Pizarra borrada. Toca «Rehacer».'));
    } else {
      [...SPELL[idx]].forEach((ch, i) => {
        if (ch === ' ') slate.append(h('span', { class: 'gap' }));
        else slate.append(h('span', { class: 'lt', style: animate ? `animation-delay:${i * 90}ms` : 'animation:none' },
          h('span', { class: 'c' }, ch), h('span', { class: 'n' }, letterName(ch))));
      });
    }
    slate.append(pencil);
  }
  function go(i) {
    idx = i; hidden = false; draw();
    const w = SPELL[i];
    speak(`${w}. ${[...w].filter(c => c !== ' ').map(letterName).filter(Boolean).join(', ')}`);
  }
  slate.addEventListener('click', () => go((idx + 1) % SPELL.length));
  slate.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go((idx + 1) % SPELL.length); } });

  m.replaceChildren(top, slate, mini, bottom);
  draw();
}

/* ============================================================
   Ruleta
   ============================================================ */
const wheelState = { rot: 0, spinning: false, deck: [], results: {}, asked: 0 };
function initWheel() {
  wheelState.rot = 0; wheelState.spinning = false; wheelState.deck = RULETA.map((_, i) => i); wheelState.results = {}; wheelState.asked = 0;
  const N = RULETA.length, step = 360 / N;
  const pt = (a, r) => [(r * Math.sin(a * Math.PI / 180)).toFixed(2), (-r * Math.cos(a * Math.PI / 180)).toFixed(2)];
  const COL = ['#ff8cc6', '#c9b3fa', '#ffc9e6', '#f3e9ff'];
  let wedges = '';
  RULETA.forEach((q, i) => {
    const a0 = i * step, a1 = (i + 1) * step, mid = a0 + step / 2;
    const [x0, y0] = pt(a0, 90), [x1, y1] = pt(a1, 90);
    const fill = i === N - 1 ? COL[3] : COL[i % 3];
    wedges += `<path d="M0 0 L${x0} ${y0} A90 90 0 0 1 ${x1} ${y1} Z" fill="${fill}" stroke="#fff" stroke-width="1.5"/>`;
    wedges += `<text transform="rotate(${mid.toFixed(2)}) translate(0 -70)" text-anchor="middle" dominant-baseline="middle" font-family="Lilita One, sans-serif" font-size="10" fill="#4a1650">${q.n}</text>`;
  });
  let dots = '';
  for (let i = 0; i < 24; i++) { const [x, y] = pt(i * 15, 94); dots += `<circle cx="${x}" cy="${y}" r="1.6" fill="#fff"/>`; }

  const m = $('#wheel-mount');
  m.innerHTML = `
    <div class="wheel-wrap">
      <svg class="pointer" viewBox="0 0 28 34" aria-hidden="true"><path d="M2 6C2 2 6 0 14 0s12 2 12 6L14 34Z" fill="#ffd84a" stroke="#c98a00" stroke-width="2" stroke-linejoin="round"/><circle cx="14" cy="9" r="3.5" fill="#fff"/></svg>
      <svg class="wheel-svg" id="wheel" viewBox="-100 -100 200 200" aria-hidden="true">
        <circle r="98" fill="url(#gWheelRim)" stroke="#fff" stroke-width="3"/>${dots}${wedges}
        <circle r="24" fill="#fff"/>
      </svg>
      <button class="spin-btn" type="button" aria-label="Girar la ruleta" id="spin-btn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></button>
    </div>
    <div class="wheel-base"></div>
    <p class="wheel-score" id="wheel-score" role="status" aria-live="polite"></p>`;
  $('#spin-btn').addEventListener('click', spin);
  updateWheelScore();
  setScore('ruleta', 0);
}
function updateWheelScore(msg) {
  const el = $('#wheel-score');
  if (!el) return;
  const right = Object.values(wheelState.results).filter(Boolean).length;
  el.textContent = msg || `Aciertos ${right} · Preguntas ${wheelState.asked}/${RULETA.length}`;
}
function spin() {
  if (wheelState.spinning) return;
  if (!wheelState.deck.length) {
    const right = Object.values(wheelState.results).filter(Boolean).length;
    updateWheelScore(`¡Completaste la ruleta! Aciertos: ${right} de ${RULETA.length}. Gira otra vez para empezar de nuevo.`);
    wheelState.deck = RULETA.map((_, i) => i); wheelState.results = {}; wheelState.asked = 0; setScore('ruleta', 0);
    return;
  }
  const pos = Math.floor(Math.random() * wheelState.deck.length);
  const qi = wheelState.deck.splice(pos, 1)[0];
  const N = RULETA.length, step = 360 / N, mid = (qi + 0.5) * step;
  const delta = (((-mid - wheelState.rot) % 360) + 360) % 360;
  wheelState.rot += 360 * 5 + delta;
  wheelState.spinning = true;
  const wheel = $('#wheel'), btn = $('#spin-btn');
  btn.disabled = true;
  let done = false;
  const finish = () => {
    if (done) return; done = true;
    wheelState.spinning = false; btn.disabled = false;
    openQuestion(qi);
  };
  wheel.addEventListener('transitionend', finish, { once: true });
  setTimeout(finish, 4600);
  wheel.style.transform = `rotate(${wheelState.rot}deg)`;
}

function openDialog(d) { try { d.showModal(); } catch (e) { d.setAttribute('open', ''); } }

function openQuestion(qi) {
  const item = RULETA[qi];
  const dlg = $('#dlg-question');
  $('#dq-num').textContent = `Pregunta ${item.n}`;
  $('#dq-title').textContent = item.q;
  const fb = $('#dq-feedback');
  fb.className = 'feedback'; fb.textContent = item.hint || '';
  if (item.hint) fb.classList.add('hint');
  let attempts = 0, finished = false;

  const validar = h('button', { class: 'btn', type: 'button', onclick: validate }, 'Validar');
  const board = createBoard($('#dq-board'), { extra: [validar], speakKeys: true, placeholder: 'Escribe tu respuesta aquí…' });

  function conclude(right) {
    finished = true; validar.disabled = true;
    wheelState.results[item.n] = right; wheelState.asked++;
    setScore('ruleta', Object.values(wheelState.results).filter(Boolean).length);
    updateWheelScore();
  }
  function validate() {
    if (finished) return;
    const text = board.getText();
    if (!text) { fb.className = 'feedback hint'; fb.textContent = 'Escribe tu respuesta en el tablero.'; return; }
    if (item.free) { fb.className = 'feedback ok'; fb.textContent = '¡Muy bien! Ahora deletrea tu nombre en voz alta.'; conclude(true); return; }
    const g = grade(text, item.a);
    if (g === 'ok') { fb.className = 'feedback ok'; fb.textContent = '¡Correcto!'; conclude(true); }
    else if (g === 'accent') { fb.className = 'feedback ok'; fb.textContent = `¡Correcto! Recuerda la tilde: ${item.show}.`; conclude(true); }
    else {
      attempts++;
      if (attempts >= 2) { fb.className = 'feedback no'; fb.textContent = `La respuesta es: ${item.show}.`; conclude(false); }
      else { fb.className = 'feedback no'; fb.textContent = 'Casi. Inténtalo otra vez.'; }
    }
  }
  const onClose = () => {
    dlg.removeEventListener('close', onClose);
    if (!finished) { // se cerró sin responder: vuelve al mazo
      wheelState.deck.push(qi);
    }
    updateWheelScore();
  };
  dlg.addEventListener('close', onClose);
  openDialog(dlg);
  board.focus();
}

/* ============================================================
   Actividad 1 · Ordena las palabras (tarjetas que se deslizan)
   ============================================================ */
function initOrdena() {
  const root = $('#act-ordena');
  const N = ORDENA.length;
  let cur = 0, saved = null;
  const st = { ans: Array(N).fill(''), ok: Array(N).fill(false) };

  const track = h('div', { class: 'cards-track' });
  const view = h('div', { class: 'cards-view' }, track);
  const dots = h('div', { class: 'dots', 'aria-hidden': 'true' });

  const cards = ORDENA.map((it, i) => {
    const letters = h('div', { class: 'fletters', 'aria-label': 'Letras en desorden: ' + it.s.replace(/-/g, ' ').replace('/', 'y luego') },
      ...it.s.split(' / ').map((word, wi) => [wi ? h('span', { class: 'fl gap' }, '/') : null, ...word.split('-').map(c => h('span', { class: 'fl' }, c))]).flat());
    const input = h('input', { type: 'text', id: `ord-in-${i}`, placeholder: 'Escribe la palabra ordenada', 'aria-label': `Palabra ordenada, tarjeta ${i + 1}`, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
    const msg = h('div', { class: 'fmsg', role: 'status', 'aria-live': 'polite' });
    const btn = h('button', { type: 'button', onclick: () => check(i) }, 'Comprobar');
    input.addEventListener('keydown', e => { if (e.key === 'Enter') check(i); });
    input.addEventListener('input', () => { st.ans[i] = input.value; });
    const card = h('div', { class: 'fcard', 'aria-roledescription': 'tarjeta' },
      h('div', { class: 'fpic', style: `background:${it.bg}`, 'aria-hidden': 'true' }, it.e),
      letters, h('div', { class: 'fans' }, input, btn), msg);
    card.addEventListener('click', ev => { if (i !== cur && !ev.target.closest('input,button')) go(i); });
    track.append(card);
    return { card, input, msg };
  });
  ORDENA.forEach(() => dots.append(h('i')));

  function place(instant) {
    const c = cards[cur].card;
    const x = view.clientWidth / 2 - (c.offsetLeft + c.offsetWidth / 2);
    if (instant) track.style.transition = 'none';
    track.style.transform = `translateX(${x}px)`;
    if (instant) { void track.offsetWidth; track.style.transition = ''; }
    cards.forEach((o, i) => o.card.classList.toggle('cur', i === cur));
    $$('i', dots).forEach((d, i) => { d.className = (i === cur ? 'cur ' : '') + (st.ok[i] ? 'ok' : ''); });
    prev.disabled = cur === 0; next.disabled = cur === N - 1;
  }
  function go(i) { cur = Math.max(0, Math.min(N - 1, i)); place(false); }
  function check(i) {
    const o = cards[i], val = o.input.value.trim();
    if (!val) { o.msg.className = 'fmsg hint'; o.msg.textContent = 'Escribe la palabra ordenada.'; return; }
    const g = grade(val, [ORDENA[i].w]);
    if (g === 'no') { o.msg.className = 'fmsg no'; o.msg.textContent = 'Inténtalo otra vez.'; return; }
    st.ok[i] = true; st.ans[i] = val; o.card.classList.add('done');
    o.msg.className = 'fmsg ok';
    o.msg.textContent = g === 'accent' ? `¡Bien! Se escribe «${ORDENA[i].w}», con tilde.` : '¡Muy bien!';
    place(false); sync();
    if (i < N - 1) setTimeout(() => { if (cur === i) go(i + 1); }, 1100);
  }
  function sync() { setScore('ordena', st.ok.filter(Boolean).length); }
  function paint() {
    cards.forEach((o, i) => {
      o.input.value = st.ans[i];
      o.card.classList.toggle('done', st.ok[i]);
      o.msg.className = 'fmsg' + (st.ok[i] ? ' ok' : ''); o.msg.textContent = st.ok[i] ? '¡Muy bien!' : '';
    });
    place(false); sync();
  }

  const prev = h('button', { class: 'btn', type: 'button', onclick: () => go(cur - 1), 'aria-label': 'Tarjeta anterior' }, '‹ Anterior');
  const next = h('button', { class: 'btn', type: 'button', onclick: () => go(cur + 1), 'aria-label': 'Tarjeta siguiente' }, 'Siguiente ›');
  const erase = h('button', { class: 'btn pink', type: 'button', html: ICON_ERASE + '<span>Borrar</span>', onclick: () => {
    if (st.ans.some(Boolean) || st.ok.some(Boolean)) saved = { ans: st.ans.slice(), ok: st.ok.slice() };
    st.ans.fill(''); st.ok.fill(false); paint();
  } });
  const redo = h('button', { class: 'btn', type: 'button', html: ICON_REDO + '<span>Rehacer</span>', onclick: () => {
    if (saved) { st.ans = saved.ans.slice(); st.ok = saved.ok.slice(); saved = null; paint(); }
  } });

  // deslizar con el dedo o el mouse
  let sx = null;
  view.addEventListener('pointerdown', e => { sx = e.target.closest('input,button') ? null : e.clientX; });
  view.addEventListener('pointerup', e => {
    if (sx == null) return;
    const dx = e.clientX - sx; sx = null;
    if (dx < -50) go(cur + 1); else if (dx > 50) go(cur - 1);
  });

  root.replaceChildren(view, h('div', { class: 'cards-nav' }, prev, dots, next), h('div', { class: 'row-actions', style: 'margin-top:12px' }, erase, redo));
  requestAnimationFrame(() => place(true));
  if (window.__ordenaResize) window.removeEventListener('resize', window.__ordenaResize);
  window.__ordenaResize = () => place(true);
  window.addEventListener('resize', window.__ordenaResize);
  sync();
}

/* ============================================================
   Actividad 2 · Sopa de letras
   ============================================================ */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function buildSoup(rows, cols) {
  const dirs = [[0, 1], [1, 0], [1, 1]];
  const sorted = SOUP_WORDS.map(([, w], i) => ({ i, w })).sort((a, b) => b.w.length - a.w.length);
  for (let seed = 11; seed < 400; seed++) {
    const rnd = mulberry32(seed);
    const g = Array.from({ length: rows }, () => Array(cols).fill(''));
    let all = true;
    for (const { w } of sorted) {
      const L = [...w];
      let ok = false;
      for (let t = 0; t < 600 && !ok; t++) {
        const [dr, dc] = dirs[Math.floor(rnd() * dirs.length)];
        const r = Math.floor(rnd() * rows), c = Math.floor(rnd() * cols);
        const er = r + dr * (L.length - 1), ec = c + dc * (L.length - 1);
        if (er >= rows || ec >= cols) continue;
        if (L.some((ch, k) => g[r + dr * k][c + dc * k] && g[r + dr * k][c + dc * k] !== ch)) continue;
        L.forEach((ch, k) => { g[r + dr * k][c + dc * k] = ch; });
        ok = true;
      }
      if (!ok) { all = false; break; }
    }
    if (!all) continue;
    const pool = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ', rare = 'ÁÉÍÓ';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (!g[r][c]) g[r][c] = rnd() < 0.05 ? rare[Math.floor(rnd() * rare.length)] : pool[Math.floor(rnd() * pool.length)];
    }
    return g;
  }
  throw new Error('No se pudo armar la sopa de letras');
}

function initSopa() {
  const root = $('#act-sopa');
  const ROWS = 12, COLS = 14;
  const G = buildSoup(ROWS, COLS);
  let found = [], sel = [], anchor = null, drag = null, saved = null;

  const soup = h('div', { class: 'soup', style: `grid-template-columns:repeat(${COLS},1fr)`, role: 'group', 'aria-label': 'Sopa de letras' });
  const cellEls = G.map((row, r) => row.map((ch, c) => {
    const b = h('button', { class: 'sc', type: 'button', 'data-r': r, 'data-c': c, 'aria-label': `${ch}, fila ${r + 1}, columna ${c + 1}`, tabindex: r === 0 && c === 0 ? '0' : '-1' }, ch);
    soup.append(b); return b;
  }));
  const wordsBox = h('div', { class: 'words', 'aria-label': 'Palabras por encontrar' },
    ...SOUP_WORDS.map(([label], i) => h('span', { class: 'wd', 'data-i': i }, label)));
  const fb = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });

  function line(a, b) {
    const dr = b[0] - a[0], dc = b[1] - a[1];
    if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) return [a];
    const n = Math.max(Math.abs(dr), Math.abs(dc)) + 1, sr = Math.sign(dr), sc = Math.sign(dc);
    return Array.from({ length: n }, (_, k) => [a[0] + sr * k, a[1] + sc * k]);
  }
  function paint() {
    cellEls.flat().forEach(el => { el.className = 'sc'; });
    found.forEach(f => f.cells.forEach(([r, c]) => cellEls[r][c].classList.add('f' + (f.wi % 6))));
    sel.forEach(([r, c]) => cellEls[r][c].classList.add('sel'));
    $$('.wd', wordsBox).forEach(w => w.classList.toggle('done', found.some(f => f.wi === +w.dataset.i)));
    setScore('sopa', found.length);
  }
  function finish(cells) {
    const str = cells.map(([r, c]) => G[r][c]).join(''), rev = [...str].reverse().join('');
    const wi = SOUP_WORDS.findIndex(([, w], i) => !found.some(f => f.wi === i) && (w === str || w === rev));
    if (wi >= 0) {
      found.push({ wi, cells });
      fb.className = 'feedback ok'; fb.textContent = found.length === SOUP_WORDS.length ? '¡Encontraste las diez expresiones!' : `¡Muy bien! «${SOUP_WORDS[wi][0]}».`;
    } else {
      fb.className = 'feedback no'; fb.textContent = 'Esa no es una de las expresiones. Inténtalo otra vez.';
    }
  }
  function tap(p) {
    if (anchor) {
      const same = anchor[0] === p[0] && anchor[1] === p[1];
      const cells = same ? [] : line(anchor, p);
      anchor = null; sel = [];
      if (cells.length > 1) finish(cells);
      paint(); return;
    }
    anchor = p; sel = [p]; paint();
  }
  const cellOf = el => { const c = el && el.closest && el.closest('.sc'); return c ? [+c.dataset.r, +c.dataset.c] : null; };

  soup.addEventListener('pointerdown', e => {
    const p = cellOf(e.target); if (!p) return;
    e.preventDefault();
    if (anchor) { tap(p); return; }
    drag = { start: p, moved: false }; sel = [p]; paint();
    try { soup.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
  });
  soup.addEventListener('pointermove', e => {
    if (!drag) return;
    const p = cellOf(document.elementFromPoint(e.clientX, e.clientY)); if (!p) return;
    sel = line(drag.start, p); if (sel.length > 1) drag.moved = true; paint();
  });
  soup.addEventListener('pointerup', () => {
    if (!drag) return;
    const d = drag; drag = null;
    if (!d.moved) { anchor = d.start; sel = [d.start]; paint(); return; }
    const cells = sel; sel = []; finish(cells); paint();
  });
  soup.addEventListener('pointercancel', () => { drag = null; sel = []; paint(); });
  soup.addEventListener('keydown', e => { // flechas para moverse entre letras
    const p = cellOf(e.target); if (!p) return;
    const d = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] }[e.key]; if (!d) return;
    const r = p[0] + d[0], c = p[1] + d[1];
    if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return;
    e.preventDefault(); cellEls[p[0]][p[1]].tabIndex = -1; cellEls[r][c].tabIndex = 0; cellEls[r][c].focus();
  });
  soup.addEventListener('click', e => { // teclado (Enter o espacio)
    if (e.detail !== 0) return;
    const p = cellOf(e.target); if (p) tap(p);
  });

  const erase = h('button', { class: 'btn pink', type: 'button', html: ICON_ERASE + '<span>Borrar</span>', onclick: () => {
    if (found.length) saved = found.slice();
    found = []; sel = []; anchor = null; fb.textContent = ''; paint();
  } });
  const redo = h('button', { class: 'btn', type: 'button', html: ICON_REDO + '<span>Rehacer</span>', onclick: () => {
    if (saved) { found = saved; saved = null; paint(); }
  } });

  root.replaceChildren(h('div', { class: 'soup-wrap' }, wordsBox, soup, fb, h('div', { class: 'row-actions' }, erase, redo)));
  paint();
}

/* ============================================================
   Actividad 3 · Saludos o despedidas
   ============================================================ */
function initSD() {
  const root = $('#act-sd');
  const st = Array(SALUDO_DESP.length).fill(null);
  let saved = null;
  const tbody = h('tbody');
  const marks = SALUDO_DESP.map(([txt, ok], i) => {
    const mk = v => h('button', { class: 'mark', type: 'button', 'aria-label': `${txt}: ${v === 'S' ? 'saludo' : 'despedida'}`, onclick: () => { st[i] = v; paint(); } });
    const s = mk('S'), d = mk('D');
    tbody.append(h('tr', null, h('td', null, txt), h('td', { class: 'c' }, s), h('td', { class: 'c' }, d)));
    return { S: s, D: d };
  });
  function paint() {
    let right = 0;
    marks.forEach((m, i) => {
      ['S', 'D'].forEach(v => {
        const b = m[v];
        if (st[i] === v) {
          const ok = SALUDO_DESP[i][1].includes(v);
          b.className = 'mark ' + (ok ? 'ok' : 'no'); b.textContent = ok ? '✓' : '✕';
          if (ok) right++;
        } else { b.className = 'mark'; b.textContent = ''; }
      });
    });
    setScore('sd', right);
    fb.textContent = right === SALUDO_DESP.length ? '¡Todo correcto! «Buenas noches» sirve como saludo y como despedida.' : '';
    fb.className = 'feedback ok';
  }
  const fb = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
  const erase = h('button', { class: 'btn pink', type: 'button', html: ICON_ERASE + '<span>Borrar</span>', onclick: () => {
    if (st.some(Boolean)) saved = st.slice();
    st.fill(null); paint();
  } });
  const redo = h('button', { class: 'btn', type: 'button', html: ICON_REDO + '<span>Rehacer</span>', onclick: () => {
    if (saved) { saved.forEach((v, i) => { st[i] = v; }); saved = null; paint(); }
  } });
  root.replaceChildren(
    h('div', { class: 'scroll-x' }, h('table', { class: 'sd' },
      h('thead', null, h('tr', null, h('th', null, 'Dice'), h('th', null, 'Saludo'), h('th', null, 'Despedida'))), tbody)),
    fb, h('div', { class: 'row-actions' }, erase, redo));
  paint();
}

/* ============================================================
   Actividad 4 · Diálogos formal / informal
   ============================================================ */
function initDialogos() {
  const root = $('#act-dialogos');
  const st = [null, null];
  let saved = null;
  const boxes = DIALOGOS.map((d, i) => {
    const fb = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    const rb = v => h('button', { class: 'radio', type: 'button', role: 'radio', 'aria-checked': 'false', onclick: () => { st[i] = v; paint(); } },
      h('span', { class: 'dot', 'aria-hidden': 'true' }), v === 'F' ? 'Formal' : 'Informal');
    const F = rb('F'), I = rb('I');
    const el = h('div', { class: 'dbox' }, h('h5', null, d.t),
      h('div', { class: 'lines' }, ...d.lines.map(l => h('span', null, l))),
      h('div', { class: 'radios', role: 'radiogroup', 'aria-label': `${d.t}: formal o informal` }, F, I), fb);
    return { el, F, I, fb };
  });
  function paint() {
    let right = 0;
    boxes.forEach((b, i) => {
      [['F', b.F], ['I', b.I]].forEach(([v, btn]) => {
        btn.className = 'radio'; btn.setAttribute('aria-checked', String(st[i] === v));
        btn.querySelector('.dot').textContent = '';
        if (st[i] === v) {
          const ok = DIALOGOS[i].answer === v;
          btn.classList.add(ok ? 'ok' : 'no'); btn.querySelector('.dot').textContent = ok ? '✓' : '✕';
        }
      });
      if (st[i] === null) { b.fb.textContent = ''; }
      else if (st[i] === DIALOGOS[i].answer) { right++; b.fb.className = 'feedback ok'; b.fb.textContent = DIALOGOS[i].why; }
      else { b.fb.className = 'feedback no'; b.fb.textContent = 'Fíjate en el pronombre: «usted» es formal y «tú» es informal.'; }
    });
    setScore('dial', right);
  }
  const erase = h('button', { class: 'btn pink', type: 'button', html: ICON_ERASE + '<span>Borrar</span>', onclick: () => {
    if (st.some(Boolean)) saved = st.slice();
    st[0] = st[1] = null; paint();
  } });
  const redo = h('button', { class: 'btn', type: 'button', html: ICON_REDO + '<span>Rehacer</span>', onclick: () => {
    if (saved) { st[0] = saved[0]; st[1] = saved[1]; saved = null; paint(); }
  } });
  root.replaceChildren(h('div', { class: 'dlgs' }, ...boxes.map(b => b.el)), h('div', { class: 'row-actions', style: 'margin-top:12px' }, erase, redo));
  paint();
}

/* ============================================================
   BAS-03 · Actividad 1 · Sustituye con el pronombre correcto
   ============================================================ */
function initSustituye() {
  const root = $('#act-sustituye');
  const st = Array(SUSTITUYE.length).fill('');
  let saved = null;
  const rows = SUSTITUYE.map(([name], i) => {
    const sel = h('select', { id: `sust-${i}`, 'aria-label': `Pronombre para ${name}`, onchange: () => { st[i] = sel.value; paint(); } },
      h('option', { value: '' }, 'Elige…'), ...PRONOUNS.map(p => h('option', { value: p }, p)));
    const ic = h('span', { class: 'ic', 'aria-hidden': 'true' });
    const el = h('div', { class: 'sub' }, h('b', null, name), h('span', { style: 'display:flex;gap:6px;align-items:center' }, sel, ic));
    return { el, sel, ic };
  });
  const fb = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
  function paint() {
    let right = 0;
    rows.forEach((r, i) => {
      r.sel.value = st[i];
      r.el.className = 'sub'; r.ic.textContent = '';
      if (st[i]) {
        const ok = st[i] === SUSTITUYE[i][1];
        r.el.classList.add(ok ? 'ok' : 'no'); r.ic.textContent = ok ? '✓' : '✕';
        if (ok) right++;
      }
    });
    setScore('sust', right);
    fb.className = 'feedback ok'; fb.textContent = right === SUSTITUYE.length ? '¡Muy bien! Los siete pronombres son correctos.' : '';
  }
  const erase = h('button', { class: 'btn pink', type: 'button', html: ICON_ERASE + '<span>Borrar</span>', onclick: () => {
    if (st.some(Boolean)) saved = st.slice();
    st.fill(''); paint();
  } });
  const redo = h('button', { class: 'btn', type: 'button', html: ICON_REDO + '<span>Rehacer</span>', onclick: () => {
    if (saved) { saved.forEach((v, i) => { st[i] = v; }); saved = null; paint(); }
  } });
  root.replaceChildren(h('div', { class: 'subs' }, ...rows.map(r => r.el)), fb, h('div', { class: 'row-actions' }, erase, redo));
  paint();
}

/* ============================================================
   BAS-03 · Actividad 2 · Pronombres en el texto
   ============================================================ */
function initTexto() {
  const root = $('#act-texto');
  const under = new Set();
  const cells = { s1: '', s2: '', s3: '', p1: '', p2: '', p3: '' };
  let saved = null, checked = false;

  const wordEls = [];
  const story = h('div', { class: 'story' });
  let wi = 0;
  STORY.forEach(par => {
    const p = h('p', { style: 'margin:0 0 6px' });
    (par.match(/[\p{L}]+|[^\p{L}]+/gu) || []).forEach(tok => {
      if (/^[\p{L}]+$/u.test(tok)) {
        const i = wi++;
        const b = h('button', { class: 'w', type: 'button', 'aria-pressed': 'false', onclick: () => { if (under.has(i)) under.delete(i); else under.add(i); checked = false; paint(); } }, tok);
        b.dataset.expected = STORY_PRON.has(tok.toLowerCase()) ? '1' : '';
        wordEls.push(b); p.append(b);
      } else p.append(tok);
    });
    story.append(p);
  });
  story.append(h('span', { class: 'by' }, 'César Vallejo (fragmento adaptado)'));

  const fb1 = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
  const fb2 = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
  const inputs = {};
  const LABELS = { s: 'Singular', p: 'Plural' };
  const grid = h('div', { class: 'cls' }, h('span'), h('span', { class: 'h' }, 'Primera persona'), h('span', { class: 'h' }, 'Segunda persona'), h('span', { class: 'h' }, 'Tercera persona'));
  ['s', 'p'].forEach(n => {
    grid.append(h('span', { class: 'r' }, LABELS[n]));
    [1, 2, 3].forEach(k => {
      const key = n + k;
      const inp = h('input', { type: 'text', id: `cls-${key}`, 'aria-label': `${LABELS[n]}, persona ${k}`, placeholder: key === 'p2' ? 'ninguno' : '', autocomplete: 'off', spellcheck: 'false' });
      inp.addEventListener('input', () => { cells[key] = inp.value; inp.className = ''; });
      inputs[key] = inp; grid.append(inp);
    });
  });

  function paint() {
    wordEls.forEach((b, i) => {
      const u = under.has(i), exp = !!b.dataset.expected;
      b.className = 'w' + (u ? ' u' : '');
      b.setAttribute('aria-pressed', String(u));
      if (checked) { if (u && exp) b.classList.add('good'); else if (u && !exp) b.classList.add('bad'); else if (!u && exp) b.classList.add('miss'); }
    });
    Object.entries(inputs).forEach(([k, el]) => { el.value = cells[k]; });
    const good = wordEls.filter((b, i) => under.has(i) && b.dataset.expected).length;
    setScore('texto', good);
  }
  function checkUnder() {
    checked = true; paint();
    const total = STORY_PRON.size;
    const good = wordEls.filter((b, i) => under.has(i) && b.dataset.expected).length;
    const bad = under.size - good;
    fb1.className = good === total && !bad ? 'feedback ok' : 'feedback hint';
    fb1.textContent = good === total && !bad
      ? '¡Perfecto! Encontraste los seis pronombres.'
      : `Encontraste ${good} de ${total}.${bad ? ` ${bad} no ${bad === 1 ? 'es' : 'son'} pronombre${bad === 1 ? '' : 's'} de la tabla.` : ''} Los que faltan tienen borde punteado. Ojo: «El profesor» no es «Él».`;
  }
  function checkTable() {
    let ok = 0, accentHint = false;
    Object.entries(inputs).forEach(([k, el]) => {
      const got = el.value.toLowerCase().split(/[\s,;]+/).filter(w => w && w !== 'y');
      const exp = CLS_EXPECT[k];
      const same = got.length === exp.length && exp.every(w => got.includes(w));
      if (!same && got.includes('el') && exp.includes('él')) accentHint = true;
      el.className = same ? 'ok' : 'no';
      if (same) ok++;
    });
    setScore('tabla', ok);
    fb2.className = ok === 6 ? 'feedback ok' : 'feedback hint';
    fb2.textContent = ok === 6 ? '¡Tabla correcta!' : `Tienes ${ok} de 6 casilleros bien.${accentHint ? ' Recuerda: el pronombre «él» lleva tilde.' : ''}`;
  }
  const erase = h('button', { class: 'btn pink', type: 'button', html: ICON_ERASE + '<span>Borrar</span>', onclick: () => {
    if (under.size || Object.values(cells).some(Boolean)) saved = { u: new Set(under), c: { ...cells } };
    under.clear(); Object.keys(cells).forEach(k => { cells[k] = ''; Object.keys(inputs).forEach(x => { inputs[x].className = ''; }); });
    checked = false; fb1.textContent = ''; fb2.textContent = ''; setScore('tabla', 0); paint();
  } });
  const redo = h('button', { class: 'btn', type: 'button', html: ICON_REDO + '<span>Rehacer</span>', onclick: () => {
    if (saved) { saved.u.forEach(i => under.add(i)); Object.assign(cells, saved.c); saved = null; paint(); }
  } });

  root.replaceChildren(
    story,
    h('div', { class: 'row-actions', style: 'margin-top:10px' }, h('button', { class: 'btn', type: 'button', onclick: checkUnder }, 'Revisar subrayado')), fb1,
    h('h4', { style: 'margin-top:10px' }, 'Clasifica cada pronombre'),
    h('div', { class: 'cls-wrap' }, grid),
    h('div', { class: 'row-actions', style: 'margin-top:10px' }, h('button', { class: 'btn', type: 'button', onclick: checkTable }, 'Revisar tabla')), fb2,
    h('div', { class: 'row-actions' }, erase, redo));
  paint();
}

/* ============================================================
   BAS-02 · Actividad 1 · Practica el nombre de las letras
   ============================================================ */
function initBoard() { createBoard($('#act-board'), { speakKeys: true }); }

/* ============================================================
   Pestañas, botones del panel y opciones
   ============================================================ */
const TABS = ['bas-01', 'bas-02', 'bas-03'];
function showTab(id) {
  if (!TABS.includes(id)) id = 'bas-01';
  state.tab = id;
  TABS.forEach(t => {
    const sel = t === id;
    $(`#tab-${t}`).setAttribute('aria-selected', String(sel));
    $(`#tab-${t}`).tabIndex = sel ? 0 : -1;
    $(`#lesson-${t}`).hidden = !sel;
  });
  requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
}
function goTab(id) {
  try { if (location.hash.slice(1) !== id) location.hash = id; } catch (e) { /* sin hash */ }
  showTab(id);
}
function scrollToEl(el, block = 'start') { if (el) el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block }); }
function timeGreeting() { const hr = new Date().getHours(); return hr < 12 ? 'Buenos días' : hr < 19 ? 'Buenas tardes' : 'Buenas noches'; }
function setSound(on) {
  state.sound = on;
  const b = $('[data-act="sound"]');
  b.setAttribute('aria-pressed', String(on));
  b.setAttribute('aria-label', on ? 'Sonido activado' : 'Sonido desactivado');
  $('#opt-sound').checked = on;
  if (!on) { try { speechSynthesis.cancel(); } catch (e) { /* nada */ } }
}
function say(msg) { $('#greeting').textContent = msg; }

function summaryText() {
  const name = $('#u-name').value.trim();
  return `Aravarma class · Unidad 1${name ? ' · ' + name : ''}\n` + PG.map(([id, label, total]) => `${label}: ${score[id] || 0}/${total}`).join('\n');
}

function wirePanel() {
  $('#login-form').addEventListener('submit', e => { e.preventDefault(); act('start'); });
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-act]');
    if (a && a.closest('#panel-pack')) act(a.dataset.act);
    const j = e.target.closest('[data-jump]');
    if (j) scrollToEl($('#' + j.dataset.jump), 'center');
  });
  $$('.tab').forEach(t => {
    t.addEventListener('click', () => goTab(t.dataset.tab));
    t.addEventListener('keydown', e => {
      const i = TABS.indexOf(state.tab);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const n = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
        goTab(n); $(`#tab-${n}`).focus(); e.preventDefault();
      }
    });
  });
  window.addEventListener('hashchange', () => showTab(location.hash.slice(1)));
  document.addEventListener('pointerdown', e => { const p = e.target.closest('.card.act, .panel'); if (p) state.last = p; });
  $('#opt-sound').addEventListener('change', e => setSound(e.target.checked));
  $('#opt-big').addEventListener('change', e => document.documentElement.classList.toggle('big', e.target.checked));
}

function act(name) {
  switch (name) {
    case 'exit': $('#u-name').value = ''; $('#u-country').value = ''; say('¡Hasta pronto!'); scrollTo({ top: 0 }); break;
    case 'cancel': $('#u-name').value = ''; $('#u-country').value = ''; say(''); break;
    case 'start': {
      const n = $('#u-name').value.trim(), c = $('#u-country').value.trim();
      say(`${timeGreeting()}${n ? ', ' + n : ''}. Mucho gusto.${c ? ' Eres de ' + c + '.' : ''}`);
      goTab('bas-01'); scrollToEl($('#unidad')); break;
    }
    case 'resume': scrollToEl(state.last || $('#unidad')); break;
    case 'restart': initAll(); say('Todo listo para empezar de nuevo.'); break;
    case 'options': openDialog($('#dlg-options')); break;
    case 'home': scrollTo({ top: 0 }); break;
    case 'list': scrollToEl($('.tabs')); break;
    case 'next': goTab(TABS[(TABS.indexOf(state.tab) + 1) % TABS.length]); scrollToEl($('.tabs')); break;
    case 'prev': goTab(TABS[(TABS.indexOf(state.tab) + TABS.length - 1) % TABS.length]); scrollToEl($('.tabs')); break;
    case 'spin': scrollToEl($('#panel-wheel'), 'center'); spin(); break;
    case 'sound': setSound(!state.sound); break;
    case 'copy': {
      const txt = summaryText();
      try {
        navigator.clipboard.writeText(txt).then(() => say('Progreso copiado.')).catch(() => say('No se pudo copiar el progreso.'));
      } catch (e) { say('No se pudo copiar el progreso.'); }
      break;
    }
  }
}

/* ============================================================
   Inicio
   ============================================================ */
function initAll() {
  score = {};
  initAlphabet(); initPractice(); initSpell(); initWheel();
  initOrdena(); initSopa(); initSD(); initDialogos();
  initBoard(); initSustituye(); initTexto();
  renderProgress();
}

wirePanel();
initAll();
showTab(location.hash.slice(1));
