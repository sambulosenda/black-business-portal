import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glamfric - Book Beauty Services in 30 Seconds",
  description: "Find and instantly book appointments at top-rated African beauty salons and professionals near you.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
