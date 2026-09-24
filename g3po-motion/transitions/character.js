/* Transitions, part 3: someone does the transition. */
(function (G3M) {
  "use strict";
  const { s, set, C, kf, ease: E, clamp } = G3M;
  const T = G3M.transitions;
  const W = 1920, H = 1080;

  // 06: G3 sprints across dragging a giant yellow sheet; the next scene is behind it
  T.g3Run = function (ctx, cfg = {}) {
    const sheet = cfg.sheet ?? 520, ground = cfg.ground ?? 1000, sc = cfg.scale ?? 1.9;
    const svg = G3M.svgLayer(ctx.fx, W, H);
    const drape = s("rect", { y: -20, height: H + 40, fill: G3M.color(cfg.color || "yellow") }, svg);
    const edge = s("rect", { y: -20, height: H + 40, width: 18, fill: C.ink }, svg);
    const lines = s("g", {}, svg);
    const g3 = G3M.G3(svg);
    const dur = cfg.duration ?? 1150;
    return {
      duration: dur,
      render(p) {
        const x = kf(p, [[0, -260], [1, W + sheet + 260, E.inOutQuad]]);
        const t = p * dur;
        const st = G3M.g3Life.stride(t, 1.7);
        set(drape, { x: x - sheet - 120, width: sheet });
        set(edge, { x: x - sheet - 138 });
        ctx.to.style.clipPath = `inset(0 ${Math.max(0, W - (x - sheet - 128))}px 0 0)`;
        g3.set({ x, y: ground, scale: sc, rot: 9, ...st, armL: 150 + st.armL * .3, armR: 150 - st.armL * .3,
          eyes: "squint", tilt: -4, antenna: -18 + Math.sin(t / 45) * 6 });
        lines.innerHTML = "";
        for (let i = 0; i < 4; i++) {
          const yy = ground - 110 - i * 70, len = 90 + (i % 2) * 60;
          s("path", { d: `M${x - 180 - i * 18},${yy} h${-len}`, stroke: C.ink, "stroke-width": 10,
            "stroke-linecap": "round", opacity: .8 }, lines);
        }
      }
    };
  };

  /* 07: G3 hauls the next scene in by its edge, struggles, stops, glances at
   * the camera, and then the panel whips shut and drags him off. */
  T.g3Push = function (ctx, cfg = {}) {
    const ground = cfg.ground ?? 1000, sc = cfg.scale ?? 1.6;
    const svg = G3M.svgLayer(ctx.fx, W, H);
    const g3 = G3M.G3(svg);
    const dur = cfg.duration ?? 1700;
    return {
      duration: dur,
      render(p) {
        const t = p * dur;
        // panel's left edge
        const x = kf(t, [[0, W + 40], [220, 1500, E.outCubic], [900, 1120, E.inOutQuad],
                         [1180, 1110], [1420, -60, E.inExpo], [1580, 30, E.outQuad], [1700, 0, E.outQuad]]);
        const wobble = t > 220 && t < 900 ? Math.sin(t / 38) * 5 : 0;
        ctx.to.style.transform = `translateX(${x + wobble}px)`;
        ctx.to.style.boxShadow = "-18px 0 0 #1C1D1F";
        // G3 hangs on to the edge
        const struggling = t < 900, looking = t >= 900 && t < 1180, flung = t >= 1180;
        const st = struggling ? G3M.g3Life.stride(t, .9) : {};
        const gx = x - 95 + (flung ? -kf(t, [[1180, 0], [1420, 260, E.inQuad]]) : 0);
        g3.set({
          x: gx, y: ground - (flung ? kf(t, [[1180, 0], [1420, 120, E.outQuad]]) : 0), scale: sc, flip: true,
          rot: struggling ? -12 : flung ? kf(t, [[1180, 0], [1420, -60, E.inQuad]]) : 0,
          ...st, armL: struggling ? 95 : flung ? 160 : 70, armR: struggling ? 95 : 60,
          eyes: struggling ? "squint" : flung ? "wide" : "round",
          lookX: looking ? 0 : -1, lookY: looking ? .4 : 0,
          blink: looking ? G3M.g3Life.blink(t, 1020) : 0,
          squash: struggling ? .06 + Math.sin(t / 60) * .02 : 0,
          antenna: flung ? G3M.g3Life.twang(t, 1180, 30) : Math.sin(t / 70) * 6,
          opacity: gx < -200 ? 0 : 1
        });
      }
    };
  };

  // 09: a giant cursor clicks, and the click itself becomes the next scene
  T.cursorClick = function (ctx, cfg = {}) {
    const x = cfg.x ?? W * .56, y = cfg.y ?? H * .5, R = G3M.coverRadius(x, y);
    const dur = cfg.duration ?? 1100;
    const mid = G3M.svgLayer(ctx.mid, W, H);
    const disc = s("circle", { cx: x, cy: y, r: 0, fill: G3M.color(cfg.color || "yellow") }, mid);
    const top = G3M.svgLayer(ctx.fx, W, H);
    const cur = G3M.Cursor(top, { x: W + 120, y: H + 160, scale: 1.3 });
    cur.move(x, y, { at: 0, dur: dur * .38 }).click({ at: dur * .42 });
    return {
      duration: dur,
      render(p) {
        const t = p * dur;
        cur.render(t);
        const q = clamp((t - dur * .46) / (dur * .26));
        set(disc, { r: E.inExpo(q) * R });
        const r2 = clamp((t - dur * .7) / (dur * .3));
        ctx.to.style.clipPath = `circle(${E.outExpo(r2) * R}px at ${x}px ${y}px)`;
        cur.el.setAttribute("opacity", t > dur * .72 ? 0 : 1);
      }
    };
  };

})(window.G3M = window.G3M || {});
