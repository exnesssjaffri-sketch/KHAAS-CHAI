// Admin Dashboard Page
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../services/api';
import { useOrdersRealtime } from '../hooks/useSupabaseSubscription';
import { SectionContainer, Card, Badge, Button, LoadingSpinner } from '../components/UI';

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesChart, setSalesChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [chartPeriod, setChartPeriod] = useState('daily');

  // Realtime subscription for new orders
  useOrdersRealtime(
    null, // Admin sees all orders
    (newOrder) => {
      setRecentOrders(prev => [newOrder, ...prev.slice(0, 9)]);
      // Update stats
      setStats(prev => prev ? {
        ...prev,
        total_orders: prev.total_orders + 1,
        pending_orders: prev.pending_orders + 1,
        total_revenue: prev.total_revenue + (newOrder.payment_status === 'paid' ? newOrder.total_amount : 0)
      } : null);
    },
    (updatedOrder) => {
      setRecentOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    }
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, productsRes, chartRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getRecentOrders(10),
        adminApi.getTopProducts(5),
        adminApi.getSalesChart(chartPeriod)
      ]);
      
      setStats(statsRes);
      setRecentOrders(ordersRes);
      setTopProducts(productsRes);
      setSalesChart(chartRes);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, chartPeriod]);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="font-headline-sm text-on-surface mb-2">Admin Access Required</h2>
          <p className="text-on-surface-variant">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'orders', label: 'Orders', icon: 'receipt_long' },
    { id: 'products', label: 'Products', icon: 'inventory_2' },
    { id: 'users', label: 'Users', icon: 'people' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
  ];

  return (
    <div className="px-margin-mobile py-space-md">
      <div className="flex items-center justify-between mb-space-lg">
        <div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Admin Dashboard</h1>
          <p className="font-body-sm text-on-surface-variant">Manage your Khaas Chai business</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={chartPeriod}
            onChange={(e) => setChartPeriod(e.target.value)}
            className="px-3 py-2 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant text-sm"
          >
            <option value="daily">Daily (30 days)</option>
            <option value="weekly">Weekly (12 weeks)</option>
            <option value="monthly">Monthly (12 months)</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-space-md p-3 rounded-lg bg-error-container text-on-error-container text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-lg">
            <Card className="bg-primary-fixed/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant">Total Orders</p>
                  <p className="font-headline-sm text-on-surface">{stats?.total_orders || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-secondary-fixed/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">pending_actions</span>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant">Pending</p>
                  <p className="font-headline-sm text-on-surface">{stats?.pending_orders || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-primary-container/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">attach_money</span>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant">Monthly Revenue</p>
                  <p className="font-headline-sm text-on-surface">Rs {(stats?.monthly_revenue || 0).toLocaleString()}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-tertiary-fixed/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">people</span>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant">Customers</p>
                  <p className="font-headline-sm text-on-surface">{stats?.total_customers || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto gap-1 mb-space-md -mx-margin-mobile px-margin-mobile no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-label-sm text-label-sm shrink-0 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-secondary text-on-secondary shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
              <Card>
                <h3 className="font-headline-sm text-on-surface mb-space-md">Recent Orders</h3>
                <div className="space-y-2">
                  {recentOrders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-2 bg-surface-container-low rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-secondary text-[20px]">receipt_long</span>
                        </div>
                        <div>
                          <p className="font-label-sm text-on-surface">#{order.id.slice(0, 8)}</p>
                          <p className="text-[12px] text-on-surface-variant">{order.profiles?.name || 'Customer'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-label-sm text-on-surface">Rs {order.total_amount.toLocaleString()}</p>
                        <Badge variant={order.order_status === 'pending' ? 'secondary' : order.order_status === 'delivered' ? 'primary' : 'default'} className="text-[10px]">
                          {order.order_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" fullWidth className="mt-3" onClick={() => setActiveTab('orders')}>
                  View All Orders
                </Button>
              </Card>

              <Card>
                <h3 className="font-headline-sm text-on-surface mb-space-md">Top Products</h3>
                <div className="space-y-2">
                  {topProducts.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-2 bg-surface-container-low rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-label-sm text-on-surface truncate max-w-[200px]">{product.name}</p>
                          <p className="text-[12px] text-on-surface-variant">{product.total_sold} sold</p>
                        </div>
                      </div>
                      <p className="font-label-sm text-secondary">Rs {product.total_revenue?.toLocaleString() || 0}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'orders' && (
            <Card>
              <h3 className="font-headline-sm text-on-surface mb-space-md">All Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-on-surface-variant border-b border-outline-variant">
                      <th className="pb-2 font-label-sm">Order ID</th>
                      <th className="pb-2 font-label-sm">Customer</th>
                      <th className="pb-2 font-label-sm">Amount</th>
                      <th className="pb-2 font-label-sm">Payment</th>
                      <th className="pb-2 font-label-sm">Status</th>
                      <th className="pb-2 font-label-sm">Date</th>
                      <th className="pb-2 font-label-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id} className="border-b border-outline-variant/50">
                        <td className="py-2 font-mono text-[11px]">#{order.id.slice(0, 8)}</td>
                        <td className="py-2">{order.profiles?.name || 'Unknown'}</td>
                        <td className="py-2">Rs {order.total_amount.toLocaleString()}</td>
                        <td className="py-2">
                          <Badge variant={order.payment_status === 'paid' ? 'primary' : 'secondary'} className="text-[10px]">
                            {order.payment_status}
                          </Badge>
                        </td>
                        <td className="py-2">
                          <Badge variant={order.order_status === 'pending' ? 'secondary' : order.order_status === 'delivered' ? 'primary' : order.order_status === 'cancelled' ? 'default' : 'tertiary'} className="text-[10px]">
                            {order.order_status}
                          </Badge>
                        </td>
                        <td className="py-2 text-[12px] text-on-surface-variant">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-2">
                          <select
                            value={order.order_status}
                            onChange={(e) => adminApi.updateStatus(order.id, { order_status: e.target.value })}
                            className="px-2 py-1 text-[11px] bg-surface-container-low text-on-surface border border-outline-variant rounded"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === 'analytics' && (
            <Card>
              <h3 className="font-headline-sm text-on-surface mb-space-md">Sales Chart ({chartPeriod})</h3>
              <div className="h-64 flex items-end gap-2 px-2 pb-4">
                {salesChart.map((point, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-secondary rounded-t transition-all hover:bg-primary"
                      style={{ height: `${Math.max(4, (point.revenue / (Math.max(...salesChart.map(p => p.revenue), 1)) * 100))}%` }}
                    />
                    <span className="text-[10px] text-on-surface-variant mt-1">{point.period}</span>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-on-surface-variant text-center">
                Total Revenue: Rs {salesChart.reduce((sum, p) => sum + (p.revenue || 0), 0).toLocaleString()}
              </p>
            </Card>
          )}

          {activeTab === 'users' && (
            <Card>
              <h3 className="font-headline-sm text-on-surface mb-space-md">User Management</h3>
              <div className="space-y-2">
                {/* Users would be fetched here */}
                <p className="text-on-surface-variant text-center py-8">User management coming soon</p>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}