import { browser } from '$app/environment';
import { env as privateEnv } from '$env/dynamic/private';

export const getBaseURL = () => {
  // ✅ Browser → exact origin (correct)
  if (browser) {
    return window.location.origin;
  }

  // ✅ Explicit override (highest priority)
  if (privateEnv.BETTER_AUTH_URL) {
    return privateEnv.BETTER_AUTH_URL;
  }

  // ✅ Vercel environments
  if (privateEnv.VERCEL === '1') {
    const host =
      privateEnv.VERCEL_PROJECT_PRODUCTION_URL ||
      privateEnv.VERCEL_PROJECT_PREVIEW_URL ||
      privateEnv.VERCEL_URL;

    if (host) {
      return `https://${host}`;
    }
  }

  // ✅ Local fallback
  return 'http://localhost:3000';
};