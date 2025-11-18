import { prisma } from "@/lib/prisma";
import Link from "next/link";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AppraisalDetailPage({ params }: Props) {
  // ✅ Unwrap params (Next 16 makes this a Promise)
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-red-600">
        Invalid appraisal id.
      </div>
    );
  }

  // Fetch from Prisma
  const appraisal = await prisma.appraisal.findUnique({
    where: { id: numericId },
  });

  if (!appraisal) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-red-600">
        Appraisal not found.
      </div>
    );
  }

  // data is JSON – could be either { ...form } or { data: { ...form } } for older rows
  const rawData: any = appraisal.data ?? {};
  const form =
    rawData && typeof rawData === "object" && "streetAddress" in rawData
      ? rawData
      : rawData.data && typeof rawData.data === "object"
      ? rawData.data
      : {};

  const title = appraisal.title || form.appraisalTitle || `Appraisal #${id}`;
  const addressLine =
    appraisal.address || form.streetAddress || "(no street address saved yet)";

  const suburbLine = [
    appraisal.suburb || form.suburb,
    appraisal.postcode || form.postcode,
  ]
    .filter(Boolean)
    .join(" ");

  const status = appraisal.status || form.status || "DRAFT";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-600">
              {addressLine}
              {suburbLine ? `, ${suburbLine}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                status === "COMPLETED"
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {status}
            </span>

            <Link
              href={`/appraisals/${id}/edit`}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Edit
            </Link>

            <Link
              href="/appraisals"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
            >
              Back to list
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-6 py-6 space-y-6">
        {/* Property summary */}
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            Property summary
          </h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Street address</dt>
              <dd className="font-medium text-slate-900">
                {form.streetAddress || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Suburb</dt>
              <dd className="font-medium text-slate-900">
                {form.suburb || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Postcode</dt>
              <dd className="font-medium text-slate-900">
                {form.postcode || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">State</dt>
              <dd className="font-medium text-slate-900">
                {form.state || "WA"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Property type</dt>
              <dd className="font-medium text-slate-900">
                {form.propertyType || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Land area</dt>
              <dd className="font-medium text-slate-900">
                {form.landArea
                  ? `${form.landArea} ${form.landAreaUnit || "sqm"}`
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Beds / Baths / WCs</dt>
              <dd className="font-medium text-slate-900">
                {(form.bedrooms || "-") +
                  " bed · " +
                  (form.bathrooms || "-") +
                  " bath · " +
                  (form.wcs || "-") +
                  " WC"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Car spaces</dt>
              <dd className="font-medium text-slate-900">
                {form.carSpaces || "-"}
              </dd>
            </div>
          </dl>
        </section>

        {/* Owner & motivation summary */}
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            Owner & motivation
          </h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Owner(s)</dt>
              <dd className="font-medium text-slate-900">
                {form.ownerNames || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Primary contact</dt>
              <dd className="font-medium text-slate-900">
                {form.ownerPhonePrimary || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Primary reason</dt>
              <dd className="font-medium text-slate-900">
                {form.primaryReason || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Ideal timeframe</dt>
              <dd className="font-medium text-slate-900">
                {form.idealTimeframe || "-"}
              </dd>
            </div>
          </dl>
        </section>

        {/* Pricing snapshot */}
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            Pricing snapshot
          </h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-slate-500">Suggested range</dt>
              <dd className="font-medium text-slate-900">
                {form.suggestedRangeMin || form.suggestedRangeMax
                  ? `${form.suggestedRangeMin || "?"} – ${
                      form.suggestedRangeMax || "?"
                    }`
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Pricing strategy</dt>
              <dd className="font-medium text-slate-900">
                {form.pricingStrategy || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Expectation range</dt>
              <dd className="font-medium text-slate-900">
                {form.expectationMin || form.expectationMax
                  ? `${form.expectationMin || "?"} – ${
                      form.expectationMax || "?"
                    }`
                  : "-"}
              </dd>
            </div>
          </dl>
        </section>

        {/* Debug JSON (optional – handy while you’re building) */}
        <section className="rounded-xl bg-slate-900 p-5 text-xs text-slate-50">
          <div className="mb-2 font-semibold">Raw form data (debug)</div>
          <pre className="overflow-auto">{JSON.stringify(form, null, 2)}</pre>
        </section>
      </main>
    </div>
  );
}
