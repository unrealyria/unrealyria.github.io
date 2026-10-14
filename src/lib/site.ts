export interface SocialLink {
  label: string;
  href: string;
}

export const SITE = {
  name: 'UnreaLyria',
  title: 'UnreaLyria',
  tagline: 'Original music, stories and imagined worlds.',
  description:
    'UnreaLyria is an independent creative project blending original music, serialised stories and anime-inspired worlds.',
  url: 'https://unrealyria.github.io',
  author: 'unrealyria',
  defaultLocale: 'en',
  themeColor: '#0a0a14',
} as const;

export type Site = typeof SITE;

// External / social destinations. Rendered in the footer only when configured;
// leaving this empty intentionally renders no external links rather than dead ones.
export const SOCIAL_LINKS: SocialLink[] = [];

// Accessible description for the brand home hero. The artwork files themselves
// are imported by the home page and processed by Astro for AVIF/WebP responsive
// delivery: the 16:9 brand artwork from tablet up, and the dedicated vertical
// artwork (unrealyria-brand-home-mobile-v1.png) on phones.
export const HOME_HERO_ART = {
  imageAlt:
    'Lyria, wearing glasses and a hooded jacket, looking back over her shoulder on an overpass above a city at sunset.',
} as const;

// Official brand social card, used as the Open Graph / Twitter fallback for every
// page that has no dedicated artwork of its own. Lives in /public so crawlers can
// fetch it directly; keep it in sync with the file at this path.
export const OG_IMAGE = {
  path: '/images/social/unrealyria-og-home-v1.jpg',
  type: 'image/jpeg',
  width: 1200,
  height: 630,
  alt: 'UnreaLyria — an independent creative universe of original music, stories and imagined worlds, with the character Lyria against a city sunset.',
} as const;
