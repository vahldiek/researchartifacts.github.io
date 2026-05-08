# ReproDB Website — Copilot Instructions

## Auto-Generated Files — DO NOT EDIT

The following files are regenerated monthly by the
[reprodb-pipeline](https://github.com/reprodb/reprodb-pipeline) pipeline
via GitHub Actions. Manual edits **will be overwritten**.

- **`_data/*.yml`** (except `navigation.yml`) — statistics, rankings, repo stats
- **`assets/data/*.json`** — machine-readable data exports

To update these files, re-run the pipeline in reprodb-pipeline.

## Hand-Maintained Files

- **`*.md`** page files — content and frontmatter
- **`_includes/*.html`** — Jekyll templates
- **`_data/navigation.yml`** — dropdown menu structure
- **`assets/css/reprodb-*.css`** — per-feature stylesheets
- **`assets/js/reprodb-*.js`** — per-feature scripts (IIFE pattern)
- **`assets/css/main.scss`** — custom styling overrides
- **`_config.yml`** — Jekyll configuration (mostly static)

## Jekyll Conventions

- Theme: **Minimal Mistakes v4.27** (remote_theme)
- Markdown: Kramdown
- **ALWAYS** use `{{ '/path/to/asset' | relative_url }}` for all internal links and
  asset references. The site has `baseurl: "/reprodb.github.io"` set.
  Never hardcode absolute paths.
- Test locally with `./serve.sh`.

## Conference Pages

Conference pages (e.g., `systems/eurosys.md`) are thin shells:
```
{% include conference_page.html %}
```

The `conf_name` frontmatter value must match **exactly** (case-sensitive, uppercase)
the entry in `_data/artifacts_by_conference.yml` (e.g., `EUROSYS`, not `Eurosys`).
Changing `conf_name` will break the data lookup.

When adding a new conference page, also add it to `_data/navigation.yml`.

## JavaScript & CSS Patterns

- **Feature JS/CSS** lives in `assets/js/reprodb-*.js` and `assets/css/reprodb-*.css`,
  one file per feature (table, search, profile, overview). Use IIFE pattern.
  Shared utilities live in `reprodb-utils.js` under `window.ReproDB`.
- **Global assets** are loaded in `_includes/head/custom.html`:
  Chart.js v4 + datalabels plugin (CDN), `reprodb-utils.js`, `reprodb-table.js/css`.
  Do NOT add extra CDN script tags per page.
- **Per-page assets** are loaded via `<link>` / `<script>` tags in the `.md` file.
- **Data bridge pattern**: When a page needs Jekyll site data in JS, inject it as
  `<script id="…" type="application/json">` with Liquid, then parse it in the
  external JS file via `JSON.parse()`. This keeps Liquid in `.md` and logic in `.js`.
- Charts use **Chart.js v4** (CDN). CSP allows `https://cdn.jsdelivr.net`.
- Dynamic tables load JSON from `assets/data/` via `fetch()` and render client-side.
- Page frontmatter provides data URLs (e.g., `page.author_data_url`) — ensure the
  referenced JSON file exists in `assets/data/` before linking.
- **Dark mode**: Use CSS custom properties + `@media (prefers-color-scheme: dark)` +
  `html[data-theme="dark"]` selectors. See `reprodb-overview.css` for the pattern.

## Data Schemas

All JSON/YAML data structures are documented in
[reprodb/data-schemas](https://github.com/reprodb/data-schemas).
If changing how templates consume data fields, verify against the schema definitions.
