import { requireRole } from "@/lib/session"
import { SidebarProvider } from "@/components/ui/sidebar"
import { BusinessSidebar } from "@/components/business-sidebar"

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireRole("BUSINESS_OWNER")

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        <BusinessSidebar userName={session.user.name} />
        <main className="flex-1 overflow-auto md:ml-0">
          <div className="md:hidden h-16 bg-white border-b" />
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}