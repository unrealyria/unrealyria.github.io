export function withBase(path = ''): string {
  const rawBase = import.meta.env.BASE_URL;
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  return `${base}${path.replace(/^\/+/, '')}`;
}

export function sagaPath(sagaId: string): string {
  return withBase(`sagas/${sagaId}/`);
}

export function chapterPath(sagaId: string, chapterSlug: string): string {
  return withBase(`sagas/${sagaId}/${chapterSlug}/`);
}

export function chapterSlug(chapterId: string): string {
  const segments = chapterId.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? chapterId;
}

export function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}
