/**
 * reprodb-geo.js — Geographic statistics page logic.
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

  /* ── Country code → name / continent maps ────────────────────────── */
  var CODE_TO_NAME = {
    US:'United States',CN:'China',JP:'Japan',GB:'United Kingdom',
    DE:'Germany',FR:'France',CA:'Canada',AU:'Australia',IN:'India',
    SG:'Singapore',KR:'South Korea',CH:'Switzerland',NL:'Netherlands',
    SE:'Sweden',NO:'Norway',DK:'Denmark',FI:'Finland',BE:'Belgium',
    AT:'Austria',IL:'Israel',IT:'Italy',ES:'Spain',PT:'Portugal',
    GR:'Greece',HK:'Hong Kong',TW:'Taiwan',TH:'Thailand',BR:'Brazil',
    MX:'Mexico',AR:'Argentina',CL:'Chile',IE:'Ireland',NZ:'New Zealand',
    ZA:'South Africa',RU:'Russia',UA:'Ukraine',PL:'Poland',RO:'Romania',
    CZ:'Czechia',HU:'Hungary',TR:'Turkey',PK:'Pakistan',MY:'Malaysia',
    ID:'Indonesia',VN:'Vietnam',PH:'Philippines',BD:'Bangladesh',
    LK:'Sri Lanka',IR:'Iran',SA:'Saudi Arabia',AE:'UAE',EG:'Egypt',
    KE:'Kenya',NG:'Nigeria',MA:'Morocco',CO:'Colombia',PE:'Peru',
    RW:'Rwanda',QA:'Qatar',LU:'Luxembourg',CY:'Cyprus'
  };

  var CODE_TO_CONTINENT = {
    US:'North America',CA:'North America',MX:'North America',
    CN:'Asia',JP:'Asia',KR:'Asia',SG:'Asia',IN:'Asia',TW:'Asia',
    HK:'Asia',TH:'Asia',PK:'Asia',MY:'Asia',ID:'Asia',VN:'Asia',
    PH:'Asia',BD:'Asia',LK:'Asia',IR:'Asia',SA:'Asia',AE:'Asia',QA:'Asia',
    GB:'Europe',DE:'Europe',FR:'Europe',CH:'Europe',NL:'Europe',
    SE:'Europe',NO:'Europe',DK:'Europe',FI:'Europe',BE:'Europe',
    AT:'Europe',IL:'Europe',IT:'Europe',ES:'Europe',PT:'Europe',
    GR:'Europe',IE:'Europe',RU:'Europe',UA:'Europe',PL:'Europe',
    RO:'Europe',CZ:'Europe',HU:'Europe',TR:'Europe',LU:'Europe',CY:'Europe',
    AU:'Oceania',NZ:'Oceania',
    BR:'South America',AR:'South America',CL:'South America',
    CO:'South America',PE:'South America',
    ZA:'Africa',KE:'Africa',NG:'Africa',MA:'Africa',EG:'Africa',RW:'Africa'
  };

  /* ── Institution → country code (abbreviated, common patterns) ───── */
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
    // US state heuristic
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
  var charts = [];
  function destroyCharts() { charts.forEach(function(c) { c.destroy(); }); charts = []; }

  function allYears(items) {
    var yrs = {};
    items.forEach(function(d) { for (var y in d.years) yrs[y] = true; });
    return Object.keys(yrs).map(Number).sort();
  }

  /* ── Render: Continental donut ───────────────────────────────────── */
  function renderContinentDonut(continents) {
    var sorted = continents.slice().sort(function(a,b) { return b.artifacts - a.artifacts; });
    charts.push(new Chart(document.getElementById('chartContinentDonut'), {
      type: 'doughnut',
      data: {
        labels: sorted.map(function(c) { return c.name; }),
        datasets: [{
          data: sorted.map(function(c) { return c.artifacts; }),
          backgroundColor: sorted.map(function(c) { return CONTINENT_COLORS[c.name] || '#999'; })
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'nearest', intersect: true },
        plugins: {
          title: { display: false },
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
          tooltip: { enabled: true }
        }
      }
    }));
  }

  /* ── Render: Continental stacked bar ─────────────────────────────── */
  function renderContinentBar(continents) {
    var sorted = continents.slice().sort(function(a,b) { return b.combined - a.combined; });
    charts.push(new Chart(document.getElementById('chartContinentBar'), {
      type: 'bar',
      data: {
        labels: sorted.map(function(c) { return c.name; }),
        datasets: [
          { label: 'Artifacts', data: sorted.map(function(c) { return c.artifacts; }), backgroundColor: '#2563eb' },
          { label: 'AE Service', data: sorted.map(function(c) { return c.ae; }), backgroundColor: '#16a34a' },
          { label: 'Chairs', data: sorted.map(function(c) { return c.chairs; }), backgroundColor: '#f59e0b' }
        ]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { title: { display: false }, legend: { position: 'bottom', labels: { boxWidth: 12 } }, tooltip: { enabled: true } },
        scales: { x: { stacked: true, beginAtZero: true }, y: { stacked: true } }
      }
    }));
  }

  /* ── Render: Top 15 countries bar ────────────────────────────────── */
  function renderCountryBar(countries) {
    var top = countries.slice().sort(function(a,b) { return b.combined - a.combined; }).slice(0, 15);
    charts.push(new Chart(document.getElementById('chartCountryBar'), {
      type: 'bar',
      data: {
        labels: top.map(function(c) { return c.name; }),
        datasets: [
          { label: 'Artifact Score', data: top.map(function(c) { return c.artifacts; }), backgroundColor: '#2563eb' },
          { label: 'AE Service', data: top.map(function(c) { return c.ae; }), backgroundColor: '#16a34a' }
        ]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { title: { display: false }, legend: { position: 'bottom', labels: { boxWidth: 12 } }, tooltip: { enabled: true } },
        scales: { x: { stacked: true, beginAtZero: true }, y: { stacked: true } }
      }
    }));
  }

  /* ── Render: Availability vs Reproducibility bubble ──────────────── */
  function renderReproBubble(countries) {
    var filtered = countries.filter(function(c) { return c.artifacts >= 5; });
    var points = filtered.map(function(c) {
      var availPct = c.papers > 0 ? Math.round(c.artifacts / c.papers * 100) : 0;
      var reproPct = c.artifacts > 0 ? Math.round(c.reproducible / c.artifacts * 100) : 0;
      return { x: availPct, y: reproPct, r: Math.max(4, Math.sqrt(c.institutions) * 3), label: c.name, code: c.code };
    });
    charts.push(new Chart(document.getElementById('chartReproBubble'), {
      type: 'bubble',
      data: {
        datasets: [{
          label: 'Countries',
          data: points,
          backgroundColor: points.map(function(p) {
            var col = CONTINENT_COLORS[CODE_TO_CONTINENT[p.code]] || '#999';
            return col + '88';
          }),
          borderColor: points.map(function(p) { return CONTINENT_COLORS[CODE_TO_CONTINENT[p.code]] || '#999'; }),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'nearest', intersect: true },
        plugins: {
          title: { display: false },
          legend: { display: false },
          tooltip: { enabled: true, callbacks: { label: function(ctx) { var p = ctx.raw; return p.label + ': ' + p.x + '% available, ' + p.y + '% repro, ' + Math.round(p.r*p.r/9) + ' inst'; } } }
        },
        scales: {
          x: { title: { display: true, text: 'Artifact Availability %' }, beginAtZero: true, max: 100 },
          y: { title: { display: true, text: 'Reproducibility %' }, beginAtZero: true, max: 100 }
        }
      }
    }));
  }

  /* ── Render: Activity over time by continent ─────────────────────── */
  function renderContinentTrend(continents) {
    var years = allYears(continents);
    var sorted = continents.slice().sort(function(a,b) { return b.combined - a.combined; });
    charts.push(new Chart(document.getElementById('chartContinentTrend'), {
      type: 'line',
      data: {
        labels: years,
        datasets: sorted.map(function(c, i) {
          return { label: c.name, data: years.map(function(y) { return c.years[y] || 0; }),
            borderColor: CONTINENT_COLORS[c.name] || PALETTE[i], fill: false, tension: 0.3, pointRadius: 3 };
        })
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { title: { display: false }, legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }, tooltip: { enabled: true } },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Active contributions' } }, x: { title: { display: true, text: 'Year' } } }
      }
    }));
  }

  /* ── Render: Top 8 countries trend ───────────────────────────────── */
  function renderCountryTrend(countries) {
    var top8 = countries.slice().sort(function(a,b) { return b.combined - a.combined; }).slice(0, 8);
    var years = allYears(top8);
    charts.push(new Chart(document.getElementById('chartCountryTrend'), {
      type: 'line',
      data: {
        labels: years,
        datasets: top8.map(function(c, i) {
          return { label: c.name, data: years.map(function(y) { return c.years[y] || 0; }),
            borderColor: PALETTE[i], borderWidth: 2, fill: false, tension: 0.2, pointRadius: 3, spanGaps: true };
        })
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { title: { display: false }, legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }, tooltip: { enabled: true } },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Active contributions' } }, x: { title: { display: true, text: 'Year' } } }
      }
    }));
  }

  /* ── Render: AE committee trends ─────────────────────────────────── */
  function renderAETrend(aeData) {
    var years = allYears(aeData.continents);
    var sorted = aeData.continents.slice().sort(function(a,b) { return b.total - a.total; });
    charts.push(new Chart(document.getElementById('chartAETrend'), {
      type: 'line',
      data: {
        labels: years,
        datasets: sorted.map(function(c, i) {
          return { label: c.name, data: years.map(function(y) { return c.years[y] || 0; }),
            borderColor: CONTINENT_COLORS[c.name] || PALETTE[i], borderWidth: 2, fill: false, tension: 0.2, pointRadius: 3, spanGaps: true };
        })
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { title: { display: false }, legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }, tooltip: { enabled: true } },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'AE memberships' } }, x: { title: { display: true, text: 'Year' } } }
      }
    }));
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
        '<div class="stats">' + c.institutions + ' inst · ' + c.artifacts + ' artifacts · ' + reproPct + '% repro · ' + partPct + '% participation</div></div></div>';
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
      var _t = null;
      searchInput.addEventListener('input', function() {
        clearTimeout(_t); _t = setTimeout(function() { render(searchInput.value); }, 200);
      });
    }
  }

  /* ── Load and render ─────────────────────────────────────────────── */
  Promise.all([
    fetch(instUrl).then(function(r) { return r.json(); }),
    fetch(aeUrl).then(function(r) { return r.json(); })
  ]).then(function(results) {
    var institutions = results[0];
    var aeMembers = results[1];

    var countries = aggregateByCountry(institutions);
    var continents = aggregateByContinent(countries);
    var aeData = aggregateAE(aeMembers);

    // Show content
    document.getElementById('geo-loading').classList.add('rdb-hidden');
    document.getElementById('geo-content').classList.remove('rdb-hidden');

    // Render summary numbers
    document.getElementById('statCountries').textContent = countries.length;
    document.getElementById('statContinents').textContent = continents.length;
    document.getElementById('statInstitutions').textContent = institutions.length;
    var totalArt = countries.reduce(function(s,c) { return s + c.artifacts; }, 0);
    document.getElementById('statArtifacts').textContent = totalArt;

    // Render charts
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
