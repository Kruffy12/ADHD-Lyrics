import type { TimedLine } from "../types";

export function findActiveLine(
  lines: TimedLine[],
  timeMs: number,
): { line: TimedLine; index: number } | null {
  for (let i = lines.length - 1; i >= 0; i--) {
    if (timeMs >= lines[i].startMs) {
      return { line: lines[i], index: i };
    }
  }
  return lines.length ? { line: lines[0], index: 0 } : null;
}

export function findActiveWord(
  line: TimedLine,
  timeMs: number,
): { word: TimedLine["words"][number]; index: number } | null {
  for (let i = line.words.length - 1; i >= 0; i--) {
    if (timeMs >= line.words[i].startMs) {
      return { word: line.words[i], index: i };
    }
  }
  return line.words.length ? { word: line.words[0], index: 0 } : null;
}
