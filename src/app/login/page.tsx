// src/app/login/page.tsx
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Suspense
        fallback={
          <div className="rounded-lg bg-white px-4 py-3 text-sm text-slate-600 shadow">
            Loading login…
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
