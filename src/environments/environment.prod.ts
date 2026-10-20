/**
 * Production environment (used by `ng build`, the default configuration).
 *
 * These values are BUILD-TIME DEFAULTS. At runtime the app first loads
 * `public/api-config.json` (served next to index.html) and overrides
 * `apiOrigin` / `gstConvertEndpoint` from it, so the backend origin can be
 * changed after a deploy (e.g. on Firebase Hosting) without rebuilding.
 *
 * Default here is same-origin relative URLs: correct when a reverse proxy
 * forwards /api and /oauth2 to the backend. For a separately hosted backend
 * (e.g. https://myecomgst.web.app with an API on another origin), set
 * `apiOrigin` in `public/api-config.json` to that origin.
 */
export const environment = {
  production: true,
  /** Backend origin for browser redirects ('' = same origin). */
  apiOrigin: 'https://tax-plus-spring-boot.onrender.com',
  /** Default GSTR-1 conversion endpoint shown in System Configuration. */
  gstConvertEndpoint: '/api/v1/gst/convert-meesho',
};
