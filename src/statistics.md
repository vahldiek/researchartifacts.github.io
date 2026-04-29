---
title: "Geographic Statistics"
permalink: /statistics/
description: Institution statistics aggregated by country and continent
---

<link rel="stylesheet" href="{{ '/assets/css/reprodb-charts.css' | relative_url }}">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flag-icons@7.0.0/css/flag-icons.min.css">

How artifact evaluation engagement is distributed geographically — aggregated from {{ site.data.summary.total_conferences }} conferences and {{ site.data.summary.total_artifacts }} artifacts.

<div id="geo-loading"><em>Loading institution data…</em></div>

<div id="geo-content" class="rdb-hidden" markdown="1">

## At a Glance

<div class="rdb-cards">
  <div class="rdb-card">
    <div class="rdb-card-value" id="statCountries">—</div>
    <div class="rdb-card-label">Countries</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value" id="statContinents">—</div>
    <div class="rdb-card-label">Continents</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value" id="statInstitutions">—</div>
    <div class="rdb-card-label">Institutions</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value" id="statArtifacts">—</div>
    <div class="rdb-card-label">Artifacts</div>
  </div>
</div>

---

## Continental Overview

Artifact evaluation is heavily concentrated in three regions: North America, Europe, and Asia account for &gt;98% of all activity. The donut shows artifact share; the bar shows the split between artifact creation and AE committee service.

<div class="rdb-chart-row">
  <div class="rdb-chart-col">
    <div class="rdb-chart-wrap rdb-chart-wrap--lg">
      <canvas id="chartContinentDonut"></canvas>
    </div>
  </div>
  <div class="rdb-chart-col">
    <div class="rdb-chart-wrap rdb-chart-wrap--lg">
      <canvas id="chartContinentBar"></canvas>
    </div>
  </div>
</div>

---

## Top Countries

The top 15 countries by combined activity score (artifact creation + AE committee service). The United States dominates both, followed by China and Germany.

<div class="rdb-chart-wide rdb-chart-wrap--xl">
  <canvas id="chartCountryBar"></canvas>
</div>

---

## Availability vs. Reproducibility

Each bubble is a country (≥5 artifacts). X-axis = artifact availability rate (% of papers with an artifact), Y-axis = reproducibility rate (% of artifacts that achieved the "reproduced" badge), bubble size = number of institutions. Colored by continent.

<div class="rdb-chart-wide rdb-chart-wrap--xl">
  <canvas id="chartReproBubble"></canvas>
</div>

---

## Trends Over Time

Activity growth by continent and by top-8 countries. The rapid expansion of Chinese institutions since 2022 is especially visible, as is the continued dominance of North America and Europe.

<div class="rdb-chart-grid">
  <div class="rdb-chart-wrap rdb-chart-wrap--lg"><canvas id="chartContinentTrend"></canvas></div>
  <div class="rdb-chart-wrap rdb-chart-wrap--lg"><canvas id="chartCountryTrend"></canvas></div>
</div>

### AE Committee Service

Geographic diversity of AE committee membership over time. Europe and North America provide the majority of evaluators, but Asian participation is growing.

<div class="rdb-chart-wide rdb-chart-wrap--lg">
  <canvas id="chartAETrend"></canvas>
</div>

---

## All Countries

<div class="rdb-filter-bar">
  <input id="geoSearch" type="text" placeholder="Filter countries…">
</div>
<div id="countryCardsContainer" class="rdb-country-cards"></div>

</div><!-- /geo-content -->

<!-- Data bridge -->
<script id="geo-data" type="application/json">
{
  "geoUrl": "{{ '/assets/data/geographic_statistics.json' | relative_url }}",
  "instUrl": "{{ '/assets/data/institution_rankings.json' | relative_url }}",
  "aeUrl": "{{ '/assets/data/ae_members.json' | relative_url }}"
}
</script>
<script src="{{ '/assets/js/reprodb-geo.js' | relative_url }}"></script>
