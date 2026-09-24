/* G3Video — the declarative scripting layer.
 *
 *   new G3Video(stage)
 *     .scene("hero", { title: "MEET G3PO" })
 *     .transition("circleExplosion")
 *     .scene("video", { src: "./recordings/agents.mp4" })
 *     .cursor({ x: 1200, y: 620 }).click()
 *     .zoom({ x: .72, y: .34, scale: 2.4 })
 *     .text("EVERYWHERE.", { animation: "slam" })
 *     .transition("g3Run")
 *     .scene("endCard", { cta: "Try g3po" });
 *
 * Every call appends to one Timeline, so the whole promo is a pure function
 * of time: scrub it, loop it, or export it frame by frame.
 */
(function (G3M) {
  "use strict";
  const { h, css, s, set, C, kf, ease: E, clamp } = G3M;

  G3M.G3Video = class G3Video {
    constructor(stage, opts = {}) {
      this.stage = stage;
      this.tl = new G3M.Timeline();
      this.t = 0;
      this.cur = null;
      this.pending = null;
      this.fps = opts.fps || 60;
      this._cursor = null;
    }
    get duration() { return this.tl.duration; }
    timeline() { return this.tl; }

    // ---------------------------------------------------------------- scenes
    scene(type, cfg = {}) {
      const make = G3M.scenes[type];
      if (!make) throw new Error(`Unknown scene "${type}". Available: ${Object.keys(G3M.scenes).join(", ")}`);
      const el = h("div", { class: "g3-scene", "data-scene": type }, this.stage.scenes);
      css(el, { ...G3M.fill, display: "none", overflow: "hidden" });
      const sc = make(el, cfg, this.stage);
      const rec = { type, el, sc, start: this.t, from: this.t, to: Infinity };

      // the cursor belongs to the scene it was used in; it leaves with it
      if (this._cursor && !this._cursor._hidden && this.cur) {
        this._cursor.hide({ at: this.t }); this._cursor._hidden = true;
      }
      if (this.pending && this.cur) {
        const { name, cfg: tcfg } = this.pending;
        const prev = this.cur;
        const mid = h("div", {}, this.stage.scenes);
        css(mid, { ...G3M.fill, display: "none" });
        const fx = h("div", {}, this.stage.fx);
        css(fx, { ...G3M.fill, display: "none" });
        const makeT = G3M.transitions[name];
        if (!makeT) throw new Error(`Unknown transition "${name}". Available: ${Object.keys(G3M.transitions).join(", ")}`);
        const tr = makeT({ stage: this.stage, from: prev.el, to: el, mid, fx }, tcfg);
        const t0 = this.t, D = tr.duration;
        prev.to = t0 + D;
        // visible from the moment the transition starts revealing it, but its
        // own entrance is timed to land as it comes into view
        rec.from = t0;
        rec.start = t0 + D * (tcfg.introAt ?? tr.introAt ?? .45);
        const clear = () => {
          for (const e of [prev.el, el]) {
            e.style.clipPath = ""; e.style.transform = ""; e.style.visibility = "";
            e.style.zIndex = ""; e.style.boxShadow = ""; e.style.transformOrigin = "";
          }
          mid.style.display = "none"; fx.style.display = "none";
        };
        this.tl.add((lt, state) => {
          if (state !== 0) { clear(); return; }
          clear();
          prev.el.style.zIndex = 1; mid.style.zIndex = 2; el.style.zIndex = 3;
          mid.style.display = "block"; fx.style.display = "block";
          tr.render(D ? lt / D : 1);
        }, t0, D);
        this.tl.mark(`${name}`, t0);
        this.pending = null;
        this.t = t0 + D;
      }
      this.tl.add((lt, state, T) => {
        const vis = T >= rec.from && T < rec.to;
        el.style.display = vis ? "block" : "none";
        if (vis) sc.render(T - rec.start, T);
      }, rec.start, 0);
      // scenes are rendered every frame while visible, so register a long span
      this.tl.items[this.tl.items.length - 1].duration = 1e9;
      this.tl.mark(type, rec.start);
      this.cur = rec;
      this.t = Math.max(this.t, rec.start + (sc.duration || 0));
      this.tl.extend(this.t);
      return this;
    }

    transition(name, cfg = {}) { this.pending = { name, cfg }; return this; }
    pause(ms = 400) { this.t += ms; this.tl.extend(this.t); return this; }
    hold(ms = 400) { return this.pause(ms); }

    // ---------------------------------------------------------------- cursor
    get cursorApi() {
      if (!this._cursor) {
        const svg = G3M.svgLayer(this.stage.top, this.stage.W, this.stage.H);
        this._cursor = G3M.Cursor(svg, { x: this.stage.W + 140, y: this.stage.H + 160, scale: 1.2 });
        this.tl.add((lt, st, T) => this._cursor.render(T), 0, 0).duration = 1e9;
      }
      return this._cursor;
    }
    cursor(o = {}) {
      const c = this.cursorApi, dur = o.duration ?? 700;
      const [x, y] = this._toStage(o.x, o.y);
      if (c._hidden) { c.show({ at: this.t }); c._hidden = false; }
      c.move(x, y, { at: this.t, dur, ease: o.ease, bend: o.bend });
      this.t += dur; this.tl.extend(this.t); return this;
    }
    click(o = {}) {
      const c = this.cursorApi; c.click({ at: this.t });
      const [x, y] = c.position(this.t);
      if (this.cur && this.cur.sc.click) this.cur.sc.click(this.t - this.cur.start, x, y);
      this.t += o.hold ?? 320; this.tl.extend(this.t); return this;
    }
    doubleClick(o = {}) {
      const c = this.cursorApi; c.doubleClick({ at: this.t });
      if (this.cur && this.cur.sc.click) this.cur.sc.click(this.t - this.cur.start);
      this.t += o.hold ?? 480; this.tl.extend(this.t); return this;
    }
    drag(from, to, o = {}) {
      const c = this.cursorApi, dur = o.duration ?? 800;
      c.drag(this._toStage(...from), this._toStage(...to), { at: this.t, dur });
      this.t = c.end; this.tl.extend(this.t); return this;
    }
    hideCursor() { this.cursorApi.hide({ at: this.t }); this.cursorApi._hidden = true; return this; }
    showCursor() { this.cursorApi.show({ at: this.t }); this.cursorApi._hidden = false; return this; }

    // Normalised coordinates (0..1) are relative to the current scene's media,
    // if it has any, otherwise to the frame. Larger numbers are stage pixels.
    _toStage(x = .5, y = .5) {
      if (x > 1 || y > 1) return [x, y];
      const m = this.cur && this.cur.sc.media;
      if (m) return m.point(x, y);
      return [x * this.stage.W, y * this.stage.H];
    }

    // ---------------------------------------------------------------- camera
    zoom(o = {}) {
      const sc = this.cur && this.cur.sc;
      if (!sc || !sc.zoom) return this;
      sc.zoom(this.t - this.cur.start, { x: o.x, y: o.y, scale: o.scale ?? 2, duration: o.duration ?? 900,
        dim: o.dim, blur: o.blur, ease: o.ease });
      this.t += o.duration ?? 900; this.tl.extend(this.t); return this;
    }
    zoomTo(o) { return this.zoom(o); }
    zoomReset(o = {}) { return this.zoom({ x: .5, y: .5, scale: 1, duration: o.duration ?? 600, dim: 0, blur: 0 }); }
    spotlight(o) {
      const sc = this.cur && this.cur.sc;
      if (sc && sc.spotlight) sc.spotlight(this.t - this.cur.start, o);
      return this;
    }

    // ---------------------------------------------------------------- overlays
    /* A giant word over the current scene. The footage dims behind it, the
     * word lands, holds, and leaves with its exit. */
    text(str, o = {}) {
      const rec = this.cur; if (!rec) return this;
      const wrap = h("div", {}, rec.el);
      css(wrap, { ...G3M.fill, zIndex: 20, pointerEvents: "none" });
      const dim = h("div", {}, wrap);
      css(dim, { ...G3M.fill, background: G3M.color(o.backdrop || "ink"), opacity: 0 });
      const bt = G3M.BigText(wrap, { text: Array.isArray(str) ? str : String(str).split("|"),
        width: o.width ?? .92, color: o.color || (o.backdrop === "yellow" ? "ink" : "yellow"),
        stretch: o.stretch ?? 70 });
      const t0 = this.t, entrance = o.animation || "slam", hold = o.hold ?? 900, exitDur = 420;
      const n = bt.lines.length, stagger = o.stagger ?? 200;
      const inDur = (entrance === "slam" ? 520 : 560) + (n - 1) * stagger;
      const exitAt = inDur + hold;
      const total = exitAt + (o.exit === "none" ? 0 : exitDur);
      this.tl.add((lt, state, T) => {
        const local = T - t0;
        const on = local >= 0 && T < rec.to && (o.exit === "none" || local <= total);
        wrap.style.display = on ? "block" : "none";
        if (!on) return;
        const dimTo = o.dim ?? .82;
        dim.style.opacity = kf(local, [[0, 0], [160, dimTo, E.outQuad], [exitAt, dimTo], [exitAt + 260, 0, E.inQuad]]);
        G3M.animateText(bt, local, { entrance, stagger, exit: o.exit || "fly", exitAt, rotate: o.rotate });
        const [sx, sy] = entrance === "slam" ? G3M.shake(local, 210, 300, 18, 3) : [0, 0];
        bt.el.style.transform = `translate(${sx}px,${sy}px)`;
      }, t0, 0).duration = 1e9;
      this.t += o.advance ?? total;
      this.tl.extend(this.t);
      return this;
    }

    /* G3 pops into the current scene: "peek" slides up from a corner, looks at
     * the action, blinks, and ducks away. */
    g3(action = "peek", o = {}) {
      const rec = this.cur; if (!rec) return this;
      const svg = G3M.svgLayer(rec.el, this.stage.W, this.stage.H, 25);
      const g3 = G3M.G3(svg);
      const t0 = this.t, dur = o.duration ?? 1600, side = o.side || "left";
      const x = side === "left" ? 190 : this.stage.W - 190, flip = side !== "left";
      this.tl.add((lt, st, T) => {
        const d = T - t0;
        const on = d >= 0 && d <= dur && T < rec.to;
        svg.style.display = on ? "block" : "none";
        if (!on) return;
        const up = kf(d, [[0, 420], [260, -18, E.outCubic], [380, 0, E.outQuad], [dur - 300, 0], [dur, 430, E.inBack(1.6)]]);
        g3.set({ x, y: this.stage.H + 40 + up, scale: 1.25, flip, rot: side === "left" ? 8 : -8,
          lookX: flip ? -1 : 1, lookY: -.35, blink: G3M.g3Life.blink(d, 700),
          eyes: action === "happy" && d > 500 ? "happy" : action === "surprised" ? "wide" : "round",
          antenna: G3M.g3Life.twang(d, 380, 20), armR: action === "point" ? kf(d, [[300, 0], [520, 120, E.pop]]) : 0 });
      }, t0, 0).duration = 1e9;
      if (o.wait !== false) { this.t += o.advance ?? 0; this.tl.extend(t0 + dur); }
      return this;
    }

    // ---------------------------------------------------------------- output
    player(opts) { const p = new G3M.Player(this.tl, opts); p.seek(0); return p; }
  };

  /* Convenience: run a single scene as its own timeline. */
  G3M.single = function (stage, type, cfg) {
    return new G3M.G3Video(stage).scene(type, cfg);
  };

})(window.G3M = window.G3M || {});
