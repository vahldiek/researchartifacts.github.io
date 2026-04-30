---
title: "Systems: AE Committee Statistics"
permalink: /systems/committee.html
---

<link rel="stylesheet" href="{{ '/assets/css/reprodb-charts.css' | relative_url }}">

Composition, retention, and geographic diversity of Artifact Evaluation Committee members at **systems** conferences.

{% if site.data.committee_stats %}

## Overview

<div class="rdb-cards">
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.committee_stats.unique_members_systems }}</div>
    <div class="rdb-card-label">Unique Members</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.committee_stats.total_systems }}</div>
    <div class="rdb-card-label">Total Assignments</div>
  </div>
</div>

---

## Committee Sizes by Conference

<div class="rdb-chart-wide" style="overflow-x:auto;">
  <canvas id="committeeSizesHeatmap"></canvas>
</div>

---

## Growth Over Time

<div class="rdb-chart-wide rdb-chart-wrap--xl">
  <canvas id="committeeGrowthChart"></canvas>
</div>

---

## Service Frequency

<div class="rdb-chart-wide rdb-chart-wrap--lg">
  <canvas id="serviceFrequencyChart"></canvas>
</div>

---

## Retention Trends

<div class="rdb-chart-wide rdb-chart-wrap--lg">
  <canvas id="retentionChart"></canvas>
</div>

---

## Members by Continent

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
  "area": "systems",
  "committeeStatsUrl": "{{ '/assets/data/committee_stats.json' | relative_url }}",
  "aeMembersUrl": "{{ '/assets/data/ae_members.json' | relative_url }}"
}
</script>
<script src="{{ '/assets/js/reprodb-committee.js' | relative_url }}"></script>

---

**Data:** [Committee Statistics]({{ '/assets/data/committee_stats.json' | relative_url }}) | [AE Members]({{ '/assets/data/ae_members.json' | relative_url }})
