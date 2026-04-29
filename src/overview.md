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

## Badge & Participation Rates

Percentage of artifacts receiving each badge type (top row) and badge rates as a fraction of all accepted papers (bottom row). Open-science mandates — such as USENIX Security's 2025 policy — are the strongest lever, more than doubling participation in a single year.

<div style="display:flex; flex-wrap:wrap; gap:16px; justify-content:center;">
  <div style="flex:1; min-width:400px; max-width:600px;">
    <h4 style="text-align:center; margin:0 0 4px;">Systems — % of AE Artifacts</h4>
    <div style="position:relative; height:240px; overflow:hidden;">
      <canvas id="badgeChartSys"></canvas>
    </div>
  </div>
  <div style="flex:1; min-width:400px; max-width:600px;">
    <h4 style="text-align:center; margin:0 0 4px;">Security — % of AE Artifacts</h4>
    <div style="position:relative; height:240px; overflow:hidden;">
      <canvas id="badgeChartSec"></canvas>
    </div>
  </div>
</div>

<div style="position:relative; width:100%; max-width:900px; margin:1.5em auto; height:280px; overflow:hidden;">
  <canvas id="badgeRateCompareChart"></canvas>
</div>

<div style="display:flex; flex-wrap:wrap; gap:16px; justify-content:center;">
  <div style="flex:1; min-width:400px; max-width:600px;">
    <h4 style="text-align:center; margin:0 0 4px;">Systems — % of All Accepted Papers</h4>
    <div style="position:relative; height:260px; overflow:hidden;">
      <canvas id="partRateChartSys"></canvas>
    </div>
  </div>
  <div style="flex:1; min-width:400px; max-width:600px;">
    <h4 style="text-align:center; margin:0 0 4px;">Security — % of All Accepted Papers</h4>
    <div style="position:relative; height:260px; overflow:hidden;">
      <canvas id="partRateChartSec"></canvas>
    </div>
  </div>
</div>

---

## Conference Timeline Coverage

Artifact counts by conference and year. Darker cells indicate more artifacts evaluated that year.

<div style="position:relative; width:100%; max-width:900px; margin:1em auto;">
  <canvas id="timelineHeatmap"></canvas>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  // Build data from Jekyll
  var conferences = [
    {% for conf in site.data.artifacts_by_conference %}
    { name: "{{ conf.name }}", category: "{{ conf.category }}", years: { {% for yd in conf.years %}{{ yd.year }}: {{ yd.total }}{% unless forloop.last %}, {% endunless %}{% endfor %} } }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ];
  var years = [{% for y in site.data.artifacts_by_year %}{{ y.year }}{% unless forloop.last %},{% endunless %}{% endfor %}];

  // Sort conferences: systems first, then security, alphabetical within each
  conferences.sort(function(a, b) {
    if (a.category !== b.category) return a.category === 'systems' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  var labels = conferences.map(function(c) { return c.name; });

  // Find max value for color scaling
  var maxVal = 0;
  conferences.forEach(function(c) {
    years.forEach(function(y) { if (c.years[y] && c.years[y] > maxVal) maxVal = c.years[y]; });
  });

  // Build matrix data: {x: yearIndex, y: confIndex, v: count}
  var data = [];
  conferences.forEach(function(c, ci) {
    years.forEach(function(y, yi) {
      var v = c.years[y] || 0;
      data.push({ x: yi, y: ci, v: v });
    });
  });

  function cellColor(v) {
    if (v === 0) return 'rgba(220,220,220,0.3)';
    var t = v / maxVal;
    // Gradient from light blue to dark blue
    var r = Math.round(220 - 180 * t);
    var g = Math.round(235 - 155 * t);
    var b = Math.round(255 - 50 * t);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  var cellW = 40, cellH = 28, padL = 90, padT = 30, padB = 10, padR = 10;
  var canvasW = padL + years.length * cellW + padR;
  var canvasH = padT + conferences.length * cellH + padB;

  var canvas = document.getElementById('timelineHeatmap');
  canvas.width = canvasW * 2;   // retina
  canvas.height = canvasH * 2;
  canvas.style.width = canvasW + 'px';
  canvas.style.height = canvasH + 'px';
  var ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  // Draw year headers
  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  years.forEach(function(y, yi) {
    ctx.fillText(y, padL + yi * cellW + cellW / 2, padT - 8);
  });

  // Draw rows
  conferences.forEach(function(c, ci) {
    var rowY = padT + ci * cellH;

    // Conference label
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'right';
    ctx.fillText(c.name, padL - 6, rowY + cellH / 2 + 4);

    // Cells
    years.forEach(function(y, yi) {
      var v = c.years[y] || 0;
      var cellX = padL + yi * cellW;

      ctx.fillStyle = cellColor(v);
      ctx.fillRect(cellX + 1, rowY + 1, cellW - 2, cellH - 2);

      // Cell border
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(cellX + 1, rowY + 1, cellW - 2, cellH - 2);

      // Number label
      if (v > 0) {
        ctx.font = '10px sans-serif';
        ctx.fillStyle = v / maxVal > 0.65 ? '#fff' : '#333';
        ctx.textAlign = 'center';
        ctx.fillText(v, cellX + cellW / 2, rowY + cellH / 2 + 4);
      }
    });
  });

  // Category separators
  var sysCount = conferences.filter(function(c) { return c.category === 'systems'; }).length;
  if (sysCount > 0 && sysCount < conferences.length) {
    var sepY = padT + sysCount * cellH;
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, sepY);
    ctx.lineTo(padL + years.length * cellW, sepY);
    ctx.stroke();

    // Area labels on the left
    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'right';
    ctx.save();
    ctx.translate(10, padT + sysCount * cellH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Systems', 0, 0);
    ctx.restore();
    ctx.save();
    var secCount = conferences.length - sysCount;
    ctx.translate(10, padT + sysCount * cellH + secCount * cellH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Security', 0, 0);
    ctx.restore();
  }
});
</script>

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
<div style="text-align:center; margin:0.5em 0;">
  <span style="font-size:0.85em; color:#666; margin-right:8px;">Security</span>
  <canvas id="instScatterLegend" style="vertical-align:middle;"></canvas>
  <span style="font-size:0.85em; color:#666; margin-left:8px;">Systems</span>
</div>
<p style="text-align:center; font-size:0.9em; color:#666;">Each bubble is an institution. X = artifact score, Y = AE service score, size = combined score. Color indicates the systems/security balance. Only institutions with combined score &ge; 50 are shown.</p>

{% else %}

*Statistics data is being generated. Please check back soon.*

{% endif %}

---

<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  /* ---------- colour palette ---------- */
  var SYS_COLOR  = '#2980b9';
  var SEC_COLOR  = '#c0392b';
  var BADGE_COLORS = {evaluated:'#95a5a6', available:'#27ae60', functional:'#2980b9', reproducible:'#8e44ad', reusable:'#e67e22'};

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
        var t = {{ yd.total }}, a = {{ yd.available }}, f = {{ yd.functional }}, r = {{ yd.reproducible }}, u = {{ yd.reusable }};
        bucket[y].total += t;
        /* If a conference-year has functional==total but no other badges,
           those are really "evaluated only" (generic AE pass, no ACM badge). */
        var isEvalOnly = (cat === 'security' && a === 0 && r === 0 && u === 0 && f === t && f > 0);
        if (!isEvalOnly) {
          bucket[y].available += a;
          bucket[y].functional += f;
          bucket[y].reproducible += r;
          bucket[y].reusable += u;
        }
      }
    }
    {% endfor %}
  })();
  {% endfor %}

  function badgeRateSeries(yearBadges, badge) {
    return years.map(function(y) {
      var b = yearBadges[y];
      if (b.total <= 0) return null;
      if (badge === 'evaluated') {
        var maxBadge = Math.max(b.available, b.functional, b.reproducible, b.reusable);
        var evalOnly = b.total - maxBadge;
        return evalOnly > 0 ? Math.round(evalOnly / b.total * 100) : 0;
      }
      return Math.round(b[badge] / b.total * 100);
    });
  }

  function makeBadgeChart(canvasId, yearBadges, title, badges) {
    new Chart(document.getElementById(canvasId), {
      type: 'line',
      data: {
        labels: years,
        datasets: badges.map(function(badge){
          var lbl = badge === 'evaluated' ? 'Evaluated (no badge)' : badge.charAt(0).toUpperCase()+badge.slice(1);
          var dash = badge === 'evaluated' ? [4,4] : [];
          return { label: lbl, data: badgeRateSeries(yearBadges, badge), borderColor: BADGE_COLORS[badge], borderDash: dash, fill: false, tension: 0.2, spanGaps: true };
        })
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { title: { display: false } },
        scales: { y: { beginAtZero: true, max: 100, title: { display: true, text: '% of Artifacts' } } }
      }
    });
  }

  makeBadgeChart('badgeChartSys', sysYearBadges, 'Systems', ['available','functional','reproducible','reusable']);
  makeBadgeChart('badgeChartSec', secYearBadges, 'Security', ['evaluated','available','functional','reproducible','reusable']);

  /* Badge rate comparison overlay */
  var sysAvailRate = badgeRateSeries(sysYearBadges, 'available');
  var secAvailRate = badgeRateSeries(secYearBadges, 'available');
  var sysReproRate = badgeRateSeries(sysYearBadges, 'reproducible');
  var secReproRate = badgeRateSeries(secYearBadges, 'reproducible');
  var sysFuncRate  = badgeRateSeries(sysYearBadges, 'functional');
  var secFuncRate  = badgeRateSeries(secYearBadges, 'functional');

  new Chart(document.getElementById('badgeRateCompareChart'), {
    type: 'line',
    data: {
      labels: years,
      datasets: [
        { label: 'Systems — Available %', data: sysAvailRate, borderColor: SYS_COLOR, borderWidth: 2, borderDash: [2,2], fill: false, tension: 0.2, spanGaps: true },
        { label: 'Security — Available %', data: secAvailRate, borderColor: SEC_COLOR, borderWidth: 2, borderDash: [2,2], fill: false, tension: 0.2, spanGaps: true },
        { label: 'Systems — Functional %', data: sysFuncRate, borderColor: SYS_COLOR, borderWidth: 2, borderDash: [5,5], fill: false, tension: 0.2, spanGaps: true },
        { label: 'Security — Functional %', data: secFuncRate, borderColor: SEC_COLOR, borderWidth: 2, borderDash: [5,5], fill: false, tension: 0.2, spanGaps: true },
        { label: 'Systems — Reproduced %', data: sysReproRate, borderColor: SYS_COLOR, borderWidth: 3, fill: false, tension: 0.2, spanGaps: true },
        { label: 'Security — Reproduced %', data: secReproRate, borderColor: SEC_COLOR, borderWidth: 3, fill: false, tension: 0.2, spanGaps: true }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { title: { display: true, text: 'Available, Functional & Reproduced: Systems vs. Security' } },
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
        plugins: { title: { display: false } },
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

    /* Merge institutions: compute combined scores across both areas */
    var instMap = {};
    function addToMap(data, area) {
      data.forEach(function(e) {
        var name = e.affiliation;
        if (!instMap[name]) instMap[name] = { affiliation: name, sys_artifact: 0, sys_ae: 0, sys_combined: 0, sec_artifact: 0, sec_ae: 0, sec_combined: 0 };
        instMap[name][area + '_artifact'] += (e.artifact_score || 0);
        instMap[name][area + '_ae'] += (e.ae_score || 0);
        instMap[name][area + '_combined'] += (e.combined_score || 0);
      });
    }
    addToMap(sysData, 'sys');
    addToMap(secData, 'sec');

    /* Color interpolation: blue (systems) ↔ red (security) */
    function lerpColor(ratio) {
      /* ratio: 0 = pure security, 1 = pure systems */
      var sR = 41, sG = 128, sB = 185;   /* systems blue */
      var eR = 192, eG = 57, eB = 43;    /* security red */
      var r = Math.round(eR + (sR - eR) * ratio);
      var g = Math.round(eG + (sG - eG) * ratio);
      var b = Math.round(eB + (sB - eB) * ratio);
      return { bg: 'rgba(' + r + ',' + g + ',' + b + ',0.5)', border: 'rgb(' + r + ',' + g + ',' + b + ')' };
    }

    var points = [];
    Object.keys(instMap).forEach(function(name) {
      var inst = instMap[name];
      var totalCombined = inst.sys_combined + inst.sec_combined;
      if (totalCombined < minScore) return;
      var sysRatio = totalCombined > 0 ? inst.sys_combined / totalCombined : 0.5;
      var col = lerpColor(sysRatio);
      points.push({
        x: inst.sys_artifact + inst.sec_artifact,
        y: inst.sys_ae + inst.sec_ae,
        r: Math.max(3, Math.sqrt(totalCombined) * 0.8),
        label: name,
        sysRatio: sysRatio,
        bgColor: col.bg,
        borderColor: col.border
      });
    });

    new Chart(document.getElementById('instScatterChart'), {
      type: 'bubble',
      data: {
        datasets: [{
          label: 'Institutions',
          data: points,
          backgroundColor: points.map(function(p) { return p.bgColor; }),
          borderColor: points.map(function(p) { return p.borderColor; }),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Institutional Ecosystem: Artifact Creation vs. AE Service' },
          legend: { display: false },
          tooltip: { callbacks: { label: function(ctx) {
            var p = ctx.raw;
            var pct = Math.round(p.sysRatio * 100);
            return p.label + ' (artifacts: ' + p.x + ', AE: ' + p.y + ', ' + pct + '% systems)';
          } } }
        },
        scales: {
          x: { title: { display: true, text: 'Artifact Score' }, beginAtZero: true },
          y: { title: { display: true, text: 'AE Service Score' }, beginAtZero: true }
        }
      }
    });

    /* Draw gradient legend below the chart */
    var legendCanvas = document.getElementById('instScatterLegend');
    if (legendCanvas) {
      var lw = 200, lh = 12;
      legendCanvas.width = lw * 2;
      legendCanvas.height = lh * 2;
      legendCanvas.style.width = lw + 'px';
      legendCanvas.style.height = lh + 'px';
      var lctx = legendCanvas.getContext('2d');
      lctx.scale(2, 2);
      for (var i = 0; i < lw; i++) {
        var c = lerpColor(i / (lw - 1));
        lctx.fillStyle = c.border;
        lctx.fillRect(i, 0, 1, lh);
      }
    }
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
