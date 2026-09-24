/* Typing system.
 *
 * A script of operations compiles to a list of timed text states, so render(t)
 * is exact and deterministic: jitter comes from a seeded generator.
 *
 *   const box = G3M.TypeBox(parent, { x: 360, y: 700, width: 1200 });
 *   box.type("Fix this issue").pause(400).delete("issue")
 *      .type("entire bloody thing").pause(300).submit();
 *   box.render(t);
 */
(function (G3M) {
  "use strict";
  const { h, css, kf, ease: E, clamp, C } = G3M;

  G3M.TypeBox = function TypeBox(parent, cfg = {}) {
    const W = cfg.width ?? 1180, x = cfg.x ?? (1920 - W) / 2, y = cfg.y ?? 700;
    const speed = cfg.speed ?? 52;          // ms per character, before jitter
    const jitter = cfg.jitter ?? .45;       // 0 = metronomic
    const rnd = G3M.rng(cfg.seed ?? 3);

    const box = h("div", {}, parent);
    css(box, { position: "absolute", left: x + "px", top: y + "px", width: W + "px", height: "150px",
      background: G3M.color(cfg.fill || "#FFFFFF"), borderRadius: "75px", border: `8px solid ${C.ink}`,
      boxSizing: "border-box", display: "flex", alignItems: "center", padding: "0 150px 0 64px",
      fontFamily: G3M.FONT, fontWeight: 700, fontSize: "58px", color: C.ink, transformOrigin: "50% 50%",
      willChange: "transform" });
    const textEl = h("span", {}, box);
    css(textEl, { whiteSpace: "pre", letterSpacing: "-0.01em" });
    const caret = h("span", {}, box);
    css(caret, { display: "inline-block", width: "7px", height: "66px", background: C.ink,
      marginLeft: "4px", borderRadius: "4px" });
    const ph = h("span", { text: cfg.placeholder || "" }, box);
    css(ph, { position: "absolute", left: "64px", color: "#9AA0A6", fontWeight: 600, whiteSpace: "pre" });
    const send = h("div", {}, box);
    css(send, { position: "absolute", right: "18px", top: "50%", width: "98px", height: "98px",
      marginTop: "-49px", borderRadius: "50%", background: C.yellow, border: `7px solid ${C.ink}`,
      boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center",
      willChange: "transform" });
    send.innerHTML = `<svg width="46" height="46" viewBox="0 0 46 46"><path d="M23 38 V9 M10 21 L23 8 L36 21"
      fill="none" stroke="${C.ink}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const ghost = h("div", {}, parent);   // the submitted text flying off
    css(ghost, { position: "absolute", left: (x + 64) + "px", top: (y + 40) + "px", fontFamily: G3M.FONT,
      fontWeight: 700, fontSize: "58px", color: C.ink, whiteSpace: "pre", opacity: 0, willChange: "transform" });

    // compiled state
    const states = [{ t: 0, text: "", typing: false }];
    let t = cfg.at ?? 0, text = "", submitAt = null;
    const push = (s, typing = true) => states.push({ t, text: s, typing });

    const api = {
      el: box,
      get end() { return t; },
      type(str, o = {}) {
        const sp = o.speed ?? speed;
        for (const ch of str) {
          let d = sp * (1 + (rnd() * 2 - 1) * jitter);
          if (ch === " ") d *= 1.35;              // a beat between words
          if (/[.,!?]/.test(ch)) d *= 2.2;
          t += d; text += ch; push(text);
        }
        return api;
      },
      pause(ms) { t += ms; push(text, false); return api; },
      delete(what, o = {}) {
        let n = typeof what === "number" ? what
              : (text.endsWith(what) ? what.length : Math.min(text.length, String(what).length));
        const sp = o.speed ?? speed * .45;
        if (typeof what === "string" && text.endsWith(" " + what)) n = what.length;
        while (n-- > 0) { t += sp; text = text.slice(0, -1); push(text); }
        return api;
      },
      replace(what, str) { return api.delete(what).pause(120).type(str); },
      // autocomplete: the rest of the word appears at once
      complete(str) { t += 90; text += str; push(text); return api; },
      submit(o = {}) { t += 120; submitAt = t; t += o.dur ?? 700; push("", false); return api; },

      render(now) {
        // find current state
        let st = states[0];
        for (const s of states) { if (s.t <= now) st = s; else break; }
        const submitted = submitAt != null && now >= submitAt;
        const shown = submitted ? "" : st.text;
        textEl.textContent = shown;
        ph.style.opacity = shown ? 0 : 1;
        // caret: solid while typing, blinking when idle
        const lastChange = st.t;
        const idle = now - lastChange > 140;
        caret.style.opacity = submitted ? 0 : (!idle ? 1 : (Math.floor((now - lastChange) / 530) % 2 ? 0 : 1));
        // submit: button presses, box squashes, text flies off
        if (submitAt != null) {
          const d = now - submitAt;
          const press = kf(d, [[0, 1], [70, .82, E.outQuad], [260, 1, E.pop]]);
          send.style.transform = `scale(${press})`;
          const sq = kf(d, [[0, 0], [90, .08, E.outQuad], [300, 0, E.bouncy]]);
          box.style.transform = `scale(${1 + sq * .4},${1 - sq})`;
          const fly = clamp(d / 520);
          ghost.textContent = d >= 0 ? (states.filter(s => s.t < submitAt).pop() || {}).text || "" : "";
          ghost.style.opacity = d >= 0 && d < 520 ? 1 - E.inQuad(fly) : 0;
          ghost.style.transform = `translate(${E.inCubic(fly) * 180}px,${-E.outCubic(fly) * 260}px) scale(${1 - fly * .35})`;
        } else {
          send.style.transform = "scale(1)"; box.style.transform = "none"; ghost.style.opacity = 0;
        }
      }
    };
    return api;
  };

})(window.G3M = window.G3M || {});
