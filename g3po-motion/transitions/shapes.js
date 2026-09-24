/* Transitions, part 1: shape-driven.
 *
 * A transition is  (ctx, cfg) -> { duration, render(p) }  with p in 0..1.
 * ctx: { stage, from, to, mid, fx }
 *   from, to  the outgoing and incoming scene elements (both visible here)
 *   mid       a layer between them: above `from`, below `to`
 *   fx        a layer above everything
 * The director resets styles when the transition is not active, so render()
 * only has to describe the moment. Most transitions cover the screen at their
 * midpoint, which is where the cut happens.
 */
(function (G3M) {
  "use strict";
  const { s, set, css, C, kf, ease: E, clamp } = G3M;
  G3M.transitions = G3M.transitions || {};
  const T = G3M.transitions;

  const W = 1920, H = 1080, DIAG = Math.hypot(W, H);
  const radiusToCover = (x, y) =>
    Math.max(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y)) + 20;
  G3M.coverRadius = radiusToCover;

  function svgIn(layer) { return G3M.svgLayer(layer, W, H); }

  // 01: a dot pops, then balloons past the edges; the next scene grows out of it
  T.circleExplosion = function (ctx, cfg = {}) {
    const x = cfg.x ?? W / 2, y = cfg.y ?? H / 2, R = radiusToCover(x, y);
    const col = G3M.color(cfg.color || "yellow");
    const svg = svgIn(ctx.mid);
    const disc = s("circle", { cx: x, cy: y, r: 0, fill: col }, svg);
    const ringSvg = svgIn(ctx.fx);
    const ring = s("circle", { cx: x, cy: y, r: 0, fill: "none", stroke: C.ink, "stroke-width": 16 }, ringSvg);
    return {
      duration: cfg.duration ?? 900,
      render(p) {
        const r = kf(p, [[0, 0], [.1, 70, E.pop], [.2, 56, E.outQuad], [.5, R, E.inExpo]]);
        set(disc, { r });
        const q = clamp((p - .48) / .52);
        const rr = E.outExpo(q) * R;
        ctx.to.style.clipPath = `circle(${rr}px at ${x}px ${y}px)`;
        set(ring, { r: rr, opacity: q > 0 && q < .98 ? 1 - q * .6 : 0, "stroke-width": 18 * (1 - q) + 4 });
      }
    };
  };

  // 02: the frame closes to a pinpoint, holds a beat, then opens on the next scene
  T.blackIris = function (ctx, cfg = {}) {
    const x = cfg.x ?? W / 2, y = cfg.y ?? H / 2, R = radiusToCover(x, y);
    const bg = svgIn(ctx.mid);
    const sheet = s("path", { fill: G3M.color(cfg.color || "ink"), "fill-rule": "evenodd" }, bg);
    const hole = r => r <= 0 ? `M0,0 H${W} V${H} H0 Z`
      : `M0,0 H${W} V${H} H0 Z M${x - r},${y} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`;
    const dotSvg = svgIn(ctx.fx);
    const dot = s("circle", { cx: x, cy: y, r: 0, fill: C.yellow }, dotSvg);
    return {
      duration: cfg.duration ?? 1000,
      render(p) {
        const rOut = kf(p, [[0, R], [.34, 150, E.outQuint], [.44, 0, E.inBack(2.2)]]);
        sheet.setAttribute("d", hole(Math.max(0, rOut)));
        set(dot, { r: kf(p, [[.4, 0], [.5, 26, E.pop], [.6, 18], [.64, 0, E.inQuad]]) });
        const q = clamp((p - .6) / .4);
        ctx.to.style.clipPath = `circle(${E.outExpo(q) * R}px at ${x}px ${y}px)`;
      }
    };
  };

  // 04: alternating yellow and black panels slam down, then drop away
  T.verticalPanels = function (ctx, cfg = {}) {
    const n = cfg.panels ?? 6, w = W / n;
    const svg = svgIn(ctx.fx);
    const cols = [G3M.color(cfg.color || "yellow"), G3M.color(cfg.color2 || "ink")];
    const rects = [];
    for (let i = 0; i < n; i++)
      rects.push(s("rect", { x: i * w - 1, y: -H, width: w + 2, height: H, fill: cols[i % 2] }, svg));
    return {
      duration: cfg.duration ?? 950,
      render(p) {
        rects.forEach((r, i) => {
          const d = i * .045;
          const inP = clamp((p - d) / .3), outP = clamp((p - .56 - d) / .3);
          const y = -H * (1 - E.outQuint(inP)) + H * E.inCubic(outP);
          const sq = inP >= 1 && outP <= 0 ? kf(p - d - .3, [[0, 14], [.08, 0, E.outQuad]]) : 0;
          set(r, { y: y - sq, height: H + sq });
        });
        ctx.to.style.visibility = p >= .5 ? "visible" : "hidden";
      }
    };
  };

  // 16: the scene flattens into a line, the line flashes, the next scene springs open
  T.squash = function (ctx, cfg = {}) {
    const svg = svgIn(ctx.fx);
    const line = s("rect", { x: 0, y: H / 2 - 7, width: W, height: 14, fill: C.ink, opacity: 0 }, svg);
    return {
      duration: cfg.duration ?? 850,
      render(p) {
        const a = E.inBack(1.8)(clamp(p / .4));
        ctx.from.style.transformOrigin = "50% 50%";
        ctx.from.style.transform = `scale(${1 + a * .12},${Math.max(.004, 1 - a)})`;
        ctx.from.style.visibility = p < .42 ? "visible" : "hidden";
        const lineOn = p >= .38 && p < .62;
        const lw = kf(p, [[.38, 1], [.46, 1.06, E.outQuad], [.56, .2, E.inCubic]]);
        set(line, { opacity: lineOn ? 1 : 0, fill: p < .47 ? C.ink : C.yellow,
          x: W / 2 - W * lw / 2, width: W * lw });
        const b = clamp((p - .54) / .46);
        const sy = b <= 0 ? 0 : kf(b, [[0, .01], [.55, 1.08, E.outCubic], [.8, .97], [1, 1, E.outQuad]]);
        ctx.to.style.transformOrigin = "50% 50%";
        ctx.to.style.transform = `scale(${1 - (1 - Math.min(1, sy)) * .1},${Math.max(.004, sy)})`;
        ctx.to.style.visibility = p >= .54 ? "visible" : "hidden";
      }
    };
  };

})(window.G3M = window.G3M || {});
