"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createAppointment, getAvailableSlots, Professional } from "@/lib/api";
import { useAppSelector } from "@/lib/store/store";

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getWeekRange(date: Date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay() + 1); // Monday
  const end = new Date(start);
  end.setDate(end.getDate() + 6); // Sunday
  return { start, end };
}

function formatDateRange(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startStr = start.toLocaleDateString("en-US", opts);
  const endStr = end.toLocaleDateString("en-US", {
    ...opts,
    year: "numeric",
  });
  return `${startStr} - ${endStr}`;
}

function toISODate(date: Date) {
  return date.toISOString().split("T")[0];
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDayHeader(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface ProfessionalModalProps {
  professional: Professional;
  onClose: () => void;
}

export default function ProfessionalModal({
  professional,
  onClose,
}: ProfessionalModalProps) {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [weekOffset, setWeekOffset] = useState(0);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [pendingSlot, setPendingSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const today = new Date();
  const offsetDate = new Date(today);
  offsetDate.setDate(offsetDate.getDate() + weekOffset * 7);
  const { start, end } = getWeekRange(offsetDate);
  const weekStartISO = toISODate(start);

  useEffect(() => {
    setSlotsLoading(true);
    getAvailableSlots(professional.id, weekStartISO)
      .then((data) => setSlots(data.slots))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [professional.id, weekStartISO]);

  const slotsByDay = useMemo(() => {
    const grouped = new Map<string, string[]>();
    for (const slot of slots) {
      const dayKey = slot.split("T")[0];
      const existing = grouped.get(dayKey) || [];
      existing.push(slot);
      grouped.set(dayKey, existing);
    }
    return grouped;
  }, [slots]);

  const handleSlotClick = (slot: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    setBookingError(null);
    setPendingSlot(slot);
  };

  const cancelBooking = () => {
    setPendingSlot(null);
  };

  const confirmBooking = async () => {
    if (!pendingSlot) return;

    const slot = pendingSlot;
    setPendingSlot(null);
    setBooking(slot);
    setBookingError(null);

    try {
      await createAppointment(professional.id, slot);
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 3000);
      const data = await getAvailableSlots(professional.id, weekStartISO);
      setSlots(data.slots);
    } catch (err) {
      setBookingError(
        err instanceof Error ? err.message : "Failed to book appointment",
      );
    } finally {
      setBooking(null);
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-zinc-900">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Professional info */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-50 text-base font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
              {getInitials(professional.firstName, professional.lastName)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {professional.firstName} {professional.lastName}
              </h2>
              <div className="mt-1 flex items-center gap-3 text-sm text-zinc-500">
                <span className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  {Number(professional.price).toFixed(0)}/session
                </span>
                {/* <span className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  {professional.timezone}
                </span> */}
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {professional.bio}
          </p>

          {professional.themes.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {professional.themes.map((theme) => (
                <span
                  key={theme.id}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                >
                  {theme.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Schedule section */}
        <div className="border-t border-zinc-200 p-6 dark:border-zinc-800">
          {/* Week navigator */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              disabled={weekOffset <= 0}
              className="flex items-center gap-1 rounded-full border border-zinc-200 px-4 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Previous
            </button>

            <div className="text-center">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {formatDateRange(start, end)}
              </p>
              <p className="text-xs text-zinc-500">
                {slotsLoading
                  ? "Loading..."
                  : `${slots.length} slots available`}
              </p>
            </div>

            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="flex items-center gap-1 rounded-full border border-zinc-200 px-4 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Next
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Feedback messages */}
          {bookingSuccess && (
            <div className="mt-4 rounded-lg bg-teal-50 p-3 text-sm text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
              Appointment booked successfully!
            </div>
          )}
          {bookingError && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {bookingError}
            </div>
          )}

          {/* Slots content */}
          {slotsLoading ? (
            <div className="mt-6 flex items-center justify-center py-8">
              <p className="text-sm text-zinc-500">Loading availability...</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-700">
              <p className="text-sm text-zinc-500">
                No available appointments this week.
              </p>
              <button
                onClick={() => setWeekOffset((w) => w + 1)}
                className="mt-1 text-sm font-medium text-teal-600 transition-colors hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
              >
                Check next week
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {Array.from(slotsByDay.entries()).map(([day, daySlots]) => (
                <div key={day}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {formatDayHeader(daySlots[0])}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => handleSlotClick(slot)}
                        disabled={booking !== null}
                        className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-700 transition-colors hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-teal-500 dark:hover:bg-teal-900/30 dark:hover:text-teal-400"
                      >
                        {booking === slot ? "Booking..." : formatTime(slot)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation modal */}
      {pendingSlot && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Confirm appointment
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Book an appointment with{" "}
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {professional.firstName} {professional.lastName}
              </span>{" "}
              on{" "}
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {formatDayHeader(pendingSlot)} at {formatTime(pendingSlot)}
              </span>
              ?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={cancelBooking}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
