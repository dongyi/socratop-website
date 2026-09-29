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
  title: {
    default: "Socratop | Running Tools, FIT Analysis & Cadence App",
    template: "%s | Socratop",
  },
  description: "Socratop gives runners practical tools for cadence training, FIT file analysis, Strava-connected activity data, and equipment tracking.",
  keywords: ["running cadence app", "FIT file analyzer", "running data analysis", "Strava integration", "running equipment tracker"],
  authors: [{ name: "Socratop Team" }],
  creator: "Socratop Team",
  publisher: "Socratop",
  applicationName: "Socratop",
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
    url: '/',
    title: 'Socratop | Running Tools, FIT Analysis & Cadence App',
    description: 'Tools for cadence training, FIT file analysis, Strava-connected activity data, and equipment tracking.',
    siteName: 'Socratop',
  },
  twitter: {
    card: 'summary',
    title: 'Socratop | Running Tools, FIT Analysis & Cadence App',
    description: 'Tools for cadence training, FIT file analysis, Strava-connected activity data, and equipment tracking.',
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US">
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
