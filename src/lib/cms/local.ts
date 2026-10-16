import { getCollection } from 'astro:content';
import { chapterSlug } from '../paths';
import type { Chapter, ContentSource, LoreEntry, MusicTrack, Saga, StoryFile } from './types';

// Music ordering: newest first by `releaseDate`. Records without a date keep a
// stable alphabetical fallback and sort after dated releases, so the selection
// stays deterministic while the CMS is progressively enriched.
function byReleaseDateDesc(a: MusicTrack, b: MusicTrack): number {
  const aTime = a.data.releaseDate ? a.data.releaseDate.getTime() : Number.NEGATIVE_INFINITY;
  const bTime = b.data.releaseDate ? b.data.releaseDate.getTime() : Number.NEGATIVE_INFINITY;
  if (bTime !== aTime) {
    return bTime - aTime;
  }
  return a.data.title.localeCompare(b.data.title);
}

async function publishedSagas(): Promise<Saga[]> {
  const entries = await getCollection('sagas', ({ data }) => data.status === 'published');
  return entries.sort((a, b) => a.data.order - b.data.order);
}

async function publishedChapters(): Promise<Chapter[]> {
  const entries = await getCollection('chapters', ({ data }) => data.status === 'published');
  return entries.sort((a, b) => a.data.number - b.data.number || a.data.order - b.data.order);
}

async function publishedSagaIds(): Promise<Set<string>> {
  const sagas = await publishedSagas();
  return new Set(sagas.map((saga) => saga.id));
}

// chapter id -> owning saga id, restricted to published chapters.
async function publishedChapterSagas(): Promise<Map<string, string>> {
  const chapters = await publishedChapters();
  return new Map(chapters.map((chapter) => [chapter.id, chapter.data.saga.id]));
}

async function chaptersForSaga(sagaId: string): Promise<Chapter[]> {
  const sagas = await publishedSagas();
  if (!sagas.some((saga) => saga.id === sagaId)) {
    return [];
  }
  const chapters = await publishedChapters();
  return chapters.filter((chapter) => chapter.data.saga.id === sagaId);
}

async function storyFilesForChapterIds(chapterIds: Set<string>): Promise<StoryFile[]> {
  if (chapterIds.size === 0) {
    return [];
  }
  const entries = await getCollection(
    'story',
    ({ data }) => data.status === 'published' && chapterIds.has(data.chapter.id),
  );
  return entries.sort((a, b) => a.data.order - b.data.order);
}

export const localContentSource: ContentSource = {
  async getSagas() {
    return publishedSagas();
  },

  async getSaga(sagaId) {
    const sagas = await publishedSagas();
    return sagas.find((saga) => saga.id === sagaId);
  },

  async getChapters(sagaId) {
    return chaptersForSaga(sagaId);
  },

  async getAllChapters() {
    const sagaIds = await publishedSagaIds();
    const chapters = await publishedChapters();
    return chapters.filter((chapter) => sagaIds.has(chapter.data.saga.id));
  },

  async getChapter(sagaId, slug) {
    const chapters = await chaptersForSaga(sagaId);
    return chapters.find((chapter) => chapterSlug(chapter.id) === slug);
  },

  async getStoryFiles(chapterId) {
    const chapterSagas = await publishedChapterSagas();
    if (!chapterSagas.has(chapterId)) {
      return [];
    }
    return storyFilesForChapterIds(new Set([chapterId]));
  },

  async getStoryFilesBySaga(sagaId) {
    const sagaIds = await publishedSagaIds();
    if (!sagaIds.has(sagaId)) {
      return [];
    }
    const chapterSagas = await publishedChapterSagas();
    const chapterIds = new Set(
      [...chapterSagas.entries()]
        .filter(([, owner]) => owner === sagaId)
        .map(([chapterId]) => chapterId),
    );
    return storyFilesForChapterIds(chapterIds);
  },

  async getAllStoryFiles() {
    const sagaIds = await publishedSagaIds();
    const chapterSagas = await publishedChapterSagas();
    const chapterIds = new Set(
      [...chapterSagas.entries()]
        .filter(([, owner]) => sagaIds.has(owner))
        .map(([chapterId]) => chapterId),
    );
    return storyFilesForChapterIds(chapterIds);
  },

  async getLore(sagaId) {
    const sagaIds = await publishedSagaIds();
    if (sagaId && !sagaIds.has(sagaId)) {
      return [];
    }
    const entries = await getCollection('lore', ({ data }) => {
      if (data.status !== 'published') {
        return false;
      }
      if (!data.saga) {
        return !sagaId;
      }
      return sagaId ? data.saga.id === sagaId : sagaIds.has(data.saga.id);
    });
    return entries.sort((a, b) => a.data.title.localeCompare(b.data.title));
  },

  async getAllLore() {
    const sagaIds = await publishedSagaIds();
    const entries = await getCollection('lore', ({ data }) => data.status === 'published');
    return entries
      .filter((entry) => !entry.data.saga || sagaIds.has(entry.data.saga.id))
      .sort((a, b) => a.data.title.localeCompare(b.data.title));
  },

  async getMusic(sagaId) {
    const sagaIds = await publishedSagaIds();
    if (sagaId && !sagaIds.has(sagaId)) {
      return [];
    }
    const entries = await getCollection('music', ({ data }) => {
      if (data.status !== 'published') {
        return false;
      }
      if (!data.saga) {
        return !sagaId;
      }
      return sagaId ? data.saga.id === sagaId : sagaIds.has(data.saga.id);
    });
    return entries.sort(byReleaseDateDesc);
  },

  async getAllMusic() {
    const sagaIds = await publishedSagaIds();
    const entries = await getCollection('music', ({ data }) => data.status === 'published');
    return entries
      .filter((entry) => !entry.data.saga || sagaIds.has(entry.data.saga.id))
      .sort(byReleaseDateDesc);
  },
};

export type { Chapter, LoreEntry, MusicTrack, Saga, StoryFile };
