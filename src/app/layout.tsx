import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Move With Brent – Appraisal Capture",
  description: "Internal appraisal capture tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-100`}
      >
        <div className="min-h-screen">
          {/* Top bar */}
          <header className="border-b bg-white">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-slate-900 text-center text-sm font-bold text-white leading-8">
                  B
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Appraisal Capture
                  </div>
                  <div className="text-xs text-slate-500">
                    app.sellwithbrent.com.au
                  </div>
                </div>
              </div>

              {/* Simple nav that wraps on small screens */}
              <nav className="flex flex-col items-end gap-1 text-xs sm:flex-row sm:items-center sm:gap-3">
                <a
                  href="/appraisals"
                  className="text-slate-600 hover:text-slate-900"
                >
                  Appraisals
                </a>
                <a
                  href="/appraisals/new"
                  className="rounded-md bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white hover:bg-slate-700"
                >
                  + New appraisal
                </a>
              </nav>
            </div>
          </header>

          {/* Page content */}
          <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
