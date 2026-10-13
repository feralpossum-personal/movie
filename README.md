# Movie Night Wheel

Add the shows and films you have all enjoyed, spin the wheel, and see where to watch the pick in Australia. Suggestions are sorted Netflix first, then free platforms, then paid ones.

Titles, recommendations and "where to watch" data come live from [TMDB](https://www.themoviedb.org/) (availability data is provided by JustWatch via TMDB). Your TMDB credential stays on the server in a Netlify Function, so it is never visible in the page.

```
public/index.html            the whole app (no build step)
netlify/functions/tmdb.mjs   server-side proxy to TMDB, served at /api/tmdb
netlify.toml                 publishes /public and finds the function
.env.example                 template for local testing
```

## Deploy on Netlify (via GitHub)

1. Create a new GitHub repo and push this folder to it.
2. In Netlify choose **Add new site → Import an existing project**, pick the repo.
   Leave the build command empty. The publish directory is read from `netlify.toml` (`public`).
3. Open **Site configuration → Environment variables** and add `TMDB_TOKEN`.
   Use your TMDB **API Read Access Token** (the long one). The short **API Key** also works.
4. Go to **Deploys → Trigger deploy → Deploy site** so the function picks up the variable.
5. Open the site. The wheel should fill with popular titles within a few seconds.

If the page says the lookup service is not responding, the usual cause is a missing `TMDB_TOKEN` or a deploy that happened before it was added.

## Test locally

```
npm install -g netlify-cli
cp .env.example .env      # then paste your token into .env
netlify dev
```

Open the address it prints. Opening `index.html` straight from disk will not work because the page needs the `/api/tmdb` function.

## How the wheel behaves

- Every spin draws a brand new wheel of 8 titles. Anything that has already been on a wheel tonight is removed from the pool and from the "Still to come up" lists, and moves to "Already suggested tonight" (titles that landed are marked). Tap one there to see its card again.
- When the pool runs low the app quietly fetches more titles in the background. If a filter combination genuinely runs dry it says so; press **Start over** to put everything back.
- Changing a filter, favourite, platform or pressing Start over while the wheel is spinning cancels that spin.
- Results are sorted Netflix, then free platforms, then paid streaming, then rent or buy. Rent or buy is on by default; turn the "Rent or buy" chip off to leave it out.
- Languages: "Any language" mixes in popular Korean, Japanese, Spanish and French titles alongside English ones. Pick specific language chips to narrow to those. Foreign-language titles show their original language; check for subtitles or dubbing on the platform.

## Where your data lives

Favourites, genre, language, type and platform choices are saved in the browser (local storage), so they come back on the same device. Each device keeps its own copy. Looked-up platform availability is cached for 12 hours per device.
The "already suggested tonight" list is kept for the browser tab's session (session storage), so a reload keeps it, but closing the tab starts a fresh evening.

## Notes

- Availability is for Australia (`AU`). Streaming-service names are matched by pattern, so anything unrecognised shows as "Other free" or "Other paid".
- TMDB's terms ask for attribution and their logo. The footer carries the required text; add their logo from their brand assets page if you share this widely.
