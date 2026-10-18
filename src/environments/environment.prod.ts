/**
 * Production environment (used by `ng build`, the default configuration).
 *
 * The frontend is expected to be served same-origin with the backend, or
 * behind a reverse proxy that forwards /api and /oauth2 to it, so all URLs
 * are relative. If the backend lives on a different origin in production,
 * set `apiOrigin` to that origin (e.g. "https://api.example.com").
 */
export const environment = {
  production: true,
  /** Backend origin for browser redirects ('' = same origin). */
  apiOrigin: '',
  /** Default GSTR-1 conversion endpoint shown in System Configuration. */
  gstConvertEndpoint: '/api/v1/gst/convert-meesho',
};
