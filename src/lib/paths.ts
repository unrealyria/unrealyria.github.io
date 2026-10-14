export function withBase(path = ''): string {
  const rawBase = import.meta.env.BASE_URL;
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  return `${base}${path.replace(/^\/+/, '')}`;
}

export function homePath(): string {
  return withBase('');
}

export function sagasPath(): string {
  return withBase('sagas/');
}

export function sagaPath(sagaId: string): string {
  return withBase(`sagas/${sagaId}/`);
}

export function chapterPath(sagaId: string, chapterSlug: string): string {
  return withBase(`sagas/${sagaId}/${chapterSlug}/`);
}

export function storiesPath(): string {
  return withBase('stories/');
}

export function musicPath(): string {
  return withBase('music/');
}

export function archivesPath(): string {
  return withBase('archives/');
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

export function isActive(current: string, target: string): boolean {
  const path = normalizePath(current);
  const root = normalizePath(target);
  return path === root || path.startsWith(`${root}/`);
}
