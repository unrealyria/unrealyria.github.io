import { getCollection } from 'astro:content';
import { chapterSlug } from '../paths';
import type { Chapter, ContentSource, LoreEntry, MusicTrack, Saga, StoryFile } from './types';

async function publishedSagas(): Promise<Saga[]> {
  const entries = await getCollection('sagas', ({ data }) => data.status === 'published');
  return entries.sort((a, b) => a.data.order - b.data.order);
}

async function publishedChapters(): Promise<Chapter[]> {
  const entries = await getCollection('chapters', ({ data }) => data.status === 'published');
  return entries.sort((a, b) => a.data.number - b.data.number || a.data.order - b.data.order);
}

async function chaptersForSaga(sagaId: string): Promise<Chapter[]> {
  const sagas = await publishedSagas();
  if (!sagas.some((saga) => saga.id === sagaId)) {
    return [];
  }
  const chapters = await publishedChapters();
  return chapters.filter((chapter) => chapter.data.saga.id === sagaId);
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
    const sagas = await publishedSagas();
    const publishedIds = new Set(sagas.map((saga) => saga.id));
    const chapters = await publishedChapters();
    return chapters.filter((chapter) => publishedIds.has(chapter.data.saga.id));
  },

  async getChapter(sagaId, slug) {
    const chapters = await chaptersForSaga(sagaId);
    return chapters.find((chapter) => chapterSlug(chapter.id) === slug);
  },

  async getStoryFiles(chapterId) {
    const entries = await getCollection(
      'story',
      ({ data }) => data.status === 'published' && data.chapter.id === chapterId,
    );
    return entries.sort((a, b) => a.data.order - b.data.order);
  },

  async getLore(sagaId) {
    const entries = await getCollection('lore', ({ data }) => {
      if (data.status !== 'published') {
        return false;
      }
      return sagaId ? data.saga?.id === sagaId : true;
    });
    return entries.sort((a, b) => a.data.title.localeCompare(b.data.title));
  },

  async getMusic(sagaId) {
    const entries = await getCollection('music', ({ data }) => {
      if (data.status !== 'published') {
        return false;
      }
      return sagaId ? data.saga?.id === sagaId : true;
    });
    return entries.sort((a, b) => a.data.title.localeCompare(b.data.title));
  },
};

export type { Chapter, LoreEntry, MusicTrack, Saga, StoryFile };
