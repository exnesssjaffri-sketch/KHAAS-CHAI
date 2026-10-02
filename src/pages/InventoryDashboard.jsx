// Inventory Dashboard Page
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { inventoryApi, productsApi } from '../services/api';
import { useInventoryRealtime } from '../hooks/useSupabaseSubscription';
import { SectionContainer, Card, Badge, Button, LoadingSpinner, QuantityStepper } from '../components/UI';

export default function InventoryDashboard() {
  const { isStaff } = useAuth();
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState(0);

  // Realtime subscription for inventory changes
  useInventoryRealtime(
    (newLog) => {
      setLogs(prev => [newLog, ...prev.slice(0, 49)]);
    },
    (updatedLog) => {
      setLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
    }
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, lowRes, logsRes] = await Promise.all([
        inventoryApi.list(),
        inventoryApi.getLowStock(),
        inventoryApi.getLogs({ limit: 50 })
      ]);
      
      setProducts(invRes);
      setLowStock(lowRes);
      setLogs(logsRes);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStaff) fetchData();
  }, [isStaff]);

  const handleUpdateStock = async (productId, newQuantity) => {
    try {
      await inventoryApi.updateStock({ product_id: productId, change_amount: newQuantity, reason: 'Manual stock adjustment' });
      setEditingId(null);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRestock = async (productId, quantity) => {
    try {
      await inventoryApi.restock({ product_id: productId, change_amount: quantity, reason: 'Restock' });
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isStaff) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="font-headline-sm text-on-surface mb-2">Staff Access Required</h2>
          <p className="text-on-surface-variant">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'inventory', label: 'Inventory', icon: 'inventory_2' },
    { id: 'low-stock', label: 'Low Stock', icon: 'warning' },
    { id: 'logs', label: 'Stock Logs', icon: 'history' },
  ];

  return (
    <div className="px-margin-mobile py-space-md">
      <div className="flex items-center justify-between mb-space-lg">
        <div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Inventory Dashboard</h1>
          <p className="font-body-sm text-on-surface-variant">Manage stock levels and track inventory</p>
        </div>
        <Button variant="primary" onClick={fetchData} disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : 'Refresh'}
        </Button>
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
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-lg">
            <Card className="bg-primary-fixed/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">inventory_2</span>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant">Total Products</p>
                  <p className="font-headline-sm text-on-surface">{products.length}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-secondary-fixed/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">warning</span>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant">Low Stock</p>
                  <p className="font-headline-sm text-on-surface">{lowStock.length}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-tertiary-fixed/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">add_box</span>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant">Total Stock</p>
                  <p className="font-headline-sm text-on-surface">{products.reduce((sum, p) => sum + p.stock_quantity, 0)}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-primary-container/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">history</span>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant">Recent Logs</p>
                  <p className="font-headline-sm text-on-surface">{logs.length}</p>
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
                {tab.id === 'low-stock' && lowStock.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary text-[10px] flex items-center justify-center">
                    {lowStock.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'inventory' && (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-on-surface-variant border-b border-outline-variant">
                      <th className="pb-2 font-label-sm">Product</th>
                      <th className="pb-2 font-label-sm">Category</th>
                      <th className="pb-2 font-label-sm">Price</th>
                      <th className="pb-2 font-label-sm">Stock</th>
                      <th className="pb-2 font-label-sm">Threshold</th>
                      <th className="pb-2 font-label-sm">Status</th>
                      <th className="pb-2 font-label-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="border-b border-outline-variant/50">
                        <td className="py-3">
                          <p className="font-label-sm text-on-surface">{product.name}</p>
                          <p className="text-[12px] text-on-surface-variant">ID: {product.id.slice(0, 8)}</p>
                        </td>
                        <td className="py-3">{product.categories?.name || 'Uncategorized'}</td>
                        <td className="py-3">Rs {product.price}</td>
                        <td className="py-3">
                          {editingId === product.id ? (
                            <QuantityStepper
                              value={editQuantity}
                              onChange={setEditQuantity}
                            />
                          ) : (
                            <span className={`font-label-sm ${product.stock_quantity <= product.low_stock_threshold ? 'text-secondary' : 'text-on-surface'}`}>
                              {product.stock_quantity}
                            </span>
                          )}
                        </td>
                        <td className="py-3">{product.low_stock_threshold}</td>
                        <td className="py-3">
                          <Badge variant={product.stock_quantity === 0 ? 'default' : product.stock_quantity <= product.low_stock_threshold ? 'secondary' : 'primary'} className="text-[10px]">
                            {product.stock_quantity === 0 ? 'Out of Stock' : product.stock_quantity <= product.low_stock_threshold ? 'Low Stock' : 'In Stock'}
                          </Badge>
                        </td>
                        <td className="py-3">
                          {editingId === product.id ? (
                            <div className="flex gap-1">
                              <Button variant="primary" size="sm" onClick={() => handleUpdateStock(product.id, editQuantity)}>
                                Save
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" onClick={() => { setEditQuantity(product.stock_quantity); setEditingId(product.id); }}>
                                Edit
                              </Button>
                              <Button variant="secondary" size="sm" onClick={() => handleRestock(product.id, 10)}>
                                +10
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === 'low-stock' && (
            <Card>
              {lowStock.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-[64px] text-primary">check_circle</span>
                  <h3 className="font-headline-sm text-on-surface mt-2">All Stocked Up!</h3>
                  <p className="text-on-surface-variant mt-1">No products are below their low stock threshold.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {lowStock.map(product => (
                    <div key={product.id} className="p-3 bg-surface-container-low rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-secondary text-[24px]">warning</span>
                        </div>
                        <div>
                          <p className="font-label-sm text-on-surface">{product.name}</p>
                          <p className="text-[12px] text-on-surface-variant">{product.categories?.name || 'Uncategorized'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-label-sm text-secondary">{product.stock_quantity} / {product.low_stock_threshold}</p>
                          <p className="text-[11px] text-on-surface-variant">Remaining</p>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => handleRestock(product.id, product.low_stock_threshold * 2)}>
                          Restock
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {activeTab === 'logs' && (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-on-surface-variant border-b border-outline-variant">
                      <th className="pb-2 font-label-sm">Product</th>
                      <th className="pb-2 font-label-sm">Change</th>
                      <th className="pb-2 font-label-sm">Reason</th>
                      <th className="pb-2 font-label-sm">Changed By</th>
                      <th className="pb-2 font-label-sm">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id} className="border-b border-outline-variant/50">
                        <td className="py-2">{log.products?.name || 'Unknown'}</td>
                        <td className="py-2">
                          <span className={`font-label-sm ${log.change_amount > 0 ? 'text-primary' : 'text-secondary'}`}>
                            {log.change_amount > 0 ? '+' : ''}{log.change_amount}
                          </span>
                        </td>
                        <td className="py-2 text-on-surface-variant max-w-[200px] truncate">{log.reason}</td>
                        <td className="py-2 text-on-surface-variant">{log.profiles?.name || 'System'}</td>
                        <td className="py-2 text-[12px] text-on-surface-variant">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}