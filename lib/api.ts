const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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

export function getThemes() {
  return request<Theme[]>("/themes");
}

export function getProfessionals(
  themeSlugs?: string[],
  page = 1,
  limit = 10,
) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (themeSlugs?.length) params.set("themes", themeSlugs.join(","));
  return request<PaginatedResponse<Professional>>(
    `/professionals?${params}`,
  );
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

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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

export function getMyAppointments(page = 1, limit = 10) {
  return request<PaginatedResponse<Appointment>>(
    `/appointments?page=${page}&limit=${limit}`,
  );
}
