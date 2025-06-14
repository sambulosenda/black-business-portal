'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RefundButtonProps {
  bookingId: string;
  bookingDate: Date;
  paymentStatus: string;
}

export default function RefundButton({ bookingId, bookingDate, paymentStatus }: RefundButtonProps) {
  const [isRefunding, setIsRefunding] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  // Check if refund is allowed (24 hours before appointment)
  const hoursBeforeAppointment = (new Date(bookingDate).getTime() - Date.now()) / (1000 * 60 * 60);
  const canRefund = paymentStatus === 'SUCCEEDED' && hoursBeforeAppointment >= 24;

  const handleRefund = async () => {
    setIsRefunding(true);
    try {
      const response = await fetch('/api/booking/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process refund');
      }

      // Refresh the page to show updated status
      router.refresh();
      setShowConfirm(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to process refund');
    } finally {
      setIsRefunding(false);
    }
  };

  if (paymentStatus === 'REFUNDED') {
    return <span className="text-sm text-gray-500">Refunded</span>;
  }

  if (!canRefund) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-sm text-red-600 hover:text-red-800 font-medium"
        disabled={isRefunding}
      >
        Request Refund
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Refund</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to request a refund? This will cancel your booking.
            </p>
            <div className="flex gap-3 justify-end">
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
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isRefunding ? 'Processing...' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}