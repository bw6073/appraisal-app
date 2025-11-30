"use client";

type PrintButtonProps = {
  label?: string;
};

export default function PrintButton({
  label = "Print / Save as PDF",
}: PrintButtonProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="no-print rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
    >
      {label}
    </button>
  );
}
