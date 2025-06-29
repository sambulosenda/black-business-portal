import { requireRole } from "@/lib/session"

export default async function BusinessDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("BUSINESS_OWNER")

  return <>{children}</>
}