"use client";

const COGNITO_DOMAIN = "focal-auth-portal.auth.us-east-2.amazoncognito.com";
const CLIENT_ID = "2qnnauihtehjeifiif9a1qqjmn";
const CALLBACK_URL = "https://main.deu6lm3uucumx.amplifyapp.com/api/auth/callback";
const LOGOUT_URI = "https://main.deu6lm3uucumx.amplifyapp.com/signin";


export async function signOut() {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    logout_uri: LOGOUT_URI,
  });
  window.location.href = `https://${COGNITO_DOMAIN}/logout?${params}`;
}

export function isLoggedIn(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("csrfToken=");
}

export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrfToken=([^;]+)/);
  return match?.[1] ?? null;
}

export async function apiFetch(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const csrfToken = getCsrfToken();
  return fetch(input, {
    ...init,
    credentials: "include",
    headers: {
      ...init.headers,
      ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
    },
  });
}
