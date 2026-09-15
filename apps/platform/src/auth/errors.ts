import { orgConfig } from "~/project.config";

export type AuthErrorLike = {
  code?: string;
  message?: string;
  status?: number;
  statusText?: string;
};

export type AuthErrorInfo = {
  /** Short headline, safe to show verbatim. */
  title: string;
  /** What the user should do next. */
  description?: string;
  /** Field to attach the message to, when the form owns one. */
  field?: "email" | "password" | "name";
  /** Route that resolves the problem, if one exists. */
  action?: { label: string; href: string };
};

const CONTACT = "If this keeps happening, contact the admin.";

/** Codes for the APIErrors thrown in `~/auth`; Better Auth 1.7 no longer derives a code from the message. */
export const APP_AUTH_ERROR_CODES = {
  ORG_EMAIL_REQUIRED: "ORG_EMAIL_REQUIRED",
  GOOGLE_EMAIL_NOT_VERIFIED: "GOOGLE_EMAIL_NOT_VERIFIED",
  RESULT_NOT_FOUND: "RESULT_NOT_FOUND",
  RESULT_LOOKUP_FAILED: "RESULT_LOOKUP_FAILED",
  FACULTY_LOOKUP_FAILED: "FACULTY_LOOKUP_FAILED",
  EMAIL_SEND_FAILED: "EMAIL_SEND_FAILED",
} as const;

// Keys are Better Auth codes; OAuth redirects send lowercase codes, which the error page uppercases.
const AUTH_ERRORS: Record<string, AuthErrorInfo> = {
  // --- Credentials ---
  INVALID_EMAIL_OR_PASSWORD: {
    title: "Incorrect email or password",
    description: "Check your credentials and try again.",
    field: "password",
    action: { label: "Forgot password?", href: "/auth/forgot-password" },
  },
  INVALID_USERNAME_OR_PASSWORD: {
    title: "Incorrect username or password",
    description: "Check your credentials and try again.",
    field: "password",
    action: { label: "Forgot password?", href: "/auth/forgot-password" },
  },
  INVALID_PASSWORD: {
    title: "Incorrect password",
    field: "password",
    action: { label: "Forgot password?", href: "/auth/forgot-password" },
  },
  CREDENTIAL_ACCOUNT_NOT_FOUND: {
    title: "This account uses Google Sign In",
    description: "Continue with Google instead of a password.",
  },
  USER_NOT_FOUND: {
    title: "No account found for this email",
    description: "Create an account to get started.",
    field: "email",
  },

  // --- Email state ---
  EMAIL_NOT_VERIFIED: {
    title: "Verify your email first",
    description: "We sent you a verification link. Check your inbox and spam.",
    action: { label: "Resend verification", href: "/auth/verify-mail" },
  },
  EMAIL_ALREADY_VERIFIED: {
    title: "Your email is already verified",
    description: "You can sign in now.",
    action: { label: "Sign in", href: "/auth/sign-in" },
  },
  INVALID_EMAIL: {
    title: "That email address isn't valid",
    field: "email",
  },
  INVALID_EMAIL_FORMAT: {
    title: `Use your ${orgConfig.shortName} email`,
    description: `Only ${orgConfig.mailSuffix} addresses can be used here.`,
    field: "email",
  },
  [APP_AUTH_ERROR_CODES.ORG_EMAIL_REQUIRED]: {
    title: `Use your ${orgConfig.shortName} email`,
    description: `Only ${orgConfig.mailSuffix} addresses can be used here. Pick that account on the Google screen.`,
    field: "email",
  },
  [APP_AUTH_ERROR_CODES.GOOGLE_EMAIL_NOT_VERIFIED]: {
    title: "Your Google account email isn't verified",
    description: "Verify it with Google, then try again.",
  },
  EMAIL_MISMATCH: {
    title: "This link was issued for a different email",
    description: "Request a new link from the account you're signing in with.",
  },
  EMAIL_DOES_NOT_MATCH: {
    title: "That Google account uses a different email",
    description: "Pick the Google account with the same email as this account.",
  },
  USER_EMAIL_NOT_FOUND: {
    title: "Google didn't share an email address",
    description: "Allow email access on the Google consent screen and retry.",
  },
  EMAIL_NOT_FOUND: {
    title: "Google didn't share an email address",
    description: "Allow email access on the Google consent screen and retry.",
  },
  [APP_AUTH_ERROR_CODES.EMAIL_SEND_FAILED]: {
    title: "We couldn't send the email",
    description: `Try again in a few minutes. If you just created an account, sign in later to get a new link. ${CONTACT}`,
  },

  // --- Registration ---
  USER_ALREADY_EXISTS: {
    title: "An account with this email already exists",
    description: "Sign in instead, or reset your password.",
    field: "email",
    action: { label: "Sign in", href: "/auth/sign-in" },
  },
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: {
    title: "An account with this email already exists",
    description: "Sign in instead, or reset your password.",
    field: "email",
    action: { label: "Sign in", href: "/auth/sign-in" },
  },
  USERNAME_IS_ALREADY_TAKEN: {
    title: "That username is taken",
    description: "Pick a different one.",
  },
  FAILED_TO_CREATE_USER: {
    title: "We couldn't create your account",
    description: CONTACT,
  },
  UNABLE_TO_CREATE_USER: {
    title: "We couldn't create your account",
    description: CONTACT,
  },

  // --- Password rules ---
  PASSWORD_TOO_SHORT: {
    title: "Password is too short",
    description: "Use at least 8 characters.",
    field: "password",
  },
  PASSWORD_TOO_LONG: {
    title: "Password is too long",
    description: "Use 128 characters or fewer.",
    field: "password",
  },
  PASSWORD_COMPROMISED: {
    title: "This password has appeared in a data breach",
    description: "Choose a different password to keep your account safe.",
    field: "password",
  },
  PASSWORD_ALREADY_SET: {
    title: "This account already has a password",
    description: "Use Forgot password to change it.",
    action: { label: "Forgot password?", href: "/auth/forgot-password" },
  },

  // --- Tokens & links ---
  INVALID_TOKEN: {
    title: "This link is invalid or has expired",
    description: "Request a fresh one and use it within the time limit.",
  },
  TOKEN_EXPIRED: {
    title: "This link has expired",
    description: "Request a fresh one and use it within the time limit.",
  },
  SESSION_EXPIRED: {
    title: "Your session expired",
    description: "Sign in again to continue.",
    action: { label: "Sign in", href: "/auth/sign-in" },
  },
  SESSION_NOT_FRESH: {
    title: "Please sign in again to confirm it's you",
    description: "This action needs a recent sign in.",
    action: { label: "Sign in", href: "/auth/sign-in" },
  },

  // --- Account state ---
  BANNED_USER: {
    title: "This account has been suspended",
    description: CONTACT,
  },
  ACCOUNT_NOT_FOUND: {
    title: "Account not found",
    description: CONTACT,
  },
  SOCIAL_ACCOUNT_ALREADY_LINKED: {
    title: "That Google account is linked to another user",
    description: CONTACT,
  },
  ACCOUNT_ALREADY_LINKED_TO_DIFFERENT_USER: {
    title: "That Google account is linked to another user",
    description: CONTACT,
  },
  UNABLE_TO_LINK_ACCOUNT: {
    title: "We couldn't link your Google account",
    description: CONTACT,
  },
  LINKED_ACCOUNT_ALREADY_EXISTS: {
    title: "That account is already linked",
  },

  // --- Onboarding checks thrown by ~/auth ---
  [APP_AUTH_ERROR_CODES.RESULT_NOT_FOUND]: {
    title: "We couldn't find your academic record",
    description: `Your roll number isn't in the results database yet. Contact the admin to get added.`,
  },
  [APP_AUTH_ERROR_CODES.RESULT_LOOKUP_FAILED]: {
    title: "We couldn't check your academic record",
    description: `Our records service is having trouble. Your account wasn't created, so try again in a few minutes. ${CONTACT}`,
  },
  [APP_AUTH_ERROR_CODES.FACULTY_LOOKUP_FAILED]: {
    title: "We couldn't verify your staff or faculty status",
    description: `Our directory service is having trouble. Your account wasn't created, so try again in a few minutes. ${CONTACT}`,
  },

  // --- Origin / CSRF ---
  INVALID_ORIGIN: {
    title: "Sign in was blocked for security",
    description: "Reopen the page from the official site and try again.",
  },
  MISSING_OR_NULL_ORIGIN: {
    title: "Sign in was blocked for security",
    description: "Reopen the page from the official site and try again.",
  },
  CROSS_SITE_NAVIGATION_LOGIN_BLOCKED: {
    title: "Sign in was blocked for security",
    description:
      "Start the sign in from the site itself, not an external link.",
  },
  INVALID_CALLBACK_URL: {
    title: "Sign in was blocked for security",
    description: "Reopen the page from the official site and try again.",
  },
  PLEASE_RESTART_THE_PROCESS: {
    title: "The sign in took too long",
    description: "Start again from the sign in page.",
    action: { label: "Back to sign in", href: "/auth/sign-in" },
  },
  STATE_NOT_FOUND: {
    title: "The sign in took too long",
    description: "Start again from the sign in page.",
    action: { label: "Back to sign in", href: "/auth/sign-in" },
  },
  INVALID_CODE: {
    title: "Google sign in didn't complete",
    description: "Start again from the sign in page.",
    action: { label: "Back to sign in", href: "/auth/sign-in" },
  },
  // Google returns no profile when the account is outside the `hd` domain.
  UNABLE_TO_GET_USER_INFO: {
    title: `Use your ${orgConfig.shortName} Google account`,
    description: `Only ${orgConfig.mailSuffix} accounts can sign in. Pick that account on the Google screen.`,
    action: { label: "Back to sign in", href: "/auth/sign-in" },
  },
  INTERNAL_SERVER_ERROR: {
    title: "Something went wrong on our end",
    description: CONTACT,
  },
};

const STATUS_FALLBACKS: Record<number, AuthErrorInfo> = {
  401: { title: "Incorrect email or password", field: "password" },
  403: { title: "You don't have access to this", description: CONTACT },
  409: { title: "That account already exists", field: "email" },
  429: {
    title: "Too many attempts",
    description: "Wait a minute before trying again.",
  },
  500: { title: "Something went wrong on our end", description: CONTACT },
  502: { title: "The service is unreachable right now", description: CONTACT },
  503: {
    title: "The service is temporarily unavailable",
    description: CONTACT,
  },
};

const GENERIC: AuthErrorInfo = {
  title: "Something went wrong",
  description: `Please try again. ${CONTACT}`,
};

/**
 * Maps an auth failure to user-facing copy. Unmapped 4xx errors show Better Auth's own message;
 * 5xx and unknown errors fall back to generic copy so internals never reach the user.
 */
export function getAuthError(
  error: AuthErrorLike | null | undefined
): AuthErrorInfo {
  if (!error) return GENERIC;

  const byCode = error.code ? AUTH_ERRORS[error.code.toUpperCase()] : undefined;
  if (byCode) return byCode;

  console.warn("[auth] unmapped error", error.code, error.status);
  const isClientError =
    error.status !== undefined && error.status >= 400 && error.status < 500;
  if (isClientError && error.status !== 401 && error.message) {
    return { title: error.message };
  }
  return (error.status && STATUS_FALLBACKS[error.status]) || GENERIC;
}

/** Normalises a thrown server-side `auth.api` error into the shape {@link getAuthError} reads. */
export function toAuthErrorLike(error: unknown): AuthErrorLike | null {
  if (!error || typeof error !== "object") return null;
  const e = error as {
    statusCode?: number;
    message?: string;
    body?: { code?: string; message?: string };
  };
  if (!e.statusCode) return null;
  return {
    code: e.body?.code,
    message: e.body?.message ?? e.message,
    status: e.statusCode,
  };
}

/** Single-line form of {@link getAuthError}, for toasts. */
export function getAuthErrorMessage(error: AuthErrorLike | null | undefined) {
  const { title, description } = getAuthError(error);
  return description ? `${title}. ${description}` : title;
}
