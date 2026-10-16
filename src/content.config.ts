import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

export const LOCALES = ['en', 'it'] as const;
export const PUBLICATION_STATUSES = ['published', 'draft', 'coming-soon'] as const;

const localeSchema = z.enum(LOCALES).default('en');
const statusSchema = z.enum(PUBLICATION_STATUSES);

const themeSchema = z.object({
  primary: z.string(),
  accent: z.string(),
  background: z.string(),
  surface: z.string(),
  text: z.string(),
  muted: z.string(),
});

const sagas = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/sagas' }),
  schema: z.object({
    title: z.string(),
    shortTitle: z.string().optional(),
    tagline: z.string().optional(),
    summary: z.string(),
    order: z.number().int().nonnegative(),
    status: statusSchema,
    locale: localeSchema,
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    imagePortrait: z.string().optional(),
    imagePortraitAlt: z.string().optional(),
    theme: themeSchema,
  }),
});

const chapters = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/chapters' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    saga: reference('sagas'),
    number: z.number().int().positive(),
    order: z.number().int().nonnegative().default(0),
    status: statusSchema,
    locale: localeSchema,
    publishedAt: z.coerce.date().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    imagePortrait: z.string().optional(),
    imagePortraitAlt: z.string().optional(),
    panels: z
      .array(z.object({ src: z.string(), alt: z.string() }))
      .default([]),
  }),
});

const story = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/story' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    chapter: reference('chapters'),
    order: z.number().int().nonnegative().default(0),
    status: statusSchema,
    locale: localeSchema,
  }),
});

const lore = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lore' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    category: z
      .enum(['character', 'place', 'faction', 'item', 'concept', 'event', 'other'])
      .default('other'),
    saga: reference('sagas').optional(),
    tags: z.array(z.string()).default([]),
    status: statusSchema,
    locale: localeSchema,
  }),
});

const music = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/music' }),
  schema: z.object({
    title: z.string(),
    credits: z.string().optional(),
    mood: z.string().optional(),
    durationSeconds: z.number().int().nonnegative().optional(),
    // Playable audio file (direct media URL) — not a generic external link.
    audioUrl: z.url().optional(),
    // Canonical artwork reference (public path or approved asset) + alt text.
    artwork: z.string().optional(),
    artworkAlt: z.string().optional(),
    // Real, verified external destinations only (leave empty otherwise).
    youtubeUrl: z.url().optional(),
    // Audio platforms. `provider` is optional for retro-compatibility; when set
    // it drives the label/icon in the Chapter Music Hub. Only HTTPS URLs.
    streamingLinks: z
      .array(
        z.object({
          provider: z
            .enum(['youtube', 'audiocom', 'soundcloud', 'spotify', 'applemusic', 'bandcamp', 'other'])
            .optional(),
          label: z.string(),
          url: z.url(),
        }),
      )
      .default([]),
    // A track belongs to a saga and, when coherent, to a specific chapter.
    saga: reference('sagas').optional(),
    chapter: reference('chapters').optional(),
    // Publication date (ISO) driving newest-first ordering.
    releaseDate: z.coerce.date().optional(),
    // Explicit editorial selection for the Latest Music slot.
    featured: z.boolean().default(false),
    status: statusSchema,
    locale: localeSchema,
  }),
});

export const collections = {
  sagas,
  chapters,
  story,
  lore,
  music,
};
