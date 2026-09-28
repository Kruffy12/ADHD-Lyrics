#!/usr/bin/env node
/**
 * Opaque square icons (required for iOS Home Screen) + portrait startup splashes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const svgPath = path.join(root, "public", "icons", "icon.svg");
const iconDir = path.join(root, "public", "icons");
const splashDir = path.join(root, "public", "splash");
const BG = { r: 5, g: 5, b: 8, alpha: 1 };

fs.mkdirSync(iconDir, { recursive: true });
fs.mkdirSync(splashDir, { recursive: true });

const svg = fs.readFileSync(svgPath);

async function opaqueIcon(size) {
  const mark = await sharp(svg, { density: 384 })
    .resize(size, size, { fit: "cover" })
    .png()
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: mark }])
    .flatten({ background: BG })
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const icons = [
  { name: "apple-touch-icon.png", size: 180, alsoPublicRoot: true },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "favicon-32.png", size: 32 },
];

for (const { name, size, alsoPublicRoot } of icons) {
  const buf = await opaqueIcon(size);
  fs.writeFileSync(path.join(iconDir, name), buf);
  if (alsoPublicRoot) {
    fs.writeFileSync(path.join(root, "public", "apple-touch-icon.png"), buf);
  }
  const meta = await sharp(buf).metadata();
  console.log(`✓ ${name} ${size}px alpha=${meta.hasAlpha}`);
}

await sharp(await opaqueIcon(32)).toFile(path.join(root, "public", "favicon.ico"));
fs.copyFileSync(
  path.join(root, "public", "favicon.ico"),
  path.join(root, "src", "app", "favicon.ico"),
);
console.log("✓ favicon.ico");

/** iPhone portrait startup images. Media queries match Safari's apple-touch-startup-image. */
const splashes = [
  {
    file: "iphone-14-pro-max.png",
    w: 1290,
    h: 2796,
    media:
      "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    file: "iphone-14-pro.png",
    w: 1179,
    h: 2556,
    media:
      "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    file: "iphone-14.png",
    w: 1170,
    h: 2532,
    media:
      "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    file: "iphone-14-plus.png",
    w: 1284,
    h: 2778,
    media:
      "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    file: "iphone-x.png",
    w: 1125,
    h: 2436,
    media:
      "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    file: "iphone-se.png",
    w: 750,
    h: 1334,
    media:
      "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
];

const manifest = [];
for (const splash of splashes) {
  const markSize = Math.round(splash.w * 0.42);
  const mark = await opaqueIcon(markSize);
  const top = Math.round((splash.h - markSize) / 2) - Math.round(splash.h * 0.04);
  const left = Math.round((splash.w - markSize) / 2);
  await sharp({
    create: {
      width: splash.w,
      height: splash.h,
      channels: 3,
      background: { r: 5, g: 5, b: 8 },
    },
  })
    .composite([{ input: mark, top, left }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(splashDir, splash.file));
  manifest.push({ file: splash.file, media: splash.media });
  console.log(`✓ splash/${splash.file}`);
}

fs.writeFileSync(
  path.join(splashDir, "manifest.json"),
  JSON.stringify(manifest, null, 2),
);
