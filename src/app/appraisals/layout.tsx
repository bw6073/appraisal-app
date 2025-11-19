// src/app/appraisals/layout.tsx
import type { ReactNode } from "react";
import AuthGate from "@/components/AuthGate";

type Props = {
  children: ReactNode;
};

export default function AppraisalsLayout({ children }: Props) {
  return <AuthGate>{children}</AuthGate>;
}
