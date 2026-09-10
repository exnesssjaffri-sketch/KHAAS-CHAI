import { NavLink } from 'react-router-dom';
import { SectionContainer, Divider, Card, Badge, IconBadge, Button, ImageWithFallback } from '../components/UI';

const signatureChaas = [
  {
    name: 'Khaas Doodh Patti',
    tag: 'Slow Dum',
    description: 'No water added. Steeped in full dairy with freshly cracked elaichi pods.',
    icon: 'coffee',
    iconBg: 'bg-surface-container',
    iconColor: 'text-secondary',
  },
  {
    name: 'Pink Kashmiri Noon Chai',
    tag: 'Aerated',
    description: 'Gunpowder green tea beaten to a blush rose, garnished with crushed pista.',
    icon: 'palette',
    iconBg: 'bg-secondary-fixed',
    iconColor: 'text-secondary',
  },
  {
    name: 'Matka Koyla Chai',
    tag: 'Smoked Clay',
    description: 'Clay tandoor smoked, infused with deep caramelized earthen undertones.',
    icon: 'mode_heat',
    iconBg: 'bg-surface-variant',
    iconColor: 'text-on-surface-variant',
  },
];

const values = [
  {
    number: '1.',
    title: 'Quality',
    subtitle: 'Uncompromised tea leaves and pure dairy',
    detail: 'We hand-select single-origin Assam and Ceylon pekoes blended specifically to hold their ground against rich, thick buffalo milk. No powders, no fillers.',
    icon: 'verified',
    iconBg: 'bg-primary-fixed',
    iconColor: 'text-primary',
  },
  {
    number: '2.',
    title: 'Freshness',
    subtitle: 'Freshly pounded spices & made-to-order degchi brews',
    detail: 'Whole green elaichi pods and cinnamon sticks are crushed in small stone mortars immediately before simmering so aromatic oils never oxidize.',
    icon: 'psychiatry',
    iconBg: 'bg-surface-variant',
    iconColor: 'text-secondary',
  },
  {
    number: '3.',
    title: 'Hospitality',
    subtitle: 'Rooted in Pakistani mehmaan-nawazi',
    detail: 'You are never a ticket or customer in our baithak. Every visitor is an honored mehmaan greeted with warmth, warm water, and sincere dawat smiles.',
    icon: 'handshake',
    iconBg: 'bg-secondary-fixed',
    iconColor: 'text-on-secondary-fixed',
  },
  {
    number: '4.',
    title: 'Authenticity',
    subtitle: 'Time-honored recipes passed down generations',
    detail: "We honor our elders' methods: double-boiling the leaf, high pouring from aged copper brass kettles for micro-froth, and porous earthenware vessels.",
    icon: 'auto_stories',
    iconBg: 'bg-primary-fixed/60',
    iconColor: 'text-primary',
  },
  {
    number: '5.',
    title: 'Customer Satisfaction',
    subtitle: 'Warmth in every sip and every smile',
    detail: 'If your tea is not soothing to your heart or customized to your exact sugar and malai preference, our chaiwalas will gladly brew a fresh pot with love.',
    icon: 'sentiment_very_satisfied',
    iconBg: 'bg-surface-container',
    iconColor: 'text-secondary',
  },
];

const ingredients = [
  {
    icon: 'water_drop',
    iconBg: 'bg-surface-variant',
    iconColor: 'text-secondary',
    title: 'Pure Farm Milk',
    description: 'Slow-boiled buffalo milk for velvet malai richness.',
  },
  {
    icon: 'nest_eco_leaf',
    iconBg: 'bg-primary-fixed',
    iconColor: 'text-on-primary-fixed-variant',
    title: 'Pounded Spices',
    description: 'Green elaichi, cinnamon quills & wild mountain saffron.',
  },
];

export default function About() {
  return (
    <main className="flex-1 flex flex-col relative w-full pt-20 pb-28 bg-surface">
      <div className="flex flex-col w-full">
        {/* Story Hero & Masthead */}
        <SectionContainer variant="hero">
          <div className="flex items-center gap-space-xs text-secondary mb-space-2xs">
            <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
            <span className="font-label-sm text-label-sm uppercase tracking-widest font-semibold">HAMARI DASTAAN • ہماری داستان</span>
          </div>
          <h1 className="font-headline-hero-mobile text-headline-hero-mobile text-on-surface tracking-tight mb-space-2xs">
            Our Story
          </h1>
          <p className="font-body-lead text-body-lead text-on-surface-variant font-light leading-relaxed mb-space-lg">
            Celebrating Pakistani and Desi chai culture where chai is never merely a beverage, but a timeless symbol of{' '}
            <span className="text-secondary font-normal italic font-quote-poetic">mehmaan-nawazi</span>{' '}
            affection, and togetherness in every gharana.
          </p>
          <div className="relative rounded-xl overflow-hidden shadow-[0_10px_24px_-4px_rgba(59,36,24,0.08)] bg-surface-container-low">
            <div className="aspect-[16/10] w-full overflow-hidden">
              <ImageWithFallback
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-GD2J-GfDpIlFDsYqH0BJAyrt_Mgi6DkkSLNeG4d8ZNhwbfDDgBcgxskf21unng_8R4CWbXTYvwxevnLiVPnM7LHjeHRTxVMUsuzp3zFKCA0dj_xVHDM-3WX0YbglXP1D5Jn8_txve93FlmbW3C9-062w4PcoXi3DvGmseoi-zcD6c1qaLRqlpfDhJszeqOxDhHvurIGwmLO-6o6hSoa_vfBVB1JgXLI_S16UDhYhUnxPS2ZtpBcNXA"
                alt="An elderly master chaiwala with a gentle smile lovingly pouring steaming creamy tea from a polished vintage brass kettle into a ribbed terracotta kulhad held by a young boy."
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-space-md bg-surface-container-lowest flex items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-xs min-w-0">
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">spa</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant italic truncate">
                  Slow-brewed over glowing coals: the living heritage of dawat & dosti.
                </p>
              </div>
              <Badge variant="primary" className="shrink-0">Est. 1974</Badge>
            </div>
          </div>
        </SectionContainer>

        {/* Narrative: How Chai Cafe Started */}
        <SectionContainer variant="full" className="bg-surface-container-low">
          <div className="px-margin-mobile">
            <div className="flex items-center gap-space-xs text-secondary mb-space-xs">
              <span className="material-symbols-outlined text-[18px]">skillet</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Chai Cafe Ki Story</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-space-md">
              From a Humble Degchi to a Sanctuary of Sips
            </h2>
            <div className="space-y-space-md font-body-md text-body-md text-on-surface-variant">
              <p>
                What started as an unpretentious <span className="text-on-surface font-medium">chai ka passion</span>—the relentless pursuit to simmer the quintessential, golden-creamy cup of <span className="italic text-secondary">doodh patti</span>—soon outgrew our quiet domestic kitchen. We realized that true chai was being hurried by modern instant life, stripping it of its soulful, unhurried cadence.
              </p>
              <div className="p-space-md bg-surface-container rounded-lg shadow-sm">
                <p className="font-quote-poetic text-quote-poetic text-on-surface italic leading-snug mb-space-2xs">
                  "Chai is the social heartbeat of morning baithaks, heartfelt dawats, and late-night gupshup that cures any weariness."
                </p>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">— Heritage Baithak Tradition</span>
              </div>
              <p>
                In every Pakistani home, the kettle whistling upon the stove signals an open door. We founded <span className="font-medium text-on-surface">Khaas Chai</span> to preserve this heartfelt sentiment: an earthy sanctuary scented with freshly crushed green cardamoms, roasted cinnamon bark, warm kulhads, and unvarnished hospitality.
              </p>
            </div>
            <div className="mt-space-lg grid grid-cols-2 gap-space-xs">
              {ingredients.map((ing, i) => (
                <div key={i} className="p-space-sm bg-surface rounded-lg shadow-sm flex items-start gap-space-xs">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${ing.iconBg} ${ing.iconColor}`}>
                    <span className="material-symbols-outlined text-[18px]">{ing.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-label-lg text-label-lg text-on-surface font-semibold truncate">{ing.title}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">{ing.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionContainer>

        {/* Signature Chai as the Soul of the Brand */}
        <SectionContainer>
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-semibold">The Core Ritual</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Our Signature Chaas</h2>
            </div>
            <span className="material-symbols-outlined text-tertiary-container text-[28px]">emoji_food_beverage</span>
          </div>
          <div className="space-y-space-sm">
            {signatureChaas.map((chai, i) => (
              <Card key={i} className="flex items-center gap-space-md" padding="md">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${chai.iconBg} ${chai.iconColor}`}>
                  <span className="material-symbols-outlined text-[24px]">{chai.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-headline-sm text-[18px] text-on-surface font-semibold">{chai.name}</h3>
                    <Badge variant="secondary">{chai.tag}</Badge>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{chai.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </SectionContainer>

        {/* Mission & Vision Cards */}
        <SectionContainer variant="narrow" className="py-space-lg">
          <div className="grid grid-cols-1 gap-space-md">
            <Card className="relative overflow-hidden" padding="lg">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center pointer-events-none">
                <span className="material-symbols-outlined text-[56px] text-secondary/20">flag</span>
              </div>
              <div className="flex items-center gap-space-2xs text-secondary mb-space-2xs">
                <span className="material-symbols-outlined text-[20px]">explore</span>
                <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">Our Mission</span>
              </div>
              <p className="font-headline-sm text-headline-sm text-on-secondary-fixed font-semibold tracking-tight leading-snug">
                "To serve authentic, fresh and memorable chai experiences."
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                Crafted drop by drop, without shortcuts or synthetic syrups.
              </p>
            </Card>
            <Card className="relative overflow-hidden bg-primary-container/20" padding="lg">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center pointer-events-none">
                <span className="material-symbols-outlined text-[56px] text-primary/25">groups</span>
              </div>
              <div className="flex items-center gap-space-2xs text-primary mb-space-2xs">
                <span className="material-symbols-outlined text-[20px]">visibility</span>
                <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider">Our Vision</span>
              </div>
              <p className="font-headline-sm text-headline-sm text-on-primary-container font-semibold tracking-tight leading-snug">
                "To become a favorite gathering place for chai lovers."
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                An unhurried haven where every guest is welcomed like family.
              </p>
            </Card>
          </div>
        </SectionContainer>

        {/* Interactive 5-Pillar Values Grid */}
        <SectionContainer variant="full" className="bg-surface-container-low py-space-xl">
          <div className="px-margin-mobile text-center mb-space-lg">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-semibold">Usul-e-Khaas</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">Our Guiding Values</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Tap a pillar to experience our craft commitment.</p>
          </div>
          <div className="px-margin-mobile grid grid-cols-1 gap-space-xs">
            {values.map((value, i) => (
              <Card key={i} className="cursor-pointer" padding="md" hover>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${value.iconBg} ${value.iconColor}`}>
                      <span className="material-symbols-outlined text-[20px]">{value.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-[17px] text-on-surface font-semibold">{value.number} {value.title}</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{value.subtitle}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px] transition-transform duration-200">expand_more</span>
                </div>
                <div className="detail-panel pt-space-sm mt-space-sm text-on-surface-variant font-body-sm text-body-sm">
                  {value.detail}
                </div>
              </Card>
            ))}
          </div>
        </SectionContainer>

        {/* Master Brewer Quote & Artisan Stamp Badge */}
        <SectionContainer className="py-space-2xl">
          <div className="flex flex-col items-center px-margin-mobile text-center relative overflow-hidden">
            <div className="w-20 h-20 mb-space-md rounded-full p-1 bg-surface-container shadow-md flex items-center justify-center">
              <ImageWithFallback
                src="https://lh3.googleusercontent.com/aida/AEtjO1WAICT_JDHjnLOo95N1fA91aFlOZXVTKuDbboICXLjM4cYi4RfEOiPgQ-AiOreJ2GGUW_c09VTrMeMWTt6USUnf0gm3H_cRbRogEfk4BKTJgelCdEwnXQCBgyilWhbgrvdo2yx1Ddpk1fjBxDo7q3YKGNoL4yRWj42AWb58-CFzj3o_sHenNxfPlDi3nOyHwXeLW1HPbMSlcQSTJ9KbSTV7j9KP3nclNoeBJJEgXamOIbkcvvtO53PaJzDZ"
                alt="Khaas Chai Master Artisan Emblem"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <p className="font-quote-poetic text-quote-poetic text-on-surface italic max-w-sm mb-space-sm leading-relaxed">
              "We do not just boil leaves in milk; we pour patience, remembrance, and the soul of our elders into every terracotta kulhad."
            </p>
            <div className="flex flex-col items-center mb-space-xl">
              <span className="font-headline-sm text-[18px] text-secondary font-semibold">Chaudhry Ghulam Rasool</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Ustaad Chaiwala & Co-Founder</span>
            </div>
            <div className="w-full flex flex-col gap-space-xs max-w-xs">
              <NavLink to="/gallery" className="w-full py-3.5 px-6 rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg font-semibold tracking-wide text-center shadow-[0_4px_12px_rgba(156,67,40,0.25)] hover:bg-secondary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px]">skillet</span>
                <span>Explore Our Chai Menu</span>
              </NavLink>
              <NavLink to="/order" className="w-full py-3.5 px-6 rounded-lg bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold tracking-wide text-center hover:bg-surface-container-high transition-all active:scale-[0.98] flex items-center justify-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px]">storefront</span>
                <span>Visit Our Baithak</span>
              </NavLink>
            </div>
            <div className="mt-space-xl flex items-center gap-space-2xs text-secondary/70">
              <span className="text-xs">✦</span>
              <span className="font-label-sm text-[11px] uppercase tracking-widest">Khaas Chai • Dil Se Dil Tak</span>
              <span className="text-xs">✦</span>
            </div>
          </div>
        </SectionContainer>
      </div>
    </main>
  );
}