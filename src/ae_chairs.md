---
title: "AE Chair Statistics"
permalink: /ae_chairs.html
chair_data_url: /assets/data/ae_chairs.json
chair_stats_url: /assets/data/chair_stats.json
---

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
| **Repeat Chairs** | {{ site.data.committee_stats.chair_stats.repeat_chairs }} | {{ site.data.committee_stats.chair_stats.repeat_chairs_systems }} | {{ site.data.committee_stats.chair_stats.repeat_chairs_security }} |
| **Avg. Chairs/Edition** | {{ site.data.committee_stats.chair_stats.avg_chairs_per_edition }} | {{ site.data.committee_stats.chair_stats.avg_chairs_per_edition_systems }} | {{ site.data.committee_stats.chair_stats.avg_chairs_per_edition_security }} |

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

Chairs represent **{{ site.data.committee_stats.chair_stats.total_countries }} countries** across **{{ site.data.committee_stats.chair_stats.total_continents }} continents**.

<div class="rdb-chart-row">
  <div class="rdb-chart-col">
    <div class="rdb-chart-wrap rdb-chart-wrap--xl">
      <canvas id="chairContinentChart"></canvas>
    </div>
  </div>
  <div class="rdb-chart-col">
    <div class="rdb-chart-wrap rdb-chart-wrap--xl">
      <canvas id="chairCountryChart"></canvas>
    </div>
  </div>
</div>

<script>
(function() {
  var SYS_COLOR  = '#2980b9';
  var CONTINENT_COLORS = {
    'North America': '#2980b9',
    'Europe': '#27ae60',
    'Asia': '#f39c12',
    'South America': '#8e44ad',
    'Oceania': '#16a085',
    'Africa': '#d35400'
  };

  fetch('{{ "/assets/data/chair_stats.json" | relative_url }}')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var geo = data.geographic;
      if (!geo) return;

      // Continent doughnut
      var continentCanvas = document.getElementById('chairContinentChart');
      if (continentCanvas) {
        var continents = Object.entries(geo.by_continent).sort(function(a,b) { return b[1]-a[1]; });
        new Chart(continentCanvas, {
          type: 'doughnut',
          data: {
            labels: continents.map(function(c) { return c[0]; }),
            datasets: [{
              data: continents.map(function(c) { return c[1]; }),
              backgroundColor: continents.map(function(c) { return CONTINENT_COLORS[c[0]] || '#95a5a6'; })
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: 'Chairs by Continent' },
              legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
            }
          }
        });
      }

      // Country horizontal bar
      var countryCanvas = document.getElementById('chairCountryChart');
      if (countryCanvas) {
        var countries = Object.entries(geo.by_country).sort(function(a,b) { return b[1]-a[1]; }).slice(0, 15);
        new Chart(countryCanvas, {
          type: 'bar',
          data: {
            labels: countries.map(function(c) { return c[0]; }),
            datasets: [{
              label: 'Chairs',
              data: countries.map(function(c) { return c[1]; }),
              backgroundColor: SYS_COLOR
            }]
          },
          options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: 'Top Countries' },
              legend: { display: false }
            },
            scales: {
              x: { beginAtZero: true, title: { display: true, text: 'Chairs' } }
            }
          }
        });
      }
    })
    .catch(function() {});
})();
</script>

---

## List of AE Chairs

All AE chairs across tracked conferences. The **Pipeline** column shows years from first AE member role to first chair role (— = started directly as chair).

{% include ae_chair_table.html %}

---

**Data:** [All Chairs]({{ '/assets/data/ae_chairs.json' | relative_url }}) | [Chair Stats]({{ '/assets/data/chair_stats.json' | relative_url }})
