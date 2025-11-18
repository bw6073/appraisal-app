import React from "react";
import AppraisalSummaryClient from "./AppraisalSummaryClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AppraisalSummaryPage({ params }: Props) {
  const resolved = await params;
  const numericId = Number(resolved.id);

  return <AppraisalSummaryClient id={numericId} />;
}
