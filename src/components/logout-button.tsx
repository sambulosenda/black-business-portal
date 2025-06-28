'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import React from 'react'

interface LogoutButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  showIcon?: boolean
  iconClassName?: string
}

export default function LogoutButton({ 
  showIcon = true, 
  iconClassName = "mr-2 size-4",
  className,
  ...props 
}: LogoutButtonProps) {
  return (
    <div
      onClick={() => signOut({ callbackUrl: '/' })}
      className={className}
      {...props}
    >
      {showIcon && <LogOut className={iconClassName} />}
      Sign Out
    </div>
  )
}