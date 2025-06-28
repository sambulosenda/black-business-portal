import { requireAuth } from "@/lib/session"
import Link from "next/link"
import LogoutButton from "@/components/logout-button"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarHeader, 
  SidebarItem, 
  SidebarProvider,
  SidebarToggle,
  SidebarMobileTrigger
} from "@/components/ui/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-between w-full">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                BeautyPortal
              </Link>
              <SidebarToggle />
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarItem 
                href="/dashboard"
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                }
              >
                Overview
              </SidebarItem>
              
              <SidebarItem 
                href="/bookings"
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              >
                My Bookings
              </SidebarItem>
              
              <SidebarItem 
                href="/profile"
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              >
                Profile
              </SidebarItem>
            </SidebarGroup>
            
            <SidebarGroup label="Browse">
              <SidebarItem 
                href="/search"
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              >
                Find Services
              </SidebarItem>
              
              <SidebarItem 
                href="/"
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                }
              >
                Home
              </SidebarItem>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter>
            <LogoutButton />
          </SidebarFooter>
        </Sidebar>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-4 py-4">
              <SidebarMobileTrigger />
              <div className="flex items-center gap-4">
                {/* Additional header items can go here */}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}