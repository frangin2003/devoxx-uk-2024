/* Transitions, part 2: sweeps. Something crosses the frame; the next scene is
 * revealed along its trailing edge, so the cut is continuous rather than a
 * cover-and-swap. */
(function (G3M) {
  "use strict";
  const { s, set, C, kf, ease: E, clamp } = G3M;
  const T = G3M.transitions;
  const W = 1920, H = 1080;

  const poly = pts => "polygon(" + pts.map(p => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(",") + ")";
  const pathOf = pts => "M" + pts.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" L") + " Z";

  // 03: a slanted yellow slab slashes across, black blade leading
  T.diagonalSlash = function (ctx, cfg = {}) {
    const slant = cfg.slant ?? .42, band = cfg.band ?? 620, dir = cfg.direction === "left" ? -1 : 1;
    const svg = G3M.svgLayer(ctx.fx, W, H);
    const slab = s("path", { fill: G3M.color(cfg.color || "yellow") }, svg);
    const blade = s("path", { fill: C.ink }, svg);
    const off = slant * H / 2;
    const edge = (e, dy) => e + slant * dy;          // x of a slanted line at vertical offset dy
    const mirror = pts => dir > 0 ? pts : pts.map(([x, y]) => [W - x, y]);
    return {
      duration: cfg.duration ?? 720,
      render(p) {
        const e = kf(p, [[0, -band - off - 160], [1, W + off + 260, E.whip]]);   // trailing edge
        const trail = (dy) => edge(e, dy);
        const lead = (dy) => edge(e + band, dy);
        slab.setAttribute("d", pathOf(mirror([[trail(-H / 2), 0], [lead(-H / 2), 0], [lead(H / 2), H], [trail(H / 2), H]])));
        const b0 = e + band + 34, b1 = b0 + 46;
        blade.setAttribute("d", pathOf(mirror([[edge(b0, -H / 2), 0], [edge(b1, -H / 2), 0], [edge(b1, H / 2), H], [edge(b0, H / 2), H]])));
        ctx.to.style.clipPath = poly(mirror([[-400, 0], [trail(-H / 2) + 1, 0], [trail(H / 2) + 1, H], [-400, H]]));
      }
    };
  };

  // 05: a thick rounded band wipes across
  T.wipe = function (ctx, cfg = {}) {
    const band = cfg.band ?? 700;
    const svg = G3M.svgLayer(ctx.fx, W, H);
    const pill = s("rect", { y: -60, height: H + 120, rx: (H + 120) / 2, width: band + H, fill: G3M.color(cfg.color || "yellow") }, svg);
    const trailCap = s("rect", { y: -60, height: H + 120, width: 0, fill: G3M.color(cfg.color || "yellow") }, svg);
    return {
      duration: cfg.duration ?? 700,
      render(p) {
        const e = kf(p, [[0, -band - H], [1, W + 60, E.whip]]);     // trailing x
        set(pill, { x: e });
        set(trailCap, { x: e, width: H / 2 });                        // flat trailing edge
        ctx.to.style.clipPath = `inset(0 ${Math.max(0, W - e - 1)}px 0 0)`;
      }
    };
  };

  // 12: a yellow wave rolls across; its trailing crest reveals the next scene
  T.wave = function (ctx, cfg = {}) {
    const band = cfg.band ?? 520, amp = cfg.amplitude ?? 70, wl = cfg.wavelength ?? 540;
    const svg = G3M.svgLayer(ctx.fx, W, H);
    const body = s("path", { fill: G3M.color(cfg.color || "yellow") }, svg);
    const crest = s("path", { fill: "none", stroke: C.ink, "stroke-width": 16, "stroke-linecap": "round" }, svg);
    const N = 36;
    const xs = (base, phase) => {
      const out = [];
      for (let i = 0; i <= N; i++) {
        const y = -40 + (H + 80) * i / N;
        out.push([base + Math.sin(y / wl * Math.PI * 2 + phase) * amp, y]);
      }
      return out;
    };
    return {
      duration: cfg.duration ?? 950,
      render(p) {
        const e = kf(p, [[0, -band - amp * 3], [1, W + amp * 3, E.inOutCubic]]);
        const phase = p * Math.PI * 3;
        const trail = xs(e, phase), lead = xs(e + band, phase + .9);
        body.setAttribute("d", pathOf([...trail, ...lead.slice().reverse()]));
        const cr = xs(e + band + 40, phase + 1.1);
        crest.setAttribute("d", "M" + cr.map(q => q[0].toFixed(1) + "," + q[1].toFixed(1)).join(" L"));
        crest.setAttribute("opacity", p < .96 ? 1 : 0);
        ctx.to.style.clipPath = "polygon(" +
          ["-50px -50px", ...trail.map(q => `${(q[0] + 1).toFixed(1)}px ${q[1].toFixed(1)}px`), "-50px 1150px"].join(",") + ")";
      }
    };
  };

})(window.G3M = window.G3M || {});
