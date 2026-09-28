import type { TimedLine, WordGraphic } from "../types";
import type { ParsedLrcLine } from "./parseLrc";

type TimedWord = TimedLine["words"][number];

export function moodFor(text: string, index: number): TimedLine["mood"] {
  const upper = text.toUpperCase();
  if (index < 2) return "intro";
  if (upper.includes("WELCOME HOME") || upper.includes("WE DON'T BITE") || upper.includes("DON'T BITE"))
    return "chorus";
  if (
    upper.includes("NIGHTMARES") ||
    upper.includes("NOWHERE") ||
    upper.includes("JOIN THE FUN") ||
    upper.includes("COME TO LIFE")
  )
    return "chorus";
  if (index >= 52 && index <= 58) return "bridge";
  return "verse";
}

export function graphicFor(token: string): WordGraphic | undefined {
  const t = token.toLowerCase().replace(/[^a-z']/g, "");
  if (t.includes("flashlight") || t === "flash") return "flashlight";
  if (t.includes("bite")) return "bite";
  if (t.includes("animatronic") || t.includes("robot")) return "animatronic";
  if (t.includes("nightmare")) return "nightmare";
  if (t.includes("cupcake")) return "cupcake";
  if (t.includes("freddy") || t.includes("fredbear") || t.includes("fazbear"))
    return "freddy";
  if (t.includes("door") || t.includes("closet")) return "door";
  if (t.includes("fun") || t.includes("toys") || t.includes("party"))
    return "party";
  if (t.includes("alone")) return "alone";
  if (t.includes("run")) return "run";
  if (t === "one") return "spark";
  return undefined;
}

function emphasisFor(
  token: string,
  mood: TimedLine["mood"],
  shout: boolean,
): TimedWord["emphasis"] {
  if (shout) return "punch";
  if (mood === "intro") return "whisper";
  if (mood === "chorus") return "punch";
  if (token.length <= 2) return "flow";
  if (/[!?]/.test(token)) return "glitch";
  return "flow";
}

function syllableWeight(token: string): number {
  const t = token.toLowerCase().replace(/[^a-z']/g, "");
  if (!t) return 1;
  const vowelGroups = t.match(/[aeiouy]+/g);
  return Math.max(1, vowelGroups?.length ?? 1);
}

function tokenizeLine(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

function buildWordsEven(
  text: string,
  startMs: number,
  endMs: number,
  mood: TimedLine["mood"],
  shout: boolean,
): TimedWord[] {
  const tokens = tokenizeLine(text);
  const span = Math.max(endMs - startMs, 400);
  const weights = tokens.map(syllableWeight);
  const total = weights.reduce((a, b) => a + b, 0);
  let cursor = startMs;
  return tokens.map((token, i) => {
    const slice = (span * weights[i]) / total;
    const word = {
      text: token,
      startMs: cursor,
      endMs: cursor + slice,
      graphic: graphicFor(token),
      emphasis: emphasisFor(token, mood, shout),
    };
    cursor += slice;
    return word;
  });
}

export interface WordsJsonFile {
  lines?: Array<{
    lineIndex: number;
    words: Array<{ text: string; startMs: number; endMs: number }>;
  }>;
}

export function enrichParsedLines(
  parsed: ParsedLrcLine[],
  durationMs: number,
  wordsJson?: WordsJsonFile | null,
): TimedLine[] {
  const overrideMap = new Map<
    number,
    Array<{ text: string; startMs: number; endMs: number }>
  >();
  wordsJson?.lines?.forEach((entry) => overrideMap.set(entry.lineIndex, entry.words));

  return parsed.map((entry, index) => {
    const next = parsed[index + 1];
    const endMs = next ? next.startMs - 80 : durationMs;
    const mood = moodFor(entry.text, index);
    const shout =
      entry.text === entry.text.toUpperCase() || mood === "chorus";
    const override = overrideMap.get(index);

    let words: TimedWord[];
    if (entry.words?.length) {
      words = entry.words.map((w, wi, arr) => ({
        text: w.text,
        startMs: w.startMs,
        endMs: w.endMs ?? arr[wi + 1]?.startMs ?? endMs,
        graphic: graphicFor(w.text),
        emphasis: emphasisFor(w.text, mood, shout),
      }));
    } else if (override?.length) {
      words = override.map((w, wi, arr) => ({
        text: w.text,
        startMs: w.startMs,
        endMs: w.endMs ?? arr[wi + 1]?.startMs ?? endMs,
        graphic: graphicFor(w.text),
        emphasis: emphasisFor(w.text, mood, shout),
      }));
    } else {
      words = buildWordsEven(entry.text, entry.startMs, endMs, mood, shout);
    }

    return {
      id: `line-${index}`,
      startMs: entry.startMs,
      endMs,
      text: entry.text,
      mood,
      shout,
      words,
    };
  });
}
