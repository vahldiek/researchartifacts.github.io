---
title: "Author Profile"
permalink: /author.html
layout: default
---

{% include profile_common.html %}

<style>
/* Author-specific styles */
.avail-warn { position:relative; cursor:help; font-size:0.8em; color:#b26a00; background:#fff8e1; padding:1px 5px; border-radius:3px; border:1px solid #ffe0b2; }
.avail-warn .avail-tip { display:none; position:absolute; bottom:125%; left:50%; transform:translateX(-50%); background:#333; color:#fff; font-size:0.85em; padding:4px 8px; border-radius:4px; white-space:nowrap; z-index:100; pointer-events:none; }
.avail-warn:hover .avail-tip { display:block; }
.ae-table { font-size:0.88em; border-collapse:collapse; width:100%; margin:10px 0; }
.ae-table th, .ae-table td { padding:6px 10px; border:1px solid #ddd; text-align:left; }
.ae-table th { background:#f2f2f2; }
.ae-table tr:nth-child(even) { background:#fafafa; }
.category-tag { display:inline-block; padding:1px 7px; border-radius:3px; font-size:0.78em; color:#fff; margin-left:6px; }
.cat-systems { background:#2980b9; }
.cat-security { background:#c0392b; }
.cat-both { background:#8e44ad; }
</style>

<div style="position:relative;">
  <input type="text" id="author-search-box" class="profile-search-box" placeholder="Search for an author..." autocomplete="off">
  <ul id="search-results" class="profile-search-results"></ul>
</div>

<div id="loading-msg" class="profile-loading">Loading author data…</div>

<div id="profile-container" class="profile-container">
  <div class="profile-header">
    <h2 id="prof-name"></h2><span id="share-btn" class="share-btn" title="Copy link to this profile">&#128279; Share<span class="share-tip">Link copied!</span></span>
    <div class="affil" id="prof-affil"></div>
  </div>

  <div class="score-cards" id="score-cards"></div>

  <div id="chart-section" style="display:none;">
    <h3>Contributions Over Time</h3>
    <div class="chart-container"><canvas id="timelineChart" height="290"></canvas></div>
  </div>

  <div id="papers-section" style="display:none;">
    <h3>Artifact Papers</h3>
    <table class="profile-table">
      <thead><tr><th>#</th><th>Title</th><th>Conference</th><th>Year</th><th>Badges</th></tr></thead>
      <tbody id="papers-body"></tbody>
    </table>
  </div>

  <div id="ae-section" style="display:none;">
    <h3>AE Committee Service</h3>
    <div id="ae-summary"></div>
    <table class="ae-table" id="ae-table" style="display:none;">
      <thead><tr><th>Conference</th><th>Year</th><th>Role</th></tr></thead>
      <tbody id="ae-body"></tbody>
    </table>
  </div>

  <div id="citations-section" style="display:none;">
    <h3>Cited Artifacts</h3>
    <p id="citations-summary"></p>
    <table class="profile-table" id="citations-table">
      <thead><tr><th>#</th><th>Artifact Title</th><th>Conference</th><th>Year</th><th>Citations</th></tr></thead>
      <tbody id="citations-body"></tbody>
    </table>
  </div>

  <div id="history-section" style="display:none;">
    <h3>Ranking History</h3>
    <div class="chart-container"><canvas id="historyChart" height="290"></canvas></div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<script>
(function() {
  var escHtml = ReproDBProfile.escHtml;
  var cleanName = ReproDBProfile.cleanName;
  var badgeHtml = ReproDBProfile.badgeHtml;
  var card = ReproDBProfile.card;

  var DATA_URL = '{{ "/assets/data/author_profiles.json" | relative_url }}';
  var CITED_ARTIFACTS_URL = '{{ "/assets/data/cited_artifacts_by_author.json" | relative_url }}';
  var HISTORY_URL = '{{ "/assets/data/ranking_history.json" | relative_url }}';
  var ARTIFACTS_URL = '{{ "/assets/data/artifacts.json" | relative_url }}';
  var PAPERS_URL = '{{ "/assets/data/papers.json" | relative_url }}';
  var AVAILABILITY_URL = '{{ "/assets/data/artifact_availability.json" | relative_url }}';
  var allProfiles = [];
  var profileMap = {};
  var idMap = {};
  var citedArtifactsMap = {};
  var artifactUrlMap = {};
  var paperIndex = {};
  var rankHistory = [];
  var urlAccessible = {};
  var availabilityLoaded = false;
  var availabilityCheckedAt = '';
  var chart = null;
  var historyChart = null;

  function renderProfile(p) {
    document.getElementById('profile-container').style.display = 'block';
    document.getElementById('prof-name').textContent = cleanName(p.name);

    var catTag = '';
    if (p.category === 'both') catTag = '<span class="category-tag cat-both">Systems & Security</span>';
    else if (p.category === 'systems') catTag = '<span class="category-tag cat-systems">Systems</span>';
    else if (p.category === 'security') catTag = '<span class="category-tag cat-security">Security</span>';
    document.getElementById('prof-name').innerHTML = escHtml(cleanName(p.name)) + catTag;

    document.getElementById('prof-affil').textContent = p.affiliation || '';

    var cards = '';
    if (p.combined_score !== undefined) {
      cards += card(p.combined_score, 'Combined Score');
      cards += card(p.artifact_score || 0, 'Artifact Score');
      cards += card(p.ae_score || 0, 'AE Score');
      if (p.rank) cards += card('#' + p.rank, 'Rank');
      var rankChange = getRankChange(p.name);
      if (rankChange) cards += card(rankChange.html, 'Rank Change');
    }
    cards += card(p.artifact_count, 'Artifacts');
    cards += card(p.total_papers, 'Total Papers');
    cards += card(p.artifact_pct + '%', 'Artifact Rate');
    if (p.ae_memberships) cards += card(p.ae_memberships, 'AE Memberships');
    if (p.chair_count) cards += card(p.chair_count, 'Chair Roles');
    document.getElementById('score-cards').innerHTML = cards;

    // Papers table
    var papers = [];
    if (p.paper_ids && p.paper_ids.length > 0) {
      for (var pi = 0; pi < p.paper_ids.length; pi++) {
        var pp = paperIndex[p.paper_ids[pi]];
        if (pp) papers.push(pp);
      }
    } else {
      papers = p.papers || [];
    }
    if (papers.length > 0) {
      document.getElementById('papers-section').style.display = 'block';
      var rows = '';
      papers.sort(function(a,b) { return (b.year||0) - (a.year||0); });
      for (var i = 0; i < papers.length; i++) {
        var pp = papers[i];
        var normT = pp.title.replace(/\.+$/, '');
        var ppUrl = artifactUrlMap[normT] || '';
        var titleCell = ppUrl ? '<a href="' + escHtml(ppUrl) + '" target="_blank" rel="noopener">' + escHtml(pp.title) + '</a>' : escHtml(pp.title);
        titleCell += availabilityTag(ppUrl);
        rows += '<tr><td>' + (i+1) + '</td><td>' + titleCell + '</td><td>' +
          escHtml(pp.conference) + '</td><td>' + (pp.year||'') + '</td><td>' +
          badgeHtml(pp.badges) + '</td></tr>';
      }
      document.getElementById('papers-body').innerHTML = rows;
    } else {
      document.getElementById('papers-section').style.display = 'none';
    }

    // AE service
    var aeYears = p.ae_years || {};
    var hasAE = p.ae_memberships && p.ae_memberships > 0;
    if (hasAE) {
      document.getElementById('ae-section').style.display = 'block';
      var summary = '<p><strong>' + p.ae_memberships + '</strong> AE committee membership' + (p.ae_memberships > 1 ? 's' : '');
      if (p.chair_count) summary += ', <strong>' + p.chair_count + '</strong> as chair/co-chair';
      summary += '.</p>';
      if (p.ae_conferences && p.ae_conferences.length) {
        var confNames = [];
        var seen = {};
        for (var ci = 0; ci < p.ae_conferences.length; ci++) {
          var item = p.ae_conferences[ci];
          var cn = Array.isArray(item) ? item[0] : (item.conference || item);
          if (!seen[cn]) { seen[cn] = true; confNames.push(cn); }
        }
        summary += '<p>Conferences: ' + confNames.map(function(c){ return '<strong>'+escHtml(c)+'</strong>';}).join(', ') +'</p>';
      }
      document.getElementById('ae-summary').innerHTML = summary;

      if (p.ae_conferences && p.ae_conferences.length) {
        document.getElementById('ae-table').style.display = '';
        var sorted = p.ae_conferences.slice().sort(function(a,b) {
          var ya = Array.isArray(a) ? a[1] : (a.year || 0), yb = Array.isArray(b) ? b[1] : (b.year || 0);
          if (yb !== ya) return yb - ya;
          var na = Array.isArray(a) ? a[0] : (a.conference || a), nb = Array.isArray(b) ? b[0] : (b.conference || b);
          return na < nb ? -1 : na > nb ? 1 : 0;
        });
        var arows = '';
        for (var j = 0; j < sorted.length; j++) {
          var entry = sorted[j];
          var conf = Array.isArray(entry) ? entry[0] : (entry.conference || entry);
          var yr = Array.isArray(entry) ? entry[1] : (entry.year || '');
          var role = Array.isArray(entry) ? (entry.length > 2 ? entry[2] : 'member') : (entry.role || 'member');
          var roleLabel = role === 'chair' ? '★ Chair' : 'Member';
          arows += '<tr><td>' + escHtml(conf) + '</td><td>' + escHtml(String(yr)) + '</td><td>' + roleLabel + '</td></tr>';
        }
        document.getElementById('ae-body').innerHTML = arows;
      }
    } else {
      document.getElementById('ae-section').style.display = 'none';
    }

    // Cited artifacts
    var authorData = citedArtifactsMap[p.name];
    if (authorData && authorData.cited_artifacts && authorData.cited_artifacts.length > 0) {
      document.getElementById('citations-section').style.display = 'block';
      var citSummary = '<p><strong>' + authorData.total_citations + '</strong> total citation' +
        (authorData.total_citations > 1 ? 's' : '') + ' to <strong>' + authorData.cited_artifacts.length +
        '</strong> artifact' + (authorData.cited_artifacts.length > 1 ? 's' : '') + '.</p>';
      document.getElementById('citations-summary').innerHTML = citSummary;
      var citRows = '';
      var artifacts = authorData.cited_artifacts.sort(function(a, b) { return (b.citations || 0) - (a.citations || 0); });
      for (var k = 0; k < artifacts.length; k++) {
        var art = artifacts[k];
        citRows += '<tr><td>' + (k+1) + '</td><td>' + escHtml(art.title) + '</td><td>' +
          escHtml(art.conference || '') + '</td><td>' + (art.year || '') + '</td><td><strong>' +
          (art.citations || 0) + '</strong></td></tr>';
      }
      document.getElementById('citations-body').innerHTML = citRows;
    } else {
      document.getElementById('citations-section').style.display = 'none';
    }

    renderChart(p);
    renderHistoryChart(p);
  }

  function renderChart(p) {
    var papers = [];
    if (p.paper_ids && p.paper_ids.length > 0) {
      for (var pi = 0; pi < p.paper_ids.length; pi++) {
        var pp = paperIndex[p.paper_ids[pi]];
        if (pp) papers.push(pp);
      }
    } else {
      papers = p.papers || [];
    }
    var aeYears = p.ae_years || {};
    var yearSet = {};
    papers.forEach(function(pp) { if (pp.year) yearSet[pp.year] = true; });
    Object.keys(aeYears).forEach(function(y) { yearSet[y] = true; });
    var years = Object.keys(yearSet).map(Number).sort();
    if (years.length < 1) {
      document.getElementById('chart-section').style.display = 'none';
      return;
    }
    var minY = years[0], maxY = years[years.length - 1];
    var allYears = [];
    for (var y = minY; y <= maxY; y++) allYears.push(y);
    var paperCounts = {};
    papers.forEach(function(pp) {
      if (pp.year) paperCounts[pp.year] = (paperCounts[pp.year] || 0) + 1;
    });
    var datasets = [];
    datasets.push({
      label: 'Artifact Papers',
      data: allYears.map(function(y) { return paperCounts[y] || 0; }),
      backgroundColor: 'rgba(52, 152, 219, 0.7)',
      borderColor: 'rgba(52, 152, 219, 1)',
      borderWidth: 1
    });
    if (Object.keys(aeYears).length > 0) {
      datasets.push({
        label: 'AE Committee Service',
        data: allYears.map(function(y) { return aeYears[y] || 0; }),
        backgroundColor: 'rgba(46, 204, 113, 0.7)',
        borderColor: 'rgba(46, 204, 113, 1)',
        borderWidth: 1
      });
    }
    document.getElementById('chart-section').style.display = '';
    var ctx = document.getElementById('timelineChart').getContext('2d');
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'bar',
      data: { labels: allYears.map(String), datasets: datasets },
      options: {
        responsive: true,
        plugins: { legend: { display: datasets.length > 1 }, title: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } } }
      }
    });
  }

  function getRankChange(name) {
    if (rankHistory.length < 2) return null;
    var curr = rankHistory[rankHistory.length - 1].entries[name];
    var prev = rankHistory[rankHistory.length - 2].entries[name];
    if (!curr || !prev) return null;
    var diff = prev.rank - curr.rank;
    if (diff > 0) return { html: '<span style="color:#27ae60">▲' + diff + '</span>' };
    if (diff < 0) return { html: '<span style="color:#e74c3c">▼' + (-diff) + '</span>' };
    return { html: '<span style="color:#999">–</span>' };
  }

  function renderHistoryChart(p) {
    if (rankHistory.length < 2) {
      document.getElementById('history-section').style.display = 'none';
      return;
    }
    var labels = [], scores = [], ranks = [], artScores = [], aeScores = [];
    for (var i = 0; i < rankHistory.length; i++) {
      var snap = rankHistory[i];
      var e = snap.entries[p.name];
      if (e) {
        labels.push(snap.date);
        scores.push(e.score);
        ranks.push(e.rank);
        artScores.push(e.as);
        aeScores.push(e.aes);
      }
    }
    if (labels.length < 2) {
      document.getElementById('history-section').style.display = 'none';
      return;
    }
    document.getElementById('history-section').style.display = '';
    var ctx = document.getElementById('historyChart').getContext('2d');
    if (historyChart) historyChart.destroy();
    historyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          { label: 'Combined Score', data: scores, borderColor: '#2c3e50', backgroundColor: 'rgba(44,62,80,0.1)', fill: false, tension: 0.2, yAxisID: 'y' },
          { label: 'Artifact Score', data: artScores, borderColor: '#3498db', backgroundColor: 'rgba(52,152,219,0.1)', fill: false, tension: 0.2, yAxisID: 'y' },
          { label: 'AE Score', data: aeScores, borderColor: '#27ae60', backgroundColor: 'rgba(39,174,96,0.1)', fill: false, tension: 0.2, yAxisID: 'y' },
          { label: 'Rank', data: ranks, borderColor: '#e74c3c', backgroundColor: 'rgba(231,76,60,0.1)', fill: false, tension: 0.2, borderDash: [5,3], yAxisID: 'y1' }
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: true } },
        scales: {
          y: { beginAtZero: true, position: 'left', title: { display: true, text: 'Score' } },
          y1: { reverse: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Rank (#1 = top)' }, ticks: { precision: 0 } }
        }
      }
    });
  }

  function availabilityTag(url) {
    if (!availabilityLoaded || !url) return '';
    var normalUrl = url.replace(/\/+$/, '');
    if (urlAccessible[normalUrl] === false) {
      var tip = 'URL may be unavailable (last checked ' + (availabilityCheckedAt || 'recently') + ')';
      return ' <span class="avail-warn">\u26a0 may be unavailable<span class="avail-tip">' + escHtml(tip) + '</span></span>';
    }
    return '';
  }

  // ── Search setup (uses shared ReproDBProfile.initSearch) ──────────────
  var search = ReproDBProfile.initSearch({
    searchBoxId: 'author-search-box',
    resultsListId: 'search-results',
    shareBtnId: 'share-btn',
    loadingId: 'loading-msg',
    maxResults: 30,
    filterItems: function(q) {
      return allProfiles.filter(function(p) {
        return p.name.toLowerCase().indexOf(q) >= 0 ||
               (p.affiliation && p.affiliation.toLowerCase().indexOf(q) >= 0);
      }).slice(0, 100);
    },
    renderResult: function(item) {
      return {
        key: item.name,
        html: '<strong>' + escHtml(cleanName(item.name)) + '</strong>' +
              (item.affiliation ? '<br><span class="sr-detail">' + escHtml(item.affiliation) + '</span>' : '')
      };
    },
    onSelect: function(key) {
      var p = profileMap[key];
      if (!p) return null;
      renderProfile(p);
      var params = {};
      if (p.author_id != null) params.id = p.author_id;
      return { displayValue: cleanName(key), urlParams: params };
    },
    resolveFromUrl: function(params) {
      var idParam = params.get('id');
      var nameParam = params.get('name');
      if (nameParam) nameParam = nameParam.replace(/[\t\n\r]+/g, ' ').replace(/  +/g, ' ').trim();

      var resolved = null;
      if (idParam && idMap[parseInt(idParam)]) {
        resolved = idMap[parseInt(idParam)];
      } else if (nameParam && profileMap[nameParam]) {
        resolved = profileMap[nameParam];
      } else if (nameParam) {
        var lower = nameParam.toLowerCase();
        resolved = allProfiles.find(function(p) { return p.name.toLowerCase() === lower || cleanName(p.name).toLowerCase() === lower; });
      }

      if (resolved) return { key: resolved.name, displayValue: cleanName(resolved.name) };
      if (nameParam) return { search: nameParam };
      return null;
    }
  });

  // ── Load data & init ──────────────────────────────────────────────────
  Promise.all([
    fetch(DATA_URL).then(function(r) { return r.json(); }),
    fetch(CITED_ARTIFACTS_URL).then(function(r) { return r.json(); }).catch(function() { return {}; }),
    fetch(HISTORY_URL).then(function(r) { return r.json(); }).catch(function() { return []; }),
    fetch(ARTIFACTS_URL).then(function(r) { return r.json(); }).catch(function() { return []; }),
    fetch(PAPERS_URL).then(function(r) { return r.json(); }).catch(function() { return []; }),
    fetch(AVAILABILITY_URL).then(function(r) { return r.json(); }).catch(function() { return {records:[]}; })
  ]).then(function(results) {
      var data = results[0];
      citedArtifactsMap = results[1] || {};
      rankHistory = results[2] || [];

      var artList = results[3] || [];
      artifactUrlMap = {};
      for (var ai = 0; ai < artList.length; ai++) {
        var artItem = artList[ai];
        var artUrls = artItem.artifact_urls || [];
        var artUrl = artUrls.length > 0 ? artUrls[0] : (artItem.artifact_url || artItem.repository_url || '');
        if (artItem.title && artUrl) {
          artifactUrlMap[artItem.title.replace(/\.+$/, '')] = artUrl;
        }
      }

      var papersList = results[4] || [];
      paperIndex = {};
      for (var pi = 0; pi < papersList.length; pi++) {
        paperIndex[papersList[pi].id] = papersList[pi];
      }

      var avail = results[5] || {};
      availabilityCheckedAt = (avail.summary && avail.summary.checked_at) ? avail.summary.checked_at.replace(/ UTC$/, '') : '';
      (avail.records || []).forEach(function(rec) {
        var u = (rec.url || '').replace(/\/+$/, '');
        if (u) {
          if (rec.accessible === false) urlAccessible[u] = false;
          else if (urlAccessible[u] === undefined) urlAccessible[u] = true;
        }
      });
      availabilityLoaded = true;

      allProfiles = data;
      profileMap = {};
      idMap = {};
      for (var i = 0; i < data.length; i++) {
        profileMap[data[i].name] = data[i];
        if (data[i].author_id != null) { idMap[data[i].author_id] = data[i]; }
      }
    })
    .then(function() {
      search.activate();
    })
    .catch(function(err) {
      document.getElementById('loading-msg').textContent = 'Error loading author data.';
      console.error(err);
    });
})();
</script>
