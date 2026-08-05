// ponytail: without this, the SPA catch-all answers /api/* with index.html and a 200, so the
// SDK "succeeds" with HTML instead of data. Replace this with a proxy to the real backend
// when one exists; _redirects cannot express a 404.
export const onRequest = () =>
  new Response(JSON.stringify({ error: 'No backend is configured for this deployment.' }), {
    status: 404,
    headers: { 'content-type': 'application/json' }
  });
