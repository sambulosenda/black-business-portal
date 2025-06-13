import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function getSession() {
  const session = await getServerSession(authOptions)
  return session
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  return session
}

export async function requireRole(role: string) {
  const session = await requireAuth()
  if (session.user.role !== role) {
    redirect("/dashboard")
  }
  return session
}