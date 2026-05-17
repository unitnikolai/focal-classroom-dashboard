"use client";

const COGNITO_DOMAIN = "focal-auth-portal.auth.us-east-2.amazoncognito.com";
const CLIENT_ID = "2qnnauihtehjeifiif9a1qqjmn";
const CALLBACK_URL = "https://dashboard.focaltech.site/api/auth/callback";
const LOGOUT_URI = "https://dashboard.focaltech.site/signin";


export async function signOut() {
  try {
    const response = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    if (!response.ok) {
      console.error("Logout request failed:", response.status);
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
  
  window.location.href = "/signin";
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
