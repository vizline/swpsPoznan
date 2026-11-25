/* =====================================================================
   SMOG – Badanie 1 (korelacyjne) – LOGIKA PROCEDURY
   Przebieg: zgoda → demografia → 5 kwestionariuszy w losowej kolejności
   (pozycje losowane w obrębie kwestionariusza, karuzela) → zapis → informacja końcowa.
   Parametry URL: PROLIFIC_PID, STUDY_ID, SESSION_ID (z Prolific), debug=1 (podgląd danych).
   ===================================================================== */
(function () {
  "use strict";

  const CFG = window.CONFIG;
  const C = window.CONTENT;
  const app = document.getElementById("app");
  const bar = document.getElementById("progress");
  const params = new URLSearchParams(location.search);
  const DEBUG = params.get("debug") === "1";

  /* ---------- rekord danych ---------- */
  const pid = params.get("PROLIFIC_PID");
  const D = {
    wersja: CFG.WERSJA,
    tryb: pid ? "prolific" : "test",
    prolific_pid: pid || ("TEST_" + Math.random().toString(36).slice(2, 10)),
    study_id: params.get("STUDY_ID") || "",
    session_id: params.get("SESSION_ID") || "",
    start_iso: new Date().toISOString()
  };
  const T0 = performance.now();
  const RT = {};      // czasy odpowiedzi na pozycje [ms]
  const ORDER = {};   // kolejność prezentacji pozycji

  /* ---------- narzędzia ---------- */
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sec = ms => Math.round(ms / 100) / 10;
  const r3 = x => (x == null || isNaN(x)) ? "" : Math.round(x * 1000) / 1000;
  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  const sum = a => a.reduce((s, x) => s + x, 0);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Formy zależne od płci: {kobieta|mężczyzna} lub {kobieta|mężczyzna|inna}
  let gender = null; // 1 = kobieta, 2 = mężczyzna, 3 = inna / wolę nie podawać
  const g = s => s.replace(/\{([^{}|]*)\|([^{}|]*)(?:\|([^{}|]*))?\}/g, (_, f, m, x) =>
    gender === 1 ? f : gender === 2 ? m : (x !== undefined ? x : f + "/" + m));

  function render(html) {
    app.innerHTML = `<div class="page"><div class="card">${html}</div></div>`;
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }

  /* ---------- postęp ---------- */
  const ORDER_Q = shuffle(Object.keys(C.questionnaires));
  D.kolejnosc_kwest = ORDER_Q.join(",");
  const totalSteps = 2 + ORDER_Q.reduce((s, k) => s + C.questionnaires[k].items.length + 1, 0);
  let step = 0;
  const tick = () => { step++; bar.style.width = Math.min(100, 100 * step / totalSteps) + "%"; };

  /* ================= 1. ZGODA ================= */
  function showConsent() {
    render(C.consent(esc(CFG.OPINIA_NR)) + `
      <div class="actions"><button class="btn" id="go">Rozpocznij badanie</button></div>`);
    const t = performance.now();
    document.getElementById("go").onclick = () => {
      D.t_zgoda = sec(performance.now() - t);
      tick();
      showDemographics();
    };
  }

  /* ================= 2. DEMOGRAFIA ================= */
  function showDemographics() {
    const radio = (name, opts) => `<div class="choices" role="radiogroup">` + opts.map(([v, l]) =>
      `<label class="choice"><input type="radio" name="${name}" value="${v}"> <span>${l}</span></label>`).join("") + `</div>`;
    render(`
      <h2>Kilka pytań o Pana/Panią</h2>
      <div class="field"><span class="label">Płeć</span>
        ${radio("plec", [[1, "kobieta"], [2, "mężczyzna"], [3, "inna / wolę nie podawać"]])}
        <div class="err" id="e_plec"></div></div>
      <div class="field"><label class="label" for="wiek">Wiek (w latach)</label>
        <input type="number" id="wiek" min="18" max="100" step="1" inputmode="numeric">
        <div class="err" id="e_wiek"></div></div>
      <div class="field"><label class="label" for="edu">Liczba lat formalnego kształcenia</label>
        <span class="hint">Szkoła podstawowa + szkoła średnia (np. liceum) + ukończone lata studiów</span>
        <input type="number" id="edu" min="0" max="30" step="1" inputmode="numeric">
        <div class="err" id="e_edu"></div></div>
      <div class="field"><span class="label">Miejsce zamieszkania</span>
        ${radio("miejsc", [[1, "wieś"], [2, "małe miasto (do 100 tys. mieszkańców)"], [3, "duże miasto (powyżej 100 tys. mieszkańców)"]])}
        <div class="err" id="e_miejsc"></div></div>
      <div class="actions"><button class="btn" id="go">Dalej</button></div>`);
    const t = performance.now();
    document.getElementById("go").onclick = () => {
      const val = n => { const el = document.querySelector(`input[name=${n}]:checked`); return el ? +el.value : null; };
      const int = id => { const v = document.getElementById(id).value.trim(); return /^\d+$/.test(v) ? +v : null; };
      const plec = val("plec"), miejsc = val("miejsc"), wiek = int("wiek"), edu = int("edu");
      const errs = {
        e_plec: plec ? "" : "Prosimy zaznaczyć odpowiedź.",
        e_wiek: (wiek !== null && wiek >= 18 && wiek <= 100) ? "" : "Prosimy wpisać wiek w latach (liczba od 18 do 100).",
        e_edu: (edu !== null && edu >= 0 && edu <= 30) ? "" : "Prosimy wpisać liczbę lat (od 0 do 30).",
        e_miejsc: miejsc ? "" : "Prosimy zaznaczyć odpowiedź."
      };
      Object.entries(errs).forEach(([k, v]) => document.getElementById(k).textContent = v);
      if (Object.values(errs).some(Boolean)) return;
      Object.assign(D, { plec, wiek, lata_edukacji: edu, miejscowosc: miejsc, t_demografia: sec(performance.now() - t) });
      gender = plec;
      tick();
      runQuestionnaire(0);
    };
  }

  /* ================= 3. KWESTIONARIUSZE (karuzela) ================= */
  function runQuestionnaire(qi) {
    if (qi >= ORDER_Q.length) return finish();
    const key = ORDER_Q[qi];
    const Q = C.questionnaires[key];
    const items = shuffle(Q.items);
    const answers = {};
    const binary = Q.scale.length === 2;
    ORDER[Q.code] = items.map(it => it[0]);
    let tItems0 = null;

    // ekran instrukcji
    render(`
      <div class="q-head"><span class="q-title">Część ${qi + 1} z ${ORDER_Q.length}</span></div>
      <h2>${g(Q.title)}</h2>
      <div class="instr-box">${g(Q.instruction)}</div>
      <p class="small" style="margin-top:14px">Pytania będą pojawiać się pojedynczo. Po zaznaczeniu odpowiedzi automatycznie wyświetli się kolejne pytanie. Do poprzedniego pytania można wrócić przyciskiem „Wstecz”.</p>
      <div class="actions"><button class="btn" id="go">Rozpocznij</button></div>`);
    const tInstr = performance.now();
    document.getElementById("go").onclick = () => {
      D["t_" + Q.code + "_instr"] = sec(performance.now() - tInstr);
      tick();
      tItems0 = performance.now();
      showItem(0);
    };

    function showItem(i) {
      const [n, text] = items[i];
      const isAttn = n === "attn";
      const cur = answers[n];
      const prompt = g(Q.prompt);
      render(`
        <div class="q-head"><span class="q-title">${g(Q.title)}</span><span class="q-count">${i + 1} / ${items.length}</span></div>
        ${prompt ? `<p class="q-prompt">${prompt}</p>` : ""}
        <p class="q-item${isAttn ? " attn" : ""}">${g(text)}</p>
        <div class="opts${binary ? " binary" : ""}" style="--n:${Q.scale.length}" role="radiogroup">
          ${Q.scale.map(([v, l], k) => `<button type="button" class="opt${cur === v ? " sel" : ""}" data-v="${v}" role="radio" aria-checked="${cur === v}">
              ${binary ? "" : `<span class="num">${k + 1}</span>`}<span>${g(l)}</span></button>`).join("")}
        </div>
        <div class="actions split">
          <button class="btn ghost" id="back">← Wstecz</button>
          ${cur !== undefined ? `<button class="btn" id="next">Dalej</button>` : `<span></span>`}
        </div>`);
      const tShow = performance.now();
      const optsEl = app.querySelector(".opts");

      const choose = v => {
        if (answers[n] === undefined) tick();
        answers[n] = v;
        RT[Q.code + "_" + n] = Math.round(performance.now() - tShow);
        optsEl.querySelectorAll(".opt").forEach(b => { const on = +b.dataset.v === v; b.classList.toggle("sel", on); b.setAttribute("aria-checked", on); });
        optsEl.classList.add("locked");
        document.removeEventListener("keydown", onKey);
        setTimeout(advance, 280);
      };
      const advance = () => {
        document.removeEventListener("keydown", onKey);
        if (i + 1 < items.length) showItem(i + 1);
        else doneQuestionnaire();
      };
      const onKey = e => {
        const k = parseInt(e.key, 10);
        if (k >= 1 && k <= Q.scale.length) choose(Q.scale[k - 1][0]);
      };
      optsEl.querySelectorAll(".opt").forEach(b => b.onclick = () => choose(+b.dataset.v));
      document.addEventListener("keydown", onKey);
      document.getElementById("back").onclick = () => {
        document.removeEventListener("keydown", onKey);
        if (i > 0) showItem(i - 1);
      };
      document.getElementById("back").disabled = i === 0;
      const nx = document.getElementById("next");
      if (nx) nx.onclick = advance;
    }

    function doneQuestionnaire() {
      D["t_" + Q.code] = sec(performance.now() - tItems0);
      Q.items.forEach(([n]) => { D[Q.code + "_" + n] = answers[n]; });
      runQuestionnaire(qi + 1);
    }
  }

  /* ================= 4. WSKAŹNIKI ================= */
  function computeScores() {
    const v = (p, n) => D[p + "_" + n];
    // PVQ-21 – wg składni z pliku PVQ-21 (odwrócenie 7 − x, centrowanie względem mrat)
    const pr = {}; for (let n = 1; n <= 21; n++) pr[n] = 7 - v("pvq", n);
    const mrat = mean(Object.values(pr));
    const val = idx => mean(idx.map(n => pr[n])) - mrat;
    const S = {
      bezpieczenstwo: val([5, 14]), przystosowanie: val([7, 16]), tradycja: val([9, 20]),
      zyczliwosc: val([12, 18]), uniwersalizm: val([3, 8, 19]), kierowanieSoba: val([1, 11]),
      stymulacja: val([6, 15]), hedonizm: val([10, 21]), osiagniecia: val([4, 13]), wladza: val([2, 17])
    };
    D.sc_pvq_mrat = r3(mrat);
    Object.entries(S).forEach(([k, x]) => D["sc_pvq_" + k] = r3(x));
    D.sc_pvq_SelfTranscendence = r3(mean([S.zyczliwosc, S.uniwersalizm]));
    D.sc_pvq_SelfEnhancement = r3(mean([S.osiagniecia, S.wladza]));
    D.sc_pvq_OpennessToChange = r3(mean([S.kierowanieSoba, S.stymulacja, S.hedonizm]));
    D.sc_pvq_Conservation = r3(mean([S.bezpieczenstwo, S.przystosowanie, S.tradycja]));

    // SPSRQ-SF (21): sumy odpowiedzi TAK
    D.sc_spsrq_SP = sum([2, 3, 7, 8, 10, 12, 14, 16, 17, 19, 20, 21, 23].map(n => v("spsrq", n)));
    D.sc_spsrq_SR = sum([4, 5, 9, 13, 15, 18, 22, 24].map(n => v("spsrq", n)));

    // REI-24: sumy (pozycje odwrócone: 6 − x)
    const rei = (list) => sum(list.map(s => s.endsWith("r") ? 6 - v("rei", parseInt(s)) : v("rei", parseInt(s))));
    D.sc_rei_RA = rei(["1", "5r", "9", "13r", "19", "23r"]);
    D.sc_rei_RF = rei(["2r", "6", "15", "18r", "22", "24r"]);
    D.sc_rei_EA = rei(["3", "7r", "10", "12r", "16", "20r"]);
    D.sc_rei_EF = rei(["4r", "8", "11r", "14", "17r", "21"]);
    D.sc_rei_racjonalnosc = D.sc_rei_RA + D.sc_rei_RF;
    D.sc_rei_doswiadczeniowosc = D.sc_rei_EA + D.sc_rei_EF;

    // SZZP-10: średnie (odwrócone 5 i 10: 7 − x)
    const sz = n => (n === 5 || n === 10) ? 7 - v("szzp", n) : v("szzp", n);
    D.sc_szzp_afekt = r3(mean([1, 2, 3, 4, 5].map(sz)));
    D.sc_szzp_zachowania = r3(mean([6, 7, 8, 9, 10].map(sz)));
    D.sc_szzp_ogolny = r3(mean([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(sz)));
    D.uwaga_ok = D.szzp_attn === 3 ? 1 : 0;

    // Moduł działań: średnia z 14 pozycji
    D.sc_dzial_srednia = r3(mean(Array.from({ length: 14 }, (_, k) => v("dzial", k + 1))));
  }

  /* ================= 5. ZAPIS I ZAKOŃCZENIE ================= */
  async function finish() {
    bar.style.width = "100%";
    D.end_iso = new Date().toISOString();
    D.t_calkowity = sec(performance.now() - T0);
    computeScores();
    D.kolejnosc_pozycji = JSON.stringify(ORDER);
    D.czasy_pozycji_ms = JSON.stringify(RT);
    D.token = CFG.TOKEN;

    if (!CFG.ENDPOINT) return showDebrief({ offline: true });

    render(`<div class="center"><div class="spinner"></div><p>Zapisywanie odpowiedzi…</p></div>`);
    let ok = false, info = "";
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        const res = await fetch(CFG.ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(D) });
        const js = await res.json();
        ok = !!js.ok; info = js.error || "";
      } catch (e) { info = String(e); }
      if (!ok) await new Promise(r => setTimeout(r, 1500 * attempt));
    }
    if (ok) {
      try { localStorage.removeItem("smogB1_backup"); } catch (e) {}
      showDebrief({});
    } else {
      try { localStorage.setItem("smogB1_backup", JSON.stringify(D)); } catch (e) {}
      render(`<h2>Nie udało się zapisać odpowiedzi</h2>
        <p>Wystąpił problem z połączeniem. Prosimy sprawdzić połączenie z Internetem i spróbować ponownie.</p>
        <div class="actions"><button class="btn" id="retry">Spróbuj ponownie</button></div>
        <p class="small">Jeśli problem się powtarza, prosimy o wiadomość przez Prolific lub na adres <a href="mailto:mkoscielniak@swps.edu.pl">mkoscielniak@swps.edu.pl</a>.</p>
        ${DEBUG ? `<pre class="small">${esc(info)}</pre>` : ""}`);
      document.getElementById("retry").onclick = finish;
    }
  }

  function showDebrief({ offline }) {
    const back = CFG.PROLIFIC_COMPLETION_URL
      ? `<div class="actions"><a class="btn" href="${esc(CFG.PROLIFIC_COMPLETION_URL)}" style="text-decoration:none">Wróć do Prolific, aby zakończyć badanie</a></div>` : "";
    const dbg = (offline || DEBUG) ? `
      <div class="debug">
        ${offline ? `<div class="notice">Tryb testowy: adres zapisu (ENDPOINT) nie jest ustawiony w <code>config.js</code>, więc dane nie zostały nigdzie wysłane.</div>` : ""}
        <button class="btn ghost" id="dl">Pobierz dane (JSON)</button>
        <pre id="dump"></pre>
      </div>` : "";
    render(C.debrief + back + dbg);
    if (offline || DEBUG) {
      const shown = Object.assign({}, D); delete shown.token;
      document.getElementById("dump").textContent = JSON.stringify(shown, null, 2);
      document.getElementById("dl").onclick = () => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([JSON.stringify(shown, null, 2)], { type: "application/json" }));
        a.download = "smogB1_" + shown.prolific_pid + ".json"; a.click();
      };
    }
  }

  // Ostrzeżenie przed przypadkowym zamknięciem w trakcie badania
  window.addEventListener("beforeunload", e => { if (!D.end_iso && step > 0) { e.preventDefault(); e.returnValue = ""; } });

  showConsent();
})();
