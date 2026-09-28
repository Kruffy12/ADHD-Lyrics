# Adding a bundled track (audio + lyrics)

This app treats each song as a **folder bundle** under `public/tracks/<slug>/`. The UI loads `track.json` + `lyrics.lrc` at runtime and optionally plays bundled audio.

## What you give the agent (or do yourself)

For a **new song**, send:

1. **Audio** — file attachment or exact filename you will drop in the folder (`audio.m4a` / `audio.mp3`).
2. **Timed lyrics** — at least one of:
   - **`.lrc` file** (best): export from [LRCLIB](https://lrclib.net/), Spotify lyric tools, or community sites (verify against your audio).
   - **Enhanced LRC** with inline word tags: `[00:43.81]Five <00:44.20>long <00:44.55>nights` — enables karaoke-level sync without extra JSON.
   - **`words.json`** (optional precision): per-line word `startMs` / `endMs` if you align manually or via tooling.
3. **Metadata** — title, artist, duration (optional if in LRC `[length:` tag).
4. **Keyword hints** (optional) — words that should trigger icons (e.g. “flashlight”, “bite”) — we map many automatically in `enrichLines.ts`.

### Copy-paste template for a new track request

```text
Add track bundle:
- Title: …
- Artist: …
- Slug: my-song-slug
- Audio: (attached my-song.m4a OR I will add public/tracks/my-song-slug/audio.m4a)
- Lyrics: (attached lyrics.lrc OR link to LRC)
- Word sync: line-only | enhanced LRC | words.json
- Special graphics: word → icon (optional)
```

## Repo steps (automated checklist)

```bash
mkdir -p public/tracks/my-song-slug
# copy audio → public/tracks/my-song-slug/audio.m4a  (local only, gitignored)
cp lyrics.lrc public/tracks/my-song-slug/
# edit track.json (copy from we-dont-bite)
# add { id, folder } to src/lib/tracks/loadTrack.ts → TRACK_CATALOG
npm run validate:tracks
```

## `track.json` schema

```json
{
  "id": "my-song-slug",
  "title": "Song Title",
  "artist": "Artist",
  "durationMs": 208000,
  "audioFile": "audio.m4a",
  "lyricsFile": "lyrics.lrc",
  "wordsFile": null
}
```

## Optional `words.json` (syllable / word accurate)

```json
{
  "lines": [
    {
      "lineIndex": 0,
      "words": [
        { "text": "Hello", "startMs": 12000, "endMs": 12500 },
        { "text": "world", "startMs": 12500, "endMs": 13100 }
      ]
    }
  ]
}
```

Line index matches sorted LRC lines (0-based). If omitted, words are interpolated by **syllable weight** within each line.

## If you only have plain lyrics (no timing)

Ask the agent to:

1. Source or build an LRC (community file + you verify offset), **or**
2. Run a future alignment pipeline (Whisper / forced alignment) — not in MVP; plan separate script.

Always **verify** the first chorus hit and hook line manually; offset fixes are usually a constant ms shift in LRC.

## Copyright

- **Lyrics timing** in LRC form is often fine in a private/personal repo; distributing audio publicly requires rights.
- Default **gitignore** excludes `public/tracks/**/audio.*` so only you add media locally or via secure storage/CDN.

## Validation

```bash
npm run validate:tracks
```

Checks every catalog entry has `track.json`, lyrics file, parseable LRC, and warns if audio is missing.
