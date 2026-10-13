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
    summary: z.string(),
    order: z.number().int().nonnegative(),
    status: statusSchema,
    locale: localeSchema,
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
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
    audioUrl: z.url().optional(),
    saga: reference('sagas').optional(),
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
