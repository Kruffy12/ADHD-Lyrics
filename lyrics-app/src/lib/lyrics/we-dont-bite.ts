import type { TimedLine, TrackMeta, WordGraphic } from "../types";

const LRC_LINES: { ms: number; text: string }[] = [
  { ms: 7690, text: "Things haven't been the same since my birthday.." },
  { ms: 10880, text: "We went to Fazbear's, that was the worst day.." },
  { ms: 14060, text: "Home alone in this awful darkness" },
  { ms: 16190, text: "I don't even know where my dad or mom is" },
  { ms: 18040, text: "Never been a fan of animatronics" },
  { ms: 19910, text: "Can I get a grown-up to check in my closet?" },
  { ms: 22560, text: "Just heard a noise, I don't know where it went" },
  { ms: 23360, text: "To the right or the left, is it under my bed?" },
  { ms: 25220, text: "This must be joke and it's all in my head" },
  { ms: 27070, text: "But what if I'm in Hell and I'm already dead?" },
  { ms: 29470, text: "Calm down, take it slow" },
  { ms: 30790, text: "Check the halls, listen close" },
  { ms: 32660, text: "Shut the door, better keep it closed" },
  { ms: 34520, text: "What's behind it? I don't wanna know" },
  { ms: 36380, text: "Fazbear's pizza? Thought it was gone" },
  { ms: 38240, text: "Freddy and his friends are far from done" },
  { ms: 40090, text: "Did you hear that? Now here they all come" },
  { ms: 41960, text: "Five long nights and I'm only on ONE" },
  { ms: 43810, text: "WELCOME HOME, GIRLS AND BOYS" },
  { ms: 47530, text: "TIME TO PLAY WITH BRAND NEW TOYS" },
  { ms: 51250, text: "NIGHTMARES LURK INSIDE YOUR MIND" },
  { ms: 54970, text: "NOW NO PLACE IS SAFE TO HIDE (to hide)" },
  { ms: 59490, text: "YOU HAVE NOWHERE TO RUN" },
  { ms: 62680, text: "SO WHY NOT JOIN THE FUN?" },
  { ms: 66660, text: "AT NIGHT WE COME TO LIFE" },
  { ms: 70110, text: "COME CLOSER, WE DON'T BITE!" },
  { ms: 73300, text: "I don't believe that for one second" },
  { ms: 75960, text: "Let me keep my distance and I'll be pleasant" },
  { ms: 77280, text: "If you wanna be my friend, then prove it" },
  { ms: 78880, text: "I got a flashlight and i know how to use it" },
  { ms: 81000, text: "That's right, step back from me" },
  { ms: 82330, text: "I'll snap at you if you snap at me" },
  { ms: 84190, text: "And then I'll flash you when you try attacking me" },
  { ms: 86310, text: "Hope that I don't run out of batteries" },
  { ms: 88430, text: "Oh my God, I'm on my own" },
  { ms: 89760, text: "Left alone and I'm not that old" },
  { ms: 91630, text: "Wish there was a lock on the door" },
  { ms: 93750, text: "Where am I now? This is not my home" },
  { ms: 95610, text: "Oddly enough, feels like I'm not alone" },
  { ms: 97470, text: "Whoa, sorry guys, but you got to go" },
  { ms: 99060, text: "My mom and dad are not comfortable" },
  { ms: 100920, text: "With robots watching me when I'm ALL ALONE" },
  { ms: 103050, text: "WELCOME HOME, GIRLS AND BOYS" },
  { ms: 106760, text: "TIME TO PLAY WITH BRAND NEW TOYS" },
  { ms: 110480, text: "NIGHTMARES LURK INSIDE YOUR MIND" },
  { ms: 113940, text: "NOW NO PLACE IS SAFE TO HIDE (to hide)" },
  { ms: 118450, text: "YOU HAVE NOWHERE TO RUN" },
  { ms: 121900, text: "SO WHY NOT JOIN THE FUN?" },
  { ms: 125630, text: "AT NIGHT WE COME TO LIFE" },
  { ms: 129350, text: "COME CLOSER, WE DON'T BITE!" },
  { ms: 133330, text: "Things haven't been the same since my birthday.." },
  { ms: 136510, text: "We went to Fazbear's, that was the worst day.." },
  { ms: 140500, text: "I'm crying out now, somebody help me.." },
  { ms: 143950, text: "'Cause when I open up my eyes, they surround me.." },
  { ms: 147940, text: "Why did it have to be me?.." },
  { ms: 151390, text: "Nobody else believes me.." },
  { ms: 155110, text: "Will nothing here give me peace?.." },
  { ms: 158830, text: "Maybe death will set me free.." },
  { ms: 162020, text: "No! I'm not giving up easy" },
  { ms: 164410, text: "Ain't gonna let a cupcake eat me" },
  { ms: 166000, text: "You're not real, I call your bluff (wah!)" },
  { ms: 167590, text: "That scare was real enough!" },
  { ms: 169450, text: "Even when they're not in business" },
  { ms: 171310, text: "I'm number one on Fredbear's hit list" },
  { ms: 173170, text: "Time for the nightmares to go away" },
  { ms: 175040, text: "Nobody told you? We're here to stay" },
  { ms: 176630, text: "WELCOME HOME, GIRLS AND BOYS" },
  { ms: 180610, text: "TIME TO PLAY WITH BRAND NEW TOYS" },
  { ms: 184330, text: "NIGHTMARES LURK INSIDE YOUR MIND" },
  { ms: 188040, text: "NOW NO PLACE IS SAFE TO HIDE (to hide)" },
  { ms: 192300, text: "YOU HAVE NOWHERE TO RUN" },
  { ms: 195490, text: "SO WHY NOT JOIN THE FUN?" },
  { ms: 199200, text: "AT NIGHT WE COME TO LIFE" },
  { ms: 203720, text: "COME CLOSER, WE DON'T BITE!" },
];

const DURATION_MS = 208640;

function moodFor(text: string, index: number): TimedLine["mood"] {
  const upper = text.toUpperCase();
  if (index < 2) return "intro";
  if (upper.includes("WELCOME HOME") || upper.includes("WE DON'T BITE"))
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

function graphicFor(token: string): WordGraphic | undefined {
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
  if (t === "one" || t === "flash") return "spark";
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

type TimedWord = TimedLine["words"][number];

function tokenizeLine(text: string): string[] {
  return text.split(/(\s+)/).filter((p) => p.trim().length > 0);
}

function buildWords(
  text: string,
  startMs: number,
  endMs: number,
  mood: TimedLine["mood"],
  shout: boolean,
): TimedWord[] {
  const tokens = tokenizeLine(text);
  const span = Math.max(endMs - startMs, 400);
  const slice = span / Math.max(tokens.length, 1);
  return tokens.map((token, i) => {
    const wStart = startMs + i * slice;
    const wEnd = wStart + slice;
    return {
      text: token,
      startMs: wStart,
      endMs: wEnd,
      graphic: graphicFor(token),
      emphasis: emphasisFor(token, mood, shout),
    };
  });
}

function buildLines(): TimedLine[] {
  return LRC_LINES.map((entry, index) => {
    const next = LRC_LINES[index + 1];
    const endMs = next ? next.ms - 80 : DURATION_MS;
    const shout =
      entry.text === entry.text.toUpperCase() ||
      moodFor(entry.text, index) === "chorus";
    const mood = moodFor(entry.text, index);
    return {
      id: `line-${index}`,
      startMs: entry.ms,
      endMs,
      text: entry.text,
      mood,
      shout,
      words: buildWords(entry.text, entry.ms, endMs, mood, shout),
    };
  });
}

export const WE_DONT_BITE_META: TrackMeta = {
  id: "we-dont-bite",
  title: "We Don't Bite",
  artist: "JT Music",
  durationMs: DURATION_MS,
  sourceNote:
    "Community LRC timing (~3:28). Load your own audio file — not included.",
};

export const WE_DONT_BITE_LINES: TimedLine[] = buildLines();

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
): { word: TimedWord; index: number } | null {
  for (let i = line.words.length - 1; i >= 0; i--) {
    if (timeMs >= line.words[i].startMs) {
      return { word: line.words[i], index: i };
    }
  }
  return line.words.length ? { word: line.words[0], index: 0 } : null;
}
