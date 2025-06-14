'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface AnalyticsData {
  revenue: {
    thisMonth: number;
    lastMonth: number;
    thisWeek: number;
    monthOverMonthGrowth: number;
    thisMonthGross: number;
    thisMonthPlatformFees: number;
    thisMonthStripeFees: number;
  };
  bookings: {
    total: number;
    completed: number;
    upcoming: number;
  };
  recentTransactions: Array<{
    id: string;
    customerName: string;
    customerEmail: string;
    serviceName: string;
    amount: number;
    totalPaid: number;
    date: string;
    status: string;
  }>;
  topServices: Array<{
    serviceName: string;
    bookingCount: number;
    revenue: number;
  }>;
}

export default function AnalyticsDashboard({ businessId }: { businessId: string }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/business/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-800">{error || 'Failed to load analytics'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Revenue Overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                ${analytics.revenue.thisMonth.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                After fees (Gross: ${analytics.revenue.thisMonthGross.toFixed(2)})
              </p>
            </div>
            <div className={`text-sm font-medium ${
              analytics.revenue.monthOverMonthGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics.revenue.monthOverMonthGrowth >= 0 ? '+' : ''}
              {analytics.revenue.monthOverMonthGrowth.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div>
            <p className="text-sm font-medium text-gray-600">This Week</p>
            <p className="text-2xl font-bold text-gray-900">
              ${analytics.revenue.thisWeek.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Last Month</p>
            <p className="text-2xl font-bold text-gray-900">
              ${analytics.revenue.lastMonth.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      </div>

      {/* Fee Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Breakdown (This Month)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Platform Fees (15%)</p>
            <p className="text-lg font-semibold text-gray-900">
              ${analytics.revenue.thisMonthPlatformFees.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Stripe Processing Fees</p>
            <p className="text-lg font-semibold text-gray-900">
              ${analytics.revenue.thisMonthStripeFees.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Your Revenue</p>
            <p className="text-lg font-semibold text-green-600">
              ${analytics.revenue.thisMonth.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Booking Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900">{analytics.bookings.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">{analytics.bookings.completed}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Upcoming</p>
          <p className="text-2xl font-bold text-blue-600">{analytics.bookings.upcoming}</p>
        </div>
      </div>
      </div>

      {/* Top Services */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Services</h3>
        <div className="space-y-3">
          {analytics.topServices.map((service, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium text-gray-900">{service.serviceName}</p>
                <p className="text-sm text-gray-500">{service.bookingCount} bookings</p>
              </div>
              <p className="font-semibold text-gray-900">${service.revenue.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Your Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.recentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{transaction.customerName}</p>
                      <p className="text-sm text-gray-500">{transaction.customerEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.serviceName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'CONFIRMED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                    ${transaction.amount.toFixed(2)}
                    <span className="text-xs text-gray-500 block">
                      (Total: ${transaction.totalPaid.toFixed(2)})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}