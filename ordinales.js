/* Aravarma class · Básico 3 · Números ordinales
   Tabla animada, características desplegables y tres actividades (A, B y C).
   Usa las funciones de app.js y juegos.js (h, $, makeDrop, setScore). */
(function () {
  'use strict';

  /* ---------- Datos ---------- */
  const ORD = [
    [1, 'primero', '1.º', 'primera', '1.ª'], [2, 'segundo', '2.º', 'segunda', '2.ª'], [3, 'tercero', '3.º', 'tercera', '3.ª'],
    [4, 'cuarto', '4.º', 'cuarta', '4.ª'], [5, 'quinto', '5.º', 'quinta', '5.ª'], [6, 'sexto', '6.º', 'sexta', '6.ª'],
    [7, 'séptimo', '7.º', 'séptima', '7.ª'], [8, 'octavo', '8.º', 'octava', '8.ª'], [9, 'noveno', '9.º', 'novena', '9.ª'],
    [10, 'décimo', '10.º', 'décima', '10.ª'],
  ];
  // Actividad B: de izquierda a derecha (hombre, mujer, hombre, mujer, hombre)
  const FILA = [
    { ans: ['primero', '1º'], other: ['primera', '1ª'], show: 'primero' },
    { ans: ['segunda', '2ª'], other: ['segundo', '2º'], show: 'segunda' },
    { ans: ['tercero', '3º', '3er'], other: ['tercera', '3ª'], show: 'tercero' },
    { ans: ['cuarta', '4ª'], other: ['cuarto', '4º'], show: 'cuarta' },
    { ans: ['quinto', '5º'], other: ['quinta', '5ª'], show: 'quinto' },
  ];
  const FILA_X = [10.7, 30.1, 49.8, 69.6, 89.5]; // posición (%) de cada persona en la imagen
  // Actividad C: respuestas por palabras clave
  const CARRERA = [
    { q: '¿Qué corredor cruza la línea de meta en PRIMER lugar?', re: /azul|primera|primero|1/, show: 'La mujer de camiseta azul' },
    { q: '¿En qué posición va el corredor que lleva la gorra blanca hacia atrás y la camiseta morada?', re: /quint|\b5/, show: 'Quinto (5.º)' },
    { q: 'Describe la posición del hombre mayor con gafas y polo de rayas.', re: /sext|\b6/, show: 'Sexto (6.º)' },
    { q: '¿Qué número ordinal le corresponde a la mujer con la pierna protésica y conjunto verde?', re: /noven|\b9/, show: 'Novena (9.ª)' },
    { q: '¿Quién ocupa el DÉCIMO lugar en esta carrera?', re: /naranja|anaranj|audifon|auricular|casco|orange|decim|10/, show: 'El hombre de camiseta naranja con audífonos' },
  ];

  /* ---------- Utilidades ---------- */
  const strip = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[°]/g, 'º').replace(/[\s.]/g, '');
  const plain = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();

  /* ---------- Características principales (se despliega) ---------- */
  function initCarac() {
    const btn = $('#ord-toggle'), body = $('#ord-carac-body'), hint = $('#ord-hint');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      body.hidden = !open;
      if (hint) hint.hidden = open;
      if (open) { body.classList.remove('ord-open'); void body.offsetWidth; body.classList.add('ord-open'); }
    });
  }

  /* ---------- Tabla de los primeros ordinales (al tocar el masculino aparece el femenino) ---------- */
  function initTabla() {
    const tb = $('#ord-tabla tbody');
    if (!tb) return;
    ORD.forEach(([n, m, mc, f, fc]) => {
      const femCell = h('td', { class: 'ord-fem' }, h('span', { class: 'ord-wait', 'aria-hidden': 'true' }, '· · ·'), h('span', { class: 'ord-fem-txt', hidden: true }, `${f} (${fc})`));
      const btn = h('button', { class: 'ord-btn', type: 'button', 'aria-expanded': 'false', 'aria-label': `${m}, toca para ver el femenino` }, `${m} (${mc})`);
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(open));
        $('.ord-wait', femCell).hidden = open;
        const t = $('.ord-fem-txt', femCell); t.hidden = !open;
        femCell.classList.toggle('on', open);
        if (open) { t.classList.remove('ord-pop'); void t.offsetWidth; t.classList.add('ord-pop'); if (window.state && state.sound) speak(`${m}. ${f}`); }
      });
      tb.append(h('tr', null, h('td', { class: 'ord-n' }, String(n)), h('td', null, btn), femCell));
    });
  }

  /* ---------- Actividad A: une cada número con su nombre ---------- */
  function initA() {
    const mount = $('#act-ord-a');
    if (!mount || typeof makeDrop !== 'function') return;
    makeDrop(mount, {
      id: 'ordA', chips: ['octavo', 'tercero', 'quinto', 'séptimo', 'primero'],
      rows: [['1.º', 'primero'], ['3.º', 'tercero'], ['5.º', 'quinto'], ['7.º', 'séptimo'], ['8.º', 'octavo']].map(([pre, ans]) => ({ pre: pre + ' →', post: '', ans })),
    });
  }

  /* ---------- Barra de acciones común ---------- */
  function bar(onCheck, onClear) {
    return h('div', { class: 'row-actions', style: 'margin-top:12px' },
      h('button', { class: 'btn go', type: 'button', onclick: onCheck }, 'Validar'),
      h('button', { class: 'btn pink', type: 'button', onclick: onClear }, 'Borrar'));
  }

  /* ---------- Actividad B: la fila de personas ---------- */
  function initB() {
    const mount = $('#act-ord-b');
    if (!mount) return;
    const fb = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    const ins = FILA.map((it, i) => {
      const inp = h('input', { class: 'ord-in', type: 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': `Persona ${i + 1}`, placeholder: `${i + 1}.º persona`, style: `left:${FILA_X[i]}%` });
      inp.addEventListener('input', () => { inp.classList.remove('ok', 'no'); });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      return inp;
    });
    function check() {
      let right = 0, genero = 0, filled = 0;
      ins.forEach((inp, i) => {
        const v = strip(inp.value); inp.classList.remove('ok', 'no');
        if (!v) return; filled++;
        if (FILA[i].ans.map(strip).includes(v)) { inp.classList.add('ok'); right++; }
        else { inp.classList.add('no'); if (FILA[i].other.map(strip).includes(v)) genero++; }
      });
      setScore('ordB', right);
      fb.className = 'feedback ' + (right === FILA.length ? 'ok' : 'no');
      fb.textContent = right === FILA.length ? '¡Muy bien! Los cinco ordinales son correctos.'
        : !filled ? 'Escribe un ordinal debajo de cada persona.'
        : genero ? 'Casi: fíjate en el género. Si es mujer, el ordinal termina en -a (segunda, cuarta).'
        : 'Revisa las casillas marcadas con ✕ y cuenta de izquierda a derecha.';
    }
    function clear() { ins.forEach(i => { i.value = ''; i.classList.remove('ok', 'no'); }); fb.textContent = ''; setScore('ordB', 0); }
    mount.replaceChildren(
      h('div', { class: 'ord-fila' }, h('img', { src: 'images/ejercicios/ordinales-fila.webp', width: 1024, height: 470, loading: 'lazy', alt: 'Cinco personas en fila, de izquierda a derecha: un joven con gafas y camiseta azul, una mujer con blusa amarilla, un hombre con gorra y chaqueta verde, una mujer con suéter rojo y falda azul y un señor mayor con camisa a cuadros.' }),
        h('div', { class: 'ord-ins' }, ...ins)),
      fb, bar(check, clear));
  }

  /* ---------- Actividad C: observa la carrera y responde ---------- */
  function initC() {
    const mount = $('#act-ord-c');
    if (!mount) return;
    const fb = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    const rows = CARRERA.map((it, i) => {
      const inp = h('input', { class: 'ord-in2', type: 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': `Respuesta ${i + 1}`, placeholder: 'Tu respuesta' });
      const ic = h('span', { class: 'ic', 'aria-hidden': 'true' });
      const tip = h('small', { class: 'ord-ans', hidden: true }, 'Respuesta: ' + it.show);
      inp.addEventListener('input', () => { inp.closest('.ord-q').classList.remove('ok', 'no'); ic.textContent = ''; tip.hidden = true; });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      const el = h('div', { class: 'ord-q' }, h('span', { class: 'ord-qt' }, `${i + 1}. ${it.q}`), h('span', { class: 'ord-qi' }, inp, ic), tip);
      return { el, inp, ic, tip };
    });
    let tries = 0;
    function check() {
      let right = 0, filled = 0; tries++;
      rows.forEach((r, i) => {
        const v = plain(r.inp.value); r.el.classList.remove('ok', 'no'); r.ic.textContent = ''; r.tip.hidden = true;
        if (!v) return; filled++;
        const ok = CARRERA[i].re.test(v);
        r.el.classList.add(ok ? 'ok' : 'no'); r.ic.textContent = ok ? '✓' : '✕';
        if (ok) right++; else if (tries > 1) r.tip.hidden = false;
      });
      setScore('ordC', right);
      fb.className = 'feedback ' + (right === CARRERA.length ? 'ok' : 'no');
      fb.textContent = right === CARRERA.length ? '¡Excelente! Respondiste bien todas las preguntas.'
        : !filled ? 'Mira la carrera y escribe tus respuestas.'
        : 'Revisa las respuestas con ✕. Cuenta los corredores de izquierda a derecha.';
    }
    function clear() { tries = 0; rows.forEach(r => { r.inp.value = ''; r.el.classList.remove('ok', 'no'); r.ic.textContent = ''; r.tip.hidden = true; }); fb.textContent = ''; setScore('ordC', 0); }
    mount.replaceChildren(
      h('img', { class: 'ord-race', src: 'images/ejercicios/ordinales-carrera.webp', width: 1024, height: 378, loading: 'lazy', alt: 'Diez corredores en una pista de atletismo. De izquierda a derecha: una mujer de camiseta azul cruzando la meta, un joven de camiseta verde, un hombre de camiseta roja, una mujer de sudadera amarilla, un hombre con gorra blanca y camiseta morada, un señor mayor con gafas y polo de rayas, una mujer con pañuelo rosa, un hombre de camiseta azul, una mujer con pierna protésica y conjunto verde y un hombre de camiseta naranja con audífonos.' }),
      h('div', { class: 'ord-qs' }, ...rows.map(r => r.el)), fb, bar(check, clear));
  }

  initCarac(); initTabla(); initA(); initB(); initC();
})();
