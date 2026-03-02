import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "../components/ThemeRegistry/ThemeRegistry";
import React from 'react';
import { PortfolioDataProvider } from "../context/PortfolioDataContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://alfarabusalihu.github.io'),
  title: "Alfar Abusalihu | Full-Stack Developer & AI Systems Architect",
  description: "Portfolio of Alfar Abusalihu, a Full-Stack Developer specialized in Next.js, AI automation, and clean architecture. Building high-performance solutions like Snaphunt AI and CV Analyzer.",
  keywords: [
    "Alfar Abusalihu", "Full-Stack Developer India", "Next.js Expert", "AI Solutions Architect",
    "React Native Developer", "Web Automation Engineer", "Clean Architecture Specialist"
  ],
  authors: [{ name: "Alfar Abusalihu", url: 'https://linkedin.com/in/alfarabusalihu' }],
  creator: "Alfar Abusalihu",
  publisher: "Alfar Abusalihu",
  alternates: {
    canonical: 'https://alfarabusalihu.github.io/Portfolio',
  },
  openGraph: {
    title: "Alfar Abusalihu | Full-Stack Developer & AI Architect",
    description: "Professional portfolio showcasing AI-driven applications and modern web architectures.",
    url: "https://alfarabusalihu.github.io/Portfolio",
    siteName: "Alfar Abusalihu Portfolio",
    images: [
      {
        url: "/profile.jpg",
        width: 1200,
        height: 630,
        alt: "Alfar Abusalihu - Full-Stack Developer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alfar Abusalihu | Lead Developer",
    description: "Building the future of AI-integrated web applications with Next.js.",
    images: ["/profile.jpg"],
    creator: "@alfarabusalihu",
  },
  verification: {
    // Add your real Google Search Console verification token here
    // google: 'your_token_here',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Alfar Abusalihu',
    url: 'https://alfarabusalihu.github.io/Portfolio',
    jobTitle: 'Full-Stack Developer & AI Systems Architect',
    description: 'Full-Stack Developer specialized in Next.js, AI automation, and clean architecture.',
    email: 'alfarabusalihu@gmail.com',
    sameAs: [
      'https://linkedin.com/in/alfarabusalihu',
      'https://github.com/alfarabusalihu',
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${outfit.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <ThemeRegistry>
          <PortfolioDataProvider>
            {children}
          </PortfolioDataProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
