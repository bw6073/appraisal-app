import React from "react";
import { prisma } from "@/lib/prisma";
import AppraisalForm, {
  FormState,
  EMPTY_FORM,
} from "@/components/AppraisalForm";

// In Next 16, params is a Promise in server components
type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditAppraisalPage({ params }: Props) {
  // ✅ Await the params Promise
  const { id: idStr } = await params;
  const id = Number(idStr);

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <div className="p-6 text-sm text-red-600">Invalid appraisal id.</div>
    );
  }

  // Load the appraisal directly with Prisma (no client-side fetch)
  let appraisal;
  try {
    appraisal = await prisma.appraisal.findUnique({
      where: { id },
    });
  } catch (err) {
    console.error("Error loading appraisal", err);
    return (
      <div className="p-6 text-sm text-red-600">Failed to load appraisal.</div>
    );
  }

  if (!appraisal) {
    return <div className="p-6 text-sm text-red-600">Appraisal not found.</div>;
  }

  // Build the initial form state from the DB record
  let initialForm: FormState;

  if (appraisal.data && typeof appraisal.data === "object") {
    // Full JSON blob already saved
    initialForm = { ...EMPTY_FORM, ...(appraisal.data as any) };
  } else {
    // Fallback: hydrate from top-level columns only
    initialForm = {
      ...EMPTY_FORM,
      appraisalTitle: appraisal.title ?? "",
      streetAddress: appraisal.address ?? "",
      suburb: appraisal.suburb ?? "",
      postcode: appraisal.postcode ?? "",
      state: appraisal.state ?? "WA",
    };
  }

  return (
    <AppraisalForm mode="edit" appraisalId={id} initialForm={initialForm} />
  );
}
