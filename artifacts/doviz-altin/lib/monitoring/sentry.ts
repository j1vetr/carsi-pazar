import * as Sentry from "@sentry/react-native";

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? "";

/**
 * Build profile (dev/preview/production) `eas.json` env block tarafından
 * `EXPO_PUBLIC_APP_ENV` olarak inject edilir. Lokal/Expo Go'da __DEV__ true,
 * profile yoksa "development" varsayılır → Sentry events ortama göre
 * etiketlenir (release ≠ debug crash gürültüsü).
 */
const APP_ENV =
  process.env.EXPO_PUBLIC_APP_ENV ??
  (typeof __DEV__ !== "undefined" && __DEV__ ? "development" : "production");

let initialized = false;

const SENSITIVE_KEY_RE = /token|secret|auth|password|key|cookie|session/i;

function sanitize(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (depth > 4) return "[truncated]";
  if (typeof value === "string") {
    return value.length > 500 ? value.slice(0, 500) + "…" : value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 50).map((v) => sanitize(v, depth + 1));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY_RE.test(k)) {
        out[k] = "[redacted]";
      } else {
        out[k] = sanitize(v, depth + 1);
      }
    }
    return out;
  }
  return value;
}

export function initSentry(): void {
  if (initialized) return;
  if (!DSN) {
    if (__DEV__) console.warn("[sentry] EXPO_PUBLIC_SENTRY_DSN not set; skipping init");
    return;
  }
  try {
    Sentry.init({
      dsn: DSN,
      enabled: APP_ENV !== "development",
      environment: APP_ENV,
      tracesSampleRate: APP_ENV === "production" ? 0.1 : 0.5,
      sendDefaultPii: false,
      beforeSend(event) {
        try {
          if (event.request) event.request = sanitize(event.request) as typeof event.request;
          if (event.extra) event.extra = sanitize(event.extra) as typeof event.extra;
          if (event.contexts) event.contexts = sanitize(event.contexts) as typeof event.contexts;
          if (event.user) {
            const u = event.user;
            event.user = { id: u.id };
          }
        } catch {}
        return event;
      },
      beforeBreadcrumb(crumb) {
        if (crumb.data) crumb.data = sanitize(crumb.data) as typeof crumb.data;
        return crumb;
      },
    });
    initialized = true;
  } catch (e) {
    if (__DEV__) console.warn("[sentry] init failed", e);
  }
}

export function reportError(error: Error, stackTrace?: string): void {
  if (!initialized) return;
  try {
    Sentry.captureException(error, (scope) => {
      if (stackTrace) scope.setExtra("componentStack", stackTrace);
      return scope;
    });
  } catch {}
}
