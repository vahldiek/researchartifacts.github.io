---
title: "Methodology"
permalink: /methodology.html
---

How we collect, process, and analyze artifact evaluation data.

## Conferences Covered

Data is collected from conferences tracked by [sysartifacts](https://sysartifacts.github.io) and [secartifacts](https://secartifacts.github.io):

- **Systems**: {{ site.data.summary.systems_conferences | join: ", " }}
- **Security**: {{ site.data.summary.security_conferences | join: ", " }}

## Data Collection

We scrape artifact evaluation results from sysartifacts/secartifacts websites, extract paper titles, authors, badges (Available, Functional, Reproducible, Reusable) and repository URLs. For USENIX conferences (ATC, FAST) we also scrape badge data from technical session pages. AE committee data is gathered from sysartifacts/secartifacts plus direct scraping (USENIX, CHES, PETS websites).

Repository statistics (GitHub stars/forks, Zenodo/Figshare downloads) are collected via their public APIs. Author names are matched to [DBLP](https://dblp.org) for disambiguation and total-publication counts.

All scripts are in the [artifact_analysis](https://github.com/researchartifacts/artifact_analysis) repository.

## Pipeline

The pipeline ([run_pipeline.sh](https://github.com/researchartifacts/artifact_analysis/blob/main/run_pipeline.sh)) runs monthly via GitHub Actions:

1. Scrape artifact results from sysartifacts/secartifacts
2. Match papers to DBLP authors
3. Collect repository statistics
4. Compute committee demographics and recurring-member rankings
5. Generate combined rankings with weighted scoring
6. Export data (JSON/YAML) and charts to this website

## Author Metrics

| Metric | Definition |
|---|---|
| **Artifacts** | Evaluated artifacts across tracked conferences |
| **Papers** | Total papers at tracked conferences (from DBLP) |
| **Artifact Rate** | Artifacts ÷ Papers × 100 — consistency of artifact production |
| **Reproducibility Rate** | Reproduced badges ÷ Artifacts × 100 — artifact quality |

The *Artifact Rate* only counts papers published in years where the venue had artifact evaluation. Authors who publish more frequently naturally have more chances to contribute artifacts, so consider this metric alongside raw counts.

## Weighted Scoring (Combined Rankings)

Researchers are ranked by a combined score: artifact authorship plus AE committee service.

| Contribution | Points |
|---|---|
| Artifact Available | 1 |
| Artifact Functional | 2 |
| Artifact Reproducible | 3 |
| AE committee membership | 3 |
| AE chair (bonus) | +2 |

Only researchers with a combined score ≥ 3 are listed.

## Data Format

All data is available in JSON format under `/assets/data/`. YAML summaries live in `_data/` for Jekyll templating.

## Contributing

Report data errors via [GitHub issues](https://github.com/researchartifacts/artifact_analysis/issues). Contributions welcome — see the [Contribute]({{ '/about.html' | relative_url }}) page.

---

*Last updated: {{ site.data.summary.last_updated | default: "Pending initial run" }}*
