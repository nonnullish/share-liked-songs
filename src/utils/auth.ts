import { toast } from "sonner";
import { config, endpoints } from "../config";
import { api } from "./utils";

export const currentToken = {
  get access_token() {
    return localStorage.getItem("access_token") || null;
  },
  get refresh_token() {
    return localStorage.getItem("refresh_token") || null;
  },
  get expires_in() {
    return localStorage.getItem("refresh_in") || null;
  },
  get expires() {
    return localStorage.getItem("refresh") || null;
  },

  save: (response: Record<string, any>) => {
    if (response.error) {
      return;
    }

    const { access_token, refresh_token, expires_in } = response;

    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    localStorage.setItem("expires_in", expires_in);

    const now = new Date();
    const expires = new Date(now.getTime() + (expires_in * 1000)).toISOString();
    localStorage.setItem('expires', expires);
  },
};

export const getAuthURL = async () => {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = crypto.getRandomValues(new Uint8Array(64));
  const code_verifier = randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");
  const data = new TextEncoder().encode(code_verifier);
  const hashed = await crypto.subtle.digest("SHA-256", data);

  const code_challenge = btoa(String.fromCharCode(...new Uint8Array(hashed)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  window.localStorage.setItem("code_verifier", code_verifier);

  const { client_id, scope, redirect_uri } = config;
  const authUrl = new URL(endpoints.auth);

  const params = {
    response_type: "code",
    client_id,
    scope,
    code_challenge_method: "S256",
    code_challenge,
    redirect_uri,
  };

  authUrl.search = new URLSearchParams(params).toString();
  return authUrl.toString();
};

export const getToken = async (code: string) => {
  const code_verifier = localStorage.getItem("code_verifier") || '';
  const { client_id, redirect_uri } = config;
  const endpoint = endpoints.token;
  const headers = { "Content-Type": "application/x-www-form-urlencoded" };
  const body = {
    client_id,
    grant_type: "authorization_code",
    code,
    redirect_uri,
    code_verifier,
  };

  return await api({
    headers,
    method: "POST", 
    endpoint,
    body: new URLSearchParams(body).toString(),
    onError: () => toast.error("Error: Couldn't get the token")
  });
};

export const refreshToken = async () => {
  const { client_id } = config;
  const endpoint = endpoints.token;
  const headers = { "Content-Type": "application/x-www-form-urlencoded" };
  const body = {
    client_id,
    grant_type: "refresh_token",
    refresh_token: currentToken.refresh_token || '',
  };

  return await api({
    headers,
    method: "POST",
    endpoint, 
    body: new URLSearchParams(body).toString(),
    onError: () => toast.error("Error: Couldn't refresh the token")
  });
};

export const redirectToAuth = async () => {
  const url = await getAuthURL();
  window.location.href = url;
};