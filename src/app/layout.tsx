import type { Metadata } from "next";
import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n/config';

export const metadata: Metadata = {
  title: "Glamfric - Book Beauty Services in 30 Seconds",
  description: "Find and instantly book appointments at top-rated African beauty salons and professionals near you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Redirect to default locale - this layout should not be used
  // The middleware handles locale routing
  return null;
}
