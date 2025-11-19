// src/app/appraisals/layout.tsx
import React, { ReactNode } from "react";

export default function AppraisalsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <main>{children}</main>
    </div>
  );
}
