'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { BarChart, PieChart, StatCard, ChartContainer } from '@/components/ui/chart';
import { EmptyState } from '@/components/ui/empty-state';

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
      <div className="bg-white rounded-lg shadow-sm">
        <EmptyState
          icon="error"
          title="Failed to load analytics"
          description={error || "We couldn't retrieve your analytics data. Please try again later."}
          action={{
            label: "Retry",
            onClick: () => {
              setError('');
              fetchAnalytics();
            }
          }}
        />
      </div>
    );
  }

  // Prepare data for charts
  const feeBreakdownData = [
    { label: 'Your Revenue', value: analytics.revenue.thisMonth, color: 'bg-green-500' },
    { label: 'Platform Fees', value: analytics.revenue.thisMonthPlatformFees, color: 'bg-yellow-500' },
    { label: 'Stripe Fees', value: analytics.revenue.thisMonthStripeFees, color: 'bg-red-500' }
  ];

  const topServicesChartData = analytics.topServices.map((service, index) => ({
    label: service.serviceName,
    value: service.revenue,
    color: index === 0 ? 'bg-indigo-600' : index === 1 ? 'bg-indigo-500' : 'bg-indigo-400'
  }));

  return (
    <div className="space-y-8">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="This Month Revenue"
          value={`$${analytics.revenue.thisMonth.toFixed(2)}`}
          description={`Gross: $${analytics.revenue.thisMonthGross.toFixed(2)}`}
          trend={{
            value: Math.abs(analytics.revenue.monthOverMonthGrowth),
            isPositive: analytics.revenue.monthOverMonthGrowth >= 0
          }}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <StatCard
          title="This Week"
          value={`$${analytics.revenue.thisWeek.toFixed(2)}`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="bg-purple-600"
        />
        
        <StatCard
          title="Last Month"
          value={`$${analytics.revenue.lastMonth.toFixed(2)}`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="bg-gray-600"
        />
      </div>

      {/* Fee Breakdown Chart */}
      <ChartContainer 
        title="Fee Breakdown (This Month)"
        description="Visual breakdown of gross revenue, platform fees, and processing fees"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PieChart data={feeBreakdownData} size={250} />
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Gross Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${analytics.revenue.thisMonthGross.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Platform Fees (15%)</p>
              <p className="text-lg font-semibold text-yellow-600">
                -${analytics.revenue.thisMonthPlatformFees.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Stripe Processing Fees</p>
              <p className="text-lg font-semibold text-red-600">
                -${analytics.revenue.thisMonthStripeFees.toFixed(2)}
              </p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">Your Net Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${analytics.revenue.thisMonth.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </ChartContainer>

      {/* Booking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Bookings"
          value={analytics.bookings.total}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          color="bg-blue-600"
        />
        <StatCard
          title="Completed"
          value={analytics.bookings.completed}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-green-600"
        />
        <StatCard
          title="Upcoming"
          value={analytics.bookings.upcoming}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-orange-600"
        />
      </div>

      {/* Top Services Chart */}
      {analytics.topServices.length > 0 && (
        <ChartContainer 
          title="Top Services by Revenue"
          description="Your highest earning services this month"
        >
          <BarChart data={topServicesChartData} height={300} />
        </ChartContainer>
      )}

      {/* Recent Transactions Table */}
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
              {analytics.recentTransactions.length > 0 ? (
                analytics.recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
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
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12">
                    <EmptyState
                      icon="chart"
                      title="No transactions yet"
                      description="Your recent transactions will appear here"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}