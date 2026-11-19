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
    const vs = speechSynthesis.getVoices().filter(v => /^es/i.test(v.lang) || /spanish|español/i.test(v.name));
    voice = vs.find(v => /^es[-_](PE|MX|US|419|CO|AR|CL)/i.test(v.lang) && /natural|online/i.test(v.name))
      || vs.find(v => /^es[-_](PE|MX|US|419|CO|AR|CL)/i.test(v.lang)) || vs.find(v => /natural|online/i.test(v.name)) || vs[0] || null;
  } catch (e) { voice = null; }
}
try { speechSynthesis.onvoiceschanged = pickVoice; pickVoice(); } catch (e) { /* sin voz */ }
/* Si el aparato no tiene voz en español, estas escrituras hacen que una voz en inglés suene casi como en español. */
const FALLBACK_SAY = { a: 'ah', be: 'beh', ce: 'seh', de: 'deh', e: 'eh', efe: 'eh-feh', ge: 'heh', hache: 'ah-cheh', i: 'ee', jota: 'hoh-tah', ka: 'kah',
  ele: 'eh-leh', eme: 'eh-meh', ene: 'eh-neh', 'eñe': 'eh-nyeh', o: 'oh', pe: 'peh', cu: 'koo', erre: 'eh-rreh', ese: 'eh-seh', te: 'teh', u: 'oo',
  uve: 'oo-veh', 'uve doble': 'oo-veh doh-bleh', equis: 'eh-kees', 'i griega': 'ee gree-eh-gah', zeta: 'seh-tah' };
function speak(text) {
  if (!state.sound || !text) return;
  try {
    if (!voice) pickVoice();
    speechSynthesis.cancel();
    const t = (!voice && FALLBACK_SAY[String(text).toLowerCase()]) || text;
    const u = new SpeechSynthesisUtterance(t);
    u.lang = voice ? voice.lang : 'es-ES';
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
  ['sust', 'Sustituye', 7], ['texto', 'Texto', 6], ['tabla', 'Tabla', 6], ['prac', 'Practiquemos', 8], ['escribe', 'Escribe', 9],
  ['serA', 'Ser A', 8], ['serB', 'Ser B', 17], ['serC', 'Ser C', 6], ['tenA', 'Tener A', 6], ['tenB', 'Tener B', 5], ['tenC', 'Anagramas', 4],
  ['ruleta', 'Ruleta', RULETA.length],
];
let score = {};
/* Etiquetas de felicitación: salen cuando aciertas y al completar la actividad */
const PRAISE = [['muybien', 'Muy bien'], ['buentrabajo', 'Buen trabajo'], ['felicitaciones', 'Felicitaciones']];
const PRAISE_END = [['excelente', 'Excelente']];
const ACT_BOX = { ordena: '#act-ordena', sopa: '#act-sopa', sd: '#act-sd', dial: '#act-dialogos', sust: '#act-sustituye', texto: '#act-texto', tabla: '#act-texto', prac: '#practice-mount', escribe: '#spellit-mount', serA: '#act-ser-a', serB: '#act-ser-b', serC: '#act-ser-c', tenA: '#act-ten-a', tenB: '#act-ten-b', tenC: '#act-ten-c', ruleta: '#wheel-mount' };
let praiseTimer = null, praiseN = 0, endN = 0;
function showPraise([img, text], big) {
  let el = $('#praise');
  if (!el) { el = h('div', { id: 'praise', class: 'praise', role: 'status', 'aria-live': 'polite' }); document.body.append(el); }
  el.className = 'praise' + (big ? ' big' : '');
  el.replaceChildren(h('img', { src: `images/etiqueta-${img}.webp`, alt: text }), h('span', { class: 'sr-only' }, text));
  void el.offsetWidth; // reinicia la animación
  el.classList.add('show');
  if (state.sound) speak(text);
  clearTimeout(praiseTimer);
  praiseTimer = setTimeout(() => el.classList.remove('show'), big ? 2800 : 1700);
}
function markDone(id, done) {
  const box = $(ACT_BOX[id] || 'body'); const card = box && box.closest('.card');
  const head = card && ($('.act-head h4', card) || $('.flip-head b', card));
  if (!head) return;
  const key = 'done-' + id; let tag = head.querySelector('.' + key);
  if (done && !tag) head.append(h('img', { class: 'done-tag ' + key, src: 'images/etiqueta-excelente.webp', alt: 'Excelente' }));
  if (!done && tag) tag.remove();
}
function setScore(id, got) {
  const before = score[id] || 0, total = (PG.find(p => p[0] === id) || [])[2];
  score[id] = got;
  renderProgress();
  markDone(id, total && got === total);
  if (got > before && total) {
    if (got === total) showPraise(PRAISE_END[endN++ % PRAISE_END.length], true);
    else showPraise(PRAISE[praiseN++ % PRAISE.length], false);
  }
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
const SIGNS = '¿?¡!:;,."\'';
const SIGN_NAME = { '¿': 'signo de pregunta (abre)', '?': 'signo de pregunta (cierra)', '¡': 'signo de admiración (abre)', '!': 'signo de admiración (cierra)', ':': 'dos puntos', ';': 'punto y coma', ',': 'coma', '.': 'punto', '"': 'comillas', "'": 'comilla simple' };
const SWATCHES = [['Rosa intenso', '#ff2f8e'], ['Fucsia', '#d11fc2'], ['Lavanda claro', '#a58af0']];
const ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="#4a1650" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';
const ICON_REDO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 5v6h-6"/><path d="M20 11a8 8 0 1 0-2.3 6.3"/></svg>';
const ICON_MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
const ICON_ERASE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>';

function createBoard(root, opts = {}) {
  let color = SWATCHES[0][1], set = 'up';
  let tokens = [], redoStack = [], caret = 0; // caret: posición del cursor (0 = al inicio)

  const surface = h('div', { class: 'surface', tabindex: '0', role: 'group', 'aria-label': 'Tablero de escritura. Escribe con las letras de abajo o con tu teclado.' });
  const keys = h('div', { class: 'keys', role: 'group', 'aria-label': 'Letras' });
  const signs = h('div', { class: 'keys signs', role: 'group', 'aria-label': 'Signos' });
  const tabs = h('div', { class: 'kt', role: 'group', 'aria-label': 'Tipo de teclado' });
  const swatchBox = h('div', { class: 'wb-top', role: 'radiogroup', 'aria-label': 'Color de las letras' });

  const caretEl = () => h('span', { class: 'caret', 'aria-hidden': 'true' });
  function render(newIdx = -1) {
    surface.replaceChildren();
    if (!tokens.length) surface.append(h('span', { class: 'ph' }, opts.placeholder || 'Toca las letras para escribir aquí…'));
    let word = null; // cada palabra va junta: no se parte entre dos renglones
    const putCaret = () => { (word || surface).append(caretEl()); };
    if (caret === 0 && tokens.length) putCaret();
    tokens.forEach((t, i) => {
      if (t.gap) {
        surface.append(h('span', { class: 'mg gap', onclick: () => { caret = i + 1; render(); } })); word = null;
        if (caret === i + 1 && i + 1 < tokens.length) surface.append(caretEl());
        return;
      }
      if (!word) { word = h('span', { class: 'mgw' }); surface.append(word); }
      word.append(h('span', { class: 'mg' + (i === newIdx ? ' new' : ''), style: `color:${t.color}`, title: 'Toca para poner el cursor aquí', onclick: () => { caret = i + 1; render(); surface.focus(); } }, t.ch));
      if (caret === i + 1 && (i + 1 < tokens.length || true)) word.append(caretEl());
    });
    if (opts.onChange) opts.onChange(getText());
  }
  function getText() { return tokens.map(t => (t.gap ? ' ' : t.ch)).join('').replace(/\s+/g, ' ').trim(); }
  function add(ch) {
    tokens.splice(caret, 0, { ch, color }); caret++;
    redoStack = [];
    render(caret - 1);
    if (opts.speakKeys) speak(letterName(ch) || ch);
  }
  function separate() {
    if (!caret || tokens[caret - 1].gap) return;
    tokens.splice(caret, 0, { gap: true }); caret++; redoStack = []; render();
  }
  function erase() { // borra la letra que está antes del cursor
    if (!caret) return;
    redoStack.push({ at: caret - 1, t: tokens.splice(caret - 1, 1) }); caret--;
    render();
  }
  function clearAll() {
    if (!tokens.length) return;
    redoStack.push({ at: 0, t: tokens.slice() }); tokens = []; caret = 0; render();
  }
  function redo() {
    const g = redoStack.pop();
    if (g) { tokens.splice(g.at, 0, ...g.t); caret = g.at + g.t.length; render(); }
  }
  function move(d) { caret = Math.max(0, Math.min(tokens.length, caret + d)); render(); }

  function drawKeys() {
    keys.className = 'keys' + (set === 'up' || set === 'lo' ? ' two' : '');
    keys.replaceChildren(...[...KEYSETS[set][1]].map(ch =>
      h('button', { class: 'mk', type: 'button', 'aria-label': letterName(ch) ? `${ch}, ${letterName(ch)}` : ch, onclick: () => add(ch) }, ch)));
    $$('button', tabs).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.set === set)));
  }
  Object.entries(KEYSETS).forEach(([k, [label]]) => {
    tabs.append(h('button', { type: 'button', 'data-set': k, 'aria-pressed': String(k === set), onclick: () => { set = k; drawKeys(); } }, label));
  });
  signs.replaceChildren(h('span', { class: 'signs-label' }, 'Signos'),
    ...[...SIGNS].map(ch => h('button', { class: 'mk', type: 'button', 'aria-label': SIGN_NAME[ch], title: SIGN_NAME[ch], onclick: () => add(ch) }, ch)));

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
    else if (e.key === 'ArrowLeft') { move(-1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { move(1); e.preventDefault(); }
    else if (e.key === 'Delete') { if (caret < tokens.length) { caret++; erase(); } e.preventDefault(); }
    else if (e.key === ' ') { separate(); e.preventDefault(); }
    else if (e.key.length === 1 && /[\p{L}\d¿?¡!.,:;"']/u.test(e.key)) { add(e.key); e.preventDefault(); }
  });

  const side = h('div', { class: 'wb-side' }, swatchBox,
    h('button', { class: 'wb-btn', type: 'button', onclick: erase, html: '<span>Borrar</span>' + ICON_ERASE }),
    h('button', { class: 'wb-btn', type: 'button', onclick: separate, html: '<span>Separa</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h6l6-6M10 12l6 6M16 6h4M16 18h4"/></svg>' }),
    h('button', { class: 'wb-btn', type: 'button', onclick: redo, html: '<span>Rehacer</span>' + ICON_REDO }),
    h('div', { class: 'wb-arrows' },
      h('button', { class: 'wb-mini', type: 'button', 'aria-label': 'Mover el cursor a la izquierda', onclick: () => move(-1) }, '◀'),
      h('button', { class: 'wb-mini', type: 'button', 'aria-label': 'Mover el cursor a la derecha', onclick: () => move(1) }, '▶')));
  const extra = (opts.extra || []).filter(Boolean);

  root.replaceChildren(h('div', { class: 'wb' + (opts.compact ? ' compact' : '') + (opts.classic ? ' classic' : '') },
    opts.compact || opts.classic ? null : h('h3', { class: 'wb-title' }, 'Tablero de escritura'),
    h('div', { class: 'wb-main' }, surface, side),
    keys, signs, tabs,
    extra.length ? h('div', { class: 'row-actions' }, ...extra) : null));
  drawKeys(); render();
  return { getText, clear: () => { tokens = []; redoStack = []; caret = 0; render(); }, focus: () => surface.focus() };
}

/* ============================================================
   Alfabeto
   ============================================================ */
function initAlphabet() {
  const grid = $('#alpha-grid'), cap = $('#alpha-caption');
  let timer = null, running = false;
  const reset = '<span>Toca una letra para ver y escuchar su nombre.</span>';
  function pick(i) {
    const [u, l, n] = ALPHA[i];
    $$('.key', grid).forEach((k, j) => k.classList.toggle('on', j === i));
    cap.replaceChildren(h('b', null, `${u}${l}`), ` · ${n}`, l === 'h' ? ' (¡es muda!)' : '');
    playClip(`audio/letras/${letterFile(l)}.mp3`, n); // si grabas tu voz en audio/letras/, se usa; si no, habla el navegador
  }
  function stop() { clearTimeout(timer); running = false; startBtn.disabled = false; }
  function run(i) {
    if (!running) return;
    if (i >= ALPHA.length) { stop(); return; }
    pick(i); timer = setTimeout(() => run(i + 1), 1300);
  }
  const startBtn = h('button', { class: 'btn', type: 'button', html: ICON_REDO.replace('M20 5v6h-6', 'M4 5l14 7-14 7z').replace('<path d="M20 11a8 8 0 1 0-2.3 6.3"/>', '') + '<span>Iniciar</span>',
    onclick: () => { stop(); running = true; startBtn.disabled = true; run(0); } });
  const undoBtn = h('button', { class: 'btn pink', type: 'button', html: ICON_ERASE + '<span>Deshacer</span>',
    onclick: () => { stop(); $$('.key', grid).forEach(k => k.classList.remove('on')); cap.textContent = 'Toca una letra para ver y escuchar su nombre.'; try { speechSynthesis.cancel(); } catch (e) { /* sin voz */ } } });
  grid.replaceChildren(...ALPHA.map(([u, l, n], i) => h('button', {
    class: 'key', type: 'button', 'aria-label': `${u}, ${n}`,
    onclick: () => { stop(); pick(i); },
  }, h('span', { class: 'up' }, u), h('span', { class: 'lo' }, l), h('span', { class: 'nm' }, n))));
  const bar = $('#alpha-actions');
  if (bar) bar.replaceChildren(startBtn, undoBtn);
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
/* ---- micrófono: reconoce letras dichas en voz alta ---- */
const SAY_LETTER = {
  a: 'a', be: 'b', b: 'b', ve: 'bv', uve: 'v', v: 'v', ce: 'c', se: 'cs', c: 'c', de: 'd', d: 'd', e: 'e', efe: 'f', f: 'f', ge: 'g', je: 'gj', g: 'g',
  hache: 'h', ache: 'h', h: 'h', i: 'i', jota: 'j', j: 'j', ka: 'k', k: 'k', ca: 'k', ele: 'l', l: 'l', eme: 'm', m: 'm', ene: 'n', n: 'n', 'eñe': 'ñ', ñ: 'ñ',
  o: 'o', pe: 'p', p: 'p', cu: 'q', ku: 'q', q: 'q', erre: 'r', ere: 'r', r: 'r', ese: 's', s: 's', te: 't', t: 't', u: 'u', equis: 'x', x: 'x',
  ye: 'y', y: 'y', griega: 'y', ze: 'z', zeta: 'z', seta: 'z', z: 'z', w: 'w', doble: 'w', i_griega: 'y',
};
function spokenToLetters(text) {
  const parts = fold(text).replace(/[-_.,]/g, ' ').replace(/\buve doble\b/g, 'w').replace(/\bdoble ve\b/g, 'w').replace(/\bi griega\b/g, 'y').split(/\s+/).filter(Boolean);
  return parts.map(p => SAY_LETTER[p] || '?');
}
function matchSpelling(texts, word) {
  const target = [...fold(word).replace(/\s/g, '')];
  let best = null;
  for (const t of texts) {
    const got = spokenToLetters(t);
    const hits = target.map((c, i) => !!got[i] && got[i].includes(c));
    const score = hits.filter(Boolean).length;
    const full = got.length === target.length && hits.every(Boolean);
    if (!best || full || score > best.score) best = { got, hits, score, full, text: t };
    if (full) break;
  }
  return best;
}

function initSpell() {
  const m = $('#spell-mount');
  let idx = -1, sep = false, hidden = false;

  const chips = h('div', { class: 'spell-chips', role: 'group', 'aria-label': 'Palabras para deletrear' });
  SPELL.forEach((w, i) => chips.append(h('button', { class: 'chip-w', type: 'button', 'data-i': i, 'aria-pressed': 'false', onclick: () => go(i) }, w)));
  const slate = h('div', { class: 'slate', role: 'button', tabindex: '0', 'aria-label': 'Pizarra. Toca para ver la siguiente palabra.' });
  const pencil = fromHTML('<svg class="pencil" viewBox="0 0 30 54" aria-hidden="true"><path d="M7 4h16l2 36-10 12L5 40z" fill="#ffd84a" stroke="#c98a00" stroke-width="2" stroke-linejoin="round"/><path d="M15 52l-8-12h16z" fill="#ffe3c2" stroke="#c98a00" stroke-width="2" stroke-linejoin="round"/><path d="M13 48l2 4 2-4z" fill="#4a1650"/><path d="M7 4h16v6H7z" fill="#ff8cc6" stroke="#c98a00" stroke-width="2"/></svg>');
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micMsg = h('p', { class: 'feedback mic-msg', role: 'status', 'aria-live': 'polite' });
  let rec = null, listening = false;
  const micBtn = h('button', { class: 'btn mic', type: 'button', 'aria-pressed': 'false', html: ICON_MIC + '<span>Deletrear con el micrófono</span>', onclick: () => toggleMic() });
  function stopMic() { try { if (rec) rec.abort(); } catch (e) { /* nada */ } listening = false; micBtn.setAttribute('aria-pressed', 'false'); micBtn.classList.remove('live'); }
  function toggleMic() {
    if (listening) { stopMic(); micMsg.className = 'feedback hint'; micMsg.textContent = ''; return; }
    if (!SR) { micMsg.className = 'feedback no'; micMsg.textContent = 'Este navegador no escucha el micrófono. Prueba con Chrome o Edge.'; return; }
    if (idx < 0) { micMsg.className = 'feedback hint'; micMsg.textContent = 'Primero elige una palabra.'; return; }
    if (hidden) { hidden = false; draw(false); }
    const word = SPELL[idx];
    rec = new SR(); rec.lang = 'es-PE'; rec.interimResults = false; rec.maxAlternatives = 5; rec.continuous = false;
    rec.onresult = ev => {
      const texts = [...ev.results[0]].map(a => a.transcript);
      const r = matchSpelling(texts, word);
      $$('.lt', slate).forEach((el, i) => { el.classList.remove('hit', 'miss'); if (r.got[i]) el.classList.add(r.hits[i] ? 'hit' : 'miss'); });
      if (r.full) { micMsg.className = 'feedback ok'; micMsg.textContent = `¡Muy bien! Deletreaste «${word}».`; }
      else if (fold(texts[0]).replace(/\s/g, '') === fold(word).replace(/\s/g, '')) { micMsg.className = 'feedback hint'; micMsg.textContent = 'Dijiste la palabra completa. Ahora di cada letra: ' + [...word].filter(c => c !== ' ').map(letterName).join(', ') + '.'; }
      else { micMsg.className = 'feedback no'; micMsg.textContent = `Escuché: ${texts[0]}. Inténtalo otra vez, letra por letra.`; }
    };
    rec.onerror = ev => { micMsg.className = 'feedback no'; micMsg.textContent = ev.error === 'not-allowed' || ev.error === 'service-not-allowed' ? 'Permite el micrófono en tu navegador para usar esta función.' : ev.error === 'no-speech' ? 'No te escuché. Inténtalo otra vez.' : 'No pude escuchar. Inténtalo otra vez.'; };
    rec.onend = () => { listening = false; micBtn.setAttribute('aria-pressed', 'false'); micBtn.classList.remove('live'); };
    try { rec.start(); listening = true; micBtn.setAttribute('aria-pressed', 'true'); micBtn.classList.add('live'); micMsg.className = 'feedback hint'; micMsg.textContent = `Escuchando… di las letras de «${word}» una por una.`; } catch (e) { stopMic(); }
  }
  const controls = h('div', { class: 'spell-controls', role: 'group', 'aria-label': 'Controles de la pizarra' },
    h('button', { class: 'btn pink', type: 'button', html: ICON_ERASE + '<span>Borrar</span>', onclick: () => { if (idx >= 0 && !hidden) { hidden = true; draw(false); } } }),
    h('button', { class: 'btn', type: 'button', html: ICON_REDO + '<span>Rehacer</span>', onclick: () => { if (idx < 0) go(0); else { hidden = false; draw(true); } } }),
    h('button', { class: 'btn', type: 'button', 'aria-pressed': 'false', onclick: ev => { sep = !sep; ev.currentTarget.setAttribute('aria-pressed', String(sep)); draw(false); } }, 'Separar'),
    micBtn);

  function draw(animate = true) {
    $$('.chip-w', m).forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.i === idx)));
    slate.classList.toggle('sep', sep);
    slate.replaceChildren();
    if (idx < 0 || hidden) {
      slate.append(h('span', { class: 'ph' }, idx < 0 ? 'Elige una palabra o toca la pizarra' : 'Pizarra borrada. Pulsa «Rehacer».'));
    } else {
      let n = 0;
      SPELL[idx].split(' ').forEach(word => { // cada palabra va completa en un solo renglón
        slate.append(h('span', { class: 'word' }, ...[...word].map(ch => {
          const i = n++;
          return h('span', { class: 'lt', style: animate ? `animation-delay:${i * 90}ms` : 'animation:none' },
            h('span', { class: 'c' }, ch), h('span', { class: 'n' }, letterName(ch)));
        })));
      });
    }
    slate.append(pencil);
  }
  function go(i) {
    stopMic(); micMsg.textContent = '';
    idx = i; hidden = false; draw();
    const w = SPELL[i];
    playClip(`audio/deletreo/${slug(w)}.mp3`, `${w}. ${[...w].filter(c => c !== ' ').map(letterName).filter(Boolean).join(', ')}`);
  }
  slate.addEventListener('click', () => go((idx + 1) % SPELL.length));
  slate.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go((idx + 1) % SPELL.length); } });

  m.replaceChildren(h('p', { class: 'hint' }, 'Elige una palabra o toca la pizarra para ver la siguiente.'), chips, slate, controls, micMsg);
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
  fb.className = 'feedback' + (item.hint ? ' hint' : ''); fb.textContent = item.hint || '';
  let finished = false;

  const validar = h('button', { class: 'btn', type: 'button', onclick: validate }, 'Validar');
  const ver = item.free ? null : h('button', { class: 'btn pink', type: 'button', onclick: reveal }, 'Ver respuesta');
  const board = createBoard($('#dq-board'), { extra: [validar, ver], speakKeys: true, compact: true, placeholder: 'Escribe tu respuesta aquí…' });

  function conclude(right) {
    finished = true; validar.disabled = true; if (ver) ver.disabled = true;
    wheelState.results[item.n] = right; wheelState.asked++;
    setScore('ruleta', Object.values(wheelState.results).filter(Boolean).length);
    updateWheelScore();
  }
  // Puedes corregir y validar las veces que quieras. «Ver respuesta» cierra la pregunta.
  function reveal() {
    if (finished) return;
    fb.className = 'feedback no'; fb.textContent = `La respuesta es: ${item.show}.`; conclude(false);
  }
  function validate() {
    if (finished) return;
    const text = board.getText();
    if (!text) { fb.className = 'feedback hint'; fb.textContent = 'Escribe tu respuesta en el tablero.'; board.focus(); return; }
    if (item.free) { fb.className = 'feedback ok'; fb.textContent = '¡Muy bien! Ahora deletrea tu nombre en voz alta.'; conclude(true); return; }
    const g = grade(text, item.a);
    if (g === 'ok') { fb.className = 'feedback ok'; fb.textContent = '¡Correcto!'; conclude(true); }
    else if (g === 'accent') { fb.className = 'feedback ok'; fb.textContent = `¡Correcto! Recuerda la tilde: ${item.show}.`; conclude(true); }
    else { fb.className = 'feedback no'; fb.textContent = 'Casi. Corrige tu respuesta en el tablero y vuelve a validar.'; board.focus(); }
  }
  const onClose = () => {
    dlg.removeEventListener('close', onClose);
    if (!finished) wheelState.deck.push(qi); // se cerró sin responder: vuelve al mazo
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
  let found = [], sel = [], drag = null, saved = null;

  const soup = h('div', { class: 'soup', style: `grid-template-columns:repeat(${COLS},1fr)`, role: 'group', 'aria-label': 'Sopa de letras' });
  const cellEls = G.map((row, r) => row.map((ch, c) => {
    const b = h('button', { class: 'sc', type: 'button', 'data-r': r, 'data-c': c, 'aria-label': `${ch}, fila ${r + 1}, columna ${c + 1}`, tabindex: r === 0 && c === 0 ? '0' : '-1' }, ch);
    soup.append(b); return b;
  }));
  const wordsBox = h('div', { class: 'words', 'aria-label': 'Palabras por encontrar' },
    ...SOUP_WORDS.map(([label], i) => h('span', { class: 'wd', 'data-i': i }, label)));
  const fb = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];
  const cellOf = el => { const c = el && el.closest && el.closest('.sc'); return c ? [+c.dataset.r, +c.dataset.c] : null; };

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
  // Revisa las letras marcadas: si forman una de las expresiones, queda encontrada.
  function checkSel(fromDrag) {
    const str = sel.map(([r, c]) => G[r][c]).join(''), rev = [...str].reverse().join('');
    const wi = SOUP_WORDS.findIndex(([, w], i) => !found.some(f => f.wi === i) && (w === str || w === rev));
    if (wi >= 0) {
      found.push({ wi, cells: sel.slice() }); sel = [];
      fb.className = 'feedback ok';
      fb.textContent = found.length === SOUP_WORDS.length ? '¡Encontraste las diez expresiones!' : `¡Muy bien! «${SOUP_WORDS[wi][0]}».`;
    } else if (fromDrag) {
      sel = []; fb.className = 'feedback no'; fb.textContent = 'Esa no es una de las expresiones. Inténtalo otra vez.';
    } else {
      fb.className = 'feedback hint'; fb.textContent = sel.length ? `Letras marcadas: ${str}` : '';
    }
    paint();
  }
  function toggle(p) {
    const i = sel.findIndex(q => same(q, p));
    if (i >= 0) sel.splice(i, 1); else sel.push(p);
    checkSel(false);
  }

  soup.addEventListener('pointerdown', e => {
    const p = cellOf(e.target); if (!p) return;
    e.preventDefault();
    drag = { start: p, moved: false };
    try { soup.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
  });
  soup.addEventListener('pointermove', e => {
    if (!drag) return;
    const p = cellOf(document.elementFromPoint(e.clientX, e.clientY)); if (!p) return;
    if (!same(p, drag.start) || drag.moved) { drag.moved = true; sel = line(drag.start, p); paint(); }
  });
  soup.addEventListener('pointerup', () => {
    if (!drag) return;
    const d = drag; drag = null;
    if (d.moved) checkSel(true); else toggle(d.start);
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
    const p = cellOf(e.target); if (p) toggle(p);
  });

  const erase = h('button', { class: 'btn pink', type: 'button', html: ICON_ERASE + '<span>Borrar</span>', onclick: () => {
    if (found.length) saved = found.slice();
    found = []; sel = []; fb.textContent = ''; paint();
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
  const doErase = () => {
    if (under.size || Object.values(cells).some(Boolean)) saved = { u: new Set(under), c: { ...cells } };
    under.clear(); Object.keys(cells).forEach(k => { cells[k] = ''; });
    Object.keys(inputs).forEach(x => { inputs[x].className = ''; });
    checked = false; fb1.textContent = ''; fb2.textContent = ''; setScore('tabla', 0); paint();
  };
  const doRedo = () => {
    if (saved) { saved.u.forEach(i => under.add(i)); Object.assign(cells, saved.c); saved = null; paint(); }
  };
  const mkBtns = () => [
    h('button', { class: 'btn pink', type: 'button', html: ICON_ERASE + '<span>Borrar</span>', onclick: doErase }),
    h('button', { class: 'btn', type: 'button', html: ICON_REDO + '<span>Rehacer</span>', onclick: doRedo }),
  ];

  root.replaceChildren(
    story,
    h('div', { class: 'row-actions', style: 'margin-top:10px' }, ...mkBtns(), h('button', { class: 'btn', type: 'button', onclick: checkUnder }, 'Revisar subrayado')), fb1,
    h('h4', { style: 'margin-top:10px' }, 'Clasifica cada pronombre'),
    h('div', { class: 'cls-wrap' }, grid),
    h('div', { class: 'row-actions', style: 'margin-top:10px' }, ...mkBtns(), h('button', { class: 'btn', type: 'button', onclick: checkTable }, 'Revisar tabla')), fb2);
  paint();
}

/* ============================================================
   BAS-02 · Actividad 1 · Practica el nombre de las letras
   ============================================================ */
function initBoard() { createBoard($('#act-board'), { speakKeys: true, classic: true }); }


/* ============================================================
   Saludos con imagen (BAS-01): al tocar un saludo aparece su escena
   ============================================================ */
function kid(x, y, o = {}) {
  const { hair = '#f0662b', shirt = '#b8e286', wave = false, eyes = 'happy', pack = false, body = true } = o;
  const eye = eyes === 'closed' ? '<path d="M-17 -2 q7 7 14 0 M3 -2 q7 7 14 0" fill="none" stroke="#4a1650" stroke-width="3.2" stroke-linecap="round"/>'
    : eyes === 'happy' ? '<path d="M-17 2 q7 -9 14 0 M3 2 q7 -9 14 0" fill="none" stroke="#4a1650" stroke-width="3.2" stroke-linecap="round"/>'
    : '<circle cx="-10" cy="-1" r="3.6" fill="#4a1650"/><circle cx="10" cy="-1" r="3.6" fill="#4a1650"/>';
  return `<g transform="translate(${x} ${y})">
    ${pack ? '<rect x="-34" y="38" width="22" height="40" rx="9" fill="#7f58d6" stroke="#4a1650" stroke-opacity=".4" stroke-width="2"/>' : ''}
    ${body ? `<rect x="-27" y="34" width="54" height="58" rx="21" fill="${shirt}" stroke="#4a1650" stroke-opacity=".3" stroke-width="2"/>` : ''}
    ${wave ? `<path d="M22 48 C48 40 52 14 46 -4" stroke="${shirt}" stroke-width="15" stroke-linecap="round" fill="none"/><circle cx="46" cy="-9" r="9.5" fill="#ffe0c7" stroke="#e9b995" stroke-width="2"/>` : ''}
    <circle r="32" fill="#ffe0c7" stroke="#e9b995" stroke-width="2"/>
    <path d="M-33 0 C-38 -40 -6 -46 3 -35 C16 -46 42 -36 33 0 C25 -17 12 -17 0 -22 C-14 -18 -27 -16 -33 0Z" fill="${hair}" stroke="#4a1650" stroke-opacity=".25" stroke-width="2" stroke-linejoin="round"/>
    ${eye}
    <path d="M-9 12 q9 10 18 0z" fill="#c23a55" stroke="#4a1650" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="-22" cy="10" r="5" fill="#ff9ab8" opacity=".6"/><circle cx="22" cy="10" r="5" fill="#ff9ab8" opacity=".6"/>
  </g>`;
}
function bubble(x, y, w, text) {
  return `<g><rect x="${x}" y="${y}" width="${w}" height="40" rx="20" fill="#fff" stroke="#e590c2" stroke-width="3"/>
    <path d="M${x + w / 2 - 9} ${y + 38} l9 15 l9 -15z" fill="#fff" stroke="#e590c2" stroke-width="3" stroke-linejoin="round"/>
    <rect x="${x + w / 2 - 11}" y="${y + 34}" width="22" height="7" fill="#fff"/>
    <text x="${x + w / 2}" y="${y + 27}" text-anchor="middle" font-family="Lilita One, Baloo 2, sans-serif" font-size="21" fill="#4a1650">${text}</text></g>`;
}
const GREET = {
  hola: {
    t: '¡Hola!', sub: 'El saludo más común. Sirve a cualquier hora del día.',
    svg: `<rect width="420" height="230" fill="#ffe3f1"/><ellipse cx="70" cy="46" rx="40" ry="15" fill="#fff"/><ellipse cx="350" cy="36" rx="34" ry="13" fill="#fff"/>
      <rect y="184" width="420" height="46" fill="#cdeaa8"/>
      ${kid(125, 112, { wave: true })}${kid(300, 112, { hair: '#6b3fa0', shirt: '#ffa8d5', wave: true })}
      ${bubble(70, 8, 110, '¡Hola!')}${bubble(250, 8, 110, '¡Hola!')}`,
  },
  dias: {
    t: 'Buenos días', sub: 'Se usa por la mañana, hasta el mediodía.',
    svg: `<rect width="420" height="230" fill="#fff1b8"/><rect width="420" height="120" fill="#ffe3a0"/>
      <circle cx="300" cy="160" r="62" fill="#ffd84a" stroke="#f0a91f" stroke-width="4"/>
      <g stroke="#f0a91f" stroke-width="5" stroke-linecap="round"><path d="M300 62v-18M236 84l-12-12M364 84l12-12M212 150h-18M388 150h18"/></g>
      <path d="M0 190 C60 150 120 160 190 188 C250 170 340 168 420 192 V230 H0Z" fill="#9ed36b"/>
      <path d="M0 208 C80 190 160 204 240 200 C320 196 380 206 420 204 V230 H0Z" fill="#7cc15a"/>
      <path d="M60 50 q8 -9 16 0 q8 -9 16 0 M120 78 q6 -7 12 0 q6 -7 12 0" fill="none" stroke="#4a1650" stroke-width="3" stroke-linecap="round" opacity=".6"/>
      ${kid(130, 110, { wave: true, eyes: 'happy' })}${bubble(205, 14, 190, '¡Buenos días!')}`,
  },
  tardes: {
    t: 'Buenas tardes', sub: 'Desde el mediodía hasta las 19:00 o 20:00 aproximadamente.',
    svg: `<rect width="420" height="230" fill="#ffd2a8"/><rect width="420" height="90" fill="#ffb98a"/>
      <circle cx="330" cy="132" r="40" fill="#ff8a4a" stroke="#d9561a" stroke-width="4"/>
      <ellipse cx="90" cy="60" rx="46" ry="14" fill="#ffe3ec"/><ellipse cx="120" cy="52" rx="30" ry="12" fill="#ffe3ec"/><ellipse cx="270" cy="74" rx="36" ry="11" fill="#ffe3ec"/>
      <path d="M0 176 C90 150 180 168 260 160 C330 152 380 166 420 160 V230 H0Z" fill="#d9a066"/>
      <path d="M0 200 C100 184 200 204 300 196 C360 192 400 198 420 198 V230 H0Z" fill="#c48a52"/>
      ${kid(150, 112, { pack: true, shirt: '#ffa8d5', hair: '#4a1650', eyes: 'open' })}${bubble(200, 12, 200, 'Buenas tardes')}`,
  },
  noches: {
    t: 'Buenas noches', sub: 'Al atardecer y de noche. También sirve para despedirse.',
    svg: `<rect width="420" height="230" fill="#2c2a63"/>
      <circle cx="334" cy="64" r="34" fill="#fff6c8"/><circle cx="348" cy="56" r="30" fill="#2c2a63"/>
      <g><use href="#sparkle" x="40" y="26" width="22" height="22"/><use href="#sparkle" x="120" y="60" width="16" height="16"/><use href="#sparkle" x="250" y="30" width="20" height="20"/><use href="#sparkle" x="190" y="96" width="14" height="14"/><use href="#sparkle" x="380" y="120" width="18" height="18"/></g>
      <rect x="30" y="146" width="322" height="70" rx="18" fill="#e6dbff" stroke="#b79af5" stroke-width="3"/>
      <rect x="40" y="118" width="110" height="52" rx="22" fill="#bcd8ff" stroke="#7aa6e0" stroke-width="3" transform="rotate(-4 95 144)"/>
      <g transform="rotate(-8 100 140)">${kid(100, 134, { eyes: 'closed', body: false })}</g>
      <path d="M118 154 H334 a18 18 0 0 1 18 18 V198 a18 18 0 0 1 -18 18 H118Z" fill="#37b79f" stroke="#1d8a76" stroke-width="3"/>
      <g stroke="#9be3d3" stroke-width="2" opacity=".7"><path d="M170 156V212M230 156V212M290 156V212M118 184H350"/></g>
      <text x="180" y="110" font-family="Lilita One, sans-serif" font-size="30" fill="#e6dbff">Z</text><text x="210" y="86" font-family="Lilita One, sans-serif" font-size="24" fill="#e6dbff">z</text><text x="232" y="68" font-family="Lilita One, sans-serif" font-size="18" fill="#e6dbff">z</text>
      ${bubble(205, 14, 200, '¡Buenas noches!')}`,
  },
};
function initGreetings() {
  const stage = $('#greet-stage');
  if (!stage) return;
  const intro = `<svg viewBox="0 0 420 230" role="img" aria-label="Toca un saludo"><rect width="420" height="230" fill="#f3e7ff"/><use href="#butterfly" x="150" y="40" width="120" height="96"/><text x="210" y="190" text-anchor="middle" font-family="Lilita One, Baloo 2, sans-serif" font-size="24" fill="#7a3f7f">Toca un saludo</text></svg>`;
  const draw = (key, animate) => {
    const g = GREET[key];
    stage.replaceChildren(
      h('div', { class: 'gs-pic' + (animate ? ' swap' : ''), html: g ? `<svg viewBox="0 0 420 230" role="img" aria-label="Escena: ${g.t}">${g.svg}</svg>` : intro }),
      h('p', { class: 'gs-text' }, g ? g.t : 'Saludos'),
      h('p', { class: 'gs-sub' }, g ? g.sub : 'Toca un saludo para ver su imagen y escucharlo.'));
  };
  $$('.dt[data-g]').forEach(btn => {
    btn.onclick = () => {
      const key = btn.dataset.g;
      $$('.dt[data-g]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      draw(key, true);
      speak(GREET[key].t.replace('¡', '').replace('!', ''));
    };
    btn.setAttribute('aria-pressed', 'false');
  });
  draw(null, false);
}

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
function setSound(on) {
  state.sound = on;
  const b = $('#sound-toggle');
  b.setAttribute('aria-pressed', String(on));
  b.textContent = on ? 'Sonido: sí' : 'Sonido: no';
  if (!on) { try { speechSynthesis.cancel(); } catch (e) { /* nada */ } }
}

function wirePanel() {
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
  $('#sound-toggle').addEventListener('click', () => setSound(!state.sound));
  // Tarjetas de Practiquemos y Deletrea: al tocarlas aparece la actividad
  $$('.flip-head').forEach(btn => btn.addEventListener('click', () => {
    const body = document.getElementById(btn.getAttribute('aria-controls'));
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    body.hidden = !open;
    btn.closest('.flip').classList.toggle('open', open);
  }));
}

/* ============================================================
   Inicio
   ============================================================ */
function initAll() {
  score = {};
  initAlphabet(); initSpell(); initWheel();
  initOrdena(); initSopa(); initSD(); initDialogos();
  initBoard(); initSustituye(); initTexto();
  initGreetings();
  if (typeof initJuegos === 'function') initJuegos();
  renderProgress();
}

wirePanel();
initAll();
showTab(location.hash.slice(1));
