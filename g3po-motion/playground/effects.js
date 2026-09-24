/* The playground's catalogue. Each effect is a small form (params) plus a
 * function that turns the form into a G3Video script. The script shown in the
 * playground is exactly the script that runs — edit either one. */
(function (G3M) {
  "use strict";

  const J = v => JSON.stringify(v);
  const obj = o => {
    const parts = Object.entries(o).filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => `${k}: ${J(v)}`);
    const one = `{ ${parts.join(", ")} }`;
    return one.length < 72 ? one : `{\n    ${parts.join(",\n    ")}\n  }`;
  };
  const lines = s => String(s).split(/\n|\|/).map(x => x.trim()).filter(Boolean);
  const media = c => c.src && c.src !== "mock" ? { src: c.src, kind: c.kind } : {};

  const P = {
    text: (key, label, def) => ({ key, label, type: "text", def }),
    area: (key, label, def) => ({ key, label, type: "area", def }),
    num: (key, label, def, min = 0, max = 10000, step = 50) => ({ key, label, type: "number", def, min, max, step }),
    pick: (key, label, def, options) => ({ key, label, type: "select", def, options }),
    media: () => ({ key: "src", label: "Footage", type: "media", def: "mock" }),
    bool: (key, label, def) => ({ key, label, type: "bool", def })
  };
  const colors = ["yellow", "ink", "white"];
  const entrances = ["slam", "pop", "drop", "grow", "slide", "whip"];
  const exits = ["none", "fly", "split", "drop", "shrink"];

  const E = [];
  const add = (section, id, title, note, params, script, loop = false) =>
    E.push({ section, id, title, note, params, script, loop });

  // -------------------------------------------------------------- Typography
  add("Typography", "slam", "Slam", "A word hits the frame hard enough to flatten G3. He pops back up.",
    [P.area("text", "Words, one line each", "PARALLEL."), P.pick("entrance", "Entrance", "slam", entrances),
     P.pick("exit", "Exit", "none", exits), P.pick("background", "Background", "yellow", colors),
     P.pick("foreground", "Letters", "ink", colors), P.bool("g3", "G3 gets squashed", true),
     P.num("duration", "Duration (ms)", 2400, 800, 8000)],
    c => `const video = new G3Video(stage)
  .scene("slam", ${obj({ text: lines(c.text), entrance: c.entrance, exit: c.exit === "none" ? undefined : c.exit,
    background: c.background, foreground: c.foreground, g3: c.g3, duration: c.duration })});`);

  add("Typography", "sequence", "Word by word", "Each line lands on the beat. The camera punches in a touch on every word.",
    [P.area("text", "Words, one line each", "SHIP.\nFASTER."), P.pick("entrance", "Entrance", "pop", entrances),
     P.num("beat", "Beat (ms)", 420, 100, 2000, 20), P.pick("exit", "Exit", "split", exits),
     P.pick("background", "Background", "white", colors), P.num("duration", "Duration (ms)", 2400, 800, 8000)],
    c => `const video = new G3Video(stage)
  .scene("sequence", ${obj({ text: lines(c.text), entrance: c.entrance, beat: c.beat,
    exit: c.exit === "none" ? undefined : c.exit, background: c.background, duration: c.duration })});`);

  add("Typography", "hero", "Feature hero", "Headline pops in, G3 hops on from the side and points at it.",
    [P.area("title", "Headline, one line each", "PARALLEL\nTASKS"), P.text("subtitle", "Subtitle pill", "Run five agents at once"),
     P.pick("mascot", "Mascot", "g3", ["g3", "dj", "g2d2", "gb8", "pix"]),
     P.pick("background", "Background", "yellow", colors), P.num("duration", "Duration (ms)", 2600, 1000, 8000)],
    c => `const video = new G3Video(stage)
  .scene("hero", ${obj({ title: lines(c.title), subtitle: c.subtitle, mascot: c.mascot, background: c.background, duration: c.duration })});`);

  add("Typography", "split", "Split letters", "Letters part like curtains to show the footage, then fly off.",
    [P.text("text", "Word", "EVERYWHERE"), P.media(), P.pick("background", "Letter colour", "yellow", ["yellow", "white"]),
     P.num("duration", "Duration (ms)", 2300, 1200, 6000)],
    c => `const video = new G3Video(stage)
  .scene("split", ${obj({ text: c.text, ...media(c), background: c.background, duration: c.duration })});`);

  add("Typography", "overlay", "Word over footage", "Footage plays, freezes under a dim, and a giant word lands on top.",
    [P.text("text", "Word", "EVERYWHERE."), P.media(), P.pick("animation", "Entrance", "slam", entrances),
     P.pick("exit", "Exit", "fly", exits), P.num("hold", "Hold (ms)", 900, 100, 4000)],
    c => `const video = new G3Video(stage)
  .scene("video", ${obj({ ...media(c), treatment: "browser" })})
  .pause(700)
  .text(${J(c.text)}, ${obj({ animation: c.animation, exit: c.exit, hold: c.hold })})
  .pause(300);`);

  // -------------------------------------------------------------- Transitions
  const TR = [
    ["circleExplosion", "Yellow circle explosion", "A dot pops, balloons past the edges, and the next scene grows out of it."],
    ["blackIris", "Black iris", "The frame closes to a pinpoint, holds a beat, then opens on what's next."],
    ["diagonalSlash", "Diagonal slash", "A slanted yellow slab cuts across with a black blade leading."],
    ["verticalPanels", "Vertical panels", "Yellow and black panels slam down in sequence, then drop away."],
    ["wipe", "Rounded wipe", "One thick rounded band sweeps the frame clean."],
    ["wave", "Wave", "A yellow wave rolls across, revealing the next scene behind its crest."],
    ["squash", "Squash", "The scene flattens to a line, the line flashes, the next scene springs open."],
    ["g3Run", "G3 run", "G3 sprints across dragging a giant yellow sheet, and the next scene is behind it."],
    ["g3Push", "G3 haul", "G3 drags the next scene in, struggles, glances at camera, and gets swept away."],
    ["cursorClick", "Cursor click", "A giant cursor clicks, and the click itself becomes the next scene."]
  ];
  for (const [name, title, note] of TR) {
    add("Transitions", "tr-" + name, title, note,
      [P.num("duration", "Duration (ms)", name === "g3Push" ? 1700 : name === "g3Run" ? 1150 : name === "cursorClick" ? 1100 : 900, 300, 3000),
       P.text("from", "Outgoing word", "BEFORE."), P.media()],
      c => `const video = new G3Video(stage)
  .scene("slam", ${obj({ text: [c.from], g3: false, background: "white", duration: 900 })})
  .transition(${J(name)}, ${obj({ duration: c.duration })})
  .scene("video", ${obj({ ...media(c), treatment: "browser", entrance: "none" })})
  .pause(900);`);
  }

  // -------------------------------------------------------------- Video
  add("Video effects", "zoom", "Click and zoom", "Cursor clicks Run, the agents start, the camera dives in, then pulls back.",
    [P.media(), P.pick("treatment", "Frame", "browser", Object.keys(G3M.MEDIA_FRAMES || { browser: 1 })),
     P.num("zoomX", "Zoom target x (0–1)", .55, 0, 1, .01), P.num("zoomY", "Zoom target y (0–1)", .45, 0, 1, .01),
     P.num("scale", "Zoom", 2.2, 1, 5, .1)],
    c => `const video = new G3Video(stage)
  .scene("video", ${obj({ ...media(c), treatment: c.treatment, background: "yellow" })})
  .cursor({ x: .9, y: .09, duration: 800 })
  .click()
  .zoom({ x: ${c.zoomX}, y: ${c.zoomY}, scale: ${c.scale}, duration: 900 })
  .pause(900)
  .zoomReset({ duration: 600 })
  .pause(400);`);

  add("Video effects", "frames", "Media frames", "The same footage in any container: browser, card, circle, tilted, picture-in-picture.",
    [P.media(), P.pick("treatment", "Frame", "tilted", Object.keys(G3M.MEDIA_FRAMES || { browser: 1 })),
     P.pick("entrance", "Entrance", "pop", ["pop", "rise", "none"]), P.pick("background", "Background", "yellow", colors)],
    c => `const video = new G3Video(stage)
  .scene("video", ${obj({ ...media(c), treatment: c.treatment, entrance: c.entrance, background: c.background })})
  .pause(1400);`);

  // -------------------------------------------------------------- Cursor
  add("Cursor", "cursorGag", "Out of the way", "A giant cursor heads straight for G3. He dives aside just in time.",
    [P.media(), P.pick("background", "Background", "yellow", colors), P.num("duration", "Duration (ms)", 4700, 3000, 9000)],
    c => `const video = new G3Video(stage)
  .scene("cursorDemo", ${obj({ ...media(c), background: c.background, duration: c.duration })});`);

  // -------------------------------------------------------------- Typing
  add("Typing", "typing", "Prompt typing", "Types, second-guesses, deletes, retypes, sends. G3 reads along.",
    [P.area("script", "Script, one step per line", "type Fix this issue\npause 420\ndelete issue\ntype entire bloody thing\npause 360\nsubmit"),
     P.text("placeholder", "Placeholder", "Ask g3po to…"), P.num("speed", "Speed (ms per key)", 55, 15, 200, 5),
     P.num("seed", "Rhythm seed", 5, 1, 999, 1)],
    c => {
      const steps = lines(c.script).map(l => {
        const [op, ...rest] = l.split(" "); const arg = rest.join(" ");
        return op === "pause" ? [op, Number(arg)] : op === "submit" ? [op] : [op, arg];
      });
      return `const video = new G3Video(stage)
  .scene("typing", {
    placeholder: ${J(c.placeholder)}, speed: ${c.speed}, seed: ${c.seed},
    script: ${J(steps)}
  });`;
    });

  // -------------------------------------------------------------- Mascots
  add("Mascots", "reactions", "Reaction reel", "Glance, blink, double blink, suspicious tilt, surprise, proud, wave.",
    [P.pick("mascot", "Mascot", "g3", ["g3", "dj"]), P.pick("background", "Background", "yellow", colors)],
    c => `const video = new G3Video(stage)
  .scene("reactions", ${obj({ mascot: c.mascot, background: c.background })});`);

  add("Mascots", "agents", "One becomes many", "Parallel agents: G3 charges, pops, and the crew shoots out. He can't keep track.",
    [P.text("agents", "Crew (comma-separated)", "g2d2, gb8, pix, dj, g3"), P.pick("background", "Background", "yellow", colors)],
    c => `const video = new G3Video(stage)
  .scene("agents", ${obj({ agents: c.agents.split(",").map(s => s.trim()).filter(Boolean), background: c.background })});`);

  add("Mascots", "button", "The button", "G3 presses it. Nothing. He looks at you. Then everything launches.",
    [P.pick("buttonColor", "Button", "red", ["red", "yellow", "ink"]), P.pick("background", "Background", "white", colors)],
    c => `const video = new G3Video(stage)
  .scene("buttonGag", ${obj({ buttonColor: c.buttonColor, background: c.background })});`);

  // -------------------------------------------------------------- UI motion
  add("UI motion", "converge", "Many into one", "Orchestration: scattered tasks converge, snap into one result, and DONE. lands.",
    [P.text("text", "Word", "DONE."), P.num("count", "Tasks", 6, 2, 7, 1), P.pick("background", "Background", "yellow", colors)],
    c => `const video = new G3Video(stage)
  .scene("converge", ${obj({ text: c.text, count: c.count, background: c.background })});`);

  // -------------------------------------------------------------- Logo
  add("Logo ident", "logo", "Ident", "Ribbon flows in, spirals into G3's head, letters snap in. Look left, look right, smile.",
    [P.text("tagline", "Tagline", "Agents for a brighter tomorrow"), P.bool("antenna", "Antenna", true),
     P.pick("background", "Background", "white", colors), P.num("duration", "Duration (ms)", 3600, 3000, 8000)],
    c => `const video = new G3Video(stage)
  .scene("logo", ${obj({ tagline: c.tagline, antenna: c.antenna, background: c.background, duration: c.duration })});`);

  add("Logo ident", "logoLoop", "Ident, looping", "Builds, holds, unwinds back into the ribbon and flows out. Seamless on repeat.",
    [P.bool("antenna", "Antenna", true), P.pick("background", "Background", "white", colors),
     P.num("duration", "Loop length (ms)", 5400, 4600, 9000)],
    c => `const video = new G3Video(stage)
  .scene("logoLoop", ${obj({ antenna: c.antenna, background: c.background, duration: c.duration })});`, true);

  add("Logo ident", "endcard", "End card", "The settled mark with tagline and a call to action.",
    [P.text("tagline", "Tagline", "Agents for a brighter tomorrow"), P.text("cta", "Call to action", "Try g3po"),
     P.pick("background", "Background", "white", colors)],
    c => `const video = new G3Video(stage)
  .scene("endCard", ${obj({ tagline: c.tagline, cta: c.cta, background: c.background })});`);

  // -------------------------------------------------------------- Combined
  add("Combined scenes", "promo", "Promo, 20 seconds", "Hero, explosion, footage, click, zoom, EVERYWHERE., wave, agents, DONE., ident.",
    [P.area("hero", "Hero headline", "MEET\nG3PO"), P.text("slam", "Slam word", "EVERYWHERE."), P.media()],
    c => `const video = new G3Video(stage)
  .scene("hero", ${obj({ title: lines(c.hero), subtitle: "Your agents, your way" })})
  .transition("circleExplosion", { x: 1500, y: 700 })
  .scene("video", ${obj({ ...media(c), treatment: "browser", background: "yellow" })})
  .cursor({ x: .9, y: .09, duration: 700 })
  .click()
  .zoom({ x: .55, y: .45, scale: 2, duration: 800 })
  .g3("peek", { side: "left" })
  .pause(700)
  .zoomReset({ duration: 500 })
  .text(${J(c.slam)}, { animation: "slam", exit: "fly" })
  .transition("wave")
  .scene("agents", {})
  .transition("diagonalSlash")
  .scene("converge", { text: "DONE." })
  .transition("blackIris")
  .scene("logo", { tagline: "Agents for a brighter tomorrow" });`);

  G3M.effects = E;
})(window.G3M = window.G3M || {});
