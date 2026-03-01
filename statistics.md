---
title: "Geographic Statistics"
permalink: /statistics/
description: Institution statistics aggregated by country and continent
data_url: /assets/data/institution_rankings.json
---

This page aggregates institution ranking data by country and continent, showing how artifact evaluation engagement is distributed geographically.

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flag-icons@7.0.0/css/flag-icons.min.css">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

<div id="geo-loading"><em>Loading institution data…</em></div>

<div id="geo-content" style="display:none;">

<h2>By Continent</h2>

<div id="continent-controls" style="margin-bottom:6px; font-size:0.9em;">
  <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
    <div style="white-space:nowrap;">
      <label style="font-weight:bold; margin-right:4px;">Sort&nbsp;by:</label>
      <select id="continentSort" style="padding:2px 6px; font-size:0.95em;">
        <option value="combined" selected>Combined Score</option>
        <option value="institutions">Institutions</option>
        <option value="researchers">Researchers</option>
        <option value="artifacts">Artifacts</option>
        <option value="ae">AE Memberships</option>
        <option value="name">Name</option>
      </select>
    </div>
  </div>
</div>

<table id="continentTable" style="font-size:0.82em; border-collapse:collapse; width:100%;">
<thead><tr>
  <th style="border:1px solid #ddd; padding:4px 6px;">Continent</th>
  <th style="border:1px solid #ddd; padding:4px 6px; text-align:center;">Countries</th>
  <th style="border:1px solid #ddd; padding:4px 6px; text-align:center;">Institutions</th>
  <th style="border:1px solid #ddd; padding:4px 6px; text-align:center;">Researchers</th>
  <th style="border:1px solid #ddd; padding:4px 6px; text-align:center;">Combined</th>
  <th style="border:1px solid #ddd; padding:4px 6px; text-align:center;">Artifacts</th>
  <th style="border:1px solid #ddd; padding:4px 6px; text-align:center;">Papers</th>
  <th style="border:1px solid #ddd; padding:4px 6px; text-align:center;">AE Members</th>
  <th style="border:1px solid #ddd; padding:4px 6px; text-align:center;">Chairs</th>
</tr></thead>
<tbody id="continentBody"></tbody>
</table>

<h2>By Country</h2>

<div id="country-controls" style="margin-bottom:6px; font-size:0.9em;">
  <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
    <div style="white-space:nowrap;">
      <label style="font-weight:bold; margin-right:4px;">Search:</label>
      <input id="countrySearch" type="text" placeholder="Filter countries…" style="padding:2px 6px; font-size:0.95em; width:160px;">
    </div>
    <div style="white-space:nowrap;">
      <label style="font-weight:bold; margin-right:4px;">Sort&nbsp;by:</label>
      <select id="countrySort" style="padding:2px 6px; font-size:0.95em;">
        <option value="combined" selected>Combined Score</option>
        <option value="institutions">Institutions</option>
        <option value="researchers">Researchers</option>
        <option value="artifacts">Artifacts</option>
        <option value="ae">AE Memberships</option>
        <option value="name">Name</option>
      </select>
    </div>
  </div>
</div>

<table id="countryTable" style="font-size:0.82em; border-collapse:collapse; width:100%;">
<thead><tr>
  <th style="border:1px solid #ddd; padding:4px 6px;"></th>
  <th style="border:1px solid #ddd; padding:4px 6px;">Country</th>
  <th style="border:1px solid #ddd; padding:4px 6px;">Continent</th>
  <th style="border:1px solid #ddd; padding:4px 6px; text-align:center;">Institutions</th>
  <th style="border:1px solid #ddd; padding:4px 6px; text-align:center;">Researchers</th>
  <th style="border:1px solid #ddd; padding:4px 6px; text-align:center;">Combined</th>
  <th style="border:1px solid #ddd; padding:4px 6px; text-align:center;">Artifacts</th>
  <th style="border:1px solid #ddd; padding:4px 6px; text-align:center;">Papers</th>
  <th style="border:1px solid #ddd; padding:4px 6px; text-align:center;">AE Members</th>
  <th style="border:1px solid #ddd; padding:4px 6px; text-align:center;">Chairs</th>
</tr></thead>
<tbody id="countryBody"></tbody>
</table>

<div id="country-paging" style="margin-top:4px; font-size:0.9em;">
  <button id="cPrev" style="padding:2px 6px; font-size:0.9em;">&laquo; Prev</button>
  <span id="cPageInfo" style="margin:0 6px;"></span>
  <button id="cNext" style="padding:2px 6px; font-size:0.9em;">Next &raquo;</button>
  <span id="cTotal" style="margin-left:12px; color:#666;"></span>
</div>

## Trends Over Time

<div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; margin:18px 0;">
  <div><canvas id="chartCountryTrend"></canvas></div>
  <div><canvas id="chartContinentTrend"></canvas></div>
  <div><canvas id="chartCountryBar"></canvas></div>
  <div><canvas id="chartContinentBar"></canvas></div>
</div>

</div><!-- /geo-content -->

<script>
(function() {
  var dataUrl = '{{ page.data_url | relative_url }}';

  /* ── Country code utilities ─────────────────────────────────────── */
  var codeToName = {
    'US':'United States','CN':'China','JP':'Japan','GB':'United Kingdom',
    'DE':'Germany','FR':'France','CA':'Canada','AU':'Australia','IN':'India',
    'SG':'Singapore','KR':'South Korea','CH':'Switzerland','NL':'Netherlands',
    'SE':'Sweden','NO':'Norway','DK':'Denmark','FI':'Finland','BE':'Belgium',
    'AT':'Austria','IL':'Israel','IT':'Italy','ES':'Spain','PT':'Portugal',
    'GR':'Greece','HK':'Hong Kong','TW':'Taiwan','TH':'Thailand','BR':'Brazil',
    'MX':'Mexico','AR':'Argentina','CL':'Chile','IE':'Ireland','NZ':'New Zealand',
    'ZA':'South Africa','RU':'Russia','UA':'Ukraine','PL':'Poland','RO':'Romania',
    'CZ':'Czechia','HU':'Hungary','TR':'Turkey','PK':'Pakistan','MY':'Malaysia',
    'ID':'Indonesia','VN':'Vietnam','PH':'Philippines','BD':'Bangladesh',
    'LK':'Sri Lanka','IR':'Iran','SA':'Saudi Arabia','AE':'UAE','EG':'Egypt',
    'KE':'Kenya','NG':'Nigeria','MA':'Morocco','CO':'Colombia','PE':'Peru',
    'VE':'Venezuela','RW':'Rwanda','QA':'Qatar','LU':'Luxembourg','CY':'Cyprus'
  };

  var codeToContinent = {
    'US':'North America','CA':'North America','MX':'North America',
    'CN':'Asia','JP':'Asia','KR':'Asia','SG':'Asia','IN':'Asia','TW':'Asia',
    'HK':'Asia','TH':'Asia','PK':'Asia','MY':'Asia','ID':'Asia','VN':'Asia',
    'PH':'Asia','BD':'Asia','LK':'Asia','IR':'Asia','SA':'Asia','AE':'Asia',
    'QA':'Asia',
    'GB':'Europe','DE':'Europe','FR':'Europe','CH':'Europe','NL':'Europe',
    'SE':'Europe','NO':'Europe','DK':'Europe','FI':'Europe','BE':'Europe',
    'AT':'Europe','IL':'Europe','IT':'Europe','ES':'Europe','PT':'Europe',
    'GR':'Europe','IE':'Europe','RU':'Europe','UA':'Europe','PL':'Europe',
    'RO':'Europe','CZ':'Europe','HU':'Europe','TR':'Europe','LU':'Europe',
    'CY':'Europe',
    'AU':'Oceania','NZ':'Oceania',
    'BR':'South America','AR':'South America','CL':'South America',
    'CO':'South America','PE':'South America','VE':'South America',
    'ZA':'Africa','KE':'Africa','NG':'Africa','MA':'Africa','EG':'Africa',
    'RW':'Africa'
  };

  /* ── Institution → country code (mirrors institution_ranking_table) ── */
  var knownInstitutions = {
    'mit': 'US', 'massachusetts institute': 'US', 'mass inst of tech': 'US',
    'university of massachusetts': 'US', 'umass': 'US', 'massachusetts': 'US',
    'stanford': 'US', 'berkeley': 'US', 'carnegie mellon': 'US',
    'harvard': 'US', 'princeton': 'US', 'yale': 'US', 'cornell': 'US',
    'columbia': 'US', 'penn': 'US', 'upenn': 'US', 'cmu': 'US',
    'ucsd': 'US', 'ucsb': 'US', 'ucla': 'US', 'uiuc': 'US',
    'uc san diego': 'US', 'uc berkeley': 'US', 'uc santa barbara': 'US', 'uc davis': 'US',
    'uc irvine': 'US', 'uc riverside': 'US', 'uc santa cruz': 'US', 'uc merced': 'US',
    'university of california': 'US', 'university of colorado': 'US', 'university of florida': 'US',
    'georgia tech': 'US', 'msu': 'US', 'michigan': 'US', 'michigan state': 'US',
    'caltech': 'US', 'purdue': 'US', 'texas austin': 'US', 'wisconsin': 'US',
    'washington state': 'US', 'washington': 'US', 'utexas': 'US', 'university of texas': 'US',
    'virginia tech': 'US', 'university of virginia': 'US', 'stony brook': 'US', 'utah': 'US',
    'duke': 'US', 'ohio state': 'US', 'illinois': 'US', 'penn state': 'US', 'university of illinois': 'US',
    'rice': 'US', 'northwestern': 'US', 'nyu': 'US', 'boston': 'US', 'bu': 'US', 'boston university': 'US',
    'university of chicago': 'US', 'johns hopkins': 'US', 'brown university': 'US',
    'george mason': 'US', 'northeastern university': 'US', 'syracuse university': 'US',
    'stevens institute of technology': 'US', 'binghamton university': 'US',
    'emory university': 'US', 'university at buffalo': 'US', 'rutgers university': 'US',
    'william & mary': 'US', 'dartmouth college': 'US', 'case western reserve university': 'US',
    'sandia national laboratories': 'US', 'palo alto networks': 'US', 'netflix': 'US',
    'akamai technologies': 'US', 'tor project': 'US', 'trail of bits': 'US',
    'independent researcher': 'US', 'brave': 'US', 'feldera': 'US',
    'georgia': 'US', 'university of georgia': 'US', 'georgia institute': 'US',
    'san diego': 'US', 'san francisco': 'US', 'arizona': 'US', 'arizona state': 'US',
    'colorado': 'US', 'florida': 'US', 'new hampshire': 'US', 'minnesota': 'US', 'university of minnesota': 'US',
    'iowa': 'US', 'missouri': 'US', 'pittsburgh': 'US', 'university of pittsburgh': 'US',
    'microsoft research': 'US', 'microsoft research asia': 'CN', 'msra': 'CN',
    'google': 'US', 'microsoft': 'US', 'amazon': 'US', 'apple': 'US',
    'meta': 'US', 'facebook': 'US', 'ibm': 'US', 'intel': 'US',
    'cisco': 'US', 'oracle': 'US', 'vmware': 'US', 'adobe': 'US',
    'oxford': 'GB', 'cambridge': 'GB', 'imperial college': 'GB',
    'ucl': 'GB', 'london': 'GB', 'edinburgh': 'GB', 'manchester': 'GB',
    'bristol': 'GB', 'warwick': 'GB',
    'eth': 'CH', 'ethz': 'CH', 'zurich': 'CH', 'epfl': 'CH',
    'delft': 'NL', 'tu delft': 'NL', 'amsterdam': 'NL',
    'lund': 'SE', 'kth': 'SE', 'chalmers': 'SE',
    'oslo': 'NO', 'ntnu': 'NO',
    'aarhus': 'DK', 'copenhagen': 'DK',
    'helsinki': 'FI', 'aalto': 'FI', 'turku': 'FI',
    'leuven': 'BE', 'imec': 'BE', 'gent': 'BE',
    'vienna': 'AT', 'graz': 'AT', 'tu graz': 'AT', 'graz university of technology': 'AT', 'aachen': 'DE', 'tu aachen': 'DE',
    'rwth': 'DE', 'munich': 'DE', 'bonn': 'DE', 'heidelberg': 'DE',
    'berlin': 'DE', 'darmstadt': 'DE', 'karlsruhe': 'DE',
    'ruhr university bochum': 'DE', 'hasso plattner institute': 'DE', 'paderborn university': 'DE',
    'dresden university of technology': 'DE', 'technische universität braunschweig': 'DE', 'tu braunschweig': 'DE',
    'leibniz supercomputing center': 'DE', 'max-planck-institut für informatik': 'DE',
    'saarland': 'DE', 'tu darmstadt': 'DE',
    'max planck institute': 'DE', 'mpi-sws': 'DE', 'mpi-sp': 'DE', 'mpi': 'DE',
    'tu wien': 'AT', 'university of innsbruck': 'AT',
    'university of twente': 'NL',
    'royal holloway': 'GB', 'pqshield': 'GB',
    'masaryk university': 'CZ',
    'university of padua': 'IT', 'university of trento': 'IT',
    'universit catholique de louvain': 'BE', 'distrinet': 'BE',
    'laas-cnrs': 'FR',
    'university of lisbon': 'PT',
    'paris': 'FR', 'sorbonne': 'FR', 'inria': 'FR',
    'grenoble': 'FR', 'polytechnique': 'FR',
    'sapienza': 'IT', 'milano': 'IT', 'politecnico': 'IT', 'rome': 'IT',
    'valencia': 'ES', 'uc3m': 'ES', 'barcelona': 'ES', 'imdea software institute': 'ES',
    'universidade do porto': 'PT', 'inesc': 'PT',
    'athens': 'GR', 'patras': 'GR',
    'prague': 'CZ', 'cuni': 'CZ', 'brno': 'CZ',
    'budapest': 'HU', 'warsaw': 'PL', 'krakow': 'PL',
    'bucharest': 'RO', 'moscow': 'RU',
    'istanbul': 'TR',
    'tel aviv': 'IL', 'hebrew': 'IL', 'technion': 'IL', 'weizmann': 'IL',
    'tsinghua': 'CN', 'peking': 'CN', 'fudan': 'CN', 'shanghai': 'CN',
    'jiao tong': 'CN', 'zhejiang': 'CN', 'nanjing': 'CN', 'harbin': 'CN',
    'huazhong university of science and technology': 'CN',
    'wuhan university': 'CN', 'beihang university': 'CN', 'shandong university': 'CN',
    'nankai university': 'CN', 'southeast university': 'CN', 'zhengzhou university': 'CN',
    'hunan university': 'CN', 'sun yat-sen university': 'CN',
    'national university of defense technology': 'CN',
    'institute of software': 'CN', 'institute of information engineering': 'CN',
    'zhongguancun laboratory': 'CN', 'ant group': 'CN',
    'beijing': 'CN', 'alibaba': 'CN', 'tencent': 'CN', 'bytedance': 'CN',
    'baidu': 'CN', 'huawei': 'CN',
    'cispa': 'DE',
    'ntu': 'TW', 'nthu': 'TW', 'nctu': 'TW',
    'academia sinica': 'TW',
    'hkust': 'HK', 'hku': 'HK', 'cuhk': 'HK', 'chinese university': 'HK',
    'tokyo': 'JP', 'kyoto': 'JP', 'osaka': 'JP', 'tohoku': 'JP',
    'kaist': 'KR', 'kaust': 'SA', 'seoul': 'KR', 'postech': 'KR',
    'nus': 'SG', 'ntu singapore': 'SG', 'nanyang technological university': 'SG', 'sutd': 'SG',
    'iisc': 'IN', 'iit bombay': 'IN', 'iit delhi': 'IN', 'iit kanpur': 'IN',
    'iit madras': 'IN', 'delhi': 'IN', 'mumbai': 'IN',
    'sydney': 'AU', 'unsw': 'AU', 'melbourne': 'AU', 'monash': 'AU',
    'anu': 'AU', 'adelaide': 'AU',
    'university of new south wales': 'AU', 'university of newcastle': 'AU', 'csiro marsfield': 'AU',
    'toronto': 'CA', 'british columbia': 'CA', 'mcmaster': 'CA',
    'waterloo': 'CA', 'mcgill': 'CA', 'quebec': 'CA', 'calgary': 'CA',
    'campinas': 'BR', 'usp': 'BR', 'ufmg': 'BR',
    'pontifical catholic university of minas gerais': 'BR',
    'unam': 'MX', 'buenos aires': 'AR', 'santiago': 'CL'
  };

  var countryNameToCode = {
    'united states': 'US', 'usa': 'US', 'america': 'US',
    'china': 'CN', 'japan': 'JP', 'united kingdom': 'GB', 'uk': 'GB',
    'germany': 'DE', 'france': 'FR', 'canada': 'CA', 'australia': 'AU',
    'india': 'IN', 'singapore': 'SG', 'south korea': 'KR', 'korea': 'KR',
    'switzerland': 'CH', 'netherlands': 'NL', 'sweden': 'SE', 'norway': 'NO',
    'denmark': 'DK', 'finland': 'FI', 'belgium': 'BE', 'austria': 'AT',
    'israel': 'IL', 'italy': 'IT', 'spain': 'ES', 'portugal': 'PT',
    'greece': 'GR', 'hong kong': 'HK', 'taiwan': 'TW', 'thailand': 'TH',
    'brazil': 'BR', 'mexico': 'MX', 'argentina': 'AR', 'chile': 'CL',
    'ireland': 'IE', 'new zealand': 'NZ', 'south africa': 'ZA',
    'russia': 'RU', 'ukraine': 'UA', 'poland': 'PL', 'romania': 'RO',
    'czechia': 'CZ', 'czech republic': 'CZ', 'hungary': 'HU', 'turkey': 'TR',
    'pakistan': 'PK', 'malaysia': 'MY', 'indonesia': 'ID', 'iran': 'IR',
    'saudi arabia': 'SA', 'uae': 'AE', 'egypt': 'EG', 'colombia': 'CO'
  };

  function getCountryCode(name) {
    if (!name) return '';
    var lower = name.toLowerCase();
    if (lower.indexOf('microsoft research asia') !== -1 || lower.indexOf('msra') !== -1) return 'CN';
    if (lower.indexOf('ntu singapore') !== -1) return 'SG';
    for (var inst in knownInstitutions) {
      if (lower.indexOf(inst) !== -1) return knownInstitutions[inst];
    }
    for (var cn in countryNameToCode) {
      if (lower.indexOf(cn) !== -1) return countryNameToCode[cn];
    }
    if (lower.match(/\b(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming)\b/)) return 'US';
    return '';
  }

  function flagHtml(code) {
    if (!code || code.length !== 2) return '';
    return '<span class="fi fi-' + code.toLowerCase() + '" style="margin-right:4px;" title="' + code + '"></span>';
  }

  /* ── Pagination state ───────────────────────────────────────────── */
  var countryPage = 0, countryPageSize = 50, countryRows = [];

  /* ── Aggregation ────────────────────────────────────────────────── */
  function aggregate(institutions) {
    var byCountry = {}, unknown = [];
    institutions.forEach(function(inst) {
      var code = getCountryCode(inst.affiliation || '');
      if (!code) { unknown.push(inst.affiliation); return; }
      if (!byCountry[code]) {
        byCountry[code] = {
          code: code, name: codeToName[code] || code,
          continent: codeToContinent[code] || 'Unknown',
          institutions: 0, researchers: 0, combined: 0,
          artifacts: 0, papers: 0, ae: 0, chairs: 0, years: {}
        };
      }
      var c = byCountry[code];
      c.institutions++;
      c.researchers += inst.num_authors || 0;
      c.combined += inst.combined_score || 0;
      c.artifacts += inst.artifacts || 0;
      c.papers += inst.total_papers || 0;
      c.ae += inst.ae_memberships || 0;
      c.chairs += inst.chair_count || 0;
      if (inst.years) { for (var y in inst.years) c.years[y] = (c.years[y] || 0) + inst.years[y]; }
    });
    if (unknown.length) console.log('Unknown country (' + unknown.length + '):', unknown.slice(0, 20));

    var byContinent = {};
    Object.values(byCountry).forEach(function(c) {
      var cont = c.continent;
      if (!byContinent[cont]) {
        byContinent[cont] = { name: cont, countries: 0, institutions: 0, researchers: 0,
          combined: 0, artifacts: 0, papers: 0, ae: 0, chairs: 0, years: {} };
      }
      var g = byContinent[cont];
      g.countries++; g.institutions += c.institutions; g.researchers += c.researchers;
      g.combined += c.combined; g.artifacts += c.artifacts; g.papers += c.papers;
      g.ae += c.ae; g.chairs += c.chairs;
      for (var y in c.years) g.years[y] = (g.years[y] || 0) + c.years[y];
    });
    return { byCountry: Object.values(byCountry), byContinent: Object.values(byContinent) };
  }

  /* ── Sorting ────────────────────────────────────────────────────── */
  function sorter(key) {
    return function(a, b) {
      if (key === 'name') return a.name.localeCompare(b.name);
      return (b[key] || 0) - (a[key] || 0);
    };
  }
  var sortKeyMap = { 'combined':'combined','institutions':'institutions',
    'researchers':'researchers','artifacts':'artifacts','ae':'ae','name':'name' };

  /* ── Render continent table ─────────────────────────────────────── */
  var continentData = [];
  function renderContinents() {
    var key = sortKeyMap[document.getElementById('continentSort').value] || 'combined';
    var sorted = continentData.slice().sort(sorter(key));
    document.getElementById('continentBody').innerHTML = sorted.map(function(c, i) {
      var bg = i % 2 === 0 ? ' style="background:#f9f9f9;"' : '';
      return '<tr' + bg + '>' +
        '<td style="border:1px solid #ddd; padding:4px 6px; font-weight:bold;">' + c.name + '</td>' +
        '<td style="border:1px solid #ddd; padding:4px 6px; text-align:center;">' + c.countries + '</td>' +
        '<td style="border:1px solid #ddd; padding:4px 6px; text-align:center;">' + c.institutions + '</td>' +
        '<td style="border:1px solid #ddd; padding:4px 6px; text-align:center;">' + c.researchers + '</td>' +
        '<td style="border:1px solid #ddd; padding:4px 6px; text-align:center;"><strong>' + c.combined + '</strong></td>' +
        '<td style="border:1px solid #ddd; padding:4px 6px; text-align:center;">' + c.artifacts + '</td>' +
        '<td style="border:1px solid #ddd; padding:4px 6px; text-align:center;">' + c.papers + '</td>' +
        '<td style="border:1px solid #ddd; padding:4px 6px; text-align:center;">' + c.ae + '</td>' +
        '<td style="border:1px solid #ddd; padding:4px 6px; text-align:center;">' + c.chairs + '</td></tr>';
    }).join('');
  }

  /* ── Render country table ───────────────────────────────────────── */
  var countryData = [];
  function renderCountries() {
    var key = sortKeyMap[document.getElementById('countrySort').value] || 'combined';
    var search = (document.getElementById('countrySearch').value || '').toLowerCase().trim();
    countryRows = countryData.slice()
      .filter(function(c) {
        return !search || c.name.toLowerCase().indexOf(search) !== -1 || c.continent.toLowerCase().indexOf(search) !== -1;
      })
      .sort(sorter(key));
    countryPage = 0;
    renderCountryPage();
  }

  function renderCountryPage() {
    var start = countryPage * countryPageSize;
    var end = Math.min(start + countryPageSize, countryRows.length);
    var page = countryRows.slice(start, end);
    document.getElementById('countryBody').innerHTML = page.map(function(c, i) {
      var bg = i % 2 === 0 ? ' style="background:#f9f9f9;"' : '';
      return '<tr' + bg + '>' +
        '<td style="border:1px solid #ddd; padding:4px 6px; text-align:center;">' + flagHtml(c.code) + '</td>' +
        '<td style="border:1px solid #ddd; padding:4px 6px; font-weight:bold;">' + c.name + '</td>' +
        '<td style="border:1px solid #ddd; padding:4px 6px;">' + c.continent + '</td>' +
        '<td style="border:1px solid #ddd; padding:4px 6px; text-align:center;">' + c.institutions + '</td>' +
        '<td style="border:1px solid #ddd; padding:4px 6px; text-align:center;">' + c.researchers + '</td>' +
        '<td style="border:1px solid #ddd; padding:4px 6px; text-align:center;"><strong>' + c.combined + '</strong></td>' +
        '<td style="border:1px solid #ddd; padding:4px 6px; text-align:center;">' + c.artifacts + '</td>' +
        '<td style="border:1px solid #ddd; padding:4px 6px; text-align:center;">' + c.papers + '</td>' +
        '<td style="border:1px solid #ddd; padding:4px 6px; text-align:center;">' + c.ae + '</td>' +
        '<td style="border:1px solid #ddd; padding:4px 6px; text-align:center;">' + c.chairs + '</td></tr>';
    }).join('') || '<tr><td colspan="10" style="text-align:center;padding:12px;color:#999;">No results</td></tr>';
    updateCountryPaging();
  }

  function updateCountryPaging() {
    var total = countryRows.length;
    var pages = Math.ceil(total / countryPageSize) || 1;
    var start = countryPage * countryPageSize;
    var end = Math.min(start + countryPageSize, total);
    document.getElementById('cPageInfo').textContent = (start + 1) + '\u2013' + end + ' of ' + total;
    document.getElementById('cTotal').textContent = total + ' countries';
    document.getElementById('cPrev').disabled = countryPage <= 0;
    document.getElementById('cNext').disabled = countryPage >= pages - 1;
  }

  /* ── Charts ─────────────────────────────────────────────────────── */
  var chartInstances = [];
  function drawCharts() {
    chartInstances.forEach(function(c) { c.destroy(); });
    chartInstances = [];

    var palette = ['#2563eb','#dc2626','#16a34a','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#84cc16'];

    // Top 8 countries by combined score
    var top8 = countryData.slice().sort(sorter('combined')).slice(0, 8);
    var allYears = {};
    top8.forEach(function(c) { for (var y in c.years) allYears[y] = true; });
    var years = Object.keys(allYears).map(Number).sort();

    // 1) Top 8 countries over time
    chartInstances.push(new Chart(document.getElementById('chartCountryTrend'), {
      type: 'line',
      data: {
        labels: years,
        datasets: top8.map(function(c, i) {
          return { label: c.name, data: years.map(function(y) { return c.years[y] || 0; }),
            borderColor: palette[i], backgroundColor: palette[i] + '22',
            tension: 0.3, pointRadius: 3, fill: false };
        })
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Activity Over Time \u2013 Top 8 Countries' },
                   legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Active contributions' } },
                  x: { title: { display: true, text: 'Year' } } }
      }
    }));

    // 2) Continent activity over time
    var contYears = {};
    continentData.forEach(function(c) { for (var y in c.years) contYears[y] = true; });
    var cYears = Object.keys(contYears).map(Number).sort();
    chartInstances.push(new Chart(document.getElementById('chartContinentTrend'), {
      type: 'line',
      data: {
        labels: cYears,
        datasets: continentData.slice().sort(sorter('combined')).map(function(c, i) {
          return { label: c.name, data: cYears.map(function(y) { return c.years[y] || 0; }),
            borderColor: palette[i], backgroundColor: palette[i] + '22',
            tension: 0.3, pointRadius: 3, fill: false };
        })
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Activity Over Time by Continent' },
                   legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Active contributions' } },
                  x: { title: { display: true, text: 'Year' } } }
      }
    }));

    // 3) Top 15 countries: artifacts vs AE service
    var top15 = countryData.slice().sort(sorter('combined')).slice(0, 15);
    chartInstances.push(new Chart(document.getElementById('chartCountryBar'), {
      type: 'bar',
      data: {
        labels: top15.map(function(c) { return c.name; }),
        datasets: [
          { label: 'Artifacts', data: top15.map(function(c) { return c.artifacts; }), backgroundColor: '#2563eb' },
          { label: 'AE Service', data: top15.map(function(c) { return c.ae; }), backgroundColor: '#16a34a' }
        ]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Top 15 Countries: Artifacts vs AE Service' },
                   legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
        scales: { y: { beginAtZero: true }, x: { ticks: { maxRotation: 45, font: { size: 10 } } } }
      }
    }));

    // 4) Continent stacked bar
    var contSorted = continentData.slice().sort(sorter('combined'));
    chartInstances.push(new Chart(document.getElementById('chartContinentBar'), {
      type: 'bar',
      data: {
        labels: contSorted.map(function(c) { return c.name; }),
        datasets: [
          { label: 'Artifacts', data: contSorted.map(function(c) { return c.artifacts; }), backgroundColor: '#2563eb' },
          { label: 'AE Service', data: contSorted.map(function(c) { return c.ae; }), backgroundColor: '#16a34a' },
          { label: 'Chairs', data: contSorted.map(function(c) { return c.chairs; }), backgroundColor: '#f59e0b' }
        ]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Continent Breakdown: Artifacts, AE Service & Chairs' },
                   legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
        scales: { y: { beginAtZero: true, stacked: true }, x: { stacked: true } }
      }
    }));
  }

  /* ── Events ─────────────────────────────────────────────────────── */
  document.getElementById('continentSort').addEventListener('change', renderContinents);
  document.getElementById('countrySort').addEventListener('change', renderCountries);
  var _ct = null;
  document.getElementById('countrySearch').addEventListener('input', function() {
    clearTimeout(_ct); _ct = setTimeout(renderCountries, 200);
  });
  document.getElementById('cPrev').addEventListener('click', function() {
    if (countryPage > 0) { countryPage--; renderCountryPage(); }
  });
  document.getElementById('cNext').addEventListener('click', function() {
    var pages = Math.ceil(countryRows.length / countryPageSize) || 1;
    if (countryPage < pages - 1) { countryPage++; renderCountryPage(); }
  });

  /* ── Load ────────────────────────────────────────────────────────── */
  fetch(dataUrl)
    .then(function(r) { return r.json(); })
    .then(function(institutions) {
      var agg = aggregate(institutions);
      continentData = agg.byContinent;
      countryData = agg.byCountry;
      renderContinents();
      renderCountries();
      drawCharts();
      document.getElementById('geo-loading').style.display = 'none';
      document.getElementById('geo-content').style.display = '';
    })
    .catch(function(e) {
      document.getElementById('geo-loading').innerHTML =
        '<em style="color:#d00;">Failed to load data: ' + e + '</em>';
    });
})();
</script>

<style>
#continentTable th, #continentTable td,
#countryTable th, #countryTable td { white-space: nowrap; }
#continentTable th, #countryTable th { background-color: #f2f2f2; }
#continentTable tr:hover, #countryTable tr:hover { background-color: #e8f4f8 !important; }
</style>
