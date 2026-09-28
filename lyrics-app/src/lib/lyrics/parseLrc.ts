export interface ParsedLrcWord {
  text: string;
  startMs: number;
  endMs?: number;
}

export interface ParsedLrcLine {
  startMs: number;
  text: string;
  words?: ParsedLrcWord[];
}

export interface LrcMetadata {
  title?: string;
  artist?: string;
  album?: string;
  lengthMs?: number;
}

const TIME_RE = /(\d+):(\d{2})(?:\.(\d{1,3}))?/;

export function parseTimestamp(raw: string): number {
  const match = raw.match(TIME_RE);
  if (!match) return 0;
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  const frac = match[3] ? Number(match[3].padEnd(3, "0")) : 0;
  return minutes * 60_000 + seconds * 1000 + frac;
}

function parseLengthTag(value: string): number | undefined {
  const match = value.match(/(\d+):(\d{2})(?:\.(\d{1,3}))?/);
  if (!match) return undefined;
  return parseTimestamp(`${match[1]}:${match[2]}.${match[3] ?? "0"}`);
}

/** Parses standard + “enhanced” LRC (inline `<mm:ss.xx>word` tags). */
export function parseLrc(source: string): {
  meta: LrcMetadata;
  lines: ParsedLrcLine[];
} {
  const meta: LrcMetadata = {};
  const lines: ParsedLrcLine[] = [];

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("[ar:")) meta.artist = line.slice(4, -1);
    else if (line.startsWith("[ti:")) meta.title = line.slice(4, -1);
    else if (line.startsWith("[al:")) meta.album = line.slice(4, -1);
    else if (line.startsWith("[length:"))
      meta.lengthMs = parseLengthTag(line.slice(8, -1));
    else if (!line.startsWith("[")) continue;
    else {
      const tagMatch = line.match(/^\[(\d+:\d{2}(?:\.\d{1,3})?)\](.*)$/);
      if (!tagMatch) continue;
      const startMs = parseTimestamp(tagMatch[1]);
      const payload = tagMatch[2].trim();
      const enhanced = parseEnhancedWords(payload, startMs);
      if (enhanced) {
        lines.push({
          startMs,
          text: enhanced.text,
          words: enhanced.words,
        });
      } else {
        lines.push({ startMs, text: payload });
      }
    }
  }

  lines.sort((a, b) => a.startMs - b.startMs);
  return { meta, lines };
}

function parseEnhancedWords(
  payload: string,
  lineStartMs: number,
): { text: string; words: ParsedLrcWord[] } | null {
  if (!payload.includes("<")) return null;
  const re = /<(\d+:\d{2}(?:\.\d{1,3})?)>([^<]*)/g;
  const words: ParsedLrcWord[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(payload)) !== null) {
    const chunk = match[2].trim();
    if (!chunk) continue;
    for (const token of chunk.split(/\s+/).filter(Boolean)) {
      words.push({ text: token, startMs: parseTimestamp(match[1]) });
    }
  }
  if (!words.length) return null;

  const leading = payload.split("<")[0].trim();
  if (leading) {
    words.unshift({ text: leading, startMs: lineStartMs });
  }

  for (let i = 0; i < words.length; i++) {
    words[i].endMs = words[i + 1]?.startMs;
  }

  const text = words.map((w) => w.text).join(" ");
  return { text, words };
}
