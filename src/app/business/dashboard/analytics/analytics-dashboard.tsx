'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Users, 
  Package,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    cancelled: number;
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
      setLoading(true);
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
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchAnalytics} variant="outline" className="hover:bg-gray-50">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const growthRate = analytics.revenue.monthOverMonthGrowth;
  const isPositiveGrowth = growthRate >= 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${analytics.revenue.thisMonth.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className={cn(
                "inline-flex items-center font-medium",
                isPositiveGrowth ? "text-green-600" : "text-red-600"
              )}>
                {isPositiveGrowth ? (
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                )}
                {Math.abs(growthRate).toFixed(1)}%
              </span>
              {' '}from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{analytics.bookings.total}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-purple-600 font-medium">{analytics.bookings.upcoming}</span> upcoming
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{analytics.bookings.completed}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-medium">{((analytics.bookings.completed / analytics.bookings.total) * 100).toFixed(0)}%</span> completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${analytics.revenue.thisWeek.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">
              Weekly revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger value="revenue" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">Revenue Breakdown</TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">Top Services</TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">Recent Transactions</TabsTrigger>
        </TabsList>

        {/* Revenue Breakdown Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Revenue Breakdown</CardTitle>
              <CardDescription className="text-gray-600">
                Understanding your revenue after fees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">Gross Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${analytics.revenue.thisMonthGross.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-sm text-gray-700">Platform Fee (15%)</span>
                    </div>
                    <span className="text-sm font-medium text-yellow-600">
                      -${analytics.revenue.thisMonthPlatformFees.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm text-gray-700">Stripe Processing</span>
                    </div>
                    <span className="text-sm font-medium text-red-600">
                      -${analytics.revenue.thisMonthStripeFees.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="pt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm font-medium text-gray-900">Net Revenue</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        ${analytics.revenue.thisMonth.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visual bar representation */}
                <div className="mt-6">
                  <div className="relative h-10 bg-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-green-500"
                      style={{ width: `${(analytics.revenue.thisMonth / analytics.revenue.thisMonthGross) * 100}%` }}
                    />
                    <div 
                      className="absolute top-0 h-full bg-yellow-500"
                      style={{ 
                        left: `${(analytics.revenue.thisMonth / analytics.revenue.thisMonthGross) * 100}%`,
                        width: `${(analytics.revenue.thisMonthPlatformFees / analytics.revenue.thisMonthGross) * 100}%` 
                      }}
                    />
                    <div 
                      className="absolute top-0 h-full bg-red-500"
                      style={{ 
                        left: `${((analytics.revenue.thisMonth + analytics.revenue.thisMonthPlatformFees) / analytics.revenue.thisMonthGross) * 100}%`,
                        width: `${(analytics.revenue.thisMonthStripeFees / analytics.revenue.thisMonthGross) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Top Services</CardTitle>
              <CardDescription className="text-gray-600">
                Your best performing services by revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topServices.map((service, index) => {
                  const maxRevenue = Math.max(...analytics.topServices.map(s => s.revenue));
                  const percentage = (service.revenue / maxRevenue) * 100;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{service.serviceName}</p>
                          <p className="text-xs text-gray-500">
                            {service.bookingCount} bookings
                          </p>
                        </div>
                        <span className="text-sm font-bold text-gray-900">${service.revenue.toFixed(2)}</span>
                      </div>
                      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
                            index === 0 ? "bg-indigo-600" : 
                            index === 1 ? "bg-indigo-400" : 
                            "bg-gray-400"
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
              <CardDescription className="text-gray-600">
                Your latest bookings and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">{transaction.customerName}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{transaction.serviceName}</span>
                        <span className="text-gray-400">•</span>
                        <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${transaction.amount.toFixed(2)}</p>
                      <Badge 
                        variant="outline"
                        className={cn(
                          "text-xs",
                          transaction.status === 'COMPLETED' ? 'border-green-200 bg-green-50 text-green-700' :
                          transaction.status === 'CONFIRMED' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                          transaction.status === 'CANCELLED' ? 'border-red-200 bg-red-50 text-red-700' :
                          'border-gray-200 bg-gray-50 text-gray-700'
                        )}
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}