/* =====================================================================
   BARNUM / ADHD STUDY — study logic
   Flow: consent → instruction (+condition) → video 1 → Q → article → Q
         → video 2 → Q → state ADHD (slider carousel) → CSS-12 (carousel)
         → suspicion probe → debriefing → thank you
   Responses are collected in the object `D` (not saved anywhere yet).
   Add ?debug=1 to the URL to get skip buttons and to see the data at the end.
   ===================================================================== */
(function () {
  "use strict";

  const S = window.STUDY;
  const app = document.getElementById("app");
  const progressFill = document.getElementById("progressFill");
  const params = new URLSearchParams(location.search);
  const DEBUG = params.has("debug");

  /* ---------- data record ---------- */
  const D = {
    sessionId: makeId(),
    startedAt: new Date().toISOString(),
    urlParams: Object.fromEntries(params.entries()),
    userAgent: navigator.userAgent,
    viewport: { w: window.innerWidth, h: window.innerHeight },
    condition: null,
    conditionAssignment: null,   // "manual" | "random" | "url"
    consentAt: null,
    timings: {},                 // ms spent on each page
    media: {},                   // video playback / reading info
    selfId: {},                  // video1, article, video2  (1–5)
    stateAdhd: {}, stateAdhdOrder: [],
    css12: {}, css12Order: [],
    suspicion: null,
    withdraw: false,
    finishedAt: null
  };
  window.studyData = D; // handy for piloting from the console

  /* ---------- condition ---------- */
  const urlCond = (params.get("cond") || "").toLowerCase();
  if (urlCond === "self" || urlCond === "neutral") {
    setCondition(urlCond, "url");
  } else if (S.settings.conditionMode === "random") {
    setCondition(randInt(2) === 0 ? "self" : "neutral", "random");
  }

  function setCondition(c, how) {
    D.condition = c;
    D.conditionAssignment = how;
    const v = S.settings.videos[c];
    preload(v.v1);
    preload(v.v2);
  }

  /* ---------- video preloading (whole file → blob URL) ---------- */
  const cache = {};
  function preload(url) {
    if (cache[url]) return cache[url];
    const rec = { url, progress: 0, ready: false, error: null, blobUrl: null, started: performance.now(), listeners: new Set() };
    const notify = () => rec.listeners.forEach(fn => fn(rec));
    rec.promise = (async () => {
      try {
        const res = await fetch(url, { cache: "force-cache" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const total = Number(res.headers.get("Content-Length")) || 0;
        let blob;
        if (res.body && res.body.getReader) {
          const reader = res.body.getReader();
          const chunks = []; let got = 0;
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value); got += value.length;
            rec.progress = total ? got / total : -1;
            notify();
          }
          blob = new Blob(chunks, { type: res.headers.get("Content-Type") || "video/mp4" });
        } else {
          blob = await res.blob();
        }
        rec.blobUrl = URL.createObjectURL(blob);
        rec.progress = 1; rec.ready = true;
        rec.loadMs = Math.round(performance.now() - rec.started);
      } catch (e) {
        rec.error = e.message || String(e);
      }
      notify();
      return rec;
    })();
    return rec;
  }

  /* ---------- flow ---------- */
  const steps = [
    consentPage,
    instructionPage,
    () => videoPage("video1", "v1", 1),
    () => selfIdPage("video1", "video", "After video 1"),
    articlePage,
    () => selfIdPage("article", "article", "After the article"),
    () => videoPage("video2", "v2", 2),
    () => selfIdPage("video2", "video", "After video 2"),
    stateIntroPage,
    stateCarousel,
    cssIntroPage,
    cssCarousel,
    suspicionPage,
    debriefPage,
    thankYouPage
  ];
  let stepIdx = -1;
  let stepStart = 0;
  let cleanup = null;

  function next() {
    if (stepIdx >= 0) {
      D.timings[stepKey(stepIdx)] = Math.round(performance.now() - stepStart);
    }
    if (cleanup) { cleanup(); cleanup = null; }
    stepIdx++;
    stepStart = performance.now();
    progressFill.style.width = Math.round(stepIdx / (steps.length - 1) * 100) + "%";
    app.innerHTML = "";
    window.scrollTo(0, 0);
    steps[stepIdx]();
    app.focus({ preventScroll: true });
  }
  const stepKeys = ["consent", "instruction", "video1", "q_video1", "article", "q_article", "video2", "q_video2",
                    "stateIntro", "stateItems", "cssIntro", "cssItems", "suspicion", "debrief", "thanks"];
  const stepKey = i => stepKeys[i] || "step" + i;

  window.addEventListener("beforeunload", e => {
    if (stepIdx > 0 && stepIdx < steps.length - 1) { e.preventDefault(); e.returnValue = ""; }
  });

  /* ================= pages ================= */

  function consentPage() {
    const page = textPage(S.consent.title, S.consent.html);
    const label = el("label", { class: "consent-check" });
    const cb = el("input", { type: "checkbox", id: "consentCb" });
    label.append(cb, el("span", { html: S.consent.checkbox }));
    page.card.append(label);
    const actions = el("div", { class: "actions" });
    page.card.append(actions);
    const btn = button("Next", () => { D.consentAt = new Date().toISOString(); next(); });
    cb.addEventListener("change", () => {
      actions.innerHTML = "";
      if (cb.checked) { btn.classList.add("reveal"); actions.append(btn); }
    });
  }

  function instructionPage() {
    const page = textPage(S.instruction.title, S.instruction.html);
    const btn = button("Start", () => next());
    if (!D.condition) {
      // pilot: manual choice
      const box = el("div", { class: "pilot-box" });
      box.append(el("div", { class: "tag", text: "Pilot mode – choose the condition" }));
      [["self", "Self-related (version A)"], ["neutral", "Neutral (version B)"]].forEach(([val, txt]) => {
        const lab = el("label");
        const r = el("input", { type: "radio", name: "cond", value: val });
        r.addEventListener("change", () => { setCondition(val, "manual"); btn.disabled = false; });
        lab.append(r, document.createTextNode(txt));
        box.append(lab);
      });
      page.card.append(box);
      btn.disabled = true;
    }
    page.card.append(el("div", { class: "actions" }, btn));
  }

  function videoPage(key, which, n) {
    const url = S.settings.videos[D.condition][which];
    const rec = preload(url);
    const info = D.media[key] = { file: url, interruptions: 0, seekBlocked: 0 };

    const stage = el("section", { class: "stage" });
    stage.append(el("div", { class: "stage-label", html: `Video ${n} of 2 <span class="sound">· sound on 🔊</span>` }));
    const { phone, screen } = phoneShell();
    const video = el("video", { playsinline: "", "webkit-playsinline": "", preload: "auto", disablepictureinpicture: "", controlslist: "nodownload noplaybackrate noremoteplayback" });
    video.addEventListener("contextmenu", e => e.preventDefault());
    const overlay = el("div", { class: "overlay" });
    screen.append(video, overlay);
    stage.append(phone);
    const nextBtn = button("Next", () => next());
    nextBtn.classList.add("hidden");
    const actions = el("div", { class: "actions" }, nextBtn);
    stage.append(actions);
    app.append(stage);

    // loading state
    const loadbar = el("div", { class: "loadbar" }, el("div"));
    const loadText = el("p", { text: "Loading video…" });
    overlay.append(el("div", { class: "spinner" }), loadText, loadbar);
    const onProgress = r => {
      if (r.progress >= 0) { loadbar.firstChild.style.width = Math.round(r.progress * 100) + "%"; loadText.textContent = `Loading video… ${Math.round(r.progress * 100)}%`; }
    };
    rec.listeners.add(onProgress); onProgress(rec);
    cleanup = () => rec.listeners.delete(onProgress);

    let lastTime = 0, ended = false, started = false;

    rec.promise.then(r => {
      if (!document.body.contains(stage)) return;
      if (r.error) return showError(r.error);
      info.loadMs = r.loadMs;
      video.src = r.blobUrl;
      video.addEventListener("loadedmetadata", () => {
        info.duration = Math.round(video.duration * 10) / 10;
        showPlay("Tap to play the video", "It will play once, from beginning to end.");
      }, { once: true });
      video.addEventListener("error", () => showError("media error"), { once: true });
    });

    function showPlay(msg, small) {
      overlay.innerHTML = "";
      const play = el("button", { class: "play", "aria-label": "Play video", html: '<svg viewBox="0 0 24 24"><path d="M6 4l15 8-15 8z"/></svg>' });
      play.addEventListener("click", () => {
        video.play().then(() => {
          overlay.classList.add("gone");
          if (!started) { started = true; info.startedAt = new Date().toISOString(); }
        }).catch(err => { overlay.querySelector(".small") && (overlay.querySelector(".small").textContent = "Playback was blocked – please tap again."); });
      });
      overlay.append(play, el("p", { text: msg }));
      if (small) overlay.append(el("p", { class: "small", text: small }));
      overlay.classList.remove("gone");
      play.focus({ preventScroll: true });
    }
    function showError(msg) {
      info.error = msg;
      overlay.innerHTML = "";
      overlay.append(el("p", { text: "The video could not be loaded." }),
                     el("p", { class: "small", text: "Please check your internet connection and reload the page." }));
      overlay.classList.remove("gone");
      if (DEBUG) { nextBtn.classList.remove("hidden"); }
    }

    video.addEventListener("timeupdate", () => { if (!video.seeking && video.currentTime > lastTime) lastTime = video.currentTime; });
    video.addEventListener("seeking", () => {
      if (Math.abs(video.currentTime - lastTime) > 0.75 && !ended) { info.seekBlocked++; video.currentTime = lastTime; }
    });
    video.addEventListener("pause", () => {
      if (ended || video.ended || !started) return;
      info.interruptions++;
      showPlay("The video was paused", "Tap to continue watching.");
    });
    video.addEventListener("ended", () => {
      ended = true;
      info.endedAt = new Date().toISOString();
      overlay.innerHTML = "";
      overlay.append(el("p", { html: "✓ Video finished" }), el("p", { class: "small", text: "Please click “Next” to continue." }));
      overlay.classList.remove("gone");
      nextBtn.classList.remove("hidden"); nextBtn.classList.add("reveal");
      nextBtn.focus({ preventScroll: true });
    });

    if (DEBUG) debugSkip(() => { info.skippedInDebug = true; next(); });
  }

  function articlePage() {
    const A = S.article;
    const paras = A[D.condition];
    const info = D.media.article = { version: D.condition, scrolledToEndMs: null };
    const t0 = performance.now();

    const stage = el("section", { class: "stage" });
    stage.append(el("div", { class: "stage-label", text: "Short article" }));
    const { phone, screen } = phoneShell();
    screen.classList.add("article");
    const scroller = el("div", { class: "article-scroll" });
    scroller.append(
      el("div", { class: "art-kicker", text: A.kicker }),
      el("h2", { class: "art-title", text: A.title }),
      el("div", { class: "art-meta", text: "1 min read" }),
      el("div", { class: "art-body" }, ...paras.map(p => el("p", { text: p }))),
      el("div", { class: "art-end", text: "• • •" })
    );
    screen.append(el("div", { class: "art-bar" }), scroller);
    stage.append(phone);
    const nextBtn = button("Next", () => { info.readingMs = Math.round(performance.now() - t0); next(); });
    nextBtn.disabled = true;
    const hint = el("div", { class: "hint", text: "Please read the whole article (scroll down inside the phone)." });
    stage.append(el("div", { class: "actions" }, nextBtn), hint);
    app.append(stage);

    let timeOk = false, scrollOk = false;
    const check = () => {
      if (timeOk && scrollOk && nextBtn.disabled) { nextBtn.disabled = false; hint.textContent = ""; }
    };
    const atEnd = () => scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 12;
    const onScroll = () => {
      if (!scrollOk && atEnd()) { scrollOk = true; info.scrolledToEndMs = Math.round(performance.now() - t0); check(); }
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    requestAnimationFrame(onScroll); // text may fit without scrolling
    const timer = setTimeout(() => { timeOk = true; check(); }, S.settings.minReadingSeconds * 1000);
    cleanup = () => clearTimeout(timer);

    if (DEBUG) debugSkip(() => { info.skippedInDebug = true; next(); });
  }

  function selfIdPage(key, kind, kicker) {
    const page = textPage(null, "");
    page.card.append(el("div", { class: "q-kicker", text: kicker }), el("p", { class: "question", text: S.selfId.question[kind] }));
    const btn = button("Next", () => next());
    btn.disabled = true;
    page.card.append(optionList("selfId_" + key, S.selfId.options, v => { D.selfId[key] = v; btn.disabled = false; }));
    page.card.append(el("div", { class: "actions" }, btn));
  }

  function stateIntroPage() {
    const page = textPage(S.stateAdhd.title, S.stateAdhd.intro);
    page.card.append(el("div", { class: "actions" }, button("Start", () => next())));
  }

  function stateCarousel() {
    const items = shuffle(S.stateAdhd.items.slice());
    D.stateAdhdOrder = items.map(i => i.id);
    carousel({
      items,
      answers: D.stateAdhd,
      renderAnswer(item, slot, onAnswer) {
        const wrap = el("div", { class: "slider-wrap" });
        const has = D.stateAdhd[item.id] != null;
        const r = el("input", { type: "range", min: "0", max: "100", step: "1", value: has ? D.stateAdhd[item.id] : 50,
                                class: "vas" + (has ? "" : " untouched"), "aria-label": item.text + " (0 = " + S.stateAdhd.left + ", 100 = " + S.stateAdhd.right + ")" });
        const mark = () => { r.classList.remove("untouched"); onAnswer(Number(r.value), false); };
        ["input", "change", "pointerup"].forEach(ev => r.addEventListener(ev, mark));
        r.addEventListener("keydown", e => { if (/Arrow|Home|End|Page/.test(e.key)) setTimeout(mark, 0); });
        wrap.append(r, el("div", { class: "vas-labels" }, el("span", { text: "← " + S.stateAdhd.left }), el("span", { text: S.stateAdhd.right + " →" })));
        slot.append(wrap, el("div", { class: "hint", text: has ? "" : "Tap or drag on the line to answer." }));
        r.addEventListener("input", () => { const h = slot.querySelector(".hint"); if (h) h.textContent = ""; }, { once: true });
      },
      prompt: S.stateAdhd.prompt,
      onDone: next
    });
  }

  function cssIntroPage() {
    const page = textPage(S.css12.title, S.css12.intro);
    page.card.append(el("div", { class: "actions" }, button("Start", () => next())));
  }

  function cssCarousel() {
    const items = shuffle(S.css12.items.slice());
    D.css12Order = items.map(i => i.id);
    carousel({
      items,
      answers: D.css12,
      renderAnswer(item, slot, onAnswer) {
        const row = el("div", { class: "likert", role: "radiogroup", "aria-label": item.text });
        S.css12.scale.forEach(o => {
          const b = el("button", { type: "button", role: "radio", "aria-checked": String(D.css12[item.id] === o.value),
                                   class: D.css12[item.id] === o.value ? "selected" : "" },
                       el("span", { class: "n", text: o.value }), el("span", { class: "l", text: o.label }));
          b.addEventListener("click", () => {
            row.querySelectorAll("button").forEach(x => { x.classList.remove("selected"); x.setAttribute("aria-checked", "false"); });
            b.classList.add("selected"); b.setAttribute("aria-checked", "true");
            onAnswer(o.value, true);
          });
          row.append(b);
        });
        slot.append(row);
      },
      prompt: "",
      onDone: next
    });
  }

  function suspicionPage() {
    const Q = S.suspicion;
    const page = textPage(Q.title, "");
    page.card.append(el("p", { class: "question", text: Q.question }));
    const ta = el("textarea", { placeholder: Q.placeholder, "aria-label": Q.question, maxlength: "2000" });
    const btn = button("Next", () => { D.suspicion = ta.value.trim(); next(); });
    btn.disabled = true;
    ta.addEventListener("input", () => { btn.disabled = ta.value.trim().length < Q.minChars; });
    page.card.append(ta, el("div", { class: "actions" }, btn));
  }

  function debriefPage() {
    const B = S.debrief;
    const page = textPage(B.title, B.html);
    const lab = el("label", { class: "withdraw" });
    const cb = el("input", { type: "checkbox" });
    cb.addEventListener("change", () => { D.withdraw = cb.checked; });
    lab.append(cb, el("span", { html: B.withdraw }));
    page.card.append(lab, el("div", { class: "actions" }, button(B.finishButton, () => {
      D.finishedAt = new Date().toISOString();
      next();
    })));
  }

  function thankYouPage() {
    const page = textPage(S.thankYou.title, S.thankYou.html);
    progressFill.style.width = "100%";
    console.log("STUDY DATA", D);
    if (DEBUG) page.card.append(el("pre", { class: "debug-json", text: JSON.stringify(D, null, 2) }));
  }

  /* ================= components ================= */

  function textPage(title, html) {
    const section = el("section", { class: "page" });
    const card = el("div", { class: "card" });
    if (title) card.append(el("h1", { text: title }));
    if (html) card.append(el("div", { class: "body", html: markPlaceholders(html) }));
    section.append(card);
    app.append(section);
    return { section, card };
  }

  function phoneShell() {
    const phone = el("div", { class: "phone" });
    const screen = el("div", { class: "screen" });
    phone.append(screen, el("img", { class: "phone-frame", src: "phone.png", alt: "", draggable: "false" }));
    return { phone, screen };
  }

  function optionList(name, options, onPick) {
    const list = el("div", { class: "options", role: "radiogroup" });
    options.forEach(o => {
      const lab = el("label", { class: "option" });
      const r = el("input", { type: "radio", name, value: o.value });
      r.addEventListener("change", () => {
        list.querySelectorAll(".option").forEach(x => x.classList.remove("selected"));
        lab.classList.add("selected");
        onPick(o.value);
      });
      lab.append(r, el("span", { class: "dot" }), el("span", { text: o.label }));
      list.append(lab);
    });
    return list;
  }

  function carousel({ items, answers, renderAnswer, prompt, onDone }) {
    const section = el("section", { class: "page" });
    const card = el("div", { class: "card" });
    section.append(card); app.append(section);
    let idx = 0, lock = false, dir = 0;

    const render = () => {
      card.innerHTML = "";
      const item = items[idx];
      const dots = el("div", { class: "dots" }, ...items.map((it, i) =>
        el("span", { class: i === idx ? "current" : (answers[it.id] != null ? "done" : "") })));
      card.append(el("div", { class: "carousel-head" }, el("span", { text: `${idx + 1} of ${items.length}` }), dots));

      const slide = el("div", { class: "slide" + (dir > 0 ? " in-right" : dir < 0 ? " in-left" : "") });
      slide.append(el("p", { class: "statement", text: item.text }));
      if (prompt) slide.append(el("p", { class: "prompt", text: prompt }));
      else slide.append(el("div", { style: "height:18px" }));
      const slot = el("div");
      slide.append(slot);
      card.append(slide);

      const back = button("← Back", () => go(-1));
      back.classList.add("ghost");
      if (idx === 0) back.classList.add("hidden");
      const isLast = idx === items.length - 1;
      const fwd = button(isLast ? "Continue" : "Next", () => go(1));
      fwd.disabled = answers[item.id] == null;
      card.append(el("div", { class: "actions between" }, back, fwd));

      renderAnswer(item, slot, (value, autoAdvance) => {
        answers[item.id] = value;
        fwd.disabled = false;
        dots.children[idx].classList.add("done");
        if (autoAdvance && !isLast && !lock) {
          lock = true;
          setTimeout(() => { lock = false; go(1); }, S.settings.autoAdvanceMs);
        }
      });
    };
    const go = d => {
      if (d > 0 && answers[items[idx].id] == null) return;
      if (d > 0 && idx === items.length - 1) return onDone();
      idx = Math.max(0, Math.min(items.length - 1, idx + d));
      dir = d;
      render();
    };
    render();
  }

  function debugSkip(fn) {
    const b = el("button", { class: "debug-skip", text: "DEBUG: skip ›" });
    b.addEventListener("click", fn);
    app.append(b);
  }

  /* ================= helpers ================= */

  function button(text, onClick) {
    const b = el("button", { class: "btn", type: "button", text });
    b.addEventListener("click", () => { if (!b.disabled) onClick(); });
    return b;
  }

  function el(tag, attrs = {}, ...children) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "text") n.textContent = v;
      else if (k === "html") n.innerHTML = v;
      else n.setAttribute(k, v);
    }
    children.forEach(c => c != null && n.append(c));
    return n;
  }

  function markPlaceholders(html) {
    return html.replace(/\[([^\]]+)\]/g, '<span class="placeholder-mark">[$1]</span>');
  }

  function randInt(n) {
    if (window.crypto && crypto.getRandomValues) { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; }
    return Math.floor(Math.random() * n);
  }
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = randInt(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function makeId() {
    return Date.now().toString(36) + "-" + Array.from({ length: 6 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[randInt(36)]).join("");
  }

  next();
})();
