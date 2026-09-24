# g3po motion

A motion-graphics toolkit for g3po promo videos: kinetic type, transitions,
footage compositing, a giant cursor, typing, G3 and friends, and the logo
ident — plus a playground to try every piece and a tool to export frames.

Open `dist/g3po-motion-playground.html` for the one-file playground, or
`index.html` to work on the source.

## The one idea that holds it together

**Every animation is a pure function of time.** Nothing runs on wall-clock CSS
animations. A `Timeline` renders the exact state for any `t`, so:

- the scrubber is frame-accurate, backwards as well as forwards;
- seeking to a time gives identical pixels however you got there;
- export is a loop of *seek, screenshot* — no screen recording, no dropped frames.

That last point was verified: frames reached by seeking forward and by seeking
backward from the end are pixel-identical.

## Writing a promo

Copy and footage live in the script, never in the engine.

```js
const video = new G3Video(stage)
  .scene("hero", { title: ["MEET", "G3PO"], subtitle: "Your agents, your way" })
  .transition("circleExplosion", { x: 1500, y: 700 })
  .scene("video", { src: "./recordings/agents.mp4", treatment: "browser" })
  .cursor({ x: .9, y: .09 })        // 0–1 = relative to the footage
  .click()
  .zoom({ x: .55, y: .45, scale: 2 })
  .g3("peek", { side: "left" })
  .pause(700)
  .zoomReset({ duration: 500 })
  .text("EVERYWHERE.", { animation: "slam", exit: "fly" })
  .transition("wave")
  .scene("agents")
  .transition("blackIris")
  .scene("logo", { tagline: "Agents for a brighter tomorrow" });
```

The playground's **Script** panel runs exactly this format. Edit it and press
*Run script*; the settings form regenerates it from scratch.

### Director calls

| Call | What it does |
|---|---|
| `scene(type, cfg)` | start a scene template |
| `transition(name, cfg)` | the next `scene()` arrives through this transition |
| `pause(ms)` / `hold(ms)` | stillness — use it; 300–600 ms makes the next move land |
| `cursor({x, y, duration})` | move the giant cursor on a curved path |
| `click()` `doubleClick()` `drag(from, to)` | click effects: ring, pulse, starburst |
| `hideCursor()` `showCursor()` | the cursor also leaves automatically with its scene |
| `zoom({x, y, scale, duration})` / `zoomTo` | camera dives toward a point of the footage |
| `zoomReset({duration})` | back to the full frame |
| `spotlight({x, y, r})` | dim everything but one region |
| `text(str, {animation, exit, hold})` | a giant word over the current scene, footage dimmed behind |
| `g3("peek" \| "happy" \| "surprised" \| "point", {side})` | G3 pops in from a corner |

Coordinates from 0 to 1 are relative to the current scene's footage; larger
numbers are stage pixels (1920 × 1080).

## Scene templates

| Type | Idea | Key options |
|---|---|---|
| `hero` | headline pops, G3 hops in and points | `title`, `subtitle`, `mascot` |
| `slam` | word slams and flattens G3 | `text`, `entrance`, `exit`, `g3` |
| `sequence` | words land one per beat | `text`, `beat`, `entrance`, `exit` |
| `split` | letters part like curtains over footage | `text`, `src` |
| `video` | footage in a frame, camera-driven | `src`, `treatment`, `entrance` |
| `cursorDemo` | G3 dives out of the cursor's path | `src` |
| `typing` | type, delete, retype, send | `script`, `speed`, `seed` |
| `reactions` | G3's small moves, in sequence | `mascot` |
| `agents` | one splits into many (parallel) | `agents` |
| `buttonGag` | press, nothing, look, *everything* | `buttonColor` |
| `converge` | many converge into one (orchestration) | `text`, `count` |
| `logo` | the ident | `tagline`, `antenna` |
| `logoLoop` | the ident, seamless on repeat | `duration` |
| `endCard` | settled mark, tagline, call to action | `tagline`, `cta` |

Every scene also takes `background` and `duration`. Colours accept `yellow`,
`ink`, `white` or any CSS colour.

**Entrances:** `slam`, `pop`, `drop`, `grow`, `slide`, `whip`.
**Exits:** `fly`, `split`, `drop`, `shrink`.
**Media frames:** `fullscreen`, `browser`, `card`, `circle`, `tilted`, `pip`,
`split-left`, `split-right`.

## Transitions

`circleExplosion`, `blackIris`, `diagonalSlash`, `verticalPanels`, `wipe`,
`wave`, `squash`, `g3Run`, `g3Push`, `cursorClick`. All take `duration` and
most take `color`; circle, iris and click take `x`, `y` for the origin.

Each transition receives the outgoing scene, the incoming scene, a layer
*between* them and a layer above everything. That's what lets a yellow disc
cover the old scene while the new one grows out of it on top.

## Characters

`G3M.G3(svg)` returns a rig; call `set(pose)` every frame. Pose keys: `x, y,
scale, rot, flip, lift, squash, tilt, lookX, lookY, blink, eyes` (`round`,
`happy`, `squint`, `wide`), `mouth`, `antenna, armL, armR, legL, legR,
headphones`. `G3M.g3Life` supplies small behaviours: `idle`, `blink`,
`doubleBlink`, `twang` (antenna after an impact), `stride`.

G3 wears an ink outline by default — the storyboard's sticker look, and the
thing that keeps a yellow G3 visible on a yellow scene. Pass `outline: false`
to drop it.

Friends: `G3M.mascot(name, svg)` with `g2d2`, `gb8`, `pix`, `dj`, `g3`.

## Adding your own

A scene is a function returning `{ duration, render(t) }`:

```js
G3M.scenes.myScene = function (el, cfg) {
  el.style.background = G3M.color(cfg.background || "yellow");
  const svg = G3M.svgLayer(G3M.sceneLayer(el, 1), 1920, 1080);
  const g3 = G3M.G3(svg);
  return {
    duration: cfg.duration ?? 2000,
    render(t) {
      g3.set({ x: 960, y: 900, scale: 1.5,
        lookX: G3M.kf(t, [[400, 0], [520, -1, G3M.ease.outQuad]]) });
    }
  };
};
```

A transition is `(ctx, cfg) => ({ duration, render(p) })` with `p` from 0 to 1.
Put it in `G3M.transitions` and it's available to `.transition()`.

The motion vocabulary lives in `motion/core.js`: `kf()` keyframes, easing
presets (`pop` overshoots about 12%, `snap`, `whip`, `bouncy`, `settle`),
`shake()` for impacts, `curve()` for bent paths, and `rng()` for jitter that
repeats exactly.

## Exporting

```
pip install playwright && playwright install chromium
python tools/render.py promo            # out/promo.mp4 at 60 fps
python tools/render.py logo --fps 30
python tools/render.py tr-wave --frames-only
```

Effect ids are the ones in the playground URL (`?effect=promo`). Video footage
is seeked to match each frame, so exports stay in sync.

After editing source files, rebuild the one-file playground:

```
python tools/build.py
```

## Files

```
index.html               playground page (loads the source files)
dist/                    one-file playground, built by tools/build.py
motion/core.js           easing, keyframes, stage, timeline, player
motion/text.js           fitted giant type, entrances and exits
motion/cursor.js         giant cursor
motion/typing.js         deterministic typing
motion/video.js          media frames, camera, stand-in app
motion/director.js       G3Video scripting layer
characters/g3.js         G3 rig and behaviours
characters/friends.js    G2D2, GB8, Pix
transitions/*.js         shapes, sweeps, character-driven
scenes/*.js              scene templates
playground/              effect catalogue and UI
tools/render.py          frame and MP4 export
tools/build.py           single-file bundle
```

## Known limits

- **Stand-in footage.** Until real recordings are dropped in, video effects use
  a built-in mock of the g3po app. Load your own in the playground with the
  footage picker, or pass `src` in a script.
- **Fonts.** Archivo comes from Google Fonts. Offline or in CI, self-host it,
  otherwise the condensed slams fall back to a regular-width sans and read
  shorter and wider.
- **Cursor over zoom.** Normalised cursor coordinates map to the unzoomed
  footage, so aim the cursor before zooming in.
- **Not built yet from the transition list:** eye zoom, text-slam mask, swirl,
  card cascade, agent explosion, corner peel and logo morph. The 10 here were
  prioritised for polish over count, as the brief asked; each of the remaining
  ones fits the same `(ctx, cfg) => { duration, render(p) }` shape.
