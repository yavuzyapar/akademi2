# Mavelania – Instagram Reel

`mavelania-reel.mp4` — 1080×1920, 30 fps, 21.6 s, with soundtrack.

Rebuild:

```
npm install            # gsap
npm install playwright # if not available globally
python3 audio.py       # soundtrack -> out/music.wav (numpy only)
node render.mjs        # frames + encode -> mavelania-reel.mp4 (needs ffmpeg)
```

Edit texts, images and timing in `index.html` (open `index.html?play` in a browser to preview).
