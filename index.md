---
title: "Artifact Evaluation across Security & Systems Conferences"
---

**Research artifacts & artifact evaluation (AE)** drive reproducibility and scientific impact. This project tracks and analyzes artifact evaluation outcomes across major [security]({{ '/security/' | relative_url }}) and [systems]({{ '/systems/' | relative_url }}) conferences, recognizing the contributions of both artifact authors and artifact evaluation committees.

<div id="search-container" style="max-width:720px; margin:2em auto; text-align:center;">
  <div style="position:relative; display:inline-block; width:100%;">
    <input id="searchBox" type="text" placeholder="Search artifacts by title, author, affiliation, or venue…"
      style="width:100%; padding:14px 48px 14px 20px; font-size:1.1em; border:2px solid #ddd; border-radius:28px; outline:none; box-shadow:0 2px 8px rgba(0,0,0,0.08); transition: box-shadow 0.2s, border-color 0.2s;"
      onfocus="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.12)'; this.style.borderColor='#4285f4';"
      onblur="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'; this.style.borderColor='#ddd';"
      autocomplete="off">
    <span style="position:absolute; right:16px; top:50%; transform:translateY(-50%); color:#999; font-size:1.2em; pointer-events:none;">&#128269;</span>
  </div>
  <div id="filters" style="margin-top:12px; display:flex; flex-wrap:wrap; gap:10px; justify-content:center; align-items:center;">
    <select id="yearFilter" style="padding:8px 12px; border:1px solid #ccc; border-radius:6px; font-size:0.95em; background:#fff;">
      <option value="">All Years</option>
    </select>
    <select id="venueFilter" style="padding:8px 12px; border:1px solid #ccc; border-radius:6px; font-size:0.95em; background:#fff;">
      <option value="">All Venues</option>
    </select>
    <select id="areaFilter" style="padding:8px 12px; border:1px solid #ccc; border-radius:6px; font-size:0.95em; background:#fff;">
      <option value="">All Areas</option>
      <option value="systems">Systems</option>
      <option value="security">Security</option>
    </select>
  </div>
  <div id="searchStatus" style="margin-top:8px; font-size:0.9em; color:#666;"></div>
</div>

<div id="results-container" style="margin-top:1em; overflow-x:auto;">
  <table id="resultsTable" style="width:100%; border-collapse:collapse; font-size:0.9em; display:none;">
    <thead>
      <tr style="background:#f5f5f5; text-align:left;">
        <th style="padding:8px 10px; border-bottom:2px solid #ddd; cursor:pointer;" onclick="sortResults('title')">Title ⇅</th>
        <th style="padding:8px 10px; border-bottom:2px solid #ddd;">Authors</th>
        <th style="padding:8px 10px; border-bottom:2px solid #ddd;">Affiliations</th>
        <th style="padding:8px 10px; border-bottom:2px solid #ddd; cursor:pointer;" onclick="sortResults('venue')">Venue ⇅</th>
        <th style="padding:8px 10px; border-bottom:2px solid #ddd; cursor:pointer;" onclick="sortResults('year')">Year ⇅</th>
        <th style="padding:8px 10px; border-bottom:2px solid #ddd;">Badges</th>
        <th style="padding:8px 10px; border-bottom:2px solid #ddd;">Links</th>
      </tr>
    </thead>
    <tbody id="resultsBody"></tbody>
  </table>
</div>

<div id="pagination" style="margin-top:12px; text-align:center; display:none;">
  <button id="prevBtn" onclick="changePage(-1)" style="padding:6px 16px; margin:0 4px; border:1px solid #ccc; border-radius:4px; background:#fff; cursor:pointer;">← Prev</button>
  <span id="pageInfo" style="margin:0 10px; font-size:0.95em;"></span>
  <button id="nextBtn" onclick="changePage(1)" style="padding:6px 16px; margin:0 4px; border:1px solid #ccc; border-radius:4px; background:#fff; cursor:pointer;">Next →</button>
</div>

<script>
(function(){
  var allData = [];
  var filtered = [];
  var currentPage = 1;
  var pageSize = 25;
  var sortField = 'year';
  var sortAsc = false;
  var baseUrl = '{{ "" | relative_url }}';

  function escHtml(s) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(s || ''));
    return d.innerHTML;
  }

  function normalizeText(s) {
    return (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
  }

  function buildSearchIndex(data) {
    data.forEach(function(d) {
      d._search = normalizeText(d.title) + ' ' +
        normalizeText((d.authors || []).join(' ')) + ' ' +
        normalizeText((d.affiliations || []).join(' ')) + ' ' +
        normalizeText(d.conference) + ' ' +
        normalizeText(d.category) + ' ' +
        d.year;
    });
  }

  function populateFilters(data) {
    var years = {}, venues = {};
    data.forEach(function(d) {
      years[d.year] = 1;
      venues[d.conference] = 1;
    });
    var yearSel = document.getElementById('yearFilter');
    Object.keys(years).sort().reverse().forEach(function(y) {
      var opt = document.createElement('option');
      opt.value = y; opt.textContent = y;
      yearSel.appendChild(opt);
    });
    var venueSel = document.getElementById('venueFilter');
    Object.keys(venues).sort().forEach(function(v) {
      var opt = document.createElement('option');
      opt.value = v; opt.textContent = v;
      venueSel.appendChild(opt);
    });
  }

  function doSearch() {
    var query = normalizeText(document.getElementById('searchBox').value.trim());
    var yearVal = document.getElementById('yearFilter').value;
    var venueVal = document.getElementById('venueFilter').value;
    var areaVal = document.getElementById('areaFilter').value;
    var terms = query.split(/\s+/).filter(function(t) { return t.length > 0; });

    filtered = allData.filter(function(d) {
      if (yearVal && String(d.year) !== yearVal) return false;
      if (venueVal && d.conference !== venueVal) return false;
      if (areaVal && d.category !== areaVal) return false;
      if (terms.length === 0) return true;
      return terms.every(function(t) { return d._search.indexOf(t) !== -1; });
    });

    currentPage = 1;
    doSort();
    renderResults();
  }

  function doSort() {
    filtered.sort(function(a, b) {
      var va, vb;
      if (sortField === 'year') { va = a.year; vb = b.year; }
      else if (sortField === 'venue') { va = a.conference; vb = b.conference; }
      else { va = a.title.toLowerCase(); vb = b.title.toLowerCase(); }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });
  }

  window.sortResults = function(field) {
    if (sortField === field) { sortAsc = !sortAsc; }
    else { sortField = field; sortAsc = true; }
    doSort();
    renderResults();
  };

  window.changePage = function(delta) {
    var maxPage = Math.ceil(filtered.length / pageSize);
    currentPage = Math.max(1, Math.min(maxPage, currentPage + delta));
    renderResults();
  };

  function badgeLabel(b) {
    var t = b.toLowerCase().replace('badges: ', '').trim();
    if (t === 'artifact evaluated') return '🏅 Evaluated';
    if (t === 'available') return '📦 Available';
    if (t === 'functional') return '⚙️ Functional';
    if (t === 'reproduced') return '🔄 Reproduced';
    if (t === 'reusable') return '♻️ Reusable';
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  function renderResults() {
    var table = document.getElementById('resultsTable');
    var tbody = document.getElementById('resultsBody');
    var pagination = document.getElementById('pagination');
    var status = document.getElementById('searchStatus');
    var query = document.getElementById('searchBox').value.trim();
    var yearVal = document.getElementById('yearFilter').value;
    var venueVal = document.getElementById('venueFilter').value;
    var areaVal = document.getElementById('areaFilter').value;

    if (!query && !yearVal && !venueVal && !areaVal) {
      table.style.display = 'none';
      pagination.style.display = 'none';
      status.textContent = allData.length + ' artifacts available. Type a query or select a filter to search.';
      return;
    }

    var maxPage = Math.ceil(filtered.length / pageSize) || 1;
    var start = (currentPage - 1) * pageSize;
    var pageData = filtered.slice(start, start + pageSize);

    tbody.innerHTML = '';
    if (filtered.length === 0) {
      table.style.display = 'table';
      tbody.innerHTML = '<tr><td colspan="7" style="padding:16px; text-align:center; color:#999;">No artifacts found matching your search.</td></tr>';
      pagination.style.display = 'none';
      status.textContent = '0 results';
      return;
    }

    pageData.forEach(function(d) {
      var tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #eee';

      // Title
      var titleHtml = escHtml(d.title);

      // Authors (truncate if many)
      var authorsArr = d.authors || [];
      var authorsHtml = authorsArr.length > 0
        ? authorsArr.map(function(a) {
            var profileUrl = baseUrl + '/author.html?name=' + encodeURIComponent(a);
            return '<a href="' + profileUrl + '" style="color:#0066cc;text-decoration:none;">' + escHtml(a) + '</a>';
          }).join(', ')
        : '<span style="color:#999;">—</span>';

      // Affiliations
      var affHtml = (d.affiliations || []).length > 0
        ? escHtml(d.affiliations.join(', '))
        : '<span style="color:#999;">—</span>';

      // Venue
      var venueHtml = escHtml(d.conference);

      // Year
      var yearHtml = String(d.year);

      // Badges
      var badgesHtml = (d.badges || []).map(function(b) {
        return '<span style="display:inline-block; padding:1px 6px; margin:1px; border-radius:3px; background:#e8f5e9; font-size:0.85em; white-space:nowrap;">' + badgeLabel(b) + '</span>';
      }).join(' ');

      // Links
      var links = [];
      var repoUrl = d.repository_url || '';
      var artUrl = d.artifact_url || '';
      if (repoUrl) links.push('<a href="' + escHtml(repoUrl) + '" target="_blank" rel="noopener" style="color:#0066cc; text-decoration:none;" title="Repository">📂 Repo</a>');
      if (artUrl) links.push('<a href="' + escHtml(artUrl) + '" target="_blank" rel="noopener" style="color:#0066cc; text-decoration:none;" title="Artifact">📎 Artifact</a>');
      if (d.artifact_urls) {
        d.artifact_urls.forEach(function(u, i) {
          if (u && links.length < 4) links.push('<a href="' + escHtml(u) + '" target="_blank" rel="noopener" style="color:#0066cc; text-decoration:none;" title="Artifact">📎 #' + (i+1) + '</a>');
        });
      }
      var linksHtml = links.length > 0 ? links.join('<br>') : '<span style="color:#999;">—</span>';

      tr.innerHTML =
        '<td style="padding:6px 10px;">' + titleHtml + '</td>' +
        '<td style="padding:6px 10px; max-width:200px;">' + authorsHtml + '</td>' +
        '<td style="padding:6px 10px; max-width:150px;">' + affHtml + '</td>' +
        '<td style="padding:6px 10px; white-space:nowrap;">' + venueHtml + '</td>' +
        '<td style="padding:6px 10px; white-space:nowrap;">' + yearHtml + '</td>' +
        '<td style="padding:6px 10px;">' + badgesHtml + '</td>' +
        '<td style="padding:6px 10px; white-space:nowrap;">' + linksHtml + '</td>';
      tbody.appendChild(tr);
    });

    table.style.display = 'table';
    status.textContent = filtered.length + ' result' + (filtered.length !== 1 ? 's' : '') + ' found';
    pagination.style.display = maxPage > 1 ? 'block' : 'none';
    document.getElementById('pageInfo').textContent = 'Page ' + currentPage + ' of ' + maxPage;
    document.getElementById('prevBtn').disabled = currentPage <= 1;
    document.getElementById('nextBtn').disabled = currentPage >= maxPage;
  }

  // Load data
  fetch('{{ "/assets/data/search_data.json" | relative_url }}')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      allData = data;
      buildSearchIndex(data);
      populateFilters(data);
      document.getElementById('searchStatus').textContent = data.length + ' artifacts available. Type a query or select a filter to search.';

      // Wire up events
      var debounceTimer;
      document.getElementById('searchBox').addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(doSearch, 200);
      });
      document.getElementById('yearFilter').addEventListener('change', doSearch);
      document.getElementById('venueFilter').addEventListener('change', doSearch);
      document.getElementById('areaFilter').addEventListener('change', doSearch);

      // Check URL params for pre-filled search
      var params = new URLSearchParams(window.location.search);
      if (params.get('q')) {
        document.getElementById('searchBox').value = params.get('q');
        doSearch();
      }
      if (params.get('venue')) {
        document.getElementById('venueFilter').value = params.get('venue');
        doSearch();
      }
      if (params.get('year')) {
        document.getElementById('yearFilter').value = params.get('year');
        doSearch();
      }
    })
    .catch(function(err) {
      document.getElementById('searchStatus').textContent = 'Error loading artifact data.';
      console.error(err);
    });
})();
</script>

## Data Sources

- **[sysartifacts.github.io](https://sysartifacts.github.io)** — Systems conference artifact evaluation results (EuroSys, OSDI, SC, SOSP)
- **[secartifacts.github.io](https://secartifacts.github.io)** — Security conference artifact evaluation results (ACSAC, CHES, NDSS, PETS, SysTEX, USENIX Security, WOOT)
- **[usenix.org](https://www.usenix.org)** — Badge information for USENIX conferences (ATC, FAST)
- **[dblp.org](https://dblp.org)** — Author name matching and disambiguation
- **[GitHub](https://docs.github.com/en/rest)**, **[Zenodo](https://developers.zenodo.org)**, **[Figshare](https://docs.figshare.com)** — Repository statistics (stars, forks, downloads)

## Acknowledgements

This project celebrates the work of **artifact authors** who go the extra mile to make research reproducible, and **artifact evaluation committees** (AE chairs and members) who invest time reviewing and certifying artifacts. Their contributions strengthen our scientific record. We thank the communities maintaining [sysartifacts](https://sysartifacts.github.io) and [secartifacts](https://secartifacts.github.io) for publishing detailed evaluation results. Inspired by [Systems Circus](https://nebelwelt.net/pubstats/) and [csrankings.org](https://csrankings.org).

<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  var years = [{% for y in site.data.artifacts_by_year %}"{{ y.year }}"{% unless forloop.last %},{% endunless %}{% endfor %}];
  var systems = [{% for y in site.data.artifacts_by_year %}{{ y.systems }}{% unless forloop.last %},{% endunless %}{% endfor %}];
  var security = [{% for y in site.data.artifacts_by_year %}{{ y.security }}{% unless forloop.last %},{% endunless %}{% endfor %}];
  var totals = [{% for y in site.data.artifacts_by_year %}{{ y.count }}{% unless forloop.last %},{% endunless %}{% endfor %}];

  new Chart(document.getElementById('areaChart'), {
    type: 'line',
    data: {
      labels: years,
      datasets: [
        { label: 'Total', data: totals, borderColor: '#333', backgroundColor: 'rgba(51,51,51,0.1)', fill: false, tension: 0.2 },
        { label: 'Security', data: security, borderColor: '#c0392b', backgroundColor: 'rgba(192,57,43,0.1)', fill: false, tension: 0.2 },
        { label: 'Systems', data: systems, borderColor: '#2980b9', backgroundColor: 'rgba(41,128,185,0.1)', fill: false, tension: 0.2 }
      ]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Artifacts by Year and Area' } },
      scales: { y: { beginAtZero: true, title: { display: true, text: 'Artifacts' } } }
    }
  });
});
</script>

<style>
table {
  font-size: 0.78em;
  white-space: nowrap;
  border-collapse: collapse;
}
table th, table td {
  padding: 3px 6px;
  border: 1px solid #ddd;
}
table th {
  background-color: #f2f2f2;
  position: sticky;
  top: 0;
}
table tr:nth-child(even) {
  background-color: #f9f9f9;
}
table tr:hover {
  background-color: #e8f4f8;
}
</style>

---

**Data:** [All Artifacts](/assets/data/artifacts.json) | [Artifacts by Conference](/assets/data/artifacts_by_conference.json) | [Rankings](/assets/data/combined_rankings.json) | [Authors](/assets/data/authors.json) | [Repository Stats](/assets/data/top_repos.json)
