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

/**
 * Better Auth derives `code` from the message (uppercased, underscored), so
 * these keys cover both its built-ins and the APIErrors thrown in `~/auth`.
 */
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
  EMAIL_MISMATCH: {
    title: "This link was issued for a different email",
    description: "Request a new link from the account you're signing in with.",
  },
  USER_EMAIL_NOT_FOUND: {
    title: "Google didn't share an email address",
    description: "Allow email access on the Google consent screen and retry.",
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
  USERNAME_IS_ALREADY_TAKEN_PLEASE_TRY_ANOTHER: {
    title: "That username is taken",
    description: "Pick a different one.",
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
  PLEASE_CHOOSE_A_MORE_SECURE_PASSWORD: {
    title: "This password has appeared in a data breach",
    description: "Choose a different password to keep your account safe.",
    field: "password",
  },

  // --- Tokens & links ---
  INVALID_TOKEN: {
    title: "This link is invalid or has expired",
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
  LINKED_ACCOUNT_ALREADY_EXISTS: {
    title: "That account is already linked",
  },

  // --- Onboarding checks thrown by ~/auth ---
  RESULT_NOT_FOUND_FOR_THE_GIVEN_ROLL_NUMBER__CONTACT_ADMIN: {
    title: "We couldn't find your academic record",
    description: `Your roll number isn't in the results database yet. Contact the admin to get added.`,
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
    description: "Start the sign in from the site itself, not an external link.",
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
  503: { title: "The service is temporarily unavailable", description: CONTACT },
};

const GENERIC: AuthErrorInfo = {
  title: "Something went wrong",
  description: `Please try again. ${CONTACT}`,
};

/**
 * Maps an auth failure to user-facing copy. Unrecognised errors fall back to a
 * generic message so raw server text is never rendered.
 */
export function getAuthError(error: AuthErrorLike | null | undefined) {
  if (!error) return GENERIC;

  const byCode = error.code ? AUTH_ERRORS[error.code] : undefined;
  if (byCode) return byCode;

  if (typeof console !== "undefined") {
    console.warn("[auth] unmapped error", error.code, error.status);
  }
  return (error.status && STATUS_FALLBACKS[error.status]) || GENERIC;
}

/** Single-line form of {@link getAuthError}, for toasts. */
export function getAuthErrorMessage(error: AuthErrorLike | null | undefined) {
  const { title, description } = getAuthError(error);
  return description ? `${title}. ${description}` : title;
}
