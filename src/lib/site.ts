export const SITE = {
  name: 'UnreaLyria',
  title: 'UnreaLyria',
  description:
    'UnreaLyria is a multi-saga story universe. Read the sagas, explore the lore and listen to the music that shapes each world.',
  url: 'https://unrealyria.github.io',
  author: 'unrealyria',
  defaultLocale: 'en',
  themeColor: '#0a0a14',
} as const;

export type Site = typeof SITE;
