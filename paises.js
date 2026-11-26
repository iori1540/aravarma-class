/* Aravarma class · Básico 1 · Países y gentilicios
   Mapa interactivo (20 etapas), Memorama cultural con medallas, Pasaporte viajero,
   Ficha de la Feria de Naciones y Trivial grupal.
   Usa las funciones de app.js (h, $, grade, setScore, shuffle, state). */
(function () {
  'use strict';

  const FLAG = id => `images/paises/${id}.webp`;
  const flagImg = (id, alt, cls) => h('img', { class: cls || 'pa-flag', src: FLAG(id), alt: alt || '', width: 160, loading: 'lazy' });
  const rnd = arr => arr[Math.floor(Math.random() * arr.length)];
  const mix = a => (typeof shuffle === 'function' ? shuffle(a) : a.slice().sort(() => Math.random() - .5));

  /* ---------- Datos: país, bandera, gentilicio masculino / femenino ---------- */
  const P = {
    espana: ['España', 'español', 'española'], francia: ['Francia', 'francés', 'francesa'], italia: ['Italia', 'italiano', 'italiana'],
    alemania: ['Alemania', 'alemán', 'alemana'], portugal: ['Portugal', 'portugués', 'portuguesa'], 'reino-unido': ['Reino Unido', 'británico', 'británica'],
    irlanda: ['Irlanda', 'irlandés', 'irlandesa'], 'paises-bajos': ['Países Bajos', 'neerlandés', 'neerlandesa'], brasil: ['Brasil', 'brasileño', 'brasileña'],
    colombia: ['Colombia', 'colombiano', 'colombiana'], peru: ['Perú', 'peruano', 'peruana'], ecuador: ['Ecuador', 'ecuatoriano', 'ecuatoriana'],
    dinamarca: ['Dinamarca', 'danés', 'danesa'], suecia: ['Suecia', 'sueco', 'sueca'], venezuela: ['Venezuela', 'venezolano', 'venezolana'],
    rusia: ['Rusia', 'ruso', 'rusa'], argentina: ['Argentina', 'argentino', 'argentina'], china: ['China', 'chino', 'china'],
    'corea-del-sur': ['Corea del Sur', 'surcoreano', 'surcoreana'], polonia: ['Polonia', 'polaco', 'polaca'], mexico: ['México', 'mexicano', 'mexicana'],
    noruega: ['Noruega', 'noruego', 'noruega'], grecia: ['Grecia', 'griego', 'griega'], 'estados-unidos': ['Estados Unidos', 'estadounidense', 'estadounidense'],
    japon: ['Japón', 'japonés', 'japonesa'], chile: ['Chile', 'chileno', 'chilena'], honduras: ['Honduras', 'hondureño', 'hondureña'],
    suiza: ['Suiza', 'suizo', 'suiza'], belgica: ['Bélgica', 'belga', 'belga'], marruecos: ['Marruecos', 'marroquí', 'marroquí'],
    australia: ['Australia', 'australiano', 'australiana'], canada: ['Canadá', 'canadiense', 'canadiense'], 'costa-rica': ['Costa Rica', 'costarricense', 'costarricense'],
  };
  const nom = id => P[id][0], gm = id => P[id][1], gf = id => P[id][2];
  const MEMO_POOL = Object.keys(P).filter(k => !['marruecos', 'australia', 'canada', 'costa-rica'].includes(k));

  /* ---------- Sonidos sencillos (sin archivos) ---------- */
  let ac = null;
  function beep(freqs, dur) {
    if (!(window.state && state.sound)) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      let t = ac.currentTime;
      freqs.forEach(f => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.18, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + (dur || .14));
        o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + (dur || .14) + .02); t += (dur || .14);
      });
    } catch (e) { /* sin audio */ }
  }
  const sOk = () => beep([660, 880]), sNo = () => beep([220, 165], .18), sWin = () => beep([523, 659, 784, 1046], .16);

  /* =====================================================================
     1. MAPA INTERACTIVO · 20 etapas de España a Argentina
     ===================================================================== */
  // [id, x, y (sobre 1024×1024), distractores del gentilicio]
  const ETAPAS = [
    ['espana', 440, 352, ['españolés', 'españano']], ['francia', 470, 322, ['franceño', 'francano']], ['italia', 512, 350, ['italés', 'italiense']],
    ['alemania', 515, 292, ['alemano', 'alemense']], ['reino-unido', 452, 262, ['reinense', 'unidano']], ['grecia', 540, 362, ['grecano', 'greciense']],
    ['rusia', 800, 235, ['rusés', 'rusiano']], ['china', 830, 395, ['chinés', 'chinense']], ['corea-del-sur', 922, 380, ['coreés', 'sureño']],
    ['japon', 968, 352, ['japonano', 'japoneño']], ['estados-unidos', 190, 330, ['estadounidés', 'unidense']], ['mexico', 135, 420, ['mexicense', 'mexiqués']],
    ['honduras', 163, 478, ['hondurano', 'honduranés']], ['venezuela', 220, 555, ['venezuelano', 'venezolés']], ['colombia', 180, 580, ['colombés', 'colombeño']],
    ['ecuador', 143, 607, ['ecuadoreño', 'ecuatés']], ['peru', 143, 655, ['perués', 'peruense']], ['brasil', 300, 660, ['brasilano', 'brasilés']],
    ['chile', 172, 770, ['chilés', 'chiliano']], ['argentina', 215, 820, ['argentés', 'argentano']],
  ];
  const VIDAS = 10;

  function initMapa() {
    const mount = $('#act-pais-mapa'); if (!mount) return;
    let done = 0, vidas = VIDAS, puntos = 0, open = -1;
    const pts = new Array(ETAPAS.length).fill(0);
    const pct = v => (v / 1024 * 100).toFixed(2) + '%';

    const hud = { vidas: h('span', { class: 'pm-vidas', 'aria-label': 'Vidas' }), pts: h('b', null, '0'), et: h('b', null, '1 / 20') };
    const barra = h('div', { class: 'pm-hud' },
      h('span', null, 'Vidas ', hud.vidas), h('span', null, 'Puntos ', hud.pts), h('span', null, 'Etapa ', hud.et));

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1024 1024'); svg.setAttribute('class', 'pm-ruta'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('preserveAspectRatio', 'none');
    const segs = [];
    for (let i = 0; i < ETAPAS.length - 1; i++) {
      const [, x1, y1] = ETAPAS[i], [, x2, y2] = ETAPAS[i + 1];
      const mk = (a, b, c, d) => { const l = document.createElementNS('http://www.w3.org/2000/svg', 'line'); l.setAttribute('x1', a); l.setAttribute('y1', b); l.setAttribute('x2', c); l.setAttribute('y2', d); svg.append(l); return l; };
      if (i === 9) { // de Japón a Estados Unidos: la ruta cruza el Pacífico y reaparece por el lado izquierdo
        segs.push([mk(x1, y1, 1024, 300), mk(0, 300, x2, y2)]);
      } else segs.push([mk(x1, y1, x2, y2)]);
    }

    const pins = ETAPAS.map(([id, x, y], i) => {
      const b = h('button', { class: 'pm-pin', type: 'button', style: `left:${pct(x)};top:${pct(y)}`, 'aria-label': `Etapa ${i + 1}` }, h('span', null, String(i + 1)));
      b.addEventListener('click', () => {
        if (i > done) { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); sNo(); return; }
        abrir(i);
      });
      return b;
    });

    const modal = h('div', { class: 'pa-modal', hidden: true, role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Pregunta de la etapa' });
    const wrap = h('div', { class: 'pm-wrap' },
      h('img', { class: 'pm-img', src: 'images/mapa-mundi.webp', width: 1024, height: 1024, alt: 'Mapa del mundo con los países en colores', loading: 'lazy' }), svg, ...pins);

    function pinte() {
      hud.vidas.textContent = '❤'.repeat(vidas) + '🤍'.repeat(VIDAS - vidas);
      hud.pts.textContent = String(puntos); hud.et.textContent = `${Math.min(done + 1, ETAPAS.length)} / ${ETAPAS.length}`;
      pins.forEach((b, i) => {
        b.classList.toggle('done', i < done); b.classList.toggle('now', i === done && done < ETAPAS.length); b.classList.toggle('lock', i > done);
        b.firstChild.textContent = i < done ? '✓' : String(i + 1);
        b.title = i <= done ? nom(ETAPAS[i][0]) : 'Bloqueada';
      });
      segs.forEach((arr, i) => arr.forEach(l => l.setAttribute('class', i < done ? 'on' : '')));
    }

    function abrir(i) {
      open = i; const [id, , , dis] = ETAPAS[i];
      let wrong = 0, sel = null, fin = false;
      const opts = mix([gm(id), ...dis]);
      const msg = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
      const bOpts = opts.map(o => {
        const b = h('button', { class: 'pa-opt', type: 'button', 'aria-pressed': 'false' }, o);
        b.addEventListener('click', () => { if (fin) return; bOpts.forEach(x => { x.classList.remove('sel'); x.setAttribute('aria-pressed', 'false'); }); b.classList.add('sel'); b.setAttribute('aria-pressed', 'true'); sel = b; msg.textContent = ''; });
        return b;
      });
      const bCheck = h('button', { class: 'btn go', type: 'button' }, 'Comprobar');
      const bClose = h('button', { class: 'btn sm', type: 'button', 'aria-label': 'Cerrar', onclick: cerrar }, '✕ Cerrar');
      const acciones = h('div', { class: 'row-actions' }, bCheck);
      bCheck.addEventListener('click', () => {
        if (!sel) { msg.className = 'feedback hint'; msg.textContent = 'Elige una opción.'; return; }
        if (sel.textContent === gm(id)) {
          fin = true; const g = Math.max(1, 3 - wrong); pts[i] = Math.max(pts[i], g);
          sel.classList.add('ok'); sOk(); puntos = pts.reduce((a, b) => a + b, 0);
          if (i === done) done++;
          setScore('paisMapa', done);
          msg.className = 'feedback ok'; msg.textContent = `¡Correcto! ${gm(id) === gf(id) ? `Es invariable: el/la ${gm(id)}.` : `${gm(id)} / ${gf(id)}.`} +${g} punto${g > 1 ? 's' : ''}.`;
          const nx = h('button', { class: 'btn go', type: 'button', onclick: () => { cerrar(); if (done === ETAPAS.length) final(); } }, done === ETAPAS.length ? 'Ver el final' : 'Continuar');
          acciones.replaceChildren(nx); pinte(); nx.focus();
        } else {
          wrong++; vidas--; sel.classList.add('no'); sel.disabled = true; sel = null; sNo(); pinte();
          if (vidas <= 0) {
            fin = true; msg.className = 'feedback no'; msg.textContent = '¡Te quedaste sin vidas! El recorrido vuelve a empezar.';
            acciones.replaceChildren(h('button', { class: 'btn pink', type: 'button', onclick: () => { reinicia(); cerrar(); } }, 'Empezar de nuevo'));
          } else {
            msg.className = 'feedback no'; msg.textContent = `Esa no es. Pierdes una vida (te quedan ${vidas}).`;
            const re = h('button', { class: 'btn pink', type: 'button', onclick: () => { msg.textContent = ''; acciones.replaceChildren(bCheck); } }, 'Reintentar');
            acciones.replaceChildren(re); re.focus();
          }
        }
      });
      modal.replaceChildren(h('div', { class: 'pa-card' }, bClose,
        h('span', { class: 'pa-st' }, `Etapa ${i + 1} de ${ETAPAS.length}`),
        h('div', { class: 'pa-q' }, flagImg(id, `Bandera de ${nom(id)}`, 'pa-bigflag'), h('h4', null, nom(id)), h('p', null, `¿Cuál es el gentilicio de las personas de ${nom(id)}?`)),
        h('div', { class: 'pa-opts' }, ...bOpts), msg, acciones));
      modal.hidden = false; (bOpts[0] || bClose).focus();
    }
    function cerrar() { modal.hidden = true; open = -1; pinte(); wrap.scrollIntoView({ block: 'nearest' }); }
    modal.addEventListener('click', e => { if (e.target === modal) cerrar(); });
    modal.addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });

    function final() {
      modal.replaceChildren(h('div', { class: 'pa-card pa-final' },
        h('div', { class: 'pa-trophy' }, '🏆'), h('h4', null, '¡Llegaste a Argentina!'),
        h('p', null, `Completaste las 20 etapas con ${puntos} de 60 puntos.`),
        h('div', { class: 'row-actions' }, h('button', { class: 'btn go', type: 'button', onclick: cerrar }, 'Ver el mapa'), h('button', { class: 'btn pink', type: 'button', onclick: () => { reinicia(); cerrar(); } }, 'Jugar otra vez'))));
      modal.hidden = false; sWin();
    }
    function reinicia() { done = 0; vidas = VIDAS; puntos = 0; pts.fill(0); setScore('paisMapa', 0); pinte(); }

    mount.replaceChildren(barra, wrap, h('p', { class: 'pa-note' }, 'Empieza en la etapa 1 (España). Cada etapa se desbloquea al completar la anterior con al menos 1 punto: 3 puntos si aciertas a la primera, 2 a la segunda y 1 a la tercera.'),
      h('div', { class: 'row-actions' }, h('button', { class: 'btn pink', type: 'button', onclick: reinicia }, 'Empezar de nuevo')), modal);
    pinte();
  }

  /* =====================================================================
     2. MEMORAMA CULTURAL · país ↔ gentilicio, con 4 medallas
     ===================================================================== */
  function initMemo() {
    const mount = $('#act-pais-memo'); if (!mount) return;
    let cards = [], first = null, lock = false, pares = 0, intentos = 0, medallas = 0, porAbrir = 0;
    const info = h('p', { class: 'pa-note' });
    const board = h('div', { class: 'mm-board' });
    const premios = h('div', { class: 'mm-premios', 'aria-live': 'polite' });
    const slots = [0, 1, 2, 3].map(i => h('li', { class: 'mm-slot', 'aria-label': `Medalla ${i + 1}` }, h('span', null, String(i + 1))));
    const panel = h('div', { class: 'mm-panel' }, h('h5', null, 'MIS MEDALLAS'), h('ol', { class: 'mm-slots' }, ...slots));
    const fb = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });

    function nuevo() {
      const ids = mix(MEMO_POOL).slice(0, 8);
      const deck = mix(ids.flatMap(id => [{ id, t: 'p' }, { id, t: 'g' }]));
      first = null; lock = false; pares = 0; intentos = 0; medallas = 0; porAbrir = 0; fb.textContent = ''; premios.replaceChildren();
      slots.forEach(s => { s.classList.remove('on'); s.querySelector('img')?.remove(); });
      setScore('paisMemo', 0);
      cards = deck.map(d => {
        const front = d.t === 'p'
          ? h('div', { class: 'mm-face mm-p' }, flagImg(d.id, '', 'mm-flag'), h('b', null, nom(d.id)))
          : h('div', { class: 'mm-face mm-g' }, h('b', null, gm(d.id)), gf(d.id) !== gm(d.id) ? h('small', null, gf(d.id)) : h('small', null, '(masc. y fem.)'));
        const el = h('button', { class: 'mm-card', type: 'button', 'aria-label': 'Tarjeta oculta' }, h('div', { class: 'mm-in' }, h('div', { class: 'mm-back' }, '?'), front));
        el.addEventListener('click', () => voltea(c));
        const c = { d, el, ok: false, up: false }; return c;
      });
      board.replaceChildren(...cards.map(c => c.el)); pinte();
    }
    function pinte() { info.textContent = `Pares: ${pares} de 8 · Intentos: ${intentos} · Medallas: ${medallas} de 4`; }
    function voltea(c) {
      if (lock || c.ok || c.up) return;
      c.up = true; c.el.classList.add('up'); c.el.setAttribute('aria-label', c.d.t === 'p' ? nom(c.d.id) : gm(c.d.id));
      if (!first) { first = c; return; }
      intentos++; const a = first; first = null; lock = true;
      if (a.d.id === c.d.id) {
        setTimeout(() => {
          a.ok = c.ok = true; a.el.classList.add('ok'); c.el.classList.add('ok'); pares++; lock = false; sOk();
          setScore('paisMemo', pares); fb.className = 'feedback ok'; fb.textContent = `¡Muy bien! ${nom(a.d.id)} → ${gm(a.d.id)}${gf(a.d.id) !== gm(a.d.id) ? ' / ' + gf(a.d.id) : ''}.`;
          if (pares % 2 === 0) dar();
          if (pares === 8) { fb.textContent = '¡Completaste el memorama! Desata los lazos para ver tus medallas.'; sWin(); }
          pinte();
        }, 450);
      } else {
        setTimeout(() => { [a, c].forEach(x => { x.up = false; x.el.classList.remove('up'); x.el.setAttribute('aria-label', 'Tarjeta oculta'); }); lock = false; fb.className = 'feedback no'; fb.textContent = 'No son pareja. Inténtalo otra vez.'; sNo(); pinte(); }, 900);
      }
    }
    /* Cada 2 aciertos aparece un globo con lazo; al tocarlo se desata, se abre y sale la medalla al panel */
    function dar() {
      porAbrir++;
      const idx = medallas + porAbrir - 1; if (idx > 3) return;
      const globo = h('button', { class: 'mm-ball', type: 'button', 'aria-label': 'Desata el lazo para ver tu medalla' },
        h('span', { class: 'mm-half top' }, h('img', { src: 'images/paises/globo.webp', alt: '' })),
        h('span', { class: 'mm-half bot' }, h('img', { src: 'images/paises/globo.webp', alt: '' })),
        h('img', { class: 'mm-med', src: 'images/paises/medalla.webp', alt: '' }),
        h('small', null, '¡Desata el lazo!'));
      globo.addEventListener('click', () => {
        if (globo.classList.contains('open')) return;
        globo.classList.add('open'); sWin();
        setTimeout(() => {
          const slot = slots[medallas]; medallas++; porAbrir--;
          slot.classList.add('on'); slot.append(h('img', { class: 'mm-got', src: 'images/paises/medalla.webp', alt: `Medalla ${medallas}` }));
          globo.classList.add('gone'); setTimeout(() => globo.remove(), 500); pinte();
        }, 1100);
      });
      premios.append(globo);
    }
    mount.replaceChildren(info, h('div', { class: 'mm-wrap' }, board, h('div', { class: 'mm-side' }, premios, panel)), fb,
      h('div', { class: 'row-actions', style: 'margin-top:10px' }, h('button', { class: 'btn pink', type: 'button', onclick: nuevo }, 'Jugar de nuevo')));
    nuevo();
  }

  /* =====================================================================
     3. PASAPORTE VIAJERO · tres diálogos de viaje y actividades 1 a 5
     ===================================================================== */
  const DIA = [
    { t: 'Diálogo 1 · En el aeropuerto', sit: 'Dos pasajeros se conocen mientras esperan su vuelo.', img: 'aeropuerto', alt: 'Un joven y una joven con maletas en la sala de un aeropuerto', a: 'María', b: 'Carlos', l: [
      ['María', '¡Hola! Buenos días. ¿Cómo te llamas?'], ['Carlos', '¡Hola! Me llamo Carlos. ¿Y tú?'], ['María', 'Me llamo María. ¡Mucho gusto!'], ['Carlos', 'Encantado. ¿De dónde eres?'],
      ['María', 'Soy de Perú. Soy peruana. ¿Y tú?'], ['Carlos', 'Soy de México. Soy mexicano.'], ['María', '¡Qué interesante! ¿Adónde viajas?'], ['Carlos', 'Viajo a España. ¿Y tú?'], ['María', 'Yo también viajo a España.']] },
    { t: 'Diálogo 2 · Durante el viaje', sit: 'Dos pasajeros conversan en el avión.', img: 'avion', alt: 'Un joven y una joven sentados juntos en un avión', a: 'Sofía', b: 'Lucas', l: [
      ['Sofía', 'Hola, ¿está libre este asiento?'], ['Lucas', 'Sí, claro. Puedes sentarte aquí.'], ['Sofía', 'Gracias. Me llamo Sofía. ¿Cómo te llamas?'], ['Lucas', 'Soy Lucas. Mucho gusto.'],
      ['Sofía', 'Igualmente. ¿De dónde eres, Lucas?'], ['Lucas', 'Soy de Brasil. Soy brasileño. ¿Y tú?'], ['Sofía', 'Soy de Argentina. Soy argentina.'], ['Lucas', '¡Qué bien! ¿Es tu primera vez en Colombia?'],
      ['Sofía', 'Sí, es mi primera vez. ¿Y tú?'], ['Lucas', 'No, ya conozco Colombia.']] },
    { t: 'Diálogo 3 · En el hotel', sit: 'Dos viajeros se conocen en la recepción de un hotel.', img: 'hotel', alt: 'Una pareja con maletas habla con la recepcionista de un hotel', a: 'Recepcionista', b: 'Ana', l: [
      ['Recepcionista', '¡Buenas tardes! Bienvenidos al hotel.'], ['Ana', 'Buenas tardes. Tenemos una reserva.'], ['Recepcionista', 'Perfecto. ¿De dónde son ustedes?'], ['Ana', 'Somos de Francia. Yo soy francesa y él es francés.'],
      ['Recepcionista', '¡Muy bien! ¿Cómo se llaman?'], ['Ana', 'Me llamo Ana y él se llama Pierre.'], ['Pierre', 'Mucho gusto.'], ['Recepcionista', 'Encantada. ¿Cuántos días van a quedarse?'],
      ['Ana', 'Tres días. Estamos de vacaciones.'], ['Recepcionista', '¡Excelente! Que disfruten su estancia.']] },
  ];
  const VOC = ['peru', 'mexico', 'espana', 'brasil', 'argentina', 'colombia', 'francia'];
  const sayLine = t => { if (typeof speak === 'function') speak(t); };

  function lineaEl(sp, tx, lado) {
    return h('div', { class: 'pv-l' + (lado ? ' rt' : '') }, h('b', null, sp + ':'), h('span', null, tx), h('button', { class: 'pv-say', type: 'button', 'aria-label': 'Escuchar esta frase', onclick: () => sayLine(tx) }, '🔊'));
  }
  function initPasaporte() {
    const dm = $('#pv-dialogos'), vm = $('#pv-vocab'); if (!dm) return;
    dm.replaceChildren(...DIA.map(d => {
      const primero = d.l[0][0];
      return h('div', { class: 'pv-dia' }, h('h5', null, d.t), h('p', { class: 'pv-sit' }, 'Situación: ' + d.sit),
        h('div', { class: 'pv-grid' }, h('div', { class: 'pv-lines' }, ...d.l.map(([s, t]) => lineaEl(s, t, s !== primero))),
          h('img', { src: `images/paises/dialogo-${d.img}.webp`, alt: d.alt, loading: 'lazy' })));
    }));
    /* vocabulario con tarjetas que se despliegan */
    const info = h('div', { class: 'vc-info', role: 'region', 'aria-live': 'polite' }, h('span', { class: 'ord-hint' }, 'Toca una tarjeta para ver la información.'));
    const cs = VOC.map(id => {
      const c = h('button', { class: 'vc-c', type: 'button', 'aria-pressed': 'false' }, flagImg(id, '', ''), nom(id));
      c.addEventListener('click', () => {
        cs.forEach(x => x.setAttribute('aria-pressed', String(x === c)));
        info.replaceChildren(h('div', { class: 'vc-pop' }, flagImg(id, `Bandera de ${nom(id)}`, ''), h('span', null, h('b', null, nom(id)), ' → masculino: ', h('b', null, gm(id)), ' · femenino: ', h('b', null, gf(id)))));
        sayLine(`${nom(id)}. ${gm(id)}. ${gf(id)}`);
      });
      return c;
    });
    vm.replaceChildren(h('div', { class: 'vc-cards' }, ...cs), info);
    initId(); initRel(); initCom(); initPra(); initCrea();
  }
  const bar2 = (chk, clr) => h('div', { class: 'row-actions', style: 'margin-top:10px' }, h('button', { class: 'btn go', type: 'button', onclick: chk }, 'Validar'), h('button', { class: 'btn pink', type: 'button', onclick: clr }, 'Borrar'));

  /* 1. Identifica: ¿de qué país es cada viajero? */
  function initId() {
    const mount = $('#act-pv-id'); if (!mount) return;
    const V = [['María', 'peru'], ['Carlos', 'mexico'], ['Lucas', 'brasil'], ['Sofía', 'argentina'], ['Ana y Pierre', 'francia']];
    const fb = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    const rows = V.map(([n, id]) => {
      const sel = h('select', { 'aria-label': `País de ${n}` }, h('option', { value: '' }, '— elige —'), ...mix(VOC).map(v => h('option', { value: v }, nom(v))));
      const ic = h('span', { class: 'ic', 'aria-hidden': 'true' });
      sel.addEventListener('change', () => { el.classList.remove('ok', 'no'); ic.textContent = ''; });
      const el = h('div', { class: 'pv-row' }, h('b', null, n), n.includes(' y ') ? ' son de ' : ' es de ', sel, ic);
      return { el, sel, ic, id };
    });
    const chk = () => {
      let ok = 0, f = 0;
      rows.forEach(r => { r.el.classList.remove('ok', 'no'); r.ic.textContent = ''; if (!r.sel.value) return; f++; const g = r.sel.value === r.id; r.el.classList.add(g ? 'ok' : 'no'); r.ic.textContent = g ? '✓' : '✕'; if (g) ok++; });
      setScore('paisId', ok); fb.className = 'feedback ' + (ok === rows.length ? 'ok' : 'no');
      fb.textContent = ok === rows.length ? '¡Muy bien! Identificaste los cinco países.' : !f ? 'Elige un país para cada viajero.' : 'Revisa las filas con ✕. Vuelve a leer los diálogos.';
    };
    const clr = () => { rows.forEach(r => { r.sel.value = ''; r.el.classList.remove('ok', 'no'); r.ic.textContent = ''; }); fb.textContent = ''; setScore('paisId', 0); };
    mount.replaceChildren(...rows.map(r => r.el), fb, bar2(chk, clr));
  }

  /* 2. Relaciona: país ↔ gentilicio (arrastrar) */
  function initRel() {
    const mount = $('#act-pv-rel'); if (!mount || typeof makeDrop !== 'function') return;
    makeDrop(mount, { id: 'paisRel', chips: mix(VOC.map(gm)), rows: VOC.map(id => ({ pre: nom(id) + ' →', post: '', ans: gm(id) })) });
  }

  /* 3. Completa: gentilicio que falta en cada diálogo */
  function initCom() {
    const mount = $('#act-pv-com'); if (!mount) return;
    const T = [
      ['Diálogo 1', [['María: Soy de Perú. Soy ', 'peruana'], ['Carlos: Soy de México. Soy ', 'mexicano']]],
      ['Diálogo 2', [['Lucas: Soy de Brasil. Soy ', 'brasileño'], ['Sofía: Soy de Argentina. Soy ', 'argentina']]],
      ['Diálogo 3', [['Ana: Somos de Francia. Yo soy ', 'francesa', ' y él es ', 'francés']]],
    ];
    const fb = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' }), cells = [];
    const body = T.map(([tt, ls]) => h('div', { class: 'pv-dia' }, h('h5', null, tt), ...ls.map(l => {
      const row = h('div', { class: 'pv-row' });
      for (let k = 0; k < l.length; k += 2) {
        row.append(l[k]);
        const inp = h('input', { class: 'pa-in', type: 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Gentilicio que falta' });
        inp.addEventListener('input', () => inp.classList.remove('ok', 'no'));
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); chk(); } });
        row.append(inp, '.'); cells.push({ inp, ans: l[k + 1] });
      }
      return row;
    })));
    const chk = () => {
      let ok = 0, f = 0, ac = false;
      cells.forEach(c => { c.inp.classList.remove('ok', 'no'); if (!c.inp.value.trim()) return; f++; const r = grade(c.inp.value, [c.ans]); c.inp.classList.add(r === 'no' ? 'no' : 'ok'); if (r !== 'no') ok++; if (r === 'accent') ac = true; });
      setScore('paisCom', ok); fb.className = 'feedback ' + (ok === cells.length ? 'ok' : 'no');
      fb.textContent = ok === cells.length ? (ac ? '¡Muy bien! Recuerda las tildes (francés, brasileño).' : '¡Excelente! Completaste todos los diálogos.') : !f ? 'Escribe el gentilicio que falta.' : 'Revisa las casillas marcadas. Pista: fíjate si habla un hombre o una mujer.';
    };
    const clr = () => { cells.forEach(c => { c.inp.value = ''; c.inp.classList.remove('ok', 'no'); }); fb.textContent = ''; setScore('paisCom', 0); };
    mount.replaceChildren(...body, fb, bar2(chk, clr));
  }

  /* 4. Practica: representa un diálogo (se ocultan las frases de un personaje) */
  function initPra() {
    const mount = $('#act-pv-pra'); if (!mount) return;
    const sd = h('select', { 'aria-label': 'Diálogo' }, ...DIA.map((d, i) => h('option', { value: i }, d.t)));
    const sr = h('select', { 'aria-label': 'Personaje' });
    const out = h('div', { class: 'pv-lines' });
    const roles = () => { const d = DIA[+sd.value]; sr.replaceChildren(...[...new Set(d.l.map(x => x[0]))].map(n => h('option', { value: n }, n))); sr.value = d.a; pinta(); };
    function pinta() {
      const d = DIA[+sd.value], primero = d.l[0][0];
      out.replaceChildren(...d.l.map(([s, t]) => {
        const el = lineaEl(s, t, s !== primero);
        if (s === sr.value) { el.classList.add('hid'); const sp = el.querySelector('span'); sp.title = 'Toca para ver la frase'; sp.addEventListener('click', () => el.classList.remove('hid')); }
        return el;
      }));
    }
    sd.addEventListener('change', roles); sr.addEventListener('change', pinta);
    mount.replaceChildren(h('div', { class: 'pv-sel' }, h('label', null, 'Diálogo: '), sd, h('label', null, ' Yo soy: '), sr, h('button', { class: 'btn sm', type: 'button', onclick: pinta }, '🔄 Ocultar otra vez')), out,
      h('p', { class: 'pa-note' }, 'Tu compañero lee las frases visibles y tú dices las frases ocultas en voz alta.'));
    roles();
  }

  /* 5. Crea: tu propio diálogo */
  function initCrea() {
    const mount = $('#act-pv-crea'); if (!mount) return;
    const ta = h('textarea', { class: 'pv-ta', 'aria-label': 'Tu diálogo', placeholder: 'Ejemplo:\n— ¡Hola! Me llamo ...\n— Mucho gusto. ¿De dónde eres?\n— Soy de ... Soy ...' });
    const fb = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' }), ul = h('ul', { class: 'pv-chk' });
    const gents = Object.values(P).flatMap(x => [x[1], x[2]]).map(g => plainN(g));
    function plainN(x) { return String(x).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
    const chk = () => {
      const t = plainN(ta.value);
      const C = [['Te presentas (me llamo / soy…)', /\b(me llamo|mi nombre es|soy [a-z]+)\b/.test(t)], ['Saludas (hola, buenos días…)', /\b(hola|buenos dias|buenas tardes|buenas noches)\b/.test(t)],
        ['Preguntas el país de origen (¿de dónde eres?)', /de donde (eres|es usted|son)/.test(t)], ['Dices tu país y tu nacionalidad (soy de… soy…)', /soy de [a-zñ ]+/.test(t) && gents.some(g => new RegExp('\\b' + g + '\\b').test(t))]];
      ul.replaceChildren(...C.map(([n, ok]) => h('li', { class: ok ? 'ok' : 'no' }, (ok ? '✓ ' : '✕ ') + n)));
      const n = C.filter(c => c[1]).length; setScore('paisCrea', ta.value.trim() ? n : 0);
      fb.className = 'feedback ' + (n === 4 ? 'ok' : 'no'); fb.textContent = !ta.value.trim() ? 'Escribe tu diálogo.' : n === 4 ? '¡Excelente! Tu diálogo tiene todo lo necesario.' : 'Casi. Agrega lo que falta y vuelve a validar.';
    };
    mount.replaceChildren(ta, ul, fb, bar2(chk, () => { ta.value = ''; ul.replaceChildren(); fb.textContent = ''; setScore('paisCrea', 0); }));
  }

  /* =====================================================================
     4. FERIA DE NACIONES · ficha con 8 gentilicios
     ===================================================================== */
  const FICHA = ['brasil', 'mexico', 'alemania', 'colombia', 'rusia', 'honduras', 'grecia', 'suecia'];
  function initFicha() {
    const mount = $('#act-pais-feria'); if (!mount) return;
    const fb = h('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    const rows = FICHA.map((id, i) => {
      const inp = h('input', { class: 'pa-in wide', type: 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': `Gentilicio de ${nom(id)}`, placeholder: 'gentilicio (masc. o fem.)' });
      const ic = h('span', { class: 'ic', 'aria-hidden': 'true' });
      const tip = h('small', { class: 'pa-ans', hidden: true }, `${gm(id)}${gf(id) !== gm(id) ? ' / ' + gf(id) : ''}`);
      inp.addEventListener('input', () => { inp.closest('.fi-row').classList.remove('ok', 'no'); ic.textContent = ''; tip.hidden = true; });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      const el = h('div', { class: 'fi-row' }, h('span', { class: 'fi-n' }, String(i + 1)), flagImg(id, '', 'fi-flag'), h('b', { class: 'fi-p' }, nom(id)), inp, ic, tip);
      return { el, inp, ic, tip, id };
    });
    let tries = 0;
    function check() {
      tries++; let ok = 0, filled = 0;
      rows.forEach(r => {
        r.el.classList.remove('ok', 'no'); r.ic.textContent = ''; r.tip.hidden = true;
        if (!r.inp.value.trim()) return; filled++;
        const res = grade(r.inp.value, [gm(r.id), gf(r.id)]);
        if (res === 'no') { r.el.classList.add('no'); r.ic.textContent = '✕'; if (tries > 1) r.tip.hidden = false; } else { r.el.classList.add('ok'); r.ic.textContent = '✓'; ok++; }
      });
      setScore('paisFeria', ok);
      fb.className = 'feedback ' + (ok === rows.length ? 'ok' : 'no');
      fb.textContent = ok === rows.length ? '¡Excelente! Tu ficha tiene los 8 gentilicios.' : !filled ? 'Escribe el gentilicio de cada país.' : 'Revisa las filas con ✕. Recuerda: se escriben con minúscula inicial.';
    }
    const clear = () => { tries = 0; rows.forEach(r => { r.inp.value = ''; r.el.classList.remove('ok', 'no'); r.ic.textContent = ''; r.tip.hidden = true; }); fb.textContent = ''; setScore('paisFeria', 0); };
    mount.replaceChildren(h('div', { class: 'fi-list' }, ...rows.map(r => r.el)), fb,
      h('div', { class: 'row-actions', style: 'margin-top:10px' }, h('button', { class: 'btn go', type: 'button', onclick: check }, 'Validar'), h('button', { class: 'btn pink', type: 'button', onclick: clear }, 'Borrar')));
  }

  /* =====================================================================
     5. TRIVIAL GRUPAL · 2 equipos, 12 retos, 20 segundos
     ===================================================================== */
  // [bandera, categoría, pregunta, [opciones], correcta, explicación]
  const TRIVIA = [
    ['japon', 'País y capital', '¿Qué país asiático tiene como capital a la ciudad de Tokio?', ['China', 'Japón', 'Corea del Sur', 'Tailandia'], 1, 'Tokio es la capital de Japón. A las personas originarias de este país se les llama japoneses o nipones.'],
    ['canada', 'Gentilicio', 'Si Mateo nació en Toronto (Canadá), ¿cuál es su gentilicio correcto?', ['Canadiano', 'Canadiense', 'Canadés', 'Canadino'], 1, 'El gentilicio normativo de Canadá en español es «canadiense» (invariable en género: el/la canadiense).'],
    ['peru', 'País y capital', '¿En qué país sudamericano se encuentra la ciudadela inca de Machu Picchu?', ['Bolivia', 'Ecuador', 'Perú', 'Colombia'], 2, 'Machu Picchu está en Cusco, Perú. Quienes nacen en Perú son peruanos y peruanas.'],
    ['brasil', 'Gentilicio', '¿Cómo se les llama a las personas nacidas en Brasil?', ['Brasileños', 'Brasilenses', 'Brasilianos', 'Brasileros'], 0, 'En español culto y general se prefiere «brasileño / brasileña», aunque «brasilero» se usa en algunas zonas.'],
    ['espana', 'País y capital', '¿Cuál es el país europeo cuya capital es Madrid y donde se baila flamenco?', ['Portugal', 'Italia', 'España', 'Francia'], 2, 'Madrid es la capital de España, y sus habitantes son españoles y españolas.'],
    ['marruecos', 'Gentilicio', 'Una artesana originaria de Marruecos tiene el gentilicio de:', ['Marroquina', 'Marroquí', 'Marrueca', 'Marroquesa'], 1, 'El gentilicio de Marruecos es «marroquí» (plural: marroquíes) y sirve tanto para masculino como para femenino.'],
    ['argentina', 'País y capital', 'Sofía nació en Buenos Aires, la capital del tango. ¿De qué país es?', ['Uruguay', 'Chile', 'Argentina', 'Paraguay'], 2, 'Buenos Aires es la capital de Argentina. Sus habitantes son argentinos (y quienes nacen en la capital, porteños).'],
    ['paises-bajos', 'Gentilicio', '¿Cuál es el gentilicio oficial de quienes nacen en los Países Bajos?', ['Neerlandés', 'Paisesbajense', 'Holandino', 'Flamenco'], 0, '«Neerlandés / neerlandesa» es el gentilicio oficial de todo el país (Países Bajos); «holandés» corresponde solo a la región de Holanda.'],
    ['mexico', 'País y capital', '¿Qué país norteamericano es famoso por Chichén Itzá y su capital Ciudad de México?', ['Guatemala', 'México', 'Costa Rica', 'Panamá'], 1, 'México limita al norte con Estados Unidos y sus habitantes son mexicanos y mexicanas.'],
    ['costa-rica', 'Gentilicio', '¿Cuál es el gentilicio formal de las personas nacidas en Costa Rica?', ['Costarriqueño', 'Costarricense', 'Rico-costeño', 'Costaricano'], 1, 'El gentilicio oficial es «costarricense» (coloquialmente también se llaman «ticos» con mucho cariño).'],
    ['francia', 'País y capital', '¿A qué país pertenecen la Torre Eiffel y el museo del Louvre?', ['Bélgica', 'Suiza', 'Francia', 'Luxemburgo'], 2, 'Ambos monumentos están en París, capital de Francia, hogar de los franceses y francesas.'],
    ['belgica', 'Gentilicio', 'Si probamos chocolates artesanales elaborados en Bélgica, decimos que son chocolates…', ['Bélgicos', 'Belgas', 'Belgienses', 'Belganos'], 1, 'El gentilicio de Bélgica es «belga» (plural: belgas), válido para masculino y femenino.'],
  ];
  const TROFEOS = [[700, 'Trofeo Embajadores del Mundo', '¡Nivel Máximo! Dominan tanto los países como los gentilicios más exigentes con velocidad récord.', '🏆'],
    [400, 'Trofeo Exploradores Globales', '¡Muy buen viaje! Conocen muchos países y gentilicios. Con un poco más de práctica llegarán a la cima.', '🥈'],
    [0, 'Trofeo Viajeros Aprendices', '¡Buen comienzo! Cada viaje enseña algo nuevo. Repasen los gentilicios y vuelvan a intentarlo.', '🥉']];

  function initTrivia() {
    const mount = $('#act-pais-trivia'); if (!mount) return;
    const TIEMPO = 20;
    const eq = [{ name: 'Equipo Rosa', pts: 0, ok: 0, ico: '🌸' }, { name: 'Equipo Lavanda', pts: 0, ok: 0, ico: '💜' }];
    let q = 0, turno = 0, t0 = 0, resto = TIEMPO, timer = null, resp = false, preg = [];

    const inN = [h('input', { class: 'pa-in wide', type: 'text', value: eq[0].name, maxlength: 20, 'aria-label': 'Nombre del equipo 1' }), h('input', { class: 'pa-in wide', type: 'text', value: eq[1].name, maxlength: 20, 'aria-label': 'Nombre del equipo 2' })];
    const root = h('div', { class: 'tv' });
    const sonido = h('button', { class: 'btn sm', type: 'button', 'aria-pressed': String(!!state.sound), onclick: () => { setSound(!state.sound); sonido.setAttribute('aria-pressed', String(state.sound)); sonido.textContent = state.sound ? '🔊 Sonido ON' : '🔇 Sonido OFF'; } }, state.sound ? '🔊 Sonido ON' : '🔇 Sonido OFF');

    function reglas() {
      clearInterval(timer);
      const caja = (t, tx) => h('div', { class: 'tv-rule' }, h('b', null, t), h('p', null, tx));
      root.replaceChildren(
        h('div', { class: 'tv-top' }, h('h4', { class: 'tv-title' }, '4 · Trivial Grupal: Países y Gentilicios'), sonido),
        h('p', { class: 'tv-sub' }, '✨ Competencia rápida por equipos ✨'),
        h('p', { class: 'tv-lead' }, 'Demuestren cuánto saben sobre países, capitales, banderas y sus gentilicios antes de que se agote el reloj.'),
        h('div', { class: 'tv-how' }, h('h5', null, '📖 ¿Cómo se juega esta trivia?'),
          h('div', { class: 'tv-rules' },
            caja('1. Turnos por equipos', 'Compiten el Equipo Rosa y el Equipo Lavanda (12 retos en total, 6 por equipo). También pueden cambiar el equipo activo manualmente si juegan con pulsador en clase.'),
            caja('2. Reloj de 20 segundos', 'Cada pregunta tiene un reloj regresivo. Si se demoran mucho y el tiempo llega a 0, el turno se cierra automáticamente y pierden los puntos de esa ronda.'),
            caja('3. Sistema de puntajes', '+100 pts por respuesta correcta. +50 pts extra (Bono Veloz) si responden antes de que pasen 10 segundos.'),
            caja('4. Premios e insignias', 'Al finalizar las 12 preguntas, el equipo ganador recibirá su Trofeo Digital según su puntuación: Embajadores del Mundo, Exploradores Globales o Viajeros Aprendices.')),
          h('div', { class: 'tv-names' }, h('label', null, '🌸 EQUIPO 1: ', inN[0]), h('label', null, '💜 EQUIPO 2: ', inN[1]))),
        h('div', { class: 'row-actions' }, h('button', { class: 'btn pink tv-start', type: 'button', onclick: empezar }, '🚀 ¡Empezar la Trivia!')));
    }
    function empezar() {
      eq.forEach((e, i) => { e.name = inN[i].value.trim() || (i ? 'Equipo Lavanda' : 'Equipo Rosa'); e.pts = 0; e.ok = 0; });
      q = 0; turno = 0; preg = TRIVIA.map(r => ({ r, orden: mix([0, 1, 2, 3]) })); setScore('paisTrivia', 0); pregunta();
    }
    function marcador() {
      return h('div', { class: 'tv-score' }, ...eq.map((e, i) => h('div', { class: 'tv-team t' + i + (i === turno && !resp ? ' act' : '') }, h('span', { class: 'tv-tn' }, `${e.ico} ${e.name}`), i === turno ? h('small', { class: 'tv-badge' }, '✨ TURNO ACTIVO') : null, h('b', { class: 'tv-pts' }, String(e.pts)), h('small', null, 'puntos'))));
    }
    function pregunta() {
      resp = false; resto = TIEMPO; t0 = Date.now(); turno = q % 2;
      const { r, orden } = preg[q]; const [fl, cat, texto, ops, ok, expl] = r;
      const reloj = h('span', { class: 'tv-clock' }, `⏰ ${TIEMPO}s`), barra = h('i', { style: 'width:0%' });
      const fb = h('div', { class: 'tv-fb', hidden: true });
      const botones = orden.map((idx, k) => {
        const b = h('button', { class: 'tv-opt', type: 'button' }, h('span', { class: 'tv-l' }, 'ABCD'[k]), ops[idx]);
        b.addEventListener('click', () => responder(idx === ok, b));
        b.dataset.ok = idx === ok ? '1' : ''; return b;
      });
      function cierra(html, cls, ptsGanados) {
        resp = true; clearInterval(timer); botones.forEach(x => { x.disabled = true; if (x.dataset.ok) x.classList.add('ok'); });
        const ult = q === TRIVIA.length - 1;
        fb.className = 'tv-fb ' + cls; fb.hidden = false;
        fb.replaceChildren(h('div', null, h('b', null, html), h('p', null, expl)), h('button', { class: 'btn go', type: 'button', onclick: () => { if (ult) final(); else { q++; pregunta(); } } }, ult ? 'Ver premio final 🏆' : 'Siguiente reto →'));
        mc.replaceWith(marcador()); mc = $('.tv-score', root);
        fb.querySelector('button').focus();
      }
      function responder(acierto, btn) {
        if (resp) return; const e = eq[turno], seg = (Date.now() - t0) / 1000;
        if (acierto) {
          const veloz = seg < 10, g = veloz ? 150 : 100; e.pts += g; e.ok++; btn.classList.add('mine'); sOk();
          setScore('paisTrivia', eq[0].ok + eq[1].ok);
          cierra(`${veloz ? '🌟 ¡Correcto y súper veloz' : '💖 ¡Muy bien'}, ${e.name}! (+${g} pts)`, 'ok');
        } else { btn.classList.add('no'); sNo(); cierra(`Casi, ${e.name}. (0 pts)`, 'no'); }
      }
      timer = setInterval(() => {
        if (resp) return; resto = Math.max(0, TIEMPO - (Date.now() - t0) / 1000);
        reloj.textContent = `⏰ ${Math.ceil(resto)}s`; barra.style.width = (100 - resto / TIEMPO * 100) + '%'; reloj.classList.toggle('low', resto <= 5);
        if (resto <= 0) { sNo(); cierra(`⏰ ¡Se acabó el tiempo para ${eq[turno].name}! (0 pts)`, 'no'); }
      }, 200);
      const cambia = h('button', { class: 'btn sm', type: 'button', onclick: () => { if (resp) return; turno = 1 - turno; mc.replaceWith(marcador()); mc = $('.tv-score', root); } }, '🔁 Cambiar equipo');
      let mc = marcador();
      root.replaceChildren(
        h('div', { class: 'tv-top' }, h('h4', { class: 'tv-title' }, '4 · Trivial Grupal'), h('div', { class: 'tv-btns' }, sonido, h('button', { class: 'btn sm pink', type: 'button', onclick: reglas }, '🏫 Reglas'))),
        mc,
        h('div', { class: 'tv-qbox' },
          h('div', { class: 'tv-meta' }, h('span', { class: 'tv-chip' }, `Pregunta ${q + 1} de ${TRIVIA.length}`), h('span', { class: 'tv-chip pk' }, (cat === 'Gentilicio' ? '🏷 ' : '🌎 ') + cat), reloj),
          h('div', { class: 'tv-bar' }, barra),
          h('div', { class: 'tv-q' }, flagImg(fl, `Bandera de ${nom(fl)}`, 'tv-flag'), h('p', null, texto)),
          h('div', { class: 'tv-opts' }, ...botones), fb, h('div', { class: 'row-actions', style: 'margin-top:6px' }, cambia)));
    }
    function final() {
      clearInterval(timer); sWin();
      const [a, b] = eq, emp = a.pts === b.pts, gan = a.pts >= b.pts ? a : b, ptsG = gan.pts;
      const tr = TROFEOS.find(t => ptsG >= t[0]);
      root.replaceChildren(
        h('p', { class: 'tv-chip pk', style: 'align-self:center' }, '🎉 ¡TRIVIAL COMPLETADO! 🎉'),
        h('h4', { class: 'tv-win' }, emp ? '🤝 ¡Empate!' : `🎉 ¡Ganó ${gan.name}! 🎉`),
        h('div', { class: 'tv-trofeo' }, h('div', { class: 'tv-medal' }, tr[3]), h('small', null, 'PREMIO OTORGADO'), h('b', null, tr[1]), h('p', null, tr[2])),
        h('div', { class: 'tv-final' }, ...eq.map((e, i) => h('div', { class: 'tv-team t' + i }, h('span', { class: 'tv-tn' }, `${e.ico} ${e.name}`), h('b', { class: 'tv-pts' }, `${e.pts} pts`), h('small', null, `${e.ok} de 6 aciertos`)))),
        h('details', { class: 'tv-rep' }, h('summary', null, '📝 Ver repaso de los 12 países y gentilicios'),
          h('ul', null, ...TRIVIA.map(r => h('li', null, flagImg(r[0], '', 'tv-mini'), h('span', null, h('b', null, nom(r[0])), ' → ', gm(r[0]) + (gf(r[0]) !== gm(r[0]) ? ' / ' + gf(r[0]) : ''))))) ),
        h('div', { class: 'row-actions' }, h('button', { class: 'btn pink', type: 'button', onclick: empezar }, '🔄 Jugar de nuevo'), h('button', { class: 'btn go', type: 'button', onclick: reglas }, '📖 Volver a reglas')));
    }
    mount.replaceChildren(root); reglas();
  }

  initMapa(); initMemo(); initPasaporte(); initFicha(); initTrivia();
})();
