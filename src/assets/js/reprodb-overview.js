/**
 * reprodb-overview.js — Chart logic for the Systems vs. Security overview page.
 *
 * Depends on: Chart.js v4 (loaded globally via head/custom.html)
 *
 * Reads inline JSON data from a <script id="overview-data" type="application/json">
 * element injected by the Jekyll template. This keeps Liquid data-binding in the
 * .md file while all rendering logic lives here.
 *
 * Data shape expected:
 * {
 *   years: ["2017","2018",...],
 *   sysCounts: [0,0,...],
 *   secCounts: [12,22,...],
 *   totCounts: [12,22,...],
 *   conferences: [{ name, category, years: { "2017": 5, ... } }, ...],
 *   participationUrl: "/assets/data/participation_stats.json",
 *   sysInstUrl: "/assets/data/systems_institution_rankings.json",
 *   secInstUrl: "/assets/data/security_institution_rankings.json"
 * }
 */
(function() {
  'use strict';

  /* ---------- colour palette ---------- */
  var SYS_COLOR  = '#2980b9';
  var SEC_COLOR  = '#c0392b';
  var BADGE_COLORS = {
    evaluated:    '#95a5a6',
    available:    '#27ae60',
    functional:   '#2980b9',
    reproducible: '#8e44ad',
    reusable:     '#e67e22'
  };

  document.addEventListener('DOMContentLoaded', function() {
    var dataEl = document.getElementById('overview-data');
    if (!dataEl) return;
    var D;
    try { D = JSON.parse(dataEl.textContent); } catch(e) { return; }

    var years = D.years;

    /* ===== 1. Artifact Growth Chart ===== */
    var growthCanvas = document.getElementById('artifactGrowthChart');
    if (growthCanvas) {
      new Chart(growthCanvas, {
        type: 'bar',
        data: {
          labels: years,
          datasets: [
            { label: 'Systems', data: D.sysCounts, backgroundColor: SYS_COLOR, stack: 'stack0', order: 2 },
            { label: 'Security', data: D.secCounts, backgroundColor: SEC_COLOR, stack: 'stack0', order: 2 },
            { label: 'Total', data: D.totCounts, type: 'line', borderColor: ReproDB.themeColors().totalLine, borderWidth: 2, pointRadius: 3, fill: false, order: 1 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { title: { display: true, text: 'Evaluated Artifacts per Year' } },
          scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Artifacts' } } }
        }
      });
    }

    /* ===== 2. Badge Distribution (per area, over time) ===== */
    var sysYearBadges = {};
    var secYearBadges = {};
    years.forEach(function(y) {
      sysYearBadges[y] = { total: 0, available: 0, functional: 0, reproducible: 0, reusable: 0 };
      secYearBadges[y] = { total: 0, available: 0, functional: 0, reproducible: 0, reusable: 0 };
    });

    (D.conferences || []).forEach(function(conf) {
      var cat = conf.category;
      var ydata = conf.years_data; // array of {year, total, available, functional, reproducible, reusable}
      if (!ydata) return;
      ydata.forEach(function(yd) {
        var y = String(yd.year);
        var bucket = (cat === 'systems') ? sysYearBadges : secYearBadges;
        if (!bucket[y]) return;
        var t = yd.total, a = yd.available, f = yd.functional, r = yd.reproducible, u = yd.reusable;
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
      });
    });

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

    function makeBadgeChart(canvasId, yearBadges, badges) {
      var el = document.getElementById(canvasId);
      if (!el) return;
      new Chart(el, {
        type: 'line',
        data: {
          labels: years,
          datasets: badges.map(function(badge) {
            var lbl = badge === 'evaluated' ? 'Evaluated (no badge)' : badge.charAt(0).toUpperCase() + badge.slice(1);
            var dash = badge === 'evaluated' ? [4, 4] : [];
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

    makeBadgeChart('badgeChartSys', sysYearBadges, ['available', 'functional', 'reproducible', 'reusable']);
    makeBadgeChart('badgeChartSec', secYearBadges, ['evaluated', 'available', 'functional', 'reproducible', 'reusable']);

    /* Badge rate comparison overlay */
    var compareEl = document.getElementById('badgeRateCompareChart');
    if (compareEl) {
      new Chart(compareEl, {
        type: 'line',
        data: {
          labels: years,
          datasets: [
            { label: 'Systems — Available %',   data: badgeRateSeries(sysYearBadges, 'available'),    borderColor: SYS_COLOR, borderWidth: 2, borderDash: [2, 2], fill: false, tension: 0.2, spanGaps: true },
            { label: 'Security — Available %',  data: badgeRateSeries(secYearBadges, 'available'),    borderColor: SEC_COLOR, borderWidth: 2, borderDash: [2, 2], fill: false, tension: 0.2, spanGaps: true },
            { label: 'Systems — Functional %',  data: badgeRateSeries(sysYearBadges, 'functional'),   borderColor: SYS_COLOR, borderWidth: 2, borderDash: [5, 5], fill: false, tension: 0.2, spanGaps: true },
            { label: 'Security — Functional %', data: badgeRateSeries(secYearBadges, 'functional'),   borderColor: SEC_COLOR, borderWidth: 2, borderDash: [5, 5], fill: false, tension: 0.2, spanGaps: true },
            { label: 'Systems — Reproduced %',  data: badgeRateSeries(sysYearBadges, 'reproducible'), borderColor: SYS_COLOR, borderWidth: 3, fill: false, tension: 0.2, spanGaps: true },
            { label: 'Security — Reproduced %', data: badgeRateSeries(secYearBadges, 'reproducible'), borderColor: SEC_COLOR, borderWidth: 3, fill: false, tension: 0.2, spanGaps: true }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: { title: { display: false }, tooltip: { enabled: true } },
          scales: { y: { beginAtZero: true, max: 100, title: { display: true, text: '% of AE Artifacts' } } }
        }
      });
    }

    /* ===== 3. AE Participation Rates (% of all accepted papers) ===== */
    function makeCombinedParticipationChart(sysData, secData) {
      var el = document.getElementById('partRateChartCombined');
      if (!el) return;
      /* Merge year labels from both areas */
      var yrSet = {};
      if (sysData && sysData.years) sysData.years.forEach(function(y) { yrSet[y] = true; });
      if (secData && secData.years) secData.years.forEach(function(y) { yrSet[y] = true; });
      var yrs = Object.keys(yrSet).sort();

      function alignData(areaData) {
        if (!areaData || !areaData.years) return yrs.map(function() { return null; });
        var map = {};
        areaData.years.forEach(function(y, i) { map[String(y)] = i; });
        return yrs.map(function(y) { return map[y] !== undefined ? areaData.participation_pct[map[y]] : null; });
      }

      new Chart(el, {
        type: 'line',
        data: {
          labels: yrs,
          datasets: [
            { label: 'Systems — AE Participation',  data: alignData(sysData), borderColor: SYS_COLOR, borderWidth: 3, fill: false, tension: 0.2, spanGaps: true },
            { label: 'Security — AE Participation', data: alignData(secData), borderColor: SEC_COLOR, borderWidth: 3, fill: false, tension: 0.2, spanGaps: true }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { title: { display: true, text: 'AE Participation — % of All Accepted Papers' } },
          scales: { y: { beginAtZero: true, max: 100, title: { display: true, text: '%' } } }
        }
      });
    }

    if (D.participationUrl) {
      fetch(D.participationUrl)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.by_area) {
            makeCombinedParticipationChart(data.by_area.systems, data.by_area.security);
          }
        });
    }

    /* ===== 4. Top Institutions by Area ===== */
    function makeInstBar(canvasId, data, title, color) {
      var el = document.getElementById(canvasId);
      if (!el) return;
      data.sort(function(a, b) { return (b.combined_score || 0) - (a.combined_score || 0); });
      var top = data.slice(0, 10);
      var labels = top.map(function(e) { var n = e.affiliation || ''; return n.length > 30 ? n.substring(0, 28) + '…' : n; });
      new Chart(el, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            { label: 'Artifact Score',   data: top.map(function(e) { return e.artifact_score || 0; }), backgroundColor: color },
            { label: 'AE Service Score', data: top.map(function(e) { return e.ae_score || 0; }),       backgroundColor: 'rgba(150,150,150,0.5)' }
          ]
        },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: { title: { display: true, text: title + ' — Top 10 by Combined Score' } },
          scales: { x: { stacked: true, title: { display: true, text: 'Score' } }, y: { stacked: true } }
        }
      });
    }

    function lerpColor(ratio) {
      /* ratio: 0 = pure security, 1 = pure systems */
      var sR = 41, sG = 128, sB = 185;
      var eR = 192, eG = 57, eB = 43;
      var r = Math.round(eR + (sR - eR) * ratio);
      var g = Math.round(eG + (sG - eG) * ratio);
      var b = Math.round(eB + (sB - eB) * ratio);
      return { bg: 'rgba(' + r + ',' + g + ',' + b + ',0.5)', border: 'rgb(' + r + ',' + g + ',' + b + ')' };
    }

    function makeInstScatter(sysData, secData) {
      var el = document.getElementById('instScatterChart');
      if (!el) return;
      var minScore = 50;

      var instMap = {};
      function addToMap(data, area) {
        data.forEach(function(e) {
          var name = e.affiliation;
          if (!instMap[name]) instMap[name] = { affiliation: name, sys_artifact: 0, sys_ae: 0, sys_combined: 0, sec_artifact: 0, sec_ae: 0, sec_combined: 0 };
          instMap[name][area + '_artifact']  += (e.artifact_score  || 0);
          instMap[name][area + '_ae']        += (e.ae_score        || 0);
          instMap[name][area + '_combined']  += (e.combined_score  || 0);
        });
      }
      addToMap(sysData, 'sys');
      addToMap(secData, 'sec');

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

      new Chart(el, {
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

      /* Draw gradient legend */
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

    if (D.sysInstUrl && D.secInstUrl) {
      Promise.all([
        fetch(D.sysInstUrl).then(function(r) { return r.json(); }),
        fetch(D.secInstUrl).then(function(r) { return r.json(); })
      ]).then(function(results) {
        var sysInst = results[0], secInst = results[1];
        makeInstBar('instChartSys', sysInst, 'Systems', SYS_COLOR);
        makeInstBar('instChartSec', secInst, 'Security', SEC_COLOR);
        makeInstScatter(sysInst, secInst);
      });
    }

    /* ===== 5. Conference Timeline Heatmap ===== */
    var hmCanvas = document.getElementById('timelineHeatmap');
    if (hmCanvas && D.conferences) {
      var confs = D.conferences.slice().sort(function(a, b) {
        if (a.category !== b.category) return a.category === 'systems' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

      /* Build year → count lookup per conference */
      var confData = confs.map(function(c) {
        var yrs = {};
        if (c.years_data) c.years_data.forEach(function(yd) { yrs[yd.year] = yd.total; });
        return { name: c.name, category: c.category, years: yrs };
      });

      var maxVal = 0;
      confData.forEach(function(c) {
        years.forEach(function(y) { if (c.years[y] && c.years[y] > maxVal) maxVal = c.years[y]; });
      });

      function cellColor(v) {
        var dark = ReproDB.isDark();
        if (v === 0) return dark ? 'rgba(50,55,65,0.5)' : 'rgba(220,220,220,0.3)';
        var t = v / maxVal;
        if (dark) {
          // Dark mode: deep navy → bright blue
          var r = Math.round(30 + 10 * t);
          var g = Math.round(40 + 60 * t);
          var b = Math.round(70 + 140 * t);
          return 'rgb(' + r + ',' + g + ',' + b + ')';
        }
        var r = Math.round(220 - 180 * t);
        var g = Math.round(235 - 155 * t);
        var b = Math.round(255 - 50 * t);
        return 'rgb(' + r + ',' + g + ',' + b + ')';
      }

      var cellW = 40, cellH = 28, padL = 90, padT = 30, padB = 10, padR = 10;
      var canvasW = padL + years.length * cellW + padR;
      var canvasH = padT + confData.length * cellH + padB;

      hmCanvas.width  = canvasW * 2;
      hmCanvas.height = canvasH * 2;
      hmCanvas.style.width  = canvasW + 'px';
      hmCanvas.style.height = canvasH + 'px';
      var ctx = hmCanvas.getContext('2d');
      ctx.scale(2, 2);

      var tc = ReproDB.themeColors();
      ctx.font = '11px sans-serif';
      ctx.fillStyle = tc.text;
      ctx.textAlign = 'center';
      years.forEach(function(y, yi) {
        ctx.fillText(y, padL + yi * cellW + cellW / 2, padT - 8);
      });

      confData.forEach(function(c, ci) {
        var rowY = padT + ci * cellH;
        ctx.font = '11px sans-serif';
        ctx.fillStyle = tc.text;
        ctx.textAlign = 'right';
        ctx.fillText(c.name, padL - 6, rowY + cellH / 2 + 4);

        years.forEach(function(y, yi) {
          var v = c.years[y] || 0;
          var cellX = padL + yi * cellW;
          ctx.fillStyle = cellColor(v);
          ctx.fillRect(cellX + 1, rowY + 1, cellW - 2, cellH - 2);
          ctx.strokeStyle = tc.grid;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(cellX + 1, rowY + 1, cellW - 2, cellH - 2);
          if (v > 0) {
            ctx.font = '10px sans-serif';
            ctx.fillStyle = v / maxVal > 0.65 ? '#fff' : tc.text;
            ctx.textAlign = 'center';
            ctx.fillText(v, cellX + cellW / 2, rowY + cellH / 2 + 4);
          }
        });
      });

      var sysCount = confData.filter(function(c) { return c.category === 'systems'; }).length;
      if (sysCount > 0 && sysCount < confData.length) {
        var sepY = padT + sysCount * cellH;
        ctx.strokeStyle = tc.separator;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(padL, sepY);
        ctx.lineTo(padL + years.length * cellW, sepY);
        ctx.stroke();

        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#888';
        ctx.save();
        ctx.translate(10, padT + sysCount * cellH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Systems', 0, 0);
        ctx.restore();
        ctx.save();
        var secCount = confData.length - sysCount;
        ctx.translate(10, padT + sysCount * cellH + secCount * cellH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Security', 0, 0);
        ctx.restore();
      }
    }
  });
})();
