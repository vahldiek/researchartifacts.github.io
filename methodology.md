---
title: "Methodology"
permalink: /methodology.html
---

This page explains how we collect, process, and analyze artifact evaluation data, including detailed calculation formulas for all metrics displayed on this site.

## Table of Contents
- [Conferences Covered](#conferences-covered)
- [Data Collection](#data-collection)
- [Pipeline](#pipeline)
- [Author Metrics](#author-metrics) — how AR%, RR%, A:E ratio, and combined score are calculated
- [Institution Metrics](#institution-metrics) — how institutional data is aggregated
- [Badge Definitions](#badge-definitions) — what each badge type means
- [Repository Statistics](#repository-statistics) — GitHub/Zenodo metrics
- [Artifact Citations](#artifact-citations) — how citation scoring works
- [Data Format](#data-format)
- [Contributing](#contributing)

## Conferences Covered

Data is collected from conferences tracked by [sysartifacts](https://sysartifacts.github.io) and [secartifacts](https://secartifacts.github.io):

- **Systems**: {{ site.data.summary.systems_conferences | join: ", " }}
- **Security**: {{ site.data.summary.security_conferences | join: ", " }}

## Data Collection

We scrape artifact evaluation results from sysartifacts/secartifacts websites, extract paper titles, authors, badges (Available, Functional, Reproducible, Reusable) and repository URLs. For USENIX conferences (ATC, FAST) we also scrape badge data from technical session pages. AE committee data is gathered from sysartifacts/secartifacts plus direct scraping (USENIX, CHES, PETS websites).

Repository statistics (GitHub stars/forks, Zenodo/Figshare downloads) are collected via their public APIs. Author names are matched to [DBLP](https://dblp.org) for disambiguation and total-publication counts. Author affiliations are enriched using DBLP person pages and [CSRankings](http://csrankings.org) faculty data.

All scripts are in the [artifact_analysis](https://github.com/researchartifacts/artifact_analysis) repository.

## Pipeline

The pipeline ([run_pipeline.sh](https://github.com/researchartifacts/artifact_analysis/blob/main/run_pipeline.sh)) runs monthly via GitHub Actions:

1. **Scrape artifact results** from sysartifacts/secartifacts
2. **Match papers to DBLP authors** and extract author affiliations
3. **Filter papers by AE-active years** — only count papers from years when venues had artifact evaluation
4. **Collect repository statistics** (GitHub/GitLab stars/forks, Zenodo downloads)
5. **Compute combined rankings** with weighted scoring
6. **Aggregate institution statistics** by summing across affiliated authors
7. **Generate area-specific rankings** (systems, security, overall)
8. **Export data** (JSON/YAML) and charts to this website

The complete pipeline takes ~30 minutes to run and processes the DBLP XML database (~3GB compressed) to match ~2,500+ artifact papers to author records and compute total paper counts.

## Author Metrics

Individual author statistics are computed by matching artifact papers to DBLP records. Each metric is calculated as follows:

### Artifacts
The total number of evaluated artifacts (papers with at least one badge) authored by this person across all tracked conferences.

### Total Papers
The total number of papers this author published at tracked conferences, **counting only years when that conference was conducting artifact evaluation**. For example:
- If ACSAC started AE in 2017, only papers from 2017–present are counted
- If an author published at ACSAC in 2010–2024, only 2017–2024 papers contribute to the denominator
- This prevents artificial deflation of Artifact Rate by excluding pre-AE papers

The paper count is determined by matching author names to DBLP records and filtering by conference and year.

### Artifact Rate (AR%)
The percentage of an author's papers (at AE-active conferences) that have artifact badges:

```
AR% = (Artifacts / Total Papers) × 100
```

**Key point:** The denominator includes only papers from years when the venue had artifact evaluation. This ensures the rate reflects artifact adoption within the relevant time window, avoiding both over-inflation (counting only artifact papers) and under-inflation (counting all historical publications).

**Cross-area handling:** For authors active in both systems and security, contributions are **summed**. If an author has 10 systems papers and 5 security papers (all in AE-active years), the denominator is 15. This additive approach is correct because systems and security conferences are disjoint publication venues.

### Reproducibility Rate (RR%)
Among papers with artifacts, the percentage achieving the highest-tier badge (Reproduced or Reusable):

```
RR% = (Reproduced badges / Total artifacts) × 100
```

This measures the depth of reproducibility beyond mere artifact availability.

### Artifact:Evaluation Ratio (A:E)

The A:E ratio characterizes the balance between artifact production and evaluation service:

```
A:E = Artifact Score / AE Score
```

Where:
- **Artifact Score** = sum of badge points (Available+1, Functional+1, Reproduced+1 per artifact)
- **AE Score** = committee service points (member=3, chair=5)

### AE Memberships
The number of times this author served on an artifact evaluation committee across all tracked conferences.

### Chair Count
The number of times this author served as an AE chair or co-chair.

### Combined Score

A composite metric balancing artifact production, artifact quality, citation impact, and AE service:

$$\text{Combined Score} = \sum_{i=1}^{n} (A_i + F_i + R_i + C_i) + \sum_{j=1}^{m} (M_j \times 3 + \text{Ch}_j \times 3)$$

Where:
- **First sum** (per artifact):
  - $A_i$ = 1 point if artifact *i* is Available, 0 otherwise
  - $F_i$ = 1 point if artifact *i* is Functional, 0 otherwise
  - $R_i$ = 1 point if artifact *i* is Reproduced/Reusable, 0 otherwise
  - $C_i$ = citation count for artifact *i* (from OpenAlex DOI lookup)
  - **Maximum per artifact: 4 points** (all badges + 1 point per citation)

- **Second sum** (committee service):
  - $M_j$ = each committee membership contributes 3 points
  - $\text{Ch}_j$ = each chair role contributes 5 points

**Minimum Score Threshold:** Only individuals and institutions with combined score ≥ 3 are included in rankings.

**Why These Weights?**
- **Additive badge scoring (1 point each)** reflects that each badge level requires distinct effort (availability, functionality, reproducibility)
- **Citations (1 point per citation)** recognize downstream research value from artifact reuse
- **AE membership = 3 points** estimates the substantial time investment (~50 hours per evaluation cycle)
- **Chair role = 5 points** recognizes leadership and coordination responsibilities
- This formula balances artifact producers and evaluators, countering the traditional invisibility of evaluation labor in academic metrics

---

## Institution Metrics

Institution-level statistics aggregate contributions from all authors affiliated with that institution. Affiliations are determined from DBLP person pages and CSRankings faculty data.

### How Institution Data is Aggregated

All metrics are **summed across affiliated authors**:

- **Artifacts**: Total artifacts from all affiliated authors
- **Total Papers**: Total papers from all affiliated authors (AE-active years only)
- **AE Memberships**: Total committee memberships from all affiliated authors
- **Combined Score**: Sum of all affiliated authors' combined scores

**Artifact Rate and Reproducibility Rate** are then computed from these aggregated totals:

```
Institution AR% = (Total artifacts / Total papers) × 100
Institution RR% = (Total reproduced badges / Total artifacts) × 100
```

### Cross-Area Aggregation

For institution rankings broken down by area (systems vs. security):

- **Systems rankings**: Include only artifacts, papers, and AE service from systems conferences
- **Security rankings**: Include only artifacts, papers, and AE service from security conferences
- **Overall rankings**: Sum of systems + security contributions

When an author appears in both areas, their contributions are **summed** in the overall rankings. For example, if an author has 5 systems artifacts and 3 security artifacts, the institution's overall count includes all 8.

This ensures:
- Overall institution scores ≥ systems-only scores
- Overall institution scores ≥ security-only scores
- No double-counting (each artifact/paper counted exactly once)

---

## Badge Definitions

We rely on each conference's official badge definitions. We treat the same badge name as comparable across venues (e.g., Available in one venue is assumed to mean the same or similar level of availability in another). We make the same assumption for Functional. For the highest tier, Reproduced (security) and Reusable (systems) are treated as equivalent.

---

## Repository Statistics

For artifacts with GitHub/GitLab repositories or Zenodo/Figshare archives, we collect engagement metrics as supplementary signals of community uptake:

### GitHub/GitLab Metrics
- **Stars**: Number of users who starred the repository
- **Forks**: Number of times the repository was forked

### Zenodo/Figshare Metrics
- **Downloads**: Total download count from the archive platform
- **Views**: Number of views/visits to the artifact page

**Important notes:**
- Repository statistics are **displayed separately** and do not contribute to the combined score
- These metrics reflect external reuse signals but are subject to biases:
  - Age effects (older artifacts accumulate more stars)
  - Repository type differences (libraries vs. experiment code)
  - Discovery algorithm effects (GitHub trending, recommendation systems)
- We report these as observational data, not as quality judgments

---

## Artifact Citations

To capture research lineage beyond repository engagement metrics, we track academic citations to artifact DOIs. This reveals second-order impact: papers that cite the artifact repository, indicating downstream research building on the artifact.

### DOI Extraction and Resolution

For each artifact record with a Zenodo or Figshare URL, we extract the Digital Object Identifier (DOI) using a two-priority approach:

1. **Zenodo API lookup (preferred for Zenodo records)**: If the URL contains a Zenodo record ID (e.g., `https://zenodo.org/record/7234567`), we query the Zenodo API directly to retrieve the DOI associated with that record. This ensures we capture the **artifact's DOI** rather than any paper DOI that may be embedded elsewhere in the page.
2. **Direct DOI extraction (fallback)**: 
   - For direct DOI URLs: Extract DOI directly (e.g., `https://doi.org/10.5281/zenodo.7234567`)
   - For Zenodo record URLs without explicit DOI: Convert Zenodo record ID to DOI format (`10.5281/zenodo.<record_id>`)
   - For other archives (GitHub, Figshare): Use regex extraction
3. **Filtering**: We exclude badge links and other non-archival URLs

This approach ensures we consistently retrieve artifact DOIs rather than paper DOIs, improving citation accuracy.

### Citation Data Collection

For each resolved DOI, we query the [OpenAlex](https://openalex.org) API to retrieve:
- **Citation count**: The `cited_by_count` field (total number of papers citing this DOI)

OpenAlex provides a freely accessible index of scholarly citations from major publishers and preprint servers, updated regularly. No authentication is required.

### Aggregation and Scoring

Citation counts are aggregated at three levels:

1. **Per-artifact**: Each artifact records its DOI and citation count
2. **Per-author**: All citations from artifacts authored by that person are summed
3. **Per-institution**: All citations from authors affiliated with that institution are summed

### Citation Score in Combined Rankings

Each citation contributes **+1 point** to the combined score. Citations are integrated into the overall formula (see [Combined Score](#combined-score) above):

$$C_i = \text{total citations for artifact } i$$

This recognizes that cited artifacts generate downstream research value, extending the impact timeline beyond immediate adoption.

### Important Notes on Citation Metrics

- **Early-stage signal**: Recent artifacts (2025–2026) have minimal or zero citations due to publication lag in academic indexing (~6–12 months)
- **Coverage lag**: OpenAlex is updated regularly but not in real-time; citation counts reflect data available at query time
- **Biased by venue and discipline**: High-profile conferences and papers in well-indexed domains accumulate citations faster
- **Self-citations included**: OpenAlex counts include citations from the authors' own subsequent work, representing valid research lineage
- We recommend interpreting citation metrics in context with artifact age (younger artifacts naturally have fewer citations)
