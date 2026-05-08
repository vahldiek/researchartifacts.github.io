---
title: "AE Committee Statistics"
permalink: /committee.html
---

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
  <div id="committeeSizesHeatmap" style="height:300px"></div>
</div>

---

## Committee Growth

Total committee assignments per year, split by area. Growth reflects both new conferences adopting AE processes and existing committees scaling up.

<div class="rdb-chart-wide rdb-chart-wrap--xl">
  <div id="committeeGrowthChart" style="width:100%;height:100%"></div>
</div>

---

## Service Frequency

How many terms do evaluators serve? Most serve once, but a growing cohort returns repeatedly — building institutional knowledge.

<div class="rdb-chart-wide rdb-chart-wrap--lg">
  <div id="serviceFrequencyChart" style="width:100%;height:100%"></div>
</div>

---

## Retention Trends

Year-over-year retention: what fraction of each year's committee served the previous year? The "overall" line tracks retention across area boundaries (e.g., a security evaluator who switches to systems counts as retained).

<div class="rdb-chart-wide rdb-chart-wrap--lg">
  <div id="retentionChart" style="width:100%;height:100%"></div>
</div>

---

## AE Committee Flow

How do AE committee members flow between conferences? This Sankey diagram shows shared members between conference AECs in consecutive years — revealing which conferences share evaluator pools and how members move across venues.

<div class="rdb-chart-wide">
  <div id="memberFlowSankey" style="width:100%;height:700px"></div>
</div>

---

## Geographic Diversity

<div class="rdb-chart-row">
  <div class="rdb-chart-col">
    <div class="rdb-chart-wrap rdb-chart-wrap--sm">
      <div id="continentSysChart" style="width:100%;height:100%"></div>
    </div>
  </div>
  <div class="rdb-chart-col">
    <div class="rdb-chart-wrap rdb-chart-wrap--sm">
      <div id="continentSecChart" style="width:100%;height:100%"></div>
    </div>
  </div>
</div>

<div style="display:none;"><div id="committeeContinentsChart" style="height:1px"></div></div>

---

## Top Countries — Systems vs Security

North America dominates both areas, but geographic profiles differ: Europe has a larger share in security committees.

<div class="rdb-chart-wide rdb-chart-wrap--xl">
  <div id="committeeCountriesChart" style="width:100%;height:100%"></div>
</div>

---

## Top Institutions by Area

<div class="rdb-chart-row">
  <div class="rdb-chart-col">
    <div class="rdb-chart-wrap rdb-chart-wrap--lg">
      <div id="instSysChart" style="width:100%;height:100%"></div>
    </div>
  </div>
  <div class="rdb-chart-col">
    <div class="rdb-chart-wrap rdb-chart-wrap--lg">
      <div id="instSecChart" style="width:100%;height:100%"></div>
    </div>
  </div>
</div>

<div style="display:none;"><div id="committeeInstitutionsChart" style="height:1px"></div></div>

---

## Cross-Community Overlap

Only a small fraction of evaluators serve in both systems and security — the two communities have largely separate AE member pools.

<div class="rdb-chart-wide rdb-chart-wrap--md">
  <div id="crossOverlapChart" style="width:100%;height:100%"></div>
</div>

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
