---
title: "Institution Profile"
permalink: /institution.html
layout: default
---

<style>
#inst-search-box { padding:8px 14px; font-size:1em; width:100%; max-width:480px; border:1px solid #ccc; border-radius:4px; }
#inst-search-results { list-style:none; padding:0; margin:4px 0 0 0; max-height:260px; overflow-y:auto; border:1px solid #ddd; border-radius:4px; display:none; position:absolute; background:#fff; z-index:100; width:100%; max-width:480px; }
#inst-search-results li { padding:8px 14px; cursor:pointer; border-bottom:1px solid #f0f0f0; }
#inst-search-results li:hover, #inst-search-results li.active { background:#e8f4f8; }
#inst-profile { display:none; margin-top:20px; }
.profile-header { margin-bottom:18px; }
.profile-header h2 { margin-bottom:2px; }
.score-cards { display:flex; flex-wrap:wrap; gap:12px; margin:16px 0; }
.score-card { background:#f7f7f7; border:1px solid #e0e0e0; border-radius:6px; padding:12px 18px; min-width:110px; text-align:center; }
.score-card .val { font-size:1.6em; font-weight:bold; color:#2c3e50; }
.score-card .lbl { font-size:0.78em; color:#777; margin-top:2px; }
.inst-table { font-size:0.88em; border-collapse:collapse; width:100%; margin:10px 0; }
.inst-table th, .inst-table td { padding:6px 10px; border:1px solid #ddd; text-align:left; }
.inst-table th { background:#f2f2f2; white-space:nowrap; cursor:pointer; }
.inst-table tr:nth-child(even) { background:#fafafa; }
.inst-table tr:hover { background:#e8f4f8; }
.badge-tag { display:inline-block; padding:2px 8px; border-radius:3px; font-size:0.8em; margin:1px 2px; color:#fff; }
.badge-available { background:#3498db; }
.badge-functional { background:#27ae60; }
.badge-reproducible, .badge-reproduced, .badge-reusable { background:#8e44ad; }
.chart-container { max-width:1050px; margin:16px 0; }
#inst-loading { color:#888; font-style:italic; }
.pag-controls { margin:8px 0; font-size:0.9em; }
.pag-controls button { padding:2px 8px; font-size:0.9em; }
.pag-controls span { margin:0 8px; }
.role-tag { display:inline-block; padding:1px 7px; border-radius:3px; font-size:0.78em; color:#fff; margin-left:6px; }
.role-balanced { background:#8e44ad; }
.role-artifact { background:#2980b9; }
.role-evaluation { background:#27ae60; }
</style>

<div style="position:relative;">
  <input type="text" id="inst-search-box" placeholder="Search for an institution..." autocomplete="off">
  <ul id="inst-search-results"></ul>
</div>

<div id="inst-loading">Loading institution data…</div>

<div id="inst-profile">
  <div class="profile-header">
    <h2 id="inst-name"></h2>
  </div>

  <div class="score-cards" id="inst-score-cards"></div>

  <div id="inst-history-section" style="display:none;">
    <h3>Ranking History</h3>
    <div class="chart-container"><canvas id="instHistoryChart" height="290"></canvas></div>
  </div>

  <div id="inst-contributors-section" style="display:none;">
    <h3>Top Contributors</h3>
    <table class="inst-table" id="contributors-table">
      <thead><tr>
        <th data-col="rank">#</th>
        <th data-col="name">Researcher</th>
        <th data-col="combined_score">Score</th>
        <th data-col="artifact_score">Artifact</th>
        <th data-col="ae_score">AE</th>
        <th data-col="artifacts">Artifacts</th>
        <th data-col="total_papers">Papers</th>
        <th data-col="ae_memberships">AE Svc</th>
        <th data-col="chair_count">Chair</th>
      </tr></thead>
      <tbody id="contributors-body"></tbody>
    </table>
    <div class="pag-controls">
      <button id="contrib-prev">&laquo; Prev</button>
      <span id="contrib-info"></span>
      <button id="contrib-next">Next &raquo;</button>
    </div>
  </div>

  <div id="inst-artifacts-section" style="display:none;">
    <h3>Artifact Papers</h3>
    <table class="inst-table" id="artifacts-table">
      <thead><tr>
        <th>#</th>
        <th>Title</th>
        <th>Authors</th>
        <th>Conference</th>
        <th>Year</th>
        <th>Badges</th>
      </tr></thead>
      <tbody id="artifacts-body"></tbody>
    </table>
    <div class="pag-controls">
      <button id="art-prev">&laquo; Prev</button>
      <span id="art-info"></span>
      <button id="art-next">Next &raquo;</button>
    </div>
  </div>

  <div id="inst-ae-section" style="display:none;">
    <h3>AE Committee Involvement</h3>
    <div id="ae-summary-text"></div>
    <table class="inst-table" id="ae-detail-table">
      <thead><tr>
        <th>Researcher</th>
        <th>Conference</th>
        <th>Year</th>
        <th>Role</th>
      </tr></thead>
      <tbody id="ae-detail-body"></tbody>
    </table>
    <div class="pag-controls">
      <button id="ae-prev">&laquo; Prev</button>
      <span id="ae-info"></span>
      <button id="ae-next">Next &raquo;</button>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<script>
(function() {
  var INST_URL = '{{ "/assets/data/institution_rankings.json" | relative_url }}';
  var PROFILES_URL = '{{ "/assets/data/author_profiles.json" | relative_url }}';
  var HISTORY_URL = '{{ "/assets/data/institution_ranking_history.json" | relative_url }}';
  var ARTIFACTS_URL = '{{ "/assets/data/artifacts.json" | relative_url }}';
  var baseUrl = '{{ "" | relative_url }}';

  var allInstitutions = [];
  var instMap = {};
  var allProfiles = [];
  var instHistory = [];
  var artifactUrlMap = {};  // title -> artifact_url
  var historyChart = null;

  // Pagination state
  var contribPage = 0, contribPageSize = 10, contribData = [];
  var artPage = 0, artPageSize = 15, artData = [];
  var aePage = 0, aePageSize = 20, aeData = [];

  // Contributor sort state
  var contribSortCol = 'combined_score', contribSortAsc = false;

  function escHtml(s) {
    if (!s) return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function cleanName(n) { return (n||'').replace(/\s+\d{4}$/, '').replace(/\t/g, ' '); }

  function badgeHtml(badges) {
    if (!badges) return '';
    var list = Array.isArray(badges) ? badges : badges.split(',');
    return list.map(function(b) {
      var bl = b.trim().toLowerCase();
      var cls = 'badge-available', label = b.trim().replace(/^Badges:\s*/i, '');
      if (bl.indexOf('functional') >= 0) cls = 'badge-functional';
      else if (bl.indexOf('reproduc') >= 0 || bl.indexOf('reusable') >= 0) cls = 'badge-reproducible';
      return '<span class="badge-tag ' + cls + '">' + escHtml(label) + '</span>';
    }).join(' ');
  }

  function card(value, label) {
    return '<div class="score-card"><div class="val">' + value + '</div><div class="lbl">' + label + '</div></div>';
  }

  function paginate(data, page, pageSize, bodyId, infoId, renderFn) {
    var start = page * pageSize;
    var end = Math.min(start + pageSize, data.length);
    var slice = data.slice(start, end);
    document.getElementById(bodyId).innerHTML = renderFn(slice, start);
    var pages = Math.ceil(data.length / pageSize);
    document.getElementById(infoId).textContent = (start+1) + '–' + end + ' of ' + data.length;
  }

  // ── Contributors ──────────────────────────────────────────────────────
  function sortContributors() {
    var key = contribSortCol;
    contribData.sort(function(a, b) {
      var av, bv;
      if (key === 'name') { av = (a.name||'').toLowerCase(); bv = (b.name||'').toLowerCase(); }
      else { av = a[key] || 0; bv = b[key] || 0; }
      if (av < bv) return contribSortAsc ? -1 : 1;
      if (av > bv) return contribSortAsc ? 1 : -1;
      return 0;
    });
  }

  function renderContributors(slice, startIdx) {
    return slice.map(function(p, i) {
      var dn = cleanName(p.name);
      var url = baseUrl + '/author.html?name=' + encodeURIComponent(p.name) + (p.author_id != null ? '&id=' + p.author_id : '');
      return '<tr>' +
        '<td>' + (startIdx + i + 1) + '</td>' +
        '<td><a href="' + url + '">' + escHtml(dn) + '</a></td>' +
        '<td><strong>' + (p.combined_score || 0) + '</strong></td>' +
        '<td>' + (p.artifact_score || 0) + '</td>' +
        '<td>' + (p.ae_score || 0) + '</td>' +
        '<td>' + (p.artifact_count || 0) + '</td>' +
        '<td>' + (p.total_papers || 0) + '</td>' +
        '<td>' + (p.ae_memberships || 0) + '</td>' +
        '<td>' + (p.chair_count ? p.chair_count + ' ★' : '') + '</td>' +
        '</tr>';
    }).join('');
  }

  function refreshContributors() {
    sortContributors();
    paginate(contribData, contribPage, contribPageSize, 'contributors-body', 'contrib-info', renderContributors);
  }

  // ── Artifacts ─────────────────────────────────────────────────────────
  function renderArtifacts(slice, startIdx) {
    return slice.map(function(a, i) {
      var titleHtml;
      if (a.url) {
        titleHtml = '<a href="' + escHtml(a.url) + '" target="_blank" rel="noopener">' + escHtml(a.title) + '</a>';
      } else {
        titleHtml = escHtml(a.title);
      }
      var authorsHtml = a.authors.map(function(name) {
        return '<a href="' + baseUrl + '/author.html?name=' + encodeURIComponent(name) + '">' + escHtml(cleanName(name)) + '</a>';
      }).join(', ');
      return '<tr>' +
        '<td>' + (startIdx + i + 1) + '</td>' +
        '<td>' + titleHtml + '</td>' +
        '<td>' + authorsHtml + '</td>' +
        '<td>' + escHtml(a.conference || '') + '</td>' +
        '<td>' + (a.year || '') + '</td>' +
        '<td>' + badgeHtml(a.badges) + '</td>' +
        '</tr>';
    }).join('');
  }

  function refreshArtifacts() {
    paginate(artData, artPage, artPageSize, 'artifacts-body', 'art-info', renderArtifacts);
  }

  // ── AE Detail ─────────────────────────────────────────────────────────
  function renderAE(slice, startIdx) {
    return slice.map(function(a) {
      var roleLabel = a.role === 'chair' ? '★ Chair' : 'Member';
      return '<tr>' +
        '<td><a href="' + baseUrl + '/author.html?name=' + encodeURIComponent(a.authorName) + '">' + escHtml(cleanName(a.authorName)) + '</a></td>' +
        '<td>' + escHtml(a.conference) + '</td>' +
        '<td>' + a.year + '</td>' +
        '<td>' + roleLabel + '</td>' +
        '</tr>';
    }).join('');
  }

  function refreshAE() {
    paginate(aeData, aePage, aePageSize, 'ae-detail-body', 'ae-info', renderAE);
  }

  // ── History Chart ─────────────────────────────────────────────────────
  function renderHistoryChart(instName) {
    if (instHistory.length < 2) {
      document.getElementById('inst-history-section').style.display = 'none';
      return;
    }
    var labels = [], scores = [], artScores = [], aeScores = [], ranks = [];
    for (var i = 0; i < instHistory.length; i++) {
      var snap = instHistory[i];
      var e = snap.entries[instName];
      if (e) {
        labels.push(snap.date);
        scores.push(e.score);
        artScores.push(e.as);
        aeScores.push(e.aes);
        ranks.push(e.rank);
      }
    }
    if (labels.length < 2) {
      document.getElementById('inst-history-section').style.display = 'none';
      return;
    }
    document.getElementById('inst-history-section').style.display = '';
    var ctx = document.getElementById('instHistoryChart').getContext('2d');
    if (historyChart) historyChart.destroy();
    historyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          { label: 'Combined Score', data: scores, borderColor: '#2c3e50', fill: false, tension: 0.2, yAxisID: 'y' },
          { label: 'Artifact Score', data: artScores, borderColor: '#3498db', fill: false, tension: 0.2, yAxisID: 'y' },
          { label: 'AE Score', data: aeScores, borderColor: '#27ae60', fill: false, tension: 0.2, yAxisID: 'y' },
          { label: 'Rank', data: ranks, borderColor: '#e74c3c', fill: false, tension: 0.2, borderDash: [5,3], yAxisID: 'y1' }
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

  // ── Main render ───────────────────────────────────────────────────────
  function renderProfile(inst) {
    document.getElementById('inst-profile').style.display = 'block';
    document.getElementById('inst-name').textContent = inst.affiliation;

    // Role tag
    var roleTag = '';
    if (inst.role === 'Balanced') roleTag = '<span class="role-tag role-balanced">Balanced</span>';
    else if (inst.role === 'Artifact-focused') roleTag = '<span class="role-tag role-artifact">Artifact-focused</span>';
    else if (inst.role === 'Evaluation-focused') roleTag = '<span class="role-tag role-evaluation">Evaluation-focused</span>';
    document.getElementById('inst-name').innerHTML = escHtml(inst.affiliation) + roleTag;

    // Score cards
    var cards = '';
    cards += card(inst.combined_score || 0, 'Combined Score');
    cards += card(inst.artifact_score || 0, 'Artifact Score');
    cards += card(inst.ae_score || 0, 'AE Score');
    var aeRatio = (inst.ae_ratio === null || inst.ae_ratio === undefined) ? '∞' : inst.ae_ratio;
    cards += card(aeRatio, 'A:E Ratio');
    // Researchers card will be populated after counting profiles
    cards += card(inst.artifact_count || 0, 'Artifacts');
    cards += card(inst.total_papers || 0, 'Total Papers');
    cards += card((inst.artifact_pct || 0) + '%', 'Artifact Rate');
    var reproRate = 0;
    if (inst.artifact_count > 0) reproRate = Math.round(((inst.badges_reproducible || 0) / inst.artifact_count) * 100);
    cards += card(reproRate + '%', 'Repro Rate');
    cards += card(inst.ae_memberships || 0, 'AE Memberships');
    if (inst.chair_count) cards += card(inst.chair_count, 'Chair Roles');

    // Rank change from history
    if (instHistory.length >= 2) {
      var curr = instHistory[instHistory.length - 1].entries[inst.affiliation];
      var prev = instHistory[instHistory.length - 2].entries[inst.affiliation];
      if (curr) cards += card('#' + curr.rank, 'Rank');
      if (curr && prev) {
        var diff = prev.rank - curr.rank;
        var changeHtml;
        if (diff > 0) changeHtml = '<span style="color:#27ae60">▲' + diff + '</span>';
        else if (diff < 0) changeHtml = '<span style="color:#e74c3c">▼' + (-diff) + '</span>';
        else changeHtml = '<span style="color:#999">–</span>';
        cards += card(changeHtml, 'Rank Change');
      }
    }

    // History chart
    renderHistoryChart(inst.affiliation);

    // ── Gather affiliated author profiles ───────────────────────────────
    var affProfiles = allProfiles.filter(function(p) {
      return p.affiliation === inst.affiliation;
    });

    // Insert researchers count card (position 5, after A:E Ratio)
    var researchersCard = card(affProfiles.length, 'Researchers');
    // Find position after A:E Ratio card
    var insertPos = cards.indexOf('A:E Ratio</div></div>') + 'A:E Ratio</div></div>'.length;
    cards = cards.slice(0, insertPos) + researchersCard + cards.slice(insertPos);
    document.getElementById('inst-score-cards').innerHTML = cards;

    // Contributors
    contribData = affProfiles.slice().map(function(p) {
      return {
        name: p.name,
        combined_score: p.combined_score || 0,
        artifact_score: p.artifact_score || 0,
        ae_score: p.ae_score || 0,
        artifacts: p.artifact_count || 0,
        total_papers: p.total_papers || 0,
        ae_memberships: p.ae_memberships || 0,
        chair_count: p.chair_count || 0
      };
    });
    contribPage = 0;
    contribSortCol = 'combined_score';
    contribSortAsc = false;
    if (contribData.length > 0) {
      document.getElementById('inst-contributors-section').style.display = '';
      refreshContributors();
    } else {
      document.getElementById('inst-contributors-section').style.display = 'none';
    }

    // Artifacts — collect all papers, deduplicate by title, combine authors
    var paperMap = {};
    affProfiles.forEach(function(p) {
      (p.papers || []).forEach(function(paper) {
        var key = paper.title;
        if (!paperMap[key]) {
          var normTitle = paper.title.replace(/\.+$/, '');
          paperMap[key] = {
            title: paper.title,
            authors: [],
            conference: paper.conference,
            year: paper.year,
            badges: paper.badges,
            url: artifactUrlMap[normTitle] || ''
          };
        }
        paperMap[key].authors.push(p.name);
      });
    });
    artData = Object.keys(paperMap).map(function(k) { return paperMap[k]; });
    artData.sort(function(a, b) { return (b.year || 0) - (a.year || 0); });
    artPage = 0;
    if (artData.length > 0) {
      document.getElementById('inst-artifacts-section').style.display = '';
      refreshArtifacts();
    } else {
      document.getElementById('inst-artifacts-section').style.display = 'none';
    }

    // AE involvement — collect all AE conference entries from affiliated authors
    aeData = [];
    var totalAEMemberships = 0, totalChairs = 0;
    var aeConferences = {};
    affProfiles.forEach(function(p) {
      if (p.ae_conferences && p.ae_conferences.length > 0) {
        p.ae_conferences.forEach(function(entry) {
          var conf = Array.isArray(entry) ? entry[0] : entry;
          var yr = Array.isArray(entry) ? entry[1] : '';
          var role = (Array.isArray(entry) && entry.length > 2) ? entry[2] : 'member';
          aeConferences[conf] = true;
          aeData.push({
            authorName: p.name,
            conference: conf,
            year: yr,
            role: role
          });
        });
      }
      totalAEMemberships += (p.ae_memberships || 0);
      totalChairs += (p.chair_count || 0);
    });
    // Sort by year desc, then conference
    aeData.sort(function(a, b) {
      if (b.year !== a.year) return (b.year || 0) - (a.year || 0);
      return (a.conference || '').localeCompare(b.conference || '');
    });
    aePage = 0;
    if (aeData.length > 0) {
      document.getElementById('inst-ae-section').style.display = '';
      var confList = Object.keys(aeConferences).sort();
      var summaryHtml = '<p><strong>' + totalAEMemberships + '</strong> total AE memberships across <strong>' + affProfiles.filter(function(p){ return p.ae_memberships > 0; }).length + '</strong> researchers';
      if (totalChairs > 0) summaryHtml += ', <strong>' + totalChairs + '</strong> chair roles';
      summaryHtml += '.</p>';
      summaryHtml += '<p>Conferences: ' + confList.map(function(c){ return '<strong>' + escHtml(c) + '</strong>'; }).join(', ') + '</p>';
      document.getElementById('ae-summary-text').innerHTML = summaryHtml;
      refreshAE();
    } else {
      document.getElementById('inst-ae-section').style.display = 'none';
    }
  }

  // ── Search / autocomplete ─────────────────────────────────────────────
  var searchBox = document.getElementById('inst-search-box');
  var resultsList = document.getElementById('inst-search-results');
  var activeIdx = -1;

  function showResults(matches) {
    resultsList.innerHTML = '';
    if (matches.length === 0) { resultsList.style.display = 'none'; return; }
    activeIdx = -1;
    var shown = matches.slice(0, 20);
    for (var i = 0; i < shown.length; i++) {
      var li = document.createElement('li');
      li.dataset.name = shown[i].affiliation;
      li.innerHTML = '<strong>' + escHtml(shown[i].affiliation) + '</strong>' +
        ' <span style="color:#888;font-size:0.85em">(' + (shown[i].author_count||0) + ' researchers, score ' + (shown[i].combined_score||0) + ')</span>';
      li.addEventListener('click', function() { selectInst(this.dataset.name); });
      resultsList.appendChild(li);
    }
    if (matches.length > 20) {
      var more = document.createElement('li');
      more.style.color = '#999';
      more.textContent = '… and ' + (matches.length - 20) + ' more';
      resultsList.appendChild(more);
    }
    resultsList.style.display = 'block';
  }

  function selectInst(name) {
    resultsList.style.display = 'none';
    searchBox.value = name;
    var inst = instMap[name];
    if (inst) {
      renderProfile(inst);
      var url = new URL(window.location);
      url.searchParams.set('name', name);
      history.replaceState(null, '', url);
    }
  }

  searchBox.addEventListener('input', function() {
    var q = this.value.trim().toLowerCase();
    if (q.length < 2) { resultsList.style.display = 'none'; return; }
    var matches = allInstitutions.filter(function(inst) {
      return (inst.affiliation || '').toLowerCase().indexOf(q) !== -1;
    }).slice(0, 50);
    showResults(matches);
  });

  searchBox.addEventListener('keydown', function(e) {
    var items = resultsList.querySelectorAll('li[data-name]');
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(activeIdx + 1, items.length - 1); items.forEach(function(li, i) { li.classList.toggle('active', i === activeIdx); }); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(activeIdx - 1, 0); items.forEach(function(li, i) { li.classList.toggle('active', i === activeIdx); }); }
    else if (e.key === 'Enter') { e.preventDefault(); if (activeIdx >= 0 && items[activeIdx]) selectInst(items[activeIdx].dataset.name); }
    else if (e.key === 'Escape') { resultsList.style.display = 'none'; }
  });

  document.addEventListener('click', function(e) {
    if (!searchBox.contains(e.target) && !resultsList.contains(e.target)) resultsList.style.display = 'none';
  });

  // ── Pagination controls ───────────────────────────────────────────────
  document.getElementById('contrib-prev').addEventListener('click', function() { if (contribPage > 0) { contribPage--; refreshContributors(); } });
  document.getElementById('contrib-next').addEventListener('click', function() { if ((contribPage+1)*contribPageSize < contribData.length) { contribPage++; refreshContributors(); } });
  document.getElementById('art-prev').addEventListener('click', function() { if (artPage > 0) { artPage--; refreshArtifacts(); } });
  document.getElementById('art-next').addEventListener('click', function() { if ((artPage+1)*artPageSize < artData.length) { artPage++; refreshArtifacts(); } });
  document.getElementById('ae-prev').addEventListener('click', function() { if (aePage > 0) { aePage--; refreshAE(); } });
  document.getElementById('ae-next').addEventListener('click', function() { if ((aePage+1)*aePageSize < aeData.length) { aePage++; refreshAE(); } });

  // ── Contributor table sorting ─────────────────────────────────────────
  document.querySelectorAll('#contributors-table th[data-col]').forEach(function(th) {
    th.addEventListener('click', function() {
      var col = th.dataset.col;
      if (contribSortCol === col) contribSortAsc = !contribSortAsc;
      else { contribSortCol = col; contribSortAsc = false; }
      contribPage = 0;
      refreshContributors();
    });
  });

  // ── Load data ─────────────────────────────────────────────────────────
  Promise.all([
    fetch(INST_URL).then(function(r) { return r.json(); }),
    fetch(PROFILES_URL).then(function(r) { return r.json(); }),
    fetch(HISTORY_URL).then(function(r) { return r.json(); }).catch(function() { return []; }),
    fetch(ARTIFACTS_URL).then(function(r) { return r.json(); }).catch(function() { return []; })
  ]).then(function(results) {
    allInstitutions = results[0].filter(function(inst) {
      var a = (inst.affiliation || '').toLowerCase();
      return a && a !== 'unknown' && !a.startsWith('_');
    });
    instMap = {};
    allInstitutions.forEach(function(inst) { instMap[inst.affiliation] = inst; });

    allProfiles = results[1];
    instHistory = results[2] || [];

    // Build title -> artifact URL map (normalize by stripping trailing period)
    var artifacts = results[3] || [];
    artifactUrlMap = {};
    for (var i = 0; i < artifacts.length; i++) {
      var art = artifacts[i];
      var artUrls = art.artifact_urls || [];
      var url = artUrls.length > 0 ? artUrls[0] : (art.artifact_url || art.repository_url || '');
      if (art.title && url) {
        artifactUrlMap[art.title.replace(/\.+$/, '')] = url;
      }
    }

    document.getElementById('inst-loading').style.display = 'none';
    searchBox.style.display = '';

    // Check for ?name= parameter
    var params = new URLSearchParams(window.location.search);
    var nameParam = params.get('name');
    if (nameParam && instMap[nameParam]) {
      searchBox.value = nameParam;
      renderProfile(instMap[nameParam]);
    } else if (nameParam) {
      var lower = nameParam.toLowerCase();
      var match = allInstitutions.find(function(inst) { return inst.affiliation.toLowerCase() === lower; });
      if (match) { searchBox.value = match.affiliation; renderProfile(match); }
      else { searchBox.value = nameParam; searchBox.dispatchEvent(new Event('input')); }
    }
  }).catch(function(err) {
    document.getElementById('inst-loading').textContent = 'Error loading institution data.';
    console.error(err);
  });
})();
</script>
