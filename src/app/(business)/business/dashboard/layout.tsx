import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BarChart3,
  Bell,
  Calendar,
  CalendarDays,
  Clock,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Star,
  Tag,
  Users,
} from 'lucide-react'
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
} from '@/components/ui/sidebar'
import { requireRole } from '@/lib/session'

export const metadata: Metadata = {
  title: 'Business Dashboard',
  description:
    'Manage your beauty business on Glamfric. Track bookings, manage services, view analytics, and grow your customer base.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function BusinessDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('BUSINESS_OWNER')

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/business/dashboard',
    },
    {
      title: 'Services',
      icon: Package,
      href: '/business/dashboard/services',
    },
    {
      title: 'Promotions',
      icon: Tag,
      href: '/business/dashboard/promotions',
    },
    {
      title: 'Staff',
      icon: Users,
      href: '/business/dashboard/staff',
    },
    {
      title: 'Customers',
      icon: Users,
      href: '/business/dashboard/customers',
    },
    {
      title: 'Bookings',
      icon: Calendar,
      href: '/business/dashboard/bookings',
    },
    {
      title: 'Calendar',
      icon: CalendarDays,
      href: '/business/dashboard/calendar',
    },
    {
      title: 'Availability',
      icon: Clock,
      href: '/business/dashboard/availability',
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      href: '/business/dashboard/analytics',
    },
    {
      title: 'Reviews',
      icon: Star,
      href: '/business/dashboard/reviews',
    },
    {
      title: 'Notifications',
      icon: Bell,
      href: '/business/dashboard/notifications',
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/business/dashboard/settings',
    },
  ]

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-white">
        <Sidebar className="border-r border-gray-200 bg-white">
          <SidebarHeader className="flex h-14 items-center border-b px-6">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-900 font-semibold text-white text-sm">
                G
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold text-gray-900">Glamfric</span>
                <span className="text-xs text-gray-500">Business Dashboard</span>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 text-xs font-medium tracking-wider text-gray-400 uppercase">
                Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        className="transition-all hover:bg-gray-50 data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900"
                      >
                        <Link
                          href={item.href}
                          className="group flex items-center gap-3 rounded-md px-3 py-2"
                        >
                          <item.icon className="h-4 w-4 text-gray-500 transition-colors group-hover:text-gray-700 group-data-[active=true]:text-gray-900" />
                          <span className="text-sm text-gray-600 transition-colors group-hover:text-gray-900 group-data-[active=true]:text-gray-900 group-data-[active=true]:font-medium">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">{session.user.name}</span>
                <span className="text-xs text-gray-500">{session.user.email}</span>
              </div>
            </div>
            <Link
              href="/api/auth/signout"
              className="mt-4 flex items-center space-x-2 text-sm text-gray-500 transition-colors hover:text-gray-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </Link>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-hidden">
          <div className="sticky top-0 z-10 flex h-14 items-center border-b border-gray-200 bg-white px-6">
            <SidebarTrigger className="mr-4 rounded-md p-1.5 transition-colors hover:bg-gray-100" />
          </div>
          <div className="overflow-auto">
            <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50/50">
              <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
