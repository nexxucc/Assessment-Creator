import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "VedaAI Assessment Creator",
  description: "AI-powered assessment creator for teachers"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${bricolage.variable} ${inter.variable}`}
    >
      <body>
        <div className="min-h-screen bg-[linear-gradient(180deg,#eeeeee_0%,#dadada_100%)] text-[var(--text-primary)]">
          <Sidebar />
          <Navbar />

          <main className="min-h-screen px-3 pb-28 pt-[90px] lg:pl-[327px] lg:pr-[13px] lg:pt-[90px]">
            {children}
          </main>

          <MobileNav />
        </div>
      </body>
    </html>
  );
}
