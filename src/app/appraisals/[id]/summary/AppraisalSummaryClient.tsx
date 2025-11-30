"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { FormState } from "@/components/AppraisalForm";
import { EMPTY_FORM } from "@/components/AppraisalForm";

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

type Props = {
  id: number;
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

export default function AppraisalSummaryClient({ id }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<AppraisalRecord | null>(null);
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) {
      setError("Invalid appraisal id.");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`/api/appraisals/${id}`);
        if (!res.ok) {
          const text = await res.text();
          console.error("Error loading appraisal for summary:", text);
          setError("Failed to load appraisal.");
          setLoading(false);
          return;
        }

        const data: AppraisalRecord = await res.json();
        setRecord(data);

        // Handle older rows where data might be nested as data.data
        const raw = data.data ?? {};
        const formSource =
          raw && typeof raw === "object" && "data" in raw && (raw as any).data
            ? (raw as any).data
            : raw;

        const merged: FormState = {
          ...EMPTY_FORM,
          ...(formSource as Partial<FormState>),
        };

        setForm(merged);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load appraisal.");
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-8">
        <p className="text-sm text-red-600">Invalid appraisal id.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-8">
        <p className="text-sm text-slate-600">Loading appraisal summary…</p>
      </main>
    );
  }

  if (error || !record || !form) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-8">
        <p className="text-sm text-red-600">
          {error || "Could not load appraisal."}
        </p>
      </main>
    );
  }

  // Extract some commonly-used fields
  const {
    appraisalTitle,
    streetAddress,
    suburb,
    postcode,
    state,
    appraisalDate,
    ownerNames,
    ownerPhonePrimary,
    ownerPhoneSecondary,
    ownerEmail,
    propertyType,
    bedrooms,
    bathrooms,
    wcs,
    carSpaces,
    landArea,
    landAreaUnit,
    primaryReason,
    motivationDetail,
    idealTimeframe,
    datesToAvoid,
    suggestedRangeMin,
    suggestedRangeMax,
    pricingStrategy,
    hasPriceExpectation,
    expectationMin,
    expectationMax,
    expectationSource,
    nonPriceGoals,
    mustDoPrep,
    niceToHavePrep,
    followUpActions,
    followUpDate,
    occupancyType,
    tenantName,
    currentRent,
    rentFrequency,
    leaseExpiry,
  } = form;

  const goals = nonPriceGoals ?? {
    bestPrice: 3,
    speed: 3,
    minimalDisruption: 3,
    privacy: 3,
    longSettlement: 3,
  };

  const fullAddress =
    streetAddress || record.address
      ? `${streetAddress || record.address}${
          suburb || record.suburb
            ? `, ${suburb || record.suburb} ${
                postcode || record.postcode || ""
              } ${state || record.state || ""}`
            : ""
        }`
      : suburb || record.suburb
      ? `${suburb || record.suburb} ${postcode || record.postcode || ""} ${
          state || record.state || ""
        }`
      : "—";

  return (
    <main className="print-container mx-auto max-w-4xl px-6 py-8">
      {/* Top header (with print & back – hidden in PDF) */}
      <div className="mb-4 flex items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Appraisal summary
          </h1>
          <p className="text-sm text-slate-500">
            Internal appraisal snapshot for{" "}
            <span className="font-medium text-slate-800">
              {appraisalTitle || streetAddress || `Appraisal #${record.id}`}
            </span>
            .
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Print / Save as PDF
          </button>
          <Link
            href={`/appraisals/${record.id}/edit`}
            className="text-xs text-slate-600 hover:underline"
          >
            ← Back to appraisal
          </Link>
        </div>
      </div>

      {/* Branded header band – this WILL print */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 print-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              MOVE WITH BRENT · APPRAISAL REPORT
            </div>
            <div className="mt-1 text-sm text-slate-800 font-medium">
              {fullAddress}
            </div>
            <div className="mt-1 text-xs text-slate-600">
              Appraisal date:{" "}
              <span className="font-medium">
                {appraisalDate ? formatDate(appraisalDate) : "—"}
              </span>
            </div>
          </div>

          <div className="text-right text-xs text-slate-600">
            <div className="font-semibold text-slate-800">Brent Falkingham</div>
            <div>Brookwood Realty</div>
            <div>Phone: 0407 564 677</div>
            <div>Email: brent@brookwoodrealty.com.au</div>
          </div>
        </div>
      </div>

      {/* Main content card */}
      <div className="print-card rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* PROPERTY SNAPSHOT */}
        <section className="mb-6 border-b border-slate-100 pb-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Property snapshot
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <dl className="space-y-1 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Address
                  </dt>
                  <dd className="text-slate-800">{fullAddress}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Property type
                  </dt>
                  <dd className="text-slate-800">{propertyType || "—"}</dd>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">
                      Beds
                    </dt>
                    <dd className="text-slate-800">{bedrooms || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">
                      Baths
                    </dt>
                    <dd className="text-slate-800">{bathrooms || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">
                      WCs
                    </dt>
                    <dd className="text-slate-800">{wcs || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">
                      Parking
                    </dt>
                    <dd className="text-slate-800">{carSpaces || "—"}</dd>
                  </div>
                </div>
              </dl>
            </div>

            <div>
              <dl className="space-y-1 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Land area
                  </dt>
                  <dd className="text-slate-800">
                    {landArea
                      ? `${landArea} ${
                          landAreaUnit === "sqm" ? "m²" : landAreaUnit
                        }`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Status
                  </dt>
                  <dd className="text-slate-800">{record.status || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Last updated
                  </dt>
                  <dd className="text-slate-800">
                    {formatDate(record.updatedAt ?? record.createdAt)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* OWNER & OCCUPANCY */}
        <section className="mb-6 border-b border-slate-100 pb-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Owner & occupancy
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <dl className="space-y-1">
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Owner(s)
                  </dt>
                  <dd className="text-slate-800">{ownerNames || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Phone
                  </dt>
                  <dd className="text-slate-800">
                    {ownerPhonePrimary || "—"}
                    {ownerPhoneSecondary ? ` / ${ownerPhoneSecondary}` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Email
                  </dt>
                  <dd className="text-slate-800">{ownerEmail || "—"}</dd>
                </div>
              </dl>
            </div>

            <div>
              <dl className="space-y-1">
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Occupancy
                  </dt>
                  <dd className="text-slate-800">
                    {occupancyType === "TENANT"
                      ? "Tenanted"
                      : occupancyType === "VACANT"
                      ? "Vacant"
                      : occupancyType === "HOLIDAY"
                      ? "Holiday home"
                      : "Owner occupied"}
                  </dd>
                </div>

                {occupancyType === "TENANT" && (
                  <>
                    <div>
                      <dt className="text-xs font-semibold uppercase text-slate-500">
                        Tenant
                      </dt>
                      <dd className="text-slate-800">{tenantName || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase text-slate-500">
                        Rent & lease
                      </dt>
                      <dd className="text-slate-800">
                        {currentRent
                          ? `${currentRent} ${
                              rentFrequency === "pm" ? "per month" : "per week"
                            }`
                          : "—"}
                        {leaseExpiry && (
                          <> · Lease to {formatDate(leaseExpiry)}</>
                        )}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>
        </section>

        {/* MOTIVATION & TIMING */}
        <section className="mb-6 border-b border-slate-100 pb-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Motivation & timing
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <dl className="space-y-1">
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Primary reason for moving
                  </dt>
                  <dd className="text-slate-800">{primaryReason || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Ideal timeframe
                  </dt>
                  <dd className="text-slate-800">{idealTimeframe || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Dates to avoid
                  </dt>
                  <dd className="text-slate-800">{datesToAvoid || "—"}</dd>
                </div>
              </dl>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">
                Notes about their situation
              </dt>
              <dd className="mt-1 whitespace-pre-line text-slate-800">
                {motivationDetail || "—"}
              </dd>
            </div>
          </div>
        </section>

        {/* PRICING SNAPSHOT */}
        <section className="mb-6 border-b border-slate-100 pb-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Pricing snapshot
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <dl className="space-y-1">
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Suggested price range
                  </dt>
                  <dd className="text-slate-800">
                    {suggestedRangeMin || suggestedRangeMax
                      ? `${suggestedRangeMin || "?"} – ${
                          suggestedRangeMax || "?"
                        }`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Pricing strategy
                  </dt>
                  <dd className="text-slate-800">{pricingStrategy || "—"}</dd>
                </div>
              </dl>
            </div>

            <div>
              <dl className="space-y-1">
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Vendor price expectations
                  </dt>
                  <dd className="text-slate-800">
                    {hasPriceExpectation
                      ? `${expectationMin || "?"} – ${expectationMax || "?"}`
                      : "Not specifically stated"}
                  </dd>
                </div>
                {hasPriceExpectation && (
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">
                      Expectation source
                    </dt>
                    <dd className="text-slate-800">
                      {expectationSource || "—"}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </section>

        {/* NON PRICE GOALS */}
        <section className="mb-6 border-b border-slate-100 pb-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Non-price goals (1–5)
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Best possible price</span>
                <span className="font-mono">{goals.bestPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Speed of sale</span>
                <span className="font-mono">{goals.speed}</span>
              </div>
              <div className="flex justify-between">
                <span>Minimal disruption</span>
                <span className="font-mono">{goals.minimalDisruption}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Privacy / low profile</span>
                <span className="font-mono">{goals.privacy}</span>
              </div>
              <div className="flex justify-between">
                <span>Long settlement / rent-back</span>
                <span className="font-mono">{goals.longSettlement}</span>
              </div>
            </div>
          </div>
        </section>

        {/* NEXT STEPS / PREP */}
        <section className="text-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Preparation & next steps
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">
                Must do before photography / launch
              </dt>
              <dd className="mt-1 whitespace-pre-line text-slate-800">
                {mustDoPrep || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">
                Nice to have if possible
              </dt>
              <dd className="mt-1 whitespace-pre-line text-slate-800">
                {niceToHavePrep || "—"}
              </dd>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">
                Follow-up date
              </dt>
              <dd className="mt-1 text-slate-800">
                {followUpDate ? formatDate(followUpDate) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-500">
                Next steps & reminders
              </dt>
              <dd className="mt-1 whitespace-pre-line text-slate-800">
                {followUpActions || "—"}
              </dd>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
