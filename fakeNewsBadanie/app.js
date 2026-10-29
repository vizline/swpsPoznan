/*
 * Badanie: ocena prawdziwości komunikatów z podpowiedzią AI (paradygmat judge–advisor)
 *
 * Komunikaty i podpowiedzi są pobierane na żywo z arkusza Google:
 *   kolumna A – treść komunikatu
 *   kolumna B – podpowiedź w wersji racjonalnej
 *   kolumna C – podpowiedź w wersji emocjonalnej
 *   wiersz 1 – nagłówki (pomijany), dane od wiersza 2 do ostatniego niepustego.
 *
 * Parametry adresu (opcjonalne):
 *   ?warunek=R lub ?warunek=E – wstępnie zaznacza warunek
 *   ?test=1 – skraca animacje (do szybkiego przeklikania)
 */
(function () {
  "use strict";

  const SHEET_ID = "1DsBNzxLkP-DNDBAgGL3CglHB46jZOBa7iV9BkA_iP4w";
  const SHEET_URLS = [
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&headers=0&range=A2:C500`,
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`,
  ];

  const params = new URLSearchParams(location.search);
  const FAST = params.get("test") === "1";
  const TIMING = FAST
    ? { thinkMin: 200, thinkMax: 300, perWord: 8 }
    : { thinkMin: 1800, thinkMax: 2800, perWord: 55 };

  const CONDITION_LABEL = { R: "racjonalny", E: "emocjonalny" };

  // ---------- elementy ----------
  const $ = (id) => document.getElementById(id);
  const screens = {
    consent: $("screen-consent"),
    instruction: $("screen-instruction"),
    trial: $("screen-trial"),
    summary: $("screen-summary"),
    error: $("screen-error"),
  };
  const el = {
    consentCheck: $("consent-check"),
    consentNext: $("consent-next"),
    startBtn: $("instruction-start"),
    loadStatus: $("load-status"),
    progressLabel: $("trial-progress"),
    progressBar: $("progress-bar"),
    newsText: $("news-text"),
    aiIdle: $("ai-idle"),
    aiThinking: $("ai-thinking"),
    aiText: $("ai-text"),
    response: document.querySelector(".response"),
    responsePrompt: $("response-prompt"),
    slider: $("slider"),
    sliderValue: $("slider-value"),
    sliderHint: $("slider-hint"),
    submitBtn: $("submit-btn"),
    summaryBody: $("summary-body"),
    summaryCondition: $("summary-condition"),
    downloadCsv: $("download-csv"),
    errorText: $("error-text"),
  };

  // ---------- stan ----------
  const state = {
    items: null, // [{news, R, E, sheetRow}]
    condition: null, // "R" | "E"
    order: [],
    idx: 0,
    phase: "initial", // "initial" | "advice" | "final"
    touched: false,
    initial: null,
    tShown: 0,
    tAdviceDone: 0,
    results: [],
  };

  // ---------- nawigacja między ekranami ----------
  function show(name) {
    Object.entries(screens).forEach(([key, node]) => (node.hidden = key !== name));
    window.scrollTo(0, 0);
  }

  function fail(message) {
    el.errorText.textContent = message;
    show("error");
  }

  // ---------- 1. zgoda ----------
  el.consentCheck.addEventListener("change", () => {
    el.consentNext.hidden = !el.consentCheck.checked;
  });
  el.consentNext.addEventListener("click", () => show("instruction"));

  // ---------- 2. instrukcja + wczytanie danych ----------
  const preset = (params.get("warunek") || "").toUpperCase();
  if (preset === "R" || preset === "E") {
    document.querySelector(`input[name="condition"][value="${preset}"]`).checked = true;
    state.condition = preset;
  }
  document.querySelectorAll('input[name="condition"]').forEach((radio) =>
    radio.addEventListener("change", (e) => {
      state.condition = e.target.value;
      updateStartButton();
    })
  );

  function updateStartButton() {
    el.startBtn.disabled = !(state.items && state.items.length && state.condition);
  }

  el.startBtn.addEventListener("click", () => {
    state.order = shuffle(state.items.slice());
    state.idx = 0;
    state.results = [];
    show("trial");
    startTrial();
  });

  async function loadItems() {
    el.loadStatus.textContent = "Wczytywanie komunikatów…";
    let lastError = null;
    for (const url of SHEET_URLS) {
      try {
        const res = await fetch(url + (url.includes("?") ? "&" : "?") + "_=" + Date.now(), { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const text = await res.text();
        if (/^\s*</.test(text)) throw new Error("Arkusz zwrócił stronę HTML zamiast danych (czy jest udostępniony?)");
        const items = parseItems(parseCsv(text));
        if (!items.length) throw new Error("Brak komunikatów w arkuszu");
        state.items = items;
        el.loadStatus.textContent = `Wczytano komunikatów: ${items.length}.`;
        updateStartButton();
        return;
      } catch (err) {
        lastError = err;
        console.warn("Nie udało się wczytać z", url, err);
      }
    }
    el.loadStatus.textContent = "";
    fail("Nie udało się wczytać komunikatów z arkusza. " + (lastError ? "(" + lastError.message + ")" : ""));
  }

  function parseItems(rows) {
    const items = [];
    rows.forEach((row, i) => {
      const news = (row[0] || "").trim();
      const R = (row[1] || "").trim();
      const E = (row[2] || "").trim();
      if (!news) return;
      if (/^news$/i.test(news) && /racjonaln/i.test(R)) return; // wiersz nagłówków (gdyby został zwrócony)
      if (!R || !E) console.warn("Brak podpowiedzi w wierszu z komunikatem:", news);
      items.push({ news, R, E });
    });
    return items;
  }

  // prosty parser CSV (obsługuje cudzysłowy, przecinki i nowe linie w komórkach)
  function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else field += c;
      } else if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); rows.push(row); row = []; field = "";
      } else field += c;
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ---------- 3. próba ----------
  function startTrial() {
    const item = state.order[state.idx];
    const n = state.order.length;
    el.progressLabel.textContent = `Komunikat ${state.idx + 1} z ${n}`;
    el.progressBar.style.width = `${(state.idx / n) * 100}%`;
    el.newsText.textContent = item.news;

    el.aiIdle.hidden = false;
    el.aiThinking.hidden = true;
    el.aiText.hidden = true;
    el.aiText.textContent = "";
    el.aiText.classList.remove("typing");

    state.phase = "initial";
    state.initial = null;
    resetSlider();
    el.response.classList.remove("revise");
    el.responsePrompt.textContent = "Jak oceniasz prawdziwość tego komunikatu?";
    el.sliderHint.textContent = "Przesuń lub kliknij suwak, aby zaznaczyć odpowiedź.";
    el.submitBtn.textContent = "Zatwierdź swoją odpowiedź";
    el.submitBtn.disabled = true;
    state.tShown = performance.now();
  }

  function resetSlider() {
    state.touched = false;
    el.slider.disabled = false;
    el.slider.value = 50;
    el.slider.classList.add("untouched");
    el.sliderValue.textContent = "–";
  }

  function onSliderUse() {
    if (state.phase === "advice" || el.slider.disabled) return;
    state.touched = true;
    el.slider.classList.remove("untouched");
    el.sliderValue.textContent = el.slider.value + "%";
    el.submitBtn.disabled = false;
    if (state.phase === "initial") el.sliderHint.textContent = "";
  }
  ["input", "change", "pointerdown"].forEach((ev) => el.slider.addEventListener(ev, () => requestAnimationFrame(onSliderUse)));

  el.submitBtn.addEventListener("click", () => {
    if (!state.touched) return;
    if (state.phase === "initial") submitInitial();
    else if (state.phase === "final") submitFinal();
  });

  function submitInitial() {
    state.initial = Number(el.slider.value);
    state.rtInitial = Math.round(performance.now() - state.tShown);
    state.phase = "advice";
    el.slider.disabled = true;
    el.submitBtn.disabled = true;
    el.sliderHint.textContent = "Twoja odpowiedź została zapisana. Poczekaj na analizę asystenta AI.";
    showAdvice(state.order[state.idx][state.condition]);
  }

  function showAdvice(text) {
    el.aiIdle.hidden = true;
    el.aiThinking.hidden = false;
    const think = TIMING.thinkMin + Math.random() * (TIMING.thinkMax - TIMING.thinkMin);
    setTimeout(() => {
      el.aiThinking.hidden = true;
      el.aiText.hidden = false;
      el.aiText.classList.add("typing");
      const words = text.split(/(\s+)/); // zachowuje odstępy
      let i = 0;
      const step = () => {
        if (i >= words.length) {
          el.aiText.classList.remove("typing");
          adviceDone();
          return;
        }
        el.aiText.textContent += words[i] + (words[i + 1] || "");
        i += 2;
        setTimeout(step, TIMING.perWord * (0.6 + Math.random() * 0.8));
      };
      step();
    }, think);
  }

  function adviceDone() {
    state.phase = "final";
    state.tAdviceDone = performance.now();
    el.response.classList.add("revise");
    el.responsePrompt.textContent =
      `Możesz teraz zmienić swoje wcześniejsze oszacowanie. Na suwaku zaznaczona jest Twoja pierwsza odpowiedź (${state.initial}%) – ` +
      "skoryguj ją lub pozostaw bez zmian i zatwierdź.";
    el.sliderHint.textContent = "";
    el.slider.disabled = false;
    el.slider.value = state.initial;
    el.slider.classList.remove("untouched");
    el.sliderValue.textContent = state.initial + "%";
    state.touched = true;
    el.submitBtn.textContent = "Potwierdzam ostateczną wartość oszacowania";
    el.submitBtn.disabled = false;
  }

  function submitFinal() {
    const item = state.order[state.idx];
    const final = Number(el.slider.value);
    state.results.push({
      position: state.idx + 1,
      news: item.news,
      initial: state.initial,
      final,
      change: final - state.initial,
      rtInitial: state.rtInitial,
      rtFinal: Math.round(performance.now() - state.tAdviceDone),
    });
    state.idx += 1;
    if (state.idx < state.order.length) startTrial();
    else showSummary();
  }

  // ---------- 4. podsumowanie ----------
  function showSummary() {
    el.progressBar.style.width = "100%";
    el.summaryCondition.textContent = `Warunek: ${CONDITION_LABEL[state.condition]}.`;
    el.summaryBody.textContent = "";
    state.results.forEach((r) => {
      const tr = document.createElement("tr");
      const cells = [
        [r.position, "num"],
        [r.news, ""],
        [r.initial + "%", "num"],
        [r.final + "%", "num"],
        [(r.change > 0 ? "+" : "") + r.change, "num " + (r.change > 0 ? "pos" : r.change < 0 ? "neg" : "")],
      ];
      cells.forEach(([value, cls]) => {
        const td = document.createElement("td");
        td.textContent = value;
        if (cls) td.className = cls;
        tr.appendChild(td);
      });
      el.summaryBody.appendChild(tr);
    });
    show("summary");
  }

  el.downloadCsv.addEventListener("click", () => {
    const header = ["kolejnosc", "warunek", "komunikat", "oszacowanie_pierwotne", "oszacowanie_skorygowane", "zmiana", "czas_pierwszej_odp_ms", "czas_drugiej_odp_ms"];
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [header.join(";")].concat(
      state.results.map((r) =>
        [r.position, state.condition, esc(r.news), r.initial, r.final, r.change, r.rtInitial, r.rtFinal].join(";")
      )
    );
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "wyniki_test.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  // ---------- start ----------
  show("consent");
  loadItems();
})();
