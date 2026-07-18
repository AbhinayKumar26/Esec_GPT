


const API_BASE = import.meta.env.VITE_API_BASE || "https://esecgpt-backend.onrender.com";

export async function apiFetch(path, options = {}) {
  const { token, headers, ...rest } = options;

  // 1. Clean up paths so we don't accidentally smash URLs together or double-slash them
  const cleanBase = API_BASE.replace(/\/$/, "");             // Removes trailing slash if present
  const cleanPath = path.startsWith("/") ? path : `/${path}`; // Ensures path starts with a /

  // 2. Use the cleaned paths here
  console.log("===== API REQUEST =====");
  console.log("URL:", `${cleanBase}${cleanPath}`);
  console.log("TOKEN:", token);
  console.log("METHOD:", rest.method);
  const res = await fetch(`${cleanBase}${cleanPath}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      (data && data.error) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}