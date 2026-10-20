import { environment } from '../../../environments/environment';

/**
 * Runtime configuration served as a static asset (`public/api-config.json`).
 *
 * It is fetched once at bootstrap so the backend origin can change after a
 * production deploy (e.g. on Firebase Hosting) without rebuilding the app.
 * Any missing/invalid value falls back to the build-time `environment`
 * defaults, so the app keeps working when the file is absent (dev server).
 */
export interface AppConfig {
  /** Backend origin, no trailing slash ('' = same origin). */
  apiOrigin: string;
  /** Default GSTR-1 conversion endpoint (absolute URL, or path on the backend origin). */
  gstConvertEndpoint: string;
}

const DEFAULTS: AppConfig = {
  apiOrigin: (environment.apiOrigin || '').trim().replace(/\/+$/, ''),
  gstConvertEndpoint: environment.gstConvertEndpoint,
};

let current: AppConfig = { ...DEFAULTS };

function sanitize(raw: unknown): Partial<AppConfig> {
  const out: Partial<AppConfig> = {};
  const record = (raw ?? {}) as Record<string, unknown>;
  if (typeof record['apiOrigin'] === 'string') {
    out.apiOrigin = record['apiOrigin'].trim().replace(/\/+$/, '');
  }
  if (typeof record['gstConvertEndpoint'] === 'string' && record['gstConvertEndpoint'].trim()) {
    out.gstConvertEndpoint = record['gstConvertEndpoint'].trim();
  }
  return out;
}

/** The active runtime configuration. */
export function appConfig(): AppConfig {
  return current;
}

/** Backend origin without trailing slash ('' = same origin). */
export function apiOrigin(): string {
  return current.apiOrigin;
}

/**
 * Prefixes an app-relative API path (e.g. "/api/auth/user") with the
 * configured backend origin. Absolute http(s) URLs pass through unchanged.
 */
export function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${current.apiOrigin}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Loads `public/api-config.json` once at startup (see `provideAppInitializer`
 * in app.config.ts). Never throws: on any failure the build-time environment
 * defaults stay in effect so the app still boots.
 */
export async function loadAppConfig(): Promise<void> {
  // In development mode (environment.production === false), always use environment.ts
  // so local dev server requests route to localhost (or via dev-server proxy).
  if (!environment.production) {
    return;
  }

  try {
    const response = await fetch('/api-config.json', { cache: 'no-cache' });
    if (!response.ok) return;
    const raw: unknown = await response.json();
    current = { ...current, ...sanitize(raw) };
  } catch {
    // File missing or offline — keep the build-time defaults.
  }
}
