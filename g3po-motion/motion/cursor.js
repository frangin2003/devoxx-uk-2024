/* Giant cursor overlay.
 *
 * Deliberately oversized and graphic. Build a script of moves and clicks, then
 * render(t). Moves follow a bent path rather than a straight robotic line.
 *
 *   const cur = G3M.Cursor(svgLayer, { x: 1500, y: 900 });
 *   cur.move(1200, 620, { at: 200, dur: 700 });
 *   cur.click({ at: 950 });
 *   cur.drag([1200,620], [600,400], { at: 1400, dur: 800 });
 *   cur.render(t);
 */
(function (G3M) {
  "use strict";
  const { s, set, C, kf, ease: E, clamp } = G3M;
  const ARROW = "M0,0 L0,118 L30,90 L52,138 L76,127 L54,80 L94,80 Z";

  G3M.Cursor = function Cursor(parent, opts = {}) {
    const root = s("g", { class: "g3-cursor" }, parent);
    const fx = s("g", {}, root);
    const hand = s("g", {}, root);
    const scaleBase = opts.scale ?? 1;
    s("path", { d: ARROW, fill: G3M.color(opts.fill || "ink"), stroke: G3M.color(opts.stroke || "#FFFFFF"),
      "stroke-width": 9, "stroke-linejoin": "round", "paint-order": "stroke" }, hand);

    const moves = [], clicks = [], vis = [];
    let x0 = opts.x ?? 1600, y0 = opts.y ?? 900, cursorT = 0, lastX = x0, lastY = y0;

    const api = {
      el: root,
      get end() { return cursorT; },
      move(x, y, o = {}) {
        const at = o.at ?? cursorT, dur = o.dur ?? 650;
        moves.push({ at, dur, from: [lastX, lastY], to: [x, y], bend: o.bend ?? .16,
          ease: G3M.easing(o.ease || "inOutCubic") });
        lastX = x; lastY = y; cursorT = at + dur; return api;
      },
      click(o = {}) {
        const at = o.at ?? cursorT;
        clicks.push({ at, x: lastX, y: lastY, style: o.style || "ring" });
        cursorT = at + (o.hold ?? 260); return api;
      },
      doubleClick(o = {}) {
        const at = o.at ?? cursorT;
        api.click({ at, hold: 130 }); api.click({ at: at + 150, hold: o.hold ?? 280 });
        return api;
      },
      drag(from, to, o = {}) {
        const at = o.at ?? cursorT;
        api.move(from[0], from[1], { at, dur: o.approach ?? 350 });
        clicks.push({ at: at + (o.approach ?? 350), x: from[0], y: from[1], style: "press", release: (o.dur ?? 700) });
        api.move(to[0], to[1], { at: at + (o.approach ?? 350) + 80, dur: o.dur ?? 700, bend: .08 });
        clicks.push({ at: cursorT, x: to[0], y: to[1], style: "ring" });
        cursorT += 240; return api;
      },
      hide(o = {}) { vis.push({ at: o.at ?? cursorT, on: false }); return api; },
      show(o = {}) { vis.push({ at: o.at ?? cursorT, on: true }); return api; },
      wait(ms) { cursorT += ms; return api; },

      position(t) {
        let p = [x0, y0];
        for (const m of moves) {
          if (t < m.at) break;
          const k = m.ease(clamp((t - m.at) / m.dur));
          p = G3M.curve(m.from, m.to, k, m.bend);
        }
        return p;
      },
      render(t) {
        let on = opts.visible ?? true;
        for (const v of vis) if (t >= v.at) on = v.on;
        const [x, y] = api.position(t);
        // press squash from the nearest click
        let press = 0;
        for (const c of clicks) {
          const d = t - c.at;
          if (c.style === "press" && d >= 0 && d <= (c.release || 0) + 80) press = Math.max(press, .16);
          else if (d >= 0 && d < 220) press = Math.max(press, kf(d, [[0, 0], [60, .2, E.outQuad], [220, 0, E.pop]]));
        }
        // lean into motion: a slight tilt while moving fast
        const [px, py] = api.position(t - 16);
        const vx = x - px;
        const tilt = clamp(vx * .25, -10, 10);
        set(hand, { transform: `translate(${x},${y}) rotate(${-8 + tilt}) scale(${scaleBase * (1 + press * .4)},${scaleBase * (1 - press)})` });
        set(root, { opacity: on ? 1 : 0 });

        // click effects
        fx.innerHTML = "";
        for (const c of clicks) {
          const d = t - c.at;
          if (d < 0 || d > 700 || c.style === "press") continue;
          const p = clamp(d / 520);
          const r = 18 + E.outCubic(p) * 150 * scaleBase;
          s("circle", { cx: c.x, cy: c.y, r, fill: "none", stroke: C.yellow,
            "stroke-width": 26 * (1 - p) + 2, opacity: 1 - p }, fx);
          const r2 = 10 + E.outExpo(clamp(d / 380)) * 90 * scaleBase;
          s("circle", { cx: c.x, cy: c.y, r: r2, fill: "none", stroke: C.ink,
            "stroke-width": 6, opacity: 1 - clamp(d / 380) }, fx);
          // starburst
          const q = clamp(d / 340);
          if (q < 1) for (let i = 0; i < 8; i++) {
            const a = i / 8 * Math.PI * 2 - Math.PI / 8;
            const r0 = 60 + E.outCubic(q) * 110, r1 = r0 + 34 * (1 - q);
            s("path", { d: `M${c.x + Math.cos(a) * r0},${c.y + Math.sin(a) * r0} L${c.x + Math.cos(a) * r1},${c.y + Math.sin(a) * r1}`,
              stroke: C.ink, "stroke-width": 9, "stroke-linecap": "round", opacity: 1 - q }, fx);
          }
        }
      }
    };
    return api;
  };

})(window.G3M = window.G3M || {});
