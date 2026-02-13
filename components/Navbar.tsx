"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { fetchMeThunk, logoutThunk } from "@/lib/store/authSlice";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, status } = useAppSelector((state) => state.auth);
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    dispatch(fetchMeThunk());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      wasAuthenticated.current = true;
    } else if (wasAuthenticated.current) {
      wasAuthenticated.current = false;
      router.replace("/login");
    }
  }, [user, router]);

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
        >
          PSI Mammoliti
        </Link>

        {status !== "idle" && status !== "loading" && (
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/appointments"
                  className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                >
                  My Appointments
                </Link>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {user.firstName} {user.lastName}
                </span>
                <button
                  onClick={() => dispatch(logoutThunk())}
                  className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
