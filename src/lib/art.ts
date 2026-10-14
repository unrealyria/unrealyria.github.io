import { withBase } from './paths';

// Neutral placeholder artwork is intentionally not treated as "official art":
// cinematic full-bleed slots fall back to an atmospheric CSS treatment until an
// approved asset is supplied.
export function hasOfficialArt(src?: string): boolean {
  return typeof src === 'string' && src.length > 0 && !src.includes('placeholder');
}

export function resolveArt(src?: string): string | undefined {
  if (!hasOfficialArt(src) || !src) {
    return undefined;
  }
  return src.startsWith('/') ? withBase(src.replace(/^\/+/, '')) : src;
}
