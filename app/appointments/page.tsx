"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "@/lib/store/store";
import { Appointment, getMyAppointments } from "@/lib/api";

const statusColors: Record<string, string> = {
  CONFIRMED:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  PENDING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  COMPLETED:
    "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300",
};

function formatDateTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AppointmentsPage() {
  const { user, status: authStatus } = useAppSelector((state) => state.auth);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAppointments = useCallback(
    (p: number) => {
      if (!user) return;
      setLoading(true);
      getMyAppointments(p)
        .then((res) => {
          setAppointments(res.data);
          setTotalPages(res.meta.totalPages);
          setPage(res.meta.page);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    },
    [user],
  );

  useEffect(() => {
    fetchAppointments(1);
  }, [fetchAppointments]);

  if (authStatus === "loading" || authStatus === "idle" || loading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <p className="text-zinc-500">Loading appointments...</p>
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
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            My Appointments
          </h1>
          <p className="mt-2 text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
            View your upcoming and past appointments.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {appointments.length === 0 ? (
          <p className="py-12 text-center text-zinc-500">
            You have no appointments yet.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {appt.professionalFirstName}{" "}
                        {appt.professionalLastName}
                      </h2>
                      <p className="mt-1 text-sm text-zinc-500">
                        {formatDateTime(appt.startAt)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[appt.status] || "bg-zinc-100 text-zinc-800"}`}
                    >
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  onClick={() => fetchAppointments(page - 1)}
                  disabled={page <= 1}
                  className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Previous
                </button>
                <span className="text-sm text-zinc-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => fetchAppointments(page + 1)}
                  disabled={page >= totalPages}
                  className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
