# ResearchArtifacts Website — Copilot Instructions

## Auto-Generated Files — DO NOT EDIT

The following files are regenerated monthly by the
[artifact_analysis](https://github.com/researchartifacts/artifact_analysis) pipeline
via GitHub Actions. Manual edits **will be overwritten**.

- **`_data/*.yml`** (except `navigation.yml`) — statistics, rankings, repo stats
- **`assets/data/*.json`** — machine-readable data exports
- **`assets/charts/*.svg`** — pre-generated matplotlib visualizations

To update these files, re-run the pipeline in artifact_analysis.

## Hand-Maintained Files

- **`*.md`** page files — content and frontmatter
- **`_includes/*.html`** — Jekyll templates and inline JavaScript
- **`_data/navigation.yml`** — dropdown menu structure
- **`assets/css/main.scss`** — custom styling overrides
- **`_config.yml`** — Jekyll configuration (mostly static)

## Jekyll Conventions

- Theme: **Minimal Mistakes v4.27** (remote_theme)
- Markdown: Kramdown
- **ALWAYS** use `{{ '/path/to/asset' | relative_url }}` for all internal links and
  asset references. The site has `baseurl: "/researchartifacts.github.io"` set.
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

## JavaScript Patterns

- All JS is **vanilla JavaScript**, inline in `_includes/*.html` — no frameworks.
- Charts use **Chart.js v4** from CDN.
- Dynamic tables load JSON from `assets/data/` via `fetch()` and render client-side.
- Page frontmatter provides data URLs (e.g., `page.author_data_url`) — ensure the
  referenced JSON file exists in `assets/data/` before linking.

## Data Schemas

All JSON/YAML data structures are documented in
[researchartifacts/data-schemas](https://github.com/researchartifacts/data-schemas).
If changing how templates consume data fields, verify against the schema definitions.
