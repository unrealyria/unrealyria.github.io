import { localContentSource } from './local';
import type { ContentSource } from './types';

// Single integration seam for content. Today every read is served from the
// local, build-time content collections. Swapping in a headless CMS later only
// requires providing another `ContentSource` implementation here; no page or
// component needs to change. No remote CMS or OAuth provider is configured in
// this phase.
export const content: ContentSource = localContentSource;

export * from './types';
