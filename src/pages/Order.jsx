import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Badge, QuantityStepper, ImageWithFallback } from '../components/UI';
import { useSearchParams } from 'react-router-dom';
import { ordersApi, productsApi } from '../services/api';
import { addToTray, getTray, setTrayQuantity, clearTray, onTrayChange } from '../services/trayStorage';

const categories = [['chai','☕ Signature Chai'],['naashta','🥟 Naashta & Snacks'],['mithai','🍯 Desi Mithai & Bakery'],['dawat','🎁 Khaas Dawat Boxes']];
const payments = [['cod','Cash on Delivery','💵'],['pickup','Cash on Pickup','🛍️'],['jazzcash','JazzCash','📱'],['easypaisa','Easypaisa','📲'],['bank_transfer','Bank Transfer / Raast','🏦']];
const categoryMap = {'signature-chai':'chai','naashta-snacks':'naashta','desi-mithai-bakery':'mithai','khaas-dawat-boxes':'dawat'};

export default function Order() {
  const [searchParams] = useSearchParams();
  const trayRef = useRef(null);
  const [trayHighlight,setTrayHighlight]=useState(false);
  const [products,setProducts]=useState([]),[category,setCategory]=useState('chai'),[cart,setCart]=useState({});
  const [fulfillment,setFulfillment]=useState('delivery'),[payment,setPayment]=useState('cod');
  const [name,setName]=useState(''),[email,setEmail]=useState(''),[phone,setPhone]=useState(''),[address,setAddress]=useState(''),[landmark,setLandmark]=useState(''),[notes,setNotes]=useState('');
  const [error,setError]=useState(''),[placing,setPlacing]=useState(false),[success,setSuccess]=useState(null),[trayMessage,setTrayMessage]=useState('');
  useEffect(()=>{
    const sync=tray=>setCart(tray);
    sync(getTray());
    return onTrayChange(sync);
  },[]);

  useEffect(()=>{let cancelled=false;productsApi.list({limit:100}).then(r=>{if(!cancelled)setProducts(r?.data||[])}).catch(e=>{if(!cancelled)setError(e?.message||'Menu could not be loaded.')});return()=>{cancelled=true}},[]);
  useEffect(()=>{if(searchParams.get('tray')!=='1')return;const timer=window.setTimeout(()=>{trayRef.current?.scrollIntoView({behavior:'smooth',block:'center'});setTrayHighlight(true);window.setTimeout(()=>setTrayHighlight(false),1400)},180);return()=>window.clearTimeout(timer)},[searchParams]);
  const visible=useMemo(()=>products.filter(p=>categoryMap[p.categories?.slug]===category),[products,category]);
  const items=useMemo(()=>Object.entries(cart).filter(([,entry])=>Number(entry?.quantity)>0).map(([id,entry])=>{const product=products.find(p=>String(p.id)===String(id));return {...(product||{}),id,name:product?.name||entry.name||'Khaas Chai item',price:product?.price??entry.price??0,quantity:Number(entry.quantity)||1}}),[cart,products]);
  const itemCount=useMemo(()=>items.reduce((sum,item)=>sum+Number(item.quantity||0),0),[items]);
  const totals=useMemo(()=>{const subtotal=items.reduce((s,i)=>s+Number(i.price)*i.quantity,0);const delivery=fulfillment==='delivery'&&subtotal<1500&&subtotal>0?120:0;const packaging=items.length?50:0;return{subtotal,delivery,packaging,total:subtotal+delivery+packaging}},[items,fulfillment]);
  const setQty=(id,q)=>{
    if (!getTray()[id] && q > 0) {
      const p=products.find(item=>String(item.id)===String(id));
      if (p) addToTray({productId:p.id,name:p.name,price:p.price},q);
    } else {
      setTrayQuantity(id,q);
    }
  };
  const addProduct=(product)=>{
    addToTray({productId:product.id,name:product.name,price:product.price},1);
    setTrayMessage(`${product.name} added to your tray`);
    window.clearTimeout(window.__orderTrayToastTimer);
    window.__orderTrayToastTimer=window.setTimeout(()=>setTrayMessage(''),1800);
  };

  const placeOrder=async()=>{
    setError('');
    if(!items.length)return setError('Please add at least one item.');
    if(totals.subtotal<400)return setError('Minimum order amount is Rs 400.');
    if(!name.trim())return setError('Please enter your name.');
    if(!email.trim())return setError('Please enter your email for order confirmation and live tracking.');
    if(!phone.trim())return setError('Please enter your phone number.');
    if(fulfillment==='delivery'&&!address.trim())return setError('Please enter your delivery address.');
    setPlacing(true);
    try{
      const result=await ordersApi.place({
        user_id:null,
        items:items.map(i=>({product_id:i.id,quantity:i.quantity})),
        total_amount:totals.total,
        subtotal:totals.subtotal,
        delivery_fee:totals.delivery,
        packaging_fee:totals.packaging,
        shipping_address:{
          name:name.trim(),
          phone:phone.trim(),
          street:fulfillment==='delivery' ? address.trim() : 'Pickup',
          city:'Lahore',
          landmark:landmark.trim()||undefined,
          fulfillment
        },
        payment_method:payment,
        special_notes:notes.trim()||undefined,
        customer_name:name.trim(),
        customer_email:email.trim(),
        customer_phone:phone.trim()
      });
      const order=result.data;setSuccess({id:order.id,token:order.tracking_token,total:result.data.breakdown?.total??order.total_amount});clearTray();setCart({});setNotes('');
    }catch(e){setError(e?.response?.data?.message||e?.message||'Order could not be placed.')}finally{setPlacing(false)}
  };

  if(success){const tracking=`${window.location.origin}/order/tracking?track=${encodeURIComponent(success.token)}`;return <main className="min-h-screen bg-surface px-4 py-8 sm:px-6"><div className="mx-auto max-w-xl rounded-2xl bg-surface-container-lowest p-6 text-center shadow-sm sm:p-10"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-primary"><span className="material-symbols-outlined text-4xl">check_circle</span></div><p className="text-xs font-semibold uppercase tracking-wider text-secondary">Khaas Chai</p><h1 className="mt-2 text-3xl font-semibold">Order Confirmed</h1><p className="mt-2 text-sm text-on-surface-variant">Order #<span className="break-all">{success.id}</span> received.</p><div className="my-6 rounded-xl bg-surface-container-low p-4"><p className="text-sm text-on-surface-variant">Total</p><p className="text-2xl font-bold text-secondary">Rs {Number(success.total).toLocaleString()}</p></div><div className="grid gap-3 sm:grid-cols-2"><a href={tracking} className="inline-flex min-h-12 items-center justify-center rounded-full bg-secondary px-5 font-semibold text-on-secondary">Track Live Order</a><button onClick={()=>setSuccess(null)} className="min-h-12 rounded-full border border-outline-variant bg-surface-container-low px-5 font-semibold">Place Another</button></div><p className="mt-5 text-xs text-on-surface-variant">Confirmation and tracking link will be emailed to {email} when email automation is configured.</p></div></main>}

  return <main className="min-h-screen bg-surface pb-32"><section className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
    <div className="rounded-2xl bg-surface-container-low p-4 sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-secondary">Freshly simmered • Lahore</p><h1 className="mt-1 text-3xl font-semibold sm:text-4xl">Order Khaas Chai</h1><p className="mt-1 text-sm text-on-surface-variant">Hot chai, snacks and mithai delivered to your door.</p></div><Badge variant="secondary">{itemCount} items • Rs {totals.total.toLocaleString()}</Badge></div><div className="mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">{categories.map(([id,label])=><button key={id} onClick={()=>setCategory(id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${category===id?'bg-secondary text-on-secondary':'bg-surface-container text-on-surface-variant'}`}>{label}</button>)}</div></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_380px]"><section className="space-y-3">{visible.map(item=><article key={item.id} className="flex gap-3 rounded-2xl bg-surface-container-lowest p-3 shadow-sm sm:gap-4 sm:p-4"><div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-container sm:h-28 sm:w-28"><ImageWithFallback src={item.images?.[0]||''} alt={item.name} className="h-full w-full object-cover"/></div><div className="min-w-0 flex-1"><div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"><h2 className="text-lg font-semibold leading-tight">{item.name}</h2><span className="shrink-0 font-semibold text-secondary">Rs {Number(item.price).toLocaleString()}</span></div><p className="mt-1 line-clamp-2 text-xs leading-5 text-on-surface-variant">{item.description}</p><div className="mt-3 flex justify-end">{cart[item.id]?<QuantityStepper value={cart[item.id].quantity} onChange={q=>setQty(item.id,q)}/>:<Button size="sm" onClick={()=>addProduct(item)}><span className="material-symbols-outlined text-base">add</span>Add to Tray</Button>}</div></div></article>)}{!visible.length&&<div className="rounded-2xl bg-surface-container-lowest p-8 text-center text-sm text-on-surface-variant">No items available in this category.</div>}</section>
    <aside className="h-fit lg:sticky lg:top-24"><div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm sm:p-5"><div className="flex gap-2 rounded-xl bg-surface-container p-1">{['delivery','pickup'].map(mode=><button key={mode} onClick={()=>setFulfillment(mode)} className={`flex-1 rounded-lg px-2 py-2 text-sm font-semibold ${fulfillment===mode?'bg-surface-container-lowest text-secondary shadow-sm':'text-on-surface-variant'}`}>{mode==='delivery'?'Delivery':'Pickup'}</button>)}</div>
    <div ref={trayRef} id="tray-summary" className={`mt-5 space-y-2 rounded-2xl transition-all duration-500 ${trayHighlight ? 'bg-primary-fixed/60 p-3 -m-3 shadow-[0_0_0_3px_rgba(156,67,40,0.14)] animate-pulse' : ''}`}><h2 className="text-lg font-semibold">Your Tray</h2>
      {items.length ? <div className="mb-4 space-y-2 rounded-xl bg-surface-container p-3">{items.map(item=><div key={item.id} className="flex items-center justify-between gap-2 text-sm"><div className="min-w-0"><p className="truncate font-semibold">{item.name}</p><p className="text-xs text-on-surface-variant">Rs {Number(item.price).toLocaleString()} × {item.quantity}</p></div><QuantityStepper value={item.quantity} onChange={q=>setQty(item.id,q)}/></div>)}</div> : <div className="mb-4 rounded-xl bg-surface-container-low p-3 text-xs text-on-surface-variant">Your tray is empty. Add items from the menu above.</div>}
      <h2 className="text-lg font-semibold">Your Details</h2><input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full rounded-xl bg-surface-container-low px-3 py-3 text-sm outline-none"/><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email for confirmation + tracking" type="email" className="w-full rounded-xl bg-surface-container-low px-3 py-3 text-sm outline-none"/><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone number" type="tel" className="w-full rounded-xl bg-surface-container-low px-3 py-3 text-sm outline-none"/><input value={address} onChange={e=>setAddress(e.target.value)} placeholder={fulfillment==='delivery'?'House / street / area':'Pickup notes (optional)'} className="w-full rounded-xl bg-surface-container-low px-3 py-3 text-sm outline-none"/><input value={landmark} onChange={e=>setLandmark(e.target.value)} placeholder="Landmark (optional)" className="w-full rounded-xl bg-surface-container-low px-3 py-3 text-sm outline-none"/><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Special notes (optional)" rows="2" className="w-full resize-none rounded-xl bg-surface-container-low px-3 py-3 text-sm outline-none"/></div>
    <div className="mt-5"><h2 className="mb-2 text-lg font-semibold">Payment</h2><div className="space-y-2">{payments.map(([id,label,icon])=><button key={id} onClick={()=>setPayment(id)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left ${payment===id?'bg-surface-container':'bg-surface-container-low'}`}><span className="text-xl">{icon}</span><span className="text-sm font-semibold">{label}</span><span className={`ml-auto h-5 w-5 rounded-full ${payment===id?'bg-secondary':'bg-surface-container-highest'}`}/></button>)}</div></div>
    <div className="mt-5 space-y-2 border-t border-outline-variant pt-4 text-sm"><div className="flex justify-between"><span className="text-on-surface-variant">Subtotal</span><span>Rs {totals.subtotal.toLocaleString()}</span></div><div className="flex justify-between"><span className="text-on-surface-variant">Delivery</span><span>Rs {totals.delivery.toLocaleString()}</span></div><div className="flex justify-between"><span className="text-on-surface-variant">Packaging</span><span>Rs {totals.packaging.toLocaleString()}</span></div><div className="flex justify-between rounded-xl bg-surface-container p-3 text-base font-bold"><span>Total</span><span className="text-secondary">Rs {totals.total.toLocaleString()}</span></div></div>
    {trayMessage&&<div className="mt-3 flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-on-primary animate-pulse"><span className="material-symbols-outlined text-sm">check_circle</span>{trayMessage}</div>}
    {error&&<div className="mt-3 rounded-xl bg-error-container p-3 text-sm text-on-error-container">{error}</div>}<Button fullWidth size="lg" className="mt-4" onClick={placeOrder} disabled={placing||!items.length}>{placing?'Confirming Order…':`Confirm Order • Rs ${totals.total.toLocaleString()}`}</Button>
    </div></aside></div></section></main>;
}
