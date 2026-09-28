# We Don't Bite — bundled track folder

Place **your legally obtained audio** here:

| File | Required | Notes |
| --- | --- | --- |
| `audio.m4a` | For bundled playback | Also supported: rename in `track.json` to `audio.mp3` |
| `lyrics.lrc` | Yes (committed) | Line-level sync; enhanced LRC optional |
| `words.json` | Optional | Word/syllable-accurate overrides (see docs) |
| `track.json` | Yes | Manifest the app reads |

Audio files are **gitignored** so we do not commit copyrighted media. Lyrics timing can stay in the repo.

Quick add:

```bash
cp ~/Music/We-Dont-Bite.m4a ./audio.m4a
npm run validate:tracks
```
