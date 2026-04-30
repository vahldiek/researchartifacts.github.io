---
title: "AE Committee Statistics"
permalink: /committee.html
---

<link rel="stylesheet" href="{{ '/assets/css/reprodb-charts.css' | relative_url }}">

A cross-community analysis of Artifact Evaluation Committee composition, retention, and geographic diversity — comparing **systems** and **security** conferences tracked in ReproDB.

{% if site.data.committee_stats %}

## Overview

<div class="rdb-cards">
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.committee_stats.unique_members }}</div>
    <div class="rdb-card-label">Unique Members</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.committee_stats.total_countries }}</div>
    <div class="rdb-card-label">Countries</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.committee_stats.total_institutions }}</div>
    <div class="rdb-card-label">Institutions</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.committee_stats.total_conferences }}</div>
    <div class="rdb-card-label">Conference-Years</div>
  </div>
</div>

| | Systems | Security |
|---|:---:|:---:|
| **Total Assignments** | {{ site.data.committee_stats.total_systems }} | {{ site.data.committee_stats.total_security }} |
| **Unique Members** | {{ site.data.committee_stats.unique_members_systems }} | {{ site.data.committee_stats.unique_members_security }} |

---

## Committee Sizes by Conference

Darker cells indicate larger committees. Cells below 5 members (likely incomplete data) are omitted.

<div class="rdb-chart-wide" style="overflow-x:auto;">
  <canvas id="committeeSizesHeatmap"></canvas>
</div>

---

## Committee Growth

Total committee assignments per year, split by area. Growth reflects both new conferences adopting AE processes and existing committees scaling up.

<div class="rdb-chart-wide rdb-chart-wrap--xl">
  <canvas id="committeeGrowthChart"></canvas>
</div>

---

## Service Frequency

How many terms do evaluators serve? Most serve once, but a growing cohort returns repeatedly — building institutional knowledge.

<div class="rdb-chart-wide rdb-chart-wrap--lg">
  <canvas id="serviceFrequencyChart"></canvas>
</div>

---

## Retention Trends

Year-over-year retention: what fraction of each year's committee served in the same area the previous year? Rising retention indicates growing evaluator commitment and community stability.

<div class="rdb-chart-wide rdb-chart-wrap--lg">
  <canvas id="retentionChart"></canvas>
</div>

---

## Geographic Diversity

<div class="rdb-chart-row">
  <div class="rdb-chart-col">
    <div class="rdb-chart-wrap rdb-chart-wrap--sm">
      <canvas id="continentSysChart"></canvas>
    </div>
  </div>
  <div class="rdb-chart-col">
    <div class="rdb-chart-wrap rdb-chart-wrap--sm">
      <canvas id="continentSecChart"></canvas>
    </div>
  </div>
</div>

<div style="display:none;"><canvas id="committeeContinentsChart"></canvas></div>

---

## Top Countries — Systems vs Security

North America dominates both areas, but geographic profiles differ: Europe has a larger share in security committees.

<div class="rdb-chart-wide rdb-chart-wrap--xl">
  <canvas id="committeeCountriesChart"></canvas>
</div>

---

## Top Institutions by Area

<div class="rdb-chart-row">
  <div class="rdb-chart-col">
    <div class="rdb-chart-wrap rdb-chart-wrap--lg">
      <canvas id="instSysChart"></canvas>
    </div>
  </div>
  <div class="rdb-chart-col">
    <div class="rdb-chart-wrap rdb-chart-wrap--lg">
      <canvas id="instSecChart"></canvas>
    </div>
  </div>
</div>

<div style="display:none;"><canvas id="committeeInstitutionsChart"></canvas></div>

---

## Cross-Community Overlap

Only a small fraction of evaluators serve in both systems and security — the two communities have largely separate AE member pools.

<div class="rdb-chart-wide rdb-chart-wrap--md">
  <canvas id="crossOverlapChart"></canvas>
</div>

---

## Data Coverage Notes

- **ATC & OSDI** share the same AE committee at USENIX, so committee members appear under both conferences for years 2022–2024.
- Some conference-years show only chairs (no full committee): ATC 2023, OSDI 2023, SOSP 2024–2026.

{% else %}

*Committee statistics data is being generated. Please check back soon.*

{% endif %}

<script id="committee-page-data" type="application/json">
{
  "area": "overall",
  "committeeStatsUrl": "{{ '/assets/data/committee_stats.json' | relative_url }}",
  "aeMembersUrl": "{{ '/assets/data/ae_members.json' | relative_url }}"
}
</script>
<script src="{{ '/assets/js/reprodb-committee.js' | relative_url }}"></script>

---

**Data:** [Committee Statistics]({{ '/assets/data/committee_stats.json' | relative_url }}) | [AE Members]({{ '/assets/data/ae_members.json' | relative_url }})
