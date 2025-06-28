'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CancelButtonProps {
  bookingId: string;
  bookingDate: Date;
  bookingStatus: string;
}

export default function CancelButton({ bookingId, bookingDate, bookingStatus }: CancelButtonProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [reason, setReason] = useState('');
  const router = useRouter();

  // Check if cancellation is allowed
  const hoursBeforeAppointment = (new Date(bookingDate).getTime() - Date.now()) / (1000 * 60 * 60);
  const canCancel = bookingStatus !== 'CANCELLED' && bookingStatus !== 'COMPLETED' && hoursBeforeAppointment > 0;
  const requiresBusinessContact = hoursBeforeAppointment < 24 && hoursBeforeAppointment > 0;

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const response = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId, reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel booking');
      }

      // Refresh the page to show updated status
      router.refresh();
      setShowConfirm(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  if (!canCancel) {
    return null;
  }

  return (
    <>
      {requiresBusinessContact ? (
        <p className="text-sm text-gray-500">
          Contact business to cancel (less than 24 hours notice)
        </p>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className="text-sm text-red-600 hover:text-red-800 font-medium"
          disabled={isCancelling}
        >
          Cancel Booking
        </button>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Cancel Booking</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder="Let the business know why you're cancelling..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isCancelling}
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}