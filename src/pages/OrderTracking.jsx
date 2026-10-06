import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ordersApi } from '../services/api';

const STEPS = [
  ['pending', 'Order Received', 'receipt_long'],
  ['confirmed', 'Confirmed & Preparing', 'soup_kitchen'],
  ['shipped', 'Out for Delivery', 'delivery_dining'],
  ['delivered', 'Delivered', 'check_circle']
];

export default function OrderTracking({ token }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const trackingToken = token || new URLSearchParams(window.location.search).get('track');
    if (!trackingToken) { setError('Tracking link is missing.'); return; }

    let channel;
    let pollTimer;
    let active = true;

    const load = async () => {
      try {
        const result = await ordersApi.track(trackingToken);
        if (active) setOrder(result.data);
      } catch (e) {
        if (active) setError(e?.response?.data?.message || e.message || 'Unable to load tracking.');
        return;
      }

      pollTimer = setInterval(async () => {
        try {
          const fresh = await ordersApi.track(trackingToken);
          if (active) setOrder(fresh.data);
        } catch { /* Realtime/polling errors are non-fatal */ }
      }, 5000);

      channel = supabase.channel(`order-tracking-${trackingToken}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `tracking_token=eq.${trackingToken}`
        }, payload => active && setOrder(payload.new))
        .subscribe(status => active && setLive(status === 'SUBSCRIBED'));
    };

    load();
    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [token]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (error) return <main className="min-h-screen bg-surface p-5"><div className="mx-auto max-w-lg rounded-2xl bg-error-container p-5 text-on-error-container">{error}</div></main>;
  if (!order) return <main className="min-h-screen bg-surface p-5"><div className="mx-auto max-w-lg rounded-2xl bg-surface-container-lowest p-6 text-center">Loading live order tracking…</div></main>;

  const serverIndex = STEPS.findIndex(([key]) => key === order.order_status);
  const elapsedMs = Math.max(0, now - new Date(order.created_at).getTime());
  const stageDurationMs = 90 * 1000;
  const automaticIndex = Math.min(STEPS.length - 1, Math.floor(elapsedMs / stageDurationMs));
  const current = order.order_status === 'cancelled' ? serverIndex : Math.max(serverIndex, automaticIndex);

  return (
    <main className="min-h-screen bg-surface px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-surface-container-lowest p-5 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Khaas Chai</p>
            <h1 className="mt-1 text-2xl font-semibold text-on-surface">Live Order Tracking</h1>
            <p className="mt-1 break-all text-xs text-on-surface-variant">Order #{order.id}</p>
          </div>
          <span className="rounded-full bg-primary-fixed px-3 py-1 text-xs font-semibold">{live ? 'LIVE' : 'Connecting…'}</span>
        </div>
        <div className="mb-4 rounded-xl bg-surface-container p-3 text-xs text-on-surface-variant">
          <div className="flex items-center justify-between gap-3">
            <span>Order timeline</span>
            <span className="font-semibold text-secondary">Automatic updates</span>
          </div>
        </div>
        <div className="space-y-3">
          {STEPS.map(([key, label, icon], index) => {
            const done = current >= index;
            const active = current === index && order.order_status !== 'cancelled';
            return <div key={key} className={`flex items-center gap-3 rounded-xl p-3 transition-all duration-700 ${done ? 'bg-primary-fixed/50' : 'bg-surface-container-low'} ${active ? 'ring-2 ring-secondary/20 shadow-sm scale-[1.01]' : ''}`}>
              <span className={`material-symbols-outlined transition-transform duration-700 ${active ? 'scale-125 animate-pulse text-secondary' : ''}`}>{icon}</span>
              <span className={done ? 'font-semibold' : 'text-on-surface-variant'}>{label}</span>
              {active && <span className="ml-auto rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-on-secondary animate-pulse">IN PROGRESS</span>}
              {done && !active && <span className="ml-auto material-symbols-outlined text-primary">check_circle</span>}
            </div>;
          })}
        </div>
        <p className="mt-3 text-[11px] leading-5 text-on-surface-variant">
          The visual timeline advances every 90 seconds from order receipt and persists across refreshes. Real staff/admin status updates take priority.
        </p>
        {order.order_status === 'cancelled' && <div className="mt-4 rounded-xl bg-error-container p-4 text-on-error-container">This order has been cancelled.</div>}
        <div className="mt-6 flex justify-between border-t border-outline-variant pt-4">
          <span className="text-on-surface-variant">Total</span>
          <strong>Rs {Number(order.total_amount || 0).toLocaleString()}</strong>
        </div>
      </div>
    </main>
  );
}
