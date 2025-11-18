import Link from "next/link";

type LoginPageProps = {
  searchParams?: { error?: string };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const hasError = searchParams?.error === "1";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-lg font-semibold text-slate-900">
          Appraisal app login
        </h1>
        <p className="mb-4 text-xs text-slate-500">
          Enter the passcode to access your appraisal dashboard.
        </p>

        {/* 🔐 Simple HTML form posting straight to /api/login */}
        <form method="POST" action="/api/login" className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs font-medium text-slate-700"
            >
              Passcode
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            />
          </div>

          {hasError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              Invalid password. Please try again.
            </div>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Unlock
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Move With Brent · Internal use only
        </p>
      </div>
    </main>
  );
}
