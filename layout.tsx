import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import NimbusChat from "@/components/nimbus-chat";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Nimbus Roofing | AI-Powered Hail Damage Roof Replacement McKinney TX",
  description:
    "McKinney's only AI-powered roofing contractor. NimbusIQ detects hail damage, handles your insurance claim, and installs GAF-certified roofing. Serving Collin County & DFW.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-screen bg-gray-200 w-full flex-col text-stone-900">
          <main>{children}</main>
        </div>
        {/* Global NimbusIQ Chat Widget — floats on every page */}
        <NimbusChat />
      </body>
    </html>
  );
}
