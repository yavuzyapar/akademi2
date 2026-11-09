# Mavelania – Instagram Reel

`mavelania-reel.mp4` — 1080×1920, 30 fps, 33 s, with soundtrack.

Each photo is split into a foreground cutout and an inpainted background plate (`prep.py`),
so the camera moves in `index.html` have real depth (2.5D parallax). All photos are graded
to one warm-cream tone in the same step.

Rebuild:

```
npm install            # gsap
npm install playwright # if not available globally
python3 audio.py       # soundtrack -> out/music.wav (numpy only)
node render.mjs        # frames + encode -> mavelania-reel.mp4 (needs ffmpeg)
```

Texts, shot order and camera moves (`CAMS`) live in `index.html`; open `index.html?play` in a
browser for a live preview. `prep.py` (OpenCV) only needs re-running when photos change: it expects
`src/<name>.png` plus a matching cutout with alpha in `seg/<name>.png`.
