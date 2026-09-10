import { NavLink, useLocation } from 'react-router-dom';

const bottomNavItems = [
  { path: '/', label: 'Dawat', icon: 'emoji_food_beverage' },
  { path: '/gallery', label: 'Chai Menu', icon: 'skillet' },
  { path: '/blog', label: 'Kahaaniyan', icon: 'menu_book' },
  { path: '/order', label: 'Order Box', icon: 'featured_seasonal_and_gifts' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/95 backdrop-blur-xl shadow-[0_-8px_24px_-4px_rgba(59,36,24,0.07)]" data-active-classes="text-secondary">
      <div className="grid grid-cols-4 items-center h-20 px-space-xs max-w-lg mx-auto">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 gap-1 transition-colors group ${
                isActive ? 'text-secondary font-semibold' : 'text-on-surface-variant hover:text-secondary'
              }`
            }
            aria-current={item.path === '/' ? 'page' : undefined}
          >
            <span className="material-symbols-outlined text-[24px] group-hover:scale-105 transition-transform">{item.icon}</span>
            <span className="font-label-sm text-label-sm tracking-normal">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}