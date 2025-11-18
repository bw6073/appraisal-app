"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "DRAFT" | "COMPLETED"
  >("ALL");
  const [search, setSearch] = useState("");

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

  const visibleAppraisals = useMemo(() => {
    let list =
      statusFilter === "ALL"
        ? appraisals
        : appraisals.filter((a) => a.status === statusFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => {
        const title = a.title || a.data?.appraisalTitle || `Appraisal #${a.id}`;
        const addr =
          a.address ||
          a.data?.streetAddress ||
          "" +
            (a.suburb || a.data?.suburb || "") +
            (a.postcode || a.data?.postcode || "") +
            (a.state || a.data?.state || "");

        return (
          title.toLowerCase().includes(q) ||
          addr.toLowerCase().includes(q) ||
          String(a.id).includes(q)
        );
      });
    }

    return list;
  }, [appraisals, statusFilter, search]);

  if (loading) {
    return (
      <div>
        <p className="text-sm text-slate-600">Loading appraisals…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header row – stacks on mobile */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Appraisals
          </h1>
          <p className="text-sm text-slate-500">
            View, edit and continue recent appraisal records.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by address, title, suburb…"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-56"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:w-auto"
          >
            <option value="ALL">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <Link
            href="/appraisals/new"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            + New appraisal
          </Link>
        </div>
      </div>

      {visibleAppraisals.length === 0 ? (
        <p className="text-sm text-slate-500">
          No appraisals found. Adjust filters or create a new appraisal.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
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
                    {a.address || a.data?.streetAddress
                      ? `${a.address || a.data?.streetAddress}${
                          a.suburb || a.data?.suburb
                            ? `, ${a.suburb || a.data?.suburb} ${
                                a.postcode || a.data?.postcode || ""
                              } ${a.state || a.data?.state || ""}`
                            : ""
                        }`
                      : a.suburb || a.data?.suburb
                      ? `${a.suburb || a.data?.suburb} ${
                          a.postcode || a.data?.postcode || ""
                        } ${a.state || a.data?.state || ""}`
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
    </div>
  );
}
