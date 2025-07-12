import { requireAuth } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AvailabilityForm from "./availability-form"

export default async function AvailabilityPage() {
  const session = await requireAuth()

  if (session.user.role !== 'BUSINESS_OWNER') {
    redirect('/dashboard')
  }

  const business = await prisma.business.findUnique({
    where: { userId: session.user.id },
    include: {
      availabilities: {
        orderBy: { dayOfWeek: 'asc' }
      },
      timeOffs: {
        where: {
          date: {
            gte: new Date()
          }
        },
        orderBy: { date: 'asc' }
      }
    }
  })

  if (!business) {
    redirect('/business/dashboard')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Availability Settings</h1>
        <p className="text-gray-600 mt-1">Manage your business hours and time off</p>
      </div>

      <AvailabilityForm 
        businessId={business.id}
        availabilities={business.availabilities}
        timeOffs={business.timeOffs}
      />
    </div>
  )
}