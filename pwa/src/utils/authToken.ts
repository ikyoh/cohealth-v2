import { jwtDecode } from "jwt-decode";

const AUTH_COOKIE = "cohealth_auth_token";

export function setAuthToken(token: string) {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; Max-Age=604800; Path=/; SameSite=Strict${secure}`;
}

export function getAuthToken() {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${AUTH_COOKIE}=`));

  return cookie ? decodeURIComponent(cookie.slice(AUTH_COOKIE.length + 1)) : null;
}

export function removeAuthToken() {
  if (typeof document === "undefined") return;

  document.cookie = `${AUTH_COOKIE}=; Max-Age=0; Path=/; SameSite=Strict`;
}

export function isTokenAndIsValid() {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const isValid = decoded.exp && Date.now() / 1000 < decoded.exp;

    if (!isValid) {
      removeAuthToken();
      return false;
    }

    return true;
  } catch {
    removeAuthToken();
    return false;
  }
}
