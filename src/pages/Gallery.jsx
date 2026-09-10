import { useState, useEffect, useRef } from 'react';
import { SectionContainer, Divider, Card, Badge, IconBadge, Button, ImageWithFallback } from '../components/UI';

const galleryItems = [
  {
    id: 1,
    category: 'interior',
    title: 'The Baithak & Copper Samovars',
    description: 'Terracotta walls bathed in fairy lights, brass tea-stoves, and handwoven Pakistani rugs inviting deep, unhurried evening conversations.',
    location: '📍 Ground Floor Baithak Hall',
    photographer: 'Photo by Tariq M.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiXFa-YyxtkGeiA-iBVBbQpgKR4_lO7BVT3sm17LLNfyGtzMpEI73fDPhqF7kIc2FnVnQEExu0xhd0kz8_ErhGwJyD6drLqHGw5nUSAq2Q9nUU1k2Kpxxc6iaeWgsgmEL_47fTXj3OqawHpd-nHdos5-BSKGzIoNjKMnt7lED7D7T4F390SssjSCm5A2BrYSdBsU33MOO4CJOYnMeYXtKFSck4qIdWCbnTj7XxuF2AHBcumJQbDnXZ2w',
    icon: 'chair',
    iconColor: 'text-primary',
    badge: 'Café Interior',
    badgeVariant: 'secondary',
    likes: 482,
  },
  {
    id: 2,
    category: 'chai',
    title: 'Steaming Doodh Patti Kulhads',
    description: 'Simmered slow in heavy brass degchis with wild mountain cardamom pods, crushed green pistachios, and warm artisanal rusks for dipping.',
    location: '☕ Clay Baked Matka Service',
    photographer: 'Photo by Areesha K.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9HWbfNsnZkP_Xi3zWkCjhbgBVEd6nmobYu3T1EN5BLf4XpAK7LEFNzrct_UFGsPum_6FxryDDlzSNTU9EBiiqw2QDoB890-ZvKuDDQ3GKvDEYQ078VdI1qScfcDf69PuQpP8oQitVsNbnTbTMrwcbdB4APwXcauYB7-VUkNA6szfGPeur6s8j1TcVTizdRQrmcwoxStafXBvdG6Y5qCXGZBMM3S_bEW-MAfXHggm2_b7Xx61Pt3uygQ',
    icon: 'emoji_food_beverage',
    iconColor: 'text-secondary',
    badge: 'Signature Chai',
    badgeVariant: 'primary',
    likes: 619,
  },
  {
    id: 3,
    category: 'customers',
    title: 'Gupshup, Hassi & Rishte',
    description: 'Heartfelt laughter and generational gatherings over endless clay cups. Here, tea is simply an excuse to stay in good company longer.',
    location: '✨ Friday Shaam Mehfil',
    photographer: 'Photo by Hamza R.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcGwecCpBPQJavWlSlZOk93j0uMdMrF0M5WlVeLxrKBJif4eCxN1KTalF5ORMscXIq8JtA7d3qlEWqaTHKpRTIBXlw1-CilzwTyp_rsl1q2tRyUX197jndL1QVkiSJAnf_TVhEbP6fmCo-idAiuMxd9q1cGKqz57zWa4VrIt0-tgUWwfdQ9qo_nxPpbeZrj19dyTyfHjluEemz4habJwX3LjaR2Hm0AzMZsm8yXAiWRuigAQx3b9OgXg',
    icon: 'sentiment_very_satisfied',
    iconColor: 'text-primary',
    badge: 'Customers & Sangat',
    badgeVariant: 'secondary',
    likes: 840,
  },
  {
    id: 4,
    category: 'food',
    title: 'Crispy Samosas & Chai Naashta',
    description: 'Golden hand-folded street food bites served steaming with freshly ground mint chutney and sun-cured sweet tamarind preserves.',
    location: '🥟 Fresh From The Karahi',
    photographer: 'Photo by Sara B.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiVj5czTjVdhAMQBjfisKsYX4sGDpflIVDHdfkRK-Dnzzy_atRG5dEktTgDallRBn8UqpDfj7fQk9mjr5S9L5ELCenjpOcvKUdI9vxB-9BJKEptx3eH4NH5IaECvTnF2JWKtY2qagBUzqUd6jIqEUxHuRO351Y8ASUmsHJqrpTaVDJG3wh4BDKcTefkymFm1XiNA3VKujOZJhG98bXH-ueyssnMJ64Z7fOrjzUj2p6NDMpEyJgKVJvhg',
    icon: 'restaurant',
    iconColor: 'text-secondary',
    badge: 'Chai Naashta',
    badgeVariant: 'tertiary',
    likes: 389,
  },
  {
    id: 5,
    category: 'desserts',
    title: 'Shahi Tukray & Warm Gulab Jamun',
    description: 'Cardamom-scented decadence in rustic terracotta vessels, finished with real silver vark and fragrant saffron-infused rabri cream.',
    location: '🍯 Shahi Meetha Collection',
    photographer: 'Photo by Maryam Z.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTRuorzg1PzOITcbHNIsoyaPNZvTvnVH4T8cUDihIbEp-wU4oF0E_iEGEsneOfnx0TJCgpHwIaHZ_BCx63G6y5SRgwClmtscf0jgxVLBWB8r7pFO4M9goJN6lxrmgPgrGyoezXS8HPgmYDpPHR0hc6PpjIuWgLAqShbK1NSPsBTZII_uX2f5wIEx046_Qb-oGAJwCu__iP5rjzUedOG2xIAHyPb6yfpWquSiV0XMkUcowa7ySrsBVzyg',
    icon: 'bakery_dining',
    iconColor: 'text-tertiary',
    badge: 'Desserts & Mithai',
    badgeVariant: 'secondary',
    likes: 527,
  },
  {
    id: 6,
    category: 'events',
    title: 'Dawat Baithak & Sufi Chai Nights',
    description: 'Master brewers sharing generational techniques alongside live acoustic ghazals, soulful poetry recitals, and midnight clay cup pours.',
    location: '🌙 Monthly Sufi Dawat',
    photographer: 'Photo by Bilal S.',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1UQDx15sHn3nyIadScsDXnj2wXmVIvRsagTfjhLJVAJZ6jg7Hnv9xTlb3XSIr3fWGJrz-fwjSCfSFJbWyc2S6w-Cg6KfWOKVQhW7gm82CX5gI6baej6G2Kic3mKIU18xkjBPL5yzCeU0tPagz2aseZlFyxeWrhi5RRkDZuoq5IFF5TrXCt6PVw7Imz50PKvBa3dv3y-mxHsd0F2nPmkXFVqCJf6mcBPfM0iagwG6Szw1ZP55NQ0JVNyDPAb',
    icon: 'nights_stay',
    iconColor: 'text-primary',
    badge: 'Special Events',
    badgeVariant: 'primary',
    likes: 791,
  },
];

const categories = [
  { id: 'all', label: 'All Moments', count: 28 },
  { id: 'interior', label: 'Café Interior', count: 6 },
  { id: 'chai', label: 'Chai', count: 9 },
  { id: 'food', label: 'Food', count: 5 },
  { id: 'desserts', label: 'Desserts', count: 4 },
  { id: 'customers', label: 'Customers', count: 8 },
  { id: 'events', label: 'Events', count: 4 },
];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [likes, setLikes] = useState({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');
  const [lightboxTitle, setLightboxTitle] = useState('');
  const [lightboxCaption, setLightboxCaption] = useState('');

  useEffect(() => {
    const initialLikes = {};
    galleryItems.forEach(item => {
      initialLikes[item.id] = item.likes;
    });
    setLikes(initialLikes);
  }, []);

  const filteredItems = activeCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  const handleLike = (id) => {
    setLikes(prev => ({
      ...prev,
      [id]: prev[id] + (prev.liked?.[id] ? -1 : 1)
    }));
    // We'll track liked state separately in a real app
  };

  const openLightbox = (item) => {
    setLightboxImage(item.image);
    setLightboxTitle(item.title);
    setLightboxCaption(item.description);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const badgeVariants = {
    primary: 'bg-primary text-on-primary',
    secondary: 'bg-surface-container-high text-secondary',
    tertiary: 'bg-tertiary-fixed text-on-tertiary-fixed',
  };

  return (
    <main className="flex-1 flex flex-col relative w-full pt-20 pb-28 bg-surface">
      <div className="flex flex-col w-full">
        {/* Subtle Ornamental Divider Top */}
        <div className="w-full flex items-center justify-center gap-space-xs py-space-xs text-secondary/60">
          <span className="w-8 h-[1px] bg-secondary/30"></span>
          <span className="text-[11px] uppercase tracking-[0.2em] font-label-sm font-semibold">ہماری محفلیں • Mehfil-o-Yadein</span>
          <span className="w-8 h-[1px] bg-secondary/30"></span>
        </div>

        {/* Hero Header Section */}
        <SectionContainer variant="hero" className="text-center">
          <div className="flex flex-col items-center">
            <IconBadge icon="auto_awesome" variant="default" className="mb-space-xs">
              Memories & Moments
            </IconBadge>
            <h1 className="font-headline-hero-mobile text-headline-hero-mobile text-on-surface tracking-tight leading-tight">
              Moments at Chai Cafe
            </h1>
            <p className="font-quote-poetic text-quote-poetic text-secondary italic mt-space-2xs max-w-xs">
              "Good chai, great food and even better memories."
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs max-w-sm leading-relaxed">
              A photographic journal of laughter, swirling milk steam, and unhurried baithak gatherings across every sunlit corner of Khaas Chai.
            </p>
          </div>
        </SectionContainer>

        {/* Interactive Category Filter Ribbon */}
        <SectionContainer className="pb-space-md">
          <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-space-2xs -mx-margin-mobile px-margin-mobile">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`filter-tab flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'active bg-secondary text-on-secondary shadow-[0_2px_8px_-2px_rgba(59,36,24,0.12)]'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[11px] ${activeCategory === cat.id ? 'bg-surface/20 text-[10px] flex items-center justify-center font-bold' : 'opacity-70'}`}>{cat.count}</span>
              </button>
            ))}
          </div>
        </SectionContainer>

        {/* Masonry Visual Showcase Grid */}
        <SectionContainer>
          <div className="flex flex-col gap-space-lg">
            {filteredItems.map((item) => (
              <Card key={item.id} className="group flex flex-col rounded-xl overflow-hidden bg-surface-container-lowest shadow-[0_4px_16px_-4px_rgba(59,36,24,0.08)]" padding="none">
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface-container">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <Badge variant={item.badgeVariant}>{item.badge}</Badge>
                    <button
                      className="like-btn flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white font-label-sm text-label-sm hover:bg-secondary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(item.id);
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px] text-secondary-container">favorite</span>
                      <span className="count">{likes[item.id] || item.likes}</span>
                    </button>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <button
                      className="w-8 h-8 rounded-full bg-surface/90 backdrop-blur-md text-on-surface flex items-center justify-center shadow-md hover:bg-surface transition-transform active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation();
                        openLightbox(item);
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                    </button>
                  </div>
                </div>
                <div className="p-space-md flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`material-symbols-outlined text-[18px] ${item.iconColor}`}>{item.icon}</span>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">{item.title}</h2>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{item.description}</p>
                  <div className="mt-space-sm pt-space-xs flex items-center justify-between text-secondary">
                    <span className="text-[12px] font-label-sm font-medium tracking-wide">{item.location}</span>
                    <span className="text-[11px] font-label-sm opacity-70">{item.photographer}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </SectionContainer>

        {/* Community Callout Banner */}
        <SectionContainer className="mt-space-2xl mb-space-lg">
          <div className="relative overflow-hidden rounded-xl bg-surface-container p-space-lg shadow-[0_4px_20px_-4px_rgba(59,36,24,0.06)] flex flex-col items-center text-center">
            <div className="absolute -right-6 -bottom-6 text-surface-container-highest/60 select-none pointer-events-none">
              <span className="material-symbols-outlined text-[130px]">local_cafe</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-space-xs">
              <span className="material-symbols-outlined text-[26px]">camera_enhance</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Share Your Khaas Moment
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 max-w-xs leading-relaxed">
              Tag <span className="font-semibold text-secondary">@KhaasChaiPk</span> with <span className="font-semibold text-secondary">#KhaasGupshup</span> on Instagram to be featured on our Baithak hall of fame.
            </p>
            <Button variant="primary" className="mt-space-md w-full sm:w-auto" onClick={() => alert("Shukriya! Tap Instagram to tag @KhaasChaiPk with #KhaasGupshup or direct-message your cozy baithak photos to enter this week's dawat wall feature.")}>
              <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
              <span>Upload Your Story / Photo</span>
            </Button>
            <div className="mt-space-sm flex items-center gap-3 text-[11px] text-on-surface-variant font-label-sm">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-primary">verified</span> Curated Weekly</span>
              <span>•</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-primary">redeem</span> Free Kulhad Chai Voucher</span>
            </div>
          </div>
        </SectionContainer>

        {/* Sticky Quick Reservation / Order Actions Bar */}
        <SectionContainer className="mb-space-md">
          <div className="p-space-sm rounded-xl bg-surface-container-high shadow-[0_2px_12px_rgba(59,36,24,0.06)] flex items-center justify-between gap-space-xs">
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase tracking-wider">Experience It Live</span>
              <span className="font-body-sm text-body-sm text-on-surface font-medium truncate">Reserve your floor baithak today</span>
            </div>
            <Button variant="primary" size="sm">Book Table</Button>
          </div>
        </SectionContainer>

        {/* Lightbox Modal */}
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-space-md" onClick={closeLightbox}>
            <div className="flex items-center justify-between text-white" onClick={(e) => e.stopPropagation()}>
              <span className="font-headline-sm text-headline-sm truncate">{lightboxTitle}</span>
              <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-95" onClick={closeLightbox}>
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center my-space-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <ImageWithFallback
                src={lightboxImage}
                alt={lightboxTitle}
                className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
              />
            </div>
            <div className="text-center text-white/80 font-body-sm text-body-sm pb-safe" onClick={(e) => e.stopPropagation()}>
              <p className="italic">"{lightboxCaption}"</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}