import { requireRole } from "@/lib/session"
import Link from "next/link"
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
import {
  LayoutDashboard,
  Package,
  Calendar,
  Clock,
  BarChart3,
  Star,
  Settings,
  LogOut,
  User,
} from "lucide-react"

export default async function BusinessLayout({
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
      href: "/business/services",
    },
    {
      title: "Bookings",
      icon: Calendar,
      href: "/business/bookings",
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
      title: "Profile",
      icon: User,
      href: "/business/profile",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/business/dashboard/settings",
    },
  ]

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b px-6 py-4 bg-sidebar">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">BeautyPortal</span>
              <span className="text-sm text-muted-foreground">Business</span>
            </Link>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
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
                <span className="text-sm font-medium">{session.user.name}</span>
                <span className="text-xs text-muted-foreground">{session.user.email}</span>
              </div>
            </div>
            <Link
              href="/api/auth/signout"
              className="mt-4 flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </Link>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-hidden">
          <div className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-6">
            <SidebarTrigger className="mr-4" />
            <h2 className="text-lg font-semibold">Business Portal</h2>
          </div>
          <div className="overflow-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}