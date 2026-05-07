/**
 * reprodb-committee.js — Chart logic for AE Committee pages.
 *
 * Depends on: Chart.js v4 (loaded globally via head/custom.html)
 *
 * Reads inline JSON from <script id="committee-page-data" type="application/json">
 * injected by the Jekyll template.
 *
 * Data shape:
 * {
 *   area: 'overall' | 'systems' | 'security',
 *   committeeStatsUrl: '/assets/data/committee_stats.json',
 *   aeMembersUrl: '/assets/data/ae_members.json',
 *   summary: { total_members, total_systems, total_security, unique_members, ... }
 * }
 */
(function() {
  'use strict';

  var SYS_COLOR  = '#2980b9';
  var SEC_COLOR  = '#c0392b';
  var BOTH_COLOR = '#8e44ad';

  document.addEventListener('DOMContentLoaded', function() {
    var dataEl = document.getElementById('committee-page-data');
    if (!dataEl) return;
    var D;
    try { D = JSON.parse(dataEl.textContent); } catch(e) { return; }

    var AREA = D.area || 'overall';

    Promise.all([
      fetch(D.committeeStatsUrl).then(function(r) { return r.json(); }),
      fetch(D.aeMembersUrl).then(function(r) { return r.json(); })
    ]).then(function(results) {
      var stats = results[0];
      var aeMembers = results[1];
      renderAll(stats, aeMembers, AREA);
    }).catch(function(err) {
      console.error('Failed to load committee data:', err);
    });
  });

  function renderAll(stats, aeMembers, area) {
    renderSizesHeatmap(stats, area);
    renderGrowthChart(stats, area);
    renderServiceFrequency(aeMembers, area);
    renderRetention(aeMembers, area);
    renderContinents(stats, area);
    renderCountries(stats, area);
    renderInstitutions(stats, area);
    if (area === 'overall') {
      renderCrossOverlap(aeMembers);
    }
  }

  /* ===== Committee Sizes Heatmap ===== */
  function renderSizesHeatmap(stats, area) {
    var canvas = document.getElementById('committeeSizesHeatmap');
    if (!canvas) return;

    var sizes = stats.committee_sizes || [];
    if (area !== 'overall') {
      sizes = sizes.filter(function(s) { return s.area === area; });
    }

    var yearSet = {}, confSet = {};
    sizes.forEach(function(s) { yearSet[s.year] = true; confSet[s.conference] = true; });
    var years = Object.keys(yearSet).sort();
    var confs = Object.keys(confSet).sort(function(a, b) {
      /* Sort by area then name */
      var aArea = '', bArea = '';
      sizes.forEach(function(s) { if (s.conference === a) aArea = s.area; if (s.conference === b) bArea = s.area; });
      if (aArea !== bArea) return aArea === 'systems' ? -1 : 1;
      return a.localeCompare(b);
    });

    /* Build lookup */
    var lookup = {};
    var maxVal = 0;
    sizes.forEach(function(s) {
      if (s.size < 5) return; /* skip incomplete */
      var key = s.conference + '|' + s.year;
      lookup[key] = s.size;
      if (s.size > maxVal) maxVal = s.size;
    });

    var cellW = 44, cellH = 26, padL = 100, padT = 32, padB = 10, padR = 10;
    var canvasW = padL + years.length * cellW + padR;
    var canvasH = padT + confs.length * cellH + padB;

    canvas.width  = canvasW * 2;
    canvas.height = canvasH * 2;
    canvas.style.width  = canvasW + 'px';
    canvas.style.height = canvasH + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    var tc = ReproDB.themeColors();
    /* Year headers */
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = tc.text;
    years.forEach(function(y, yi) {
      ctx.fillText(y, padL + yi * cellW + cellW / 2, padT - 10);
    });

    /* Rows */
    var sysCount = 0;
    confs.forEach(function(conf, ci) {
      var rowY = padT + ci * cellH;
      var confArea = '';
      sizes.forEach(function(s) { if (s.conference === conf) confArea = s.area; });
      if (confArea === 'systems') sysCount = ci + 1;

      ctx.font = '11px sans-serif';
      ctx.fillStyle = tc.text;
      ctx.textAlign = 'right';
      ctx.fillText(conf, padL - 6, rowY + cellH / 2 + 4);

      years.forEach(function(y, yi) {
        var v = lookup[conf + '|' + y] || 0;
        var cellX = padL + yi * cellW;
        ctx.fillStyle = heatColor(v, maxVal, confArea);
        ctx.fillRect(cellX + 1, rowY + 1, cellW - 2, cellH - 2);
        ctx.strokeStyle = 'rgba(150,150,150,0.3)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(cellX + 1, rowY + 1, cellW - 2, cellH - 2);
        if (v > 0) {
          ctx.font = '10px sans-serif';
          var textThreshold = ReproDB.isDark() ? 0.25 : 0.6;
          ctx.fillStyle = v / maxVal > textThreshold ? '#fff' : tc.text;
          ctx.textAlign = 'center';
          ctx.fillText(v, cellX + cellW / 2, rowY + cellH / 2 + 4);
        }
      });
    });

    /* Separator line between areas */
    if (area === 'overall' && sysCount > 0 && sysCount < confs.length) {
      var sepY = padT + sysCount * cellH;
      ctx.strokeStyle = tc.separator;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padL, sepY);
      ctx.lineTo(padL + years.length * cellW, sepY);
      ctx.stroke();
    }
  }

  function heatColor(v, maxVal, confArea) {
    if (v === 0) return ReproDB.isDark() ? 'rgba(50,55,65,0.4)' : 'rgba(220,220,220,0.2)';
    var t = v / maxVal;
    var dark = ReproDB.isDark();
    if (confArea === 'security') {
      if (dark) {
        // Dark mode: muted dark red → bright red
        var r = Math.round(80 + 140 * t);
        var g = Math.round(20 + 20 * t);
        var b = Math.round(20 + 15 * t);
        return 'rgb(' + r + ',' + g + ',' + b + ')';
      }
      return 'rgba(192,57,43,' + (0.15 + t * 0.7) + ')';
    }
    if (dark) {
      // Dark mode: muted dark blue → bright blue
      var r = Math.round(20 + 20 * t);
      var g = Math.round(50 + 70 * t);
      var b = Math.round(80 + 130 * t);
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    }
    return 'rgba(41,128,185,' + (0.15 + t * 0.7) + ')';
  }

  /* ===== Committee Growth (stacked bar) ===== */
  function renderGrowthChart(stats, area) {
    var canvas = document.getElementById('committeeGrowthChart');
    if (!canvas) return;

    var sizes = stats.committee_sizes || [];
    var yearSet = {};
    sizes.forEach(function(s) { if (s.size >= 5) yearSet[s.year] = true; });
    var years = Object.keys(yearSet).sort();

    if (area === 'overall') {
      var sysByYear = {}, secByYear = {};
      years.forEach(function(y) { sysByYear[y] = 0; secByYear[y] = 0; });
      sizes.forEach(function(s) {
        if (s.size < 5) return;
        if (s.area === 'systems') sysByYear[s.year] = (sysByYear[s.year] || 0) + s.size;
        else secByYear[s.year] = (secByYear[s.year] || 0) + s.size;
      });
      new Chart(canvas, {
        type: 'bar',
        data: {
          labels: years,
          datasets: [
            { label: 'Systems', data: years.map(function(y) { return sysByYear[y]; }), backgroundColor: SYS_COLOR, stack: 's' },
            { label: 'Security', data: years.map(function(y) { return secByYear[y]; }), backgroundColor: SEC_COLOR, stack: 's' }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { title: { display: true, text: 'Total Committee Assignments per Year' } },
          scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Members' } } }
        }
      });
    } else {
      var byYear = {};
      years.forEach(function(y) { byYear[y] = 0; });
      sizes.forEach(function(s) {
        if (s.size < 5 || s.area !== area) return;
        byYear[s.year] = (byYear[s.year] || 0) + s.size;
      });
      var color = area === 'systems' ? SYS_COLOR : SEC_COLOR;
      new Chart(canvas, {
        type: 'bar',
        data: {
          labels: years,
          datasets: [{ label: 'Members', data: years.map(function(y) { return byYear[y]; }), backgroundColor: color }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { title: { display: true, text: 'Total Committee Assignments per Year' } },
          scales: { y: { beginAtZero: true, title: { display: true, text: 'Members' } } }
        }
      });
    }
  }

  /* ===== Service Frequency Histogram ===== */
  function renderServiceFrequency(aeMembers, area) {
    var canvas = document.getElementById('serviceFrequencyChart');
    if (!canvas) return;

    var bins = { '1': 0, '2-3': 0, '4-5': 0, '6-10': 0, '11+': 0 };
    var binsSys = { '1': 0, '2-3': 0, '4-5': 0, '6-10': 0, '11+': 0 };
    var binsSec = { '1': 0, '2-3': 0, '4-5': 0, '6-10': 0, '11+': 0 };

    aeMembers.forEach(function(m) {
      var n = m.total_memberships || 0;
      var bin = n === 1 ? '1' : n <= 3 ? '2-3' : n <= 5 ? '4-5' : n <= 10 ? '6-10' : '11+';
      bins[bin]++;
      if (m.area === 'systems' || m.area === 'both') binsSys[bin]++;
      if (m.area === 'security' || m.area === 'both') binsSec[bin]++;
    });

    var labels = Object.keys(bins);
    var datasets;
    if (area === 'overall') {
      datasets = [
        { label: 'Systems', data: labels.map(function(l) { return binsSys[l]; }), backgroundColor: SYS_COLOR },
        { label: 'Security', data: labels.map(function(l) { return binsSec[l]; }), backgroundColor: SEC_COLOR }
      ];
    } else {
      var target = area === 'systems' ? binsSys : binsSec;
      var color = area === 'systems' ? SYS_COLOR : SEC_COLOR;
      datasets = [{ label: 'Members', data: labels.map(function(l) { return target[l]; }), backgroundColor: color }];
    }

    new Chart(canvas, {
      type: 'bar',
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Service Frequency — Terms Served per Member' },
          datalabels: { display: true, anchor: 'end', align: 'end', font: { size: 11 } }
        },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Members' } }, x: { title: { display: true, text: 'Terms' } } }
      }
    });
  }

  /* ===== Retention Trends ===== */
  function renderRetention(aeMembers, area) {
    var canvas = document.getElementById('retentionChart');
    if (!canvas) return;

    /* Build year→set-of-members for each area and overall (any area) */
    var sysYears = {}, secYears = {}, allYears = {};
    aeMembers.forEach(function(m) {
      var isSys = m.area === 'systems' || m.area === 'both';
      var isSec = m.area === 'security' || m.area === 'both';
      if (m.years) {
        Object.keys(m.years).forEach(function(y) {
          if (!allYears[y]) allYears[y] = {};
          allYears[y][m.name] = true;
          if (isSys) { if (!sysYears[y]) sysYears[y] = {}; sysYears[y][m.name] = true; }
          if (isSec) { if (!secYears[y]) secYears[y] = {}; secYears[y][m.name] = true; }
        });
      }
    });

    function retentionSeries(yearMap) {
      var yrs = Object.keys(yearMap).sort();
      var labels = [], data = [];
      for (var i = 1; i < yrs.length; i++) {
        var prev = yearMap[yrs[i - 1]] || {};
        var curr = yearMap[yrs[i]] || {};
        var currNames = Object.keys(curr);
        if (currNames.length === 0) continue;
        var retained = currNames.filter(function(n) { return prev[n]; }).length;
        labels.push(yrs[i]);
        data.push(Math.round(retained / currNames.length * 100));
      }
      return { labels: labels, data: data };
    }

    /* Cross-area retention: did member serve anywhere last year? */
    function crossRetentionSeries(areaYearMap, allYearMap) {
      var yrs = Object.keys(areaYearMap).sort();
      var labels = [], data = [];
      for (var i = 1; i < yrs.length; i++) {
        var prevAll = allYearMap[yrs[i - 1]] || {};
        var curr = areaYearMap[yrs[i]] || {};
        var currNames = Object.keys(curr);
        if (currNames.length === 0) continue;
        var retained = currNames.filter(function(n) { return prevAll[n]; }).length;
        labels.push(yrs[i]);
        data.push(Math.round(retained / currNames.length * 100));
      }
      return { labels: labels, data: data };
    }

    var sysRet = retentionSeries(sysYears);
    var secRet = retentionSeries(secYears);
    var allRet = retentionSeries(allYears);

    /* Merge labels */
    var allLabels = {};
    sysRet.labels.forEach(function(l) { allLabels[l] = true; });
    secRet.labels.forEach(function(l) { allLabels[l] = true; });
    allRet.labels.forEach(function(l) { allLabels[l] = true; });
    var labels = Object.keys(allLabels).sort();

    function alignToLabels(series) {
      var map = {};
      series.labels.forEach(function(l, i) { map[l] = series.data[i]; });
      return labels.map(function(l) { return map[l] !== undefined ? map[l] : null; });
    }

    var datasets;
    if (area === 'overall') {
      datasets = [
        { label: 'Overall — Retained %', data: alignToLabels(allRet), borderColor: ReproDB.themeColors().totalLine, borderWidth: 2, borderDash: [5, 3], fill: false, tension: 0.3, spanGaps: true },
        { label: 'Systems — Retained %', data: alignToLabels(sysRet), borderColor: SYS_COLOR, borderWidth: 2, fill: false, tension: 0.3, spanGaps: true },
        { label: 'Security — Retained %', data: alignToLabels(secRet), borderColor: SEC_COLOR, borderWidth: 2, fill: false, tension: 0.3, spanGaps: true }
      ];
    } else {
      var areaYears = area === 'systems' ? sysYears : secYears;
      var sameAreaRet = area === 'systems' ? sysRet : secRet;
      var crossRet = crossRetentionSeries(areaYears, allYears);
      var color = area === 'systems' ? SYS_COLOR : SEC_COLOR;
      crossRet.labels.forEach(function(l) { allLabels[l] = true; });
      labels = Object.keys(allLabels).sort();
      datasets = [
        { label: 'Retained (same area) %', data: alignToLabels(sameAreaRet), borderColor: color, borderWidth: 2, fill: false, tension: 0.3, spanGaps: true },
        { label: 'Retained (any area) %', data: alignToLabels(crossRet), borderColor: color, borderWidth: 2, borderDash: [5, 3], fill: false, tension: 0.3, spanGaps: true }
      ];
    }

    new Chart(canvas, {
      type: 'line',
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Year-over-Year Retention — % of Committee from Prior Year' } },
        scales: { y: { beginAtZero: true, max: 100, title: { display: true, text: '% Retained' } } }
      }
    });
  }

  /* ===== Geographic: Continents ===== */
  var CONTINENT_COLORS = {
    'North America': 'rgba(37,99,235,0.75)',
    'Europe': 'rgba(220,38,38,0.75)',
    'Asia': 'rgba(22,163,74,0.75)',
    'Oceania': 'rgba(147,51,234,0.75)',
    'South America': 'rgba(234,88,12,0.75)',
    'Africa': 'rgba(14,165,233,0.75)',
    'Antarctica': 'rgba(168,85,247,0.75)'
  };
  var CONTINENT_FALLBACK = 'rgba(120,120,120,0.6)';

  function continentColor(name) {
    return CONTINENT_COLORS[name] || CONTINENT_FALLBACK;
  }

  function renderContinents(stats, area) {
    var canvas = document.getElementById('committeeContinentsChart');
    if (!canvas) return;

    var key = area === 'overall' ? 'overall' : area;
    var continents = (stats.by_continent || {})[key] || [];

    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: continents.map(function(c) { return c.name; }),
        datasets: [{
          data: continents.map(function(c) { return c.count; }),
          backgroundColor: continents.map(function(c) { return continentColor(c.name); })
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Members by Continent' },
          legend: { position: 'right', labels: { boxWidth: 14, font: { size: 12 } } }
        }
      }
    });

    /* Side-by-side doughnut for overall */
    if (area === 'overall') {
      var sysCanvas = document.getElementById('continentSysChart');
      var secCanvas = document.getElementById('continentSecChart');
      if (sysCanvas) {
        var sysCont = (stats.by_continent || {}).systems || [];
        new Chart(sysCanvas, {
          type: 'doughnut',
          data: {
            labels: sysCont.map(function(c) { return c.name; }),
            datasets: [{ data: sysCont.map(function(c) { return c.count; }), backgroundColor: sysCont.map(function(c) { return continentColor(c.name); }) }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Systems' }, legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } } }
        });
      }
      if (secCanvas) {
        var secCont = (stats.by_continent || {}).security || [];
        new Chart(secCanvas, {
          type: 'doughnut',
          data: {
            labels: secCont.map(function(c) { return c.name; }),
            datasets: [{ data: secCont.map(function(c) { return c.count; }), backgroundColor: secCont.map(function(c) { return continentColor(c.name); }) }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Security' }, legend: { display: false } } }
        });
      }
    }
  }

  /* ===== Top Countries ===== */
  function renderCountries(stats, area) {
    var canvas = document.getElementById('committeeCountriesChart');
    if (!canvas) return;

    var key = area === 'overall' ? 'overall' : area;
    var countries = ((stats.by_country || {})[key] || []).slice(0, 15);

    if (area === 'overall') {
      /* Comparative bar: top-10 countries, systems vs security */
      var sysCountries = ((stats.by_country || {}).systems || []).slice(0, 15);
      var secCountries = ((stats.by_country || {}).security || []).slice(0, 15);
      var countrySet = {};
      sysCountries.forEach(function(c) { countrySet[c.name] = { sys: c.count, sec: 0 }; });
      secCountries.forEach(function(c) {
        if (!countrySet[c.name]) countrySet[c.name] = { sys: 0, sec: 0 };
        countrySet[c.name].sec = c.count;
      });
      /* Sort by total */
      var sorted = Object.keys(countrySet).map(function(n) { return { name: n, sys: countrySet[n].sys, sec: countrySet[n].sec, total: countrySet[n].sys + countrySet[n].sec }; });
      sorted.sort(function(a, b) { return b.total - a.total; });
      sorted = sorted.slice(0, 12);

      new Chart(canvas, {
        type: 'bar',
        data: {
          labels: sorted.map(function(c) { return c.name.length > 20 ? c.name.substring(0, 18) + '…' : c.name; }),
          datasets: [
            { label: 'Systems', data: sorted.map(function(c) { return c.sys; }), backgroundColor: SYS_COLOR },
            { label: 'Security', data: sorted.map(function(c) { return c.sec; }), backgroundColor: SEC_COLOR }
          ]
        },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: { title: { display: true, text: 'Top Countries — Systems vs Security' }, legend: { position: 'bottom' } },
          scales: { x: { stacked: true, beginAtZero: true, title: { display: true, text: 'Members' } }, y: { stacked: true } }
        }
      });
    } else {
      var color = area === 'systems' ? SYS_COLOR : SEC_COLOR;
      new Chart(canvas, {
        type: 'bar',
        data: {
          labels: countries.map(function(c) { return c.name.length > 25 ? c.name.substring(0, 23) + '…' : c.name; }),
          datasets: [{ label: 'Members', data: countries.map(function(c) { return c.count; }), backgroundColor: color }]
        },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: { title: { display: true, text: 'Top 15 Countries' }, legend: { display: false } },
          scales: { x: { beginAtZero: true, title: { display: true, text: 'Members' } } }
        }
      });
    }
  }

  /* ===== Top Institutions ===== */
  function renderInstitutions(stats, area) {
    var canvas = document.getElementById('committeeInstitutionsChart');
    if (!canvas) return;

    if (area === 'overall') {
      /* Side-by-side: use separate canvases */
      var sysCanvas = document.getElementById('instSysChart');
      var secCanvas = document.getElementById('instSecChart');
      var sysInst = ((stats.by_institution || {}).systems || []).slice(0, 10);
      var secInst = ((stats.by_institution || {}).security || []).slice(0, 10);

      if (sysCanvas) makeInstBar(sysCanvas, sysInst, 'Systems — Top 10', SYS_COLOR);
      if (secCanvas) makeInstBar(secCanvas, secInst, 'Security — Top 10', SEC_COLOR);

      /* Overall chart hidden if separate ones exist */
      canvas.parentElement.style.display = 'none';
    } else {
      var key = area;
      var institutions = ((stats.by_institution || {})[key] || []).slice(0, 15);
      var color = area === 'systems' ? SYS_COLOR : SEC_COLOR;
      makeInstBar(canvas, institutions, 'Top 15 Institutions', color);
    }
  }

  function makeInstBar(canvas, data, title, color) {
    var labels = data.map(function(i) { var n = i.name; return n.length > 35 ? n.substring(0, 33) + '…' : n; });
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{ label: 'Members', data: data.map(function(i) { return i.count; }), backgroundColor: color }]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { title: { display: true, text: title }, legend: { display: false } },
        scales: { x: { beginAtZero: true, title: { display: true, text: 'Members' } } }
      }
    });
  }

  /* ===== Cross-Community Overlap ===== */
  function renderCrossOverlap(aeMembers) {
    var canvas = document.getElementById('crossOverlapChart');
    if (!canvas) return;

    var sysOnly = 0, secOnly = 0, both = 0;
    aeMembers.forEach(function(m) {
      if (m.area === 'both') both++;
      else if (m.area === 'systems') sysOnly++;
      else if (m.area === 'security') secOnly++;
    });

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Systems Only', 'Both Areas', 'Security Only'],
        datasets: [{
          data: [sysOnly, both, secOnly],
          backgroundColor: [SYS_COLOR, BOTH_COLOR, SEC_COLOR]
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Cross-Community Membership' }, legend: { display: false } },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Members' } } }
      }
    });
  }

})();
