"use client";

import React, { useEffect, useState, use } from "react";
import AppraisalForm, {
  FormState,
  EMPTY_FORM,
} from "@/components/AppraisalForm";

type Props = {
  // ✅ params is a Promise in Next 16
  params: Promise<{ id: string }>;
};

type AppraisalRecord = {
  id: number;
  title: string | null;
  address: string | null;
  suburb: string | null;
  postcode: string | null;
  state: string | null;
  status: string;
  data: any;
  createdAt?: string;
  updatedAt?: string;
};

export default function EditAppraisalPage({ params }: Props) {
  // ✅ Unwrap the Promise from Next
  const { id } = use(params);
  const numericId = Number(id);

  const [loading, setLoading] = useState(true);
  const [initialForm, setInitialForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(numericId) || numericId <= 0) {
      setError("Invalid appraisal id.");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`/api/appraisals/${numericId}`);
        if (!res.ok) {
          const text = await res.text();
          console.error("Error response:", text);
          setError("Failed to load appraisal.");
          setLoading(false);
          return;
        }

        const record: AppraisalRecord = await res.json();

        const raw = record.data ?? {};
        const formSource =
          raw && typeof raw === "object" && "data" in raw && (raw as any).data
            ? (raw as any).data
            : raw;

        const merged: FormState = {
          ...EMPTY_FORM,
          ...(formSource as Partial<FormState>),
          appraisalTitle:
            (formSource as any)?.appraisalTitle ?? record.title ?? "",
          streetAddress:
            (formSource as any)?.streetAddress ?? record.address ?? "",
          suburb: (formSource as any)?.suburb ?? record.suburb ?? "",
          postcode: (formSource as any)?.postcode ?? record.postcode ?? "",
          state: (formSource as any)?.state ?? record.state ?? "WA",
        };

        setInitialForm(merged);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load appraisal.");
        setLoading(false);
      }
    };

    load();
  }, [numericId]);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-6">
        <p className="text-sm text-red-600">Invalid appraisal id.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-6">
        <p className="text-sm text-slate-600">Loading appraisal…</p>
      </main>
    );
  }

  if (error || !initialForm) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-6">
        <p className="text-sm text-red-600">
          {error || "Could not load appraisal."}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-6">
      <AppraisalForm
        mode="edit"
        appraisalId={numericId}
        initialForm={initialForm}
      />
    </main>
  );
}
