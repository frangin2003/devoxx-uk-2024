"""
Render a playground effect to frames (and an MP4 if ffmpeg is installed).

Every animation is a pure function of time, so this seeks the timeline to each
frame and screenshots the stage. No screen recording, no dropped frames, and the
same output every run.

    pip install playwright && playwright install chromium
    python tools/render.py promo                    # -> out/promo.mp4 at 60 fps
    python tools/render.py slam --fps 30 --out build/slam
    python tools/render.py logoLoop --frames-only   # PNG sequence only

Effects are the ids in playground/effects.js (the part after ?effect= in the
playground URL). To render your own script, add it to effects.js or open the
playground, paste it into the Script panel, and use its effect id.

Fonts: the playground loads Archivo from Google Fonts. For offline renders,
self-host Archivo and swap the <link> in index.html, or renders fall back to
the system sans.
"""
import argparse, asyncio, pathlib, shutil, subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent


async def render(effect, fps, out, width, height, frames_only, chrome):
    from playwright.async_api import async_playwright
    out.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        launch = {"args": ["--no-sandbox"]}
        if chrome:
            launch["executable_path"] = chrome
        browser = await p.chromium.launch(**launch)
        page = await browser.new_page(viewport={"width": width, "height": height})
        await page.goto(f"{(ROOT / 'index.html').as_uri()}?render=1&effect={effect}")
        await page.wait_for_function("window.g3Duration !== undefined", timeout=15000)
        await page.evaluate("document.fonts && document.fonts.ready")
        duration = await page.evaluate("window.g3Duration")
        times = await page.evaluate(f"G3M.frameTimes(window.g3Duration, {fps})")
        stage = await page.query_selector(".g3-stage")
        print(f"{effect}: {duration / 1000:.2f} s, {len(times)} frames at {fps} fps")
        for i, t in enumerate(times):
            await page.evaluate(f"window.g3Seek({t})")
            await stage.screenshot(path=str(out / f"frame_{i:05d}.png"))
            if i % max(1, fps) == 0:
                print(f"  {i}/{len(times)}", end="\r")
        await browser.close()
    print(f"  frames written to {out}")

    if frames_only:
        return
    if not shutil.which("ffmpeg"):
        print("  ffmpeg not found; skipping MP4. Frames are ready to import into your editor.")
        return
    mp4 = out.with_suffix(".mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(fps),
                    "-i", str(out / "frame_%05d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p",
                    "-crf", "14", "-preset", "slow", str(mp4)], check=True)
    print(f"  wrote {mp4}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("effect", help="effect id, e.g. promo, slam, logo, tr-wave")
    ap.add_argument("--fps", type=int, default=60)
    ap.add_argument("--out", default=None, help="output folder (default out/<effect>)")
    ap.add_argument("--width", type=int, default=1920)
    ap.add_argument("--height", type=int, default=1080)
    ap.add_argument("--frames-only", action="store_true")
    ap.add_argument("--chrome", default=None, help="path to a Chromium binary, if not the Playwright one")
    a = ap.parse_args()
    out = pathlib.Path(a.out or ROOT / "out" / a.effect)
    asyncio.run(render(a.effect, a.fps, out, a.width, a.height, a.frames_only, a.chrome))


if __name__ == "__main__":
    main()
