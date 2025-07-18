import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Join Glamfric",
  description: "Create your free Glamfric account to book beauty appointments instantly. Join thousands discovering the easiest way to book beauty services.",
  openGraph: {
    title: "Sign Up - Join Glamfric",
    description: "Create your free account to book beauty appointments instantly. No more phone calls or waiting.",
    url: "/signup/customer",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sign Up - Join Glamfric",
    description: "Create your free account to book beauty appointments instantly.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CustomerSignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}