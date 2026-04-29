---
title: "Systems vs. Security — Longitudinal Comparison"
permalink: /overview.html
---

<link rel="stylesheet" href="{{ '/assets/css/reprodb-charts.css' | relative_url }}">

A side-by-side longitudinal comparison of artifact evaluation across **systems** and **security** conferences tracked in ReproDB ({{ site.data.summary.year_range }}).

{% if site.data.summary %}

## High-Level Summary

<div class="rdb-cards">
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.summary.total_artifacts }}</div>
    <div class="rdb-card-label">Total Artifacts</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.summary.total_conferences }}</div>
    <div class="rdb-card-label">Conferences</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.summary.year_range }}</div>
    <div class="rdb-card-label">Year Range</div>
  </div>
</div>

| | Systems | Security |
|---|:---:|:---:|
| **Total Artifacts** | {{ site.data.summary.systems_artifacts }} | {{ site.data.summary.security_artifacts }} |
| **Conferences** | {{ site.data.summary.systems_conferences | size }} ({{ site.data.summary.systems_conferences | join: ", " }}) | {{ site.data.summary.security_conferences | size }} ({{ site.data.summary.security_conferences | join: ", " }}) |
{% if site.data.committee_stats %}| **AE Committee Members** | {{ site.data.committee_stats.total_systems }} | {{ site.data.committee_stats.total_security }} |
| **Unique AE Members** | {{ site.data.committee_stats.unique_members_systems }} | {{ site.data.committee_stats.unique_members_security }} |{% endif %}

---

## Artifact Growth Over Time

Total evaluated artifacts per year, split by area. Security adopted AE earlier (2017) than systems (2019) and grew faster, though much of the gap reflects venue expansion rather than per-venue increases.

<div class="rdb-chart-wide rdb-chart-wrap--xl">
  <canvas id="artifactGrowthChart"></canvas>
</div>

---

## Badge & Participation Rates

Percentage of artifacts receiving each badge type (top row) and badge rates as a fraction of all accepted papers (bottom row). Open-science mandates — such as USENIX Security's 2025 policy — are the strongest lever, more than doubling participation in a single year.

<div class="rdb-chart-row">
  <div class="rdb-chart-col">
    <h4>Systems — % of AE Artifacts</h4>
    <div class="rdb-chart-wrap rdb-chart-wrap--sm">
      <canvas id="badgeChartSys"></canvas>
    </div>
  </div>
  <div class="rdb-chart-col">
    <h4>Security — % of AE Artifacts</h4>
    <div class="rdb-chart-wrap rdb-chart-wrap--sm">
      <canvas id="badgeChartSec"></canvas>
    </div>
  </div>
</div>

### Available, Functional & Reproduced: Systems vs. Security

<div class="rdb-chart-wide rdb-chart-wrap--lg">
  <canvas id="badgeRateCompareChart"></canvas>
</div>

<div class="rdb-chart-wide rdb-chart-wrap--lg">
  <canvas id="partRateChartCombined"></canvas>
</div>

---

## Conference Timeline Coverage

Artifact counts by conference and year. Darker cells indicate more artifacts evaluated that year.

<div class="rdb-chart-wide">
  <canvas id="timelineHeatmap"></canvas>
</div>

---

## Top Institutions by Area

Top-10 institutions by combined score (artifact creation + AE service) for each area. Institutions specialize: some lean towards artifact creation (producers), others towards evaluation service (consumers), and a few maintain balanced profiles. The two communities have largely distinct institutional ecosystems.

<div class="rdb-chart-row">
  <div class="rdb-chart-col">
    <canvas id="instChartSys" height="340"></canvas>
  </div>
  <div class="rdb-chart-col">
    <canvas id="instChartSec" height="340"></canvas>
  </div>
</div>

<div class="rdb-chart-wide rdb-chart-wrap--xl">
  <canvas id="instScatterChart"></canvas>
</div>
<div class="rdb-scatter-legend">
  <span>Security</span>
  <canvas id="instScatterLegend"></canvas>
  <span>Systems</span>
</div>
<p class="rdb-scatter-caption">Each bubble is an institution. X = artifact score, Y = AE service score, size = combined score. Color indicates the systems/security balance. Only institutions with combined score &ge; 50 are shown.</p>

{% else %}

*Statistics data is being generated. Please check back soon.*

{% endif %}

<!-- Data blob: Liquid injects site data, JS reads it -->
<script id="overview-data" type="application/json">
{
  "years": [{% for y in site.data.artifacts_by_year %}"{{ y.year }}"{% unless forloop.last %},{% endunless %}{% endfor %}],
  "sysCounts": [{% for y in site.data.artifacts_by_year %}{{ y.systems }}{% unless forloop.last %},{% endunless %}{% endfor %}],
  "secCounts": [{% for y in site.data.artifacts_by_year %}{{ y.security }}{% unless forloop.last %},{% endunless %}{% endfor %}],
  "totCounts": [{% for y in site.data.artifacts_by_year %}{{ y.count }}{% unless forloop.last %},{% endunless %}{% endfor %}],
  "conferences": [
    {% for conf in site.data.artifacts_by_conference %}
    {
      "name": "{{ conf.name }}",
      "category": "{{ conf.category }}",
      "years_data": [
        {% for yd in conf.years %}
        { "year": {{ yd.year }}, "total": {{ yd.total }}, "available": {{ yd.available }}, "functional": {{ yd.functional }}, "reproducible": {{ yd.reproducible }}, "reusable": {{ yd.reusable }} }{% unless forloop.last %},{% endunless %}
        {% endfor %}
      ]
    }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ],
  "participationUrl": "{{ '/assets/data/participation_stats.json' | relative_url }}",
  "sysInstUrl": "{{ '/assets/data/systems_institution_rankings.json' | relative_url }}",
  "secInstUrl": "{{ '/assets/data/security_institution_rankings.json' | relative_url }}"
}
</script>
<script src="{{ '/assets/js/reprodb-overview.js' | relative_url }}"></script>
