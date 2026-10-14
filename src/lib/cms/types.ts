import type { CollectionEntry } from 'astro:content';

export type Saga = CollectionEntry<'sagas'>;
export type Chapter = CollectionEntry<'chapters'>;
export type StoryFile = CollectionEntry<'story'>;
export type LoreEntry = CollectionEntry<'lore'>;
export type MusicTrack = CollectionEntry<'music'>;

export interface ContentSource {
  getSagas(): Promise<Saga[]>;
  getSaga(sagaId: string): Promise<Saga | undefined>;
  getChapters(sagaId: string): Promise<Chapter[]>;
  getAllChapters(): Promise<Chapter[]>;
  getChapter(sagaId: string, slug: string): Promise<Chapter | undefined>;
  getStoryFiles(chapterId: string): Promise<StoryFile[]>;
  getStoryFilesBySaga(sagaId: string): Promise<StoryFile[]>;
  getAllStoryFiles(): Promise<StoryFile[]>;
  getLore(sagaId?: string): Promise<LoreEntry[]>;
  getAllLore(): Promise<LoreEntry[]>;
  getMusic(sagaId?: string): Promise<MusicTrack[]>;
  getAllMusic(): Promise<MusicTrack[]>;
}
