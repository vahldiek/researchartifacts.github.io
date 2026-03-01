# Research Artifacts Statistics Website

This repository hosts the [researchartifacts.github.io](https://researchartifacts.github.io) website, which provides statistics and analysis of artifact evaluations across computer science research conferences.

## Overview

The website presents:
- **Area Dashboards**: Dedicated pages for [Systems](https://researchartifacts.github.io/systems) and [Security](https://researchartifacts.github.io/security) conferences
- **Per-Conference Pages**: Detailed statistics, author rankings, and repository data for each conference
- **Prolific Authors**: Per-area rankings of researchers with most artifact contributions, with reproducibility and functional rates
- **Repository Statistics**: Stars, forks, and language breakdowns for artifact repos
- **Visualizations**: SVG charts showing artifact evaluation trends over time

## Data Sources

Data is automatically collected from:
- [sysartifacts.github.io](https://sysartifacts.github.io) — Systems conferences (EuroSys, SOSP, SC, …)
- [secartifacts.github.io](https://secartifacts.github.io) — Security conferences (ACSAC, CHES, NDSS, PETS, …)
- [USENIX](https://www.usenix.org) — Direct scraping for conferences like FAST
- [DBLP](https://dblp.org) — Computer science bibliography for author statistics

## Technology Stack

- **Jekyll** — Static site generator
- **GitHub Pages** — Hosting with automatic deployment
- **Minimal Mistakes** — Jekyll theme (v4.27)
- **Python** — Data processing (see [artifact_analysis](https://github.com/researchartifacts/artifact_analysis))

## Local Development

### With Docker (recommended)

```bash
docker run --rm -v "$PWD:/srv/jekyll" -p 4000:4000 jekyll/jekyll:4.2.2 \
  sh -c "bundle install --quiet && jekyll serve"
```

### With Ruby

```bash
bundle install
bundle exec jekyll serve
# View at http://localhost:4000
```

## Structure

```
.
├── _config.yml              # Jekyll configuration
├── _includes/
│   ├── conference_page.html # Shared template for per-conference pages
│   └── masthead.html        # Custom navigation header with dropdowns
├── _data/
│   ├── summary.yml          # Overall statistics
│   ├── artifacts_by_conference.yml
│   ├── artifacts_by_year.yml
│   ├── authors.yml          # Top prolific authors (all areas)
│   ├── author_summary.yml
│   ├── systems_authors.yml  # Systems area author rankings
│   ├── security_authors.yml # Security area author rankings
│   ├── repo_stats.yml       # GitHub repo metadata
│   └── navigation.yml       # Dropdown navigation structure
├── assets/
│   ├── charts/              # Generated SVG visualizations
│   ├── data/                # JSON data exports
│   ├── css/main.scss        # Custom styles
│   └── images/logo.svg      # Site logo
├── systems/                 # Per-conference pages (EuroSys, FAST, SC, SOSP)
├── security/                # Per-conference pages (ACSAC, CHES, NDSS, …)
├── index.md                 # Homepage
├── statistics.md            # Statistics dashboard
├── systems.md               # Systems area overview
├── security.md              # Security area overview
├── systems_authors.md       # Systems prolific authors
├── security_authors.md      # Security prolific authors
├── repo_stats.md            # Repository statistics overview
├── methodology.md           # How data is collected
└── about.md                 # About the project
```

## Data Updates

Data is updated monthly via [GitHub Actions](https://github.com/researchartifacts/artifact_analysis/blob/main/.github/workflows/update-stats.yml) in the `artifact_analysis` repository.

The workflow:
1. Scrapes artifact evaluation results from sysartifacts, secartifacts, and USENIX
2. Collects repository statistics (stars, forks, languages)
3. Generates SVG visualizations
4. Matches papers with DBLP for author identification and metrics
5. Splits author data by area (systems/security)
6. Commits updated data to this repository

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

For data issues, please report them in the [artifact_analysis](https://github.com/researchartifacts/artifact_analysis) repository.

## License

MIT License — see [LICENSE](LICENSE) file for details.

## Related Projects

- [artifact_analysis](https://github.com/researchartifacts/artifact_analysis) — Data collection and analysis pipeline
- [sysartifacts.github.io](https://github.com/sysartifacts/sysartifacts.github.io) — Systems artifact evaluation results
- [secartifacts.github.io](https://github.com/secartifacts/secartifacts.github.io) — Security artifact evaluation results
- [secartifacts.github.io](https://github.com/secartifacts/secartifacts.github.io) - Security artifact evaluation results

## Acknowledgments

Inspired by [Systems Circus](https://nebelwelt.net/pubstats/) and maintained by the research artifacts community.

Data sources:
- [DBLP](https://dblp.org) — Computer science bibliography
- [CSRankings](http://csrankings.org) — Faculty affiliation data
