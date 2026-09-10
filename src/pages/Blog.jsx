import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { SectionContainer, Badge, Button, ImageWithFallback } from '../components/UI';

const blogPosts = [
  {
    id: 1,
    featured: true,
    category: 'Dawat Heritage',
    title: 'The Story Behind Pakistani Chai',
    excerpt: 'From morning street-corner dhabas to wedding night dawats, how a humble boiled leaf became Pakistan\'s greatest social heartbeat and an undying symbol of hospitality.',
    author: 'Chaudhry Ghulam Rasool',
    date: '12 Oct',
    reads: '1.4k reads',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMJ3GQ4GxgamjO9ofH12JmgYR-h7ZdLohgWdHurQEo0EQknq2ooF19LR0J0hFNsIIKm8nGzVUSCTZ9NtC0hrKxZeEKNxWZ8TmQSWoqA4ZBroVmNCpXN1hhbf9bVnJAw7aglfA8dvF_RK1sFVh3nXeKZYPS9W59fgL_VUfrAUyKfG9Qy2X-fBpJj6dmX3gx-i8ngqrn06UbucVY8MkVLED2iXv9FjWBOKsOaC_emcsR0oNVfwzyiWJP8w',
    readTime: '6 min read',
  },
  {
    id: 2,
    category: 'Brew Debate',
    title: 'Karak Chai vs Doodh Patti',
    excerpt: 'Is it the bold aerated pull of roadside dhabas or the slow-simmered, waterless whole milk degchi brew of family baithaks? Breaking down Pakistan\'s two greatest tea rituals.',
    author: '',
    date: '',
    reads: '',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqB7Hby53d-iEGFdcLT6mLj_E6mZhChCjp2zTyflmCUtGI0-S3qWeBN1ulT5--BE15lDjC2iJmzP8-lxa_ZgD93j9aKtY7InLoFOD33sUnIF4eyEoui4PvsFLY0cHMMJotZ0nuid6sK0jNv-EcugXBYeTKRcM7NNcSHrDH8NxG9dZROYdqJIdsXLfnYpSQ0i1n_LPnwbTCx-aId4hCp2FUpCeM8DG8FfaYv5L3g3c0R8gvUZylcxzZQA',
    readTime: '4 min read',
    tags: ['Dhaba Secret', 'Patti Ratio'],
  },
  {
    id: 3,
    category: 'Regional Brews',
    title: '5 Types of Pakistani Chai',
    excerpt: 'From the salt-and-baking-soda pink froths of Kashmiri Noon Chai to Balochistan\'s Sulemani, Sindh\'s Karak, and winter Gurr Chai.',
    author: '',
    date: '',
    reads: '',
    image: null,
    readTime: '5 min read',
    flavors: ['Doodh Patti', 'Kashmiri Noon', 'Zafrani Matka', 'Elaichi Chai', 'Koyla Chai'],
  },
  {
    id: 4,
    category: 'Culture & Gupshup',
    title: 'Why Chai Brings People Together',
    excerpt: 'Why the simple act of putting the kettle on dissolves barriers, heals weary hearts, and turns strangers into lifelong companions across every gharana.',
    author: '',
    date: '',
    reads: '',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1WkHFbhfy9L0uMUMJhcLiOcZwaL74RLcFZ2V1LxwW3IjA1dCvxfCQGuxQYP5eUIpL2yfhhcfUw-XR0Wf9tiezT01iMfxIHwJT0HutMtOwxohyO0sf-VsP6HfeRNtkk3WYySLmNT5GxATdrC-SuARjaNmvOPpoAyCAq-couJPBRvinks2mhxqRITBd_446YbzWfTIu7QK4RGBuEstNGH2OqauNHpZ5PFqDaRd43BeGgPWbJShVDIcetZ2Vgv',
    readTime: '4 min read',
  },
  {
    id: 5,
    category: 'Lawaazmaat & Naashta',
    title: 'Best Snacks to Enjoy With Chai',
    excerpt: 'Crisp cardamom cake rusks, crumbly desi ghee nankhatai, spicy vegetable samosas, and warm namak paare — the definitive chai table pairings.',
    author: '',
    date: '',
    reads: '',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1WDu7Zk0Ctj8EA8NbA-P_wz7Aq2-ygPKgkiDE6UKc_fcTd4bOHmwBb31C3G_3cNsi4EbSXpt5UmMflsBrWECu9ZcpqYzmELPYZQ6Yl0M7BUImhEbqaUt0o81i-npzTutp2nbCl_SloaRbbXfgmfHOOfr_fPdfnWwcMOlknnUtEc3X7ct_fSQ45rYGe-UWL6jvib_4HMKpy6IUhsMBz9tSAx49DcoEbMGP9ABq8_Iex6IwFxxuI9Bb8jdDs',
    readTime: '3 min read',
  },
  {
    id: 6,
    category: 'The Secret Craft',
    title: 'How We Make Our Signature Chai',
    excerpt: 'An intimate look inside our morning degchi: sourcing pure unadulterated buffalo milk, hand-crushing green cardamoms, and our 18-minute slow-simmer ritual.',
    author: '',
    date: '',
    reads: '',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPtLTaWJYJmiv_ak7y3B0JzkUjw7krB_gpv9Dymn7pB-ZiB7cm9dfkf2QwANpxNBm0342AiNzNJiTEbyglE5Ea6939T3Zl9l98bD5wEJveDomlWSBB6BkBCR6AqiAyuwfvl61y4pPMzBUGvQy1PGpvXvsLGp-YWHZBRTLpjnR4dFoQjCUd5x_gZjmZxZ8NiYAfb56jnjM57zpSbQc_EseswkU4LFc3PBOjYO-ebFe4faNKYBjFWXYXdg',
    readTime: '7 min read',
  },
];

const categories = [
  'All Stories',
  'Heritage & Culture',
  'Brew Guides',
  'Pairings & Snacks',
  'Behind The Degchi',
];

const flavorBadges = [
  { label: 'Doodh Patti', variant: 'default' },
  { label: 'Kashmiri Noon', variant: 'secondary' },
  { label: 'Zafrani Matka', variant: 'tertiary' },
  { label: 'Elaichi Chai', variant: 'primary' },
  { label: 'Koyla Chai', variant: 'default' },
];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All Stories');

  return (
    <main className="flex-1 flex flex-col relative w-full pt-20 pb-28 bg-surface">
      <div className="flex flex-col w-full">
        {/* Horizontal Sub-Nav Pill Scroller */}
        <div className="w-full bg-surface-container-low px-margin-mobile py-space-xs overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-space-xs whitespace-nowrap min-w-max">
            {['Home', 'About Us', 'Menu', 'Gallery'].map((item) => (
              <NavLink key={item} to={item.toLowerCase().replace(' ', '-')} className="px-3.5 py-1.5 rounded-full font-label-sm text-label-sm text-on-surface-variant hover:text-secondary hover:bg-surface-container transition-colors">{item}</NavLink>
            ))}
            <NavLink to="/blog" className="px-4 py-1.5 rounded-full font-label-sm text-label-sm bg-secondary text-on-secondary shadow-[0_2px_8px_-2px_rgba(156,67,40,0.4)]" aria-current="page">Chai Stories</NavLink>
            {['Offers', 'Contact'].map((item) => (
              <NavLink key={item} to={item.toLowerCase()} className="px-3.5 py-1.5 rounded-full font-label-sm text-label-sm text-on-surface-variant hover:text-secondary hover:bg-surface-container transition-colors">{item}</NavLink>
            ))}
          </div>
        </div>

        {/* Editorial Section Header */}
        <SectionContainer variant="hero" className="pb-space-sm">
          <div className="flex items-center gap-space-xs text-secondary mb-space-xs">
            <span className="material-symbols-outlined text-[18px]">auto_stories</span>
            <span className="font-label-sm text-label-sm tracking-wider uppercase">Chai Stories & Dawat Journal • چائے کہانیاں</span>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-space-xs">The Chai Journal</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-prose mb-space-sm">
            Tales steeped in nostalgia, kitchen hearth memories, and the generational love of Pakistani tea culture.
          </p>
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input className="w-full pl-10 pr-4 py-3 rounded-full bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-sm text-body-sm shadow-[0_2px_8px_-2px_rgba(59,36,24,0.06)] focus:outline-none focus:bg-surface-container-low transition-colors" placeholder="Search stories, brew secrets, snacks..." type="search" />
          </div>
          <div className="flex items-center gap-space-2xs overflow-x-auto no-scrollbar py-space-xs -mx-margin-mobile px-margin-mobile mt-space-sm">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm shrink-0 transition-colors ${activeCategory === cat ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
                {cat}
              </button>
            ))}
          </div>
        </SectionContainer>

        {/* Featured Cover Story Card */}
        <SectionContainer className="py-space-xs">
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_16px_-4px_rgba(59,36,24,0.08)] flex flex-col group">
            <div className="relative w-full h-56 bg-surface-container-high overflow-hidden">
              <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${blogPosts[0].image})` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent"></div>
              <Badge variant="default" className="absolute top-3 left-3">Featured Story • 6 min read</Badge>
            </div>
            <div className="p-space-md flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-2xs text-secondary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px]">local_cafe</span>
                <span>Dawat Heritage</span>
              </div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-secondary transition-colors">{blogPosts[0].title}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3">{blogPosts[0].excerpt}</p>
              <div className="pt-space-xs mt-space-2xs flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface font-medium">By {blogPosts[0].author}</span>
                  <span className="font-body-sm text-[12px] text-outline">{blogPosts[0].date} • {blogPosts[0].reads}</span>
                </div>
                <Button variant="ghost" size="sm">
                  <span>Read Story</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Button>
              </div>
            </div>
          </div>
        </SectionContainer>

        {/* Blog Post Cards */}
        <div className="px-margin-mobile space-y-space-sm">
          {blogPosts.slice(1).map((post) => (
            <article key={post.id} className={post.image ? 'bg-surface-container-low rounded-xl overflow-hidden shadow-[0_2px_10px_-2px_rgba(59,36,24,0.06)] flex flex-col' : 'bg-surface-container-lowest rounded-xl p-space-md shadow-[0_2px_12px_-3px_rgba(59,36,24,0.06)] flex flex-col gap-space-xs'}>
              {post.image && (
                <div className="relative w-full h-44 bg-surface-container">
                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${post.image})` }}></div>
                  <Badge variant="secondary" className="absolute bottom-3 left-3">{post.category} • {post.readTime}</Badge>
                </div>
              )}
              {!post.image && (
                <div className="flex items-center justify-between">
                  <Badge variant="primary" className="px-2.5 py-1 rounded-full">{post.category} • {post.readTime}</Badge>
                  <span className={`material-symbols-outlined text-${post.category === 'The Secret Craft' ? 'primary' : 'secondary'} text-[22px]`}>
                    {post.category === 'Regional Brews' ? 'ramen_dining' : 'timer'}
                  </span>
                </div>
              )}
              <div className="p-space-md flex flex-col gap-space-2xs">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">{post.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{post.excerpt}</p>
                {post.tags && (
                  <div className="flex items-center gap-space-xs mt-space-xs">
                    {post.tags.map((tag, i) => (
                      <Badge key={i} variant="default" className="text-label-sm">{tag}</Badge>
                    ))}
                  </div>
                )}
                {post.flavors && (
                  <div className="flex flex-wrap gap-1.5 pt-space-2xs">
                    {post.flavors.map((flavor, i) => (
                      <Badge key={i} variant={flavorBadges[i]?.variant || 'default'} className="text-label-sm font-medium">{flavor}</Badge>
                    ))}
                  </div>
                )}
                {!post.tags && !post.flavors && post.category === 'Lawaazmaat & Naashta' && (
                  <div className="flex items-center gap-space-xs text-secondary font-label-sm text-label-sm pt-space-xs">
                    <span className="material-symbols-outlined text-[16px]">bakery_dining</span>
                    <span>Traditional Tea Pairings</span>
                  </div>
                )}
                {post.category === 'The Secret Craft' && (
                  <div className="w-full h-40 rounded-lg overflow-hidden my-space-2xs bg-surface-container">
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${post.image})` }}></div>
                  </div>
                )}
                {post.category === 'The Secret Craft' && (
                  <div className="flex items-center justify-between pt-space-2xs">
                    <span className="font-body-sm text-[13px] text-outline">18-Minute Boil Ritual</span>
                    <Button variant="ghost" size="sm">
                      <span>Read Full Recipe</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Trending Chai Quote Card */}
        <SectionContainer className="py-space-md">
          <div className="relative bg-surface-container-high rounded-xl p-space-lg text-center overflow-hidden flex flex-col items-center gap-space-xs shadow-[0_2px_12px_-4px_rgba(59,36,24,0.06)]">
            <span className="material-symbols-outlined text-secondary text-[32px] opacity-40">format_quote</span>
            <blockquote className="font-quote-poetic text-quote-poetic text-on-surface max-w-sm italic">
              "A cup of tea is an excuse to share great thoughts with great minds."
            </blockquote>
            <div className="w-12 h-0.5 bg-secondary/30 my-space-2xs"></div>
            <p className="font-label-sm text-label-sm text-secondary tracking-widest uppercase">Khaas Baithak Hikmat</p>
          </div>
        </SectionContainer>

        {/* The Chai Letter Newsletter Box */}
        <SectionContainer className="py-space-sm">
          <div className="bg-primary text-on-primary rounded-xl p-space-lg flex flex-col gap-space-sm shadow-[0_8px_24px_-6px_rgba(78,100,81,0.3)]">
            <div className="flex items-center gap-space-xs">
              <div className="w-9 h-9 rounded-full bg-primary-container/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-fixed text-[20px]">mark_email_unread</span>
              </div>
              <span className="font-label-sm text-label-sm text-primary-fixed uppercase tracking-wider">Sunday Morning Dispatch</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-primary">The Chai Letter</h3>
            <p className="font-body-sm text-body-sm text-primary-fixed-dim">
              Get fresh recipes, baithak stories, and secret brewing notes delivered to your inbox every Sunday morning.
            </p>
            <div className="flex flex-col gap-space-xs mt-space-2xs">
              <input className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none shadow-inner" placeholder="your.email@gmail.com" type="email" />
              <Button variant="primary" fullWidth>Subscribe for Chai Letters</Button>
            </div>
            <span className="text-[11px] text-primary-fixed-dim/80 text-center">Unsubscribe anytime. Warmth guaranteed, spam never.</span>
          </div>
        </SectionContainer>

        {/* Author / Chaiwala Note Block */}
        <SectionContainer className="pt-space-md pb-space-lg">
          <div className="bg-surface-container-lowest rounded-xl p-space-md flex items-center gap-space-md shadow-[0_2px_8px_-2px_rgba(59,36,24,0.05)]">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container shrink-0 p-1">
              <ImageWithFallback
                src="https://lh3.googleusercontent.com/aida/AEtjO1WAICT_JDHjnLOo95N1fA91aFlOZXVTKuDbboICXLjM4cYi4RfEOiPgQ-AiOreJ2GGUW_c09VTrMeMWTt6USUnf0gm3H_cRbRogEfk4BKTJgelCdEwnXQCBgyilWhbgrvdo2yx1Ddpk1fjBxDo7q3YKGNoL4yRWj42AWb58-CFzj3o_sHenNxfPlDi3nOyHwXeLW1HPbMSlcQSTJ9KbSTV7j9KP3nclNoeBJJEgXamOIbkcvvtO53PaJzDZ"
                alt="Khaas Chai artisan emblem"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Chaiwala's Stamp</span>
              <span className="font-headline-sm text-[18px] leading-snug text-on-surface truncate">Brewed With Khatir-Tawaza</span>
              <p className="font-body-sm text-[13px] text-on-surface-variant line-clamp-2 mt-0.5">
                Every story here is transcribed beside our morning degchi at Khaas Chai, Lahore.
              </p>
            </div>
          </div>
        </SectionContainer>
      </div>
    </main>
  );
}