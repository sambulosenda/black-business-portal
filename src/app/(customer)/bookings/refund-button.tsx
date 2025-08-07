'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RefundButtonProps {
  bookingId: string
  bookingDate: Date
  paymentStatus: string
}

export default function RefundButton({ bookingId, bookingDate, paymentStatus }: RefundButtonProps) {
  const [isRefunding, setIsRefunding] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  // Check if refund is allowed (24 hours before appointment)
  const hoursBeforeAppointment = (new Date(bookingDate).getTime() - Date.now()) / (1000 * 60 * 60)
  const canRefund = paymentStatus === 'SUCCEEDED' && hoursBeforeAppointment >= 24

  const handleRefund = async () => {
    setIsRefunding(true)
    try {
      const response = await fetch('/api/bookingss/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process refund')
      }

      // Refresh the page to show updated status
      router.refresh()
      setShowConfirm(false)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to process refund')
    } finally {
      setIsRefunding(false)
    }
  }

  if (paymentStatus === 'REFUNDED') {
    return <span className="text-sm text-gray-500">Refunded</span>
  }

  if (!canRefund) {
    return null
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-sm font-medium text-red-600 hover:text-red-800"
        disabled={isRefunding}
      >
        Request Refund
      </button>

      {showConfirm && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Confirm Refund</h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to request a refund? This will cancel your booking.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isRefunding}
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={isRefunding}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isRefunding ? 'Processing...' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
