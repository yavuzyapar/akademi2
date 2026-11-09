// Renders index.html frame by frame with Playwright, then encodes with ffmpeg.
// Usage: node render.mjs            -> full render to mavelania-reel.mp4
//        node render.mjs 1.2 5.5    -> stills at given seconds into out/stills/
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const url = "file://" + path.join(dir, "index.html");
const stillTimes = process.argv.slice(2).map(Number);
mkdirSync(path.join(dir, "out/stills"), { recursive: true });

const browser = await chromium.launch();
const open = async () => {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto(url);
  await page.evaluate(() => window.ready);
  return page;
};

if (stillTimes.length) {
  const page = await open();
  for (const t of stillTimes) {
    await page.evaluate(t => window.seek(t), t);
    await page.screenshot({ path: path.join(dir, `out/stills/t${t.toFixed(2)}.jpg`), type: "jpeg", quality: 80 });
  }
  await browser.close();
  process.exit(0);
}

const WORKERS = 4;
const probe = await open();
const { DUR, FPS } = await probe.evaluate(() => ({ DUR: window.DUR, FPS: window.FPS }));
await probe.close();
const total = Math.round(DUR * FPS);
const frames = new Array(total);
let next = 0;
await Promise.all(Array.from({ length: WORKERS }, async () => {
  const page = await open();
  while (next < total) {
    const i = next++;
    await page.evaluate(t => window.seek(t), i / FPS);
    frames[i] = await page.screenshot({ type: "jpeg", quality: 96 });
    if (i % 60 === 0) console.log(`frame ${i}/${total}`);
  }
}));
await browser.close();

const audio = path.join(dir, "out/music.wav");
const args = ["-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-"];
if (existsSync(audio)) args.push("-i", audio);
args.push("-vf", "eq=contrast=1.03:saturation=1.04,noise=alls=5:allf=t,format=yuv420p", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "10M", "-bufsize", "20M",
  "-profile:v", "high", "-r", String(FPS), "-movflags", "+faststart");
if (existsSync(audio)) args.push("-c:a", "aac", "-b:a", "256k", "-shortest");
args.push(path.join(dir, "mavelania-reel.mp4"));
const ff = spawn("ffmpeg", args, { stdio: ["pipe", "ignore", "inherit"] });
for (const f of frames) if (!ff.stdin.write(f)) await new Promise(r => ff.stdin.once("drain", r));
ff.stdin.end();
await new Promise(r => ff.on("close", r));
console.log("done");
