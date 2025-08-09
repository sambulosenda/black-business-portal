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
      description: 'Overview & insights',
    },
    {
      title: 'Services',
      icon: Package,
      href: '/business/dashboard/services',
      description: 'Manage offerings',
    },
    {
      title: 'Bookings',
      icon: Calendar,
      href: '/business/dashboard/bookings',
      description: 'Appointments',
    },
    {
      title: 'Calendar',
      icon: CalendarDays,
      href: '/business/dashboard/calendar',
      description: 'Schedule view',
    },
    {
      title: 'Customers',
      icon: Users,
      href: '/business/dashboard/customers',
      description: 'Client management',
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      href: '/business/dashboard/analytics',
      description: 'Performance data',
    },
    {
      title: 'Reviews',
      icon: Star,
      href: '/business/dashboard/reviews',
      description: 'Customer feedback',
    },
    {
      title: 'Availability',
      icon: Clock,
      href: '/business/dashboard/availability',
      description: 'Working hours',
    },
    {
      title: 'Promotions',
      icon: Tag,
      href: '/business/dashboard/promotions',
      description: 'Special offers',
    },
    {
      title: 'Staff',
      icon: Users,
      href: '/business/dashboard/staff',
      description: 'Team management',
    },
    {
      title: 'Notifications',
      icon: Bell,
      href: '/business/dashboard/notifications',
      description: 'Alerts & updates',
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/business/dashboard/settings',
      description: 'Business profile',
    },
  ]

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar className="border-r border-gray-200 bg-white shadow-xl">
          <SidebarHeader className="flex h-16 items-center border-b border-gray-100 px-6 bg-gradient-to-r from-indigo-50 to-purple-50">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold text-white text-sm shadow-lg group-hover:shadow-xl transition-shadow">
                G
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Glamfric</span>
                <span className="text-xs text-gray-500 font-medium">Business Dashboard</span>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent className="py-4">
            <SidebarGroup>
              <SidebarGroupLabel className="px-6 text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                Business Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1 px-3">
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        className="group transition-all hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 data-[active=true]:bg-gradient-to-r data-[active=true]:from-indigo-100 data-[active=true]:to-purple-100 data-[active=true]:border data-[active=true]:border-indigo-200 rounded-xl"
                      >
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 rounded-xl px-3 py-3 min-h-[3rem]"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-purple-500 group-data-[active=true]:bg-gradient-to-r group-data-[active=true]:from-indigo-600 group-data-[active=true]:to-purple-600 transition-all">
                            <item.icon className="h-4 w-4 text-gray-500 group-hover:text-white group-data-[active=true]:text-white transition-colors" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 group-data-[active=true]:text-gray-900 transition-colors">
                              {item.title}
                            </span>
                            <span className="text-xs text-gray-500 group-hover:text-gray-600 group-data-[active=true]:text-gray-600 transition-colors">
                              {item.description}
                            </span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold text-white text-sm">
                {session.user.name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-gray-900 truncate">{session.user.name}</span>
                <span className="text-xs text-gray-500 truncate">{session.user.email}</span>
              </div>
            </div>
            <Link
              href="/api/auth/signout"
              className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </Link>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-hidden">
          <div className="sticky top-0 z-10 flex h-16 items-center border-b border-gray-200 bg-white/95 backdrop-blur-md px-6 shadow-sm">
            <SidebarTrigger className="mr-4 rounded-lg p-2 transition-colors hover:bg-gray-100" />
            <div className="flex items-center gap-4 ml-auto">
              {/* Search */}
              <div className="relative hidden sm:block">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 focus:outline-none"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </button>
            </div>
          </div>
          <div className="overflow-auto">
            <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50/50 to-white">
              <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
