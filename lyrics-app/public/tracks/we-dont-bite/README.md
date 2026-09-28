# We Don't Bite — bundled track folder

## Add your MP3 here

Copy your file to **this exact path** (filename must match `track.json`):

```text
lyrics-app/public/tracks/we-dont-bite/audio.mp3
```

From repo root:

```bash
cp "/path/to/We Don't Bite.mp3" lyrics-app/public/tracks/we-dont-bite/audio.mp3
```

Then verify:

```bash
cd lyrics-app
npm run validate:tracks
npm run dev
```

Open the app → track loads automatically (no need to use **Load audio** if the file is present).

| File | In git? |
| --- | --- |
| `lyrics.lrc` | Yes (your timings) |
| `track.json` | Yes |
| `audio.mp3` | **No** — gitignored; only on your machine / deploy |

If your file has a different name, either rename to `audio.mp3` or change `"audioFile"` in `track.json`.
