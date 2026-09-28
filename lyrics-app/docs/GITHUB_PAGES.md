# GitHub Pages

This app is a **static export** (`output: 'export'`) so it can run on GitHub Pages (no Node server).

## One-time GitHub setup

1. Repo **Settings → Pages**
2. **Build and deployment → Source:** **GitHub Actions**
3. Push to `main` — workflow **Deploy to GitHub Pages** runs automatically

Your URL (project site):

**https://kruffy12.github.io/ADHD-Lyrics/**

(Replace user/repo if yours differ.)

## Install on iPhone

1. Open that URL in **Safari**
2. **Share → Add to Home Screen**

Use the **Home Screen icon**, not a Safari tab, for standalone/full-screen behavior.

## Audio on Pages

`audio.mp3` is gitignored, so it is **not** deployed unless you:

- Use **Load audio** on the phone (pick MP3 from Files) — lyrics still sync, or
- Force-add audio to the repo / host MP3 elsewhere (see main README)

## Local dev vs Pages

| Command | Use |
| --- | --- |
| `npm run dev` | Local, no base path (`http://localhost:3000`) |
| `npm run build:gh-pages` | Test the same paths as production Pages build |

If you rename the repo, update `NEXT_PUBLIC_BASE_PATH` in `.github/workflows/deploy-github-pages.yml` to `/<repo-name>`.
