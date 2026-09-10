import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const navItems = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/about', label: 'About Us', icon: 'menu_book' },
  { path: '/gallery', label: 'Gallery', icon: 'photo_camera' },
  { path: '/blog', label: 'Blog', icon: 'edit_note' },
  { path: '/order', label: 'Order', icon: 'call' },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${scrolled ? 'bg-surface/90 backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(59,36,24,0.06)]' : 'bg-surface/90 backdrop-blur-xl'} pt-safe`}>
      <div className="px-margin-mobile pt-2 pb-1.5 flex items-center justify-between gap-space-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center shrink-0 shadow-xs">
            <span className="text-[18px]">☕</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="font-headline-sm text-[19px] text-on-surface tracking-tight font-serif truncate font-semibold">KHAAS CHAI</span>
            </div>
            <span className="text-[10px] leading-tight text-secondary font-medium tracking-wide truncate">محبت اور مہمان نوازی</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <NavLink
            to="/order"
            className="py-1.5 px-3 rounded-full bg-secondary text-on-secondary hover:bg-tertiary transition-transform active:scale-95 shadow-sm font-label-sm text-[12px] font-semibold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">bolt</span>
            <span>Order Now</span>
          </NavLink>
          <button aria-label="Cart and Teacup Orders" className="relative w-9 h-9 flex items-center justify-center rounded-full bg-surface-container-low text-secondary hover:bg-surface-container transition-colors shadow-xs">
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[9px] font-label-sm text-on-secondary font-semibold">2</span>
          </button>
        </div>
      </div>
      <nav className="px-margin-mobile pb-2 pt-0.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 border-t-0" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-3 py-1 rounded-full text-[12px] font-label-sm font-semibold shrink-0 transition-colors inline-flex items-center gap-1 ${
                isActive
                  ? 'bg-secondary text-on-secondary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-secondary hover:bg-surface-container'
              }`
            }
          >
            <span className="material-symbols-outlined text-[14px]">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}