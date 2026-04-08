---
title: "Methodology"
permalink: /methodology.html
---

This page explains how we collect, process, and analyze artifact evaluation data, including detailed calculation formulas for all metrics displayed on this site.

{% if site.data.summary %}

## Overview

| | |
|---|---|
| **Total Artifacts** | {{ site.data.summary.total_artifacts }} |
| **Conferences Tracked** | {{ site.data.summary.total_conferences }} ({{ site.data.summary.conferences_list | join: ", " }}) |
| **Years Covered** | {{ site.data.summary.year_range }} |
| **Total Authors** | {{ site.data.author_summary.total_authors }} |
| **AE Committee Members** | {{ site.data.committee_stats.total_members }} ({{ site.data.committee_stats.recurring_members }} recurring) |

## Artifacts by Year and Area

| Area | Total | {% for y in site.data.artifacts_by_year reversed %}{{ y.year }} | {% endfor %}
|---|:---:|{% for y in site.data.artifacts_by_year reversed %}:---:|{% endfor %}
| **[Systems]({{ '/systems/' | relative_url }})** | {% assign _st = 0 %}{% assign _sa = 0 %}{% assign _sf = 0 %}{% assign _sr = 0 %}{% for conf in site.data.artifacts_by_conference %}{% if conf.category == "systems" %}{% for yd in conf.years %}{% assign _st = _st | plus: yd.total %}{% assign _sa = _sa | plus: yd.available %}{% assign _sf = _sf | plus: yd.functional %}{% assign _sr = _sr | plus: yd.reproducible %}{% endfor %}{% endif %}{% endfor %}**{{ _st }}** ({{ _sa }}, {{ _sf }}, {{ _sr }}) | {% for y in site.data.artifacts_by_year reversed %}{% assign _ct = 0 %}{% assign _ca = 0 %}{% assign _cf = 0 %}{% assign _cr = 0 %}{% for conf in site.data.artifacts_by_conference %}{% if conf.category == "systems" %}{% for yd in conf.years %}{% if yd.year == y.year %}{% assign _ct = _ct | plus: yd.total %}{% assign _ca = _ca | plus: yd.available %}{% assign _cf = _cf | plus: yd.functional %}{% assign _cr = _cr | plus: yd.reproducible %}{% endif %}{% endfor %}{% endif %}{% endfor %}{% if _ct > 0 %}{{ _ct }} ({{ _ca }}, {{ _cf }}, {{ _cr }}){% else %}&ndash;{% endif %} | {% endfor %}
| **[Security]({{ '/security/' | relative_url }})** | {% assign _st = 0 %}{% assign _sa = 0 %}{% assign _sf = 0 %}{% assign _sr = 0 %}{% for conf in site.data.artifacts_by_conference %}{% if conf.category == "security" %}{% for yd in conf.years %}{% assign _st = _st | plus: yd.total %}{% assign _sa = _sa | plus: yd.available %}{% assign _sf = _sf | plus: yd.functional %}{% assign _sr = _sr | plus: yd.reproducible %}{% endfor %}{% endif %}{% endfor %}**{{ _st }}** ({{ _sa }}, {{ _sf }}, {{ _sr }}) | {% for y in site.data.artifacts_by_year reversed %}{% assign _ct = 0 %}{% assign _ca = 0 %}{% assign _cf = 0 %}{% assign _cr = 0 %}{% for conf in site.data.artifacts_by_conference %}{% if conf.category == "security" %}{% for yd in conf.years %}{% if yd.year == y.year %}{% assign _ct = _ct | plus: yd.total %}{% assign _ca = _ca | plus: yd.available %}{% assign _cf = _cf | plus: yd.functional %}{% assign _cr = _cr | plus: yd.reproducible %}{% endif %}{% endfor %}{% endif %}{% endfor %}{% if _ct > 0 %}{{ _ct }} ({{ _ca }}, {{ _cf }}, {{ _cr }}){% else %}&ndash;{% endif %} | {% endfor %}
| **Total** | {% assign _st = 0 %}{% assign _sa = 0 %}{% assign _sf = 0 %}{% assign _sr = 0 %}{% for conf in site.data.artifacts_by_conference %}{% for yd in conf.years %}{% assign _st = _st | plus: yd.total %}{% assign _sa = _sa | plus: yd.available %}{% assign _sf = _sf | plus: yd.functional %}{% assign _sr = _sr | plus: yd.reproducible %}{% endfor %}{% endfor %}**{{ _st }}** ({{ _sa }}, {{ _sf }}, {{ _sr }}) | {% for y in site.data.artifacts_by_year reversed %}{% assign _ct = 0 %}{% assign _ca = 0 %}{% assign _cf = 0 %}{% assign _cr = 0 %}{% for conf in site.data.artifacts_by_conference %}{% for yd in conf.years %}{% if yd.year == y.year %}{% assign _ct = _ct | plus: yd.total %}{% assign _ca = _ca | plus: yd.available %}{% assign _cf = _cf | plus: yd.functional %}{% assign _cr = _cr | plus: yd.reproducible %}{% endif %}{% endfor %}{% endfor %}**{{ _ct }}** ({{ _ca }}, {{ _cf }}, {{ _cr }}) | {% endfor %}

Each cell shows **total (available, functional, reproduced)**.

{% endif %}

## Conferences Covered

Data is collected from conferences tracked by [sysartifacts](https://sysartifacts.github.io) and [secartifacts](https://secartifacts.github.io):

- **Systems**: {{ site.data.summary.systems_conferences | join: ", " }}
- **Security**: {{ site.data.summary.security_conferences | join: ", " }}

## Data Collection

We scrape artifact evaluation results from sysartifacts/secartifacts websites, extract paper titles, authors, badges (Available, Functional, Reproducible, Reusable) and repository URLs. For USENIX conferences (ATC, FAST) we also scrape badge data from technical session pages. AE committee data is gathered from sysartifacts/secartifacts plus direct scraping (USENIX, CHES, PETS websites).

Repository statistics (GitHub stars/forks, Zenodo/Figshare downloads) are collected via their public APIs. Author names are matched to [DBLP](https://dblp.org) for disambiguation and total-publication counts. Author affiliations are enriched using DBLP person pages and [CSRankings](http://csrankings.org) faculty data.

All scripts are in the [reprodb-pipeline](https://github.com/reprodb/reprodb-pipeline) repository. Full CLI reference, API documentation, and data model definitions are in the [pipeline documentation](https://reprodb.github.io/reprodb-pipeline/).

## Pipeline

The pipeline ([run_pipeline.sh](https://github.com/reprodb/reprodb-pipeline/blob/main/run_pipeline.sh)) runs monthly via GitHub Actions:

1. **Scrape artifact results** from sysartifacts/secartifacts
2. **Match papers to DBLP authors** and extract author affiliations
3. **Filter papers by AE-active years** — only count papers from years when venues had artifact evaluation
4. **Collect repository statistics** (GitHub/GitLab stars/forks, Zenodo downloads)
5. **Compute combined rankings** with weighted scoring
6. **Aggregate institution statistics** by summing across affiliated authors
7. **Generate area-specific rankings** (systems, security, overall)
8. **Export data** (JSON/YAML) and charts to this website

All output data structures are formally defined in the [Data Schemas](https://reprodb.github.io/data-schemas/) documentation.

The complete pipeline takes ~30 minutes to run and processes the DBLP XML database (~3 GB compressed) to match {{ site.data.summary.total_artifacts }}+ artifact papers to author records and compute total paper counts.

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

A composite metric balancing artifact production, artifact quality, and AE service:

$$\text{Combined Score} = \sum_{i=1}^{n} (A_i + F_i + R_i) + \sum_{j=1}^{m} (3 + B_j \times 2)$$

Where:
- **First sum** (per artifact):
  - $A_i$ = 1 point if artifact *i* is Available, 0 otherwise
  - $F_i$ = 1 point if artifact *i* is Functional, 0 otherwise
  - $R_i$ = 1 point if artifact *i* is Reproduced/Reusable, 0 otherwise
  - **Maximum per artifact: 3 points** (all three badges)

- **Second sum** (committee service, per AE term *j*):
  - Each committee membership contributes **3 points**
  - $B_j$ = 1 if term *j* is a chair role, 0 otherwise — chairs receive a **+2 bonus** for a total of **5 points** per chair term

**Minimum Score Threshold:** Only individuals and institutions with combined score ≥ 3 are included in rankings.

**Why These Weights?**
- **Additive badge scoring (1 point each)** reflects that each badge level requires distinct effort (availability, functionality, reproducibility)
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

## Artifact Citations (Experimental)

We attempted to track academic citations to artifact DOIs using [OpenAlex](https://openalex.org), querying citation counts for artifact DOIs (Zenodo and Figshare).

### Why Citation Data Is Not Included in Rankings

OpenAlex reported 14 artifacts with a total of 43 citing DOIs. We verified each citing DOI by checking [Crossref](https://www.crossref.org/) publisher-submitted reference lists for the actual artifact DOI, and detected self-citations by comparing author lists between the artifact and the citing paper.

**Result: zero genuine third-party artifact citations.** All 43 were:
- **36 false positives** — the citing paper's bibliography contains the *paper* DOI, not the artifact DOI. OpenAlex conflates these when the artifact and paper share a title.
- **6 self-citations** — the paper cites its own artifact (same authors).
- **1 unknown** — an arXiv preprint whose references could not be resolved.

Because current bibliographic indexes do not reliably distinguish artifact citations from paper citations, **citation counts are excluded from the combined score and ranking tables**. The citation collection pipeline remains available as an optional, experimental module for future use as citation infrastructure matures.

See the [verification scripts and detailed results](https://github.com/reprodb/reprodb-pipeline) for the full analysis.

---

## Data Sources

- **[sysartifacts.github.io](https://sysartifacts.github.io)** — Systems conference artifact evaluation results ({{ site.data.summary.systems_conferences | join: ", " }})
- **[secartifacts.github.io](https://secartifacts.github.io)** — Security conference artifact evaluation results ({{ site.data.summary.security_conferences | join: ", " }})
- **[usenix.org](https://www.usenix.org)** — Badge information for USENIX conferences
- **[dblp.org](https://dblp.org)** — Author name matching and disambiguation
- **[GitHub](https://docs.github.com/en/rest)**, **[Zenodo](https://developers.zenodo.org)**, **[Figshare](https://docs.figshare.com)** — Repository statistics (stars, forks, downloads)
- **[Data Schemas](https://reprodb.github.io/data-schemas/)** — JSON Schema definitions for all data structures used by this site

---

## Acknowledgements

This project celebrates the work of **artifact authors** who go the extra mile to make research reproducible, and **artifact evaluation committees** (AE chairs and members) who invest time reviewing and certifying artifacts. Their contributions strengthen our scientific record. We thank the communities maintaining [sysartifacts](https://sysartifacts.github.io) and [secartifacts](https://secartifacts.github.io) for publishing detailed evaluation results. Inspired by [Systems Circus](https://nebelwelt.net/pubstats/) and [csrankings.org](https://csrankings.org).

---

## API Access

The full artifact dataset is available as a public JSON endpoint for programmatic access:

```
GET {{ site.url }}{{ site.baseurl }}/assets/data/search_data.json
```

Returns an array of all {{ site.data.summary.total_artifacts }} artifacts with title, authors, affiliations, conference, year, badges, and repository/artifact URLs. No authentication required.

Example using `curl`:

```bash
# Get all artifacts
curl -s {{ site.url }}{{ site.baseurl }}/assets/data/search_data.json | python3 -c "
import sys, json
data = json.load(sys.stdin)
# Filter: fuzzing papers from 2024
results = [a for a in data if 'fuzz' in a['title'].lower() and a['year'] == 2024]
print(json.dumps(results, indent=2))
"
```
