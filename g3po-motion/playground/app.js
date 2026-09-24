/* Motion playground. One stage, one effect at a time, with a scrubber, an
 * editable settings form, and the exact script that produces the frame. */
(function (G3M) {
  "use strict";
  const $ = (sel, root = document) => root.querySelector(sel);
  const h = G3M.h;
  const q = new URLSearchParams(location.search);
  const RENDER = q.get("render") === "1";
  const FORCE_SAFE = q.get("safe") === "1";   // test the eval-free path

  const state = { effect: null, cfg: {}, stage: null, player: null, video: null, code: "" };

  function defaults(effect) {
    const c = {};
    for (const p of effect.params) c[p.key] = p.def;
    return c;
  }

  /* Eval-free fallback. Hosts with a strict content-security policy forbid
   * new Function(), so this reads the script's chain format directly:
   *   const video = new G3Video(stage).scene("x", {...}).pause(300)...;
   * Arguments are JSON with relaxed rules (bare keys, single quotes, .5). */
  function relaxedJSON(src) {
    let out = "", i = 0;
    while (i < src.length) {
      const c = src[i];
      if (c === '"' || c === "'") {
        let j = i + 1, str = "";
        while (j < src.length && src[j] !== c) { if (src[j] === "\\") { str += src[j] + src[j + 1]; j += 2; continue; } str += src[j++]; }
        out += JSON.stringify(c === "'" ? str.replace(/\\'/g, "'") : JSON.parse('"' + str + '"')); i = j + 1; continue;
      }
      out += c; i++;
    }
    out = out.replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
             .replace(/([:\[,]\s*)-?\.(\d)/g, (m, a, d) => a + (m.includes("-") ? "-0." : "0.") + d)
             .replace(/,\s*([}\]])/g, "$1");
    return JSON.parse("[" + out + "]");
  }
  G3M.interpretScript = function (code, stage) {
    const body = code.replace(/\/\/.*$/gm, "");
    const start = body.indexOf("new G3Video");
    if (start < 0) throw new Error("The script needs to create `const video = new G3Video(stage)…`.");
    let i = body.indexOf(")", start) + 1;
    const video = new G3M.G3Video(stage);
    while (i < body.length) {
      const m = /^\s*\.\s*([A-Za-z_]\w*)\s*\(/.exec(body.slice(i));
      if (!m) break;
      i += m[0].length;
      let depth = 1, j = i, q = null;
      for (; j < body.length && depth; j++) {
        const c = body[j];
        if (q) { if (c === "\\") j++; else if (c === q) q = null; continue; }
        if (c === '"' || c === "'") q = c;
        else if ("([{".includes(c)) depth++;
        else if (")]}".includes(c)) depth--;
      }
      const args = body.slice(i, j - 1).trim();
      if (typeof video[m[1]] !== "function") throw new Error(`Unknown step .${m[1]}()`);
      video[m[1]](...(args ? relaxedJSON(args) : []));
      i = j;
    }
    return video;
  };

  // ------------------------------------------------------------ build + run
  function run(code) {
    const host = $("#stage");
    if (state.player) state.player.pause();
    if (state.stage) state.stage.destroy();
    state.stage = new G3M.Stage(host, { background: "white" });
    const err = $("#error");
    try {
      let video;
      try {
        if (FORCE_SAFE) throw new EvalError("safe mode");
        const fn = new Function("G3Video", "stage", "G3M", code + "\n;return typeof video !== 'undefined' ? video : null;");
        video = fn(G3M.G3Video, state.stage, G3M);
      } catch (e) {
        // blocked by the page's security policy: read the script instead
        if (!(e instanceof EvalError) && !/unsafe-eval|Content Security/i.test(e.message)) throw e;
        video = G3M.interpretScript(code, state.stage);
      }
      if (!video) throw new Error("The script needs to create `const video = new G3Video(stage)…`.");
      state.video = video;
      state.player = new G3M.Player(video.timeline(), { loop: !!state.effect.loop || $("#loop").checked });
      state.player.on(onTime);
      state.player.seek(0);
      window.g3Duration = video.duration;
      window.g3Seek = t => { state.player.pause(); state.player.seek(t); return t; };
      err.hidden = true;
      const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!RENDER && !reduce) state.player.play();
    } catch (e) {
      err.hidden = false;
      err.textContent = "Script error: " + e.message;
    }
  }

  function onTime(t, player) {
    const d = player.tl.duration || 1;
    const scrub = $("#scrub");
    if (document.activeElement !== scrub) scrub.value = String(t / d * 1000);
    $("#time").textContent = `${(t / 1000).toFixed(2)} s / ${(d / 1000).toFixed(2)} s`;
    const btn = $("#play");
    btn.textContent = player.playing ? "Pause" : "Play";
    btn.setAttribute("aria-pressed", player.playing ? "true" : "false");
  }

  function select(effect, keepCfg) {
    state.effect = effect;
    state.cfg = keepCfg ? state.cfg : defaults(effect);
    document.querySelectorAll(".rail button").forEach(b => b.classList.toggle("on", b.dataset.id === effect.id));
    $("#title").textContent = effect.title;
    $("#note").textContent = effect.note;
    $("#loop").checked = !!effect.loop;
    buildForm();
    regenerate();
    if (!RENDER) history.replaceState(null, "", "?effect=" + effect.id);
  }

  function regenerate() {
    state.code = state.effect.script(state.cfg);
    $("#code").value = state.code;
    run(state.code);
  }

  // ------------------------------------------------------------ form
  function buildForm() {
    const form = $("#form");
    form.innerHTML = "";
    for (const p of state.effect.params) {
      const row = h("label", { class: "field" }, form);
      h("span", { text: p.label }, row);
      let input;
      if (p.type === "area") {
        input = h("textarea", { rows: 3 }, row); input.value = state.cfg[p.key];
      } else if (p.type === "select") {
        input = h("select", {}, row);
        for (const o of p.options) { const op = h("option", { value: o, text: o }, input); if (o === state.cfg[p.key]) op.selected = true; }
      } else if (p.type === "number") {
        input = h("input", { type: "number", min: p.min, max: p.max, step: p.step }, row); input.value = state.cfg[p.key];
      } else if (p.type === "bool") {
        row.classList.add("check");
        input = h("input", { type: "checkbox" }, row); input.checked = !!state.cfg[p.key];
        row.insertBefore(input, row.firstChild);
      } else if (p.type === "media") {
        const wrap = h("div", { class: "media" }, row);
        const file = h("input", { type: "file", accept: "video/*,image/*", "aria-label": "Choose footage" }, wrap);
        const reset = h("button", { type: "button", class: "ghost", text: "Use stand-in app" }, wrap);
        const name = h("span", { class: "hint", text: state.cfg.src === "mock" ? "Showing the stand-in g3po app" : "Your footage" }, row);
        file.addEventListener("change", () => {
          const f = file.files && file.files[0]; if (!f) return;
          state.cfg.src = URL.createObjectURL(f);
          state.cfg.kind = f.type.startsWith("video") ? "video" : "image";
          name.textContent = f.name; regenerate();
        });
        reset.addEventListener("click", () => { state.cfg.src = "mock"; delete state.cfg.kind; name.textContent = "Showing the stand-in g3po app"; regenerate(); });
        continue;
      } else {
        input = h("input", { type: "text" }, row); input.value = state.cfg[p.key];
      }
      const commit = () => {
        state.cfg[p.key] = p.type === "number" ? Number(input.value) : p.type === "bool" ? input.checked : input.value;
        regenerate();
      };
      input.addEventListener(p.type === "text" || p.type === "area" ? "change" : "input", commit);
      if (p.type === "text") input.addEventListener("keydown", e => { if (e.key === "Enter") commit(); });
    }
  }

  // ------------------------------------------------------------ rail
  function buildRail() {
    const rail = $("#rail");
    let section = null, group = null;
    for (const e of G3M.effects) {
      if (e.section !== section) {
        section = e.section;
        const sec = h("div", { class: "group" }, rail);
        h("h3", { text: section }, sec);
        group = h("div", { class: "items" }, sec);
      }
      const b = h("button", { type: "button", "data-id": e.id, text: e.title }, group);
      b.addEventListener("click", () => select(e));
    }
  }

  // ------------------------------------------------------------ transport
  function wire() {
    $("#play").addEventListener("click", () => state.player && state.player.toggle());
    $("#replay").addEventListener("click", () => state.player && state.player.replay());
    $("#back").addEventListener("click", () => { if (!state.player) return; state.player.pause(); state.player.seek(state.player.t - 1000 / 60); });
    $("#fwd").addEventListener("click", () => { if (!state.player) return; state.player.pause(); state.player.seek(state.player.t + 1000 / 60); });
    const scrub = $("#scrub");
    scrub.addEventListener("input", () => {
      if (!state.player) return;
      state.player.pause(); state.player.seek(Number(scrub.value) / 1000 * state.player.tl.duration);
    });
    $("#speed").addEventListener("change", e => { if (state.player) state.player.rate = Number(e.target.value); });
    $("#loop").addEventListener("change", e => { if (state.player) state.player.loop = e.target.checked; });
    $("#runCode").addEventListener("click", () => run($("#code").value));
    $("#resetCode").addEventListener("click", () => regenerate());
    $("#copy").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText($("#code").value); $("#copy").textContent = "Copied"; }
      catch (e) { $("#code").select(); $("#copy").textContent = "Selected"; }
      setTimeout(() => $("#copy").textContent = "Copy", 1400);
    });
    document.addEventListener("keydown", e => {
      if (/input|textarea|select/i.test(document.activeElement.tagName)) return;
      if (e.code === "Space") { e.preventDefault(); state.player && state.player.toggle(); }
      if (e.key === "ArrowLeft") $("#back").click();
      if (e.key === "ArrowRight") $("#fwd").click();
      if (e.key === "r") $("#replay").click();
    });
  }

  function start() {
    if (RENDER) document.body.classList.add("render");
    buildRail();
    wire();
    const want = q.get("effect");
    const e = G3M.effects.find(x => x.id === want) || G3M.effects[0];
    select(e);
  }

  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([ready, new Promise(r => setTimeout(r, 1500))]).then(start);
})(window.G3M = window.G3M || {});
