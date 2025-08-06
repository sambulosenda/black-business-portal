import { requireRole } from "@/lib/session"
import Link from "next/link"
import type { Metadata } from "next"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export const metadata: Metadata = {
  title: "Business Dashboard",
  description: "Manage your beauty business on Glamfric. Track bookings, manage services, view analytics, and grow your customer base.",
  robots: {
    index: false,
    follow: false,
  },
}
import {
  LayoutDashboard,
  Package,
  Calendar,
  CalendarDays,
  Clock,
  BarChart3,
  Star,
  Settings,
  LogOut,
  Users,
  Bell,
  Tag,
} from "lucide-react"

export default async function BusinessDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireRole("BUSINESS_OWNER")

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/business/dashboard",
    },
    {
      title: "Services",
      icon: Package,
      href: "/business/dashboard/services",
    },
    {
      title: "Promotions",
      icon: Tag,
      href: "/business/dashboard/promotions",
    },
    {
      title: "Staff",
      icon: Users,
      href: "/business/dashboard/staff",
    },
    {
      title: "Customers",
      icon: Users,
      href: "/business/dashboard/customers",
    },
    {
      title: "Bookings",
      icon: Calendar,
      href: "/business/dashboard/bookings",
    },
    {
      title: "Calendar",
      icon: CalendarDays,
      href: "/business/dashboard/calendar",
    },
    {
      title: "Availability",
      icon: Clock,
      href: "/business/dashboard/availability",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/business/dashboard/analytics",
    },
    {
      title: "Reviews",
      icon: Star,
      href: "/business/dashboard/reviews",
    },
    {
      title: "Notifications",
      icon: Bell,
      href: "/business/dashboard/notifications",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/business/dashboard/settings",
    },
  ]

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-gray-50">
        <Sidebar className="border-r bg-white">
          <SidebarHeader className="border-b px-6 py-4 bg-gray-50">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform">
                B
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-indigo-600">Glamfric</span>
                <span className="text-xs text-gray-600">Business Dashboard</span>
              </div>
            </Link>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild className="hover:bg-gray-50 transition-all data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-700">
                        <Link href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg group">
                          <item.icon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-data-[active=true]:text-indigo-600 transition-colors" />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 group-data-[active=true]:text-indigo-700 transition-colors">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">{session.user.name}</span>
                <span className="text-xs text-gray-600">{session.user.email}</span>
              </div>
            </div>
            <Link
              href="/api/auth/signout"
              className="mt-4 flex items-center space-x-2 text-sm text-gray-600 hover:text-red-600 transition-colors group"
            >
              <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Sign out</span>
            </Link>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-hidden">
          <div className="sticky top-0 z-10 flex h-16 items-center border-b bg-white px-8 shadow-sm">
            <SidebarTrigger className="mr-4 hover:bg-gray-100 rounded-lg transition-colors" />
            <h2 className="text-lg font-semibold text-gray-900">Business Portal</h2>
          </div>
          <div className="overflow-auto">
            <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}