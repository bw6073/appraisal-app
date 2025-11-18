"use client";

import React, { useState } from "react";
import Link from "next/link";

/* ---------- TYPES ---------- */

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type OccupancyType = "OWNER" | "TENANT" | "VACANT" | "HOLIDAY";

export type Room = {
  id: number;
  label: string;
  type: string;
  lengthMetres?: string;
  widthMetres?: string;
  conditionRating?: string;
  flooring?: string;
  heatingCooling?: string;
  specialFeatures?: string;
};

export type NonPriceGoals = {
  bestPrice: number;
  speed: number;
  minimalDisruption: number;
  privacy: number;
  longSettlement: number;
};

export type FormState = {
  // Step 1 – overview
  appraisalTitle: string;
  streetAddress: string;
  suburb: string;
  postcode: string;
  state: string;
  appraisalDate: string;
  sourceOfEnquiry: string;
  firstContactNotes: string;

  // Step 2 – property basics
  propertyType: string;
  yearBuilt: string;
  construction: string;
  landArea: string;
  landAreaUnit: string;
  zoning: string;
  blockShape: string;
  slope: string;
  outlook: string;
  bedrooms: string;
  bathrooms: string;
  wcs: string;
  carSpaces: string;
  services: string[];
  outdoorFeatures: string[];

  // Step 3 – rooms
  overallCondition: string;
  styleTheme: string;
  rooms: Room[];

  // Step 4 – owner & occupancy
  ownerNames: string;
  ownerPhonePrimary: string;
  ownerPhoneSecondary: string;
  ownerEmail: string;
  postalAddress: string;
  sameAsProperty: boolean;
  occupancyType: OccupancyType;
  tenantName: string;
  leaseExpiry: string;
  currentRent: string;
  rentFrequency: string;
  tenantNotes: string;
  ownerHowLong: string;
  ownerNextMove: string;
  decisionMakers: string;
  decisionNotes: string;

  // Step 5 – motivation & expectations
  primaryReason: string;
  motivationDetail: string;
  idealTimeframe: string;
  datesToAvoid: string;
  hasPriceExpectation: boolean;
  expectationMin: string;
  expectationMax: string;
  expectationSource: string;
  expectationComments: string;
  nonPriceGoals: NonPriceGoals;
  otherGoalNotes: string;

  // Step 6 – pricing & strategy
  suggestedRangeMin: string;
  suggestedRangeMax: string;
  pricingStrategy: string;
  comparablesNotes: string;
  mustDoPrep: string;
  niceToHavePrep: string;
  feesDiscussed: boolean;
  proposedFee: string;
  agreementLikelihood: string;

  // Step 7 – presentation, marketing & follow-up
  presentationScore: string;
  presentationSummary: string;
  targetBuyerProfile: string;
  headlineIdeas: string;
  marketingChannels: string[];
  followUpActions: string;
  followUpDate: string;
};

export const EMPTY_FORM: FormState = {
  appraisalTitle: "",
  streetAddress: "",
  suburb: "",
  postcode: "",
  state: "WA",
  appraisalDate: new Date().toISOString().split("T")[0],
  sourceOfEnquiry: "",
  firstContactNotes: "",

  propertyType: "house",
  yearBuilt: "",
  construction: "",
  landArea: "",
  landAreaUnit: "sqm",
  zoning: "",
  blockShape: "",
  slope: "",
  outlook: "",
  bedrooms: "",
  bathrooms: "",
  wcs: "",
  carSpaces: "",
  services: [],
  outdoorFeatures: [],

  overallCondition: "",
  styleTheme: "",
  rooms: [],

  ownerNames: "",
  ownerPhonePrimary: "",
  ownerPhoneSecondary: "",
  ownerEmail: "",
  postalAddress: "",
  sameAsProperty: false,
  occupancyType: "OWNER",
  tenantName: "",
  leaseExpiry: "",
  currentRent: "",
  rentFrequency: "pw",
  tenantNotes: "",
  ownerHowLong: "",
  ownerNextMove: "",
  decisionMakers: "",
  decisionNotes: "",

  primaryReason: "",
  motivationDetail: "",
  idealTimeframe: "",
  datesToAvoid: "",
  hasPriceExpectation: false,
  expectationMin: "",
  expectationMax: "",
  expectationSource: "",
  expectationComments: "",
  nonPriceGoals: {
    bestPrice: 3,
    speed: 3,
    minimalDisruption: 3,
    privacy: 3,
    longSettlement: 3,
  },
  otherGoalNotes: "",

  suggestedRangeMin: "",
  suggestedRangeMax: "",
  pricingStrategy: "",
  comparablesNotes: "",
  mustDoPrep: "",
  niceToHavePrep: "",
  feesDiscussed: false,
  proposedFee: "",
  agreementLikelihood: "",

  presentationScore: "5",
  presentationSummary: "",
  targetBuyerProfile: "",
  headlineIdeas: "",
  marketingChannels: [],
  followUpActions: "",
  followUpDate: "",
};

const SERVICES = [
  "Scheme water",
  "Bore",
  "Rainwater tank",
  "Septic / Sewer",
  "Mains gas",
  "Bottled gas",
  "NBN",
  "Fixed wireless",
];

const OUTDOOR_FEATURES = [
  "Patio / deck",
  "Alfresco",
  "Pool",
  "Spa",
  "Powered workshop",
  "Shed",
  "Carport",
  "Fencing",
  "Electric gate",
  "Paddocks",
  "Arena / round yard",
  "Reticulation",
];

const MARKETING_CHANNELS = [
  "realestate.com.au",
  "Domain",
  "Social (FB / IG)",
  "Database / buyer match",
  "Signboard only",
  "Letterbox / local area",
];

type AppraisalFormProps = {
  mode: "create" | "edit";
  appraisalId?: number;
  initialForm?: FormState | null;
};

/* ---------- MAIN COMPONENT ---------- */

function AppraisalForm({ mode, appraisalId, initialForm }: AppraisalFormProps) {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(initialForm ?? EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const totalStepsWithoutReview = 7;

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayValue = (key: keyof FormState, value: string) => {
    setForm((prev) => {
      const current = (prev[key] as string[]) || [];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter((v) => v !== value) };
      }
      return { ...prev, [key]: [...current, value] };
    });
  };

  const addRoom = () => {
    setForm((prev) => {
      const currentRooms = prev.rooms ?? [];
      return {
        ...prev,
        rooms: [
          ...currentRooms,
          {
            id: Date.now(),
            label: `Room ${currentRooms.length + 1}`,
            type: "bedroom",
          },
        ],
      };
    });
  };

  const updateRoom = (id: number, key: keyof Room, value: any) => {
    setForm((prev) => {
      const currentRooms = prev.rooms ?? [];
      return {
        ...prev,
        rooms: currentRooms.map((room) =>
          room.id === id ? { ...room, [key]: value } : room
        ),
      };
    });
  };

  const deleteRoom = (id: number) => {
    setForm((prev) => {
      const currentRooms = prev.rooms ?? [];
      return {
        ...prev,
        rooms: currentRooms.filter((room) => room.id !== id),
      };
    });
  };

  const updateNonPriceGoal = (key: keyof NonPriceGoals, value: number) => {
    setForm((prev) => {
      const base: NonPriceGoals = prev.nonPriceGoals ?? {
        bestPrice: 3,
        speed: 3,
        minimalDisruption: 3,
        privacy: 3,
        longSettlement: 3,
      };

      return {
        ...prev,
        nonPriceGoals: {
          ...base,
          [key]: value,
        },
      };
    });
  };

  const goNext = () => {
    setStep((prev) => {
      if (prev >= 8) return prev;
      return (prev + 1) as Step;
    });
  };

  const goBack = () => {
    setStep((prev) => {
      if (prev <= 1) return prev;
      return (prev - 1) as Step;
    });
  };

  const handleSameAsPropertyToggle = (checked: boolean) => {
    if (checked) {
      updateField(
        "postalAddress",
        `${form.streetAddress}, ${form.suburb} ${form.postcode} ${form.state}`
      );
    }
    updateField("sameAsProperty", checked);
  };

  const handleSave = async (finalise: boolean) => {
    setSaving(true);
    try {
      const status = finalise ? "COMPLETED" : "DRAFT";

      const payload = {
        status,
        appraisalTitle: form.appraisalTitle,
        streetAddress: form.streetAddress,
        suburb: form.suburb,
        postcode: form.postcode,
        state: form.state,
        data: form, // full form JSON
      };

      let res: Response;

      if (mode === "create") {
        res = await fetch("/api/appraisals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        if (!appraisalId) {
          throw new Error("Missing appraisalId for edit mode");
        }
        res = await fetch(`/api/appraisals/${appraisalId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const text = await res.text();
        console.error("Save error:", text);
        alert("There was a problem saving the appraisal.");
        return;
      }

      const data = await res.json();

      if (mode === "create" && data.id) {
        // Show message *before* redirecting to edit screen
        alert(
          finalise
            ? "Appraisal created and marked as completed."
            : "Appraisal draft created."
        );
        window.location.href = `/appraisals/${data.id}/edit`;
      } else {
        // Editing existing appraisal
        alert(
          finalise
            ? "Appraisal updated and marked as completed."
            : "Appraisal draft updated."
        );
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    console.log(
      "Delete clicked. appraisalId value:",
      appraisalId,
      "type:",
      typeof appraisalId
    );

    if (!appraisalId || typeof appraisalId !== "number") {
      alert("No valid appraisalId provided to delete.");
      return;
    }

    const url = `/api/appraisals/${appraisalId}`;
    console.log("Calling DELETE", url);

    try {
      const res = await fetch(url, { method: "DELETE" });

      if (!res.ok) {
        const text = await res.text();
        console.error("Delete error response body:", text);
        alert("Failed to delete appraisal.");
        return;
      }

      alert("Appraisal deleted.");
      window.location.href = "/appraisals";
    } catch (err) {
      console.error("Delete exception:", err);
      alert("Something went wrong deleting appraisal.");
    }
  };

  const stepLabel = (s: Step) => {
    if (s === 8) return "Review";
    const labels: Record<number, string> = {
      1: "Appraisal overview",
      2: "Property basics & site",
      3: "Interior rooms",
      4: "Owner & occupancy",
      5: "Motivation & expectations",
      6: "Pricing & strategy",
      7: "Presentation, marketing & follow-up",
    };
    return labels[s as number];
  };

  // RETURN JSX WILL COME IN SECTION 2
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-900 text-center text-sm font-bold text-white leading-8">
              B
            </div>
            <div>
              <div className="text-sm font-semibold">Appraisal Capture</div>
              <div className="text-xs text-slate-500">
                app.sellwithbrent.com.au
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              {mode === "create" ? "New appraisal" : "Editing appraisal"}
            </span>

            {mode === "edit" && appraisalId && (
              <Link
                href={`/appraisals/${appraisalId}/summary`}
                className="rounded-full border border-slate-300 px-3 py-1 font-medium text-slate-700 hover:bg-slate-100"
              >
                View summary
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {mode === "create" ? "New appraisal" : "Edit appraisal"}
            </h1>
            <p className="text-sm text-slate-500">
              Step{" "}
              {step === 8 ? "Review" : `${step} of ${totalStepsWithoutReview}`}{" "}
              · {stepLabel(step)}
            </p>
          </div>
          <div className="hidden text-xs text-slate-500 sm:block">
            Changes are saved back to your database via the API routes.
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6 h-2 w-full rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-slate-900 transition-all"
            style={{
              width:
                step === 8
                  ? "100%"
                  : `${(step / (totalStepsWithoutReview + 1)) * 100}%`,
            }}
          />
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          {/* STEP CONTENT */}
          {step === 1 && (
            <Step1Overview form={form} updateField={updateField} />
          )}

          {step === 2 && (
            <Step2PropertyBasics
              form={form}
              updateField={updateField}
              toggleArrayValue={toggleArrayValue}
            />
          )}

          {step === 3 && (
            <Step3Rooms
              form={form}
              updateField={updateField}
              addRoom={addRoom}
              updateRoom={updateRoom}
              deleteRoom={deleteRoom}
            />
          )}

          {step === 4 && (
            <Step4OwnerOccupancy
              form={form}
              updateField={updateField}
              handleSameAsPropertyToggle={handleSameAsPropertyToggle}
            />
          )}

          {step === 5 && (
            <Step5Motivation
              form={form}
              updateField={updateField}
              updateNonPriceGoal={updateNonPriceGoal}
            />
          )}

          {step === 6 && (
            <Step6PricingStrategy form={form} updateField={updateField} />
          )}

          {step === 7 && (
            <Step7PresentationMarketing
              form={form}
              updateField={updateField}
              toggleArrayValue={toggleArrayValue}
            />
          )}

          {step === 8 && <ReviewScreen form={form} />}
        </div>

        {/* Navigation buttons */}
        <div className="mt-6 border-t pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Back
            </button>

            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              {/* Save draft is always available */}
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
              >
                {saving ? "Saving…" : "Save draft"}
              </button>

              {step < 8 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Next
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleSave(true)}
                    disabled={saving}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    {saving ? "Saving…" : "Save & complete"}
                  </button>

                  {mode === "edit" && appraisalId && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
/* ---------- STEP 1 ---------- */
function Step1Overview({
  form,
  updateField,
}: {
  form: FormState;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Appraisal overview
        </h2>
        <p className="text-sm text-slate-500">
          Start the record with the basics. You can fill in the detail later.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Appraisal title
            </label>
            <input
              type="text"
              value={form.appraisalTitle}
              onChange={(e) => updateField("appraisalTitle", e.target.value)}
              placeholder="11 Maple Crescent Helena Valley – Initial appraisal"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Street address *
              </label>
              <input
                type="text"
                value={form.streetAddress}
                onChange={(e) => updateField("streetAddress", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Suburb *
              </label>
              <input
                type="text"
                value={form.suburb}
                onChange={(e) => updateField("suburb", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Postcode *
                </label>
                <input
                  type="text"
                  value={form.postcode}
                  onChange={(e) => updateField("postcode", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  State
                </label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Appraisal date
              </label>
              <input
                type="date"
                value={form.appraisalDate}
                onChange={(e) => updateField("appraisalDate", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Source of enquiry
              </label>
              <select
                value={form.sourceOfEnquiry}
                onChange={(e) => updateField("sourceOfEnquiry", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Select</option>
                <option value="repeat_client">Repeat client</option>
                <option value="referral">Referral</option>
                <option value="portal">Portal lead</option>
                <option value="website">Website form</option>
                <option value="letterbox">Letterbox / flyer</option>
                <option value="cold_call">Cold call / door knock</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Notes about first contact
            </label>
            <textarea
              value={form.firstContactNotes}
              onChange={(e) => updateField("firstContactNotes", e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- STEP 2 ---------- */
function Step2PropertyBasics({
  form,
  updateField,
  toggleArrayValue,
}: {
  form: FormState;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  toggleArrayValue: (key: keyof FormState, value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Property basics & site
        </h2>
        <p className="text-sm text-slate-500">
          Capture the core specs you&apos;ll use later for marketing and
          pricing.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-slate-700">
              Property type
            </label>
            <select
              value={form.propertyType}
              onChange={(e) => updateField("propertyType", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="house">House</option>
              <option value="unit">Unit / Apartment</option>
              <option value="townhouse">Townhouse</option>
              <option value="villa">Villa</option>
              <option value="rural">Rural / Lifestyle</option>
              <option value="land">Vacant land</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Year built
            </label>
            <input
              type="text"
              value={form.yearBuilt}
              onChange={(e) => updateField("yearBuilt", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Construction
            </label>
            <input
              type="text"
              value={form.construction}
              onChange={(e) => updateField("construction", e.target.value)}
              placeholder="Brick & tile, weatherboard, etc."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Land area
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={form.landArea}
                onChange={(e) => updateField("landArea", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <select
                value={form.landAreaUnit}
                onChange={(e) => updateField("landAreaUnit", e.target.value)}
                className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="sqm">m²</option>
                <option value="ha">ha</option>
                <option value="acres">acres</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Zoning
            </label>
            <input
              type="text"
              value={form.zoning}
              onChange={(e) => updateField("zoning", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Block shape
            </label>
            <select
              value={form.blockShape}
              onChange={(e) => updateField("blockShape", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              <option value="regular">Regular</option>
              <option value="corner">Corner</option>
              <option value="battleaxe">Battle-axe</option>
              <option value="irregular">Irregular</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Slope
            </label>
            <select
              value={form.slope}
              onChange={(e) => updateField("slope", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              <option value="level">Level</option>
              <option value="gentle">Gentle slope</option>
              <option value="steep">Steep</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Outlook / views
            </label>
            <input
              type="text"
              value={form.outlook}
              onChange={(e) => updateField("outlook", e.target.value)}
              placeholder="Valley outlook, treetop views, etc."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Bedrooms
            </label>
            <input
              type="text"
              value={form.bedrooms}
              onChange={(e) => updateField("bedrooms", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Bathrooms
            </label>
            <input
              type="text"
              value={form.bathrooms}
              onChange={(e) => updateField("bathrooms", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              WCs
            </label>
            <input
              type="text"
              value={form.wcs}
              onChange={(e) => updateField("wcs", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Car spaces
            </label>
            <input
              type="text"
              value={form.carSpaces}
              onChange={(e) => updateField("carSpaces", e.target.value)}
              placeholder="e.g. 2 garage + 1 carport"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Services</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {SERVICES.map((service) => (
            <label
              key={service}
              className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={(form.services ?? []).includes(service)}
                onChange={() => toggleArrayValue("services", service)}
              />
              <span>{service}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Outdoor features
        </h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {OUTDOOR_FEATURES.map((feature) => (
            <label
              key={feature}
              className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={(form.outdoorFeatures ?? []).includes(feature)}
                onChange={() => toggleArrayValue("outdoorFeatures", feature)}
              />
              <span>{feature}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------- STEP 3 ---------- */
function Step3Rooms({
  form,
  updateField,
  addRoom,
  updateRoom,
  deleteRoom,
}: {
  form: FormState;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  addRoom: () => void;
  updateRoom: (id: number, key: keyof Room, value: any) => void;
  deleteRoom: (id: number) => void;
}) {
  // ✅ make sure we always have an array
  const rooms = form.rooms ?? [];

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Interior rooms</h2>
        <p className="text-sm text-slate-500">
          Capture condition and features room-by-room.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Overall interior condition
            </label>
            <select
              value={form.overallCondition}
              onChange={(e) => updateField("overallCondition", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              <option value="tired">Tired</option>
              <option value="fair">Fair</option>
              <option value="presentable">Presentable</option>
              <option value="well_maintained">Well maintained</option>
              <option value="renovated">Renovated</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Style / theme
            </label>
            <input
              type="text"
              value={form.styleTheme}
              onChange={(e) => updateField("styleTheme", e.target.value)}
              placeholder="Modern, country, 1970s original..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      {/* ROOMS LIST */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Rooms</h3>
          <button
            type="button"
            onClick={addRoom}
            className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700"
          >
            + Add room
          </button>
        </div>

        {rooms.length === 0 && (
          <p className="text-sm text-slate-500">
            No rooms added yet — start with bedrooms or main living.
          </p>
        )}

        <div className="space-y-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">
                  {room.label || "Room"}
                </span>
                <button
                  type="button"
                  onClick={() => deleteRoom(room.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>

              {/* ROOM BASICS */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Room label
                  </label>
                  <input
                    type="text"
                    value={room.label}
                    onChange={(e) =>
                      updateRoom(room.id, "label", e.target.value)
                    }
                    placeholder="Bedroom 1, Lounge, Family..."
                    className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Type
                  </label>
                  <select
                    value={room.type}
                    onChange={(e) =>
                      updateRoom(room.id, "type", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                  >
                    <option value="bedroom">Bedroom</option>
                    <option value="bathroom">Bathroom</option>
                    <option value="ensuite">Ensuite</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="meals">Meals</option>
                    <option value="family">Family</option>
                    <option value="lounge">Lounge</option>
                    <option value="theatre">Theatre</option>
                    <option value="study">Study</option>
                    <option value="laundry">Laundry</option>
                    <option value="alfresco">Alfresco</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* SIZE */}
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Length (m)
                  </label>
                  <input
                    type="text"
                    value={room.lengthMetres || ""}
                    onChange={(e) =>
                      updateRoom(room.id, "lengthMetres", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Width (m)
                  </label>
                  <input
                    type="text"
                    value={room.widthMetres || ""}
                    onChange={(e) =>
                      updateRoom(room.id, "widthMetres", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Condition (1–5)
                  </label>
                  <input
                    type="text"
                    value={room.conditionRating || ""}
                    onChange={(e) =>
                      updateRoom(room.id, "conditionRating", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                  />
                </div>
              </div>

              {/* FLOORING */}
              <div className="mt-2">
                <label className="block text-xs font-medium text-slate-700">
                  Flooring
                </label>
                <input
                  type="text"
                  value={room.flooring || ""}
                  onChange={(e) =>
                    updateRoom(room.id, "flooring", e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                />
              </div>

              {/* HEATING / COOLING */}
              <div className="mt-2">
                <label className="block text-xs font-medium text-slate-700">
                  Cooling / heating
                </label>
                <input
                  type="text"
                  value={room.heatingCooling || ""}
                  onChange={(e) =>
                    updateRoom(room.id, "heatingCooling", e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                />
              </div>

              {/* SPECIAL FEATURES */}
              <div className="mt-2">
                <label className="block text-xs font-medium text-slate-700">
                  Special features
                </label>
                <textarea
                  value={room.specialFeatures || ""}
                  onChange={(e) =>
                    updateRoom(room.id, "specialFeatures", e.target.value)
                  }
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
/* ---------- STEP 4 (Owner & Occupancy) ---------- */
function Step4OwnerOccupancy({
  form,
  updateField,
  handleSameAsPropertyToggle,
}: {
  form: FormState;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  handleSameAsPropertyToggle: (checked: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Owner & occupancy
        </h2>
        <p className="text-sm text-slate-500">
          Who owns the property and who lives there.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Owner name(s)
            </label>
            <input
              type="text"
              value={form.ownerNames}
              onChange={(e) => updateField("ownerNames", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Primary phone
            </label>
            <input
              type="text"
              value={form.ownerPhonePrimary}
              onChange={(e) => updateField("ownerPhonePrimary", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Secondary phone
            </label>
            <input
              type="text"
              value={form.ownerPhoneSecondary}
              onChange={(e) =>
                updateField("ownerPhoneSecondary", e.target.value)
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={form.ownerEmail}
              onChange={(e) => updateField("ownerEmail", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Postal address
            </label>
            <input
              type="text"
              value={form.postalAddress}
              onChange={(e) => updateField("postalAddress", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />

            <label className="mt-1 flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={form.sameAsProperty}
                onChange={(e) => handleSameAsPropertyToggle(e.target.checked)}
              />
              Same as property address
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Occupancy</h3>

        <div className="flex flex-wrap gap-2 text-sm">
          {[
            { label: "Owner occupied", value: "OWNER" },
            { label: "Tenanted", value: "TENANT" },
            { label: "Vacant", value: "VACANT" },
            { label: "Holiday home", value: "HOLIDAY" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                updateField("occupancyType", opt.value as OccupancyType)
              }
              className={`rounded-full border px-3 py-1 text-xs ${
                form.occupancyType === opt.value
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* TENANTED SECTION */}
        {form.occupancyType === "TENANT" && (
          <div className="mt-3 space-y-3 rounded-lg bg-slate-50 p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Tenant name
                </label>
                <input
                  type="text"
                  value={form.tenantName}
                  onChange={(e) => updateField("tenantName", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Lease expiry
                </label>
                <input
                  type="date"
                  value={form.leaseExpiry}
                  onChange={(e) => updateField("leaseExpiry", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700">
                  Current rent
                </label>
                <input
                  type="text"
                  value={form.currentRent}
                  onChange={(e) => updateField("currentRent", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Frequency
                </label>
                <select
                  value={form.rentFrequency}
                  onChange={(e) => updateField("rentFrequency", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                >
                  <option value="pw">Per week</option>
                  <option value="pm">Per month</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Tenancy notes
              </label>
              <textarea
                value={form.tenantNotes}
                onChange={(e) => updateField("tenantNotes", e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
              />
            </div>
          </div>
        )}

        {/* OWNER OCCUPIED EXTRA QUESTIONS */}
        {form.occupancyType === "OWNER" && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700">
                How long have they lived here?
              </label>
              <input
                type="text"
                value={form.ownerHowLong}
                onChange={(e) => updateField("ownerHowLong", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Where are they moving next?
              </label>
              <input
                type="text"
                value={form.ownerNextMove}
                onChange={(e) => updateField("ownerNextMove", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
              />
            </div>
          </div>
        )}
      </section>

      {/* DECISION MAKERS */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Other decision makers
        </h3>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Decision makers
            </label>
            <input
              type="text"
              value={form.decisionMakers}
              onChange={(e) => updateField("decisionMakers", e.target.value)}
              placeholder="Both owners, executor, family..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Notes about decision process
            </label>
            <textarea
              value={form.decisionNotes}
              onChange={(e) => updateField("decisionNotes", e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- STEP 5 ---------- */
function Step5Motivation({
  form,
  updateField,
  updateNonPriceGoal,
}: {
  form: FormState;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  updateNonPriceGoal: (key: keyof NonPriceGoals, value: number) => void;
}) {
  const nonPriceGoalLabels: { key: keyof NonPriceGoals; label: string }[] = [
    { key: "bestPrice", label: "Best possible price" },
    { key: "speed", label: "Speed of sale" },
    { key: "minimalDisruption", label: "Minimal disruption" },
    { key: "privacy", label: "Privacy / low profile" },
    { key: "longSettlement", label: "Long settlement / rent-back" },
  ];

  // ✅ Ensure we always have a full goals object
  const safeGoals: NonPriceGoals = form.nonPriceGoals ?? {
    bestPrice: 3,
    speed: 3,
    minimalDisruption: 3,
    privacy: 3,
    longSettlement: 3,
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Motivation & expectations
        </h2>
        <p className="text-sm text-slate-500">
          Why they&apos;re moving, when, and what success looks like for them.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Primary reason for moving
            </label>
            <select
              value={form.primaryReason}
              onChange={(e) => updateField("primaryReason", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              <option value="upsizing">Upsizing</option>
              <option value="downsizing">Downsizing</option>
              <option value="relocation">Job relocation</option>
              <option value="financial">Financial / mortgage stress</option>
              <option value="deceased">Deceased estate</option>
              <option value="separation">Divorce / separation</option>
              <option value="testing">Testing the market</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Ideal timeframe to move
            </label>
            <select
              value={form.idealTimeframe}
              onChange={(e) => updateField("idealTimeframe", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              <option value="asap">As soon as possible</option>
              <option value="0-3">0–3 months</option>
              <option value="3-6">3–6 months</option>
              <option value="6plus">6+ months</option>
              <option value="flexible">Open / flexible</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Tell me a bit more about what&apos;s prompting the move
          </label>
          <textarea
            value={form.motivationDetail}
            onChange={(e) => updateField("motivationDetail", e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Any dates we should avoid?
          </label>
          <input
            type="text"
            value={form.datesToAvoid}
            onChange={(e) => updateField("datesToAvoid", e.target.value)}
            placeholder="Holidays, work trips, family events, etc."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Price expectations
        </h3>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.hasPriceExpectation}
            onChange={(e) =>
              updateField("hasPriceExpectation", e.target.checked)
            }
          />
          They have a price range in mind
        </label>

        {form.hasPriceExpectation && (
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Expectation (min)
              </label>
              <input
                type="text"
                value={form.expectationMin}
                onChange={(e) => updateField("expectationMin", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Expectation (max)
              </label>
              <input
                type="text"
                value={form.expectationMax}
                onChange={(e) => updateField("expectationMax", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Where has this expectation come from?
              </label>
              <select
                value={form.expectationSource}
                onChange={(e) =>
                  updateField("expectationSource", e.target.value)
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Select</option>
                <option value="other_agent">Other agent</option>
                <option value="online_estimate">Online estimate</option>
                <option value="recent_sales">Recent sales they know of</option>
                <option value="bank_broker">Bank / broker</option>
                <option value="own_research">Own research / gut feel</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Comments about expectations
              </label>
              <textarea
                value={form.expectationComments}
                onChange={(e) =>
                  updateField("expectationComments", e.target.value)
                }
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Non-price goals
        </h3>

        <div className="space-y-3">
          {nonPriceGoalLabels.map(({ key, label }) => (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">{label}</span>
                <span className="text-slate-500">{safeGoals[key]}</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={safeGoals[key]}
                onChange={(e) =>
                  updateNonPriceGoal(key, Number(e.target.value))
                }
                className="w-full"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Anything else that would make this a &ldquo;win&rdquo; for them?
          </label>
          <textarea
            value={form.otherGoalNotes}
            onChange={(e) => updateField("otherGoalNotes", e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </section>
    </div>
  );
}
/* ---------- STEP 6 ---------- */
function Step6PricingStrategy({
  form,
  updateField,
}: {
  form: FormState;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Pricing & strategy
        </h2>
        <p className="text-sm text-slate-500">
          Capture your pricing view and how you&apos;d position the property.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Suggested price range (min)
            </label>
            <input
              type="text"
              value={form.suggestedRangeMin}
              onChange={(e) => updateField("suggestedRangeMin", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Suggested price range (max)
            </label>
            <input
              type="text"
              value={form.suggestedRangeMax}
              onChange={(e) => updateField("suggestedRangeMax", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Pricing strategy
          </label>
          <select
            value={form.pricingStrategy}
            onChange={(e) => updateField("pricingStrategy", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select</option>
            <option value="from">From $X</option>
            <option value="offers_above">Offers above $X</option>
            <option value="offers_in">Offers in the (e.g. high $800s)</option>
            <option value="set_price">Set price</option>
            <option value="auction">Auction</option>
            <option value="set_date">Set date sale / EOI</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Key comparable sales notes
          </label>
          <textarea
            value={form.comparablesNotes}
            onChange={(e) => updateField("comparablesNotes", e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Recommended preparation
        </h3>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Must do before photography
            </label>
            <textarea
              value={form.mustDoPrep}
              onChange={(e) => updateField("mustDoPrep", e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Nice to have if possible
            </label>
            <textarea
              value={form.niceToHavePrep}
              onChange={(e) => updateField("niceToHavePrep", e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Fee & authority
        </h3>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.feesDiscussed}
            onChange={(e) => updateField("feesDiscussed", e.target.checked)}
          />
          Fees / authority discussed at this appointment
        </label>

        {form.feesDiscussed && (
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Proposed selling fee
              </label>
              <input
                type="text"
                value={form.proposedFee}
                onChange={(e) => updateField("proposedFee", e.target.value)}
                placeholder="e.g. 2.2% + $660 marketing"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Likelihood of signing
              </label>
              <select
                value={form.agreementLikelihood}
                onChange={(e) =>
                  updateField("agreementLikelihood", e.target.value)
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Select</option>
                <option value="very_likely">Very likely</option>
                <option value="likely">Likely</option>
                <option value="unsure">Unsure</option>
                <option value="unlikely">Unlikely</option>
              </select>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------- STEP 7 ---------- */
function Step7PresentationMarketing({
  form,
  updateField,
  toggleArrayValue,
}: {
  form: FormState;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  toggleArrayValue: (key: keyof FormState, value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Presentation, marketing & follow-up
        </h2>
        <p className="text-sm text-slate-500">
          How the home presents, who you&apos;ll target and what happens next.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Presentation score (1–10)
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={form.presentationScore}
              onChange={(e) => updateField("presentationScore", e.target.value)}
              className="mt-1 w-full"
            />
            <div className="mt-1 text-xs text-slate-600">
              Current score: {form.presentationScore}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              One-line presentation summary
            </label>
            <input
              type="text"
              value={form.presentationSummary}
              onChange={(e) =>
                updateField("presentationSummary", e.target.value)
              }
              placeholder="Neat but dated – great bones, needs cosmetic refresh."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Marketing ideas
        </h3>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Target buyer profile
          </label>
          <textarea
            value={form.targetBuyerProfile}
            onChange={(e) => updateField("targetBuyerProfile", e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Headline / angle ideas
          </label>
          <textarea
            value={form.headlineIdeas}
            onChange={(e) => updateField("headlineIdeas", e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Marketing channels
          </label>
          <div className="mt-1 grid gap-2 sm:grid-cols-3">
            {MARKETING_CHANNELS.map((channel) => (
              <label
                key={channel}
                className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={(form.marketingChannels ?? []).includes(channel)}
                  onChange={() =>
                    toggleArrayValue("marketingChannels", channel)
                  }
                />
                <span>{channel}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Follow-up</h3>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Next steps & reminders
            </label>
            <textarea
              value={form.followUpActions}
              onChange={(e) => updateField("followUpActions", e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Follow-up date
            </label>
            <input
              type="date"
              value={form.followUpDate}
              onChange={(e) => updateField("followUpDate", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">
              Use this later to drive reminders in a dashboard.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- STEP 8: REVIEW ---------- */
function ReviewScreen({ form }: { form: FormState }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Review</h2>
      <p className="text-sm text-slate-600">
        Check everything before saving or completing.
      </p>

      <pre className="overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
        {JSON.stringify(form, null, 2)}
      </pre>

      <p className="text-xs text-slate-500">
        This will not appear in the final version — just here for debugging.
      </p>
    </div>
  );
}

// …all your step components above (Step1Overview, Step2PropertyBasics, etc.)

export default AppraisalForm;
