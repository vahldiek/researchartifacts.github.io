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
    <div class="rdb-card-value">{{ site.data.committee_stats.chair_stats.avg_chairs_per_edition }}</div>
    <div class="rdb-card-label">Avg. Chairs/Edition</div>
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

---

## Member-to-Chair Pipeline

Of all chairs, **{{ site.data.committee_stats.chair_stats.pipeline_promoted_pct }}%** served as regular AE members before being promoted to chair, taking an average of **{{ site.data.committee_stats.chair_stats.pipeline_avg_years }} years** to make the transition. This indicates a healthy mentorship pipeline where experienced reviewers graduate to leadership roles.

---

## Retention & Cross-Conference Service

- **{{ site.data.committee_stats.chair_stats.repeat_chairs_pct }}%** of chairs have chaired more than once
- **{{ site.data.committee_stats.chair_stats.cross_conference_chairs }}** chairs have led AE processes at multiple different conference series

{% endif %}

---

## Chair Flow Across Conferences

How do AE chairs flow between conferences? This Sankey diagram shows shared chairs between conference AECs in consecutive years.

<div class="rdb-chart-wide">
  <div id="chairFlowSankey" style="width:100%;height:500px"></div>
</div>

---

## Geographic Diversity

Chairs represent **{{ site.data.committee_stats.chair_stats.total_countries }} countries** across **{{ site.data.committee_stats.chair_stats.total_continents }} continents**.

<div class="rdb-chart-row">
  <div class="rdb-chart-col">
    <div class="rdb-chart-wrap rdb-chart-wrap--xl">
      <div id="chairContinentChart" style="height:300px"></div>
    </div>
  </div>
  <div class="rdb-chart-col">
    <div class="rdb-chart-wrap rdb-chart-wrap--xl">
      <div id="chairCountryChart" style="height:300px"></div>
    </div>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  var CONF_COLORS = {
    'ATC': '#2563eb', 'OSDI': '#1d4ed8', 'EUROSYS': '#3b82f6',
    'SOSP': '#60a5fa', 'FAST': '#93c5fd', 'SC': '#7dd3fc',
    'USENIXSEC': '#dc2626', 'NDSS': '#ef4444', 'ACSAC': '#f87171',
    'CHES': '#fb923c', 'PETS': '#f97316', 'WOOT': '#fdba74',
    'SYSTEX': '#a78bfa', 'VEHICLESEC': '#c084fc', 'CAIS': '#e9d5ff'
  };
  function confColor(name) { return CONF_COLORS[name] || '#6b7280'; }

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

      // Continent doughnut (ECharts pie)
      var continentEl = document.getElementById('chairContinentChart');
      if (continentEl) {
        var continents = Object.entries(geo.by_continent).sort(function(a,b) { return b[1]-a[1]; });
        var chart = ReproDB.initEChart(continentEl);
        chart.setOption({
          title: { text: 'Chairs by Continent', left: 'center' },
          tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
          legend: { bottom: 0, type: 'scroll' },
          series: [{
            type: 'pie', radius: ['35%', '65%'],
            data: continents.map(function(c) { return { name: c[0], value: c[1], itemStyle: { color: CONTINENT_COLORS[c[0]] || '#95a5a6' } }; }),
            label: { show: false }, emphasis: { label: { show: true, fontSize: 13 } }
          }]
        });
        ReproDB.registerEChart(chart);
      }

      // Country horizontal bar (ECharts)
      var countryEl = document.getElementById('chairCountryChart');
      if (countryEl) {
        var countries = Object.entries(geo.by_country).sort(function(a,b) { return b[1]-a[1]; }).slice(0, 15).reverse();
        var chart2 = ReproDB.initEChart(countryEl);
        chart2.setOption({
          title: { text: 'Top Countries', left: 'center' },
          tooltip: { trigger: 'axis' },
          grid: { left: 100, right: 20, bottom: 50, top: 40 },
          xAxis: { type: 'value', name: 'Chairs', min: 0, nameLocation: 'center', nameGap: 25 },
          yAxis: { type: 'category', data: countries.map(function(c) { return c[0]; }) },
          series: [{ type: 'bar', data: countries.map(function(c) { return c[1]; }), itemStyle: { color: '#2980b9' } }]
        });
        ReproDB.registerEChart(chart2);
      }
    })
    .catch(function() {});

  // Chair flow Sankey
  fetch('{{ "/assets/data/ae_chairs.json" | relative_url }}')
    .then(function(r) { return r.json(); })
    .then(function(chairs) {
      var el = document.getElementById('chairFlowSankey');
      if (!el || !chairs.length) return;

      var confYear = {};
      chairs.forEach(function(ch) {
        (ch.conferences || []).forEach(function(c) {
          if (c.role !== 'chair') return;
          var key = c.conference + '|' + c.year;
          if (!confYear[key]) confYear[key] = {};
          confYear[key][ch.name] = true;
        });
      });

      var yearSet = {};
      Object.keys(confYear).forEach(function(k) { yearSet[k.split('|')[1]] = true; });
      var years = Object.keys(yearSet).map(Number).sort(function(a, b) { return a - b; });
      if (years.length < 2) return;

      var nodes = [], links = [], nodeSet = {};
      function addNode(name, depth) {
        if (!nodeSet[name]) { nodeSet[name] = true; nodes.push({ name: name, depth: depth }); }
      }

      Object.keys(confYear).forEach(function(key) {
        var parts = key.split('|');
        var label = parts[0] + ' ' + parts[1];
        addNode(label, years.indexOf(Number(parts[1])));
      });

      for (var i = 0; i < years.length - 1; i++) {
        var y1 = years[i], y2 = years[i + 1];
        var confs1 = [], confs2 = [];
        Object.keys(confYear).forEach(function(key) {
          var parts = key.split('|');
          if (Number(parts[1]) === y1) confs1.push(parts[0]);
          if (Number(parts[1]) === y2) confs2.push(parts[0]);
        });
        confs1.forEach(function(c1) {
          var m1 = confYear[c1 + '|' + y1] || {};
          confs2.forEach(function(c2) {
            var m2 = confYear[c2 + '|' + y2] || {};
            var shared = 0;
            Object.keys(m1).forEach(function(n) { if (m2[n]) shared++; });
            if (shared >= 1) {
              links.push({ source: c1 + ' ' + y1, target: c2 + ' ' + y2, value: shared });
            }
          });
        });
      }

      var linkedNodes = {};
      links.forEach(function(l) { linkedNodes[l.source] = true; linkedNodes[l.target] = true; });
      nodes = nodes.filter(function(n) { return linkedNodes[n.name]; });

      if (nodes.length === 0) return;

      var chart = ReproDB.initEChart(el);
      function setOption() {
        var tc = ReproDB.themeColors();
        chart.setOption({
          title: {
            text: 'AE Chair Flow Across Conferences',
            subtext: 'Shared chairs between conference AECs in consecutive years',
            left: 'center',
            textStyle: { fontSize: 14, color: tc.text },
            subtextStyle: { fontSize: 11, color: tc.textMuted }
          },
          tooltip: {
            trigger: 'item',
            formatter: function(params) {
              if (params.dataType === 'edge')
                return params.data.source + ' \u2192 ' + params.data.target + '<br/>' + params.data.value + ' shared chair(s)';
              return params.name + '<br/>' + params.value + ' chair links';
            }
          },
          series: [{
            type: 'sankey',
            top: 60, bottom: 20, left: 60, right: 60,
            nodeGap: 14, nodeWidth: 18,
            emphasis: { focus: 'adjacency' },
            data: nodes.map(function(n) {
              return { name: n.name, depth: n.depth, itemStyle: { color: confColor(n.name.split(' ')[0]) } };
            }),
            links: links,
            lineStyle: { color: 'source', opacity: 0.3, curveness: 0.5 },
            label: { show: true, fontSize: 10, color: tc.text }
          }]
        });
      }
      setOption();
      ReproDB.registerEChart(chart);
      ReproDB.onThemeChange(setOption);
    })
    .catch(function() {});
});
</script>

---

## List of AE Chairs

All AE chairs across tracked conferences. The **Pipeline** column shows years from first AE member role to first chair role (— = started directly as chair).

{% include ae_chair_table.html %}

---

**Data:** [All Chairs]({{ '/assets/data/ae_chairs.json' | relative_url }}) | [Chair Stats]({{ '/assets/data/chair_stats.json' | relative_url }})
