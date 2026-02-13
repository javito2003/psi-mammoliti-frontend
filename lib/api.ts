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

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export function getMe() {
  return request<User>("/users/me", { method: "GET" });
}

export interface Theme {
  id: string;
  name: string;
  slug: string;
}

export interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  bio: string;
  price: number;
  timezone: string;
  themes: Theme[];
}

export function getProfessionals() {
  return request<Professional[]>("/professionals", { method: "GET" });
}

export function getAvailableSlots(
  professionalId: string,
  weekStart?: string,
) {
  const params = weekStart ? `?weekStart=${weekStart}` : "";
  return request<{ slots: string[] }>(
    `/professionals/${professionalId}/appointments/availability${params}`,
  );
}

export function createAppointment(professionalId: string, startAt: string) {
  return request<{ id: string }>(
    `/professionals/${professionalId}/appointments`,
    {
      method: "POST",
      body: JSON.stringify({ startAt }),
    },
  );
}

export interface Appointment {
  id: string;
  professionalId: string;
  professionalFirstName: string;
  professionalLastName: string;
  startAt: string;
  endAt: string;
  status: string;
  createdAt: string;
}

export function getMyAppointments() {
  return request<Appointment[]>("/appointments");
}
