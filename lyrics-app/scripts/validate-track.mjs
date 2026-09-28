#!/usr/bin/env node
/**
 * Validates track bundles under public/tracks/
 * Usage: node scripts/validate-track.mjs [slug]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const tracksRoot = path.join(root, "public", "tracks");

const TIME_RE = /(\d+):(\d{2})(?:\.(\d{1,3}))?/;

function parseTimestamp(raw) {
  const match = raw.match(TIME_RE);
  if (!match) return 0;
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  const frac = match[3] ? Number(match[3].padEnd(3, "0")) : 0;
  return minutes * 60_000 + seconds * 1000 + frac;
}

function parseLrcLineCount(source) {
  let count = 0;
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (/^\[\d+:\d{2}/.test(line)) count++;
  }
  return count;
}

function listSlugs(filter) {
  if (filter) return [filter];
  return fs
    .readdirSync(tracksRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

const filter = process.argv[2];
let failed = false;

for (const slug of listSlugs(filter)) {
  const dir = path.join(tracksRoot, slug);
  const manifestPath = path.join(dir, "track.json");
  console.log(`\n▶ ${slug}`);

  if (!fs.existsSync(manifestPath)) {
    console.error("  ✗ missing track.json");
    failed = true;
    continue;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const lyricsPath = path.join(dir, manifest.lyricsFile ?? "lyrics.lrc");
  if (!fs.existsSync(lyricsPath)) {
    console.error(`  ✗ missing lyrics: ${manifest.lyricsFile}`);
    failed = true;
    continue;
  }

  const lrc = fs.readFileSync(lyricsPath, "utf8");
  const lines = parseLrcLineCount(lrc);
  console.log(`  ✓ lyrics.lrc (${lines} timed lines)`);

  const audioPath = path.join(dir, manifest.audioFile ?? "audio.m4a");
  if (fs.existsSync(audioPath)) {
    console.log(`  ✓ audio: ${manifest.audioFile}`);
  } else {
    console.warn(`  ⚠ audio missing (${manifest.audioFile}) — load locally or bundle in deploy`);
  }

  if (manifest.wordsFile) {
    const wordsPath = path.join(dir, manifest.wordsFile);
    if (!fs.existsSync(wordsPath)) {
      console.error(`  ✗ wordsFile listed but missing: ${manifest.wordsFile}`);
      failed = true;
    } else {
      console.log(`  ✓ ${manifest.wordsFile}`);
    }
  }
}

if (failed) process.exit(1);
console.log("\nDone.");
