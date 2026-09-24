/* Scene templates built around footage. */
(function (G3M) {
  "use strict";
  const { h, css, s, set, C, kf, ease: E, clamp } = G3M;
  const S = G3M.scenes;
  const layer = G3M.sceneLayer;

  /* A camera track: a list of moves, each easing from wherever the previous
   * move left the camera. Deterministic for any t. */
  G3M.CameraTrack = function (initial = {}) {
    const base = { zoom: 1, fx: .5, fy: .5, dim: 0, blur: 0, panX: 0, panY: 0, ...initial };
    const moves = [];
    return {
      moves,
      to(at, dur, target, ease = "inOutCubic") { moves.push({ at, dur, target, ease: G3M.easing(ease) }); return this; },
      at(t) {
        let cur = { ...base };
        for (const m of moves.slice().sort((a, b) => a.at - b.at)) {
          if (t < m.at) break;
          const p = m.ease(clamp((t - m.at) / (m.dur || 1)));
          const next = { ...cur };
          for (const k in m.target) {
            if (k === "spot") { next.spot = p > 0 ? m.target.spot : cur.spot; continue; }
            next[k] = G3M.lerp(cur[k] ?? 0, m.target[k], p);
          }
          cur = next;
        }
        return cur;
      }
    };
  };

  // ------------------------------------------------------------ VideoReveal
  S.video = function (el, cfg) {
    el.style.background = G3M.color(cfg.background || "white");
    const media = G3M.Media(layer(el, 1), { src: cfg.src || "mock", treatment: cfg.treatment || "browser", kind: cfg.kind });
    const cam = G3M.CameraTrack();
    let runAt = cfg.runAt ?? null;
    const f = media.frame;
    const entrance = cfg.entrance || "pop";
    const api = {
      duration: cfg.duration ?? 700,
      media, cam,
      click(t) { if (runAt == null && media.mock) runAt = t; },
      zoom(t, o) {
        cam.to(t, o.duration ?? 900, { zoom: o.scale ?? 1, fx: o.x ?? .5, fy: o.y ?? .5,
          ...(o.dim != null ? { dim: o.dim } : {}), ...(o.blur != null ? { blur: o.blur } : {}) }, o.ease || "inOutCubic");
      },
      spotlight(t, o) { cam.to(t, 1, { spot: o ? { x: o.x, y: o.y, r: o.r ?? .16 } : null }); },
      render(t) {
        let sc = 1, rot = f.rot || 0, y = 0;
        if (entrance === "pop") {
          sc = kf(t, [[0, .55], [360, 1.04, E.outCubic], [520, .99], [640, 1, E.outQuad]]);
          rot += kf(t, [[0, -6], [520, 0, E.pop]]);
        } else if (entrance === "rise") {
          y = kf(t, [[0, 1100], [520, -24, E.outQuint], [700, 0, E.outQuad]]);
        }
        media.el.style.transform = `translateY(${y}px) rotate(${rot}deg) scale(${sc})`;
        media.el.style.opacity = t > 0 || entrance === "none" ? 1 : 0;
        const c = cam.at(t);
        media.camera({ ...c, mediaTime: t / 1000 });
        if (media.mock) media.mock.update(t, runAt);
      }
    };
    return api;
  };

  // ------------------------------------------------------------ CursorDemo
  /* A giant cursor heads for the Run button. G3 is standing in its path,
   * notices, and dives out of the way. The click lands, the agents start, the
   * camera punches in, and G3 peeks back to approve. */
  S.cursorDemo = function (el, cfg) {
    el.style.background = G3M.color(cfg.background || "yellow");
    const v = S.video(layer(el, 1), { ...cfg, treatment: cfg.treatment || "browser", background: "transparent" });
    const top = layer(el, 3);
    const svg = G3M.svgLayer(top, 1920, 1080);
    const g3 = G3M.G3(svg);
    const cur = G3M.Cursor(svg, { x: 2100, y: 1250, scale: 1.25 });
    const run = v.media.point(.905, .086);
    const g3X = 1180, g3Y = 1010;
    cur.move(1400, 820, { at: 500, dur: 650, bend: .1 })          // heads straight at G3
       .wait(260)
       .move(run[0], run[1] + 10, { dur: 520, bend: -.25 })
       .click({ hold: 400 });
    const clickAt = 500 + 650 + 260 + 520;
    v.zoom(clickAt + 500, { x: .55, y: .42, scale: 1.7, duration: 900 });
    v.zoom(clickAt + 2300, { x: .5, y: .5, scale: 1, duration: 650 });
    return {
      duration: cfg.duration ?? 4700,
      render(t) {
        if (t >= clickAt) v.click(clickAt);
        v.render(t);
        cur.render(t);
        // G3: idles, sees the cursor coming, leaps aside, later peeks back in
        const notice = 780, leap = 1050, back = clickAt + 1500;
        const leapP = clamp((t - leap) / 380);
        let x = g3X + E.outCubic(leapP) * 520;
        const lift = leapP > 0 && leapP < 1 ? Math.sin(leapP * Math.PI) * 220 : 0;
        const landD = t - (leap + 380);
        let squash = landD >= 0 ? kf(landD, [[0, .25], [120, -.06, E.outQuad], [260, 0, E.outQuad]]) : 0;
        if (t > notice && t < leap) squash = kf(t - notice, [[0, 0], [200, .16, E.outQuad]]);   // crouch
        const y = g3Y + (t > back ? E.inBack(1.4)(clamp((t - back - 900) / 350)) * 400 : 0);
        g3.set({ x, y, scale: 1.05, lift, squash,
          eyes: t > notice && t < leap + 380 ? "wide" : t > back + 200 ? "happy" : "round",
          lookX: t < notice ? 0 : t < back ? -1 : -.6, lookY: t > notice && t < leap ? .5 : 0,
          rot: leapP > 0 && leapP < 1 ? 16 : 0,
          armL: t > back + 250 ? kf(t - back - 250, [[0, 20], [200, 150, E.pop]]) : 0,
          antenna: G3M.g3Life.twang(t, leap + 380, 26),
          blink: G3M.g3Life.blink(t, back + 80), opacity: 1 });
      }
    };
  };

  // ------------------------------------------------------------ TypingDemo
  /* cfg.script: [["type","Fix this issue"],["pause",400],["delete","issue"],
   *              ["type","entire bloody thing"],["pause",300],["submit"]] */
  S.typing = function (el, cfg) {
    el.style.background = G3M.color(cfg.background || "yellow");
    const ui = layer(el, 1);
    const svg = G3M.svgLayer(layer(el, 2), 1920, 1080);
    const box = G3M.TypeBox(ui, { x: 470, y: 600, width: 1250, placeholder: cfg.placeholder || "Ask g3po to…",
      speed: cfg.speed ?? 55, seed: cfg.seed ?? 5, at: 500 });
    const script = cfg.script || [["type", "Fix this issue"], ["pause", 420], ["delete", "issue"],
      ["type", "entire bloody thing"], ["pause", 360], ["submit"]];
    const marks = [];
    for (const [op, a, b] of script) {
      const before = box.end;
      if (op === "type") box.type(a, b || {});
      else if (op === "pause") box.pause(a);
      else if (op === "delete") box.delete(a);
      else if (op === "replace") box.replace(a, b);
      else if (op === "complete") box.complete(a);
      else if (op === "submit") box.submit();
      marks.push({ op, from: before, to: box.end });
    }
    const del = marks.find(m => m.op === "delete");
    const sub = marks.find(m => m.op === "submit");
    const g3 = G3M.G3(svg);
    const end = box.end;
    return {
      duration: cfg.duration ?? end + 900,
      render(t) {
        box.render(t);
        const life = G3M.g3Life.idle(t, 2);
        const suspicious = del && t >= del.from && t < del.to + 500;
        const after = sub && t >= sub.from;
        const len = (box.el.querySelector("span") || {}).textContent?.length || 0;
        g3.set({ x: 290, y: 860, scale: 1.4,
          lookX: after ? 0 : clamp(-.2 + len / 22, -.2, 1), lookY: .45,
          eyes: suspicious ? "squint" : after && t > sub.from + 250 ? "happy" : "round",
          blink: suspicious ? 0 : life.blink, squash: life.squash + (after ? kf(t - sub.from, [[0, 0], [120, .16], [300, -.08, E.outQuad], [460, 0, E.outQuad]]) : 0),
          lift: after ? kf(t - sub.from, [[120, 0], [330, 90, E.outQuad], [560, 0, E.inQuad]]) : 0,
          armL: after && t > sub.from + 200 ? 150 : 0, armR: after && t > sub.from + 200 ? 150 : 0,
          tilt: suspicious ? -9 : 0, antenna: life.antenna });
      }
    };
  };

})(window.G3M = window.G3M || {});
