import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Retailor | Tailor your resume to the exact job",
    template: "%s | Retailor",
  },
  description:
    "Tailor one resume to one job description with an editable, ATS-friendly draft. Review every change before you download.",
  applicationName: "Retailor",
  keywords: ["resume tailoring", "resume editor", "job application", "ATS resume"],
  openGraph: {
    title: "Retailor | Tailor your resume to the exact job",
    description:
      "Tailor one resume to one job description with an editable, ATS-friendly draft.",
    siteName: "Retailor",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Retailor | Tailor your resume to the exact job",
    description:
      "Tailor one resume to one job description with an editable, ATS-friendly draft.",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
