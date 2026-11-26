/**
 * SMOG – Badanie 1 – zapis danych do Google Sheets (Google Apps Script)
 *
 * Każde ukończone badanie = 1 wiersz w karcie „dane”.
 * Identyfikator Prolific jest oddzielany od odpowiedzi: w „dane” zostaje tylko
 * losowy kod uczestnika, a para (kod ↔ PROLIFIC_PID) trafia do karty „id_prolific”
 * – albo, jeśli ustawisz ID_SPREADSHEET_ID, do osobnego arkusza (zalecane).
 *
 * Instrukcja wdrożenia: README.md w tym samym katalogu.
 */

// ===== USTAWIENIA =====
const TOKEN = "smogB1-de3b287e0354d4ca";   // ten sam ciąg co CONFIG.TOKEN w config.js
const SHEET_DATA = "dane";
const SHEET_IDS = "id_prolific";
const ID_SPREADSHEET_ID = "";          // opcjonalnie: ID osobnego arkusza na identyfikatory Prolific

// Pola, które NIE mogą trafić do karty z odpowiedziami
const ID_FIELDS = ["prolific_pid", "study_id", "session_id"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const d = JSON.parse(e.postData.contents);
    if (d.token !== TOKEN) return json_({ ok: false, error: "bad token" });
    delete d.token;

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const idSS = ID_SPREADSHEET_ID ? SpreadsheetApp.openById(ID_SPREADSHEET_ID) : ss;
    const idSheet = getSheet_(idSS, SHEET_IDS, ["kod", "prolific_pid", "study_id", "session_id", "zapis_serwer"]);

    // Czy ten PROLIFIC_PID już wcześniej zapisał dane?
    const pid = String(d.prolific_pid || "");
    const lastId = idSheet.getLastRow();
    const known = lastId > 1 ? idSheet.getRange(2, 2, lastId - 1, 1).getValues().flat().map(String) : [];
    const duplikat = pid && known.indexOf(pid) !== -1 ? 1 : 0;

    const kod = Utilities.getUuid().replace(/-/g, "").slice(0, 10);
    const now = new Date();
    idSheet.appendRow([kod, pid, d.study_id || "", d.session_id || "", now]);

    const row = { kod: kod, zapis_serwer: now, duplikat: duplikat };
    Object.keys(d).forEach(function (k) { if (ID_FIELDS.indexOf(k) === -1) row[k] = d[k]; });
    appendObject_(getSheet_(ss, SHEET_DATA, ["kod", "zapis_serwer", "duplikat"]), row);

    return json_({ ok: true, kod: kod });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

// Test w przeglądarce: otwarcie adresu /exec powinno zwrócić {"ok":true,"status":"dziala"}
function doGet() {
  return json_({ ok: true, status: "dziala" });
}

// Dopisuje wiersz; nowe klucze dodaje jako nowe kolumny na końcu nagłówka.
function appendObject_(sheet, obj) {
  const lastCol = sheet.getLastColumn();
  let header = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
  const missing = Object.keys(obj).filter(function (k) { return header.indexOf(k) === -1; });
  if (missing.length) {
    sheet.getRange(1, header.length + 1, 1, missing.length).setValues([missing]);
    header = header.concat(missing);
  }
  sheet.appendRow(header.map(function (h) { return obj[h] === undefined ? "" : obj[h]; }));
}

function getSheet_(ss, name, header) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, header.length).setValues([header]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Uruchom ręcznie z edytora (Uruchom → testZapisu), aby sprawdzić uprawnienia i karty.
function testZapisu() {
  const res = doPost({ postData: { contents: JSON.stringify({ token: TOKEN, prolific_pid: "TEST_edytor", wersja: "test", plec: 1 }) } });
  Logger.log(res.getContent());
}
