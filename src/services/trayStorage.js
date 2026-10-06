const KEY = 'khaas_chai_tray_v1';
const EVENT = 'khaas-chai-tray-updated';

export function getTray() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function emit() {
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function addToTray(product, quantity = 1) {
  const tray = getTray();
  const id = String(product.productId);
  tray[id] = {
    productId: id,
    name: product.name,
    price: Number(product.price),
    quantity: Number(tray[id]?.quantity || 0) + Number(quantity)
  };
  localStorage.setItem(KEY, JSON.stringify(tray));
  emit();
  return tray[id];
}

export function setTrayQuantity(productId, quantity) {
  const tray = getTray();
  const id = String(productId);
  if (quantity <= 0) delete tray[id];
  else if (tray[id]) tray[id].quantity = Number(quantity);
  localStorage.setItem(KEY, JSON.stringify(tray));
  emit();
}

export function clearTray() {
  localStorage.removeItem(KEY);
  emit();
}

export function onTrayChange(callback) {
  const handler = () => callback(getTray());
  window.addEventListener(EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
