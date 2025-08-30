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
  title: "Socratop - 专业运动数据平台 | Cadence跑步应用 & 数据分析",
  description: "连接、分析、提升运动表现。集成Cadence跑步应用、Strava数据同步、装备管理和专业数据分析，打造完整的个人运动生态系统。",
  keywords: "运动数据分析, Strava集成, 跑步应用, Cadence, 运动装备管理, GPS追踪, 节拍器, 运动数据可视化, 健身应用, 个人运动档案",
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
    locale: 'zh_CN',
    url: 'https://socratop.com',
    title: 'Socratop - 专业运动数据平台',
    description: '连接、分析、提升运动表现。集成Cadence跑步应用、Strava数据同步、装备管理和专业数据分析。',
    siteName: 'Socratop',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Socratop - 专业运动数据平台',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Socratop - 专业运动数据平台',
    description: '连接、分析、提升运动表现。集成Cadence跑步应用、Strava数据同步、装备管理和专业数据分析。',
    images: ['/images/twitter-image.png'],
    creator: '@socratop',
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
