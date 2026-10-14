# UnreaLyria Web

Static website for the **UnreaLyria** story universe, built with
[Astro](https://astro.build) and TypeScript and published to GitHub Pages at
<https://unrealyria.github.io>.

The site is built in phases. **FASE 1** established the content-first, multi-saga
foundation. **FASE 2** turns it into a cinematic, original narrative portal:
a dark editorial design system, a large hero, image-led saga cards, an immersive
saga page, an editorial chapter reader shell, and functioning Stories / Music /
Archives sections. Only *The Virtual World Saga* and *Chapter 01 — Welcome World*
are published; everything else is non-canonical test data and never ships.

## Stack

- **Astro 7** — static output (`output: 'static'`), no SSR, no database, no backend.
- **TypeScript** (strict) via `astro/tsconfigs/strict`.
- **Astro Content Layer** collections with Zod schema validation.
- **@astrojs/sitemap** for a generated sitemap.
- No client framework, no client-side runtime, no analytics, no CMS.

## Requirements

- Node.js >= 22.12 (CI uses Node 24).
- npm.

## Local commands

| Command             | Action                                                          |
| :------------------ | :-------------------------------------------------------------- |
| `npm install`       | Install dependencies.                                           |
| `npm run dev`       | Start the dev server at `http://localhost:4321`.                |
| `npm run build`     | Validate + build the static site to `./dist/`.                  |
| `npm run preview`   | Preview the production build locally.                           |
| `npm run validate`  | Run `astro sync`: load content and validate it against schemas.  |
| `npm run typecheck` | Run `astro check` (types + `.astro` diagnostics).               |
| `npm test`          | `astro sync` + `astro check`.                                   |

> Tip: `npm run build` already fails if any content entry violates its schema, so
> content validation is enforced both locally and in CI.

## Routes

Every navigation destination is a real, working route — there are no dead links.

| Route                                   | Page                                                     |
| :-------------------------------------- | :------------------------------------------------------- |
| `/`                                     | Home — cinematic hero, featured saga, latest chapter, teasers |
| `/sagas/`                               | Saga index — image-led cards                             |
| `/sagas/[saga]/`                        | Saga detail — immersive hero, synopsis, chapters, related content |
| `/sagas/[saga]/[chapter]/`              | Chapter reader shell — breadcrumb, prose, story files, prev/next |
| `/stories/`                             | Published story files (each links to its chapter)        |
| `/music/`                               | Published music tracks                                   |
| `/archives/`                            | Published lore entries                                   |
| `/404`                                  | Not found (noindex)                                      |

The primary navigation shows **Home, Sagas, Stories, Music, Archives**. Social /
external links in the footer render only when `SOCIAL_LINKS` in `src/lib/site.ts`
is populated; it ships empty on purpose.

## Project structure

```text
src/
├── components/
│   ├── Artwork.astro          # Configurable image slot + themed neutral placeholder
│   ├── BaseHead.astro         # SEO / Open Graph / Twitter head
│   ├── ChapterCard.astro      # Chapter list item
│   ├── ChapterList.astro      # Published chapter list
│   ├── ContentTeaser.astro    # Story / music / lore teaser (link optional)
│   ├── Hero.astro             # Reusable cinematic + saga hero
│   ├── SagaCard.astro         # Image-led, theme-tinted saga card
│   ├── SectionHeading.astro   # Eyebrow + heading + "view all" link
│   ├── SiteFooter.astro       # Brand, section nav, optional social links
│   └── SiteHeader.astro       # Responsive, JS-free primary navigation
├── content/                   # Author-editable content (source of truth)
│   ├── sagas/                 # JSON: saga metadata + per-saga theme + image slots
│   ├── chapters/              # Markdown: chapters, grouped by saga folder
│   ├── story/                 # Markdown: story files (scenes) linked to a chapter
│   ├── lore/                  # Markdown: lore entries
│   └── music/                 # JSON: music tracks
├── layouts/
│   └── BaseLayout.astro       # HTML shell, SEO head, theme variables, chrome
├── lib/
│   ├── cms/                   # Single content-access seam (CMS integration boundary)
│   ├── i18n.ts                # Locale registry (en first, it prepared)
│   ├── paths.ts               # Base-aware URL helpers
│   ├── site.ts                # Site metadata, tagline, optional social links
│   └── theme.ts               # Saga theme → CSS custom properties
├── pages/                     # Routes (file-based)
├── styles/global.css          # Design tokens + base styles
└── content.config.ts          # Collection definitions + schemas
```

## Design system

`src/styles/global.css` holds the whole system:

- **Tokens** — near-black base, violet primary, luminous accents. Six base
  `--color-*` values are overridden per saga; every other color is derived from
  them with `color-mix()`.
- **Atmosphere** — layered radial gradients on a fixed background layer plus
  hero auras for cinematic depth, no images required.
- **Typography** — a fluid `--step--1 … --step-5` scale, a system sans for UI and
  a system serif for display/titles (no external font requests).
- **Layout** — `.container` / `.container--wide`, `--measure` reader width,
  `--space-*` rhythm, `--radius-*`, `--shadow-*`.
- **Components** — buttons, cards, teasers, tags, prose, breadcrumb.
- **Motion** — short, restrained transitions gated behind
  `prefers-reduced-motion`.

Component-specific styling is scoped inside each `.astro` component; shared
primitives live in global CSS.

## Content model

All author-facing content lives in `src/content/**` and is validated by
`src/content.config.ts` at build time.

| Collection | Format   | Key fields                                                                 |
| :--------- | :------- | :------------------------------------------------------------------------- |
| `sagas`    | JSON     | `title`, `summary`, `order`, `status`, `featured`, `tags`, `theme`, `image`, `imagePortrait` |
| `chapters` | Markdown | `title`, `summary`, `saga` (reference), `number`, `status`, `publishedAt`, `image`, `imagePortrait` |
| `story`    | Markdown | `title`, `chapter` (reference), `order`, `status`, `locale`                 |
| `lore`     | Markdown | `title`, `summary`, `category`, `saga` (optional reference), `tags`, `status` |
| `music`    | JSON     | `title`, `saga` (optional reference), `mood`, `durationSeconds`, `audioUrl`, `status` |

Every entry carries a `status` of `published`, `draft`, or `coming-soon`, and a
`locale` (`en` or `it`).

### Publishing rule

Only entries with `status: published` are ever read by the site. Draft sagas do
not generate routes, and draft chapters are excluded from listing, from
`getStaticPaths`, and from the sitemap. This is enforced centrally in
`src/lib/cms/local.ts`, and cross-collection reads are gated too (a published
story file under an unpublished chapter or saga is filtered out).

`src/content/sagas/draft-fixture.json` and its chapter are **non-canonical test
fixtures** that exist only to prove the gate works end to end. They are not part
of the UnreaLyria universe and must never appear in the build output.

### Visual themes are data, not code

Each saga declares its own palette in its JSON `theme` object. `BaseLayout` and
`Hero` convert the theme into CSS custom properties, so adding a saga with a new
look requires **no** new components or saga-specific routes.

### Artwork slots

Canonical LYRIA / saga artwork is not approved, so the site never invents it.
`Artwork.astro` renders a clearly-labelled neutral placeholder unless a source is
provided. `image` (16:9 landscape) and `imagePortrait` (2:3 portrait) slots on
sagas and chapters allow dropping in official assets later without touching
layout.

## Adding a saga or chapter

1. Create `src/content/sagas/<saga-id>.json` with metadata + `theme` (+
   `featured: true` to surface it on the homepage).
2. Create `src/content/chapters/<saga-id>/<NN-slug>.md` and set `saga: <saga-id>`.
3. Keep `status: draft` (or `coming-soon`) while working.
4. Flip to `status: published` when the content is approved.
5. Run `npm run validate && npm run build` to confirm.

## Repository setup & GitHub Pages

Target repository: **`unrealyria/unrealyria.github.io`** (a user/organization
Pages site served from the domain root).

1. Create the repository on GitHub under the `unrealyria` organization with the
   exact name `unrealyria.github.io`.
2. Push this project to its default branch (`main` recommended).
3. In **Settings → Pages**, set **Source** to **GitHub Actions**.
4. Push to `main` (or run the workflow manually). The `Deploy to GitHub Pages`
   workflow validates, typechecks, builds, and deploys `dist/`.
5. The site is served at `https://unrealyria.github.io`.

Because this is a root site, `astro.config.mjs` uses:

```js
site: 'https://unrealyria.github.io',
base: '/',
```

If this ever moves to a project repository (e.g. `unrealyria/site`), change
`site` and set `base: '/site/'`; all internal links already go through
`src/lib/paths.ts` and will pick up the change automatically.

### Workflow

`.github/workflows/deploy.yml` runs on pushes to `main`/`master` and on manual
dispatch. Required permissions (`pages: write`, `id-token: write`) are declared
in the workflow; no secrets are used or required.

## SEO, performance & accessibility

- Per-page `<title>`, description, and canonical URL derived from `site`.
- Open Graph + Twitter card metadata; JSON-LD for the site, sagas, and chapters.
- Generated `sitemap-index.xml`; `robots.txt` references it.
- Zero client-side JavaScript in the output.
- Artwork declares intrinsic `width`/`height` and lazy-loads to avoid layout shift.
- Semantic landmarks, a skip link, keyboard-usable navigation, visible focus
  styles, and accessible names.
- `prefers-reduced-motion` neutralizes transitions and smooth scrolling globally.

## Internationalization

English is the default locale. `src/lib/i18n.ts` and the per-entry `locale`
field define the structural groundwork for Italian, and `astro.config.mjs`
declares the `en`/`it` locale set. No Italian routes are generated yet; content
stays English-first until translations are approved.

## CMS integration boundary

`src/lib/cms/` is the **only** place the site reads content from. It exposes a
`ContentSource` interface (see `types.ts`) with a single `localContentSource`
implementation backed by the Astro collections. Introducing a headless CMS later
means adding one more `ContentSource` implementation and pointing `cms/index.ts`
at it — pages and components stay untouched. No CMS, OAuth provider, or remote
API is configured or faked in this phase.

## Known limitations

- **Placeholder assets only.** No canonical LYRIA or saga artwork is approved, so
  `Artwork.astro` renders themed neutral placeholders and the OG image is
  `public/placeholder.svg` (SVG OG images may not render on every social
  platform). Replace with approved raster art before launch.
- **Chapter reader is a shell.** FASE 2 ships an editorial reading layout; the
  full webcomic reading engine is deferred to FASE 3.
- **No audio playback UI.** Music tracks render as metadata; `audioUrl` is
  optional and currently unset.
- **Italian is not published.** Structure exists; no translated content or routes.
- **No social links configured.** The footer renders them only when
  `SOCIAL_LINKS` is populated.
- **No CMS, comments, search, or analytics** by design.

## Scope

- **FASE 1** — scaffold, typed content, schema validation, publishing gates,
  routes, CI/CD, documentation.
- **FASE 2 (this milestone)** — cinematic design system, hero, saga/ chapter
  presentation, Stories / Music / Archives routes, responsive + accessible polish.
- **FASE 3** — deferred: full webcomic reading engine and further visual work.
