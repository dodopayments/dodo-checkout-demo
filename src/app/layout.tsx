import type { Metadata } from "next";
import localFont from "next/font/local";
import { Instrument_Serif } from "next/font/google";
import "./globals.css";
import Banner from "@/components/design-system/Banner";
import NavBar from "@/components/design-system/NavBar";
import Footer from "@/components/design-system/Footer";
import { SessionProvider } from "next-auth/react";
import { PHProvider } from "../hooks/PosthogProvider";
import { Toaster } from "@/components/ui/toaster";

const instrument_serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});

const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Dodo Demo Product",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <PHProvider>
        <html lang="en">
          <body
            className={`${instrument_serif.variable} ${satoshi.variable} bg-[#E7E7E3] font-body antialiased`}
          >
            <main className="min-h-screen">
              <Banner />
              <NavBar />
              {children}
              <Footer />
            </main>
            <Toaster />
          </body>
        </html>
      </PHProvider>
    </SessionProvider>
  );
}
