"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { supabase } from "@/lib/supabaseClient";

type AppraisalData = {
  appraisalTitle?: string;
  streetAddress?: string;
  suburb?: string;
  postcode?: string;
  state?: string;
};

type Appraisal = {
  id: number;
  title: string | null;
  address: string | null;
  suburb: string | null;
  postcode: string | null;
  state: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  data?: AppraisalData | null;
};

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function AppraisalsIndexPage() {
  const router = useRouter();

  // 🔐 Require login
  const { user, checking } = useRequireAuth();

  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "DRAFT" | "COMPLETED"
  >("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔚 Sign out handler
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/appraisals");
        if (!res.ok) {
          const text = await res.text();
          console.error("Error loading appraisals:", text);
          setError("Failed to load appraisals");
          setLoading(false);
          return;
        }

        const data: Appraisal[] = await res.json();

        const sorted = [...data].sort((a, b) => {
          const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
          const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
          return bTime - aTime;
        });

        setAppraisals(sorted);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load appraisals");
        setLoading(false);
      }
    };

    load();
  }, []);

  // While checking auth, show a small spinner/message
  if (checking) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-6">
        <p className="text-sm text-slate-600">Checking session…</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-6">
        <p className="text-sm text-slate-600">Loading appraisals…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </main>
    );
  }

  // Filter + search
  const visibleAppraisals = appraisals
    .filter((a) => (statusFilter === "ALL" ? true : a.status === statusFilter))
    .filter((a) => {
      if (!search.trim()) return true;
      const haystack = [
        a.title,
        a.data?.appraisalTitle,
        a.address,
        a.suburb,
        a.postcode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(search.toLowerCase());
    });

  return (
    <main className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Appraisals</h1>
          <p className="text-sm text-slate-500">
            View, edit and continue recent appraisal records.
          </p>
          {user && (
            <p className="mt-1 text-xs text-slate-400">
              Signed in as <span className="font-medium">{user.email}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search address, title, suburb…"
            className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />

          {/* Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="ALL">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* New button */}
          <Link
            href="/appraisals/new"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            + New appraisal
          </Link>

          {/* Sign out */}
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </div>

      {visibleAppraisals.length === 0 ? (
        <p className="text-sm text-slate-500">
          No appraisals yet. Click &ldquo;New appraisal&rdquo; to create your
          first one.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleAppraisals.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 align-top font-medium text-slate-900">
                    {a.title || a.data?.appraisalTitle || `Appraisal #${a.id}`}
                  </td>

                  <td className="px-4 py-3 align-top text-slate-700">
                    {a.address
                      ? `${a.address}${
                          a.suburb
                            ? `, ${a.suburb} ${a.postcode ?? ""} ${
                                a.state ?? ""
                              }`
                            : ""
                        }`
                      : a.suburb
                      ? `${a.suburb} ${a.postcode ?? ""} ${a.state ?? ""}`
                      : "—"}
                  </td>

                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.status === "COMPLETED"
                          ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                          : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 align-top text-xs text-slate-600">
                    {formatDate(a.updatedAt ?? a.createdAt)}
                  </td>

                  <td className="px-4 py-3 align-top text-right">
                    <Link
                      href={`/appraisals/${a.id}/edit`}
                      className="text-xs font-medium text-slate-700 hover:underline"
                    >
                      Edit / continue
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
