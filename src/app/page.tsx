// src/app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // When someone hits app.sellwithbrent.com.au,
  // send them straight to the appraisals list.
  redirect("/appraisals");
}
