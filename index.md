---
title: ""
---

**Research artifacts & artifact evaluation (AE)** drive reproducibility and scientific impact. This project tracks and analyzes artifact evaluation outcomes across major [security]({{ '/security/' | relative_url }}) and [systems]({{ '/systems/' | relative_url }}) conferences, recognizing the contributions of both artifact authors and artifact evaluation committees.

<div id="search-container" style="max-width:720px; margin:2em auto; text-align:center;">
  <div style="position:relative; width:100%;">
    <input id="searchBox" type="text" placeholder="Search artifacts by title, author, affiliation, or venue…"
      style="display:block; width:100%; padding:14px 48px 14px 20px; font-size:1.1em; border:2px solid #ddd; border-radius:28px; outline:none; box-shadow:0 2px 8px rgba(0,0,0,0.08); transition: box-shadow 0.2s, border-color 0.2s; box-sizing:border-box;"
      onfocus="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.12)'; this.style.borderColor='#4285f4';"
      onblur="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'; this.style.borderColor='#ddd';"
      autocomplete="off">
    <svg style="position:absolute; right:16px; top:50%; transform:translateY(-50%); pointer-events:none;" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
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
  <div id="searchStatus" style="margin-top:8px; font-size:0.9em; color:#666; display:inline;"></div>
  <button id="downloadBtn" onclick="downloadResults()" style="display:none; margin-left:10px; padding:4px 14px; border:1px solid #ccc; border-radius:4px; background:#fff; cursor:pointer; font-size:0.9em; vertical-align:middle;">⬇ Download JSON</button>
</div>

<div id="sort-controls" style="margin-top:1em; margin-bottom:8px; display:none; font-size:0.9em; color:#555;">
  Sort by:
  <a href="#" onclick="sortResults('year'); return false;" style="margin-left:6px;">Year</a> ·
  <a href="#" onclick="sortResults('title'); return false;">Title</a> ·
  <a href="#" onclick="sortResults('venue'); return false;">Venue</a>
</div>

<div id="results-container">
  <div id="resultsList" style="display:none;"></div>
  <div id="noResults" style="display:none; padding:16px; text-align:center; color:#999;">No artifacts found matching your search.</div>
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
    if (t === 'artifact evaluated') return 'Evaluated';
    if (t === 'available') return 'Available';
    if (t === 'functional') return 'Functional';
    if (t === 'reproduced') return 'Reproduced';
    if (t === 'reusable') return 'Reusable';
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  function renderResults() {
    var list = document.getElementById('resultsList');
    var noRes = document.getElementById('noResults');
    var pagination = document.getElementById('pagination');
    var sortCtrl = document.getElementById('sort-controls');
    var status = document.getElementById('searchStatus');
    var query = document.getElementById('searchBox').value.trim();
    var yearVal = document.getElementById('yearFilter').value;
    var venueVal = document.getElementById('venueFilter').value;
    var areaVal = document.getElementById('areaFilter').value;

    if (!query && !yearVal && !venueVal && !areaVal) {
      list.style.display = 'none';
      noRes.style.display = 'none';
      pagination.style.display = 'none';
      sortCtrl.style.display = 'none';
      document.getElementById('downloadBtn').style.display = 'none';
      status.textContent = allData.length + ' artifacts available. Type a query or select a filter to search.';
      return;
    }

    var maxPage = Math.ceil(filtered.length / pageSize) || 1;
    var start = (currentPage - 1) * pageSize;
    var pageData = filtered.slice(start, start + pageSize);

    list.innerHTML = '';
    if (filtered.length === 0) {
      list.style.display = 'none';
      noRes.style.display = 'block';
      pagination.style.display = 'none';
      sortCtrl.style.display = 'none';
      document.getElementById('downloadBtn').style.display = 'none';
      status.textContent = '0 results';
      return;
    }

    noRes.style.display = 'none';
    pageData.forEach(function(d) {
      var entry = document.createElement('div');
      entry.style.cssText = 'padding:10px 0;';

      // Line 1: Bold title (linked to DOI/paper URL if available)
      var titleLink = d.doi_url || '';
      var titleHtml = titleLink
        ? '<a href="' + escHtml(titleLink) + '" target="_blank" rel="noopener" style="color:#0066cc; text-decoration:none;">' + escHtml(d.title) + '</a>'
        : escHtml(d.title);

      // Line 2: Authors (clickable) with affiliations
      var authorsArr = d.authors || [];
      var authorsHtml = authorsArr.map(function(a) {
        var profileUrl = baseUrl + '/author.html?name=' + encodeURIComponent(a);
        return '<a href="' + profileUrl + '" style="color:#0066cc; text-decoration:none;">' + escHtml(a) + '</a>';
      }).join(', ');
      var affArr = d.affiliations || [];
      var affStr = affArr.length > 0 ? ' (' + escHtml(affArr.join(', ')) + ')' : '';
      var authorsLine = authorsHtml ? authorsHtml + affStr : '';

      // Line 3: Venue, Year, Badges
      var badges = (d.badges || []).map(function(b) {
        return '<span style="display:inline-block; padding:1px 5px; margin:0 2px; border-radius:3px; background:#e8f5e9; font-size:0.85em;">' + badgeLabel(b) + '</span>';
      }).join(' ');
      var metaLine = escHtml(d.conference) + ' ' + d.year + (badges ? ' &middot; ' + badges : '');

      // Line 4: Links
      var links = [];
      if (d.repository_url) links.push('<a href="' + escHtml(d.repository_url) + '" target="_blank" rel="noopener" style="color:#0066cc; text-decoration:none;">Repository</a>');
      if (d.artifact_url) links.push('<a href="' + escHtml(d.artifact_url) + '" target="_blank" rel="noopener" style="color:#0066cc; text-decoration:none;">Artifact</a>');
      if (d.artifact_urls) {
        d.artifact_urls.forEach(function(u, i) {
          if (u) links.push('<a href="' + escHtml(u) + '" target="_blank" rel="noopener" style="color:#0066cc; text-decoration:none;">Artifact #' + (i+1) + '</a>');
        });
      }
      var linksLine = links.length > 0 ? links.join(' &middot; ') : '';

      entry.innerHTML =
        '<div style="font-weight:bold; font-size:1em; line-height:1.4;">' + titleHtml + '</div>' +
        (authorsLine ? '<div style="font-style:italic; color:#444; font-size:0.92em; line-height:1.4; margin-top:2px;">' + authorsLine + '</div>' : '') +
        '<div style="font-size:0.9em; color:#555; margin-top:2px;">' + metaLine + '</div>' +
        (linksLine ? '<div style="font-size:0.88em; margin-top:2px;">' + linksLine + '</div>' : '');

      list.appendChild(entry);
    });

    list.style.display = 'block';
    sortCtrl.style.display = 'block';
    status.textContent = filtered.length + ' result' + (filtered.length !== 1 ? 's' : '') + ' found';
    document.getElementById('downloadBtn').style.display = filtered.length > 0 ? 'inline-block' : 'none';
    pagination.style.display = maxPage > 1 ? 'block' : 'none';
    document.getElementById('pageInfo').textContent = 'Page ' + currentPage + ' of ' + maxPage;
    document.getElementById('prevBtn').disabled = currentPage <= 1;
    document.getElementById('nextBtn').disabled = currentPage >= maxPage;
  }

  window.downloadResults = function() {
    var exportData = filtered.map(function(d) {
      var e = {title: d.title, conference: d.conference, category: d.category, year: d.year, badges: d.badges, authors: d.authors, affiliations: d.affiliations};
      if (d.repository_url) e.repository_url = d.repository_url;
      if (d.artifact_url) e.artifact_url = d.artifact_url;
      if (d.artifact_urls) e.artifact_urls = d.artifact_urls;
      return e;
    });
    var blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'artifacts_search_results.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

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
