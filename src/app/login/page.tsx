"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/appraisals";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        let msg = "Login failed";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {
          // ignore JSON error
        }
        setError(msg);
        setLoading(false);
        return;
      }

      // Success → send to previous page or /appraisals
      router.push(from);
    } catch (err) {
      console.error(err);
      setError("Something went wrong logging in.");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
            B
          </div>
          <h1 className="text-lg font-semibold text-slate-900">
            Appraisal app sign-in
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Enter your access code to view and edit appraisals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Access code
            </label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="••••••••"
              autoFocus
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || !code}
            className="mt-2 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Internal use only – Move with Brent appraisal capture.
        </p>
      </div>
    </main>
  );
}
