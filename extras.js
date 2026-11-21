/* =====================================================================
   Aravarma class · extras.js
   Actividades extras (estilo cuadernillo ECE): preguntas con alternativas,
   animaciones, Validar, Borrar, Rehacer y flechas de colores.
   ===================================================================== */
const bfly = n => `<svg class="ex-bf" viewBox="0 0 100 80" aria-hidden="true"><use href="#butterfly"/></svg>`.repeat(n);
const emo = (e, n) => `<div class="ex-emo" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<span style="--i:${i}">${e}</span>`).join('')}</div>`;
const sr = t => `<span class="sr-only">${t}</span>`;
const barChart = () => {
  const d = [['Rojo', 4, '#e0399c'], ['Azul', 7, '#8b6bf0'], ['Verde', 3, '#ff8fc7'], ['Amarillo', 5, '#b79af5']];
  const W = 340, H = 170, bw = 44, g = 24, x0 = 36, y0 = 140, u = 14;
  const grid = [0, 2, 4, 6, 8].map(v => `<line x1="${x0}" x2="${W - 8}" y1="${y0 - v * u}" y2="${y0 - v * u}" stroke="#e8d7f7" stroke-width="1.5"/><text x="${x0 - 6}" y="${y0 - v * u + 4}" text-anchor="end" font-size="11" fill="#7a3f7f">${v}</text>`).join('');
  const bars = d.map(([n, v, c], i) => { const x = x0 + g + i * (bw + g), h = v * u; return `<rect class="ex-bar" style="--i:${i}" x="${x}" y="${y0 - h}" width="${bw}" height="${h}" rx="8" fill="${c}"/><text x="${x + bw / 2}" y="${y0 + 16}" text-anchor="middle" font-size="12" font-weight="700" fill="#4a1650">${n}</text>`; }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="ex-chart" role="img" aria-label="Gráfico de barras: Rojo 4, Azul 7, Verde 3, Amarillo 5">${grid}${bars}</svg>`;
};
const coins = a => `<div class="ex-coins" aria-label="Monedas de ${a.join(', ')} soles">${a.map((v, i) => `<span class="ex-coin" style="--i:${i}">S/ ${v}</span>`).join('')}</div>`;

const EXTRAS = [
  { q: 'Observa la tabla. ¿Cuál es la fruta que más prefieren los estudiantes?',
    art: `<table class="ex-table"><thead><tr><th>Fruta preferida</th><th>Cantidad de estudiantes</th></tr></thead><tbody><tr><td>🍎 Manzana</td><td>5</td></tr><tr><td>🍌 Plátano</td><td>9</td></tr><tr><td>🍊 Naranja</td><td>7</td></tr></tbody></table>`,
    opts: ['Manzana', 'Naranja', 'Plátano'], ans: 2, why: 'El plátano tiene el número más grande: 9 estudiantes.' },
  { q: '¿Cuántas mariposas hay en la imagen?', art: `<div class="ex-row">${bfly(8)}</div>`, opts: ['6 mariposas', '8 mariposas', '9 mariposas'], ans: 1, why: 'Cuenta una por una: hay 8 mariposas.' },
  { q: 'Silvia tenía 12 crayolas y le prestó 5 crayolas a Susan. ¿Cuántas crayolas le quedaron a Silvia?', art: emo('🖍️', 12), opts: ['17 crayolas', '7 crayolas', '5 crayolas'], ans: 1, why: 'Se quita: 12 − 5 = 7.' },
  { q: 'Una docena son 12 objetos. En la caja hay estos lápices. ¿Hay más o menos que una docena?', art: emo('✏️', 10), opts: ['Hay más que una docena.', 'Hay menos que una docena.', 'Hay exactamente una docena.'], ans: 1, why: 'Hay 10 lápices y 10 es menor que 12.' },
  { q: 'En la secuencia, ¿qué figura continúa?', art: `<div class="ex-emo seq" aria-label="Rojo, azul, rojo, azul, rojo, interrogante"><span style="--i:0">🔴</span><span style="--i:1">🔵</span><span style="--i:2">🔴</span><span style="--i:3">🔵</span><span style="--i:4">🔴</span><span class="q" style="--i:5">❓</span></div>`, opts: ['🔴', '🔵', '🟢'], ans: 1, why: 'Se repite rojo, azul, rojo, azul… Sigue el azul.' },
  { q: '¿Qué número falta en la secuencia?', art: `<div class="ex-seqnum" aria-label="30, 28, 26 y un número que falta"><b style="--i:0">30</b><b style="--i:1">28</b><b style="--i:2">26</b><b class="q" style="--i:3">?</b></div>`, opts: ['22', '24', '27'], ans: 1, why: 'Los números bajan de 2 en 2: 30, 28, 26, 24.' },
  { q: 'Rosa tiene 3 decenas y 6 unidades de cuentas. ¿Qué número representa?', art: `<div class="ex-blocks" aria-hidden="true">${'<i class="ten"></i>'.repeat(3)}${'<i class="one"></i>'.repeat(6)}</div>`, opts: ['63', '36', '9'], ans: 1, why: '3 decenas = 30 y 6 unidades = 6. Entonces 30 + 6 = 36.' },
  { q: 'Ana tiene 6 caramelos. Luis tiene el doble de caramelos que Ana. ¿Cuántos caramelos tiene Luis?', art: `<div class="ex-pair"><div><b>Ana</b>${emo('🍬', 6)}</div></div>`, opts: ['3 caramelos', '8 caramelos', '12 caramelos'], ans: 2, why: 'El doble es sumar el mismo número: 6 + 6 = 12.' },
  { q: 'Observa el gráfico. ¿Qué color prefieren menos niños?', art: barChart(), opts: ['Rojo', 'Verde', 'Azul'], ans: 1, why: 'La barra más baja es la del verde: 3 niños.' },
  { q: 'Mateo tiene estas monedas. ¿Cuánto dinero tiene en total?', art: coins([5, 2, 1]), opts: ['7 soles', '8 soles', '10 soles'], ans: 1, why: '5 + 2 + 1 = 8 soles.' },
  { q: 'Luis llegó primero a la meta. Ana llegó después de Luis y antes de Pedro. ¿En qué lugar llegó Pedro?', art: `<div class="ex-race" aria-hidden="true"><span>🏃 Luis</span><span>🏃‍♀️ Ana</span><span>🏃 Pedro</span><em>🏁</em></div>`, opts: ['Primer lugar', 'Segundo lugar', 'Tercer lugar'], ans: 2, why: 'Luis fue primero, Ana segunda y Pedro tercero.' },
  { q: 'Ruth compró 18 galletas y su mamá le regaló 7 galletas más. ¿Cuántas galletas tiene ahora?', art: `<div class="ex-sum" aria-hidden="true"><span>🍪 18</span><b>+</b><span>🍪 7</span><b>=</b><span class="q">?</span></div>`, opts: ['24 galletas', '25 galletas', '11 galletas'], ans: 1, why: '18 + 7 = 25 galletas.' },
];

function burst(host, good) {
  const colors = good ? ['#c21f9b', '#ff5fae', '#ffa8d5', '#b79af5', '#e6dbff'] : ['#b79af5', '#7f58d6', '#e6dbff'];
  for (let k = 0; k < (good ? 22 : 8); k++) {
    const p = document.createElement('i');
    p.className = 'ex-spark';
    p.style.setProperty('--dx', (Math.random() * 260 - 130).toFixed(0) + 'px');
    p.style.setProperty('--dy', (Math.random() * -170 - 20).toFixed(0) + 'px');
    p.style.setProperty('--r', (Math.random() * 540 - 270).toFixed(0) + 'deg');
    p.style.background = colors[k % colors.length];
    p.style.animationDelay = (Math.random() * 0.12).toFixed(2) + 's';
    host.append(p);
    setTimeout(() => p.remove(), 1300);
  }
}

function initExtras() {
  const mount = document.getElementById('extras-mount');
  if (!mount) return;
  const N = EXTRAS.length;
  let i = 0, started = false, done = false, dir = 1, erased = null;
  const sel = Array(N).fill(-1), res = Array(N).fill(null), tries = Array(N).fill(0);

  const root = h('div', { class: 'ex' });
  const fly = h('div', { class: 'ex-fly', 'aria-hidden': 'true', html: [1, 2, 3].map(n => `<svg class="f${n}" viewBox="0 0 100 80"><use href="#butterfly"/></svg>`).join('') });
  mount.replaceChildren(fly, root);

  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const correct = () => res.filter(r => r === true).length;

  function start() { started = true; done = false; i = 0; dir = 1; paint(); }
  function reset() { sel.fill(-1); res.fill(null); tries.fill(0); erased = null; i = 0; done = false; started = true; dir = 1; paint(); }
  function go(n) { if (n < 0 || n >= N) return; dir = n > i ? 1 : -1; i = n; erased = null; paint(); }

  function validate() {
    if (res[i] === true) return;
    const s = sel[i];
    if (s < 0) { say('Marca una alternativa primero 👆', 'warn'); wiggle(); return; }
    tries[i]++;
    res[i] = s === EXTRAS[i].ans;
    erased = null;
    paintOptions();
    const host = $('.ex-card', root);
    burst(host, res[i]);
    if (res[i]) say('¡Muy bien! ' + EXTRAS[i].why, 'ok');
    else say('Casi. Revisa con calma y vuelve a intentarlo.', 'no');
    updateDots(); updateBar(); updateButtons();
  }
  function erase() {
    if (res[i] === true && false) return;
    if (sel[i] < 0 && res[i] === null) { say('Aquí no hay nada que borrar.', 'warn'); return; }
    erased = { s: sel[i], r: res[i] };
    sel[i] = -1; res[i] = null;
    paintOptions(); say('Borraste tu respuesta.', 'warn'); updateDots(); updateBar(); updateButtons();
  }
  function redo() {
    if (!erased) { say('No hay nada para rehacer.', 'warn'); return; }
    sel[i] = erased.s; res[i] = erased.r; erased = null;
    paintOptions(); updateDots(); updateBar(); updateButtons();
    say(res[i] === true ? '¡Muy bien! ' + EXTRAS[i].why : res[i] === false ? 'Casi. Revisa con calma y vuelve a intentarlo.' : 'Recuperaste tu respuesta.', res[i] === true ? 'ok' : res[i] === false ? 'no' : 'warn');
  }
  let msgEl, optsEl, dotsEl, barEl, prevB, nextB, valB;
  function say(t, kind) { if (!msgEl) return; msgEl.className = 'ex-msg ' + (kind || ''); msgEl.textContent = t; msgEl.classList.remove('pop'); void msgEl.offsetWidth; msgEl.classList.add('pop'); }
  function wiggle() { const c = $('.ex-card', root); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); }

  function paintOptions() {
    optsEl.replaceChildren(...EXTRAS[i].opts.map((o, k) => {
      const chosen = sel[i] === k, isOk = res[i] !== null && chosen && res[i] === true, isNo = res[i] === false && chosen;
      const b = h('button', { type: 'button', class: 'ex-opt' + (chosen ? ' chosen' : '') + (isOk ? ' ok' : '') + (isNo ? ' no' : ''), style: `--i:${k}`, role: 'radio', 'aria-checked': String(chosen), disabled: res[i] === true ? true : null,
        onclick: () => { sel[i] = k; if (res[i] === false) res[i] = null; erased = null; paintOptions(); updateDots(); updateBar(); updateButtons(); } },
        h('span', { class: 'ex-let' }, 'abc'[k]), h('span', { class: 'ex-txt' }, o), h('span', { class: 'ex-mark', 'aria-hidden': 'true' }, isOk ? '✓' : isNo ? '✕' : ''));
      return b;
    }));
  }
  function updateDots() {
    [...dotsEl.children].forEach((d, k) => { d.className = 'ex-dot' + (k === i ? ' cur' : '') + (res[k] === true ? ' ok' : res[k] === false ? ' no' : sel[k] >= 0 ? ' sel' : ''); });
  }
  function updateBar() { barEl.style.width = Math.round(correct() / N * 100) + '%'; barEl.parentElement.setAttribute('aria-valuenow', String(correct())); }
  function updateButtons() {
    prevB.disabled = i === 0; nextB.disabled = i === N - 1;
    valB.disabled = res[i] === true;
    valB.querySelector('span').textContent = res[i] === true ? '¡Correcto!' : 'Validar';
    finB.hidden = !(i === N - 1);
  }
  let finB;

  function paint() {
    if (!started) return paintStart();
    if (done) return paintEnd();
    const Q = EXTRAS[i];
    msgEl = h('p', { class: 'ex-msg', role: 'status', 'aria-live': 'polite' });
    optsEl = h('div', { class: 'ex-opts', role: 'radiogroup', 'aria-label': 'Alternativas' });
    dotsEl = h('div', { class: 'ex-dots', role: 'group', 'aria-label': 'Preguntas' }, ...EXTRAS.map((_, k) => h('button', { type: 'button', class: 'ex-dot', 'aria-label': `Ir a la pregunta ${k + 1}`, onclick: () => go(k) }, String(k + 1))));
    barEl = h('i', { class: 'ex-bar-fill' });
    prevB = h('button', { type: 'button', class: 'ex-arrow prev', 'aria-label': 'Pregunta anterior', onclick: () => go(i - 1), html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>' });
    nextB = h('button', { type: 'button', class: 'ex-arrow next', 'aria-label': 'Pregunta siguiente', onclick: () => go(i + 1), html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 4 8 8-8 8" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>' });
    valB = h('button', { type: 'button', class: 'ex-validate', onclick: validate }, h('span', null, 'Validar'));
    finB = h('button', { type: 'button', class: 'ex-finish', hidden: true, onclick: () => { done = true; paint(); } }, '🏁 Ver mi resultado');
    const card = h('div', { class: 'ex-card ' + (dir > 0 ? 'in-r' : 'in-l') },
      h('div', { class: 'ex-qn' }, `${i + 1}`), h('p', { class: 'ex-q' }, Q.q), h('div', { class: 'ex-art', html: Q.art }), optsEl, msgEl);
    root.replaceChildren(
      h('div', { class: 'ex-top' }, h('h4', { class: 'ex-title' }, 'Actividades extras'),
        h('div', { class: 'ex-prog', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(N), 'aria-valuenow': '0', 'aria-label': 'Respuestas correctas' }, barEl), h('span', { class: 'ex-count' }, `${i + 1} / ${N}`)),
      dotsEl, card,
      h('div', { class: 'ex-nav' }, prevB, valB, nextB),
      h('div', { class: 'row-actions act-bar' },
        h('button', { class: 'btn pink', type: 'button', html: ICON_ERASE + '<span>Borrar</span>', onclick: erase }),
        h('button', { class: 'btn', type: 'button', html: ICON_REDO + '<span>Rehacer</span>', onclick: redo }),
        finB));
    paintOptions(); updateDots(); updateBar(); updateButtons();
    if (res[i] === true) say('¡Muy bien! ' + Q.why, 'ok');
    else if (res[i] === false) say('Casi. Revisa con calma y vuelve a intentarlo.', 'no');
    else say('Lee con atención, marca una alternativa y pulsa Validar.', '');
  }
  function paintStart() {
    root.replaceChildren(h('div', { class: 'ex-start' },
      h('div', { class: 'ex-mascot', html: MASCOT }),
      h('h4', { class: 'ex-title big' }, 'Actividades extras'),
      h('p', null, `${N} preguntas para practicar. Lee, marca una alternativa y pulsa Validar. Si te equivocas, ¡inténtalo otra vez!`),
      h('button', { class: 'ex-go', type: 'button', onclick: start }, 'COMENZAR')));
  }
  function paintEnd() {
    const c = correct(), first = tries.filter((t, k) => res[k] === true && t === 1).length, stars = c === N && first >= N * 0.7 ? 3 : c >= N * 0.7 ? 2 : c > 0 ? 1 : 0;
    root.replaceChildren(h('div', { class: 'ex-end' },
      h('div', { class: 'ex-mascot', html: MASCOT }),
      h('h4', { class: 'ex-title big' }, c === N ? '¡Lo lograste!' : '¡Buen trabajo!'),
      h('div', { class: 'ex-stars', 'aria-label': `${stars} de 3 estrellas` }, ...[0, 1, 2].map(k => h('span', { class: 'ex-star' + (k < stars ? ' on' : ''), style: `--i:${k}` }, '★'))),
      h('p', { class: 'ex-score' }, `Respuestas correctas: ${c} de ${N}`),
      h('p', null, c < N ? 'Vuelve a las preguntas con ✕ o sin responder y valídalas.' : 'Respondiste todas las preguntas correctamente.'),
      h('div', { class: 'row-actions' },
        c < N ? h('button', { class: 'btn', type: 'button', onclick: () => { done = false; i = Math.max(0, res.findIndex(r => r !== true)); paint(); } }, 'Revisar preguntas') : null,
        h('button', { class: 'btn pink', type: 'button', onclick: reset }, 'Empezar de nuevo'))));
    burst(root.querySelector('.ex-end'), true);
  }
  paint();
}
