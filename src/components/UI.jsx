import { forwardRef, useState, useEffect } from 'react';

export const Button = forwardRef(function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}, ref) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-label-lg text-label-lg font-semibold transition-all active:scale-[0.98] rounded-full';
  
  const variants = {
    primary: 'bg-secondary text-on-secondary hover:bg-tertiary shadow-[0_4px_14px_rgba(156,67,40,0.3)]',
    secondary: 'bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim shadow-sm',
    outline: 'bg-surface-container-low text-on-surface-variant hover:text-secondary hover:bg-surface-container border border-outline-variant',
    ghost: 'bg-transparent text-secondary hover:bg-surface-container',
  };

  const sizes = {
    sm: 'py-1.5 px-3 text-[12px]',
    md: 'py-3 px-space-md',
    lg: 'py-3.5 px-6',
  };

  const width = fullWidth ? 'w-full' : '';

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export const Card = forwardRef(function Card({ 
  children, 
  className = '', 
  hover = false,
  padding = 'md',
  ...props 
}, ref) {
  const paddings = {
    none: '',
    sm: 'p-space-sm',
    md: 'p-space-md',
    lg: 'p-space-lg',
  };

  const hoverStyles = hover 
    ? 'hover:shadow-md hover:bg-surface-container transition-shadow transition-colors' 
    : '';

  return (
    <article
      ref={ref}
      className={`bg-surface-container-low rounded-xl shadow-[0_2px_10px_rgba(59,36,24,0.05)] ${paddings[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </article>
  );
});

Card.displayName = 'Card';

export const SectionContainer = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: 'px-margin-mobile py-space-md',
    hero: 'px-margin-mobile pt-space-xs pb-space-lg',
    full: 'w-full',
    narrow: 'px-margin-mobile max-w-4xl mx-auto',
  };

  return (
    <section className={`${variants[variant]} ${className}`}>
      {children}
    </section>
  );
};

export const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-surface-container-low text-on-surface-variant',
    primary: 'bg-primary-fixed text-on-primary-fixed-variant',
    secondary: 'bg-secondary-fixed text-on-secondary-fixed',
    tertiary: 'bg-tertiary-fixed text-on-tertiary-fixed',
    accent: 'bg-secondary text-on-secondary',
    success: 'bg-primary-fixed text-on-primary-fixed-variant',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-[11px] font-semibold ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

export const IconBadge = ({ icon, children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-surface-container-low text-on-surface-variant',
    primary: 'bg-primary-fixed text-on-primary-fixed',
    secondary: 'bg-secondary-fixed text-on-secondary-fixed',
    tertiary: 'bg-tertiary-fixed text-on-tertiary-fixed',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-space-xs py-1 rounded-full font-medium tracking-wide shadow-sm ${variants[variant]} ${className}`} {...props}>
      <span className="material-symbols-outlined text-[14px]">{icon}</span>
      {children}
    </span>
  );
};

export const Divider = ({ className = '', children, ...props }) => (
  <div className={`flex items-center justify-center gap-2 py-space-xs text-primary/60 ${className}`} {...props}>
    <div className="h-px w-12 bg-outline-variant/60"></div>
    {children || <span className="material-symbols-outlined text-[18px]">spa</span>}
    <div className="h-px w-12 bg-outline-variant/60"></div>
  </div>
);

export const Toast = ({ 
  message, 
  visible, 
  onClose, 
  icon = 'check_circle',
  className = '' 
}) => {
  if (!visible) return null;

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-opacity duration-300 px-4 py-2 rounded-full bg-inverse-surface text-inverse-on-surface text-label-sm shadow-xl flex items-center gap-2 whitespace-nowrap opacity-100 ${className}`}>
      <span className="material-symbols-outlined text-[16px] text-secondary-container">{icon}</span>
      <span>{message}</span>
    </div>
  );
};

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizes[size]} border-2 border-primary/20 border-t-secondary rounded-full animate-spin ${className}`} />
  );
};

export const QuantityStepper = ({ 
  value, 
  onChange, 
  min = 1, 
  max = 99,
  className = '' 
}) => (
  <div className={`flex items-center bg-surface-container rounded-full p-1 shadow-sm ${className}`}>
    <button
      aria-label="Decrease quantity"
      className="w-7 h-7 rounded-full bg-surface-container-lowest text-secondary flex items-center justify-center hover:bg-surface-container-high transition-colors"
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
    >
      <span className="material-symbols-outlined text-[16px]">remove</span>
    </button>
    <span className="w-8 text-center font-label-sm text-label-sm font-semibold text-on-surface">{value}</span>
    <button
      aria-label="Increase quantity"
      className="w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center hover:bg-on-tertiary-fixed-variant transition-colors"
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
    >
      <span className="material-symbols-outlined text-[16px]">add</span>
    </button>
  </div>
);

export const SweetnessSelector = ({ 
  value, 
  onChange, 
  options = [
    { value: 'bina', label: 'Bina Cheeni' },
    { value: 'medium', label: 'Medium Meetha' },
    { value: 'tez', label: 'Tez Meetha' },
  ],
  className = ''
}) => (
  <div className={`grid grid-cols-3 gap-1.5 text-center ${className}`}>
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`sweetness-opt py-1 px-2 rounded font-label-sm text-[11px] transition-colors ${
          value === opt.value
            ? 'bg-secondary text-on-secondary font-semibold shadow-sm'
            : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export const ImageWithFallback = ({ 
  src, 
  alt, 
  className = '', 
  fallback = 'https://via.placeholder.com/400x300?text=Khaas+Chai',
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
  }, [src]);

  return (
    <img
      src={hasError ? fallback : imageSrc}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      {...props}
    />
  );
};