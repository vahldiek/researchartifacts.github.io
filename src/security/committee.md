---
title: "Security: AE Committee Statistics"
permalink: /security/committee.html
---

Composition, retention, and geographic diversity of Artifact Evaluation Committee members at **security** conferences.

{% if site.data.committee_stats %}

## Overview

<div class="rdb-cards">
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.committee_stats.unique_members_security }}</div>
    <div class="rdb-card-label">Unique Members</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.committee_stats.total_security }}</div>
    <div class="rdb-card-label">Total Assignments</div>
  </div>
</div>

---

## Committee Sizes by Conference

Darker cells indicate larger committees. Cells below 5 members (likely incomplete data) are omitted.

<div class="rdb-chart-wide" style="overflow-x:auto;">
  <canvas id="committeeSizesHeatmap"></canvas>
</div>

---

## Growth Over Time

Total committee assignments per year. Growth reflects both new conferences adopting AE processes and existing committees scaling up.

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

Year-over-year retention: what fraction of each year's committee served the previous year? The dashed line tracks retention across area boundaries (e.g., a security evaluator who also served in systems counts as retained).

<div class="rdb-chart-wide rdb-chart-wrap--lg">
  <canvas id="retentionChart"></canvas>
</div>

---

## Members by Continent

Geographic distribution of security AE committee members by continent.

<div class="rdb-chart-wide rdb-chart-wrap--sm" style="max-width:500px;">
  <canvas id="committeeContinentsChart"></canvas>
</div>

---

## Top Countries

<div class="rdb-chart-wide rdb-chart-wrap--xl">
  <canvas id="committeeCountriesChart"></canvas>
</div>

---

## Top Institutions

<div class="rdb-chart-wide rdb-chart-wrap--xl">
  <canvas id="committeeInstitutionsChart"></canvas>
</div>

{% else %}

*Committee statistics data is being generated. Please check back soon.*

{% endif %}

<script id="committee-page-data" type="application/json">
{
  "area": "security",
  "committeeStatsUrl": "{{ '/assets/data/committee_stats.json' | relative_url }}",
  "aeMembersUrl": "{{ '/assets/data/ae_members.json' | relative_url }}"
}
</script>
<script src="{{ '/assets/js/reprodb-committee.js' | relative_url }}"></script>

---

**Data:** [Committee Statistics]({{ '/assets/data/committee_stats.json' | relative_url }}) | [AE Members]({{ '/assets/data/ae_members.json' | relative_url }})
