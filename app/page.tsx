"use client";

import { useEffect, useMemo, useState } from "react";
import { getProfessionals, Professional, Theme } from "@/lib/api";
import ProfessionalModal from "@/components/ProfessionalModal";

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function Home() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [selectedPro, setSelectedPro] = useState<string | null>(null);

  useEffect(() => {
    getProfessionals()
      .then(setProfessionals)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const allThemes = useMemo(() => {
    const map = new Map<string, Theme>();
    professionals.forEach((p) => p.themes.forEach((t) => map.set(t.id, t)));
    return Array.from(map.values());
  }, [professionals]);

  const filtered = activeTheme
    ? professionals.filter((p) => p.themes.some((t) => t.id === activeTheme))
    : professionals;

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <p className="text-zinc-500">Loading professionals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 text-balance">
            Find Your Psychologist
          </h1>
          <p className="mt-2 text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
            Browse our network of licensed professionals. Filter by specialty,
            explore profiles, and book an appointment that fits your schedule.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Theme filters */}
        {allThemes.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {allThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() =>
                  setActiveTheme(activeTheme === theme.id ? null : theme.id)
                }
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  activeTheme === theme.id
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {theme.name}
              </button>
            ))}
          </div>
        )}

        {/* Cards */}
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-zinc-500">
            No professionals found.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((pro) => (
              <button
                key={pro.id}
                type="button"
                onClick={() => setSelectedPro(pro.id)}
                className="w-full rounded-lg border border-zinc-200 bg-white p-5 text-left shadow-sm transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {getInitials(pro.firstName, pro.lastName)}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Name + price row */}
                    <div className="flex items-baseline justify-between gap-2">
                      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {pro.firstName} {pro.lastName}
                      </h2>
                      <span className="shrink-0 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        ${Number(pro.price).toFixed(0)}/session
                      </span>
                    </div>

                    {/* Location */}
                    {/* <p className="mt-0.5 text-sm text-zinc-500">
                      {pro.timezone}
                    </p> */}

                    {/* Bio */}
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {pro.bio}
                    </p>

                    {/* Theme tags */}
                    {pro.themes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {pro.themes.map((theme) => (
                          <span
                            key={theme.id}
                            className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          >
                            {theme.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    <p className="mt-3 text-sm font-medium text-zinc-500">
                      Click to view schedule
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedPro &&
        (() => {
          const pro = professionals.find((p) => p.id === selectedPro);
          return pro ? (
            <ProfessionalModal
              professional={pro}
              onClose={() => setSelectedPro(null)}
            />
          ) : null;
        })()}
    </div>
  );
}
