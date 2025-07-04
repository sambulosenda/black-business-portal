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
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchAnalytics} variant="outline">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.revenue.thisMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className={cn(
                "inline-flex items-center",
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.bookings.total}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.bookings.upcoming} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.bookings.completed}</div>
            <p className="text-xs text-muted-foreground">
              {((analytics.bookings.completed / analytics.bookings.total) * 100).toFixed(0)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.revenue.thisWeek.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Weekly revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Breakdown</TabsTrigger>
          <TabsTrigger value="services">Top Services</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>

        {/* Revenue Breakdown Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>
                Understanding your revenue after fees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Gross Revenue</p>
                    <p className="text-2xl font-bold">${analytics.revenue.thisMonthGross.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-sm">Platform Fee (15%)</span>
                    </div>
                    <span className="text-sm font-medium text-yellow-600">
                      -${analytics.revenue.thisMonthPlatformFees.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm">Stripe Processing</span>
                    </div>
                    <span className="text-sm font-medium text-red-600">
                      -${analytics.revenue.thisMonthStripeFees.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="border-t pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm font-medium">Net Revenue</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        ${analytics.revenue.thisMonth.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visual bar representation */}
                <div className="mt-6">
                  <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
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
          <Card>
            <CardHeader>
              <CardTitle>Top Services</CardTitle>
              <CardDescription>
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
                          <p className="text-sm font-medium">{service.serviceName}</p>
                          <p className="text-xs text-muted-foreground">
                            {service.bookingCount} bookings
                          </p>
                        </div>
                        <span className="text-sm font-bold">${service.revenue.toFixed(2)}</span>
                      </div>
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
                            index === 0 ? "bg-primary" : 
                            index === 1 ? "bg-blue-500" : 
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
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest bookings and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{transaction.customerName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{transaction.serviceName}</span>
                        <span>•</span>
                        <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${transaction.amount.toFixed(2)}</p>
                      <Badge 
                        variant={
                          transaction.status === 'COMPLETED' ? 'success' :
                          transaction.status === 'CONFIRMED' ? 'default' :
                          transaction.status === 'CANCELLED' ? 'destructive' :
                          'secondary'
                        }
                        className="text-xs"
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