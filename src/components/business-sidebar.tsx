"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Calendar,
  Clock,
  BarChart3,
  Star,
  User,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarNavItem,
  SidebarToggle,
  useSidebar
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface BusinessSidebarProps {
  userName?: string
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/business/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Services",
    href: "/business/services",
    icon: Package
  },
  {
    title: "Bookings",
    href: "/business/bookings",
    icon: Calendar
  },
  {
    title: "Availability",
    href: "/business/dashboard/availability",
    icon: Clock
  },
  {
    title: "Analytics",
    href: "/business/dashboard/analytics",
    icon: BarChart3
  },
  {
    title: "Reviews",
    href: "/business/dashboard/reviews",
    icon: Star
  },
  {
    title: "Profile",
    href: "/business/profile",
    icon: User
  },
  {
    title: "Settings",
    href: "/business/dashboard/settings",
    icon: Settings
  }
]

export function BusinessSidebar({ userName }: BusinessSidebarProps) {
  const pathname = usePathname()
  const { collapsed, isMobile, mobileOpen, setMobileOpen } = useSidebar()

  const handleNavClick = () => {
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="bg-white shadow-md"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      <Sidebar className="h-screen">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Package className="h-4 w-4" />
            </div>
            {(!collapsed || isMobile) && (
              <span className="font-semibold text-lg">
                BeautyPortal Business
              </span>
            )}
          </div>
          <SidebarToggle />
        </SidebarHeader>

        <SidebarContent>
          <SidebarNav>
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              const isActive = pathname === item.href || 
                (item.href !== "/business/dashboard" && pathname.startsWith(item.href))

              return (
                <Link key={item.href} href={item.href} onClick={handleNavClick}>
                  <SidebarNavItem
                    active={isActive}
                    icon={<IconComponent className="h-4 w-4" />}
                    title={collapsed && !isMobile ? item.title : undefined}
                  >
                    {item.title}
                  </SidebarNavItem>
                </Link>
              )
            })}
          </SidebarNav>
        </SidebarContent>

        <SidebarFooter>
          {(!collapsed || isMobile) && <Separator className="mb-4" />}
          
          {/* User Profile Section */}
          <div className="space-y-2">
            {(!collapsed || isMobile) && userName && (
              <div className="px-3 py-2">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground">Business Owner</p>
              </div>
            )}
            
            <Link href="/api/auth/signout" onClick={handleNavClick}>
              <Button
                variant="ghost"
                className={(collapsed && !isMobile) ? 
                  "w-full justify-center p-2" : 
                  "w-full justify-start gap-3 px-3"
                }
                title={(collapsed && !isMobile) ? "Sign out" : undefined}
              >
                <LogOut className="h-4 w-4" />
                {(!collapsed || isMobile) && <span>Sign out</span>}
              </Button>
            </Link>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}