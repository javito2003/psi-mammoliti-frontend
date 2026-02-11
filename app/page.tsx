"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { fetchMeThunk, logoutThunk } from "@/lib/store/authSlice";

export default function Home() {
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMeThunk());
  }, [dispatch]);

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {user ? (
          <>
            <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              Welcome back, {user.firstName}
            </h1>
            <p className="mb-6 text-sm text-zinc-500">{user.email}</p>
            <button
              onClick={() => dispatch(logoutThunk())}
              className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              PSI Mammoliti
            </h1>
            <p className="mb-6 text-sm text-zinc-500">
              Log in or create an account to get started.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="block w-full rounded-md bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="block w-full rounded-md border border-zinc-300 px-4 py-2 text-center text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Register
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
