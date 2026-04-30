---
title: "AE Chair Statistics"
permalink: /ae_chairs.html
chair_data_url: /assets/data/ae_chairs.json
chair_stats_url: /assets/data/chair_stats.json
---

<link rel="stylesheet" href="{{ '/assets/css/reprodb-charts.css' | relative_url }}">

A dedicated view of **Artifact Evaluation Committee chairs** — the people who organize and lead the AE process across systems and security conferences.

{% if site.data.committee_stats.chair_stats %}

## Overview

<div class="rdb-cards">
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.committee_stats.chair_stats.total_chairs }}</div>
    <div class="rdb-card-label">Unique Chairs</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.committee_stats.chair_stats.repeat_chairs }}</div>
    <div class="rdb-card-label">Repeat Chairs</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.committee_stats.chair_stats.cross_conference_chairs }}</div>
    <div class="rdb-card-label">Cross-Conference</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.committee_stats.chair_stats.pipeline_promoted_pct }}%</div>
    <div class="rdb-card-label">Promoted from Member</div>
  </div>
</div>

| | All | Systems | Security |
|---|:---:|:---:|:---:|
| **Unique Chairs** | {{ site.data.committee_stats.chair_stats.total_chairs }} | {{ site.data.committee_stats.chair_stats.total_chairs_systems }} | {{ site.data.committee_stats.chair_stats.total_chairs_security }} |
| **Repeat Chairs** | {{ site.data.committee_stats.chair_stats.repeat_chairs }} | — | — |
| **Avg. Chairs/Edition** | {{ site.data.committee_stats.chair_stats.avg_chairs_per_edition }} | — | — |

---

## Member-to-Chair Pipeline

Of all chairs, **{{ site.data.committee_stats.chair_stats.pipeline_promoted_pct }}%** served as regular AE members before being promoted to chair, taking an average of **{{ site.data.committee_stats.chair_stats.pipeline_avg_years }} years** to make the transition. This indicates a healthy mentorship pipeline where experienced reviewers graduate to leadership roles.

---

## Retention & Cross-Conference Service

- **{{ site.data.committee_stats.chair_stats.repeat_chairs_pct }}%** of chairs have chaired more than once
- **{{ site.data.committee_stats.chair_stats.cross_conference_chairs }}** chairs have led AE processes at multiple different conference series

{% endif %}

---

## Geographic Diversity

<div id="geo-loading">Loading geographic data…</div>
<div id="geo-section" style="display:none;">

Chairs represent <strong><span id="geo-countries"></span> countries</strong> across <strong><span id="geo-continents"></span> continents</strong>.

### By Continent

<div class="table-responsive">
<table class="table table-sm" id="geo-continent-table">
<thead><tr><th>Continent</th><th>Chairs</th><th>Share</th></tr></thead>
<tbody></tbody>
</table>
</div>

### By Country

<div class="table-responsive">
<table class="table table-sm" id="geo-country-table">
<thead><tr><th>Country</th><th>Chairs</th><th>Share</th></tr></thead>
<tbody></tbody>
</table>
</div>
</div>

<script>
(function() {
  fetch('{{ "/assets/data/chair_stats.json" | relative_url }}')
    .then(r => r.json())
    .then(data => {
      const geo = data.geographic;
      if (!geo) return;
      document.getElementById('geo-loading').style.display = 'none';
      document.getElementById('geo-section').style.display = '';
      document.getElementById('geo-countries').textContent = geo.total_countries;
      document.getElementById('geo-continents').textContent = geo.total_continents;

      const total = Object.values(geo.by_continent).reduce((a,b) => a+b, 0);

      // Continent table
      const cBody = document.querySelector('#geo-continent-table tbody');
      Object.entries(geo.by_continent)
        .sort((a,b) => b[1]-a[1])
        .forEach(([name, count]) => {
          const pct = (100*count/total).toFixed(1);
          cBody.insertAdjacentHTML('beforeend',
            `<tr><td>${name}</td><td>${count}</td><td>${pct}%</td></tr>`);
        });

      // Country table
      const kBody = document.querySelector('#geo-country-table tbody');
      Object.entries(geo.by_country)
        .sort((a,b) => b[1]-a[1])
        .forEach(([name, count]) => {
          const pct = (100*count/total).toFixed(1);
          kBody.insertAdjacentHTML('beforeend',
            `<tr><td>${name}</td><td>${count}</td><td>${pct}%</td></tr>`);
        });
    })
    .catch(() => {
      document.getElementById('geo-loading').textContent = 'Geographic data not available.';
    });
})();
</script>

---

## List of AE Chairs

All AE chairs across tracked conferences. The **Pipeline** column shows years from first AE member role to first chair role (— = started directly as chair).

{% include ae_chair_table.html %}

---

**Data:** [All Chairs]({{ '/assets/data/ae_chairs.json' | relative_url }}) | [Chair Stats]({{ '/assets/data/chair_stats.json' | relative_url }})
