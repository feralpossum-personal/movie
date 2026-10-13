// Netlify Function: a thin, locked-down proxy to The Movie Database (TMDB).
// The TMDB credential lives in the TMDB_TOKEN environment variable and is never sent to the browser.
// The page calls /api/tmdb?path=<tmdb path>&<tmdb params>.

export const config = { path: '/api/tmdb' };

// Only the read-only endpoints the app uses are allowed.
const ALLOWED = [
  /^search\/(movie|tv|multi)$/,
  /^trending\/(all|movie|tv)\/(day|week)$/,
  /^discover\/(movie|tv)$/,
  /^(movie|tv)\/\d+\/(recommendations|similar|watch\/providers)$/,
  /^(movie|tv)\/\d+$/,
];

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...extra },
  });

export default async (req) => {
  const url = new URL(req.url);
  const path = (url.searchParams.get('path') || '').replace(/^\/+|\/+$/g, '');

  if (!ALLOWED.some((re) => re.test(path))) {
    return json({ error: 'That TMDB path is not allowed.' }, 400);
  }

  const token =
    (globalThis.Netlify && globalThis.Netlify.env && globalThis.Netlify.env.get('TMDB_TOKEN')) ||
    process.env.TMDB_TOKEN;
  if (!token) {
    return json({ error: 'TMDB_TOKEN is not set on the server. Add it in Netlify and redeploy.' }, 500);
  }

  const target = new URL('https://api.themoviedb.org/3/' + path);
  for (const [key, value] of url.searchParams) {
    if (key !== 'path' && key !== 'api_key') target.searchParams.set(key, value);
  }
  if (!target.searchParams.has('language')) target.searchParams.set('language', 'en-AU');

  // A v4 "read access token" is a long JWT and goes in a header.
  // A v3 "API key" is a short hex string and goes in the query.
  const headers = { accept: 'application/json' };
  if (token.length > 64) headers.authorization = 'Bearer ' + token;
  else target.searchParams.set('api_key', token);

  let upstream;
  try {
    upstream = await fetch(target, { headers });
  } catch (err) {
    return json({ error: 'Could not reach TMDB.' }, 502);
  }

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      'content-type': 'application/json',
      // Cache at the edge and in the browser so repeat lookups are quick and light on TMDB.
      'cache-control': upstream.ok ? 'public, max-age=3600' : 'no-store',
    },
  });
};
