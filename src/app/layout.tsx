import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "../components/ThemeRegistry/ThemeRegistry";
import React from 'react';

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alfar Abusalihu | Full-Stack Developer & AI Solutions Architect",
  description: "Portfolio of Alfar Abusalihu, a Full-Stack Developer specialized in Next.js, AI automation, and clean architecture. Building high-performance solutions like Snaphunt AI and CV Analyzer.",
  keywords: ["Alfar Abusalihu", "Full-Stack Developer", "Next.js", "AI Developer", "Software Architecture", "React Portfolio", "Web Automation"],
  authors: [{ name: "Alfar Abusalihu" }],
  creator: "Alfar Abusalihu",
  publisher: "Alfar Abusalihu",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Alfar Abusalihu | Full-Stack Developer",
    description: "Professional portfolio showcasing AI-driven applications and modern web architectures.",
    url: "https://alfarabusalihu.github.io",
    siteName: "Alfar Portfolio",
    images: [
      {
        url: "/profile.jpg",
        width: 800,
        height: 600,
        alt: "Alfar Abusalihu Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alfar Abusalihu | Full-Stack Developer",
    description: "Full-Stack Developer specialized in Next.js and AI.",
    images: ["/profile.jpg"],
  },
  robots: {
    index: true,
    follow: true,
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
        className={`${outfit.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
