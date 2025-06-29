import { requireRole } from "@/lib/session"

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("BUSINESS_OWNER")

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}