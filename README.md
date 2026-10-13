# UnreaLyria Web

Static website for the **UnreaLyria** story universe, built with
[Astro](https://astro.build) and TypeScript and published to GitHub Pages at
<https://unrealyria.github.io>.

This repository is the product of **FASE 1**: a content-first, multi-saga
foundation. It intentionally ships only *The Virtual World Saga* / *Chapter 01 —
Welcome World*. Everything else in the content folders is a draft and is never
built or linked.

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

| Command             | Action                                                        |
| :------------------ | :------------------------------------------------------------ |
| `npm install`       | Install dependencies.                                         |
| `npm run dev`       | Start the dev server at `http://localhost:4321`.              |
| `npm run build`     | Validate + build the static site to `./dist/`.                |
| `npm run preview`   | Preview the production build locally.                         |
| `npm run validate`  | Run `astro sync`: load content and validate it against schemas. |
| `npm run typecheck` | Run `astro check` (types + `.astro` diagnostics).             |
| `npm test`          | `astro sync` + `astro check`.                                 |

> Tip: `npm run build` already fails if any content entry violates its schema, so
> content validation is enforced both locally and in CI.

## Project structure

```text
src/
├── components/           # Reusable presentation (head, header, footer, cards)
├── content/              # Author-editable content (the source of truth)
│   ├── sagas/            # JSON: saga metadata + per-saga visual theme
│   ├── chapters/         # Markdown: chapters, grouped by saga folder
│   ├── story/            # Markdown: story files (scenes) linked to a chapter
│   ├── lore/             # Markdown: lore entries
│   └── music/            # JSON: music tracks
├── layouts/
│   └── BaseLayout.astro  # HTML shell, SEO head, theme variables, chrome
├── lib/
│   ├── cms/              # Single content-access seam (CMS integration boundary)
│   ├── i18n.ts           # Locale registry (en first, it prepared)
│   ├── paths.ts          # Base-aware URL helpers
│   ├── site.ts           # Global site metadata
│   └── theme.ts          # Saga theme → CSS custom properties
├── pages/                # Routes (file-based)
│   ├── index.astro                     # Home
│   ├── sagas/index.astro               # Saga index
│   ├── sagas/[saga]/index.astro        # Saga detail
│   ├── sagas/[saga]/[chapter]/index.astro  # Chapter reader
│   └── 404.astro
├── styles/global.css
└── content.config.ts     # Collection definitions + schemas
```

## Content model

All author-facing content lives in `src/content/**` and is validated by
`src/content.config.ts` at build time.

| Collection | Format   | Key fields                                                             |
| :--------- | :------- | :--------------------------------------------------------------------- |
| `sagas`    | JSON     | `title`, `summary`, `order`, `status`, `locale`, `tags`, `theme`, `image` |
| `chapters` | Markdown | `title`, `summary`, `saga` (reference), `number`, `status`, `locale`, `publishedAt` |
| `story`    | Markdown | `title`, `chapter` (reference), `order`, `status`, `locale`             |
| `lore`     | Markdown | `title`, `summary`, `category`, `saga` (optional reference), `tags`, `status` |
| `music`    | JSON     | `title`, `saga` (optional reference), `mood`, `durationSeconds`, `audioUrl`, `status` |

Every entry carries a `status` of `published`, `draft`, or `coming-soon`, and a
`locale` (`en` or `it`).

### Publishing rule

Only entries with `status: published` are ever read by the site. Draft sagas do
not generate routes and draft chapters are excluded from listing *and* from
`getStaticPaths`, so they cannot appear in `dist/` or the sitemap. This is
enforced centrally in `src/lib/cms/local.ts`.

### Visual themes are data, not code

Each saga declares its own palette in its JSON `theme` object. `BaseLayout`
converts the theme into CSS custom properties, so adding a saga with a new look
requires **no** new components or saga-specific routes.

## Adding a saga or chapter

1. Create `src/content/sagas/<saga-id>.json` with metadata + `theme`.
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
- Images declare intrinsic `width`/`height` and lazy-load to avoid layout shift.
- Semantic landmarks, a skip link, visible focus styles, and accessible names.
- `prefers-reduced-motion` is respected globally.

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

- **Placeholder assets only.** No canonical LYRIA or saga artwork is approved
  yet, so a neutral SVG placeholder (`public/placeholder.svg`) is used. OG
  images are therefore SVG and may not render on every social platform; replace
  with approved raster art before launch.
- **Italian is not published.** Structure exists; no translated content or
  routes ship.
- **Chapter 02 and future sagas are drafts.** They are included only to verify
  the publishing gate and are absent from the built output.
- **No audio playback UI.** Music tracks render as metadata; `audioUrl` is
  optional and currently unset.
- **No CMS, comments, search, or analytics** by design.

## Fase 1 scope

This milestone stops at the technical foundation: scaffold, typed content,
schema validation, working routes, CI/CD, and documentation. Visual redesign,
canonical artwork, and CMS integration are explicitly out of scope for FASE 1.
