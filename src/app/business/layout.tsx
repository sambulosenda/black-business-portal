// This layout only applies to business pages
// Public profiles at /business/[slug] don't require authentication
// Authenticated pages like dashboard, services, etc. handle their own auth
export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
