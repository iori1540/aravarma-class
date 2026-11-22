/* Aravarma class · Registro de estudiantes en Google Sheets
   Pega este código en: Hoja de cálculo > Extensiones > Apps Script. */

const PIN = '1234';            // <-- CAMBIA ESTA CLAVE (solo la profesora la conoce)
const HOJA = 'Estudiantes';
const COLUMNAS = ['id', 'nombre', 'apellidos', 'puesto', 'correo', 'b1', 'b2', 'b3', 'ex', 'ru', 'tarjetas', 'palabras', 'actualizado', 'detalle'];

function hoja_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(HOJA);
  if (!s) {
    s = ss.insertSheet(HOJA);
    s.appendRow(COLUMNAS);
    s.setFrozenRows(1);
  }
  return s;
}

// Recibe el avance de un estudiante (lo envía la página)
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (!d.id || !d.nombre) return ContentService.createTextOutput('ignorado');
    d.actualizado = new Date().toISOString();
    const s = hoja_();
    const fila = COLUMNAS.map(c => d[c] === undefined ? '' : d[c]);
    const ids = s.getLastRow() > 1 ? s.getRange(2, 1, s.getLastRow() - 1, 1).getValues().map(r => r[0]) : [];
    const i = ids.indexOf(d.id);
    if (i >= 0) s.getRange(i + 2, 1, 1, COLUMNAS.length).setValues([fila]);
    else s.appendRow(fila);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

// Entrega la lista a la profesora (pide la clave)
function doGet(e) {
  const salida = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
  if (!e.parameter || e.parameter.pin !== PIN) return salida({ error: 'pin' });
  const s = hoja_();
  if (s.getLastRow() < 2) return salida({ rows: [] });
  const datos = s.getRange(2, 1, s.getLastRow() - 1, COLUMNAS.length).getValues();
  const rows = datos.map(f => { const o = {}; COLUMNAS.forEach((c, k) => { o[c] = f[k]; }); return o; });
  return salida({ rows: rows });
}
