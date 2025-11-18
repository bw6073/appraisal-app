// src/app/login/LoginForm.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  // Optional: read ?error= from URL if you ever set it
  const urlError = searchParams.get("error");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (password === "1234") {
      // Simple cookie-based gate for now
      document.cookie = `appraisal_auth=ok; path=/; max-age=${
        60 * 60 * 24 * 7
      }`;

      const redirectTo = searchParams.get("redirectTo") || "/appraisals";
      router.push(redirectTo);
    } else {
      setLocalError("Incorrect password. Try again.");
    }
  };

  const errorMessage = localError || urlError;

  return (
    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
      <h1 className="mb-2 text-xl font-semibold text-slate-900">
        Appraisal App
      </h1>
      <p className="mb-4 text-sm text-slate-500">
        Enter your access PIN to continue.
      </p>

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium text-slate-700"
          >
            Access PIN
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            (Currently set to <code>1234</code> for testing.)
          </p>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Sign in
        </button>
      </form>

      <p className="mt-4 text-[11px] text-slate-400">
        This simple PIN gate will later be replaced with Supabase Auth.
      </p>
    </div>
  );
}
