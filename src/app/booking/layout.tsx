import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Appointment",
  description: "Book your beauty appointment on Glamfric. Choose your service, select a convenient time, and get instant confirmation.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}