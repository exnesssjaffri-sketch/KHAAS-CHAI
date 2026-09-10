import { useState, useEffect } from 'react';
import { SectionContainer, Badge, Button, QuantityStepper, SweetnessSelector, ImageWithFallback } from '../components/UI';

const categories = [
  { id: 'chai', label: '☕ Signature Chai', icon: '' },
  { id: 'naashta', label: '🥟 Naashta & Snacks', icon: '' },
  { id: 'mithai', label: '🍯 Desi Mithai & Bakery', icon: '' },
  { id: 'dawat', label: '🎁 Khaas Dawat Boxes', icon: '' },
];

const menuItems = {
  chai: [
    {
      id: 1,
      name: 'Special Doodh Patti (Matka)',
      price: 250,
      description: 'Rich, creamy whole buffalo milk slow-simmered in clay handi with freshly crushed green cardamoms and caramelized raw sugar.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjQ8oBi0JkBT3H0vtnxSIPsUEFybua4QuBecRj3k13iCrJmfn_4jLOrzMpiM0HsZ8NV6F6YcEqvdzd123BcJ3Nz8HonTtd_cWkQy5ZprstJbc-jBHDrXk_804MrHt75YSxVY5QqpV_7H9aRUekDX6U01e354LEYuiogiesPgzEUO8ytsN4MfNUAehrvTZ9a_o3nwHZ0STyDfuf5HOmH1lr2YCT6h8KAfe5rct7jjbNHpcEiGFHqU5Dew',
      badge: 'Best Seller',
      hasSweetness: true,
      defaultSweetness: 'medium',
      defaultQuantity: 2,
      note: 'Extra malai on top',
    },
    {
      id: 2,
      name: 'Pink Kashmiri Noon Chai',
      price: 360,
      description: 'Velvety Himalayan pink tea aerated overnight with baking soda, rich malai, and a sprinkle of crushed pistachios & almonds.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKKMrbdF2J6_j4bgMwu2Wv70kagYQaEN4ImJHzRa14JMSBif2htPTa3ZVE9FkYjuSL3hO1FiSy40B-5wtkexkjlDTovpIJyitSap0yyrJi9R2P9xOGcB5ZVpsNY5N2Xdt-K50xWiOH22dSmw1Im_El_-oGv2B4Kc3pTPdguCroApGIFRPArLR9IIU9ldPA4RaDtlum36lgxbxbmvzdq5G9y-aYsZuVImk6UPZH1TITJK4RYFzFMikA3g',
      hasSweetness: false,
      defaultQuantity: 1,
      includes: 'Includes dry fruit topping',
    },
  ],
  naashta: [
    {
      id: 3,
      name: 'Crispy Samosa & Chutney Platter (3 pcs)',
      price: 220,
      description: 'Handmade cumin pastry crust filled with spiced potatoes, green peas, served with sweet imli & chilled mint chutney.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC20lFNMHC6PjBKXJspA2HfieTbHlYEBOAmTloFv71P7MeDW3846gDCYDet8XctawOed36Bu7naGv21H3bpAoEBCXHo2IPMgNMkwXURXeLiv3RfpemMEbkWgYT-LQlxtbTY1NzGgOHiKhRvHJ_qY3-kxe5sNAkur3tGeoQ4TxfaOIyFx03SpEEIu2ZjKJioOXKMgrT__h9380jcl1iSn1EKJ5UQAel0Epd2LxLEAr8VtS-ckAxO6ZOYiQ',
      hasSweetness: false,
      defaultQuantity: 1,
      includes: 'Fried fresh per order',
    },
  ],
  mithai: [
    {
      id: 4,
      name: 'Shahi Tukray with Rabri',
      price: 320,
      description: 'Crisp ghee-fried milk bread steeped in saffron-rose syrup, drenched in slow-reduced pistachio rabri.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2KN6BQL9o00UEDqXfFpdw8KNCs2WGpgPC1JWhXBCpTBCOcGJCd1FVChKAW7TdtO8giGN63xcuFqYDncFbjTlRC9WrOj7fjxVrunCWANOzZZ_rZLV7JSLTidWu3M8h5XKbEsTT7vyUKoc_l6R7Ui9qn7cAWGk_JKeMBDZNLS_g0QIjdbLNMlft9ZUiJP2GBXA2-4DfAeU2FR1v6Il2kEBieS5iiKt-rBIVTuxLel_fH8O31CeWlWVnVQ',
      hasSweetness: false,
      defaultQuantity: 1,
      includes: 'Warm • Serves 1-2',
    },
  ],
  dawat: [],
};

const paymentOptions = [
  { id: 'cod', label: 'Cash on Delivery (COD)', description: 'Pay exact cash to rider upon warm handoff', icon: '💵' },
  { id: 'pickup', label: 'Cash on Pickup', description: 'Settle at our Gulberg Baithak counter', icon: '🛍️' },
  { id: 'jazzcash', label: 'JazzCash', description: 'Instant mobile account / QR transfer', icon: '📱' },
  { id: 'easypaisa', label: 'Easypaisa', description: 'Quick wallet & OTP authorization', icon: '📲' },
  { id: 'bank', label: 'Bank Transfer / Raast', description: 'State Bank Raast ID instant settlement', icon: '🏦' },
];

export default function Order() {
  const [fulfillment, setFulfillment] = useState('delivery');
  const [activeCategory, setActiveCategory] = useState('chai');
  const [cart, setCart] = useState({
    1: { quantity: 2, sweetness: 'medium' },
    2: { quantity: 1 },
    3: { quantity: 1 },
  });
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [specialNotes, setSpecialNotes] = useState('');
  const [showToast, setShowToast] = useState(false);

  const getCartItems = () => {
    const items = [];
    const currentCategoryItems = menuItems[activeCategory] || [];
    Object.entries(cart).forEach(([id, data]) => {
      const item = [...menuItems.chai, ...menuItems.naashta, ...menuItems.mithai, ...menuItems.dawat].find(i => i.id === parseInt(id));
      if (item) items.push({ ...item, ...data });
    });
    return items;
  };

  const calculateTotals = () => {
    const items = getCartItems();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = fulfillment === 'delivery' && subtotal < 1500 ? 120 : 0;
    const packaging = items.length > 0 ? 50 : 0;
    const total = subtotal + deliveryFee + packaging;
    return { subtotal, deliveryFee, packaging, total, itemCount: items.length };
  };

  const handleQuantityChange = (id, newQuantity) => {
    setCart(prev => ({
      ...prev,
      [id]: { ...prev[id], quantity: newQuantity }
    }));
  };

  const handleSweetnessChange = (id, sweetness) => {
    setCart(prev => ({
      ...prev,
      [id]: { ...prev[id], sweetness }
    }));
  };

  const handleAddToCart = (item) => {
    setCart(prev => ({
      ...prev,
      [item.id]: { quantity: 1, sweetness: item.defaultSweetness || 'medium' }
    }));
  };

  const handleRemoveFromCart = (id) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const totals = calculateTotals();

  const triggerOrderSuccess = () => {
    if (totals.itemCount === 0) return;
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4500);
  };

  const formatPrice = (price) => `Rs ${price.toLocaleString()}`;

  return (
    <main className="flex-1 flex flex-col relative w-full pt-20 pb-28 bg-surface">
      <div className="flex flex-col w-full">
        {/* Top Header Sub-nav Banner */}
        <SectionContainer className="pt-space-xs pb-space-sm bg-gradient-to-b from-surface-container-low to-surface">
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>
                Freshly Simmered • Dawat Ready
              </span>
              <span className="font-label-sm text-label-sm text-primary font-medium tracking-wide">لاہور • گلبرگ</span>
            </div>
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">Order Khaas Chai Online</h1>
            <p className="text-body-sm font-body-sm text-secondary font-medium">آن لائن آرڈر • گرما گرم چائے اور خاص ضیافت</p>
          </div>
          <div className="mt-space-md p-1 bg-surface-container rounded-full flex items-center shadow-sm">
            <button
              onClick={() => setFulfillment('delivery')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full font-label-sm text-label-sm font-semibold transition-all duration-200 ${
                fulfillment === 'delivery'
                  ? 'bg-surface-container-lowest text-secondary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">moped</span>
              <span>Delivery (25-35m)</span>
            </button>
            <button
              onClick={() => setFulfillment('pickup')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full font-label-sm text-label-sm transition-all duration-200 ${
                fulfillment === 'pickup'
                  ? 'bg-surface-container-lowest text-secondary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              <span>Baithak Pickup (10-15m)</span>
            </button>
          </div>
          <div className="mt-space-xs flex items-center justify-between px-space-xs py-1.5 bg-surface-container-low rounded-lg text-on-surface-variant text-body-sm">
            <div className="flex items-center gap-1.5 text-primary">
              <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
              <span className="font-label-sm text-[11px] font-medium tracking-normal text-on-surface">Min. Order Rs 400</span>
            </div>
            <div className="flex items-center gap-1 text-secondary">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse inline-block"></span>
              <span className="font-label-sm text-[11px] font-semibold text-secondary">Clay Kettles Boiling Now</span>
            </div>
          </div>
        </SectionContainer>

        {/* Category Scroll Tabs */}
        <SectionContainer className="sticky top-20 z-30 bg-surface/95 backdrop-blur-md shadow-sm py-space-xs">
          <div className="flex items-center gap-2 overflow-x-auto px-margin-mobile no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`category-pill shrink-0 px-4 py-2 rounded-full font-label-sm text-label-sm transition-all ${
                  activeCategory === cat.id
                    ? 'active bg-secondary text-on-secondary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </SectionContainer>

        {/* Interactive Product Catalog */}
        <SectionContainer>
          <div className="flex flex-col gap-space-md">
            {(menuItems[activeCategory] || []).map((item) => (
              <article key={item.id} className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm relative overflow-hidden">
                {item.badge && (
                  <div className="absolute top-0 right-0 bg-secondary text-on-secondary font-label-sm text-[10px] px-3 py-1 rounded-bl-lg uppercase tracking-wider font-semibold">
                    {item.badge}
                  </div>
                )}
                <div className="flex gap-space-sm items-start">
                  <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-surface-container relative shadow-sm">
                    <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface leading-tight">{item.name}</h2>
                    </div>
                    <span className="font-label-sm text-label-sm text-secondary font-semibold mt-0.5 inline-block">{formatPrice(item.price)}</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">{item.description}</p>
                  </div>
                </div>
                {item.hasSweetness && (
                  <div className="bg-surface-container-low rounded-lg p-space-xs flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-semibold">Meetha (Sweetness):</span>
                      <span className="text-[11px] font-body-sm text-on-surface-variant">Customized for {cart[item.id]?.quantity || item.defaultQuantity} cups</span>
                    </div>
                    <SweetnessSelector
                      value={cart[item.id]?.sweetness || item.defaultSweetness}
                      onChange={(val) => handleSweetnessChange(item.id, val)}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  {item.includes && (
                    <span className="inline-flex items-center gap-1 font-label-sm text-[11px] text-primary bg-primary-fixed/40 px-2 py-0.5 rounded">
                      <span className="material-symbols-outlined text-[14px]">done</span> {item.includes}
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <QuantityStepper
                      value={cart[item.id]?.quantity || item.defaultQuantity}
                      onChange={(val) => handleQuantityChange(item.id, val)}
                    />
                    {cart[item.id] && (
                      <Button variant="secondary" size="sm" onClick={() => handleRemoveFromCart(item.id)}>
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                        <span>Remove</span>
                      </Button>
                    )}
                    {!cart[item.id] && (
                      <Button variant="primary" size="sm" onClick={() => handleAddToCart(item)}>
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        <span>Add to Tray</span>
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </SectionContainer>

        {/* Cart & Tray Summary Section */}
        {totals.itemCount > 0 && (
          <SectionContainer className="py-space-sm">
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between pb-space-xs border-b-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[18px]">table_restaurant</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Your Chai Dawat Tray</h3>
                    <span className="font-label-sm text-label-sm text-secondary font-semibold">{totals.itemCount} items selected</span>
                  </div>
                </div>
                <Badge variant="secondary">Ready in 25m</Badge>
              </div>
              <div className="flex flex-col gap-3">
                {getCartItems().map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-body-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded bg-surface-container text-on-surface-variant text-[11px] font-semibold flex items-center justify-center shrink-0">{item.quantity}x</span>
                      <div className="min-w-0">
                        <p className="font-label-lg text-label-lg text-on-surface truncate">{item.name}</p>
                        <p className="font-body-sm text-[12px] text-secondary">
                          {item.sweetness && `${item.sweetness === 'bina' ? 'Bina Cheeni' : item.sweetness === 'medium' ? 'Medium Meetha' : 'Tez Meetha'} • `}{item.note || ''}
                        </p>
                      </div>
                    </div>
                    <span className="font-label-sm text-label-sm font-semibold text-on-surface shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1.5" htmlFor="special-notes">
                  <span className="material-symbols-outlined text-[16px] text-secondary">notes</span>
                  Dawat Notes & Special Requests
                </label>
                <textarea
                  id="special-notes"
                  className="w-full bg-surface-container-low text-on-surface placeholder:text-outline text-body-sm rounded-lg p-space-xs focus:outline-none focus:bg-surface-container transition-colors resize-none"
                  placeholder="E.g., Please send extra clay kulhads, ring the bell gently, no plastic cutlery"
                  rows={2}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                />
              </div>
              <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-2">
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-semibold text-on-surface">{formatPrice(totals.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    Delivery Fee
                    <span className="text-[11px] text-primary font-medium">(Free over Rs 1,500)</span>
                  </span>
                  <span className="font-semibold text-on-surface">{formatPrice(totals.deliveryFee)}</span>
                </div>
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-on-surface-variant">Clay Thermos & Eco Packaging</span>
                  <span className="font-semibold text-on-surface">{formatPrice(totals.packaging)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 mt-1 bg-surface-container rounded-md p-2">
                  <span className="font-label-lg text-label-lg font-semibold text-on-surface">Total Amount</span>
                  <span className="font-headline-sm text-headline-sm font-bold text-secondary">{formatPrice(totals.total)}</span>
                </div>
              </div>
            </div>
          </SectionContainer>
        )}

        {/* Customer Checkout & Delivery Details */}
        <SectionContainer className="py-space-sm">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                <span className="material-symbols-outlined text-[18px]">pin_drop</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Delivery Details</h3>
                <p className="font-body-sm text-[12px] text-on-surface-variant">Where should we dispatch your hot chai?</p>
              </div>
            </div>
            <div className="flex flex-col gap-space-xs mt-1">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Your Name</label>
                <input className="w-full bg-surface-container-low text-on-surface rounded-lg px-3 py-2.5 text-body-md focus:outline-none focus:bg-surface-container transition-colors" placeholder="e.g. Bilal Ahmed" type="text" defaultValue="Bilal Ahmed" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Phone Number (For Rider Updates)</label>
                <div className="flex items-center bg-surface-container-low rounded-lg overflow-hidden focus-within:bg-surface-container transition-colors">
                  <div className="flex items-center gap-1 px-3 py-2.5 bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold shrink-0">
                    <span>🇵🇰</span>
                    <span>+92</span>
                  </div>
                  <input className="w-full bg-transparent text-on-surface px-3 py-2.5 text-body-md focus:outline-none" placeholder="0300-1234567" type="tel" defaultValue="0300-1234567" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Street & Baithak Address</label>
                <input className="w-full bg-surface-container-low text-on-surface rounded-lg px-3 py-2.5 text-body-md focus:outline-none focus:bg-surface-container transition-colors" placeholder="House #, Street, Gulberg III, Lahore" type="text" defaultValue="House 42-B, Street 7, Block L, Gulberg III, Lahore" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Nearest Landmark (Optional)</label>
                <input className="w-full bg-surface-container-low text-on-surface rounded-lg px-3 py-2 text-body-sm focus:outline-none focus:bg-surface-container transition-colors" placeholder="Near Mini Market roundabout / Green gate" type="text" />
              </div>
            </div>
          </div>
        </SectionContainer>

        {/* Payment Selection Section */}
        <SectionContainer className="py-space-sm">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Payment Method</h3>
                <p className="font-body-sm text-[12px] text-on-surface-variant">Select how you wish to settle the dawat</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-1" id="payment-group">
              {paymentOptions.map((option) => (
                <label
                  key={option.id}
                  className={`payment-card cursor-pointer flex items-center justify-between p-3 rounded-lg transition-all shadow-sm ${
                    selectedPayment === option.id
                      ? 'bg-surface-container shadow-sm'
                      : 'bg-surface-container-low hover:bg-surface-container'
                  }`}
                  onClick={() => setSelectedPayment(option.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{option.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-label-lg text-label-lg font-semibold text-on-surface">{option.label}</span>
                      <span className="text-body-sm text-[12px] text-on-surface-variant">{option.description}</span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center radio-check shrink-0 ${
                    selectedPayment === option.id
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-surface-container-highest text-transparent'
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </SectionContainer>

        {/* Trust & Heritage Guarantee Badges */}
        <SectionContainer className="py-space-xs mb-space-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-space-xs bg-surface-container-low rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <div className="flex flex-col">
                <span className="font-label-sm text-[11px] font-semibold text-on-surface">100% Halal & Pure</span>
                <span className="font-body-sm text-[10px] text-on-surface-variant">Farm fresh buffalo milk</span>
              </div>
            </div>
            <div className="p-space-xs bg-surface-container-low rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">recycling</span>
              <div className="flex flex-col">
                <span className="font-label-sm text-[11px] font-semibold text-on-surface">Eco Clay Kulhad</span>
                <span className="font-body-sm text-[10px] text-on-surface-variant">100% biodegradable</span>
              </div>
            </div>
          </div>
        </SectionContainer>

        {/* Sticky Prominent Place Order Banner */}
        {totals.itemCount > 0 && (
          <SectionContainer className="sticky bottom-20 z-40 bg-surface/95 backdrop-blur-xl p-margin-mobile shadow-[0_-8px_20px_-4px_rgba(59,36,24,0.08)]">
            <div className="max-w-lg mx-auto flex flex-col gap-2">
              <div className="flex items-center justify-center gap-1.5 text-secondary font-label-sm text-[11px] font-medium tracking-wide">
                <span className="material-symbols-outlined text-[15px] animate-bounce">local_fire_department</span>
                <span>Hot & Fresh Guarantee in Clay Sealed Thermos</span>
              </div>
              <Button variant="primary" fullWidth size="lg" onClick={triggerOrderSuccess}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">emoji_food_beverage</span>
                  <span>Place Order</span>
                </div>
                <span className="font-headline-sm text-headline-sm tracking-tight">{formatPrice(totals.total)} • 25m</span>
              </Button>
            </div>
          </SectionContainer>
        )}

        {/* Success Toast Modal */}
        {showToast && (
          <div className="fixed inset-x-4 top-24 z-50 transform translate-y-0 opacity-100 transition-all duration-300">
            <div className="max-w-md mx-auto bg-primary text-on-primary rounded-xl p-space-md shadow-xl flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">soup_kitchen</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-headline-sm text-[18px] text-on-primary font-semibold">Chai Dawat Received!</h4>
                <p className="font-body-sm text-[12px] text-inverse-on-surface">Order #KC-8942 is now bubbling on the stove.</p>
              </div>
              <button className="text-on-primary/80 hover:text-on-primary p-1" onClick={() => setShowToast(false)}>
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}