import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join as a Business - Partner with Glamfric",
  description: "Grow your beauty business with Glamfric. Get more bookings, manage your calendar, and reach thousands of customers. No setup fees, no monthly charges.",
  keywords: ["beauty business", "salon software", "appointment booking", "grow salon business", "beauty professional", "salon management"],
  openGraph: {
    title: "Join as a Business - Partner with Glamfric",
    description: "Grow your beauty business with Glamfric. Get more bookings and reach thousands of customers.",
    url: "/business/join",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join as a Business - Partner with Glamfric",
    description: "Grow your beauty business with Glamfric. Get more bookings and reach thousands of customers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BusinessJoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}