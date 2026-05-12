/**
 * reprodb-committee.js — Chart logic for AE Committee pages (ECharts).
 *
 * Reads inline JSON from <script id="committee-page-data" type="application/json">
 * injected by the Jekyll template.
 */
(function() {
  'use strict';

  var SYS_COLOR  = ReproDB.COLORS.systems;
  var SEC_COLOR  = ReproDB.COLORS.security;
  var BOTH_COLOR = ReproDB.COLORS.both;

  document.addEventListener('DOMContentLoaded', function() {
    var dataEl = document.getElementById('committee-page-data');
    if (!dataEl) return;
    var D;
    try { D = JSON.parse(dataEl.textContent); } catch(e) { return; }

    var AREA = D.area || 'overall';

    Promise.all([
      ReproDB.fetchJSON(D.committeeStatsUrl),
      ReproDB.fetchJSON(D.aeMembersUrl)
    ]).then(function(results) {
      var stats = results[0];
      var aeMembers = results[1];
      renderAll(stats, aeMembers, AREA);
    }).catch(function(err) {
      console.error('Failed to load committee data:', err);
      var el = document.getElementById('committeeGrowthChart');
      if (el) el.innerHTML = '<em class="rdb-error">Failed to load committee data.</em>';
    });
  });

  function renderAll(stats, aeMembers, area) {
    renderSizesHeatmap(stats, area);
    renderGrowthChart(stats, area);
    renderServiceFrequency(aeMembers, area);
    renderRetention(aeMembers, area);
    renderMemberFlow(aeMembers, area);
    renderContinents(stats, area);
    renderCountries(stats, area);
    renderInstitutions(stats, area);
    if (area === 'overall') {
      renderCrossOverlap(aeMembers);
    }
  }

  /* ===== Committee Sizes Heatmap (ECharts) ===== */
  function renderSizesHeatmap(stats, area) {
    var el = document.getElementById('committeeSizesHeatmap');
    if (!el) return;

    var sizes = stats.committee_sizes || [];
    if (area !== 'overall') {
      sizes = sizes.filter(function(s) { return s.area === area; });
    }

    var yearSet = {}, confAreaMap = {};
    sizes.forEach(function(s) { yearSet[s.year] = true; confAreaMap[s.conference] = s.area; });
    var years = Object.keys(yearSet).sort();
    var confs = Object.keys(confAreaMap).sort(function(a, b) {
      var aA = confAreaMap[a] || '', bA = confAreaMap[b] || '';
      if (aA !== bA) return aA === 'systems' ? -1 : 1;
      return a.localeCompare(b);
    });

    var lookup = {};
    var maxVal = 0;
    sizes.forEach(function(s) {
      if (s.size < 5) return;
      lookup[s.conference + '|' + s.year] = s.size;
      if (s.size > maxVal) maxVal = s.size;
    });

    var confAreas = confs.map(function(c) { return confAreaMap[c]; });

    var rawData = [];
    confs.forEach(function(conf, ci) {
      years.forEach(function(y, yi) {
        var v = lookup[conf + '|' + y] || 0;
        rawData.push({ x: yi, y: ci, v: v, area: confAreas[ci] });
      });
    });

    function cellColor(v, category) {
      var dark = ReproDB.isDark();
      if (v === 0) return dark ? 'rgba(50,55,65,0.5)' : 'rgba(220,220,220,0.3)';
      var t = v / maxVal;
      if (category === 'security') {
        if (dark) {
          var r = Math.round(80 + 140 * t);
          var g = Math.round(20 + 20 * t);
          var b = Math.round(20 + 15 * t);
          return 'rgb(' + r + ',' + g + ',' + b + ')';
        }
        return 'rgba(192,57,43,' + (0.15 + t * 0.7) + ')';
      }
      if (dark) {
        var r2 = Math.round(20 + 20 * t);
        var g2 = Math.round(50 + 70 * t);
        var b2 = Math.round(80 + 130 * t);
        return 'rgb(' + r2 + ',' + g2 + ',' + b2 + ')';
      }
      return 'rgba(41,128,185,' + (0.15 + t * 0.7) + ')';
    }

    function labelColor(v) {
      var dark = ReproDB.isDark();
      var tc = ReproDB.themeColors();
      var t = maxVal > 0 ? v / maxVal : 0;
      var textThreshold = dark ? 0.25 : 0.6;
      return (v > 0 && t > textThreshold) ? '#fff' : tc.text;
    }

    function buildHeatData() {
      return rawData.map(function(d) {
        return { value: [d.x, d.y, d.v], itemStyle: { color: cellColor(d.v, d.area) }, label: { color: labelColor(d.v) } };
      });
    }

    var hmChart = ReproDB.initEChart(el);

    function setOption() {
      var dark = ReproDB.isDark();
      var tc = ReproDB.themeColors();
      var legendItems = [];
      if (area === 'overall') {
        legendItems = [
          { type: 'rect', left: 'center', bottom: 28, shape: { width: 120, height: 12 }, z: 100,
            style: { fill: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: dark ? 'rgba(50,55,65,0.5)' : 'rgba(220,220,220,0.3)' },
              { offset: 1, color: dark ? 'rgb(40,120,210)' : 'rgba(41,128,185,0.85)' }
            ]) } },
          { type: 'text', left: 'center', bottom: 42, z: 100,
            style: { text: 'Systems', fill: tc.text, fontSize: 11, textAlign: 'center' } },
          { type: 'rect', left: 'center', bottom: 4, shape: { width: 120, height: 12 }, z: 100,
            style: { fill: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: dark ? 'rgba(50,55,65,0.5)' : 'rgba(220,220,220,0.3)' },
              { offset: 1, color: dark ? 'rgb(220,40,35)' : 'rgba(192,57,43,0.85)' }
            ]) } },
          { type: 'text', left: 'center', bottom: 18, z: 100,
            style: { text: 'Security', fill: tc.text, fontSize: 11, textAlign: 'center' } }
        ];
      }
      hmChart.setOption({
        tooltip: { formatter: function(p) { return confs[p.value[1]] + ' (' + years[p.value[0]] + '): ' + p.value[2] + ' members'; } },
        grid: { containLabel: true, left: 20, right: 20, bottom: area === 'overall' ? 80 : 30, top: 30 },
        xAxis: { type: 'category', data: years, splitArea: { show: false } },
        yAxis: { type: 'category', data: confs, splitArea: { show: false }, inverse: true },
        graphic: legendItems,
        series: [{
          type: 'heatmap', data: buildHeatData(),
          label: { show: true, fontSize: 10,
            formatter: function(p) { return p.value[2] > 0 ? p.value[2] : ''; }
          },
          itemStyle: {
            borderColor: dark ? '#333' : '#fff', borderWidth: 1
          }
        }]
      });
    }

    setOption();
    ReproDB.registerEChart(hmChart);
    ReproDB.onThemeChange(setOption);
  }

  /* ===== Committee Growth (stacked bar) ===== */
  function renderGrowthChart(stats, area) {
    var el = document.getElementById('committeeGrowthChart');
    if (!el) return;

    var sizes = stats.committee_sizes || [];
    var yearSet = {};
    sizes.forEach(function(s) { if (s.size >= 5) yearSet[s.year] = true; });
    var years = Object.keys(yearSet).sort();

    var chart = ReproDB.initEChart(el);

    if (area === 'overall') {
      var sysByYear = {}, secByYear = {};
      years.forEach(function(y) { sysByYear[y] = 0; secByYear[y] = 0; });
      sizes.forEach(function(s) {
        if (s.size < 5) return;
        if (s.area === 'systems') sysByYear[s.year] = (sysByYear[s.year] || 0) + s.size;
        else secByYear[s.year] = (secByYear[s.year] || 0) + s.size;
      });
      chart.setOption({
        title: { text: 'Total Committee Assignments per Year', left: 'center', textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'axis' },
        legend: { bottom: 0 },
        grid: { containLabel: true, left: 40, right: 20, bottom: 50, top: 40 },
        xAxis: { type: 'category', data: years },
        yAxis: { type: 'value', name: 'Members', min: 0 },
        series: [
          { name: 'Systems', type: 'bar', stack: 's', data: years.map(function(y) { return sysByYear[y]; }), itemStyle: { color: SYS_COLOR } },
          { name: 'Security', type: 'bar', stack: 's', data: years.map(function(y) { return secByYear[y]; }), itemStyle: { color: SEC_COLOR } }
        ]
      });
    } else {
      var byYear = {};
      years.forEach(function(y) { byYear[y] = 0; });
      sizes.forEach(function(s) {
        if (s.size < 5 || s.area !== area) return;
        byYear[s.year] = (byYear[s.year] || 0) + s.size;
      });
      var color = area === 'systems' ? SYS_COLOR : SEC_COLOR;
      chart.setOption({
        title: { text: 'Total Committee Assignments per Year', left: 'center', textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'axis' },
        legend: { bottom: 0 },
        grid: { containLabel: true, left: 40, right: 20, bottom: 50, top: 40 },
        xAxis: { type: 'category', data: years },
        yAxis: { type: 'value', name: 'Members', min: 0 },
        series: [{ name: 'Members', type: 'bar', data: years.map(function(y) { return byYear[y]; }), itemStyle: { color: color } }]
      });
    }
    ReproDB.registerEChart(chart);
  }

  /* ===== Service Frequency Histogram ===== */
  function renderServiceFrequency(aeMembers, area) {
    var el = document.getElementById('serviceFrequencyChart');
    if (!el) return;

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

    var chart = ReproDB.initEChart(el);

    function setOption() {
      var tc = ReproDB.themeColors();
      var labelOpt = { show: true, position: 'top', fontSize: 11, color: tc.text, textBorderColor: 'transparent' };
      var series;
      if (area === 'overall') {
        series = [
          { name: 'Systems', type: 'bar', data: labels.map(function(l) { return binsSys[l]; }), itemStyle: { color: SYS_COLOR }, label: labelOpt },
          { name: 'Security', type: 'bar', data: labels.map(function(l) { return binsSec[l]; }), itemStyle: { color: SEC_COLOR }, label: labelOpt }
        ];
      } else {
        var target = area === 'systems' ? binsSys : binsSec;
        var color = area === 'systems' ? SYS_COLOR : SEC_COLOR;
        series = [{ name: 'Members', type: 'bar', data: labels.map(function(l) { return target[l]; }), itemStyle: { color: color }, label: labelOpt }];
      }

      chart.setOption({
        title: { text: 'Service Frequency \u2014 Terms Served per Member', left: 'center', textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'axis' },
        legend: { bottom: 0 },
        grid: { containLabel: true, left: 40, right: 20, bottom: 60, top: 40 },
        xAxis: { type: 'category', data: labels, name: 'Terms', nameLocation: 'center', nameGap: 25 },
        yAxis: { type: 'value', name: 'Members', min: 0 },
        series: series
      });
    }

    setOption();
    ReproDB.registerEChart(chart);
    ReproDB.onThemeChange(setOption);
  }

  /* ===== Retention Trends ===== */
  function renderRetention(aeMembers, area) {
    var el = document.getElementById('retentionChart');
    if (!el) return;

    var sysYears = {}, secYears = {}, allYearsMap = {};
    aeMembers.forEach(function(m) {
      var isSys = m.area === 'systems' || m.area === 'both';
      var isSec = m.area === 'security' || m.area === 'both';
      if (m.years) {
        Object.keys(m.years).forEach(function(y) {
          if (!allYearsMap[y]) allYearsMap[y] = {};
          allYearsMap[y][m.name] = true;
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
    var allRet = retentionSeries(allYearsMap);

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

    var seriesArr;
    if (area === 'overall') {
      seriesArr = [
        { name: 'Overall \u2014 Retained %', type: 'line', data: alignToLabels(allRet), itemStyle: { color: ReproDB.themeColors().totalLine }, lineStyle: { type: 'dashed', width: 2 }, smooth: 0.3, connectNulls: true, symbolSize: 5 },
        { name: 'Systems \u2014 Retained %', type: 'line', data: alignToLabels(sysRet), itemStyle: { color: SYS_COLOR }, lineStyle: { width: 2 }, smooth: 0.3, connectNulls: true, symbolSize: 5 },
        { name: 'Security \u2014 Retained %', type: 'line', data: alignToLabels(secRet), itemStyle: { color: SEC_COLOR }, lineStyle: { width: 2 }, smooth: 0.3, connectNulls: true, symbolSize: 5 }
      ];
    } else {
      var areaYears = area === 'systems' ? sysYears : secYears;
      var sameAreaRet = area === 'systems' ? sysRet : secRet;
      var crossRet = crossRetentionSeries(areaYears, allYearsMap);
      var color = area === 'systems' ? SYS_COLOR : SEC_COLOR;
      crossRet.labels.forEach(function(l) { allLabels[l] = true; });
      labels = Object.keys(allLabels).sort();
      seriesArr = [
        { name: 'Retained (same area) %', type: 'line', data: alignToLabels(sameAreaRet), itemStyle: { color: color }, lineStyle: { width: 2 }, smooth: 0.3, connectNulls: true, symbolSize: 5 },
        { name: 'Retained (any area) %', type: 'line', data: alignToLabels(crossRet), itemStyle: { color: color }, lineStyle: { type: 'dashed', width: 2 }, smooth: 0.3, connectNulls: true, symbolSize: 5 }
      ];
    }

    var chart = ReproDB.initEChart(el);
    chart.setOption({
      title: { text: 'Year-over-Year Retention \u2014 % of Committee from Prior Year', left: 'center', textStyle: { fontSize: 13 } },
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0 },
      grid: { containLabel: true, left: 40, right: 20, bottom: 50, top: 50 },
      xAxis: { type: 'category', data: labels },
      yAxis: { type: 'value', name: '% Retained', min: 0, max: 100 },
      series: seriesArr
    });
    ReproDB.registerEChart(chart);
  }

  /* ===== AE Committee Flow (Sankey) ===== */
  var CONF_COLORS = {
    'ATC': '#2563eb', 'OSDI': '#1d4ed8', 'EUROSYS': '#3b82f6',
    'SOSP': '#60a5fa', 'FAST': '#93c5fd', 'SC': '#7dd3fc',
    'USENIXSEC': '#dc2626', 'NDSS': '#ef4444', 'ACSAC': '#f87171',
    'CHES': '#fb923c', 'PETS': '#f97316', 'WOOT': '#fdba74',
    'SYSTEX': '#a78bfa', 'VEHICLESEC': '#c084fc', 'CAIS': '#e9d5ff'
  };

  function confColor(name) {
    return CONF_COLORS[name] || '#6b7280';
  }

  function renderMemberFlow(aeMembers, area) {
    var el = document.getElementById('memberFlowSankey');
    if (!el) return;

    // Build per-conference-year membership sets
    var confYear = {}; // "CONF|YEAR" -> { name: true }
    var confAreas = {}; // CONF -> area

    aeMembers.forEach(function(m) {
      if (area !== 'overall') {
        if (m.area !== area && m.area !== 'both') return;
      }
      (m.conferences || []).forEach(function(c) {
        var key = c.conference + '|' + c.year;
        if (!confYear[key]) confYear[key] = {};
        confYear[key][m.name] = true;
        confAreas[c.conference] = m.area;
      });
    });

    // Collect years
    var yearSet = {};
    Object.keys(confYear).forEach(function(k) {
      yearSet[k.split('|')[1]] = true;
    });
    var years = Object.keys(yearSet).map(Number).sort(function(a, b) { return a - b; });
    if (years.length < 2) return;

    var nodes = [];
    var links = [];
    var nodeSet = {};

    function addNode(name, depth) {
      if (!nodeSet[name]) {
        nodeSet[name] = true;
        nodes.push({ name: name, depth: depth });
      }
    }

    // Create a node per conference-year
    var MIN_SIZE = 5; // skip tiny committees
    Object.keys(confYear).forEach(function(key) {
      var parts = key.split('|');
      var conf = parts[0], yr = Number(parts[1]);
      if (Object.keys(confYear[key]).length < MIN_SIZE) return;
      var depth = years.indexOf(yr);
      var label = conf + ' ' + yr;
      addNode(label, depth);
    });

    // Build links between consecutive years
    for (var i = 0; i < years.length - 1; i++) {
      var y1 = years[i], y2 = years[i + 1];
      // Find all conferences in both years
      var confs1 = [], confs2 = [];
      Object.keys(confYear).forEach(function(key) {
        var parts = key.split('|');
        if (Number(parts[1]) === y1 && Object.keys(confYear[key]).length >= MIN_SIZE) confs1.push(parts[0]);
        if (Number(parts[1]) === y2 && Object.keys(confYear[key]).length >= MIN_SIZE) confs2.push(parts[0]);
      });

      confs1.forEach(function(c1) {
        var members1 = confYear[c1 + '|' + y1] || {};
        confs2.forEach(function(c2) {
          var members2 = confYear[c2 + '|' + y2] || {};
          var shared = 0;
          Object.keys(members1).forEach(function(n) {
            if (members2[n]) shared++;
          });
          if (shared >= 2) {
            links.push({
              source: c1 + ' ' + y1,
              target: c2 + ' ' + y2,
              value: shared
            });
          }
        });
      });
    }

    // Prune nodes with no links
    var linkedNodes = {};
    links.forEach(function(l) { linkedNodes[l.source] = true; linkedNodes[l.target] = true; });
    nodes = nodes.filter(function(n) { return linkedNodes[n.name]; });

    if (nodes.length === 0 || links.length === 0) return;

    var chart = ReproDB.initEChart(el);

    function setOption() {
      var tc = ReproDB.themeColors();
      chart.setOption({
        title: {
          text: 'AE Committee Flow Across Conferences',
          subtext: 'Shared members between conference AECs in consecutive years (min. 2 shared)',
          left: 'center',
          textStyle: { fontSize: 14, color: tc.text },
          subtextStyle: { fontSize: 11, color: tc.textMuted }
        },
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            if (params.dataType === 'edge') {
              return params.data.source + ' \u2192 ' + params.data.target + '<br/>' + params.data.value + ' shared members';
            }
            return params.name + '<br/>' + params.value + ' members linked';
          }
        },
        series: [{
          type: 'sankey',
          top: 60,
          bottom: 20,
          left: 60,
          right: 60,
          nodeGap: 14,
          nodeWidth: 18,
          emphasis: { focus: 'adjacency' },
          data: nodes.map(function(n) {
            var conf = n.name.split(' ')[0];
            return {
              name: n.name,
              depth: n.depth,
              itemStyle: { color: confColor(conf) }
            };
          }),
          links: links,
          lineStyle: { color: 'source', opacity: 0.25, curveness: 0.5 },
          label: {
            show: true,
            fontSize: 10,
            color: tc.text
          }
        }]
      });
    }

    setOption();
    ReproDB.registerEChart(chart);
    ReproDB.onThemeChange(setOption);
  }

  /* ===== Geographic: Continents ===== */
  var CONTINENT_COLORS = {
    'North America': '#2563eb',
    'Europe': '#dc2626',
    'Asia': '#16a34a',
    'Oceania': '#9333ea',
    'South America': '#ea580c',
    'Africa': '#0ea5e9',
    'Antarctica': '#a855f7'
  };

  function continentColor(name) {
    return CONTINENT_COLORS[name] || '#787878';
  }

  function renderContinents(stats, area) {
    var el = document.getElementById('committeeContinentsChart');
    if (!el) return;

    var key = area === 'overall' ? 'overall' : area;
    var continents = (stats.by_continent || {})[key] || [];

    var chart = ReproDB.initEChart(el);
    chart.setOption({
      title: { text: 'Members by Continent', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', right: 10, top: 'center' },
      series: [{
        type: 'pie', radius: ['40%', '70%'], center: ['40%', '55%'],
        data: continents.map(function(c) { return { name: c.name, value: c.count, itemStyle: { color: continentColor(c.name) } }; }),
        label: { show: false }, emphasis: { label: { show: true, fontSize: 13 } }
      }]
    });
    ReproDB.registerEChart(chart);

    if (area === 'overall') {
      var sysEl = document.getElementById('continentSysChart');
      var secEl = document.getElementById('continentSecChart');
      if (sysEl) {
        var sysCont = (stats.by_continent || {}).systems || [];
        var sc = ReproDB.initEChart(sysEl);
        sc.setOption({
          title: { text: 'Systems', left: 'center', textStyle: { fontSize: 13 } },
          tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
          legend: { bottom: 0, type: 'scroll' },
          series: [{ type: 'pie', radius: ['35%', '65%'], center: ['50%', '45%'],
            data: sysCont.map(function(c) { return { name: c.name, value: c.count, itemStyle: { color: continentColor(c.name) } }; }),
            label: { show: false } }]
        });
        ReproDB.registerEChart(sc);
      }
      if (secEl) {
        var secCont = (stats.by_continent || {}).security || [];
        var sc2 = ReproDB.initEChart(secEl);
        sc2.setOption({
          title: { text: 'Security', left: 'center', textStyle: { fontSize: 13 } },
          tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
          legend: { bottom: 0, type: 'scroll' },
          series: [{ type: 'pie', radius: ['35%', '65%'], center: ['50%', '45%'],
            data: secCont.map(function(c) { return { name: c.name, value: c.count, itemStyle: { color: continentColor(c.name) } }; }),
            label: { show: false } }]
        });
        ReproDB.registerEChart(sc2);
      }
    }
  }

  /* ===== Top Countries ===== */
  function renderCountries(stats, area) {
    var el = document.getElementById('committeeCountriesChart');
    if (!el) return;

    var chart = ReproDB.initEChart(el);

    if (area === 'overall') {
      var sysCountries = ((stats.by_country || {}).systems || []).slice(0, 15);
      var secCountries = ((stats.by_country || {}).security || []).slice(0, 15);
      var countrySet = {};
      sysCountries.forEach(function(c) { countrySet[c.name] = { sys: c.count, sec: 0 }; });
      secCountries.forEach(function(c) {
        if (!countrySet[c.name]) countrySet[c.name] = { sys: 0, sec: 0 };
        countrySet[c.name].sec = c.count;
      });
      var sorted = Object.keys(countrySet).map(function(n) { return { name: n, sys: countrySet[n].sys, sec: countrySet[n].sec, total: countrySet[n].sys + countrySet[n].sec }; });
      sorted.sort(function(a, b) { return b.total - a.total; });
      sorted = sorted.slice(0, 12);
      var labels = sorted.map(function(c) { return c.name.length > 20 ? c.name.substring(0, 18) + '\u2026' : c.name; }).reverse();
      chart.setOption({
        title: { text: 'Top Countries \u2014 Systems vs Security', left: 'center', textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'axis' },
        legend: { bottom: 0 },
        grid: { containLabel: true, left: 20, right: 20, bottom: 50, top: 40 },
        xAxis: { type: 'value', name: 'Members', nameLocation: 'center', nameGap: 25 },
        yAxis: { type: 'category', data: labels },
        series: [
          { name: 'Systems', type: 'bar', stack: 'total', data: sorted.map(function(c) { return c.sys; }).reverse(), itemStyle: { color: SYS_COLOR } },
          { name: 'Security', type: 'bar', stack: 'total', data: sorted.map(function(c) { return c.sec; }).reverse(), itemStyle: { color: SEC_COLOR } }
        ]
      });
    } else {
      var key = area === 'overall' ? 'overall' : area;
      var countries = ((stats.by_country || {})[key] || []).slice(0, 15);
      var color = area === 'systems' ? SYS_COLOR : SEC_COLOR;
      var labels = countries.map(function(c) { return c.name.length > 25 ? c.name.substring(0, 23) + '\u2026' : c.name; }).reverse();
      chart.setOption({
        title: { text: 'Top 15 Countries', left: 'center', textStyle: { fontSize: 14 } },
        tooltip: { trigger: 'axis' },
        legend: { show: false },
        grid: { containLabel: true, left: 20, right: 20, bottom: 50, top: 40 },
        xAxis: { type: 'value', name: 'Members', nameLocation: 'center', nameGap: 25 },
        yAxis: { type: 'category', data: labels },
        series: [{ name: 'Members', type: 'bar', data: countries.map(function(c) { return c.count; }).reverse(), itemStyle: { color: color } }]
      });
    }
    ReproDB.registerEChart(chart);
  }

  /* ===== Top Institutions ===== */
  function renderInstitutions(stats, area) {
    var el = document.getElementById('committeeInstitutionsChart');
    if (!el) return;

    if (area === 'overall') {
      var sysEl = document.getElementById('instSysChart');
      var secEl = document.getElementById('instSecChart');
      var sysInst = ((stats.by_institution || {}).systems || []).slice(0, 10);
      var secInst = ((stats.by_institution || {}).security || []).slice(0, 10);

      if (sysEl) makeInstBar(sysEl, sysInst, 'Systems \u2014 Top 10', SYS_COLOR);
      if (secEl) makeInstBar(secEl, secInst, 'Security \u2014 Top 10', SEC_COLOR);

      el.parentElement.style.display = 'none';
    } else {
      var key = area;
      var institutions = ((stats.by_institution || {})[key] || []).slice(0, 15);
      var color = area === 'systems' ? SYS_COLOR : SEC_COLOR;
      makeInstBar(el, institutions, 'Top 15 Institutions', color);
    }
  }

  function makeInstBar(el, data, title, color) {
    var labels = data.map(function(i) { var n = i.name; return n.length > 35 ? n.substring(0, 33) + '\u2026' : n; }).reverse();
    var chart = ReproDB.initEChart(el);
    chart.setOption({
      title: { text: title, left: 'center', textStyle: { fontSize: 13 } },
      tooltip: { trigger: 'axis' },
      legend: { show: false },
      grid: { containLabel: true, left: 20, right: 20, bottom: 50, top: 50 },
      xAxis: { type: 'value', name: 'Members', nameLocation: 'center', nameGap: 25 },
      yAxis: { type: 'category', data: labels },
      series: [{ name: 'Members', type: 'bar', data: data.map(function(i) { return i.count; }).reverse(), itemStyle: { color: color } }]
    });
    ReproDB.registerEChart(chart);
  }

  /* ===== Cross-Community Overlap ===== */
  function renderCrossOverlap(aeMembers) {
    var el = document.getElementById('crossOverlapChart');
    if (!el) return;

    var sysOnly = 0, secOnly = 0, both = 0;
    aeMembers.forEach(function(m) {
      if (m.area === 'both') both++;
      else if (m.area === 'systems') sysOnly++;
      else if (m.area === 'security') secOnly++;
    });

    var chart = ReproDB.initEChart(el);
    chart.setOption({
      title: { text: 'Cross-Community Membership', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      grid: { containLabel: true, left: 40, right: 20, bottom: 30, top: 40 },
      xAxis: { type: 'category', data: ['Systems Only', 'Both Areas', 'Security Only'] },
      yAxis: { type: 'value', name: 'Members', min: 0 },
      series: [{
        type: 'bar',
        data: [
          { value: sysOnly, itemStyle: { color: SYS_COLOR } },
          { value: both, itemStyle: { color: BOTH_COLOR } },
          { value: secOnly, itemStyle: { color: SEC_COLOR } }
        ]
      }]
    });
    ReproDB.registerEChart(chart);
  }

})();
