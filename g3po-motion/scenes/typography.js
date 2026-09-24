/* Scene templates led by typography.
 * A scene is (el, cfg, stage) -> { duration, render(t) }, where el is a
 * full-frame container the scene owns. All copy comes from cfg. */
(function (G3M) {
  "use strict";
  const { h, css, s, set, C, kf, ease: E, clamp } = G3M;
  G3M.scenes = G3M.scenes || {};
  const S = G3M.scenes;

  const layer = (el, z) => { const d = h("div", {}, el); css(d, G3M.fill); d.style.zIndex = z; return d; };
  G3M.sceneLayer = layer;
  const lines = v => Array.isArray(v) ? v : String(v ?? "").split(/\n|\|/).filter(Boolean);

  // ------------------------------------------------------------ FeatureHero
  S.hero = function (el, cfg) {
    el.style.background = G3M.color(cfg.background || "yellow");
    const svgLayer = layer(el, 1), textLayer = layer(el, 2);
    const bt = G3M.BigText(textLayer, { text: lines(cfg.title || "MEET G3PO"), width: cfg.width ?? .62,
      align: "left", color: cfg.foreground || "ink", stretch: cfg.stretch ?? 78 });
    bt.el.style.paddingLeft = "110px";
    const svg = G3M.svgLayer(svgLayer, 1920, 1080);
    const g3 = G3M.mascot(cfg.mascot || "g3", svg);
    let sub = null;
    if (cfg.subtitle) {
      sub = h("div", { text: cfg.subtitle }, textLayer);
      css(sub, { position: "absolute", left: "118px", bottom: "120px", fontWeight: 800, fontSize: "46px",
        background: C.ink, color: C.white, padding: "18px 34px", borderRadius: "40px", fontFamily: G3M.FONT });
    }
    const X = cfg.mascotX ?? 1500, Y = 940, sc = cfg.mascotScale ?? 1.5;
    return {
      duration: cfg.duration ?? 2600,
      render(t) {
        G3M.animateText(bt, t - 80, { entrance: cfg.entrance || "pop", stagger: 150, rotate: -2,
          exit: cfg.exit, exitAt: cfg.exitAt });
        // hop in from the right, land, look at the title, point
        const air = clamp((t - 300) / 420);
        const x = kf(t, [[300, 2150], [720, X, E.outCubic]]);
        const lift = air > 0 && air < 1 ? Math.sin(air * Math.PI) * 170 : 0;
        const land = t - 720;
        const squash = land >= 0 ? kf(land, [[0, .22], [120, -.07, E.outQuad], [260, .03], [380, 0, E.outQuad]])
                                 : (t > 250 && t < 300 ? .12 : air > 0 ? -.06 : 0);
        const life = G3M.g3Life.idle(t, 1);
        g3.set({ x, y: Y, scale: sc, lift, squash: squash + (land > 400 ? life.squash : 0),
          lookX: t > 900 ? -1 : 0, lookY: t > 900 ? -.2 : 0,
          blink: Math.max(G3M.g3Life.blink(t, 1250), land > 1600 ? life.blink : 0),
          armL: kf(t, [[1350, 0], [1560, 118, E.pop]]), armR: kf(t, [[1350, 0], [1560, 20, E.pop]]),
          antenna: G3M.g3Life.twang(t, 720, 18) + life.antenna, flip: false,
          eyes: t > 1900 ? "happy" : "round" });
        if (sub) {
          const f = G3M.textIn.pop(t - 900);
          G3M.applyTransform(sub, f);
        }
      }
    };
  };

  // ------------------------------------------------------------ BigTextSlam
  S.slam = function (el, cfg) {
    el.style.background = G3M.color(cfg.background || "yellow");
    const shakeWrap = layer(el, 1);
    const svg = G3M.svgLayer(layer(shakeWrap, 1), 1920, 1080);
    const textLayer = layer(shakeWrap, 2);
    const ls = lines(cfg.text || "PARALLEL.");
    const bt = G3M.BigText(textLayer, { text: ls, width: cfg.width ?? .94, color: cfg.foreground || "ink",
      stretch: cfg.stretch ?? 70, leading: .8 });
    const withG3 = cfg.g3 !== false;
    // rest the bottom of the text block on G3's head so the landing hits him
    const blockH = bt.size * (.8 * ls.length) * .86;
    if (withG3) bt.el.style.transform = `translateY(${cfg.textOffset ?? (835 - 540 - blockH / 2)}px)`;
    const g3 = withG3 ? G3M.G3(svg) : null;
    const stagger = cfg.stagger ?? 260, hit = 210;
    const impacts = ls.map((_, i) => i * stagger + hit);
    return {
      duration: cfg.duration ?? 2400,
      render(t) {
        G3M.animateText(bt, t, { entrance: cfg.entrance || "slam", stagger, exit: cfg.exit,
          exitAt: cfg.exitAt ?? (cfg.exit ? (cfg.duration ?? 2400) - 450 : Infinity) });
        let dx = 0, dy = 0;
        for (const it of impacts) { const [a, b] = G3M.shake(t, it, 320, cfg.shake ?? 22, it); dx += a; dy += b; }
        shakeWrap.style.transform = `translate(${dx}px,${dy}px)`;
        if (!g3) return;
        // flattened by the first word, pops back, looks up at it
        const hitT = impacts[0];
        const d = t - hitT;
        const squash = d < 0 ? 0 : kf(d, [[0, .5], [520, .5], [640, -.18, E.outQuad], [760, .06], [900, 0, E.outQuad]]);
        const pinned = d >= 0 && d < 560;
        g3.set({ x: 960, y: 1050, scale: .82, squash, eyes: pinned ? "squint" : "round",
          lookY: d > 900 ? -1 : 0, lookX: d > 1300 ? .6 : 0,
          blink: G3M.g3Life.blink(t, hitT + 1100),
          antenna: pinned ? 70 : G3M.g3Life.twang(t, hitT + 560, 34),
          lift: d > 560 && d < 760 ? Math.sin((d - 560) / 200 * Math.PI) * 60 : 0 });
      }
    };
  };

  // ------------------------------------------------------------ BigTextSequence
  S.sequence = function (el, cfg) {
    el.style.background = G3M.color(cfg.background || "white");
    const wrap = layer(el, 1);
    const ls = lines(cfg.text || "SHIP.|FASTER.");
    const bt = G3M.BigText(wrap, { text: ls, width: cfg.width ?? .8, color: cfg.foreground || "ink",
      stretch: cfg.stretch ?? 72, leading: .82 });
    const beat = cfg.beat ?? 420;
    return {
      duration: cfg.duration ?? (ls.length * beat + 1500),
      render(t) {
        G3M.animateText(bt, t, { entrance: cfg.entrance || "pop", stagger: beat, rotate: cfg.rotate ?? -2,
          exit: cfg.exit, exitAt: cfg.exitAt ?? (cfg.exit ? (cfg.duration ?? ls.length * beat + 1500) - 460 : Infinity) });
        // a tiny camera punch on every word
        let k = 0;
        for (let i = 0; i < ls.length; i++) k += kf(t - i * beat, [[0, 0], [60, .02, E.outQuad], [260, 0, E.outQuad]]);
        wrap.style.transform = `scale(${1 + k})`;
      }
    };
  };

  // ------------------------------------------------------------ SplitTypography
  /* The word is printed on yellow columns, one per letter. The columns part
   * to show the footage behind, then fly off. */
  S.split = function (el, cfg) {
    el.style.background = C.ink;
    const media = G3M.Media(layer(el, 1), { src: cfg.src || "mock", treatment: "fullscreen", kind: cfg.kind });
    const front = layer(el, 2);
    const word = String(cfg.text || "SPLIT").toUpperCase();
    const n = word.length, colW = 1920 / n;
    // each letter must fit inside its own column, so size by the widest glyph
    const st = { fontStretch: (cfg.stretch ?? 70) + "%" };
    const widest = Math.max(1, ...word.split("").map(ch => G3M.measureText(ch, st)));
    const size = Math.min(100 * colW * .86 / widest, 1080 * .62);
    const cols = [];
    for (let i = 0; i < n; i++) {
      const c = h("div", {}, front);
      css(c, { position: "absolute", left: (i * colW - 1) + "px", top: "0", width: (colW + 2) + "px", height: "1080px",
        background: G3M.color(cfg.background || "yellow"), overflow: "visible", willChange: "transform" });
      const l = h("div", { text: word[i] }, c);
      css(l, { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-54%)",
        fontFamily: G3M.FONT, fontWeight: 900, fontStretch: (cfg.stretch ?? 70) + "%", fontSize: size + "px",
        lineHeight: ".8", color: G3M.color(cfg.foreground || "ink") });
      cols.push({ c, l });
    }
    return {
      duration: cfg.duration ?? 2300,
      render(t) {
        media.camera({ zoom: kf(t, [[500, 1.18], [1500, 1, E.outCubic]]), fx: .5, fy: .5,
          mediaTime: t / 1000, blur: kf(t, [[400, .5], [1100, 0, E.outCubic]]) });
        cols.forEach(({ c, l }, i) => {
          const pop = G3M.textIn.pop(t - i * 45);
          l.style.transform = `translate(-50%,-54%) scale(${pop.sx},${pop.sy})`;
          l.style.opacity = pop.op;
          const mid = (n - 1) / 2, off = i - mid;
          const spread = kf(t, [[650, 0], [1050, 1, E.outBack(1.6)]]);
          const gapX = off * spread * 150;
          const fly = clamp((t - 1350 - Math.abs(off) * 40) / 480);
          const dirY = i % 2 ? 1 : -1;
          const fy = E.inBack(1.5)(fly) * 1250 * dirY;
          const rot = E.inQuad(fly) * 22 * dirY * (off < 0 ? -1 : 1);
          c.style.transform = `translate(${gapX}px,${fy}px) rotate(${rot}deg)`;
        });
      }
    };
  };

})(window.G3M = window.G3M || {});
