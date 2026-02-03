export const CSRF_COOKIE_NAME = "csrf_token";
export const CSRF_HEADER_NAME = "X-CSRF-Token";

const readCookie = (name: string): string | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${name}=`;
  const raw = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix));

  if (!raw) {
    return null;
  }

  const value = raw.slice(prefix.length);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const getCsrfTokenFromCookies = (): string | null => readCookie(CSRF_COOKIE_NAME);
