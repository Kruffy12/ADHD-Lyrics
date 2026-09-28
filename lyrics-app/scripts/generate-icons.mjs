#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const svgPath = path.join(root, "public", "icons", "icon.svg");
const outDir = path.join(root, "public", "icons");

const svg = fs.readFileSync(svgPath);

const sizes = [
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "favicon-32.png", size: 32 },
];

for (const { name, size } of sizes) {
  await sharp(svg, { density: 300 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, name));
  console.log(`✓ ${name} (${size}px)`);
}

await sharp(svg, { density: 300 })
  .resize(32, 32)
  .toFile(path.join(root, "public", "favicon.ico"));

console.log("✓ favicon.ico");
