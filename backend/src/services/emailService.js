import 'dotenv/config';

const RESEND_API_URL = 'https://api.resend.com/emails';

export async function sendOrderEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from || !to) {
    console.warn('[email] skipped: missing RESEND_API_KEY, EMAIL_FROM, or recipient');
    return { sent: false, skipped: true };
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html })
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Email provider error ${response.status}: ${body}`);
  return { sent: true, data: JSON.parse(body) };
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

export function trackingUrl(order) {
  const base = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  return `${base}/order?track=${encodeURIComponent(order.tracking_token)}`;
}

export async function sendOrderConfirmation(order) {
  if (!order?.customer_email) return { sent: false, skipped: true };
  return sendOrderEmail({
    to: order.customer_email,
    subject: `Khaas Chai Order Confirmed — #${order.id}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#2b160b">
      <h1>Khaas Chai — Order Confirmed</h1>
      <p>Assalam-o-Alaikum ${escapeHtml(order.customer_name || 'Customer')},</p>
      <p>Your order has been received successfully.</p>
      <p><strong>Order:</strong> ${escapeHtml(order.id)}</p>
      <p><strong>Total:</strong> Rs ${Number(order.total_amount || 0).toLocaleString()}</p>
      <p><a href="${trackingUrl(order)}" style="display:inline-block;padding:12px 18px;background:#9c4328;color:#fff;text-decoration:none;border-radius:8px">Track My Order</a></p>
    </div>`
  });
}

export async function sendOrderStatusUpdate(order, previousStatus) {
  if (!order?.customer_email || order.order_status === previousStatus) return { sent: false, skipped: true };
  const status = String(order.order_status || '').replaceAll('_', ' ');
  return sendOrderEmail({
    to: order.customer_email,
    subject: `Khaas Chai Order Update — ${status}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto">
      <h2>Your Khaas Chai order is now ${escapeHtml(status)}.</h2>
      <p>Order: <strong>${escapeHtml(order.id)}</strong></p>
      <p><a href="${trackingUrl(order)}">View live order tracking</a></p>
    </div>`
  });
}

export async function sendPaymentSuccess(order) {
  if (!order?.customer_email) return { sent: false, skipped: true };
  return sendOrderEmail({
    to: order.customer_email,
    subject: `Payment Successful — Khaas Chai #${order.id}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto">
      <h2>Payment Successful ✓</h2>
      <p>We received your payment for order <strong>${escapeHtml(order.id)}</strong>.</p>
      <p>Total paid: <strong>Rs ${Number(order.total_amount || 0).toLocaleString()}</strong></p>
      <p><a href="${trackingUrl(order)}">Continue to live order tracking</a></p>
    </div>`
  });
}
