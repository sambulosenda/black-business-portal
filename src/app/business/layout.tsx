import { requireRole } from "@/lib/session"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Package, 
  Calendar, 
  Settings,
  ChartBar,
  Star,
  Clock
} from "lucide-react"

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("BUSINESS_OWNER")

  const navItems = [
    {
      href: "/business/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/business/services",
      label: "Services",
      icon: Package,
    },
    {
      href: "/business/bookings",
      label: "Bookings",
      icon: Calendar,
    },
    {
      href: "/business/dashboard/availability",
      label: "Availability",
      icon: Clock,
    },
    {
      href: "/business/dashboard/analytics",
      label: "Analytics",
      icon: ChartBar,
    },
    {
      href: "/business/dashboard/reviews",
      label: "Reviews",
      icon: Star,
    },
    {
      href: "/business/profile",
      label: "Settings",
      icon: Settings,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="border-b">
        <div className="container mx-auto max-w-7xl px-4">
          <nav className="flex items-center space-x-6 h-16 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}