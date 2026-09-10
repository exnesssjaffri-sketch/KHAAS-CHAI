import { NavLink } from 'react-router-dom';
import { SectionContainer, Divider, Card, Badge, IconBadge, Button, ImageWithFallback } from '../components/UI';
import VideoBackground from '../components/VideoBackground';

const householdRituals = [
  {
    time: '06:30 AM',
    title: 'Subah ki Pehli Chuski',
    subtitle: 'The Dawn Awakening',
    description: 'Thick, cardamom-infused doodh patti simmered patiently in the degchi, filling sleepy courtyards with the aroma of awakening.',
    icon: 'wb_twilight',
    iconBg: 'bg-primary-fixed',
    iconColor: 'text-on-primary-fixed',
    tag: 'Whole Buffalo Milk & CTC',
    tagColor: 'text-primary',
    tagIcon: 'check_circle',
  },
  {
    time: '05:00 PM',
    title: 'Shaam ki Chai & Gupshup',
    subtitle: 'The Evening Gathering',
    description: 'Verandas come alive with steaming cups poured from porcelain kettles, golden cake rusks dipping, and unfiltered motherly laughter.',
    icon: 'wb_sunny',
    iconBg: 'bg-secondary-fixed',
    iconColor: 'text-on-secondary-fixed',
    tag: 'Paired with Crispy Rusks',
    tagColor: 'text-secondary',
    tagIcon: 'cookie',
  },
  {
    time: 'Auspicious',
    title: 'Dawat & Rishta Baithak',
    subtitle: 'The Sacred Welcome',
    description: 'Where new journeys begin and generational respect is extended in unglazed piyalas or silver-trimmed bone china saucers.',
    icon: 'favorite',
    iconBg: 'bg-surface-variant',
    iconColor: 'text-on-surface-variant',
    tag: 'Zafran & Pistachio Garnish',
    tagColor: 'text-primary',
    tagIcon: 'verified',
  },
  {
    time: '12:30 AM',
    title: 'Midnight Dhaba Karak',
    subtitle: 'Youth & Brotherhood',
    description: 'Reduced creamy milk boiled repeatedly atop fiery iron burners, served in thick glass tumblers beneath starry open skies.',
    icon: 'dark_mode',
    iconBg: 'bg-tertiary-fixed',
    iconColor: 'text-on-tertiary-fixed',
    tag: 'High Strength • Kadak Malai',
    tagColor: 'text-tertiary',
    tagIcon: 'bolt',
  },
];

const signatureBrews = [
  {
    name: 'Special Doodh Patti',
    price: '₨ 250',
    description: 'Rich, creamy traditional chai',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADREu3ZTztkUePvFrgROyKXN5wZBtu3PWslyZ_LrVSB5MNhe-lLDU0jqQ5u8j8Ty2u2KgHGGdehDCkb-lhXuFMSpVoH9OOcjEOw5L2sRGt4krRyV3ETN6QunaABCFmGKqAN3JL0WPoJqaRALc57260J1lMG3p5Fyzbz7OlRcC5pfikCI2DI7CGBEpbrQlR0NMQEVJQ3EMSwZypSS463_ah9defCwMelWoiDEPNlIJRSmf6LcPGejI4gA',
    tags: ['Pure Malai', 'Slow Simmered'],
    tagVariants: ['primary', 'default'],
    detail: 'Simmered 18 mins',
    detailIcon: 'timer',
    detailColor: 'text-primary',
  },
  {
    name: 'Kashmiri Chai',
    price: '₨ 360',
    description: 'Creamy pink tea with nuts',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGDF8XGenKCdnLkYP_3O0nXblCNV2oBq1Y_dFqk-jO1joP2QvII1hrW-70EX7lCcdapcq1G49rmgwSfIVnvUgrkEWeKa2dQL6_LIKqcw7N-T9qLeU3hI9WlJ8PASlr0sbO6oksMXcGyZLgQJI5pdcWWpICbNeIj5IBfbZuEziA_pk7sdWlFUkSJIIpLlenjErrau6kypYzOmg0PKMKG6C86DHb4rVh2TTyuzQFTFtl9sKZ__2g5Lm6Pw',
    tags: ['Pistachio & Almonds', 'Rose Petal Froth'],
    tagVariants: ['secondary', 'default'],
    detail: '4-Hour Kehwa Pull',
    detailIcon: 'hourglass_bottom',
    detailColor: 'text-primary',
  },
  {
    name: 'Elaichi Chai',
    price: '₨ 220',
    description: 'Aromatic cardamom-infused chai',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADREu3ZTztkUePvFrgROyKXN5wZBtu3PWslyZ_LrVSB5MNhe-lLDU0jqQ5u8j8Ty2u2KgHGGdehDCkb-lhXuFMSpVoH9OOcjEOw5L2sRGt4krRyV3ETN6QunaABCFmGKqAN3JL0WPoJqaRALc57260J1lMG3p5Fyzbz7OlRcC5pfikCI2DI7CGBEpbrQlR0NMQEVJQ3EMSwZypSS463_ah9defCwMelWoiDEPNlIJRSmf6LcPGejI4gA',
    tags: ['Fresh Cardamom', 'Herbal Warmth'],
    tagVariants: ['primary', 'default'],
    detail: 'Hand-Pounded Seeds',
    detailIcon: 'eco',
    detailColor: 'text-primary',
  },
  {
    name: 'Koyla Chai',
    price: '₨ 290',
    description: 'Smoky charcoal-brewed chai',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQYEfOyLJYguYoTrWToa8mInVbxL-cCHMcnft_T_zjXZ4FQDBuRxidad-CRq0aIE0-h9ZMvY3ygEw2AP2si_EuhcsoLcWcn5FmXgW5e7EcvCqY-6LAiPyism-EO1dYE_uwNp2tj21e0CYmPkVPuzxmeUx1I_rjLcSCl6LBnB2qbZMNmuSJb4v2NjL78HJWI1-fRc1hrcRj9Ej9ScK_NYWFZkyWcyaZeo7kkYDM29YcQfq2om8GGxO6NQ',
    tags: ['Smoked Kulhad', 'Wood-Fired'],
    tagVariants: ['tertiary', 'default'],
    detail: 'Charcoal Smoked',
    detailIcon: 'local_fire_department',
    detailColor: 'text-primary',
  },
  {
    name: 'Adrak Chai',
    price: '₨ 240',
    description: 'Fresh ginger and traditional spices',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDDgQamGVe5LgwKoSJseg1cTv3Hnxdogz9rWVAENcRNn6eFJKnDTIDvSwCgNJWBUk6BVmNmLlswQD0FxZkwme3iFCrd4KZ617977uMlB53G5edPMMmfB_UHOwvAqJEO0v4RNEWgz5cWnRShG2vsNZCSckM7bX9vEi7uUe-3df7DgMHnakqPnKLvKtvCv595GdEBUS_xOCXucO_ulPrFbcxF9KFSkYRwA09TrRiTj3eONQeXinBMsZ2jA',
    tags: ['Zesty Ginger', 'Winter Spice'],
    tagVariants: ['default', 'primary'],
    detail: 'Freshly Crushed Roots',
    detailIcon: 'nature',
    detailColor: 'text-primary',
  },
  {
    name: 'Zafrani Chai',
    price: '₨ 340',
    description: 'Premium saffron-infused chai',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQYEfOyLJYguYoTrWToa8mInVbxL-cCHMcnft_T_zjXZ4FQDBuRxidad-CRq0aIE0-h9ZMvY3ygEw2AP2si_EuhcsoLcWcn5FmXgW5e7EcvCqY-6LAiPyism-EO1dYE_uwNp2tj21e0CYmPkVPuzxmeUx1I_rjLcSCl6LBnB2qbZMNmuSJb4v2NjL78HJWI1-fRc1hrcRj9Ej9ScK_NYWFZkyWcyaZeo7kkYDM29YcQfq2om8GGxO6NQ',
    tags: ['Pure Kesar', 'Kashmir Strands'],
    tagVariants: ['secondary', 'default'],
    detail: 'Grade-A Mongra Saffron',
    detailIcon: 'stars',
    detailColor: 'text-primary',
  },
];

const lawaazmaat = [
  {
    name: 'Crisp Almond Nankhatai',
    description: 'Pure desi ghee bake',
    price: '₨ 180',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAERoKKrkUjiMOgh8-Qit2GMnP61KYTwObmj_ASLJjrHSHRArPudQ3wglg8A3y36k1A3pKcolJVN6AS39p_Q3aMSmWDBDc_gxMQakAfTCkRQjBgdsAKDGHJPRGzMxbz82Kl2brNpr-F-5n0QL0y_NTDymlsWr1y4wnumSgppT60C_AcMxDeg-dAIY_Zbt1kdiQNCz6hmufTM142QR1KghFf_IIR3b0yHAkEBu5LqgxrTZuNWZQpAgQ8Vw',
  },
  {
    name: "Baker's Cake Rusk",
    description: 'Twice-baked cardamom crunch',
    price: '₨ 140',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-ixiZ9tN7lN21YjmhKj_vCGdDuS6Ikk3YFTmmaNNpYWKh4nwO_QdyatFymyNWqyZdPXEejw_I3_WcoeJK1N_It0plGiDseIRk5itvaUrIr2Z42bMalEp95f7ZtSxAZNoRdbNugFLhidwfiVTvu4Sol8F_FtjdQ2b2NZ4NVYWre3K9MSkPs_7nnYNTlTdlrOMTJJ3GufdwDgDSd9Jaz5VXDWcRi6GOR1gaZiBC96WYlLDIXusuZIBCzg',
  },
  {
    name: 'Crisp Samosa & Chutney',
    description: 'Spiced potato & crushed cumin',
    price: '₨ 160',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDO201QX_25YS5B1jU2Rj-1EiUAnwwkaInevzWf2iDY8v0deHd9Adc0fcqR5XUDjfzghrl4MvxIJAMKCyN6gfNdYn2xysxd8mDksqFB61qcxUMDJjYOm9TCHhjtDgCsTa81Q_lhs65vBzSNQXMsa4ChWejEXLLDOSB8R6CgEMkuaQApGkQolRMm9nD_dpWHTYRZB20JrQLzv6P5zNWTP88WeQTl3jg64LhGgNa04lbuScSW6aRtLPVy8g',
  },
  {
    name: 'Ajwaini Namak Paare',
    description: 'Carom-scented flaky bites',
    price: '₨ 120',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8kUCMJ5vn3EfepLGkyV4hUqdrZlQff-D-8Edsoq8LVEUbs0u7HDdEdiQEiL8uv8IYGaDXs4WwSL5ICf6XFRGayWFiGd4aG5E_MpiQz6azQYf-kJYV-fC9_UoNSrIQRP_gqnbU738Yse054z4tbUpLiTTmdOn-k2PRNvHHV4ds9TnBcO3GnZHWnJXCU3U6qow2Li3Eqz9AQUI9P82nWzq4oHhgG59cI0f9bFZLi-HIZwJqb2Rc5j9o3A',
  },
];

export default function Home() {
  return (
    <main className="flex-1 flex flex-col relative w-full pb-28 bg-surface pt-24">
      <div className="flex flex-col w-full">
        {/* Hero Section */}
        <SectionContainer variant="hero">
          <div className="relative w-full rounded-xl overflow-hidden shadow-[0_12px_32px_-8px_rgba(59,36,24,0.12)] bg-surface-container-low">
            <div className="relative w-full aspect-[4/3] overflow-hidden">
              <VideoBackground
                desktopSrc="/videos/khaas-chai-bg-desktop.mp4"
                mobileSrc="/videos/khaas-chai-bg-mobile.mp4"
                posterSrc="/videos/khaas-chai-bg-poster.jpg"
                fallbackClassName="bg-surface-container-low"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface via-on-surface/40 to-transparent opacity-90"></div>
              <div className="absolute top-space-sm left-space-sm right-space-sm flex items-center justify-between">
                <IconBadge icon="spa" variant="secondary">خالص اور روایتی</IconBadge>
                <IconBadge icon="nest_eco_leaf" variant="primary">100% Organic Leaf</IconBadge>
              </div>
              <div className="absolute bottom-0 inset-x-0 p-space-md text-surface flex flex-col gap-space-2xs">
                <Badge variant="secondary" className="self-start px-space-xs py-0.5 rounded-md font-semibold tracking-wide">
                  چائے صرف پینے کی چیز نہیں، ایک جذبہ ہے
                </Badge>
                <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-surface font-serif leading-tight">
                  Chai Is The Heartbeat of Every Gharana
                </h1>
              </div>
            </div>
            <div className="p-space-md bg-surface-container-low flex flex-col gap-space-sm">
              <p className="font-body-md text-on-surface-variant text-body-md leading-relaxed">
                From morning dawn whispers to late-night dhabas and wedding dawats — wherever hearts gather, life remains incomplete without a steaming cup of freshly brewed chai.
              </p>
              <div className="flex flex-col sm:flex-row gap-space-xs pt-space-2xs">
                <NavLink to="/order" className="w-full py-3 px-space-md bg-secondary hover:bg-tertiary active:scale-[0.98] transition-all rounded-full text-on-secondary font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(156,67,40,0.3)]">
                  <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
                  <span>Brew a Cup of Warmth</span>
                </NavLink>
                <NavLink to="/order" className="w-full py-3 px-space-md bg-primary-fixed hover:bg-primary-fixed-dim active:scale-[0.98] transition-all rounded-full text-on-primary-fixed font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">card_giftcard</span>
                  <span>Gift a Dawat Box</span>
                </NavLink>
              </div>
            </div>
          </div>
        </SectionContainer>

        {/* Section Divider */}
        <Divider />

        {/* Household Rituals Carousel */}
        <SectionContainer>
          <div className="flex items-baseline justify-between mb-space-sm">
            <div>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-semibold">Gharano Ke Rasm-o-Riwaj</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">The Household Rituals</h2>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-0.5">
              Scroll <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </span>
          </div>
          <div className="flex overflow-x-auto gap-space-sm px-margin-mobile pb-space-sm snap-x snap-mandatory scroll-smooth no-scrollbar">
            {householdRituals.map((ritual, index) => (
              <Card key={index} className="snap-center shrink-0 w-[270px] flex flex-col justify-between" padding="md">
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center ${ritual.iconBg} ${ritual.iconColor}`}>
                      <span className="material-symbols-outlined text-[18px]">{ritual.icon}</span>
                    </span>
                    <span className="font-label-sm text-label-sm text-tertiary font-semibold tracking-wider">{ritual.time}</span>
                  </div>
                  <h3 className="font-headline-sm text-[18px] leading-snug text-on-surface pt-space-2xs">{ritual.title}</h3>
                  <span className="text-[12px] text-secondary font-medium -mt-1">{ritual.subtitle}</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{ritual.description}</p>
                </div>
                <div className="pt-space-sm flex items-center gap-1.5 font-medium text-[12px]" style={{ color: ritual.tagColor }}>
                  <span className="material-symbols-outlined text-[14px]">{ritual.tagIcon}</span>
                  <span>{ritual.tag}</span>
                </div>
              </Card>
            ))}
          </div>
        </SectionContainer>

        {/* Signature Handcrafted Brews */}
        <SectionContainer>
          <div className="flex flex-col gap-space-3xs mb-space-md">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-secondary"></span>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-semibold">Tazgi Aur Lazat</span>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Signature Handcrafted Brews</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Prepared fresh per order with unadulterated farm milk and freshly pounded spices.</p>
          </div>
          <div className="grid grid-cols-1 gap-space-md">
            {signatureBrews.map((brew, index) => (
              <Card key={index} className="flex flex-col gap-space-sm hover:bg-surface-container transition-colors" padding="md">
                <div className="flex gap-space-sm">
                  <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-surface-container">
                    <ImageWithFallback
                      src={brew.image}
                      alt={brew.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-headline-sm text-[18px] leading-tight text-on-surface truncate">{brew.name}</h3>
                        <span className="font-headline-sm text-[18px] text-secondary font-semibold whitespace-nowrap">{brew.price}</span>
                      </div>
                      <p className="font-body-sm text-[13px] text-on-surface-variant leading-snug mt-1 line-clamp-2">{brew.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {brew.tags.map((tag, i) => (
                        <Badge key={i} variant={brew.tagVariants[i]} className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-space-xs border-t-0 bg-surface-container-lowest/60 -mx-space-md -mb-space-md px-space-md py-space-xs rounded-b-xl">
                  <div className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                    <span className="material-symbols-outlined text-[15px]" style={{ color: brew.detailColor }}>{brew.detailIcon}</span>
                    <span>{brew.detail}</span>
                  </div>
                  <Button variant="primary" size="sm">
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    <span>Add to Tray</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </SectionContainer>

        {/* Lawaazmaat (Chai Companions) */}
        <SectionContainer>
          <div className="flex flex-col gap-space-3xs mb-space-md">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-semibold">Chai Ke Sath</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Lawaazmaat — The Chai Companions</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Freshly baked morning and evening essentials from heritage bakeries.</p>
          </div>
          <div className="grid grid-cols-2 gap-space-sm">
            {lawaazmaat.map((item, index) => (
              <Card key={index} className="flex flex-col gap-space-2xs" padding="sm" hover>
                <div className="aspect-square w-full rounded-lg overflow-hidden bg-surface-container">
                  <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-headline-sm text-[15px] text-on-surface font-semibold pt-1 truncate">{item.name}</h4>
                <span className="text-[12px] text-on-surface-variant">{item.description}</span>
                <div className="flex items-center justify-between pt-1 mt-auto">
                  <span className="font-label-lg text-secondary font-bold text-[14px]">{item.price}</span>
                  <Button variant="ghost" size="sm" className="w-7 h-7 p-0">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </SectionContainer>

        {/* Chai Dawat Box Prompt */}
        <SectionContainer>
          <div className="bg-surface-container rounded-xl p-space-md shadow-[0_8px_24px_-6px_rgba(59,36,24,0.1)] flex flex-col gap-space-sm relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-secondary/10 pointer-events-none"></div>
            <div className="flex items-center justify-between">
              <IconBadge icon="verified_user" variant="primary">Insulated Flask Guarantee</IconBadge>
              <span className="font-label-sm text-[12px] text-secondary font-medium">⚡ 20 Mins Dispatch</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Order The Chai Dawat Box</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Planning a gathering of 4 to 12 people? Our handcrafted thermos keeps tea boiling hot, accompanied by 4 bakery rusks, fresh nankhatai, and earthenware kulhads.
              </p>
            </div>
            <div className="p-space-xs rounded-lg bg-surface-container-lowest/80 flex items-center gap-space-xs">
              <span className="w-9 h-9 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">moped</span>
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-[12px] text-on-surface font-semibold">Piping Hot Doorstep Delivery</span>
                <span className="text-[11px] text-on-surface-variant truncate">Delivered in thermal lock-in casing across town</span>
              </div>
            </div>
            <NavLink to="/order" className="w-full py-3 px-space-md bg-secondary text-on-secondary hover:bg-tertiary transition-all rounded-full font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-md active:scale-[0.98]">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              <span>Customize Your Dawat Box (from ₨ 1,290)</span>
            </NavLink>
          </div>
        </SectionContainer>

        {/* The Host's Promise */}
        <SectionContainer variant="hero" className="pb-space-xl">
          <div className="p-space-lg rounded-xl bg-surface-container-low text-center flex flex-col items-center gap-space-sm shadow-[0_4px_20px_rgba(59,36,24,0.04)]">
            <div className="w-12 h-12 rounded-full bg-surface-variant text-secondary flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[26px]">volunteer_activism</span>
            </div>
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-semibold">The Host's Promise</span>
            <blockquote className="font-quote-poetic text-quote-poetic text-on-surface font-serif italic max-w-sm leading-relaxed">
              "In our homes, welcoming someone without chai is unthinkable. Every cup we brew carries the warmth of Pakistani mehmaan-nawazi and the timeless scent of love."
            </blockquote>
            <div className="h-px w-16 bg-outline-variant/60 my-space-2xs"></div>
            <div className="flex flex-col items-center gap-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm font-semibold shadow-xs">
                <span className="material-symbols-outlined text-[14px]">stars</span>
                <span>100,000+ Dawats Blessed</span>
              </div>
              <span className="font-label-sm text-[11px] text-on-surface-variant tracking-wider uppercase mt-1">Lahore • Karachi • Islamabad</span>
            </div>
          </div>
        </SectionContainer>
      </div>
    </main>
  );
}