import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://socratop.com'),
  title: "Cadence - The Perfect Running Companion | Smart Metronome & GPS Tracker",
  description: "Run with perfect rhythm. Cadence combines a smart metronome, GPS tracking, and music integration for the ultimate running experience. Download now on App Store.",
  keywords: "running app, metronome, GPS tracking, running cadence, fitness app, Apple Music integration, running companion, BPM tracker, 跑步应用, 节拍器, GPS追踪, 跑步步频, 健身应用",
  authors: [{ name: "Cadence Team" }],
  creator: "Cadence Team",
  publisher: "Cadence",
  applicationName: "Cadence",
  category: "Fitness",
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://socratop.com',
    title: 'Cadence - The Perfect Running Companion',
    description: 'Run with perfect rhythm. Smart metronome, GPS tracking, and music integration for runners.',
    siteName: 'Cadence',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cadence Running App - Smart Metronome & GPS Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cadence - The Perfect Running Companion',
    description: 'Run with perfect rhythm. Smart metronome, GPS tracking, and music integration.',
    images: ['/images/twitter-image.png'],
    creator: '@cadenceapp',
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: 'https://socratop.com',
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
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
