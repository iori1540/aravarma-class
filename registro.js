/* ============================================================
   Registro de estudiantes · avances por Básico · tarjetas ganadas
   Todo se guarda en este navegador (localStorage).
   ============================================================ */
(() => {
  'use strict';
  const KEY = 'aravarma.registro.v1';
  const LESSONS = [['lesson-bas-01', 'Básico 1'], ['lesson-bas-02', 'Básico 2'], ['lesson-bas-03', 'Básico 3'], ['lesson-extras', 'Actividades extras'], ['ruleta-end', 'Ruleta final']];
  const IC = {
    user: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="8" r="4.2"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z"/></svg>',
    school: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3 1 9l11 6 9-4.9V17h2V9z"/><path d="M5 13.2V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8l-7 3.8z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 5h18a1 1 0 0 1 1 1v.5l-10 6.4L2 6.5V6a1 1 0 0 1 1-1z"/><path d="M2 8.9V18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V8.9l-10 6.4z"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="currentColor"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l4-1 11-11-3-3L5 16z"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    cam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  };

  const CFG = window.ARAVARMA_SYNC || {};
  /* ---------- datos ---------- */
  let db = load();
  function load() {
    try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && Array.isArray(d.students)) return d; } catch (e) { /* vacío */ }
    return { active: null, students: [] };
  }
  let saveFailed = false;
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); saveFailed = false; schedulePush(); }
    catch (e) { saveFailed = true; flash('No se pudo guardar en este navegador (poco espacio). Prueba con una foto más pequeña.'); }
  }
  /* envío a la hoja de la profesora (Google Sheets) */
  let pushTimer = null;
  function payload(s) {
    const pct = id => summary(s, id).pct;
    return { id: s.id, nombre: s.nombre, apellidos: s.apellidos, puesto: s.grado, correo: s.correo,
      b1: pct('lesson-bas-01'), b2: pct('lesson-bas-02'), b3: pct('lesson-bas-03'), ex: pct('lesson-extras'), ru: pct('ruleta-end'),
      tarjetas: totalCards(s), palabras: Object.values(s.cards).map(c => c.word).join(', '), detalle: JSON.stringify(s.best) };
  }
  function schedulePush() {
    if (!CFG.url) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => {
      const s = cur(); if (!s || !s.nombre) return;
      try { fetch(CFG.url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload(s)) }).catch(() => {}); } catch (e) { /* sin conexión */ }
    }, 1500);
  }
  const uid = () => 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const cur = () => db.students.find(s => s.id === db.active) || null;
  function ensure() {
    let s = cur();
    if (!s) {
      s = { id: uid(), nombre: '', apellidos: '', grado: '', correo: '', foto: '', creado: Date.now(), best: {}, tot: {}, cards: {} };
      db.students.push(s); db.active = s.id; save(); paintOpen();
    }
    return s;
  }
  const fullName = s => [s.nombre, s.apellidos].filter(Boolean).join(' ') || 'Invitado';

  /* ---------- avances ---------- */
  function lessonOf(id) {
    if (id === 'extras') return 'lesson-extras';
    if (id === 'ruleta') return 'ruleta-end';
    const sel = typeof ACT_BOX !== 'undefined' ? ACT_BOX[id] : null;
    const el = sel && document.querySelector(sel); const a = el && el.closest('article');
    return a ? a.id : null;
  }
  function acts(lessonId) {
    const list = (typeof PG !== 'undefined' ? PG : []).filter(p => lessonOf(p[0]) === lessonId).map(p => ({ id: p[0], label: p[1], total: p[2] }));
    if (lessonId === 'lesson-extras') list.push({ id: 'extras', label: 'Preguntas', total: 12 });
    return list;
  }
  function summary(s, lessonId) {
    const list = acts(lessonId); let got = 0, total = 0;
    list.forEach(a => { total += a.total; got += Math.min(s.best[a.id] || 0, a.total); });
    return { list, got, total, pct: total ? Math.round(got / total * 100) : 0 };
  }

  /* ---------- tarjetas ---------- */
  const key = w => (typeof fold === 'function' ? fold(w) : String(w).toLowerCase()).trim();
  function picFor(w) {
    const k = key(w);
    try {
      const e = (typeof ESCRIBE !== 'undefined' ? ESCRIBE : []).find(x => key(x.word) === k); if (e) return e.pic;
      const p = (typeof PRACTICA !== 'undefined' ? PRACTICA : []).find(x => key(x.word) === k); if (p) return p.art;
    } catch (e) { /* sin imagen */ }
    return '';
  }
  const cap = w => w.charAt(0).toUpperCase() + w.slice(1);
  function universe() {
    const seen = new Map();
    (typeof ESCRIBE !== 'undefined' ? ESCRIBE : []).forEach(x => seen.set(key(x.word), x.word));
    (typeof SPELL !== 'undefined' ? SPELL : []).forEach(w => { if (!seen.has(key(w))) seen.set(key(w), w.replace(/[¿?¡!]/g, '')); });
    return seen;
  }
  function earn(word, how) {
    if (!word || !/[a-zñáéíóú]/i.test(word)) return;
    const s = ensure(), k = key(word);
    const c = s.cards[k] || (s.cards[k] = { word: String(word).replace(/[¿?¡!]/g, ''), say: 0, write: 0, t: Date.now() });
    if (c[how]) return;
    const first = !c.say && !c.write;
    c[how] = 1; save(); paintOpen(); toast(c, how, first);
    if (dlg && dlg.open) paintBody();
  }
  function score(id, got, total) {
    const s = ensure();
    if (got > (s.best[id] || 0)) { s.best[id] = got; s.tot[id] = total; save(); if (dlg && dlg.open) paintBody(); }
  }

  /* ---------- aviso de tarjeta nueva ---------- */
  let toastTimer = null;
  function flash(text) {
    let t = document.getElementById('reg-toast');
    if (!t) { t = h('div', { id: 'reg-toast', class: 'reg-toast', role: 'status', 'aria-live': 'polite' }); document.body.append(t); }
    t.className = 'reg-toast msg'; t.replaceChildren(h('span', null, text)); void t.offsetWidth; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3800);
  }
  function toast(c, how, first) {
    let t = document.getElementById('reg-toast');
    if (!t) { t = h('div', { id: 'reg-toast', class: 'reg-toast', role: 'status', 'aria-live': 'polite' }); document.body.append(t); }
    t.className = 'reg-toast';
    t.replaceChildren(h('div', { class: 'rt-pic', html: picFor(c.word) || IC.star }),
      h('div', { class: 'rt-tx' }, h('b', null, first ? '¡Nueva tarjeta!' : '¡Tarjeta mejorada!'), h('span', null, `${cap(c.word)} · ${how === 'write' ? 'escribiste bien la palabra' : 'dijiste bien la palabra'}`)));
    void t.offsetWidth; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3400);
  }

  /* ---------- botón flotante ---------- */
  let openBtn = null;
  function totalCards(s) { return s ? Object.keys(s.cards).length : 0; }
  function paintOpen() {
    if (!openBtn) return;
    const s = cur();
    openBtn.replaceChildren(
      s && s.foto ? h('img', { class: 'ro-av', src: s.foto, alt: '' }) : h('span', { class: 'ro-av ph', html: IC.user }),
      h('span', { class: 'ro-tx' }, s && (s.nombre || s.apellidos) ? s.nombre || s.apellidos : 'Registro'),
      h('span', { class: 'ro-n', title: 'Tarjetas obtenidas' }, h('span', { html: IC.star }), String(totalCards(s))));
  }

  /* ---------- ventana ---------- */
  let dlg = null, body = null, tab = 'registro', editId = undefined, photoTmp = null;
  const TABS = [['registro', 'Mi registro'], ['avances', 'Avances'], ['tarjetas', 'Mis tarjetas'], ['estudiantes', 'Estudiantes']];
  function build() {
    dlg = h('dialog', { class: 'reg-dlg', 'aria-label': 'Registro de estudiantes' });
    body = h('div', { class: 'reg-body' });
    const nav = h('div', { class: 'reg-tabs', role: 'tablist' }, ...TABS.map(([id, label]) =>
      h('button', { class: 'reg-tab', type: 'button', role: 'tab', 'data-t': id, onclick: () => { tab = id; if (id === 'registro') editId = undefined; paintBody(); } }, label)));
    const close = h('button', { class: 'reg-x', type: 'button', 'aria-label': 'Cerrar', onclick: () => dlg.close() }, '×');
    dlg.append(close, h('h2', { class: 'reg-h' }, 'Registro de estudiantes'), nav, body);
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => { paintOpen(); });
    document.body.append(dlg);
  }
  function openDlg(t) {
    if (!dlg) build();
    if (t) tab = t;
    editId = undefined; paintBody();
    if (!dlg.open) dlg.showModal();
  }
  function paintBody() {
    $$('.reg-tab', dlg).forEach(b => b.setAttribute('aria-selected', String(b.dataset.t === tab)));
    body.replaceChildren(({ registro: viewForm, avances: viewProgress, tarjetas: viewCards, estudiantes: viewList })[tab]());
  }

  /* --- Mi registro (tarjeta rosa) --- */
  function viewForm() {
    const s = editId === null ? null : (editId ? db.students.find(x => x.id === editId) : cur());
    const isNew = !s;
    photoTmp = s ? s.foto || '' : '';
    const avatar = h('div', { class: 'rc2-photo', role: 'button', tabindex: '0', title: 'Toca para subir la foto', 'aria-label': 'Subir la foto del estudiante' });
    const drawPhoto = () => { if (photoTmp) avatar.replaceChildren(h('img', { src: photoTmp, alt: 'Foto del estudiante' })); else avatar.replaceChildren(); };
    drawPhoto();
    const file = h('input', { type: 'file', accept: 'image/*', class: 'sr-only', 'aria-label': 'Subir foto' });
    file.addEventListener('change', () => {
      const f = file.files && file.files[0]; if (!f) return;
      const img = new Image(), url = URL.createObjectURL(f);
      img.onload = () => {
        const S = 260, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
        const m = Math.min(img.width, img.height), sx = (img.width - m) / 2, sy = (img.height - m) / 2;
        x.drawImage(img, sx, sy, m, m, 0, 0, S, S); photoTmp = c.toDataURL('image/jpeg', 0.82); URL.revokeObjectURL(url); drawPhoto();
      };
      img.onerror = () => URL.revokeObjectURL(url); img.src = url;
    });
    avatar.addEventListener('click', () => file.click());
    avatar.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } });
    const mk = (label, name, type, val, auto, cls) => {
      const inp = h('input', { class: 'rc2-in ' + cls, type: type || 'text', name, placeholder: label, autocomplete: auto || 'off', 'aria-label': label, maxlength: 120, spellcheck: 'false', autocapitalize: 'off', autocorrect: 'off' });
      inp.value = val || ''; return inp;
    };
    const f1 = { inp: mk('Nombre', 'nombre', 'text', s && s.nombre, 'given-name', 'r1') };
    const f2 = { inp: mk('Apellidos', 'apellidos', 'text', s && s.apellidos, 'family-name', 'r2') };
    const f3 = { inp: mk('Puesto', 'grado', 'text', s && s.grado, 'off', 'r3') };
    const f4 = { inp: mk('Correo', 'correo', 'email', s && s.correo, 'email', 'r4') };
    const msg = h('p', { class: 'rc-msg', role: 'status', 'aria-live': 'polite' });
    const saveB = h('button', { class: 'rc-save', type: 'button', onclick: () => {
      const nombre = f1.inp.value.trim();
      if (!nombre) { msg.textContent = 'Escribe al menos el nombre.'; f1.inp.focus(); return; }
      let t = s;
      if (!t) { t = { id: uid(), creado: Date.now(), best: {}, tot: {}, cards: {} }; db.students.push(t); }
      Object.assign(t, { nombre, apellidos: f2.inp.value.trim(), grado: f3.inp.value.trim(), correo: f4.inp.value.trim(), foto: photoTmp || '' });
      db.active = t.id; save(); paintOpen(); editId = undefined;
      msg.textContent = '¡Registro guardado!'; msg.className = 'rc-msg ok';
      setTimeout(() => { if (dlg.open && tab === 'registro') paintBody(); }, 900);
    } }, isNew ? 'Guardar registro' : 'Actualizar registro');
    const card = h('div', { class: 'reg-card2' }, avatar, file, f1.inp, f2.inp, f3.inp, f4.inp);
    const wrap = h('div', { class: 'reg-form' }, card);
    wrap.append(h('p', { class: 'reg-note' }, 'Toca el recuadro de la foto para subir una imagen.'), saveB, msg);
    wrap.append(h('div', { class: 'reg-row' },
      h('button', { class: 'btn', type: 'button', onclick: () => { editId = null; paintBody(); } }, '+ Estudiante nuevo'),
      h('p', { class: 'reg-note' }, 'Los datos se guardan solo en este navegador.')));
    return wrap;
  }

  /* --- Avances por Básico --- */
  function viewProgress() {
    const s = cur();
    if (!s) return h('p', { class: 'reg-empty' }, 'Primero registra al estudiante en «Mi registro».');
    const p = progressOf(s);
    if (!s.nombre) p.prepend(h('p', { class: 'reg-warn' }, 'Todavía eres «Invitado». Escribe tu nombre en «Mi registro» y pulsa «Guardar registro» para aparecer en la lista de estudiantes.'));
    return p;
  }
  function progressOf(s) {
    const wrap = h('div', { class: 'reg-prog' }, h('p', { class: 'reg-who' }, h('b', null, fullName(s)), s.grado ? ` · ${s.grado}` : ''));
    LESSONS.forEach(([id, label]) => {
      const r = summary(s, id);
      wrap.append(h('section', { class: 'rp-b' },
        h('div', { class: 'rp-head' }, h('h3', null, label), h('span', { class: 'rp-pct' }, r.pct + '%')),
        h('div', { class: 'rp-bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(r.pct), 'aria-label': `Avance de ${label}` }, h('i', { style: `width:${r.pct}%` })),
        h('ul', { class: 'rp-list' }, ...r.list.map(a => {
          const g = Math.min(s.best[a.id] || 0, a.total), full = g === a.total;
          return h('li', { class: full ? 'full' : '' }, h('span', { class: 'rp-n' }, a.label), h('span', { class: 'rp-m' }, h('i', { style: `width:${Math.round(g / a.total * 100)}%` })), h('b', null, `${g}/${a.total}`), full ? h('span', { class: 'rp-s', html: IC.star }) : null);
        }))));
    });
    return wrap;
  }

  /* --- Mis tarjetas --- */
  function viewCards() {
    const s = cur();
    if (!s) return h('p', { class: 'reg-empty' }, 'Primero registra al estudiante en «Mi registro».');
    const uni = universe(), got = s.cards;
    Object.keys(got).forEach(k => { if (!uni.has(k)) uni.set(k, got[k].word); });
    const items = [...uni.entries()].map(([k, w]) => ({ k, w, c: got[k] })).sort((a, b) => (!!b.c - !!a.c) || (a.c && b.c ? b.c.t - a.c.t : 0));
    const n = Object.keys(got).length;
    const wrap = h('div', { class: 'reg-cards' },
      h('p', { class: 'reg-who' }, h('b', null, `${n} de ${items.length} tarjetas`), ' · escribe bien o di bien una palabra para ganar su tarjeta.'));
    const grid = h('div', { class: 'rk-grid' });
    items.forEach(({ w, c }) => {
      grid.append(h('div', { class: 'rk' + (c ? '' : ' lock'), 'aria-label': c ? cap(w) : 'Tarjeta por ganar' },
        h('div', { class: 'rk-pic', html: c ? (picFor(w) || `<span class="rk-l">${cap(w).charAt(0)}</span>`) : '<span class="rk-q">?</span>' }),
        h('b', null, c ? cap(w) : '???'),
        c ? h('span', { class: 'rk-b' }, c.write ? h('span', { class: 'on', title: 'La escribiste bien', html: IC.pen + ' escrita' }) : null, c.say ? h('span', { class: 'on', title: 'La dijiste bien', html: IC.mic + ' dicha' }) : null) : null));
    });
    wrap.append(grid); return wrap;
  }

  /* --- Estudiantes (lista para la profesora) --- */
  function csv() {
    const rows = [['Nombre', 'Apellidos', 'Grado o grupo', 'Correo', 'Básico 1 %', 'Básico 2 %', 'Básico 3 %', 'Actividades extras %', 'Ruleta %', 'Tarjetas', 'Registro']];
    db.students.forEach(s => rows.push([s.nombre, s.apellidos, s.grado, s.correo, ...LESSONS.map(([id]) => summary(s, id).pct), totalCards(s), new Date(s.creado).toLocaleDateString('es-PE')]));
    const text = rows.map(r => r.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(';')).join('\r\n');
    const a = h('a', { href: URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' })), download: 'estudiantes-aravarma.csv' });
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function localList() {
    if (!db.students.length) return h('p', { class: 'reg-empty' }, 'Aún no hay estudiantes registrados.');
    const tb = h('tbody');
    db.students.forEach(s => {
      const pcts = LESSONS.slice(0, 3).map(([id]) => summary(s, id).pct);
      tb.append(h('tr', { class: s.id === db.active ? 'act' : '' },
        h('td', { class: 'st-n' }, s.foto ? h('img', { src: s.foto, alt: '' }) : h('span', { class: 'ph', html: IC.user }), h('span', null, h('b', null, fullName(s)), h('small', null, s.grado || s.correo || ''))),
        ...pcts.map(p => h('td', { class: 'st-p' }, h('span', { class: 'rp-m' }, h('i', { style: `width:${p}%` })), h('b', null, p + '%'))),
        h('td', { class: 'st-c' }, h('span', { html: IC.star }), String(totalCards(s))),
        h('td', { class: 'st-a' },
          h('button', { class: 'btn sm', type: 'button', onclick: () => { db.active = s.id; save(); paintOpen(); tab = 'avances'; paintBody(); } }, 'Ver'),
          h('button', { class: 'btn sm', type: 'button', onclick: () => { editId = s.id; db.active = s.id; save(); paintOpen(); tab = 'registro'; paintBody(); } }, 'Editar'),
          h('button', { class: 'btn sm pink', type: 'button', 'aria-label': 'Borrar a ' + fullName(s), onclick: () => {
            if (!confirm(`¿Borrar a ${fullName(s)} y todo su avance? Esto no se puede deshacer.`)) return;
            db.students = db.students.filter(x => x.id !== s.id); if (db.active === s.id) db.active = db.students[0] ? db.students[0].id : null;
            save(); paintOpen(); paintBody();
          } }, 'Borrar'))));
    });
    return h('div', { class: 'reg-list' },
      h('div', { class: 'scroll-x' }, h('table', { class: 'rl-t' },
        h('thead', null, h('tr', null, h('th', null, 'Estudiante'), h('th', null, 'Básico 1'), h('th', null, 'Básico 2'), h('th', null, 'Básico 3'), h('th', null, 'Tarjetas'), h('th', null, ''))), tb)),
      h('div', { class: 'reg-row' }, h('button', { class: 'btn', type: 'button', onclick: csv }, 'Descargar lista (Excel)')));
  }

  /* --- Vista de la profesora: todos los estudiantes (desde la hoja) --- */
  function remoteCsv(rows) {
    const head = ['Nombre', 'Apellidos', 'Puesto', 'Correo', 'Básico 1 %', 'Básico 2 %', 'Básico 3 %', 'Actividades extras %', 'Ruleta %', 'Tarjetas', 'Palabras', 'Actualizado'];
    const text = [head, ...rows.map(r => [r.nombre, r.apellidos, r.puesto, r.correo, r.b1, r.b2, r.b3, r.ex, r.ru, r.tarjetas, r.palabras, r.actualizado])]
      .map(r => r.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(';')).join('\r\n');
    const a = h('a', { href: URL.createObjectURL(new Blob(['\ufeff' + text], { type: 'text/csv;charset=utf-8' })), download: 'todos-los-estudiantes.csv' });
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function teacherBox() {
    const out = h('div', { class: 'tb-out' });
    const msg = h('p', { class: 'reg-note', role: 'status', 'aria-live': 'polite' });
    const ask = h('div', { class: 'ask-slot' });
    function removeRemote(r) {
      const nom = [r.nombre, r.apellidos].filter(Boolean).join(' ') || 'este estudiante';
      const clave = h('input', { class: 'tb-pin', type: 'password', placeholder: 'Clave de la profesora', autocomplete: 'off', 'aria-label': 'Clave de la profesora' });
      const err = h('p', { class: 'ask-err', role: 'status' });
      const close = () => ask.replaceChildren();
      const go = async () => {
        const pin = clave.value.trim();
        if (!pin) { err.textContent = 'Escribe la clave de la profesora.'; clave.focus(); return; }
        close(); msg.textContent = 'Eliminando…';
        try { await fetch(CFG.url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ accion: 'eliminar', id: r.id, pin }) }); } catch (e) { /* sin conexión */ }
        setTimeout(async () => { await load(); if ([...document.querySelectorAll('.st-link')].length && rowsHas(r.id)) msg.textContent += ' Si ' + nom + ' sigue en la lista, la clave no era correcta.'; }, 1500);
      };
      clave.addEventListener('keydown', e => { if (e.key === 'Enter') go(); if (e.key === 'Escape') close(); });
      ask.replaceChildren(h('div', { class: 'ask', role: 'alertdialog', 'aria-label': 'Eliminar estudiante' },
        h('h4', null, '¿Eliminar a ' + nom + '?'),
        h('p', null, 'Se quitará de la lista de todos los estudiantes. Esta acción no se puede deshacer. Escribe la clave de la profesora para confirmar.'),
        clave, err,
        h('div', { class: 'reg-row' }, h('button', { class: 'btn pink', type: 'button', onclick: go }, 'Eliminar'), h('button', { class: 'btn', type: 'button', onclick: close }, 'Cancelar'))));
      ask.scrollIntoView({ block: 'nearest' }); clave.focus();
    }
    let lastRows = [];
    const rowsHas = id => lastRows.some(x => x.id === id);
    async function load() {
      msg.textContent = 'Cargando…'; out.replaceChildren();
      try {
        const r = await fetch(CFG.url + (CFG.url.includes('?') ? '&' : '?') + 'action=list');
        const d = await r.json();
        if (d.error) { msg.textContent = 'No se pudo leer la hoja.'; return; }
        const rows = d.rows || []; lastRows = rows;
        msg.textContent = rows.length ? `${rows.length} estudiante${rows.length === 1 ? '' : 's'} registrado${rows.length === 1 ? '' : 's'}.` : 'Aún no hay estudiantes en la hoja.';
        if (!rows.length) return;
        const tb = h('tbody');
        const showTable = () => { out.replaceChildren(table, h('div', { class: 'reg-row' }, h('button', { class: 'btn', type: 'button', onclick: () => remoteCsv(rows) }, 'Descargar todos (Excel)'))); };
        const showOne = r => {
          let best = {}; try { best = JSON.parse(r.detalle || '{}') || {}; } catch (e) { /* sin detalle */ }
          const st = { nombre: r.nombre, apellidos: r.apellidos, grado: r.puesto, best };
          out.replaceChildren(h('div', { class: 'reg-row' }, h('button', { class: 'btn sm', type: 'button', onclick: showTable }, '← Volver a la lista')), progressOf(st));
        };
        rows.forEach(r => tb.append(h('tr', null,
          h('td', { class: 'st-n' }, h('span', { class: 'ph', html: IC.user }), h('span', null, h('button', { class: 'st-link', type: 'button', title: 'Ver avances', onclick: () => showOne(r) }, [r.nombre, r.apellidos].filter(Boolean).join(' ') || 'Sin nombre'), h('small', null, r.puesto || ''), r.correo ? h('small', null, r.correo) : null)),
          ...[r.b1, r.b2, r.b3, r.ex, r.ru].map(p => h('td', { class: 'st-p' }, h('span', { class: 'rp-m' }, h('i', { style: `width:${+p || 0}%` })), h('b', null, (+p || 0) + '%'))),
          h('td', { class: 'st-c' }, h('span', { html: IC.star }), String(r.tarjetas || 0)),
          h('td', { class: 'st-d' }, r.actualizado ? new Date(r.actualizado).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : ''),
          h('td', null, h('button', { class: 'btn sm pink', type: 'button', 'aria-label': 'Eliminar a ' + [r.nombre, r.apellidos].filter(Boolean).join(' '), onclick: () => removeRemote(r) }, 'Eliminar')))));
        const table = h('div', { class: 'scroll-x' }, h('table', { class: 'rl-t' },
          h('thead', null, h('tr', null, ...['Estudiante', 'Básico 1', 'Básico 2', 'Básico 3', 'Extras', 'Ruleta', 'Tarjetas', 'Actualizado', ''].map(t => h('th', null, t)))), tb));
        showTable();
      } catch (e) { msg.textContent = 'No se pudo conectar con la hoja. Revisa tu conexión.'; }
    }
    load();
    return h('section', { class: 'tb' }, h('h3', null, 'Todos los estudiantes'),
      h('p', { class: 'reg-note' }, 'Aquí aparecen los nombres, los correos y los logros de todos los estudiantes registrados. Toca un nombre para ver sus avances.'),
      h('div', { class: 'reg-row' }, h('button', { class: 'btn sm', type: 'button', onclick: load }, 'Actualizar lista')), msg, ask, out);
  }
  function viewList() {
    const wrap = h('div', { class: 'reg-all' });
    wrap.append(CFG.url ? teacherBox() : h('p', { class: 'reg-warn' }, 'La lista de todos los estudiantes aún no está conectada a la hoja de cálculo (ver LEEME-PROFESORA.txt). Mientras tanto, esta lista muestra solo a los estudiantes de este navegador.'));
    if (!CFG.url) wrap.append(h('h3', { class: 'tb-h' }, 'En este navegador'), localList());
    return wrap;
  }

  /* ---------- arranque ---------- */
  function init() {
    openBtn = h('button', { class: 'reg-open', type: 'button', 'aria-label': 'Abrir el registro de estudiantes', onclick: () => openDlg(cur() ? 'avances' : 'registro') });
    document.body.append(openBtn); paintOpen();
  }
  window.Registro = { earn, score, open: openDlg };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
