/* g3po motion — core
 *
 * Every animation in this toolkit is a pure function of time. Nothing relies on
 * wall-clock CSS animations: a Timeline renders the exact state for any t, so a
 * frame can be reproduced by seeking. That is what makes export deterministic
 * and the playground scrubber frame-accurate.
 */
(function (G3M) {
  "use strict";

  // ------------------------------------------------------------------ palette
  G3M.C = {
    yellow: "#FFC400", yellowDeep: "#E6AA00", ink: "#1C1D1F", white: "#F7F3EA",
    cheek: "#F2994A", red: "#E0452B", grey: "#C9CCD0", steel: "#8C959E",
    blue: "#2F6FB5", green: "#3FA66B", paper: "#FFFDF7"
  };
  G3M.FONT = "'Archivo', 'Archivo Black', 'Arial Black', 'Helvetica Neue', Arial, 'DejaVu Sans', sans-serif";

  // Accept palette names or raw colours anywhere a colour is configured.
  G3M.color = function (c) { return (c && G3M.C[c]) || c || G3M.C.yellow; };

  // ------------------------------------------------------------------ maths
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, start, dur) => dur <= 0 ? (t >= start ? 1 : 0) : clamp((t - start) / dur);
  G3M.clamp = clamp; G3M.lerp = lerp; G3M.prog = prog;

  // ------------------------------------------------------------------ easing
  const E = {
    linear: t => t,
    inQuad: t => t * t,
    outQuad: t => 1 - (1 - t) * (1 - t),
    inOutQuad: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    inCubic: t => t * t * t,
    outCubic: t => 1 - Math.pow(1 - t, 3),
    inOutCubic: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    outQuint: t => 1 - Math.pow(1 - t, 5),
    inExpo: t => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
    outExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    inOutExpo: t => t === 0 ? 0 : t === 1 ? 1 : t < .5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
    outBack: (s = 1.70158) => t => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
    inBack: (s = 1.70158) => t => (s + 1) * t * t * t - s * t * t,
    // damped oscillation that settles exactly on 1
    spring: (bounces = 2.2, damping = 5.5) => t =>
      t >= 1 ? 1 : 1 - Math.exp(-damping * t) * Math.cos(bounces * Math.PI * t) * (1 - t * 0.02)
  };
  // Named presets: the house personality.
  E.pop = E.outBack(2.4);          // ~12% overshoot
  E.snap = E.outQuint;
  E.whip = E.inOutExpo;
  E.bouncy = E.spring(2.4, 5);
  E.settle = E.spring(1.6, 6.5);
  G3M.ease = E;
  G3M.easing = function (name) {
    if (typeof name === "function") return name;
    if (!name) return E.snap;
    const e = E[name];
    if (typeof e === "function" && e.length === 0 && (name === "outBack" || name === "inBack" || name === "spring"))
      return e();
    return e || E.snap;
  };

  /* Keyframes: kf(t, [[time, value, ease], ...]). The ease on a frame shapes the
   * segment arriving at it. Values can be numbers or arrays of numbers. Easing
   * curves are allowed to overshoot (outBack, spring) and values extrapolate. */
  function mix(a, b, t) {
    if (Array.isArray(a)) return a.map((v, i) => lerp(v, b[i], t));
    return lerp(a, b, t);
  }
  G3M.kf = function (t, frames) {
    if (t <= frames[0][0]) return frames[0][1];
    for (let i = 1; i < frames.length; i++) {
      const f = frames[i];
      if (t <= f[0]) {
        const a = frames[i - 1];
        const p = (t - a[0]) / ((f[0] - a[0]) || 1);
        return mix(a[1], f[1], (f[2] || E.linear)(clamp(p)));
      }
    }
    return frames[frames.length - 1][1];
  };

  // Seeded randomness so jitter (typing speed, confetti, shake) is repeatable.
  G3M.rng = function (seed = 1) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };

  // Decaying shake, deterministic for a given seed.
  G3M.shake = function (t, t0, dur, amp, seed = 7) {
    const p = (t - t0) / dur;
    if (p < 0 || p > 1) return [0, 0];
    const d = Math.pow(1 - p, 2) * amp;
    const k = Math.floor((t - t0) / 16);
    const r = G3M.rng(seed * 997 + k);
    return [(r() * 2 - 1) * d, (r() * 2 - 1) * d];
  };

  // Quadratic bezier with a bend, for curved motion paths.
  G3M.curve = function (a, b, t, bend = 0.18) {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const cx = mx - dy * bend, cy = my + dx * bend;
    const u = 1 - t;
    return [u * u * a[0] + 2 * u * t * cx + t * t * b[0],
            u * u * a[1] + 2 * u * t * cy + t * t * b[1]];
  };

  // ------------------------------------------------------------------ DOM
  const SVGNS = "http://www.w3.org/2000/svg";
  G3M.h = function (tag, props, parent) {
    const el = document.createElement(tag);
    if (props) for (const k in props) {
      if (k === "style" && typeof props[k] === "object") Object.assign(el.style, props[k]);
      else if (k === "text") el.textContent = props[k];
      else if (k === "html") el.innerHTML = props[k];
      else el.setAttribute(k, props[k]);
    }
    if (parent) parent.appendChild(el);
    return el;
  };
  G3M.s = function (tag, attrs, parent) {
    const el = document.createElementNS(SVGNS, tag);
    if (attrs) for (const k in attrs) {
      if (k === "text") el.textContent = attrs[k]; else el.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(el);
    return el;
  };
  G3M.set = function (el, attrs) { for (const k in attrs) el.setAttribute(k, attrs[k]); return el; };
  G3M.css = function (el, style) { Object.assign(el.style, style); return el; };

  /* Text width at a given size, measured in an off-screen probe. Scenes are
   * built while hidden (display: none), where layout reports zero, so any
   * measuring has to happen outside them. */
  let probe = null;
  G3M.measureText = function (text, style = {}) {
    if (!probe) {
      probe = document.createElement("span");
      Object.assign(probe.style, { position: "absolute", left: "-99999px", top: "0", visibility: "hidden",
        whiteSpace: "pre", pointerEvents: "none" });
      document.body.appendChild(probe);
    }
    Object.assign(probe.style, { fontFamily: G3M.FONT, fontWeight: 900, fontStretch: "100%", fontSize: "100px",
      letterSpacing: "0", textTransform: "none" }, style);
    probe.textContent = text;
    return probe.getBoundingClientRect().width;
  };

  // Full-frame layer helpers
  G3M.fill = { position: "absolute", left: "0", top: "0", width: "100%", height: "100%" };
  G3M.svgLayer = function (parent, W, H, z) {
    const svg = G3M.s("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H }, parent);
    Object.assign(svg.style, G3M.fill, { overflow: "visible", pointerEvents: "none" });
    if (z != null) svg.style.zIndex = z;
    return svg;
  };

  // ------------------------------------------------------------------ Stage
  /* A 1920x1080 (configurable) frame, scaled to fit its host. All scene
   * coordinates are in stage pixels regardless of the display size. */
  G3M.Stage = class Stage {
    constructor(host, opts = {}) {
      this.W = opts.width || 1920;
      this.H = opts.height || 1080;
      this.host = host;
      host.innerHTML = "";
      host.style.position = host.style.position || "relative";
      this.root = G3M.h("div", { class: "g3-stage" }, host);
      G3M.css(this.root, {
        position: "absolute", left: "0", top: "0", width: this.W + "px", height: this.H + "px",
        overflow: "hidden", transformOrigin: "0 0", background: G3M.color(opts.background || "white"),
        fontFamily: G3M.FONT, contain: "strict"
      });
      this.scenes = G3M.h("div", {}, this.root); G3M.css(this.scenes, G3M.fill);
      this.fx = G3M.h("div", {}, this.root);     G3M.css(this.fx, G3M.fill); this.fx.style.zIndex = 50;
      this.top = G3M.h("div", {}, this.root);    G3M.css(this.top, G3M.fill); this.top.style.zIndex = 90;
      this.fit();
      if (window.ResizeObserver) {
        this._ro = new ResizeObserver(() => this.fit());
        this._ro.observe(host);
      }
    }
    fit() {
      const w = this.host.clientWidth || this.W;
      const s = w / this.W;
      this.scale = s;
      this.root.style.transform = `scale(${s})`;
      this.host.style.height = (this.H * s) + "px";
    }
    destroy() { if (this._ro) this._ro.disconnect(); this.host.innerHTML = ""; }
  };

  // ------------------------------------------------------------------ Timeline
  /* Items are renderers placed on a time axis. render(lt, state, t) receives the
   * local time clamped to the item, a state (-1 before, 0 during, 1 after) and
   * the global time. Items hold their first frame before they start and their
   * last frame after they end, so seeking anywhere gives a coherent picture. */
  G3M.Timeline = class Timeline {
    constructor() { this.items = []; this.duration = 0; this.markers = []; }
    add(render, start = 0, duration = 0, opts = {}) {
      const it = { render, start, duration, z: opts.z || 0 };
      this.items.push(it);
      this.duration = Math.max(this.duration, start + duration);
      return it;
    }
    mark(label, t) { this.markers.push({ label, t }); }
    extend(t) { this.duration = Math.max(this.duration, t); }
    /* Two passes: items outside their span first (holds, resets), then the
     * active ones. An idle transition resetting a scene's styles must never
     * run after an active transition has just set them. */
    render(t) {
      const active = [];
      for (const it of this.items) {
        const lt = t - it.start;
        const state = lt < 0 ? -1 : lt > it.duration ? 1 : 0;
        if (state === 0) active.push([it, lt]);
        else it.render(clamp(lt, 0, it.duration), state, t);
      }
      for (const [it, lt] of active) it.render(clamp(lt, 0, it.duration), 0, t);
    }
  };

  // ------------------------------------------------------------------ Player
  G3M.Player = class Player {
    constructor(timeline, opts = {}) {
      this.tl = timeline; this.t = 0; this.playing = false;
      this.rate = 1; this.loop = !!opts.loop; this.listeners = [];
      this._tick = this._tick.bind(this);
    }
    on(fn) { this.listeners.push(fn); return this; }
    play() {
      if (this.t >= this.tl.duration) this.t = 0;
      this.playing = true; this._last = performance.now();
      requestAnimationFrame(this._tick); this._emit();
    }
    pause() { this.playing = false; this._emit(); }
    toggle() { this.playing ? this.pause() : this.play(); }
    replay() { this.t = 0; this.render(); this.play(); }
    seek(t) { this.t = clamp(t, 0, this.tl.duration); this.render(); }
    render() { this.tl.render(this.t); this._emit(); }
    _emit() { for (const f of this.listeners) f(this.t, this); }
    _tick(now) {
      if (!this.playing) return;
      const dt = Math.min(100, now - this._last); this._last = now;
      this.t += dt * this.rate;
      if (this.t >= this.tl.duration) {
        if (this.loop && this.tl.duration > 0) this.t %= this.tl.duration;
        else { this.t = this.tl.duration; this.playing = false; }
      }
      this.render();
      if (this.playing) requestAnimationFrame(this._tick);
    }
  };

  /* Deterministic frame export. In a headless browser:
   *   G3M.frameTimes(fps) -> [0, 16.67, ...]; call window.g3Seek(t) per frame
   * then screenshot. tools/render.py does exactly this. */
  G3M.frameTimes = function (duration, fps = 60) {
    const n = Math.ceil(duration / 1000 * fps) + 1, out = [];
    for (let i = 0; i < n; i++) out.push(Math.min(duration, i * 1000 / fps));
    return out;
  };

})(window.G3M = window.G3M || {});
