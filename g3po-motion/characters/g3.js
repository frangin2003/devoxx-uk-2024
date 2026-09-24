/* G3 — the g3po mascot, as a pose-driven rig.
 *
 * Geometry comes from the original artwork (units scaled so the feet sit at
 * y = 0 and the antenna tip at about y = -300). Nothing here animates by
 * itself: callers compute a pose for time t and call set(pose). That keeps G3
 * deterministic and lets every scene direct him the same way.
 *
 * Pose keys (all optional):
 *   x, y, scale, rot, flip         placement
 *   lift                           hop height above the ground (shadow shrinks)
 *   squash                         +: flattened wide, -: stretched tall
 *   tilt                           head tilt in degrees
 *   lookX, lookY                   -1..1 where the eyes look
 *   blink                          0..1 eyelid closure
 *   eyes                           'round' | 'happy' | 'squint' | 'wide'
 *   mouth                          'none' | 'smile' | 'o'
 *   antenna                        wobble angle in degrees
 *   armL, armR                     arm angles in degrees (0 hangs down, 180 up)
 *   legL, legR                     leg swing in degrees
 *   headphones                     boolean, for the DJ variant
 */
(function (G3M) {
  "use strict";
  const { s, set, C } = G3M;

  const INK = "#232629", LIMB = C.yellowDeep, FEET = "#4D5660";

  G3M.G3 = function G3(parent, opts = {}) {
    const yellow = G3M.color(opts.color || "yellow");
    // Ink outline, on by default: it's the storyboard's sticker look, and it is
    // what keeps a yellow G3 visible on a yellow scene.
    const O = opts.outline === false ? {} : { stroke: INK, "stroke-width": 7, "stroke-linejoin": "round" };
    const root = s("g", { class: "g3" }, parent);
    const shadow = s("ellipse", { cx: 0, cy: 2, rx: 92, ry: 13, fill: "rgba(28,29,31,.14)" }, root);
    const lifted = s("g", {}, root);
    const body = s("g", {}, lifted);               // squash group, origin at feet

    // legs
    const legL = s("g", {}, body), legR = s("g", {}, body);
    s("rect", { x: -40, y: -56, width: 32, height: 44, rx: 12, fill: LIMB, ...O }, legL);
    s("rect", { x: -52, y: -19, width: 50, height: 19, rx: 9.5, fill: FEET, ...O }, legL);
    s("rect", { x: 8, y: -56, width: 32, height: 44, rx: 12, fill: LIMB, ...O }, legR);
    s("rect", { x: 2, y: -19, width: 50, height: 19, rx: 9.5, fill: FEET, ...O }, legR);

    // arms sit behind the torso
    const armL = s("g", {}, body), armR = s("g", {}, body);
    s("rect", { x: -88, y: -114, width: 32, height: 60, rx: 16, fill: LIMB, ...O }, armL);
    s("rect", { x: 56, y: -114, width: 32, height: 60, rx: 16, fill: LIMB, ...O }, armR);

    // torso
    s("rect", { x: -12, y: -134, width: 24, height: 26, rx: 9, fill: LIMB, ...O }, body);
    s("rect", { x: -54, y: -120, width: 108, height: 76, rx: 24, fill: yellow, ...O }, body);
    s("rect", { x: -29, y: -95, width: 58, height: 35, rx: 8, fill: C.grey }, body);
    s("rect", { x: -21, y: -87, width: 17, height: 19, rx: 3.5, fill: C.blue }, body);
    s("rect", { x: 4, y: -87, width: 17, height: 19, rx: 3.5, fill: "#C0392B" }, body);

    // head
    const head = s("g", {}, body);
    const antenna = s("g", {}, head);
    s("path", { d: "M0,-258 L0,-288", stroke: "#B9BCC0", "stroke-width": 9, "stroke-linecap": "round" }, antenna);
    const tip = s("circle", { cx: 0, cy: -294, r: 11, fill: C.red }, antenna);

    const phones = s("g", { opacity: 0 }, head);
    s("path", { d: "M-92,-190 Q0,-300 92,-190", fill: "none", stroke: "#4D5660", "stroke-width": 14, "stroke-linecap": "round" }, phones);

    s("rect", { x: -100, y: -258, width: 200, height: 136, rx: 66, fill: yellow, ...O }, head);
    const cheeks = s("g", { opacity: .85 }, head);
    s("circle", { cx: -70, cy: -160, r: 14, fill: C.cheek }, cheeks);
    s("circle", { cx: 70, cy: -160, r: 14, fill: C.cheek }, cheeks);

    const cupsL = s("rect", { x: -114, y: -212, width: 30, height: 52, rx: 13, fill: "#4D5660" }, phones);
    const cupsR = s("rect", { x: 84, y: -212, width: 30, height: 52, rx: 13, fill: "#4D5660" }, phones);
    s("rect", { x: -108, y: -202, width: 16, height: 32, rx: 7, fill: C.blue }, phones);
    s("rect", { x: 92, y: -202, width: 16, height: 32, rx: 7, fill: C.blue }, phones);
    phones.appendChild(cupsL); phones.appendChild(cupsR);   // cups in front of the head

    // eyes: four expressions, swapped by visibility
    const eyeX = [-35, 35], eyeY = -194;
    const round = [], lids = [];
    const eRound = s("g", {}, head), eHappy = s("g", {}, head),
          eSquint = s("g", {}, head), eWide = s("g", {}, head);
    for (const ex of eyeX) {
      const lid = s("g", { transform: `translate(${ex},${eyeY})` }, eRound);
      const disc = s("g", {}, lid);
      s("circle", { cx: 0, cy: 0, r: 28, fill: INK }, disc);
      const hl = s("g", {}, disc);
      s("circle", { cx: -9, cy: -9, r: 9.5, fill: "#fff" }, hl);
      s("circle", { cx: 9, cy: 9, r: 4, fill: "#C9CCD0" }, hl);
      round.push({ disc, hl }); lids.push(lid);
      s("path", { d: `M${ex - 17},${eyeY + 6} Q${ex},${eyeY - 16} ${ex + 17},${eyeY + 6}`,
        fill: "none", stroke: INK, "stroke-width": 10, "stroke-linecap": "round" }, eHappy);
      const dir = ex < 0 ? 1 : -1;
      s("path", { d: `M${ex - 14 * dir},${eyeY - 12} L${ex + 12 * dir},${eyeY} L${ex - 14 * dir},${eyeY + 12}`,
        fill: "none", stroke: INK, "stroke-width": 10, "stroke-linecap": "round", "stroke-linejoin": "round" }, eSquint);
      s("circle", { cx: ex, cy: eyeY, r: 33, fill: "#fff" }, eWide);
      s("circle", { cx: ex, cy: eyeY + 2, r: 16, fill: INK }, eWide);
      s("circle", { cx: ex - 5, cy: eyeY - 4, r: 5, fill: "#fff" }, eWide);
    }
    const mouthSmile = s("path", { d: "M-12,-150 Q0,-139 12,-150", fill: "none", stroke: INK,
      "stroke-width": 6, "stroke-linecap": "round", opacity: 0 }, head);
    const mouthO = s("ellipse", { cx: 0, cy: -148, rx: 8, ry: 10, fill: INK, opacity: 0 }, head);

    let lastEyes = null;
    function setEyes(mode) {
      if (mode === lastEyes) return;
      lastEyes = mode;
      eRound.setAttribute("opacity", mode === "round" ? 1 : 0);
      eHappy.setAttribute("opacity", mode === "happy" ? 1 : 0);
      eSquint.setAttribute("opacity", mode === "squint" ? 1 : 0);
      eWide.setAttribute("opacity", mode === "wide" ? 1 : 0);
    }

    const api = {
      el: root,
      set(p = {}) {
        const sc = p.scale ?? 1, flip = p.flip ? -1 : 1;
        set(root, { transform: `translate(${p.x ?? 0},${p.y ?? 0}) rotate(${p.rot ?? 0}) scale(${sc * flip},${sc})`,
          opacity: p.opacity ?? 1 });
        const lift = p.lift ?? 0;
        set(lifted, { transform: `translate(0,${-lift})` });
        const sh = Math.max(.35, 1 - lift / 420);
        set(shadow, { rx: 92 * sh, opacity: sh, visibility: p.shadow === false ? "hidden" : "visible" });
        const q = p.squash ?? 0;
        set(body, { transform: `scale(${1 + q * .55},${1 - q})` });
        set(head, { transform: `rotate(${p.tilt ?? 0} 0 -126)` });
        set(antenna, { transform: `rotate(${p.antenna ?? 0} 0 -258)` });
        set(armL, { transform: `rotate(${p.armL ?? 0} -72 -104)` });
        set(armR, { transform: `rotate(${-(p.armR ?? 0)} 72 -104)` });
        set(legL, { transform: `rotate(${p.legL ?? 0} -24 -50)` });
        set(legR, { transform: `rotate(${p.legR ?? 0} 24 -50)` });
        const lx = (p.lookX ?? 0) * 8, ly = (p.lookY ?? 0) * 6;
        for (const r of round) {
          set(r.disc, { transform: `translate(${lx},${ly})` });
          set(r.hl, { transform: `translate(${lx * .35},${ly * .35})` });
        }
        const b = Math.max(0, Math.min(1, p.blink ?? 0));
        for (const lid of lids) {
          const ex = lid === lids[0] ? eyeX[0] : eyeX[1];
          set(lid, { transform: `translate(${ex},${eyeY}) scale(1,${Math.max(.06, 1 - b)})` });
        }
        setEyes(p.eyes || "round");
        set(mouthSmile, { opacity: p.mouth === "smile" ? 1 : 0 });
        set(mouthO, { opacity: p.mouth === "o" ? 1 : 0 });
        set(phones, { opacity: p.headphones ? 1 : 0 });
        set(tip, { opacity: p.tipOff ? .35 : 1 });
        return api;
      }
    };
    api.set(opts.pose || {});
    return api;
  };

  /* Behaviour helpers: small, reusable bits of life. Each returns pose fields
   * for time t so scenes can mix them into their own keyframes. */
  G3M.g3Life = {
    // slow breathing plus the odd blink; seed staggers several G3s
    idle(t, seed = 0) {
      const period = 2900 + seed * 370;
      const bt = (t + seed * 811) % period;
      const blink = bt < 70 ? bt / 70 : bt < 150 ? 1 - (bt - 70) / 80 : 0;
      return {
        squash: Math.sin((t + seed * 300) / 520) * .018,
        antenna: Math.sin((t + seed * 170) / 380) * 3,
        blink
      };
    },
    // a single blink starting at t0 (about 150 ms)
    blink(t, t0) {
      const d = t - t0;
      if (d < 0 || d > 160) return 0;
      return d < 60 ? d / 60 : 1 - (d - 60) / 100;
    },
    // two quick blinks
    doubleBlink(t, t0) {
      return Math.max(G3M.g3Life.blink(t, t0), G3M.g3Life.blink(t, t0 + 210));
    },
    // antenna twang after an impact
    twang(t, t0, amp = 22) {
      const d = (t - t0) / 1000;
      if (d < 0) return 0;
      return Math.sin(d * 34) * amp * Math.exp(-d * 5.5);
    },
    // walk / run cycle
    stride(t, speed = 1) {
      const a = Math.sin(t / 1000 * Math.PI * 4 * speed) * 26;
      return { legL: a, legR: -a, armL: -a * .8, armR: -a * .8,
               lift: Math.abs(Math.sin(t / 1000 * Math.PI * 4 * speed)) * 10 * speed };
    }
  };

})(window.G3M = window.G3M || {});
