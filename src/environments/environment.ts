/**
 * Development environment (used by `ng serve` and development builds).
 *
 * /api/* HTTP calls go through proxy.conf.json to the Spring Boot backend.
 * Absolute origins below are only needed for browser-level redirects that
 * bypass the dev-server proxy (e.g. the OAuth login redirect).
 */
export const environment = {
  production: false,
  /** Backend origin for browser redirects outside the /api proxy (OAuth login). */
  apiOrigin: 'http://localhost:8080',
  /** Default GSTR-1 conversion endpoint shown in System Configuration. */
  gstConvertEndpoint: 'http://localhost:8080/api/v1/gst/convert-meesho',
};
