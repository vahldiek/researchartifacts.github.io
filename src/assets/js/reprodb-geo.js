/**
 * reprodb-geo.js — Geographic statistics page logic (ECharts).
 * Reads data URLs from #geo-data element, fetches JSON, renders charts and cards.
 */
(function() {
  'use strict';

  var dataEl = document.getElementById('geo-data');
  if (!dataEl) return;
  var cfg = JSON.parse(dataEl.textContent);

  var geoUrl = cfg.geoUrl;
  var instUrl = cfg.instUrl;
  var aeUrl = cfg.aeUrl;

  /* ── Palette ─────────────────────────────────────────────────────── */
  var PALETTE = ['#2563eb','#dc2626','#16a34a','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#84cc16'];
  var CONTINENT_COLORS = {
    'North America': '#2563eb', 'Europe': '#16a34a', 'Asia': '#dc2626',
    'Oceania': '#f59e0b', 'South America': '#8b5cf6', 'Africa': '#ec4899'
  };

  /* ── Country code → name / continent maps (from shared utils) ───── */
  var CODE_TO_NAME = ReproDB.CODE_TO_NAME;
  var CODE_TO_CONTINENT = ReproDB.CODE_TO_CONTINENT;

  /* ── Institution → country code ──────────────────────────────────── */
  var INST_PATTERNS = {
    'mit':'US','stanford':'US','berkeley':'US','carnegie mellon':'US','cmu':'US',
    'harvard':'US','princeton':'US','cornell':'US','columbia':'US',
    'ucsd':'US','ucsb':'US','ucla':'US','uiuc':'US','university of california':'US',
    'georgia tech':'US','michigan':'US','caltech':'US','purdue':'US',
    'wisconsin':'US','virginia tech':'US','stony brook':'US','utah':'US',
    'duke':'US','ohio state':'US','illinois':'US','penn state':'US',
    'rice':'US','northwestern':'US','nyu':'US','johns hopkins':'US',
    'george mason':'US','northeastern':'US','arizona state':'US',
    'microsoft':'US','google':'US','amazon':'US','apple':'US',
    'meta':'US','facebook':'US','ibm':'US','intel':'US','vmware':'US',
    'microsoft research asia':'CN','msra':'CN',
    'oxford':'GB','cambridge':'GB','imperial college':'GB','ucl':'GB',
    'edinburgh':'GB','manchester':'GB','bristol':'GB','london':'GB',
    'eth':'CH','ethz':'CH','epfl':'CH',
    'delft':'NL','tu delft':'NL','amsterdam':'NL','twente':'NL',
    'lund':'SE','kth':'SE','chalmers':'SE',
    'helsinki':'FI','aalto':'FI',
    'leuven':'BE','imec':'BE',
    'vienna':'AT','graz':'AT','tu graz':'AT','tu wien':'AT',
    'rwth':'DE','munich':'DE','darmstadt':'DE','karlsruhe':'DE',
    'berlin':'DE','saarland':'DE','cispa':'DE','mpi':'DE',
    'max planck':'DE','ruhr':'DE','hasso plattner':'DE',
    'paris':'FR','sorbonne':'FR','inria':'FR','grenoble':'FR',
    'sapienza':'IT','politecnico':'IT','padua':'IT','trento':'IT',
    'barcelona':'ES','imdea':'ES',
    'tel aviv':'IL','technion':'IL','hebrew':'IL','weizmann':'IL',
    'tsinghua':'CN','peking':'CN','fudan':'CN','shanghai':'CN',
    'zhejiang':'CN','nanjing':'CN','beijing':'CN',
    'alibaba':'CN','tencent':'CN','bytedance':'CN','baidu':'CN','huawei':'CN',
    'ntu':'TW','nthu':'TW','academia sinica':'TW',
    'hkust':'HK','hku':'HK','cuhk':'HK','chinese university':'HK',
    'tokyo':'JP','kyoto':'JP','osaka':'JP',
    'kaist':'KR','seoul':'KR','postech':'KR',
    'nus':'SG','ntu singapore':'SG','nanyang':'SG','sutd':'SG',
    'iit':'IN','iisc':'IN',
    'sydney':'AU','unsw':'AU','melbourne':'AU','monash':'AU',
    'toronto':'CA','waterloo':'CA','mcgill':'CA','british columbia':'CA',
    'campinas':'BR','usp':'BR','ufmg':'BR'
  };

  function getCountryCode(name) {
    if (!name) return '';
    var lower = name.toLowerCase();
    if (lower.indexOf('microsoft research asia') !== -1 || lower.indexOf('msra') !== -1) return 'CN';
    if (lower.indexOf('ntu singapore') !== -1) return 'SG';
    for (var pat in INST_PATTERNS) {
      if (lower.indexOf(pat) !== -1) return INST_PATTERNS[pat];
    }
    if (/\b(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming)\b/.test(lower)) return 'US';
    return '';
  }

  /* ── Aggregation from institution_rankings.json ──────────────────── */
  function aggregateByCountry(institutions) {
    var byCode = {};
    institutions.forEach(function(inst) {
      var code = getCountryCode(inst.affiliation || '');
      if (!code) return;
      if (!byCode[code]) {
        byCode[code] = {
          code: code, name: CODE_TO_NAME[code] || code,
          continent: CODE_TO_CONTINENT[code] || 'Unknown',
          institutions: 0, researchers: 0, combined: 0,
          artifacts: 0, papers: 0, reproducible: 0, ae: 0, chairs: 0, years: {}
        };
      }
      var c = byCode[code];
      c.institutions++;
      c.researchers += inst.author_count || 0;
      c.combined += inst.combined_score || 0;
      c.artifacts += inst.artifact_count || 0;
      c.papers += inst.total_papers || 0;
      c.reproducible += inst.badges_reproducible || 0;
      c.ae += inst.ae_memberships || 0;
      c.chairs += inst.chair_count || 0;
      var yrs = inst.years || {};
      for (var y in yrs) { c.years[y] = (c.years[y] || 0) + yrs[y]; }
    });
    return Object.values(byCode);
  }

  function aggregateByContinent(countries) {
    var byCont = {};
    countries.forEach(function(c) {
      var cont = c.continent;
      if (!byCont[cont]) {
        byCont[cont] = { name: cont, countries: 0, institutions: 0, researchers: 0,
          combined: 0, artifacts: 0, papers: 0, reproducible: 0, ae: 0, chairs: 0, years: {} };
      }
      var g = byCont[cont];
      g.countries++; g.institutions += c.institutions; g.researchers += c.researchers;
      g.combined += c.combined; g.artifacts += c.artifacts; g.papers += c.papers;
      g.reproducible += c.reproducible; g.ae += c.ae; g.chairs += c.chairs;
      for (var y in c.years) { g.years[y] = (g.years[y] || 0) + c.years[y]; }
    });
    return Object.values(byCont);
  }

  /* ── AE member aggregation ───────────────────────────────────────── */
  function aggregateAE(members) {
    var byCode = {};
    members.forEach(function(m) {
      var code = getCountryCode(m.affiliation || '');
      if (!code) return;
      var confs = m.conferences || [];
      confs.forEach(function(c) {
        var yr = c.year || c[1];
        if (!yr) return;
        if (!byCode[code]) { byCode[code] = { code: code, name: CODE_TO_NAME[code] || code, continent: CODE_TO_CONTINENT[code] || 'Unknown', total: 0, years: {} }; }
        byCode[code].total++;
        byCode[code].years[yr] = (byCode[code].years[yr] || 0) + 1;
      });
    });
    var countries = Object.values(byCode);
    var byCont = {};
    countries.forEach(function(c) {
      if (!byCont[c.continent]) { byCont[c.continent] = { name: c.continent, total: 0, years: {} }; }
      byCont[c.continent].total += c.total;
      for (var y in c.years) { byCont[c.continent].years[y] = (byCont[c.continent].years[y] || 0) + c.years[y]; }
    });
    return { countries: countries, continents: Object.values(byCont) };
  }

  /* ── Chart helpers ───────────────────────────────────────────────── */
  function allYears(items) {
    var yrs = {};
    items.forEach(function(d) { for (var y in d.years) yrs[y] = true; });
    return Object.keys(yrs).map(Number).sort();
  }

  /* ── Render: Continental donut ───────────────────────────────────── */
  function renderContinentDonut(continents) {
    var el = document.getElementById('chartContinentDonut');
    if (!el) return;
    var sorted = continents.slice().sort(function(a,b) { return b.artifacts - a.artifacts; });
    var chart = ReproDB.initEChart(el);
    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, type: 'scroll' },
      series: [{
        type: 'pie', radius: ['40%', '70%'], center: ['50%', '45%'],
        data: sorted.map(function(c) { return { name: c.name, value: c.artifacts, itemStyle: { color: CONTINENT_COLORS[c.name] || '#999' } }; }),
        label: { show: false }, emphasis: { label: { show: true, fontSize: 13 } }
      }]
    });
    ReproDB.registerEChart(chart);
  }

  /* ── Render: Continental stacked bar ─────────────────────────────── */
  function renderContinentBar(continents) {
    var el = document.getElementById('chartContinentBar');
    if (!el) return;
    var sorted = continents.slice().sort(function(a,b) { return b.combined - a.combined; });
    var labels = sorted.map(function(c) { return c.name; }).reverse();
    var chart = ReproDB.initEChart(el);
    chart.setOption({
      title: { text: 'Contributions by Continent', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0 },
      grid: { containLabel: true, left: 20, right: 20, bottom: 50, top: 40 },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: labels },
      series: [
        { name: 'Artifacts', type: 'bar', stack: 'total', data: sorted.map(function(c) { return c.artifacts; }).reverse(), itemStyle: { color: '#2563eb' } },
        { name: 'AE Service', type: 'bar', stack: 'total', data: sorted.map(function(c) { return c.ae; }).reverse(), itemStyle: { color: '#16a34a' } },
        { name: 'Chairs', type: 'bar', stack: 'total', data: sorted.map(function(c) { return c.chairs; }).reverse(), itemStyle: { color: '#f59e0b' } }
      ]
    });
    ReproDB.registerEChart(chart);
  }

  /* ── Render: Top 15 countries bar ────────────────────────────────── */
  function renderCountryBar(countries) {
    var el = document.getElementById('chartCountryBar');
    if (!el) return;
    var top = countries.slice().sort(function(a,b) { return b.combined - a.combined; }).slice(0, 15);
    var labels = top.map(function(c) { return c.name; }).reverse();
    var chart = ReproDB.initEChart(el);
    chart.setOption({
      title: { text: 'Top 15 Countries by Combined Score', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0 },
      grid: { containLabel: true, left: 20, right: 20, bottom: 50, top: 40 },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: labels },
      series: [
        { name: 'Artifact Score', type: 'bar', stack: 'total', data: top.map(function(c) { return c.artifacts; }).reverse(), itemStyle: { color: '#2563eb' } },
        { name: 'AE Service', type: 'bar', stack: 'total', data: top.map(function(c) { return c.ae; }).reverse(), itemStyle: { color: '#16a34a' } }
      ]
    });
    ReproDB.registerEChart(chart);
  }

  /* ── Render: Availability vs Reproducibility scatter ─────────────── */
  function renderReproBubble(countries) {
    var el = document.getElementById('chartReproBubble');
    if (!el) return;
    var filtered = countries.filter(function(c) { return c.artifacts >= 5; });
    var scatterData = filtered.map(function(c) {
      var availPct = c.papers > 0 ? Math.round(c.artifacts / c.papers * 100) : 0;
      var reproPct = c.artifacts > 0 ? Math.round(c.reproducible / c.artifacts * 100) : 0;
      var col = CONTINENT_COLORS[CODE_TO_CONTINENT[c.code]] || '#999';
      return {
        value: [availPct, reproPct],
        symbolSize: Math.max(8, Math.sqrt(c.institutions) * 6),
        itemStyle: { color: col + '88', borderColor: col, borderWidth: 1 },
        label: c.name, code: c.code, inst: c.institutions
      };
    });

    var chart = ReproDB.initEChart(el);
    chart.setOption({
      title: { text: 'Artifact Availability vs. Reproducibility', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { formatter: function(p) { var d = p.data; return d.label + ': ' + d.value[0] + '% available, ' + d.value[1] + '% repro, ' + d.inst + ' inst'; } },
      grid: { containLabel: true, left: 40, right: 20, bottom: 50, top: 40 },
      xAxis: { type: 'value', name: 'Artifact Availability %', min: 0, max: 100, nameLocation: 'center', nameGap: 25 },
      yAxis: { type: 'value', name: 'Reproducibility %', min: 0, max: 100 },
      series: [{ type: 'scatter', data: scatterData }]
    });
    ReproDB.registerEChart(chart);
  }

  /* ── Render: Activity over time by continent ─────────────────────── */
  function renderContinentTrend(continents) {
    var el = document.getElementById('chartContinentTrend');
    if (!el) return;
    var years = allYears(continents);
    var sorted = continents.slice().sort(function(a,b) { return b.combined - a.combined; });
    var chart = ReproDB.initEChart(el);
    chart.setOption({
      title: { text: 'Activity by Continent Over Time', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, type: 'scroll' },
      grid: { containLabel: true, left: 40, right: 20, bottom: 50, top: 40 },
      xAxis: { type: 'category', data: years.map(String), name: 'Year', nameLocation: 'center', nameGap: 25 },
      yAxis: { type: 'value', name: 'Active contributions', min: 0 },
      series: sorted.map(function(c) {
        return { name: c.name, type: 'line', data: years.map(function(y) { return c.years[y] || 0; }),
          itemStyle: { color: CONTINENT_COLORS[c.name] || '#999' }, smooth: 0.3, symbolSize: 5 };
      })
    });
    ReproDB.registerEChart(chart);
  }

  /* ── Render: Top 8 countries trend ───────────────────────────────── */
  function renderCountryTrend(countries) {
    var el = document.getElementById('chartCountryTrend');
    if (!el) return;
    var top8 = countries.slice().sort(function(a,b) { return b.combined - a.combined; }).slice(0, 8);
    var years = allYears(top8);
    var chart = ReproDB.initEChart(el);
    chart.setOption({
      title: { text: 'Top 8 Countries Over Time', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, type: 'scroll' },
      grid: { containLabel: true, left: 40, right: 20, bottom: 50, top: 40 },
      xAxis: { type: 'category', data: years.map(String), name: 'Year', nameLocation: 'center', nameGap: 25 },
      yAxis: { type: 'value', name: 'Active contributions', min: 0 },
      series: top8.map(function(c, i) {
        return { name: c.name, type: 'line', data: years.map(function(y) { return c.years[y] || 0; }),
          itemStyle: { color: PALETTE[i] }, lineStyle: { width: 2 }, smooth: 0.2, symbolSize: 5, connectNulls: true };
      })
    });
    ReproDB.registerEChart(chart);
  }

  /* ── Render: AE committee trends ─────────────────────────────────── */
  function renderAETrend(aeData) {
    var el = document.getElementById('chartAETrend');
    if (!el) return;
    var years = allYears(aeData.continents);
    var sorted = aeData.continents.slice().sort(function(a,b) { return b.total - a.total; });
    var chart = ReproDB.initEChart(el);
    chart.setOption({
      title: { text: 'AE Committee Service by Continent', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, type: 'scroll' },
      grid: { containLabel: true, left: 40, right: 20, bottom: 50, top: 40 },
      xAxis: { type: 'category', data: years.map(String), name: 'Year', nameLocation: 'center', nameGap: 25 },
      yAxis: { type: 'value', name: 'AE memberships', min: 0 },
      series: sorted.map(function(c, i) {
        return { name: c.name, type: 'line', data: years.map(function(y) { return c.years[y] || 0; }),
          itemStyle: { color: CONTINENT_COLORS[c.name] || PALETTE[i] }, lineStyle: { width: 2 }, smooth: 0.2, symbolSize: 5, connectNulls: true };
      })
    });
    ReproDB.registerEChart(chart);
  }

  /* ── Render: Country cards ───────────────────────────────────────── */
  function renderCountryCards(countries) {
    var container = document.getElementById('countryCardsContainer');
    var searchInput = document.getElementById('geoSearch');
    var sorted = countries.slice().sort(function(a,b) { return b.combined - a.combined; });
    var INITIAL_SHOW = 12;

    function cardHtml(c) {
      var reproPct = c.artifacts > 0 ? Math.round(c.reproducible / c.artifacts * 100) : 0;
      var partPct = c.papers > 0 ? Math.round(c.artifacts / c.papers * 100) : 0;
      return '<div class="rdb-country-card">' +
        '<span class="flag fi fi-' + c.code.toLowerCase() + '"></span>' +
        '<div class="info"><div class="name">' + c.name + '</div>' +
        '<div class="stats">' + c.institutions + ' inst \u00b7 ' + c.artifacts + ' artifacts \u00b7 ' + reproPct + '% repro \u00b7 ' + partPct + '% participation</div></div></div>';
    }

    function render(filter) {
      var f = (filter || '').toLowerCase();
      var items = sorted.filter(function(c) { return !f || c.name.toLowerCase().indexOf(f) !== -1 || c.continent.toLowerCase().indexOf(f) !== -1; });
      var isFiltered = f.length > 0;
      var limit = isFiltered ? items.length : INITIAL_SHOW;
      var visible = items.slice(0, limit);
      var remaining = items.length - limit;

      var html = visible.map(cardHtml).join('');
      if (remaining > 0) {
        html += '<button class="rdb-show-more" id="geoShowMore">Show all ' + items.length + ' countries &hellip;</button>';
      }
      container.innerHTML = html;

      if (remaining > 0) {
        document.getElementById('geoShowMore').addEventListener('click', function() {
          container.innerHTML = items.map(cardHtml).join('');
        });
      }
    }

    render('');
    if (searchInput) {
      searchInput.addEventListener('input', ReproDB.debounce(function() { render(searchInput.value); }));
    }
  }

  /* ── Load and render ─────────────────────────────────────────────── */
  Promise.all([
    ReproDB.fetchJSON(instUrl),
    ReproDB.fetchJSON(aeUrl)
  ]).then(function(results) {
    var institutions = results[0];
    var aeMembers = results[1];

    var countries = aggregateByCountry(institutions);
    var continents = aggregateByContinent(countries);
    var aeData = aggregateAE(aeMembers);

    document.getElementById('geo-loading').classList.add('rdb-hidden');
    document.getElementById('geo-content').classList.remove('rdb-hidden');

    document.getElementById('statCountries').textContent = countries.length;
    document.getElementById('statContinents').textContent = continents.length;
    document.getElementById('statInstitutions').textContent = institutions.length;
    var totalArt = countries.reduce(function(s,c) { return s + c.artifacts; }, 0);
    document.getElementById('statArtifacts').textContent = totalArt;

    requestAnimationFrame(function() { requestAnimationFrame(function() {
      renderContinentDonut(continents);
      renderContinentBar(continents);
      renderCountryBar(countries);
      renderReproBubble(countries);
      renderContinentTrend(continents);
      renderCountryTrend(countries);
      renderAETrend(aeData);
      renderCountryCards(countries);
    }); });
  }).catch(function(e) {
    document.getElementById('geo-loading').innerHTML = '<em class="rdb-error">Failed to load data: ' + e + '</em>';
  });
})();
