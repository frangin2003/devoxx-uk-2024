/* Supporting cast, in the same flat language as G3.
 *
 * Each character: Friend(parent, opts) -> { el, set(pose) } with feet at y = 0
 * and a height of roughly 300 units, so they line up with G3 at equal scale.
 * Shared pose keys: x, y, scale, rot, flip, squash, lift, opacity, lookX.
 */
(function (G3M) {
  "use strict";
  const { s, set, C } = G3M;
  const INK = "#232629";

  function frame(parent) {
    const root = s("g", {}, parent);
    const shadow = s("ellipse", { cx: 0, cy: 2, rx: 84, ry: 12, fill: "rgba(28,29,31,.14)" }, root);
    const lifted = s("g", {}, root);
    const body = s("g", {}, lifted);
    return { root, shadow, lifted, body };
  }
  function pose(f, p, extra) {
    const sc = p.scale ?? 1, flip = p.flip ? -1 : 1;
    set(f.root, { transform: `translate(${p.x ?? 0},${p.y ?? 0}) rotate(${p.rot ?? 0}) scale(${sc * flip},${sc})`,
      opacity: p.opacity ?? 1 });
    const lift = p.lift ?? 0;
    set(f.lifted, { transform: `translate(0,${-lift})` });
    const sh = Math.max(.35, 1 - lift / 420);
    set(f.shadow, { rx: 84 * sh, opacity: sh });
    const q = p.squash ?? 0;
    set(f.body, { transform: `scale(${1 + q * .55},${1 - q})` });
    if (extra) extra(p);
  }

  // ---------------------------------------------------------------- G2D2
  G3M.G2D2 = function (parent) {
    const f = frame(parent), b = f.body;
    for (const sx of [-1, 1]) {
      s("rect", { x: sx * 78 - 14, y: -200, width: 28, height: 150, rx: 12, fill: "#9AA3AC" }, b);
      s("path", { d: `M${sx * 78 - 18},-50 h36 l12,32 h-60 z`, fill: "#6F7883" }, b);
      s("rect", { x: sx * 78 - 34, y: -22, width: 68, height: 22, rx: 9, fill: "#4D5660" }, b);
    }
    s("rect", { x: -62, y: -206, width: 124, height: 170, rx: 18, fill: "#C6CCD3" }, b);
    s("rect", { x: -62, y: -160, width: 124, height: 12, fill: "#8C959E" }, b);
    s("rect", { x: -30, y: -136, width: 26, height: 26, rx: 5, fill: C.blue }, b);
    s("rect", { x: 6, y: -136, width: 26, height: 26, rx: 5, fill: "#8C959E" }, b);
    s("rect", { x: -34, y: -82, width: 68, height: 16, rx: 6, fill: C.blue }, b);
    const dome = s("g", {}, b);
    s("path", { d: "M-66,-204 A66,66 0 0 1 66,-204 Z", fill: "#D5DAE0" }, dome);
    s("path", { d: "M-60,-236 A66,66 0 0 1 60,-236 Z", fill: C.blue }, dome);
    const eye = s("g", {}, dome);
    s("circle", { cx: 0, cy: -232, r: 18, fill: "#4D5660" }, eye);
    s("circle", { cx: 0, cy: -232, r: 12, fill: "#1D4D84" }, eye);
    s("circle", { cx: -4, cy: -236, r: 4, fill: "#7FB6F0" }, eye);
    s("rect", { x: -48, y: -224, width: 14, height: 16, rx: 3, fill: "#C0392B" }, dome);
    s("rect", { x: 34, y: -224, width: 14, height: 16, rx: 3, fill: "#C0392B" }, dome);
    s("rect", { x: -70, y: -208, width: 140, height: 9, rx: 4.5, fill: "#6F7883" }, b);
    return { el: f.root, set(p = {}) {
      pose(f, p, q => set(eye, { transform: `translate(${(q.lookX ?? 0) * 22},0)` })); return this; } };
  };

  // ---------------------------------------------------------------- GB8
  G3M.GB8 = function (parent) {
    const f = frame(parent), b = f.body;
    const ball = s("g", {}, b);
    s("circle", { cx: 0, cy: -84, r: 84, fill: "#F4F3EF", stroke: "#C9CCD0", "stroke-width": 4 }, ball);
    const deco = s("g", {}, ball);
    s("circle", { cx: 0, cy: -84, r: 52, fill: "none", stroke: C.yellow, "stroke-width": 15 }, deco);
    s("circle", { cx: 0, cy: -84, r: 26, fill: "none", stroke: "#C9CCD0", "stroke-width": 7 }, deco);
    s("circle", { cx: -46, cy: -128, r: 20, fill: "none", stroke: C.yellow, "stroke-width": 10 }, deco);
    s("circle", { cx: 48, cy: -36, r: 16, fill: C.yellow }, deco);
    s("circle", { cx: 50, cy: -130, r: 10, fill: "#C9CCD0" }, deco);
    const head = s("g", {}, b);
    s("path", { d: "M-50,-166 A50,50 0 0 1 50,-166 Z", fill: "#F4F3EF", stroke: "#C9CCD0", "stroke-width": 3 }, head);
    s("path", { d: "M-40,-196 A50,50 0 0 1 40,-196 Z", fill: C.yellow }, head);
    s("rect", { x: -56, y: -171, width: 112, height: 10, rx: 5, fill: "#B9BCC0" }, head);
    const eye = s("g", {}, head);
    s("circle", { cx: -4, cy: -196, r: 19, fill: "#E6E5E1" }, eye);
    s("circle", { cx: -4, cy: -196, r: 15, fill: INK }, eye);
    s("circle", { cx: -9, cy: -201, r: 5, fill: "#fff" }, eye);
    return { el: f.root, set(p = {}) {
      pose(f, p, q => {
        set(deco, { transform: `rotate(${q.roll ?? 0} 0 -84)` });
        set(head, { transform: `rotate(${q.tilt ?? 0} 0 -166)` });
        set(eye, { transform: `translate(${(q.lookX ?? 0) * 12},0)` });
      });
      return this; } };
  };

  // ---------------------------------------------------------------- Pix
  G3M.Pix = function (parent) {
    const f = frame(parent), b = f.body, O = "#D9795A";
    s("rect", { x: -120, y: -170, width: 42, height: 52, fill: O }, b);
    s("rect", { x: 78, y: -170, width: 42, height: 52, fill: O }, b);
    s("rect", { x: -80, y: -220, width: 160, height: 162, fill: O }, b);
    for (const lx of [-80, -38, 16, 58]) s("rect", { x: lx, y: -60, width: 22, height: 60, fill: O }, b);
    const open = s("g", {}, b), squint = s("g", { opacity: 0 }, b);
    s("rect", { x: -40, y: -184, width: 24, height: 24, fill: "#0D0D0D" }, open);
    s("rect", { x: 16, y: -184, width: 24, height: 24, fill: "#0D0D0D" }, open);
    s("path", { d: "M-36,-182 L-20,-172 L-36,-162 M36,-182 L20,-172 L36,-162", fill: "none",
      stroke: "#0D0D0D", "stroke-width": 7, "stroke-linecap": "square" }, squint);
    return { el: f.root, set(p = {}) {
      pose(f, p, q => { set(open, { opacity: q.eyes === "squint" ? 0 : 1 });
                        set(squint, { opacity: q.eyes === "squint" ? 1 : 0 }); });
      return this; } };
  };

  // Build any mascot by name
  G3M.mascot = function (name, parent, opts) {
    switch (name) {
      case "g2d2": return G3M.G2D2(parent, opts);
      case "gb8": return G3M.GB8(parent, opts);
      case "pix": return G3M.Pix(parent, opts);
      case "dj": { const g = G3M.G3(parent, opts); const base = g.set;
        g.set = p => base({ ...p, headphones: true }); g.set({}); return g; }
      default: return G3M.G3(parent, opts);
    }
  };

})(window.G3M = window.G3M || {});
