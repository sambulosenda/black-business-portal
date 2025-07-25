import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Glamfric - Book Beauty Services in 30 Seconds",
    template: "%s | Glamfric"
  },
  description: "Find and instantly book appointments at top-rated African beauty salons and professionals near you. Hair, nails, spa, and more. No calls, no waiting.",
  keywords: ["beauty salon", "hair salon", "nail salon", "spa", "African beauty", "book appointment", "beauty services", "hair braiding", "makeup", "lash extensions"],
  authors: [{ name: "Glamfric" }],
  creator: "Glamfric",
  publisher: "Glamfric",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://glamfric.com"),
  openGraph: {
    title: "Glamfric - Book Beauty Services in 30 Seconds",
    description: "Find and instantly book appointments at top-rated African beauty salons near you.",
    url: "/",
    siteName: "Glamfric",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Glamfric - Book Beauty Services",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Glamfric - Book Beauty Services in 30 Seconds",
    description: "Find and instantly book appointments at top-rated African beauty salons near you.",
    images: ["/og-image.jpg"],
    creator: "@glamfric",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
