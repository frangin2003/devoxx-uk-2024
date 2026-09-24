/* The g3po logo ident.
 *
 * A yellow ribbon flows in, curls into a spiral, and the spiral becomes G3's
 * head. The letters snap in, the eyes open, look left, look right, and smile.
 * The loop version unwinds back into the ribbon and flows out, so it can
 * repeat forever without a seam.
 */
(function (G3M) {
  "use strict";
  const { h, css, s, set, C, kf, ease: E, clamp } = G3M;
  const S = G3M.scenes;
  const layer = G3M.sceneLayer;

  const HX = 800, HY = 400, HW = 500, HH = 340, HR = 165, HROT = -9;

  function polyLen(pts) {
    let L = 0; const acc = [0];
    for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); acc.push(L); }
    return { L, acc };
  }
  function spiral(cx, cy, r0, r1, a0, turns, n, ry = .72) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, a = a0 + turns * Math.PI * 2 * u, r = G3M.lerp(r0, r1, E.inOutQuad(u));
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * ry]);
    }
    return pts;
  }
  // flows in from the left, then curls clockwise down into the head's centre
  function entryPath() {
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const u = i / 40, x = -260 + u * 700;
      pts.push([x, 820 - Math.sin(u * Math.PI * 1.4) * 170 - u * 60]);
    }
    const last = pts[pts.length - 1];
    const a0 = Math.atan2((last[1] - HY) / .72, last[0] - HX);
    const r0 = Math.hypot(last[0] - HX, (last[1] - HY) / .72);
    return pts.concat(spiral(HX, HY, r0, 0, a0, 1.6, 90).slice(1));
  }
  // unwinds from the head's centre and flows off to the right
  function exitPath() {
    const sp = spiral(HX, HY, 0, 470, Math.PI * .6, 1.4, 80);
    const last = sp[sp.length - 1], pts = sp.slice();
    for (let i = 1; i <= 40; i++) {
      const u = i / 40;
      pts.push([last[0] + u * (2300 - last[0]), last[1] + Math.sin(u * Math.PI * 1.3) * 150]);
    }
    return pts;
  }

  G3M.Logo = function Logo(parent, cfg = {}) {
    const svg = G3M.svgLayer(parent, 1920, 1080);
    const yellow = G3M.color(cfg.color || "yellow"), ink = C.ink;
    const inPts = entryPath(), outPts = exitPath();
    const inM = polyLen(inPts), outM = polyLen(outPts);
    const d = pts => "M" + pts.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" L");
    const ribbonG = s("g", {}, svg);
    const mkRibbon = pts => ({
      under: s("path", { d: d(pts), fill: "none", stroke: ink, "stroke-width": 92, "stroke-linecap": "round", "stroke-linejoin": "round" }, ribbonG),
      over: s("path", { d: d(pts), fill: "none", stroke: yellow, "stroke-width": 62, "stroke-linecap": "round", "stroke-linejoin": "round" }, ribbonG)
    });
    const rIn = mkRibbon(inPts), rOut = mkRibbon(outPts);

    const mark = s("g", {}, svg);
    // letters first, so the head overlaps the top of the g the way the mark does
    // All outlines are drawn first, then all fills, so overlapping letters
    // fuse into one sticker silhouette the way the printed mark does.
    const wordStroke = s("g", {}, mark), wordFill = s("g", {}, mark);
    const letters = [];
    const chars = (cfg.wordmark || "g3po").split("");
    const size = 330;
    let x = 560;
    const glyph = (parent, ch, attrs) => {
      const g = s("g", {}, parent);
      const tx = s("text", { x: 0, y: 0, "font-size": size, "font-weight": 900, "font-family": G3M.FONT,
        "text-anchor": "middle", text: ch, ...attrs }, g);
      tx.style.fontStretch = "88%";
      return g;
    };
    for (const ch of chars) {
      const gs = glyph(wordStroke, ch, { fill: ink, stroke: ink, "stroke-width": 34, "stroke-linejoin": "round" });
      const gf = glyph(wordFill, ch, { fill: yellow });
      letters.push({ gs, gf, ch });
    }
    // measure and lay out the letters on a common baseline
    let adv = letters.map(l => G3M.measureText(l.ch, { fontSize: size + "px", fontStretch: "88%" }));
    if (!adv.every(a => a > 0)) adv = letters.map(l => l.ch === "3" ? 190 : l.ch === "p" || l.ch === "g" ? 205 : 200);
    letters.forEach((l, i) => { l.cx = x + adv[i] / 2; l.cy = 850; x += adv[i] - 8; });

    const head = s("g", {}, mark);
    const ant = s("g", {}, head);
    s("path", { d: `M0,${-HH / 2 + 8} L0,${-HH / 2 - 70}`, stroke: ink, "stroke-width": 30, "stroke-linecap": "round" }, ant);
    s("path", { d: `M0,${-HH / 2 + 8} L0,${-HH / 2 - 70}`, stroke: "#B9BCC0", "stroke-width": 14, "stroke-linecap": "round" }, ant);
    s("circle", { cx: 0, cy: -HH / 2 - 88, r: 30, fill: C.red, stroke: ink, "stroke-width": 12 }, ant);
    s("rect", { x: -HW / 2, y: -HH / 2, width: HW, height: HH, rx: HR, fill: yellow, stroke: ink, "stroke-width": 30 }, head);
    const cheeks = s("g", {}, head);
    s("circle", { cx: -168, cy: 66, r: 34, fill: C.cheek, opacity: .9 }, cheeks);
    s("circle", { cx: 168, cy: 66, r: 34, fill: C.cheek, opacity: .9 }, cheeks);
    const eyes = s("g", {}, head);
    const discs = [], happy = s("g", {}, head);
    for (const ex of [-96, 96]) {
      const e = s("g", {}, eyes);
      const disc = s("g", {}, e);
      s("circle", { cx: 0, cy: 0, r: 64, fill: ink }, disc);
      s("circle", { cx: -20, cy: -22, r: 21, fill: "#fff" }, disc);
      s("circle", { cx: 22, cy: 24, r: 9, fill: "#C9CCD0" }, disc);
      discs.push({ e, disc, ex });
      s("path", { d: `M${ex - 40},${14} Q${ex},${-40} ${ex + 40},${14}`, fill: "none", stroke: ink,
        "stroke-width": 24, "stroke-linecap": "round" }, happy);
    }
    const sparks = s("g", {}, mark);
    const sp = [[-.9, -.95], [-.2, -1.15], [.55, -1.0]];
    const sparkEls = sp.map(() => s("path", { stroke: ink, "stroke-width": 16, "stroke-linecap": "round" }, sparks));

    let tag = null;
    if (cfg.tagline) {
      tag = h("div", { text: cfg.tagline }, parent);
      css(tag, { position: "absolute", left: "0", right: "0", top: "992px", textAlign: "center",
        fontFamily: G3M.FONT, fontWeight: 800, fontSize: "40px", letterSpacing: ".22em", textTransform: "uppercase",
        color: ink, opacity: 0 });
    }

    function ribbon(r, M, s0, s1) {
      const len = Math.max(0, s1 - s0);
      for (const p of [r.under, r.over]) {
        p.setAttribute("stroke-dasharray", `${len} ${M.L + 400}`);
        p.setAttribute("stroke-dashoffset", String(-s0));
        p.setAttribute("opacity", len > 1 ? 1 : 0);
      }
    }

    return {
      svg, tag, inLen: inM.L, outLen: outM.L,
      /* state: { rin:[s0,s1], rout:[s0,s1], head:{sc,rot}, letters:[{y,sc,rot,op}],
       *          eyes:{sc,lookX,blink,happy}, cheeks, antenna:{sc,rot}, sparks, squash, tag } */
      set(st) {
        ribbon(rIn, inM, ...(st.rin || [0, 0]));
        ribbon(rOut, outM, ...(st.rout || [0, 0]));
        const hd = st.head || { sc: 0 };
        set(head, { transform: `translate(${HX},${HY}) rotate(${HROT + (hd.rot || 0)}) scale(${Math.max(0, hd.sc)})`,
          opacity: hd.sc > .01 ? 1 : 0 });
        letters.forEach((l, i) => {
          const f = (st.letters && st.letters[i]) || { sc: 0, op: 0 };
          const tr = { transform: `translate(${l.cx},${l.cy + (f.y || 0)}) rotate(${f.rot || 0}) scale(${Math.max(0, f.sc ?? 1)})`,
            opacity: f.op ?? 1 };
          set(l.gs, tr); set(l.gf, tr);
        });
        const ey = st.eyes || { sc: 0 };
        discs.forEach(dd => {
          set(dd.e, { transform: `translate(${dd.ex},-8) scale(${Math.max(0, ey.sc)},${Math.max(.05, ey.sc * (1 - (ey.blink || 0)))})`,
            opacity: ey.happy ? 0 : 1 });
          set(dd.disc, { transform: `translate(${(ey.lookX || 0) * 26},${(ey.lookY || 0) * 12})` });
        });
        set(happy, { opacity: ey.happy ? 1 : 0, transform: `translate(0,-8)` });
        set(cheeks, { opacity: st.cheeks ?? 0, transform: `translate(0,${ey.happy ? -8 : 0})` });
        const an = st.antenna || { sc: 0 };
        set(ant, { transform: `rotate(${an.rot || 0} 0 ${-HH / 2}) scale(1,${Math.max(0, an.sc)})`,
          opacity: an.sc > .02 ? 1 : 0 });
        const sq = st.squash || 0;
        set(mark, { transform: `translate(960,1000) scale(${1 + sq * .6},${1 - sq}) translate(-960,-1000)` });
        const k = st.sparks || 0;
        sparkEls.forEach((el, i) => {
          const [dx, dy] = sp[i];
          const cx = HX + dx * HW * .62, cy = HY + dy * HH * .62;
          const len = 26 + k * 22, off = 10 + k * 26;
          const a = Math.atan2(dy, dx);
          el.setAttribute("d", `M${cx + Math.cos(a) * off},${cy + Math.sin(a) * off} l${Math.cos(a) * len},${Math.sin(a) * len}`);
          el.setAttribute("opacity", k > 0 && k < 1 ? 1 - k * .5 : 0);
        });
        if (tag) { tag.style.opacity = st.tag ?? 0; tag.style.transform = `translateY(${(1 - (st.tag ?? 0)) * 26}px)`; }
      }
    };
  };

  /* The shared build-up, 0 -> ~3000 ms. Returns a logo state for time t. */
  function identState(t, logo, cfg) {
    const ribbonEnd = 920;
    const s1 = logo.inLen * E.inOutCubic(clamp(t / ribbonEnd));
    const s0 = Math.max(0, s1 - 1200) + logo.inLen * E.inQuad(clamp((t - ribbonEnd + 160) / 300));
    const head = { sc: kf(t, [[ribbonEnd - 90, 0], [ribbonEnd + 170, 1.1, E.outCubic], [ribbonEnd + 300, .96], [ribbonEnd + 420, 1, E.outQuad]]),
                   rot: kf(t, [[ribbonEnd - 90, -40], [ribbonEnd + 360, 0, E.pop]]) };
    const letters = [0, 1, 2, 3].map(i => {
      const lt = t - (1120 + i * 85);
      return lt < 0 ? { sc: 0, op: 0 } : {
        y: kf(lt, [[0, 170], [230, -18, E.outCubic], [360, 0, E.outQuad]]),
        sc: kf(lt, [[0, .4], [230, 1.08, E.outCubic], [360, 1, E.outQuad]]),
        rot: kf(lt, [[0, (i % 2 ? 14 : -14)], [360, 0, E.pop]]), op: 1 };
    });
    const eyeSc = kf(t, [[1520, 0], [1680, 1.16, E.outCubic], [1800, 1, E.outQuad]]);
    // the beat: left, hold, right, hold, smile
    const L1 = 2020, R1 = L1 + 90 + 150, C1 = R1 + 90 + 130, SMILE = C1 + 70;
    const lookX = kf(t, [[L1, 0], [L1 + 90, -1, E.outQuad], [R1, -1], [R1 + 90, 1, E.outQuad], [C1, 1], [C1 + 70, 0, E.outQuad]]);
    const happy = t >= SMILE;
    const antOn = cfg.antenna !== false;
    const antenna = antOn ? { sc: kf(t, [[SMILE + 40, 0], [SMILE + 200, 1.15, E.outCubic], [SMILE + 320, 1, E.outQuad]]),
                              rot: G3M.g3Life.twang(t, SMILE + 200, 16) } : { sc: 0 };
    const squash = kf(t, [[SMILE + 260, 0], [SMILE + 330, .03, E.outQuad], [SMILE + 520, 0, E.settle]]);
    return {
      rin: [s0, s1], rout: [0, 0], head, letters,
      eyes: { sc: eyeSc, lookX, happy, blink: G3M.g3Life.blink(t, 1880) },
      cheeks: clamp((t - 1650) / 200), antenna, squash,
      sparks: clamp((t - SMILE) / 520),
      tag: E.outCubic(clamp((t - (SMILE + 160)) / 420))
    };
  }

  // ------------------------------------------------------------ LogoIdent
  S.logo = function (el, cfg) {
    el.style.background = G3M.color(cfg.background || "white");
    const logo = G3M.Logo(layer(el, 1), cfg);
    return { duration: cfg.duration ?? 3600, render(t) { logo.set(identState(t, logo, cfg)); } };
  };

  // ------------------------------------------------------------ LogoLoop
  /* Seamless: frame 0 and the final frame are both an empty stage, and the
   * ribbon that leaves on the right is the same motion that arrives on the
   * left, so it reads as one continuous flow. */
  S.logoLoop = function (el, cfg) {
    el.style.background = G3M.color(cfg.background || "white");
    const logo = G3M.Logo(layer(el, 1), { ...cfg, tagline: null });
    const D = cfg.duration ?? 5400, OUT = D - 1350;
    return {
      duration: D, loop: true,
      render(t) {
        const st = identState(Math.min(t, OUT), logo, cfg);
        if (t > OUT) {
          const d = t - OUT;
          const shrink = E.inBack(1.7)(clamp(d / 420));
          st.head = { sc: 1 - shrink, rot: shrink * 40 };
          st.letters = st.letters.map((l, i) => {
            const q = E.inBack(1.7)(clamp((d - (3 - i) * 40) / 380));
            return { ...l, sc: 1 - q, y: q * 40 };
          });
          st.eyes = { ...st.eyes, sc: 1 - shrink };
          st.antenna = { sc: 1 - shrink, rot: 0 };
          st.cheeks = 1 - shrink; st.sparks = 0;
          const u = clamp((d - 160) / 1150);
          const s1 = logo.outLen * E.inOutCubic(u);
          const s0 = Math.max(0, s1 - 1200) + logo.outLen * E.inQuad(clamp((d - 900) / 450));
          st.rout = [Math.min(s0, s1), s1];
        }
        logo.set(st);
      }
    };
  };

  // ------------------------------------------------------------ EndCard
  S.endCard = function (el, cfg) {
    el.style.background = G3M.color(cfg.background || "white");
    const logo = G3M.Logo(layer(el, 1), { ...cfg, tagline: cfg.tagline ?? "Agents for a brighter tomorrow" });
    let cta = null;
    if (cfg.cta) {
      cta = h("div", { text: cfg.cta }, layer(el, 2));
      css(cta, { position: "absolute", right: "140px", top: "470px", background: C.ink, color: C.white,
        fontFamily: G3M.FONT, fontWeight: 900, fontSize: "56px", padding: "26px 52px", borderRadius: "60px" });
    }
    return {
      duration: cfg.duration ?? 2600,
      render(t) {
        const base = identState(3400, logo, cfg);   // the settled mark
        const pop = kf(t, [[0, .6], [260, 1.05, E.outCubic], [400, 1, E.outQuad]]);
        base.head.sc = pop;
        base.letters = base.letters.map((l, i) => ({ ...l, sc: kf(t - i * 50, [[0, .5], [260, 1.05, E.outCubic], [380, 1, E.outQuad]]) }));
        base.eyes = { ...base.eyes, happy: t > 1500, lookX: kf(t, [[700, 0], [790, -1, E.outQuad], [1100, -1], [1190, 0, E.outQuad]]),
          blink: G3M.g3Life.blink(t, 1300) };
        base.sparks = t > 1500 ? clamp((t - 1500) / 500) : 0;
        logo.set(base);
        if (cta) G3M.applyTransform(cta, G3M.textIn.pop(t - 500));
      }
    };
  };

})(window.G3M = window.G3M || {});
