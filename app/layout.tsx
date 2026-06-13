import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "EarnForge | Earn real cash fast — Surveys, Games & Offers",
  description: "The modern way to make quick money online. Complete verified tasks, play skill games, take high-paying surveys. Instant payouts from $3 to PayPal, crypto & gift cards. $400M+ paid out. Join 100k+ earners.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-200">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
