/* Media compositing.
 *
 *   const m = G3M.Media(sceneEl, { src: "demo.mp4", treatment: "browser" });
 *   m.setMedia("other.mp4");
 *   m.camera({ zoom: 2.4, fx: .72, fy: .34, dim: .3 });   // per frame
 *
 * src can be "mock" (a built-in stand-in g3po app), an image or a video URL.
 * Video time is driven from the timeline (seek on render) so exports are exact.
 *
 * Treatments: fullscreen, browser, card, circle, tilted, pip, split-left,
 *             split-right
 */
(function (G3M) {
  "use strict";
  const { h, css, C, clamp } = G3M;

  const FRAMES = {
    fullscreen: { x: 0, y: 0, w: 1920, h: 1080, r: 0, chrome: false },
    browser:    { x: 210, y: 120, w: 1500, h: 860, r: 34, chrome: true },
    card:       { x: 260, y: 150, w: 1400, h: 790, r: 44, chrome: false },
    circle:     { x: 560, y: 140, w: 800, h: 800, r: 400, chrome: false },
    tilted:     { x: 260, y: 150, w: 1400, h: 790, r: 36, chrome: true, rot: -5 },
    pip:        { x: 1260, y: 640, w: 600, h: 360, r: 28, chrome: false },
    "split-left":  { x: 60, y: 150, w: 880, h: 780, r: 36, chrome: false },
    "split-right": { x: 980, y: 150, w: 880, h: 780, r: 36, chrome: false }
  };
  G3M.MEDIA_FRAMES = FRAMES;

  G3M.Media = function Media(parent, cfg = {}) {
    const f = { ...(FRAMES[cfg.treatment || "browser"] || FRAMES.browser), ...(cfg.frame || {}) };
    const box = h("div", {}, parent);
    css(box, { position: "absolute", left: f.x + "px", top: f.y + "px", width: f.w + "px", height: f.h + "px",
      borderRadius: f.r + "px", overflow: "hidden", background: C.ink,
      border: f.r && !cfg.noBorder ? `8px solid ${C.ink}` : "none", boxSizing: "border-box",
      transformOrigin: "50% 50%", willChange: "transform" });
    let chromeH = 0;
    if (f.chrome) {
      chromeH = 56;
      const bar = h("div", {}, box);
      css(bar, { position: "absolute", left: 0, top: 0, right: 0, height: chromeH + "px", background: "#2A2C2F",
        display: "flex", alignItems: "center", gap: "14px", paddingLeft: "26px", zIndex: 2 });
      for (const c of ["#E0452B", "#FFC400", "#3FA66B"]) {
        const d = h("div", {}, bar); css(d, { width: "18px", height: "18px", borderRadius: "50%", background: c });
      }
      const url = h("div", {}, bar);
      css(url, { marginLeft: "30px", height: "30px", width: "44%", borderRadius: "15px", background: "#3A3D41" });
    }
    const view = h("div", {}, box);        // the viewport the camera moves inside
    css(view, { position: "absolute", left: 0, top: chromeH + "px", right: 0, bottom: 0, overflow: "hidden" });
    const content = h("div", {}, view);
    css(content, { position: "absolute", left: 0, top: 0, width: "100%", height: "100%", transformOrigin: "0 0",
      willChange: "transform, filter" });
    const dimmer = h("div", {}, view);
    css(dimmer, { position: "absolute", inset: 0, pointerEvents: "none", opacity: 0,
      background: "rgba(28,29,31,.62)" });
    const spot = h("div", {}, view);
    css(spot, { position: "absolute", inset: 0, pointerEvents: "none", opacity: 0 });

    let video = null, mock = null;
    const vw = f.w - 0, vh = f.h - chromeH;

    function setMedia(src) {
      content.innerHTML = ""; video = null; mock = null;
      if (!src || src === "mock") {
        mock = G3M.MockApp(content, { width: 1600, height: 900 });
        const k = Math.max(vw / 1600, vh / 900);
        mock.el.style.transform = `scale(${k})`; mock.el.style.transformOrigin = "0 0";
        return;
      }
      if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src) || src.startsWith("blob:video") || cfg.kind === "video") {
        video = h("video", { src, muted: "", playsinline: "", preload: "auto" }, content);
        video.muted = true;
        css(video, { width: "100%", height: "100%", objectFit: "cover", display: "block" });
      } else {
        const img = h("img", { src, alt: "" }, content);
        css(img, { width: "100%", height: "100%", objectFit: "cover", display: "block" });
      }
    }
    setMedia(cfg.src);

    const api = {
      el: box, frame: f, get mock() { return mock; }, get video() { return video; },
      setMedia(src) { setMedia(src); return api; },
      /* Camera state, applied every frame:
       *   zoom, fx, fy  zoom factor and the focus point (0..1 of the view)
       *   panX, panY    extra offset in px
       *   rot           slight rotation of the whole frame
       *   blur, dim     0..1
       *   spot          {x, y, r} normalised spotlight, or null
       *   mediaTime     seconds, for deterministic video */
      camera(c = {}) {
        const z = Math.max(1, c.zoom ?? 1), fx = c.fx ?? .5, fy = c.fy ?? .5;
        // Small zooms pivot on the focus point (it stays put); larger zooms
        // also drift it toward the centre of the frame. Always clamped so the
        // media never exposes its own edge.
        const k = clamp((z - 1) / .8);
        const ox = fx * vw * (1 - z), oy = fy * vh * (1 - z);
        const cx = vw / 2 - fx * vw * z, cy = vh / 2 - fy * vh * z;
        let X = G3M.lerp(ox, cx, k) + (c.panX || 0), Y = G3M.lerp(oy, cy, k) + (c.panY || 0);
        X = clamp(X, vw - vw * z, 0); Y = clamp(Y, vh - vh * z, 0);
        content.style.transform = `translate(${X}px,${Y}px) scale(${z})`;
        content.style.filter = c.blur ? `blur(${c.blur * 22}px)` : "none";
        dimmer.style.opacity = c.dim || 0;
        if (c.spot) {
          const sx = c.spot.x * 100, sy = c.spot.y * 100, r = c.spot.r ?? .18;
          spot.style.opacity = 1;
          spot.style.background =
            `radial-gradient(circle at ${sx}% ${sy}%, transparent ${r * 100 * .9}%, rgba(28,29,31,.66) ${r * 100}%)`;
        } else spot.style.opacity = 0;
        if (video && c.mediaTime != null && video.readyState >= 1) {
          const want = Math.max(0, c.mediaTime % (video.duration || 1e9));
          if (Math.abs(video.currentTime - want) > .04) video.currentTime = want;
        }
        return api;
      },
      // stage-space coordinates of a normalised point inside the media
      point(nx, ny) {
        return [f.x + nx * vw, f.y + chromeH + ny * vh];
      }
    };
    api.camera({});
    return api;
  };

  /* A stand-in g3po app. Not a real screen: just believable enough that the
   * video effects have something to act on until real recordings arrive.
   * update(t, runAt) animates the agents once "Run all" is pressed. */
  G3M.MockApp = function MockApp(parent, cfg = {}) {
    const W = cfg.width || 1600, H = cfg.height || 900;
    const el = h("div", {}, parent);
    css(el, { position: "absolute", left: 0, top: 0, width: W + "px", height: H + "px", background: "#F4F2EC",
      fontFamily: G3M.FONT, color: C.ink, display: "flex" });
    const side = h("div", {}, el);
    css(side, { width: "300px", background: C.ink, color: "#fff", padding: "34px 30px", boxSizing: "border-box" });
    const logo = h("div", { html: `<span style="display:inline-block;width:46px;height:32px;border-radius:14px;
      background:${C.yellow};vertical-align:middle;margin-right:12px"></span>g3po` }, side);
    css(logo, { fontWeight: 900, fontSize: "40px", marginBottom: "44px", letterSpacing: "-.02em" });
    ["Agents", "Tasks", "Runs", "Harnesses", "Settings"].forEach((n, i) => {
      const it = h("div", { text: n }, side);
      css(it, { padding: "16px 20px", borderRadius: "14px", marginBottom: "8px", fontSize: "26px", fontWeight: 700,
        background: i === 0 ? "rgba(255,196,0,.16)" : "transparent", color: i === 0 ? C.yellow : "#C9CCD0" });
    });
    const main = h("div", {}, el);
    css(main, { flex: 1, padding: "40px 48px", boxSizing: "border-box", position: "relative" });
    const head = h("div", {}, main);
    css(head, { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "30px" });
    const ttl = h("div", { text: "Parallel agents" }, head);
    css(ttl, { fontSize: "46px", fontWeight: 900, letterSpacing: "-.02em" });
    const run = h("div", { text: "Run all" }, head);
    css(run, { background: C.yellow, border: `5px solid ${C.ink}`, borderRadius: "40px", padding: "16px 40px",
      fontSize: "30px", fontWeight: 900, transformOrigin: "50% 50%" });
    const names = ["Refactor auth flow", "Write migration tests", "Fix flaky CI job", "Update API docs", "Triage new issues"];
    const bars = [], pills = [];
    names.forEach((n, i) => {
      const row = h("div", {}, main);
      css(row, { display: "flex", alignItems: "center", gap: "22px", background: "#fff", borderRadius: "22px",
        padding: "20px 26px", marginBottom: "16px", border: "3px solid #E4E1D8" });
      const av = h("div", {}, row);
      css(av, { width: "56px", height: "40px", borderRadius: "18px", background: C.yellow, position: "relative", flexShrink: 0 });
      av.innerHTML = `<i style="position:absolute;left:13px;top:13px;width:10px;height:10px;border-radius:50%;background:${C.ink}"></i>
                      <i style="position:absolute;right:13px;top:13px;width:10px;height:10px;border-radius:50%;background:${C.ink}"></i>`;
      const lab = h("div", { text: n }, row);
      css(lab, { fontSize: "27px", fontWeight: 700, width: "420px" });
      const track = h("div", {}, row);
      css(track, { flex: 1, height: "16px", borderRadius: "8px", background: "#EDEAE2", overflow: "hidden" });
      const bar = h("div", {}, track);
      css(bar, { height: "100%", width: "0%", background: C.ink, borderRadius: "8px" });
      const pill = h("div", { text: "Idle" }, row);
      css(pill, { fontSize: "22px", fontWeight: 800, padding: "8px 18px", borderRadius: "20px", background: "#EDEAE2",
        width: "118px", textAlign: "center" });
      bars.push(bar); pills.push(pill);
    });
    const api = {
      el, W, H,
      // normalised positions of things worth pointing at, relative to the app
      targets: { run: [.9, .085], row0: [.45, .22], row2: [.45, .44], logo: [.07, .06] },
      update(t, runAt = null) {
        const pressed = runAt != null && t >= runAt;
        run.style.transform = runAt != null && t >= runAt && t < runAt + 200
          ? `scale(${G3M.kf(t - runAt, [[0, 1], [70, .9], [200, 1, G3M.ease.pop]])})` : "scale(1)";
        bars.forEach((b, i) => {
          const start = runAt + i * 90, dur = 1400 + i * 380;
          const p = pressed ? clamp((t - start) / dur) : 0;
          b.style.width = (G3M.ease.inOutCubic(p) * 100) + "%";
          b.style.background = p >= 1 ? C.green : C.ink;
          pills[i].textContent = !pressed ? "Idle" : p >= 1 ? "Done" : "Running";
          pills[i].style.background = !pressed ? "#EDEAE2" : p >= 1 ? "#D8EFE1" : "#FFE9A8";
        });
      }
    };
    api.update(0, null);
    return api;
  };

})(window.G3M = window.G3M || {});
