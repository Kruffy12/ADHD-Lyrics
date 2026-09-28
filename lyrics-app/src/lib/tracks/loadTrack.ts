import type { TimedLine, TrackMeta } from "../types";
import { withBasePath } from "../basePath";
import { enrichParsedLines, type WordsJsonFile } from "../lyrics/enrichLines";
import { parseLrc } from "../lyrics/parseLrc";

export interface TrackCatalogEntry {
  id: string;
  folder: string;
}

export interface TrackBundleManifest {
  id: string;
  title: string;
  artist: string;
  durationMs?: number;
  audioFile: string;
  lyricsFile: string;
  wordsFile?: string | null;
  sourceNote?: string;
}

export interface LoadedTrack {
  meta: TrackMeta;
  lines: TimedLine[];
  audioUrl: string;
  bundledAudioAvailable: boolean;
}

/** Static index — add a row when you create a new folder under `public/tracks/`. */
export const TRACK_CATALOG: TrackCatalogEntry[] = [
  { id: "we-dont-bite", folder: "we-dont-bite" },
];

export function trackBasePath(folder: string) {
  return withBasePath(`/tracks/${folder}`);
}

export async function loadTrackBundle(
  entry: TrackCatalogEntry,
): Promise<LoadedTrack> {
  const base = trackBasePath(entry.folder);
  const manifestRes = await fetch(`${base}/track.json`);
  if (!manifestRes.ok) {
    throw new Error(`Missing track.json for ${entry.id}`);
  }
  const manifest = (await manifestRes.json()) as TrackBundleManifest;

  const lyricsRes = await fetch(`${base}/${manifest.lyricsFile}`);
  if (!lyricsRes.ok) {
    throw new Error(`Missing lyrics file for ${entry.id}`);
  }
  const lrcText = await lyricsRes.text();
  const { meta: lrcMeta, lines: parsed } = parseLrc(lrcText);

  let wordsJson: WordsJsonFile | null = null;
  if (manifest.wordsFile) {
    const wordsRes = await fetch(`${base}/${manifest.wordsFile}`);
    if (wordsRes.ok) {
      wordsJson = (await wordsRes.json()) as WordsJsonFile;
    }
  }

  const durationMs =
    manifest.durationMs ?? lrcMeta.lengthMs ?? parsed.at(-1)?.startMs ?? 0;

  const lines = enrichParsedLines(parsed, durationMs + 2000, wordsJson);

  const audioUrl = `${base}/${manifest.audioFile}`;
  let bundledAudioAvailable = false;
  try {
    const head = await fetch(audioUrl, { method: "HEAD" });
    bundledAudioAvailable = head.ok;
  } catch {
    bundledAudioAvailable = false;
  }

  const meta: TrackMeta = {
    id: manifest.id,
    title: manifest.title ?? lrcMeta.title ?? entry.id,
    artist: manifest.artist ?? lrcMeta.artist ?? "Unknown",
    durationMs,
    sourceNote:
      manifest.sourceNote ??
      (bundledAudioAvailable
        ? "Bundled audio + lyrics"
        : "Lyrics bundled — add audio file locally (see track README)"),
    bundlePath: base,
    audioUrl,
    lyricsUrl: `${base}/${manifest.lyricsFile}`,
  };

  return { meta, lines, audioUrl, bundledAudioAvailable };
}
