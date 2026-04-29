---
title: "Systems vs. Security — Longitudinal Comparison"
permalink: /overview.html
---

A side-by-side longitudinal comparison of artifact evaluation across **systems** and **security** conferences tracked in ReproDB ({{ site.data.summary.year_range }}).

{% if site.data.summary %}

## High-Level Summary

<div style="display:flex; flex-wrap:wrap; gap:16px; margin:1em 0;">
  <div style="flex:1; min-width:200px; padding:16px; border:1px solid #ddd; border-radius:8px; text-align:center;">
    <div style="font-size:2em; font-weight:bold;">{{ site.data.summary.total_artifacts }}</div>
    <div style="color:#666;">Total Artifacts</div>
  </div>
  <div style="flex:1; min-width:200px; padding:16px; border:1px solid #ddd; border-radius:8px; text-align:center;">
    <div style="font-size:2em; font-weight:bold;">{{ site.data.summary.total_conferences }}</div>
    <div style="color:#666;">Conferences</div>
  </div>
  <div style="flex:1; min-width:200px; padding:16px; border:1px solid #ddd; border-radius:8px; text-align:center;">
    <div style="font-size:2em; font-weight:bold;">{{ site.data.summary.year_range }}</div>
    <div style="color:#666;">Year Range</div>
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

<div style="position:relative; width:100%; max-width:900px; margin:1em auto; height:400px;">
  <canvas id="artifactGrowthChart"></canvas>
</div>

---

## Badge Distribution Comparison

Percentage of artifacts receiving each badge type, by area. Systems conferences consistently show higher badge depth, while security venues have been converging in recent years.

<div style="display:flex; flex-wrap:wrap; gap:16px; justify-content:center;">
  <div style="position:relative; flex:1; min-width:400px; max-width:600px; height:260px;">
    <h4 style="text-align:center; margin-bottom:4px;">Systems</h4>
    <canvas id="badgeChartSys"></canvas>
  </div>
  <div style="position:relative; flex:1; min-width:400px; max-width:600px; height:260px;">
    <h4 style="text-align:center; margin-bottom:4px;">Security</h4>
    <canvas id="badgeChartSec"></canvas>
  </div>
</div>

<div style="position:relative; width:100%; max-width:900px; margin:2em auto; height:300px;">
  <canvas id="badgeRateCompareChart"></canvas>
</div>

---

## AE Participation &amp; Badge Rates (% of Accepted Papers)

Badge rates as a fraction of **all accepted papers** (not just AE submissions) reveal the true penetration of artifact evaluation. Open-science mandates — such as USENIX Security's 2025 policy — are the strongest lever, more than doubling participation in a single year.

<div style="display:flex; flex-wrap:wrap; gap:16px; justify-content:center;">
  <div style="flex:1; min-width:400px; max-width:600px;">
    <canvas id="partRateChartSys" height="280"></canvas>
  </div>
  <div style="flex:1; min-width:400px; max-width:600px;">
    <canvas id="partRateChartSec" height="280"></canvas>
  </div>
</div>

---

## Conference Timeline Coverage

Which conferences have been tracked per year. Filled cells denote years with artifact data; blank cells indicate no AE process or data not yet collected.

{% assign _years = "" %}
{% for y in site.data.artifacts_by_year %}
  {% if _years == "" %}{% assign _years = y.year %}{% else %}{% assign _years = _years | append: "," | append: y.year %}{% endif %}
{% endfor %}
{% assign _year_list = _years | split: "," %}

| Conference | Area | {% for y in _year_list %}{{ y }} | {% endfor %}Total |
|---|---|{% for y in _year_list %}:---:|{% endfor %}:---:|
{% for conf in site.data.artifacts_by_conference %}{% assign _conf_url = '/' | append: conf.category | append: '/' | append: conf.name | downcase | append: '.html' %}| [**{{ conf.name }}**]({{ _conf_url | relative_url }}) | {{ conf.category | capitalize }} | {% for ys in _year_list %}{% assign y_num = ys | plus: 0 %}{% assign _found = false %}{% for yd in conf.years %}{% if yd.year == y_num %}{% assign _found = true %}{{ yd.total }}{% endif %}{% endfor %}{% unless _found %}–{% endunless %} | {% endfor %}**{{ conf.total_artifacts }}** |
{% endfor %}

---

## Top Institutions by Area

Top-10 institutions by combined score (artifact creation + AE service) for each area. Institutions specialize: some lean towards artifact creation (producers), others towards evaluation service (consumers), and a few maintain balanced profiles. The two communities have largely distinct institutional ecosystems.

<div style="display:flex; flex-wrap:wrap; gap:16px; justify-content:center;">
  <div style="flex:1; min-width:400px; max-width:600px;">
    <canvas id="instChartSys" height="340"></canvas>
  </div>
  <div style="flex:1; min-width:400px; max-width:600px;">
    <canvas id="instChartSec" height="340"></canvas>
  </div>
</div>

<div style="position:relative; width:100%; max-width:900px; margin:2em auto; height:400px;">
  <canvas id="instScatterChart"></canvas>
</div>
<p style="text-align:center; font-size:0.9em; color:#666;">Each bubble is an institution. X = artifact score, Y = AE service score, size = combined score. Only institutions with combined score &ge; 50 are shown.</p>

See the full [Institution Rankings]({{ '/institution_rankings.html' | relative_url }}) for details, or explore the [Systems]({{ '/systems/' | relative_url }}) and [Security]({{ '/security/' | relative_url }}) area pages.

{% else %}

*Statistics data is being generated. Please check back soon.*

{% endif %}

---

<small>Last updated: {{ site.data.summary.last_updated | default: "unknown" }}. Data sourced from <a href="https://sysartifacts.github.io">sysartifacts</a> and <a href="https://secartifacts.github.io">secartifacts</a>.</small>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  /* ---------- colour palette ---------- */
  var SYS_COLOR  = '#2980b9';
  var SEC_COLOR  = '#c0392b';
  var BADGE_COLORS = {available:'#27ae60', functional:'#2980b9', reproducible:'#8e44ad', reusable:'#e67e22'};

  var years = [{% for y in site.data.artifacts_by_year %}"{{ y.year }}"{% unless forloop.last %},{% endunless %}{% endfor %}];

  /* ===== 1. Artifact Growth Chart ===== */
  var sysCounts = [{% for y in site.data.artifacts_by_year %}{{ y.systems }}{% unless forloop.last %},{% endunless %}{% endfor %}];
  var secCounts = [{% for y in site.data.artifacts_by_year %}{{ y.security }}{% unless forloop.last %},{% endunless %}{% endfor %}];
  var totCounts = [{% for y in site.data.artifacts_by_year %}{{ y.count }}{% unless forloop.last %},{% endunless %}{% endfor %}];

  new Chart(document.getElementById('artifactGrowthChart'), {
    type: 'bar',
    data: {
      labels: years,
      datasets: [
        { label: 'Systems', data: sysCounts, backgroundColor: SYS_COLOR, stack: 'stack0', order: 2 },
        { label: 'Security', data: secCounts, backgroundColor: SEC_COLOR, stack: 'stack0', order: 2 },
        { label: 'Total', data: totCounts, type: 'line', borderColor: '#333', borderWidth: 2, pointRadius: 3, fill: false, order: 1 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { title: { display: true, text: 'Evaluated Artifacts per Year' } },
      scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Artifacts' } } }
    }
  });

  /* ===== 2. Badge Distribution (per area, over time) ===== */
  var sysYearBadges = {};
  var secYearBadges = {};
  years.forEach(function(y){ sysYearBadges[y] = {total:0,available:0,functional:0,reproducible:0,reusable:0}; secYearBadges[y] = {total:0,available:0,functional:0,reproducible:0,reusable:0}; });

  {% for conf in site.data.artifacts_by_conference %}
  (function(){
    var cat = "{{ conf.category }}";
    {% for yd in conf.years %}
    {
      var y = "{{ yd.year }}";
      var bucket = (cat === "systems") ? sysYearBadges : secYearBadges;
      if (bucket[y]) {
        bucket[y].total += {{ yd.total }};
        bucket[y].available += {{ yd.available }};
        bucket[y].functional += {{ yd.functional }};
        bucket[y].reproducible += {{ yd.reproducible }};
        bucket[y].reusable += {{ yd.reusable }};
      }
    }
    {% endfor %}
  })();
  {% endfor %}

  function badgeRateSeries(yearBadges, badge) {
    return years.map(function(y) {
      var b = yearBadges[y];
      return b.total > 0 ? Math.round(b[badge] / b.total * 100) : null;
    });
  }

  function makeBadgeChart(canvasId, yearBadges, title) {
    new Chart(document.getElementById(canvasId), {
      type: 'line',
      data: {
        labels: years,
        datasets: ['available','functional','reproducible','reusable'].map(function(badge){
          return { label: badge.charAt(0).toUpperCase()+badge.slice(1), data: badgeRateSeries(yearBadges, badge), borderColor: BADGE_COLORS[badge], fill: false, tension: 0.2, spanGaps: true };
        })
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { title: { display: true, text: title + ' — Badge Rate (% of AE artifacts)' } },
        scales: { y: { beginAtZero: true, max: 100, title: { display: true, text: '% of Artifacts' } } }
      }
    });
  }

  makeBadgeChart('badgeChartSys', sysYearBadges, 'Systems');
  makeBadgeChart('badgeChartSec', secYearBadges, 'Security');

  /* Reproducibility rate comparison overlay */
  var sysReproRate = badgeRateSeries(sysYearBadges, 'reproducible');
  var secReproRate = badgeRateSeries(secYearBadges, 'reproducible');
  var sysFuncRate  = badgeRateSeries(sysYearBadges, 'functional');
  var secFuncRate  = badgeRateSeries(secYearBadges, 'functional');

  new Chart(document.getElementById('badgeRateCompareChart'), {
    type: 'line',
    data: {
      labels: years,
      datasets: [
        { label: 'Systems — Reproduced %', data: sysReproRate, borderColor: SYS_COLOR, borderWidth: 3, fill: false, tension: 0.2, spanGaps: true },
        { label: 'Security — Reproduced %', data: secReproRate, borderColor: SEC_COLOR, borderWidth: 3, fill: false, tension: 0.2, spanGaps: true },
        { label: 'Systems — Functional %', data: sysFuncRate, borderColor: SYS_COLOR, borderWidth: 1, borderDash: [5,5], fill: false, tension: 0.2, spanGaps: true },
        { label: 'Security — Functional %', data: secFuncRate, borderColor: SEC_COLOR, borderWidth: 1, borderDash: [5,5], fill: false, tension: 0.2, spanGaps: true }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { title: { display: true, text: 'Reproduced & Functional Rate: Systems vs. Security' } },
      scales: { y: { beginAtZero: true, max: 100, title: { display: true, text: '% of AE Artifacts' } } }
    }
  });

  /* ===== 3. AE Participation Rates (% of all accepted papers) ===== */
  function makeParticipationChart(canvasId, areaData, title, color) {
    if (!areaData || !areaData.years) return;
    var yrs = areaData.years.map(String);
    new Chart(document.getElementById(canvasId), {
      type: 'line',
      data: {
        labels: yrs,
        datasets: [
          { label: 'AE Participation', data: areaData.participation_pct, borderColor: color, borderWidth: 3, fill: false, tension: 0.2 },
          { label: 'Available', data: areaData.available_pct, borderColor: BADGE_COLORS.available, borderWidth: 2, fill: false, tension: 0.2 },
          { label: 'Functional', data: areaData.functional_pct, borderColor: BADGE_COLORS.functional, borderWidth: 2, borderDash: [5,5], fill: false, tension: 0.2 },
          { label: 'Reproduced', data: areaData.reproduced_pct, borderColor: BADGE_COLORS.reproducible, borderWidth: 2, borderDash: [3,3], fill: false, tension: 0.2 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { title: { display: true, text: title + ' — % of All Accepted Papers' } },
        scales: { y: { beginAtZero: true, max: 100, title: { display: true, text: '%' } } }
      }
    });
  }

  fetch('{{ "/assets/data/participation_stats.json" | relative_url }}')
    .then(function(r){ return r.json(); })
    .then(function(data){
      if (data.by_area) {
        makeParticipationChart('partRateChartSys', data.by_area.systems, 'Systems', SYS_COLOR);
        makeParticipationChart('partRateChartSec', data.by_area.security, 'Security', SEC_COLOR);
      }
    });

  /* ===== 4. Top Institutions by Area ===== */
  function makeInstBar(canvasId, data, title, color) {
    data.sort(function(a,b){ return (b.combined_score||0) - (a.combined_score||0); });
    var top = data.slice(0, 10);
    var labels = top.map(function(e){ var n = e.affiliation || ''; return n.length > 30 ? n.substring(0,28) + '…' : n; });
    new Chart(document.getElementById(canvasId), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          { label: 'Artifact Score', data: top.map(function(e){ return e.artifact_score||0; }), backgroundColor: color },
          { label: 'AE Service Score', data: top.map(function(e){ return e.ae_score||0; }), backgroundColor: 'rgba(150,150,150,0.5)' }
        ]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { title: { display: true, text: title + ' — Top 10 by Combined Score' } },
        scales: { x: { stacked: true, title: { display: true, text: 'Score' } }, y: { stacked: true } }
      }
    });
  }

  function makeInstScatter(sysData, secData) {
    var minScore = 50;
    function toPoints(data, area) {
      return data.filter(function(e){ return (e.combined_score||0) >= minScore; })
        .map(function(e){ return { x: e.artifact_score||0, y: e.ae_score||0, r: Math.max(3, Math.sqrt(e.combined_score||0) * 0.8), label: e.affiliation, area: area }; });
    }
    var sysPoints = toPoints(sysData, 'systems');
    var secPoints = toPoints(secData, 'security');

    new Chart(document.getElementById('instScatterChart'), {
      type: 'bubble',
      data: {
        datasets: [
          { label: 'Systems', data: sysPoints, backgroundColor: 'rgba(41,128,185,0.45)', borderColor: SYS_COLOR },
          { label: 'Security', data: secPoints, backgroundColor: 'rgba(192,57,43,0.45)', borderColor: SEC_COLOR }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Institutional Ecosystem: Artifact Creation vs. AE Service' },
          tooltip: { callbacks: { label: function(ctx) { var p = ctx.raw; return p.label + ' (artifacts: ' + p.x + ', AE: ' + p.y + ')'; } } }
        },
        scales: {
          x: { title: { display: true, text: 'Artifact Score' }, beginAtZero: true },
          y: { title: { display: true, text: 'AE Service Score' }, beginAtZero: true }
        }
      }
    });
  }

  Promise.all([
    fetch('{{ "/assets/data/systems_institution_rankings.json" | relative_url }}').then(function(r){ return r.json(); }),
    fetch('{{ "/assets/data/security_institution_rankings.json" | relative_url }}').then(function(r){ return r.json(); })
  ]).then(function(results){
    var sysInst = results[0], secInst = results[1];
    makeInstBar('instChartSys', sysInst, 'Systems', SYS_COLOR);
    makeInstBar('instChartSec', secInst, 'Security', SEC_COLOR);
    makeInstScatter(sysInst, secInst);
  });
});
</script>
