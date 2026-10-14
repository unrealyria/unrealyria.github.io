export interface SocialLink {
  label: string;
  href: string;
}

export const SITE = {
  name: 'UnreaLyria',
  title: 'UnreaLyria',
  tagline: 'Cinematic original sagas from a universe still unfolding.',
  description:
    'UnreaLyria is a multi-saga story universe. Read the sagas, explore the lore and listen to the music that shapes each world.',
  url: 'https://unrealyria.github.io',
  author: 'unrealyria',
  defaultLocale: 'en',
  themeColor: '#0a0a14',
} as const;

export type Site = typeof SITE;

// External / social destinations. Rendered in the footer only when configured;
// leaving this empty intentionally renders no external links rather than dead ones.
export const SOCIAL_LINKS: SocialLink[] = [];

// Official-art slot for the home hero. Leave empty until approved assets exist —
// the hero renders an atmospheric CSS fallback when no image is supplied.
export const HOME_HERO_ART: { image?: string; imageAlt?: string } = {};
