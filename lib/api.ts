const API_BASE = "http://localhost:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data as T;
}

export function registerUser(body: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function loginUser(body: { email: string; password: string }) {
  return request<{ message: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function logoutUser() {
  return request<{ message: string }>("/auth/logout", { method: "POST" });
}
