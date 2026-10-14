import virtualWorldHero from '../assets/heroes/unrealyria-welcome-world-hero-v1.png';
import virtualWorldHeroMobile from '../assets/heroes/unrealyria-welcome-world-hero-mobile-v1.png';

// Key art for each saga, kept alongside the code so Astro can optimise it
// (AVIF/WebP, responsive widths) instead of shipping a raw public asset. Add an
// entry here when a new saga's approved artwork is ready and the home
// "Explore the Worlds" grid and saga surfaces pick it up automatically; sagas
// without an entry fall back to their CMS image slot.
export interface SagaKeyArt {
  image: ImageMetadata;
  imageMobile?: ImageMetadata;
  alt: string;
}

export const SAGA_KEY_ART: Record<string, SagaKeyArt> = {
  'virtual-world': {
    image: virtualWorldHero,
    imageMobile: virtualWorldHeroMobile,
    alt: 'Lyria reaching toward a luminous floating citadel above a fantasy world at twilight.',
  },
};

export function sagaKeyArt(sagaId: string): SagaKeyArt | undefined {
  return SAGA_KEY_ART[sagaId];
}
