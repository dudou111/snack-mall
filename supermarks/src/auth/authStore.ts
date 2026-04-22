import type { AuthPayload, UserInfo } from "../types";

const TOKEN_KEY = "supermarks_token";
const USER_KEY = "supermarks_user";

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function getUser(): UserInfo | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}

export function saveAuth(payload: AuthPayload): void {
  localStorage.setItem(TOKEN_KEY, payload.token);
  localStorage.setItem(USER_KEY, JSON.stringify(payload.userInfo));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
