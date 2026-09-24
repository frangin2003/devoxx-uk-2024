/* Kinetic typography.
 *
 * BigText builds giant display text fitted to the frame, split into lines and
 * letters so any entrance can address either. Entrances and exits are pure
 * functions of time returning a transform, so they compose with anything.
 *
 * Copy always comes from configuration. Nothing in here knows a word of it.
 */
(function (G3M) {
  "use strict";
  const { h, css, kf, ease: E, clamp } = G3M;

  G3M.BigText = function BigText(parent, cfg = {}) {
    const lines = Array.isArray(cfg.text) ? cfg.text : String(cfg.text || "").split("\n");
    const W = cfg.stageW || 1920, H = cfg.stageH || 1080;
    const wrap = h("div", {}, parent);
    css(wrap, { position: "absolute", left: "0", top: "0", width: W + "px", height: H + "px",
      display: "flex", flexDirection: "column", justifyContent: "center",
      alignItems: cfg.align === "left" ? "flex-start" : cfg.align === "right" ? "flex-end" : "center",
      padding: cfg.align === "center" || !cfg.align ? "0" : "0 80px", boxSizing: "border-box",
      pointerEvents: "none" });
    const lineEls = [], letters = [];
    for (const text of lines) {
      const line = h("div", {}, wrap);
      css(line, { fontFamily: G3M.FONT, fontWeight: 900, fontStretch: (cfg.stretch ?? 72) + "%",
        color: G3M.color(cfg.color || "ink"), lineHeight: String(cfg.leading ?? .84),
        whiteSpace: "nowrap", letterSpacing: (cfg.tracking ?? -0.02) + "em",
        textTransform: cfg.uppercase === false ? "none" : "uppercase",
        willChange: "transform", transformOrigin: "50% 60%" });
      const ls = [];
      for (const ch of text) {
        const sp = h("span", { text: ch === " " ? "\u00a0" : ch }, line);
        css(sp, { display: "inline-block", willChange: "transform" });
        ls.push(sp);
      }
      lineEls.push(line); letters.push(ls);
    }
    // Fit: the widest line spans `width` of the frame, capped by height.
    function fit() {
      const target = (cfg.width ?? .9) * W;
      let size = cfg.size || 0;
      if (!size) {
        const st = { fontStretch: (cfg.stretch ?? 72) + "%", letterSpacing: (cfg.tracking ?? -0.02) + "em",
          textTransform: cfg.uppercase === false ? "none" : "uppercase", fontSize: "100px" };
        const widest = Math.max(1, ...lines.map(l => G3M.measureText(l, st)));
        size = 100 * target / widest;
        const maxByHeight = (cfg.maxHeight ?? .86) * H / (lines.length * (cfg.leading ?? .84));
        size = Math.min(size, maxByHeight);
      }
      for (const l of lineEls) l.style.fontSize = size + "px";
      return size;
    }
    const size = fit();
    return { el: wrap, lines: lineEls, letters, size, fit };
  };

  /* Entrances. Each returns {x, y, sx, sy, rot, op} for local time t (ms)
   * since the element started entering. `rest` is the resting rotation. */
  const IN = {
    slam(t, rest = -3) {
      // accelerates at the camera, hits, squashes, springs back
      const hit = 210;
      if (t < hit) {
        const p = E.inExpo(clamp(t / hit));
        return { sx: 3.4 - 2.4 * p, sy: 3.4 - 2.4 * p, rot: rest - 7 * (1 - p), op: clamp(t / 50), y: 0, x: 0 };
      }
      const d = t - hit;
      const sq = kf(d, [[0, .16], [90, -.06, E.outQuad], [200, .025, E.inOutQuad], [320, 0, E.outQuad]]);
      return { sx: 1 + sq * .55, sy: 1 - sq, rot: rest, op: 1, x: 0, y: 0 };
    },
    pop(t, rest = 0) {
      const sc = kf(t, [[0, 0], [260, 1.13, E.outCubic], [400, .96, E.inOutQuad], [520, 1, E.outQuad]]);
      return { sx: sc, sy: sc, rot: kf(t, [[0, rest - 10], [420, rest, E.pop]]), op: t > 0 ? 1 : 0, x: 0, y: 0 };
    },
    drop(t, rest = 0) {
      const land = 330;
      if (t < land) {
        const p = E.inQuad(clamp(t / land));
        return { y: -1300 * (1 - p), sx: .92, sy: 1.12, rot: rest, op: 1, x: 0 };
      }
      const d = t - land;
      const sq = kf(d, [[0, .22], [110, -.08, E.outQuad], [230, .03, E.inOutQuad], [360, 0, E.outQuad]]);
      return { y: 0, sx: 1 + sq * .5, sy: 1 - sq, rot: rest, op: 1, x: 0 };
    },
    grow(t, rest = 0) {
      const sc = kf(t, [[0, .02], [520, 1.06, E.outExpo], [700, 1, E.outQuad]]);
      return { sx: sc, sy: sc, rot: rest, op: clamp(t / 60), x: 0, y: 0 };
    },
    slide(t, rest = 0, dir = -1) {
      const x = kf(t, [[0, dir * 2200], [380, -dir * 70, E.outQuint], [560, 0, E.inOutQuad]]);
      const skew = kf(t, [[0, 0], [200, -dir * 14], [460, 0, E.outQuad]]);
      return { x, y: 0, sx: 1, sy: 1, rot: rest, op: 1, skew };
    },
    whip(t, rest = -8) {
      const x = kf(t, [[0, 2400], [300, -40, E.outExpo], [480, 0, E.inOutQuad]]);
      return { x, y: 0, sx: kf(t, [[0, 1.5], [300, .96, E.outExpo], [480, 1, E.outQuad]]), sy: 1,
        rot: rest, op: 1, skew: kf(t, [[0, -24], [300, 6, E.outExpo], [480, 0, E.outQuad]]) };
    },
    none() { return { x: 0, y: 0, sx: 1, sy: 1, rot: 0, op: 1 }; }
  };

  const OUT = {
    fly(t) {       // rushes past the camera
      const p = E.inCubic(clamp(t / 360));
      return { sx: 1 + p * 5, sy: 1 + p * 5, op: 1 - clamp((t - 220) / 140), x: 0, y: 0, rot: 0 };
    },
    drop(t) {
      const p = E.inBack(1.6)(clamp(t / 420));
      return { y: p * 1400, x: 0, sx: 1, sy: 1, rot: p * 8, op: 1 };
    },
    split(t, i, n) { // lines part vertically
      const dir = i < (n - 1) / 2 ? -1 : i > (n - 1) / 2 ? 1 : (i % 2 ? 1 : -1);
      const p = E.inBack(1.4)(clamp(t / 420));
      return { y: dir * p * 1200, x: 0, sx: 1, sy: 1, rot: 0, op: 1 };
    },
    shrink(t) {
      const sc = kf(t, [[0, 1], [110, 1.08, E.outQuad], [330, 0, E.inBack(2)]]);
      return { sx: sc, sy: sc, op: 1, x: 0, y: 0, rot: 0 };
    },
    none() { return { x: 0, y: 0, sx: 1, sy: 1, rot: 0, op: 1 }; }
  };
  G3M.textIn = IN; G3M.textOut = OUT;

  G3M.applyTransform = function (el, f, baseRot = 0) {
    el.style.transform =
      `translate(${f.x || 0}px,${f.y || 0}px) rotate(${f.rot ?? baseRot}deg) ` +
      `skewX(${f.skew || 0}deg) scale(${f.sx ?? 1},${f.sy ?? 1})`;
    el.style.opacity = f.op ?? 1;
  };

  /* Drive a BigText through entrance -> hold -> exit.
   * cfg: entrance, exit, stagger (ms between lines), holdUntil (ms), rest rotation */
  G3M.animateText = function (bt, t, cfg = {}) {
    const n = bt.lines.length;
    const inFx = IN[cfg.entrance || "slam"] || IN.slam;
    const outFx = OUT[cfg.exit || "none"] || OUT.none;
    const stagger = cfg.stagger ?? 170;
    const exitAt = cfg.exitAt ?? Infinity;
    bt.lines.forEach((line, i) => {
      const rest = (cfg.rotate ?? (cfg.entrance === "slam" ? -3 : 0)) * (i % 2 ? -.6 : 1);
      const lt = t - i * stagger;
      if (lt < 0) { line.style.opacity = 0; return; }
      let f = inFx(lt, rest, cfg.dir);
      if (t >= exitAt) {
        const o = outFx(t - exitAt - (n - 1 - i) * (cfg.exitStagger ?? 40), i, n);
        f = { ...f, x: (f.x || 0) + o.x, y: (f.y || 0) + o.y,
          sx: f.sx * o.sx, sy: f.sy * o.sy, rot: f.rot + (o.rot || 0), op: f.op * o.op };
      }
      G3M.applyTransform(line, f);
    });
  };

})(window.G3M = window.G3M || {});
