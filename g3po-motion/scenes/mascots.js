/* Scenes where the characters carry the idea. */
(function (G3M) {
  "use strict";
  const { h, css, s, set, C, kf, ease: E, clamp } = G3M;
  const S = G3M.scenes;
  const layer = G3M.sceneLayer;
  const L = G3M.g3Life;

  // ------------------------------------------------------------ MascotReaction
  /* A reel of G3's small moves. Tiny movements are funnier than big ones. */
  S.reactions = function (el, cfg) {
    el.style.background = G3M.color(cfg.background || "yellow");
    const svg = G3M.svgLayer(layer(el, 1), 1920, 1080);
    const g3 = G3M.mascot(cfg.mascot || "g3", svg);
    const beats = { glanceL: 600, glanceR: 880, center: 1160, blink: 1450, dbl: 1900, tilt: 2400,
                    surprise: 3150, proud: 3900, wave: 4650 };
    return {
      duration: cfg.duration ?? 5900,
      render(t) {
        const b = beats, life = L.idle(t, 3);
        const pop = kf(t, [[0, 0], [300, 1.12, E.outCubic], [420, .96], [540, 1, E.outQuad]]);
        const lookX = kf(t, [[b.glanceL - 60, 0], [b.glanceL, -1, E.outQuad], [b.glanceR - 60, -1],
          [b.glanceR, 1, E.outQuad], [b.center - 60, 1], [b.center, 0, E.outQuad],
          [b.tilt, 0], [b.tilt + 150, .9, E.outQuad], [b.surprise - 100, .9], [b.surprise, 0]]);
        const tilt = kf(t, [[b.tilt, 0], [b.tilt + 260, 13, E.pop], [b.surprise - 120, 13], [b.surprise, 0, E.outQuad]]);
        const suspicious = t >= b.tilt + 150 && t < b.surprise;
        const surprised = t >= b.surprise && t < b.proud;
        const proud = t >= b.proud;
        const hop = surprised ? kf(t - b.surprise, [[0, 0], [160, 120, E.outQuad], [360, 0, E.inQuad]]) : 0;
        const landSq = surprised ? kf(t - b.surprise, [[0, .14], [80, -.12], [360, -.05], [440, .16, E.outQuad], [620, 0, E.bouncy]]) : 0;
        const proudSq = proud ? kf(t - b.proud, [[0, 0], [120, .12], [320, -.06, E.outQuad], [480, 0, E.outQuad]]) : 0;
        const wave = t >= b.wave ? Math.sin((t - b.wave) / 110) * 22 : 0;
        g3.set({
          x: 960, y: 900, scale: (cfg.scale ?? 1.9) * pop,
          lookX, tilt, lift: hop,
          eyes: surprised ? "wide" : proud ? "happy" : "round",
          blink: suspicious ? .45 : Math.max(L.blink(t, b.blink), L.doubleBlink(t, b.dbl), t > b.wave + 500 ? life.blink : 0),
          squash: landSq + proudSq + life.squash,
          armL: proud && t < b.wave ? kf(t - b.proud, [[0, 0], [260, 150, E.pop]]) : proud ? 20 : 0,
          armR: proud ? (t < b.wave ? kf(t - b.proud, [[0, 0], [260, 150, E.pop]]) : 145 + wave) : 0,
          antenna: L.twang(t, b.surprise + 360, 30) + L.twang(t, b.proud + 200, 16) + life.antenna,
          mouth: surprised ? "o" : "none"
        });
      }
    };
  };

  // ------------------------------------------------------------ Button gag
  /* G3 presses the button. Nothing. He looks at the camera. Then everything. */
  S.buttonGag = function (el, cfg) {
    el.style.background = G3M.color(cfg.background || "white");
    const svg = G3M.svgLayer(layer(el, 1), 1920, 1080);
    const burst = s("g", {}, svg);
    const bx = 1180, by = 900;
    const btn = s("g", {}, svg);
    s("ellipse", { cx: bx, cy: by + 6, rx: 190, ry: 40, fill: "rgba(28,29,31,.15)" }, btn);
    s("rect", { x: bx - 170, y: by - 60, width: 340, height: 70, rx: 30, fill: C.ink }, btn);
    const cap = s("g", {}, btn);
    s("rect", { x: bx - 140, y: by - 120, width: 280, height: 90, rx: 45, fill: G3M.color(cfg.buttonColor || "red") }, cap);
    s("rect", { x: bx - 104, y: by - 110, width: 120, height: 22, rx: 11, fill: "rgba(255,255,255,.38)" }, cap);
    const g3 = G3M.G3(svg);
    const pressAt = 1150, lookAt = 1750, goAt = 2500;
    const rnd = G3M.rng(11), items = [];
    const kinds = ["card", "g3", "card", "pill", "g3", "card", "circle", "pill", "card", "g3", "circle", "card", "pill", "g3"];
    kinds.forEach((k, i) => {
      const a = -Math.PI * (.08 + .84 * (i / (kinds.length - 1))) + (rnd() - .5) * .25;
      items.push({ k, a, v: 1300 + rnd() * 900, spin: (rnd() - .5) * 720, delay: rnd() * 120, g: s("g", {}, burst) });
    });
    for (const it of items) {
      if (it.k === "card") {
        s("rect", { x: -90, y: -52, width: 180, height: 104, rx: 18, fill: "#fff", stroke: C.ink, "stroke-width": 7 }, it.g);
        s("circle", { cx: -48, cy: 0, r: 20, fill: C.green }, it.g);
        s("rect", { x: -16, y: -14, width: 84, height: 12, rx: 6, fill: "#C9CCD0" }, it.g);
        s("rect", { x: -16, y: 8, width: 56, height: 12, rx: 6, fill: "#C9CCD0" }, it.g);
      } else if (it.k === "g3") {
        s("rect", { x: -64, y: -44, width: 128, height: 88, rx: 42, fill: C.yellow, stroke: C.ink, "stroke-width": 7 }, it.g);
        s("circle", { cx: -22, cy: -4, r: 13, fill: C.ink }, it.g); s("circle", { cx: 22, cy: -4, r: 13, fill: C.ink }, it.g);
      } else if (it.k === "pill") {
        s("rect", { x: -80, y: -26, width: 160, height: 52, rx: 26, fill: C.ink }, it.g);
      } else {
        s("circle", { cx: 0, cy: 0, r: 34, fill: C.yellow, stroke: C.ink, "stroke-width": 7 }, it.g);
      }
    }
    return {
      duration: cfg.duration ?? 3900,
      render(t) {
        // walk in, press, wait, look at camera, launch
        const walking = t < 900;
        const x = kf(t, [[0, 360], [900, 900, E.outQuad]]);
        const st = walking ? L.stride(t, 1) : {};
        const pressing = t >= pressAt - 150 && t < pressAt + 420;
        const armR = pressing ? kf(t - (pressAt - 150), [[0, 20], [150, 95, E.outQuad], [420, 60, E.outQuad]]) : 20;
        const capY = kf(t, [[pressAt - 10, 0], [pressAt + 60, 22, E.outQuad], [pressAt + 360, 0, E.pop],
                            [goAt - 40, 0], [goAt + 40, 26, E.outQuad], [goAt + 300, 0, E.pop]]);
        set(cap, { transform: `translate(0,${capY})` });
        const looking = t >= lookAt && t < goAt;
        const blown = t >= goAt;
        const blowX = blown ? kf(t - goAt, [[0, 0], [260, -210, E.outCubic]]) : 0;
        g3.set({
          x: x + blowX, y: 960, scale: 1.25, ...st,
          armR: walking ? st.armR : blown ? 150 : armR, armL: blown ? 150 : walking ? st.armL : 0,
          lookX: looking ? 0 : blown ? 1 : .7, lookY: looking ? .35 : .5,
          blink: looking ? L.blink(t, lookAt + 380) : 0,
          eyes: blown ? "wide" : "round", mouth: blown ? "o" : "none",
          lift: blown ? kf(t - goAt, [[0, 0], [180, 110, E.outQuad], [420, 0, E.inQuad]]) : (st.lift || 0),
          rot: blown ? kf(t - goAt, [[0, 0], [200, -14, E.outQuad], [600, 0, E.outQuad]]) : 0,
          squash: blown ? kf(t - goAt, [[420, 0], [500, .2], [700, 0, E.bouncy]]) : 0,
          antenna: L.twang(t, goAt, 40) + (looking ? 0 : Math.sin(t / 300) * 3)
        });
        // the launch
        for (const it of items) {
          const d = (t - goAt - it.delay) / 1000;
          if (d < 0) { set(it.g, { opacity: 0 }); continue; }
          const px = bx + Math.cos(it.a) * it.v * d;
          const py = by - 90 + Math.sin(it.a) * it.v * d + 900 * d * d;
          const sc = kf(d, [[0, .2], [.12, 1.15, E.outQuad], [.25, 1]]);
          set(it.g, { opacity: 1, transform: `translate(${px},${py}) rotate(${it.spin * d}) scale(${sc})` });
        }
      }
    };
  };

  // ------------------------------------------------------------ AgentMultiplication
  /* Parallel agents: one object splits into many. G3 charges up, pops, and his
   * friends shoot out along arcs. Then he tries to keep track of them all. */
  S.agents = function (el, cfg) {
    el.style.background = G3M.color(cfg.background || "yellow");
    const svg = G3M.svgLayer(layer(el, 1), 1920, 1080);
    const arrows = s("g", {}, svg);
    const cast = (cfg.agents || ["g2d2", "gb8", "pix", "dj", "g3"]).slice(0, 7);
    const home = [960, 1000];
    const spots = [[330, 720], [560, 420], [960, 330], [1360, 420], [1590, 720], [250, 420], [1670, 420]];
    const who = cast.map((name, i) => ({ name, m: G3M.mascot(name, svg), to: spots[i], at: 820 + i * 95 }));
    const paths = who.map(w => s("path", { fill: "none", stroke: C.ink, "stroke-width": 12, "stroke-linecap": "round" }, arrows));
    const heads = who.map(() => s("path", { fill: C.ink }, arrows));
    const g3 = G3M.G3(svg);
    return {
      duration: cfg.duration ?? 3600,
      render(t) {
        const charge = kf(t, [[250, 0], [700, .24, E.inOutQuad], [790, -.16, E.outQuad], [950, .05], [1100, 0, E.outQuad]]);
        const shake = t > 450 && t < 780 ? Math.sin(t / 18) * 5 : 0;
        const look = kf(t, [[1500, 0], [1580, -1, E.outQuad], [1760, -1], [1830, 1, E.outQuad],
                            [2010, 1], [2080, -1, E.outQuad], [2200, -1], [2270, 1, E.outQuad], [2420, 1], [2500, 0, E.outQuad]]);
        g3.set({ x: home[0] + shake, y: home[1], scale: 1.15, squash: charge,
          eyes: t > 450 && t < 790 ? "squint" : t > 2650 ? "happy" : "round", lookX: look,
          blink: L.doubleBlink(t, 2560), antenna: L.twang(t, 790, 34),
          armL: t > 2700 ? kf(t - 2700, [[0, 0], [240, 140, E.pop]]) : 0,
          armR: t > 2700 ? kf(t - 2700, [[0, 0], [240, 140, E.pop]]) : 0 });
        who.forEach((w, i) => {
          const d = t - w.at;
          const p = E.outCubic(clamp(d / 520));
          const [x, y] = G3M.curve([home[0], home[1] - 150], w.to, p, (i < cast.length / 2 ? -1 : 1) * .22);
          const lift = d >= 0 && d < 520 ? Math.sin(p * Math.PI) * 40 : 0;
          const land = d - 520;
          const sq = land >= 0 ? kf(land, [[0, .22], [110, -.08, E.outQuad], [240, 0, E.outQuad]]) : -.1;
          const sc = d < 0 ? 0 : kf(d, [[0, .15], [200, .62, E.outQuad], [520, .78]]);
          w.m.set({ x, y, scale: sc, squash: sq, lift, lookX: land > 300 ? (w.to[0] < 960 ? .6 : -.6) : 0,
            blink: L.blink(t, w.at + 1100 + i * 170), opacity: d < 0 ? 0 : 1, roll: d * .3 });
          // arrow traces the flight
          const ap = E.outCubic(clamp((d + 60) / 420));
          const pts = [];
          for (let k = 0; k <= 16; k++) pts.push(G3M.curve([home[0], home[1] - 190], [w.to[0], w.to[1] + 30], k / 16 * ap * .82, (i < cast.length / 2 ? -1 : 1) * .22));
          paths[i].setAttribute("d", "M" + pts.map(q => q[0].toFixed(1) + "," + q[1].toFixed(1)).join(" L"));
          const fade = 1 - clamp((t - 2200) / 400);
          paths[i].setAttribute("opacity", d > -60 ? fade : 0);
          const a = pts[pts.length - 1], b = pts[pts.length - 2] || a;
          const ang = Math.atan2(a[1] - b[1], a[0] - b[0]);
          const hd = [[a[0] + Math.cos(ang) * 22, a[1] + Math.sin(ang) * 22],
                      [a[0] + Math.cos(ang + 2.3) * 22, a[1] + Math.sin(ang + 2.3) * 22],
                      [a[0] + Math.cos(ang - 2.3) * 22, a[1] + Math.sin(ang - 2.3) * 22]];
          heads[i].setAttribute("d", "M" + hd.map(q => q.join(",")).join(" L") + " Z");
          heads[i].setAttribute("opacity", d > 0 ? fade : 0);
        });
      }
    };
  };

  // ------------------------------------------------------------ Converge / DONE.
  /* Orchestration: many objects converge into one clean result. */
  S.converge = function (el, cfg) {
    el.style.background = G3M.color(cfg.background || "yellow");
    const inner = layer(el, 1);            // shaken; the background stays put
    const svg = G3M.svgLayer(layer(inner, 1), 1920, 1080);
    const textLayer = layer(inner, 2);
    const bt = G3M.BigText(textLayer, { text: [cfg.text || "DONE."], width: .66, stretch: 72, color: "ink" });
    bt.el.style.transform = "translateY(-300px)";
    const g3 = G3M.G3(svg);
    const n = cfg.count ?? 6, rnd = G3M.rng(4);
    const ticks = [C.green, C.blue, C.red, C.green, C.green, C.blue, C.green];
    const cards = [];
    for (let i = 0; i < n; i++) {
      const g = s("g", {}, svg);
      s("rect", { x: -120, y: -56, width: 240, height: 112, rx: 22, fill: "#fff", stroke: C.ink, "stroke-width": 8 }, g);
      s("circle", { cx: -64, cy: 0, r: 26, fill: ticks[i % ticks.length] }, g);
      s("path", { d: "M-76,0 l9,10 l18,-20", fill: "none", stroke: "#fff", "stroke-width": 8, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
      s("rect", { x: -24, y: -18, width: 110, height: 14, rx: 7, fill: "#C9CCD0" }, g);
      s("rect", { x: -24, y: 8, width: 76, height: 14, rx: 7, fill: "#C9CCD0" }, g);
      const side = i % 2 ? 1 : -1;
      const start = [960 + side * (1150 + rnd() * 200), 250 + rnd() * 600];
      const a = Math.PI * (1.15 + i / (n - 1) * .7);
      const ring = [960 + Math.cos(a) * 560, 780 + Math.sin(a) * 330];
      cards.push({ g, start, ring, rot: (rnd() - .5) * 40, at: 200 + i * 110 });
    }
    const result = s("g", {}, svg);
    s("rect", { x: -170, y: -80, width: 340, height: 160, rx: 30, fill: C.ink }, result);
    s("path", { d: "M-52,4 l34,34 l72,-76", fill: "none", stroke: C.yellow, "stroke-width": 22, "stroke-linecap": "round", "stroke-linejoin": "round" }, result);
    const mergeAt = 1500, doneAt = 2050;
    return {
      duration: cfg.duration ?? 3500,
      render(t) {
        cards.forEach((c, i) => {
          const d = t - c.at;
          const p = E.outBack(1.3)(clamp(d / 560));
          let [x, y] = G3M.curve(c.start, c.ring, clamp(p, 0, 1.2), .12);
          let sc = 1, rot = c.rot * (1 - clamp(p));
          const m = clamp((t - mergeAt - i * 30) / 360);
          if (m > 0) {
            const q = E.inBack(1.6)(m);
            x = G3M.lerp(x, 960, q); y = G3M.lerp(y, 560, q); sc = 1 - E.inQuad(m) * .8; rot = rot * (1 - m);
          }
          set(c.g, { transform: `translate(${x},${y}) rotate(${rot}) scale(${sc})`, opacity: d < 0 || m >= 1 ? 0 : 1 });
        });
        const r = t - (mergeAt + 330);
        const rs = r < 0 ? 0 : kf(r, [[0, .2], [220, 1.15, E.outCubic], [340, .95], [460, 1, E.outQuad]]);
        set(result, { transform: `translate(960,560) scale(${rs})`, opacity: r < 0 ? 0 : 1 });
        G3M.animateText(bt, t - doneAt, { entrance: "slam", rotate: -2 });
        const cheer = t > mergeAt + 400;
        g3.set({ x: 960, y: 1030, scale: .95, eyes: cheer ? "happy" : "round",
          lookY: cheer ? 0 : -.6, lookX: Math.sin(t / 240) * (cheer ? 0 : .8),
          armL: cheer ? kf(t - mergeAt - 400, [[0, 0], [220, 150, E.pop]]) : 0,
          armR: cheer ? kf(t - mergeAt - 400, [[0, 0], [220, 150, E.pop]]) : 0,
          squash: cheer ? kf(t - mergeAt - 400, [[0, .1], [200, -.06, E.outQuad], [360, 0, E.outQuad]]) : 0,
          lift: t > doneAt + 210 ? kf(t - doneAt - 210, [[0, 0], [160, 70, E.outQuad], [340, 0, E.inQuad]]) : 0,
          antenna: L.twang(t, doneAt + 210, 30) });
        const [sx, sy] = G3M.shake(t, doneAt + 210, 300, 16, 9);
        inner.style.transform = `translate(${sx}px,${sy}px)`;
      }
    };
  };

})(window.G3M = window.G3M || {});
