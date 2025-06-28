"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface SidebarContextValue {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  isMobile: boolean
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
}

export function SidebarProvider({ children, defaultCollapsed = false }: SidebarProviderProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    // Check if mobile on mount and window resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  React.useEffect(() => {
    // Restore collapsed state from localStorage (only for desktop)
    if (!isMobile) {
      const savedState = localStorage.getItem("sidebar-collapsed")
      if (savedState !== null) {
        setCollapsed(JSON.parse(savedState))
      }
    }
  }, [isMobile])

  React.useEffect(() => {
    // Save collapsed state to localStorage (only for desktop)
    if (!isMobile) {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed))
    }
  }, [collapsed, isMobile])

  // Close mobile sidebar when clicking outside
  React.useEffect(() => {
    if (isMobile && mobileOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const sidebar = document.querySelector('[data-sidebar="sidebar"]')
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setMobileOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobile, mobileOpen])

  return (
    <SidebarContext.Provider value={{ 
      collapsed: isMobile ? false : collapsed, 
      setCollapsed, 
      isMobile,
      mobileOpen,
      setMobileOpen
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right"
}

export function Sidebar({ 
  className, 
  side = "left", 
  children, 
  ...props 
}: SidebarProps) {
  const { collapsed, isMobile, mobileOpen } = useSidebar()

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50" />
      )}
      
      <div
        className={cn(
          "relative flex h-full flex-col border-r bg-white transition-all duration-300 ease-in-out",
          isMobile ? (
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          ) : (
            collapsed ? "w-16" : "w-60"
          ),
          isMobile && "fixed z-50 h-screen w-72",
          side === "right" && "border-r-0 border-l",
          className
        )}
        data-sidebar="sidebar"
        data-side={side}
        data-collapsed={collapsed}
        data-mobile={isMobile}
        data-mobile-open={mobileOpen}
        {...props}
      >
        {children}
      </div>
    </>
  )
}

export function SidebarHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-16 items-center border-b px-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex-1 overflow-auto py-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-t p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarNav({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn(
        "space-y-1 px-3",
        className
      )}
      {...props}
    >
      {children}
    </nav>
  )
}

interface SidebarNavItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  href?: string
  active?: boolean
}

export function SidebarNavItem({ 
  className, 
  icon, 
  children, 
  active = false,
  ...props 
}: SidebarNavItemProps) {
  const { collapsed, isMobile } = useSidebar()
  const shouldShowText = !collapsed || isMobile

  return (
    <Button
      variant={active ? "primary" : "ghost"}
      className={cn(
        "w-full justify-start gap-3 px-3 py-2.5 h-auto transition-all duration-200",
        !shouldShowText && "px-3 justify-center",
        active && "bg-primary text-primary-foreground",
        className
      )}
      {...props}
    >
      {icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      {shouldShowText && (
        <span className="truncate">
          {children}
        </span>
      )}
    </Button>
  )
}

export function SidebarToggle({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { collapsed, setCollapsed, isMobile } = useSidebar()

  // Don't show toggle on mobile
  if (isMobile) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "absolute -right-4 top-6 z-20 h-8 w-8 rounded-full border bg-white shadow-md hover:bg-gray-50",
        className
      )}
      onClick={() => setCollapsed(!collapsed)}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      {...props}
    >
      {collapsed ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <ChevronLeft className="h-4 w-4" />
      )}
    </Button>
  )
}