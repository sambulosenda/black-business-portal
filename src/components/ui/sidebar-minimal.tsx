"use client"

import * as React from "react"

export function Sidebar({ children, ...props }: React.ComponentProps<"div">) {
  return <div {...props}>{children}</div>
}

export function SidebarContent({ children, ...props }: React.ComponentProps<"div">) {
  return <div {...props}>{children}</div>
}

export function SidebarFooter({ children, ...props }: React.ComponentProps<"div">) {
  return <div {...props}>{children}</div>
}

export function SidebarGroup({ children, ...props }: React.ComponentProps<"div">) {
  return <div {...props}>{children}</div>
}

export function SidebarGroupContent({ children, ...props }: React.ComponentProps<"div">) {
  return <div {...props}>{children}</div>
}

export function SidebarGroupLabel({ children, ...props }: React.ComponentProps<"div">) {
  return <div {...props}>{children}</div>
}

export function SidebarHeader({ children, ...props }: React.ComponentProps<"div">) {
  return <div {...props}>{children}</div>
}

export function SidebarMenu({ children, ...props }: React.ComponentProps<"ul">) {
  return <ul {...props}>{children}</ul>
}

export function SidebarMenuButton({ children, asChild, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) {
  return <button {...props}>{children}</button>
}

export function SidebarMenuItem({ children, ...props }: React.ComponentProps<"li">) {
  return <li {...props}>{children}</li>
}

export function SidebarProvider({ children, defaultOpen, ...props }: React.ComponentProps<"div"> & { defaultOpen?: boolean }) {
  return <div {...props}>{children}</div>
}

export function SidebarTrigger({ children, ...props }: React.ComponentProps<"button">) {
  return <button {...props}>{children}</button>
}