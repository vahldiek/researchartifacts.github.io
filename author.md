---
title: "Author Profile"
permalink: /author.html
layout: default
---

<style>
#author-search-box { padding:8px 14px; font-size:1em; width:100%; max-width:480px; border:1px solid #ccc; border-radius:4px; }
#search-results { list-style:none; padding:0; margin:4px 0 0 0; max-height:260px; overflow-y:auto; border:1px solid #ddd; border-radius:4px; display:none; position:absolute; background:#fff; z-index:100; width:100%; max-width:480px; }
#search-results li { padding:8px 14px; cursor:pointer; border-bottom:1px solid #f0f0f0; }
#search-results li:hover, #search-results li.active { background:#e8f4f8; }
#search-results li .sr-affil { font-size:0.82em; color:#666; }
#profile-container { display:none; margin-top:20px; }
.profile-header { margin-bottom:18px; }
.profile-header h2 { margin-bottom:2px; }
.profile-header .affil { color:#555; font-size:0.95em; }
.score-cards { display:flex; flex-wrap:wrap; gap:12px; margin:16px 0; }
.score-card { background:#f7f7f7; border:1px solid #e0e0e0; border-radius:6px; padding:12px 18px; min-width:110px; text-align:center; }
.score-card .val { font-size:1.6em; font-weight:bold; color:#2c3e50; }
.score-card .lbl { font-size:0.78em; color:#777; margin-top:2px; }
.badge-tag { display:inline-block; padding:2px 8px; border-radius:3px; font-size:0.8em; margin:1px 2px; color:#fff; }
.badge-available { background:#3498db; }
.badge-functional { background:#27ae60; }
.badge-reproducible, .badge-reproduced, .badge-reusable { background:#8e44ad; }
.paper-table { font-size:0.88em; border-collapse:collapse; width:100%; margin:10px 0; }
.paper-table th, .paper-table td { padding:6px 10px; border:1px solid #ddd; text-align:left; }
.paper-table th { background:#f2f2f2; white-space:nowrap; }
.paper-table tr:nth-child(even) { background:#fafafa; }
.ae-table { font-size:0.88em; border-collapse:collapse; width:100%; margin:10px 0; }
.ae-table th, .ae-table td { padding:6px 10px; border:1px solid #ddd; text-align:left; }
.ae-table th { background:#f2f2f2; }
.ae-table tr:nth-child(even) { background:#fafafa; }
.chart-container { max-width:700px; margin:16px 0; }
#loading-msg { color:#888; font-style:italic; }
.category-tag { display:inline-block; padding:1px 7px; border-radius:3px; font-size:0.78em; color:#fff; margin-left:6px; }
.cat-systems { background:#2980b9; }
.cat-security { background:#c0392b; }
.cat-both { background:#8e44ad; }
</style>

<div style="position:relative;">
  <input type="text" id="author-search-box" placeholder="Search for an author..." autocomplete="off">
  <ul id="search-results"></ul>
</div>

<div id="loading-msg">Loading author data…</div>

<div id="profile-container">
  <div class="profile-header">
    <h2 id="prof-name"></h2>
    <div class="affil" id="prof-affil"></div>
  </div>

  <div class="score-cards" id="score-cards"></div>

  <div id="chart-section" style="display:none;">
    <h3>Contributions Over Time</h3>
    <div class="chart-container"><canvas id="timelineChart" height="220"></canvas></div>
  </div>

  <div id="papers-section" style="display:none;">
    <h3>Artifact Papers</h3>
    <table class="paper-table">
      <thead><tr><th>#</th><th>Title</th><th>Conference</th><th>Year</th><th>Badges</th></tr></thead>
      <tbody id="papers-body"></tbody>
    </table>
  </div>

  <div id="ae-section" style="display:none;">
    <h3>AE Committee Service</h3>
    <div id="ae-summary"></div>
    <table class="ae-table" id="ae-table" style="display:none;">
      <thead><tr><th>Year</th><th>Count</th></tr></thead>
      <tbody id="ae-body"></tbody>
    </table>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<script>
(function() {
  var DATA_URL = '{{ "/assets/data/author_profiles.json" | relative_url }}';
  var allProfiles = [];
  var profileMap = {};
  var chart = null;

  function escHtml(s) {
    if (!s) return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function cleanName(n) {
    return n.replace(/\s+\d{4}$/, '').replace(/\t/g, ' ');
  }

  function badgeHtml(badges) {
    if (!badges) return '';
    var list = Array.isArray(badges) ? badges : badges.split(',');
    return list.map(function(b) {
      var bl = b.trim().toLowerCase();
      var cls = 'badge-available';
      var label = b.trim();
      if (bl.indexOf('functional') >= 0) cls = 'badge-functional';
      else if (bl.indexOf('reproduc') >= 0 || bl.indexOf('reusable') >= 0) cls = 'badge-reproducible';
      // Clean up "Badges: " prefix
      label = label.replace(/^Badges:\s*/i, '');
      return '<span class="badge-tag ' + cls + '">' + escHtml(label) + '</span>';
    }).join(' ');
  }

  function renderProfile(p) {
    document.getElementById('profile-container').style.display = 'block';
    document.getElementById('prof-name').textContent = cleanName(p.name);
    
    var catTag = '';
    if (p.category === 'both') catTag = '<span class="category-tag cat-both">Systems & Security</span>';
    else if (p.category === 'systems') catTag = '<span class="category-tag cat-systems">Systems</span>';
    else if (p.category === 'security') catTag = '<span class="category-tag cat-security">Security</span>';
    document.getElementById('prof-name').innerHTML = escHtml(cleanName(p.name)) + catTag;
    
    document.getElementById('prof-affil').textContent = p.affiliation || '';

    // Score cards
    var cards = '';
    if (p.combined_score !== undefined) {
      cards += card(p.combined_score, 'Combined Score');
      cards += card(p.artifact_score || 0, 'Artifact Score');
      cards += card(p.ae_score || 0, 'AE Score');
      if (p.rank) cards += card('#' + p.rank, 'Rank');
    }
    cards += card(p.artifact_count, 'Artifacts');
    cards += card(p.total_papers, 'Total Papers');
    cards += card(p.artifact_rate + '%', 'Artifact Rate');
    if (p.ae_memberships) cards += card(p.ae_memberships, 'AE Memberships');
    if (p.chair_count) cards += card(p.chair_count, 'Chair Roles');
    document.getElementById('score-cards').innerHTML = cards;

    // Papers table
    var papers = p.papers || [];
    if (papers.length > 0) {
      document.getElementById('papers-section').style.display = 'block';
      var rows = '';
      // Sort by year desc
      papers.sort(function(a,b) { return (b.year||0) - (a.year||0); });
      for (var i = 0; i < papers.length; i++) {
        var pp = papers[i];
        rows += '<tr><td>' + (i+1) + '</td><td>' + escHtml(pp.title) + '</td><td>' +
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
        summary += '<p>Conferences: ' + p.ae_conferences.map(function(c){ return '<strong>'+escHtml(c)+'</strong>';}).join(', ') +'</p>';
      }
      document.getElementById('ae-summary').innerHTML = summary;

      var yearKeys = Object.keys(aeYears).sort();
      if (yearKeys.length) {
        document.getElementById('ae-table').style.display = '';
        var arows = '';
        for (var j = 0; j < yearKeys.length; j++) {
          arows += '<tr><td>' + yearKeys[j] + '</td><td>' + aeYears[yearKeys[j]] + '</td></tr>';
        }
        document.getElementById('ae-body').innerHTML = arows;
      }
    } else {
      document.getElementById('ae-section').style.display = 'none';
    }

    // Timeline chart
    renderChart(p);
  }

  function renderChart(p) {
    var papers = p.papers || [];
    var aeYears = p.ae_years || {};
    
    // Collect all years
    var yearSet = {};
    papers.forEach(function(pp) { if (pp.year) yearSet[pp.year] = true; });
    Object.keys(aeYears).forEach(function(y) { yearSet[y] = true; });
    
    var years = Object.keys(yearSet).map(Number).sort();
    if (years.length < 1) {
      document.getElementById('chart-section').style.display = 'none';
      return;
    }
    // Fill gaps
    var minY = years[0], maxY = years[years.length - 1];
    var allYears = [];
    for (var y = minY; y <= maxY; y++) allYears.push(y);
    
    // Count papers per year
    var paperCounts = {};
    papers.forEach(function(pp) {
      if (pp.year) paperCounts[pp.year] = (paperCounts[pp.year] || 0) + 1;
    });
    
    var datasets = [];
    var artifactData = allYears.map(function(y) { return paperCounts[y] || 0; });
    datasets.push({
      label: 'Artifact Papers',
      data: artifactData,
      backgroundColor: 'rgba(52, 152, 219, 0.7)',
      borderColor: 'rgba(52, 152, 219, 1)',
      borderWidth: 1
    });
    
    if (Object.keys(aeYears).length > 0) {
      var aeData = allYears.map(function(y) { return aeYears[y] || 0; });
      datasets.push({
        label: 'AE Committee Service',
        data: aeData,
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
        plugins: {
          legend: { display: datasets.length > 1 },
          title: { display: false }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }
        }
      }
    });
  }

  function card(value, label) {
    return '<div class="score-card"><div class="val">' + value + '</div><div class="lbl">' + label + '</div></div>';
  }

  // --- Search / autocomplete ---
  var searchBox = document.getElementById('author-search-box');
  var resultsList = document.getElementById('search-results');
  var activeIdx = -1;

  function showResults(matches) {
    resultsList.innerHTML = '';
    if (matches.length === 0) { resultsList.style.display = 'none'; return; }
    activeIdx = -1;
    var shown = matches.slice(0, 30);
    for (var i = 0; i < shown.length; i++) {
      var li = document.createElement('li');
      li.dataset.name = shown[i].name;
      li.innerHTML = '<strong>' + escHtml(cleanName(shown[i].name)) + '</strong>' +
        (shown[i].affiliation ? '<br><span class="sr-affil">' + escHtml(shown[i].affiliation) + '</span>' : '');
      li.addEventListener('click', function() {
        selectAuthor(this.dataset.name);
      });
      resultsList.appendChild(li);
    }
    if (matches.length > 30) {
      var more = document.createElement('li');
      more.style.color = '#999';
      more.textContent = '… and ' + (matches.length - 30) + ' more — type to narrow';
      resultsList.appendChild(more);
    }
    resultsList.style.display = 'block';
  }

  function selectAuthor(name) {
    resultsList.style.display = 'none';
    searchBox.value = cleanName(name);
    var p = profileMap[name];
    if (p) {
      renderProfile(p);
      // Update URL without reload
      var url = new URL(window.location);
      url.searchParams.set('name', name);
      history.replaceState(null, '', url);
    }
  }

  searchBox.addEventListener('input', function() {
    var q = this.value.trim().toLowerCase();
    if (q.length < 2) { resultsList.style.display = 'none'; return; }
    var matches = allProfiles.filter(function(p) {
      return p.name.toLowerCase().indexOf(q) >= 0 ||
             (p.affiliation && p.affiliation.toLowerCase().indexOf(q) >= 0);
    }).slice(0, 100);
    showResults(matches);
  });

  searchBox.addEventListener('keydown', function(e) {
    var items = resultsList.querySelectorAll('li[data-name]');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, items.length - 1);
      items.forEach(function(li, i) { li.classList.toggle('active', i === activeIdx); });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, 0);
      items.forEach(function(li, i) { li.classList.toggle('active', i === activeIdx); });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && items[activeIdx]) {
        selectAuthor(items[activeIdx].dataset.name);
      }
    } else if (e.key === 'Escape') {
      resultsList.style.display = 'none';
    }
  });

  document.addEventListener('click', function(e) {
    if (!searchBox.contains(e.target) && !resultsList.contains(e.target)) {
      resultsList.style.display = 'none';
    }
  });

  // --- Load data & init ---
  fetch(DATA_URL)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      allProfiles = data;
      profileMap = {};
      for (var i = 0; i < data.length; i++) {
        profileMap[data[i].name] = data[i];
      }
      document.getElementById('loading-msg').style.display = 'none';
      searchBox.style.display = '';

      // Check for ?name= parameter
      var params = new URLSearchParams(window.location.search);
      var nameParam = params.get('name');
      // Normalise whitespace: tabs/newlines → space, collapse runs
      if (nameParam) { nameParam = nameParam.replace(/[\t\n\r]+/g, ' ').replace(/  +/g, ' ').trim(); }
      if (nameParam && profileMap[nameParam]) {
        searchBox.value = cleanName(nameParam);
        renderProfile(profileMap[nameParam]);
      } else if (nameParam) {
        // Try partial match
        var lower = nameParam.toLowerCase();
        var match = data.find(function(p) { return p.name.toLowerCase() === lower || cleanName(p.name).toLowerCase() === lower; });
        if (match) {
          searchBox.value = cleanName(match.name);
          renderProfile(match);
        } else {
          searchBox.value = nameParam;
          searchBox.dispatchEvent(new Event('input'));
        }
      }
    })
    .catch(function(err) {
      document.getElementById('loading-msg').textContent = 'Error loading author data.';
      console.error(err);
    });
})();
</script>
