---
title: ""
---

<style>
.avail-warn { position:relative; cursor:help; font-size:0.8em; color:#b26a00; background:#fff8e1; padding:1px 5px; border-radius:3px; border:1px solid #ffe0b2; }
.avail-warn .avail-tip { display:none; position:absolute; bottom:125%; left:50%; transform:translateX(-50%); background:#333; color:#fff; font-size:0.85em; padding:4px 8px; border-radius:4px; white-space:nowrap; z-index:100; pointer-events:none; }
.avail-warn:hover .avail-tip { display:block; }
</style>

**Research artifacts & artifact evaluation (AE)** drive reproducibility and scientific impact. This project analyzes and makes accessible artifact evaluation outcomes across major [security]({{ '/security/' | relative_url }}) and [systems]({{ '/systems/' | relative_url }}) conferences, recognizing the contributions of both artifact authors and artifact evaluation committees.

<div id="search-container" style="max-width:720px; margin:2em auto; text-align:center;">
  <div style="position:relative; width:100%;">
    <input id="searchBox" type="text" placeholder="Search artifacts by title, author, affiliation, or venue…"
      style="display:block; width:100%; padding:14px 48px 14px 20px; font-size:1.1em; border:2px solid #ddd; border-radius:28px; outline:none; box-shadow:0 2px 8px rgba(0,0,0,0.08); transition: box-shadow 0.2s, border-color 0.2s; box-sizing:border-box;"
      onfocus="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.12)'; this.style.borderColor='#4285f4';"
      onblur="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'; this.style.borderColor='#ddd';"
      autocomplete="off">
    <svg id="searchIcon" style="position:absolute; right:16px; top:50%; transform:translateY(-50%); pointer-events:none;" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <svg id="clearIcon" onclick="clearSearch()" style="display:none; position:absolute; right:16px; top:50%; transform:translateY(-50%); cursor:pointer;" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
  <div id="searchStatus" style="margin-top:8px; font-size:0.9em; color:#666; display:inline;">Loading artifact data…</div>
  <button id="downloadBtn" onclick="downloadResults()" style="display:none; margin-left:10px; padding:4px 14px; border:1px solid #ccc; border-radius:4px; background:#fff; cursor:pointer; font-size:0.9em; vertical-align:middle;">⬇ Download JSON</button>
  <button id="shareBtn" onclick="shareSearch()" style="display:none; margin-left:6px; padding:4px 14px; border:1px solid #ccc; border-radius:4px; background:#fff; cursor:pointer; font-size:0.9em; vertical-align:middle;">🔗 Share</button>
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
  var urlAccessible = {};  // url -> boolean
  var availabilityLoaded = false;
  var availabilityCheckedAt = '';

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
    var raw = document.getElementById('searchBox').value.trim();
    // Parse magic keywords
    var onlyUnavail = raw.indexOf('#unavailable') !== -1;
    var onlyAwarded = raw.indexOf('#awarded') !== -1;
    var onlyGithub = raw.indexOf('#github') !== -1;
    var onlyZenodo = raw.indexOf('#zenodo') !== -1;
    var onlyNourl = raw.indexOf('#nourl') !== -1;
    var cleaned = raw.replace(/#(unavailable|awarded|github|zenodo|nourl)/g, '').trim();
    var query = normalizeText(cleaned);
    var yearVal = document.getElementById('yearFilter').value;
    var venueVal = document.getElementById('venueFilter').value;
    var areaVal = document.getElementById('areaFilter').value;
    var terms = query.split(/\s+/).filter(function(t) { return t.length > 0; });

    filtered = allData.filter(function(d) {
      if (yearVal && String(d.year) !== yearVal) return false;
      if (venueVal && d.conference !== venueVal) return false;
      if (areaVal && d.category !== areaVal) return false;
      if (onlyUnavail) {
        var artUrls = d.artifact_urls || [];
        var hasUnavail = artUrls.some(function(u) {
          return u && urlAccessible[u.replace(/\/+$/, '')] === false;
        });
        if (!hasUnavail) return false;
      }
      if (onlyAwarded && !d.award) return false;
      if (onlyGithub) {
        var urls = d.artifact_urls || [];
        if (!urls.some(function(u) { return u && u.indexOf('github.com') !== -1; })) return false;
      }
      if (onlyZenodo) {
        var urls2 = d.artifact_urls || [];
        if (!urls2.some(function(u) { return u && u.indexOf('zenodo.org') !== -1; })) return false;
      }
      if (onlyNourl) {
        if (d.artifact_urls && d.artifact_urls.length > 0) return false;
      }
      if (terms.length === 0) return true;
      return terms.every(function(t) { return d._search.indexOf(t) !== -1; });
    });

    currentPage = 1;
    doSort();
    updateUrl();
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
      document.getElementById('shareBtn').style.display = 'none';
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
      document.getElementById('shareBtn').style.display = 'none';
      status.textContent = '0 results';
      return;
    }

    noRes.style.display = 'none';
    pageData.forEach(function(d) {
      var entry = document.createElement('div');
      entry.style.cssText = 'padding:10px 0;';

      // Line 1: Bold title (linked to artifact)
      var artUrls = d.artifact_urls || [];
      var titleLink = artUrls.length > 0 ? artUrls[0] : (d.repository_url || d.artifact_url || '');
      var titleHtml = titleLink
        ? '<a href="' + escHtml(titleLink) + '" target="_blank" rel="noopener" style="color:#0066cc; text-decoration:none;">' + escHtml(d.title) + '</a>'
        : escHtml(d.title);

      // Line 2: Authors (clickable)
      var authorsArr = d.authors || [];
      var authorsHtml = authorsArr.map(function(a) {
        var profileUrl = baseUrl + '/author.html?name=' + encodeURIComponent(a);
        return '<a href="' + profileUrl + '" style="color:#0066cc; text-decoration:none;">' + escHtml(a) + '</a>';
      }).join(', ');
      var authorsLine = authorsHtml || '';

      // Line 3: Venue, Year, Badges
      var badges = (d.badges || []).map(function(b) {
        return '<span style="display:inline-block; padding:1px 5px; margin:0 2px; border-radius:3px; background:#e8f5e9; font-size:0.85em;">' + badgeLabel(b) + '</span>';
      }).join(' ');
      var awardTag = d.award ? ' <span style="display:inline-block; padding:1px 5px; margin:0 2px; border-radius:3px; background:#fff3e0; font-size:0.85em;">🏆 ' + escHtml(d.award) + '</span>' : '';
      var metaLine = escHtml(d.conference) + ' ' + d.year + (badges ? ' &middot; ' + badges : '') + awardTag;

      // Line 4: Links
      var links = [];
      // Paper link: prefer doi_url, fall back to paper_url
      if (d.doi_url) {
        links.push('<a href="' + escHtml(d.doi_url) + '" target="_blank" rel="noopener" style="color:#0066cc; text-decoration:none;">📄 Paper</a>');
      } else if (d.paper_url) {
        links.push('<a href="' + escHtml(d.paper_url) + '" target="_blank" rel="noopener" style="color:#0066cc; text-decoration:none;">📄 Paper</a>');
      }
      // Artifact URLs (unified list)
      var artUrlList = d.artifact_urls || [];
      if (artUrlList.length === 1) {
        var isGH = artUrlList[0].indexOf('github.com') !== -1;
        var lbl = isGH ? '💻 GitHub' : '📦 Artifact';
        var avail1 = availabilityTag(artUrlList[0]);
        links.push('<a href="' + escHtml(artUrlList[0]) + '" target="_blank" rel="noopener" style="color:#0066cc; text-decoration:none;">' + lbl + '</a>' + avail1);
      } else {
        artUrlList.forEach(function(u, i) {
          if (u) {
            var isGH = u.indexOf('github.com') !== -1;
            var lbl = isGH ? '💻 GitHub' : '📦 Artifact';
            if (artUrlList.length > 1) lbl += ' #' + (i+1);
            var availN = availabilityTag(u);
            links.push('<a href="' + escHtml(u) + '" target="_blank" rel="noopener" style="color:#0066cc; text-decoration:none;">' + lbl + '</a>' + availN);
          }
        });
      }
      if (d.appendix_url) links.push('<a href="' + escHtml(d.appendix_url) + '" target="_blank" rel="noopener" style="color:#0066cc; text-decoration:none;">📋 Appendix</a>');
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
    document.getElementById('shareBtn').style.display = filtered.length > 0 ? 'inline-block' : 'none';
    pagination.style.display = maxPage > 1 ? 'block' : 'none';
    document.getElementById('pageInfo').textContent = 'Page ' + currentPage + ' of ' + maxPage;
    document.getElementById('prevBtn').disabled = currentPage <= 1;
    document.getElementById('nextBtn').disabled = currentPage >= maxPage;
  }

  window.downloadResults = function() {
    var exportData = filtered.map(function(d) {
      var e = {title: d.title, conference: d.conference, category: d.category, year: d.year, badges: d.badges, authors: d.authors, affiliations: d.affiliations};
      if (d.doi_url) e.doi_url = d.doi_url;
      if (d.artifact_urls && d.artifact_urls.length) e.artifact_urls = d.artifact_urls;
      if (d.paper_url) e.paper_url = d.paper_url;
      if (d.appendix_url) e.appendix_url = d.appendix_url;
      if (d.award) e.award = d.award;
      return e;
    });
    var blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'artifacts_search_results.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  function updateUrl() {
    var params = new URLSearchParams();
    var q = document.getElementById('searchBox').value.trim();
    var year = document.getElementById('yearFilter').value;
    var venue = document.getElementById('venueFilter').value;
    var area = document.getElementById('areaFilter').value;
    if (q) params.set('q', q);
    if (year) params.set('year', year);
    if (venue) params.set('venue', venue);
    if (area) params.set('area', area);
    var qs = params.toString();
    var newUrl = window.location.pathname + (qs ? '?' + qs : '');
    history.replaceState(null, '', newUrl);
  }

  window.shareSearch = function() {
    var url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function() {
        var btn = document.getElementById('shareBtn');
        btn.textContent = '✓ Copied!';
        setTimeout(function() { btn.textContent = '🔗 Share'; }, 1500);
      });
    } else {
      prompt('Copy this URL to share:', url);
    }
  };

  function updateSearchIcon() {
    var hasText = document.getElementById('searchBox').value.length > 0;
    document.getElementById('searchIcon').style.display = hasText ? 'none' : 'block';
    document.getElementById('clearIcon').style.display = hasText ? 'block' : 'none';
  }

  window.clearSearch = function() {
    var box = document.getElementById('searchBox');
    box.value = '';
    box.focus();
    updateSearchIcon();
    doSearch();
  };

  function availabilityTag(url) {
    if (!availabilityLoaded || !url) return '';
    var normalUrl = url.replace(/\/+$/, '');
    if (urlAccessible[normalUrl] === false) {
      var tip = 'URL may be unavailable (last checked ' + (availabilityCheckedAt || 'recently') + ')';
      return ' <span class="avail-warn">\u26a0 may be unavailable<span class="avail-tip">' + escHtml(tip) + '</span></span>';
    }
    return '';
  }

  // Load data
  var availPromise = fetch('{{ "/assets/data/artifact_availability.json" | relative_url }}')
    .then(function(r) { return r.json(); })
    .then(function(avail) {
      availabilityCheckedAt = (avail.summary && avail.summary.checked_at) ? avail.summary.checked_at.replace(/ UTC$/, '') : '';
      (avail.records || []).forEach(function(rec) {
        var u = (rec.url || '').replace(/\/+$/, '');
        if (u) {
          // Only mark as inaccessible if explicitly false (conservative)
          if (rec.accessible === false) urlAccessible[u] = false;
          else if (urlAccessible[u] === undefined) urlAccessible[u] = true;
        }
      });
      availabilityLoaded = true;
      // Re-render if search results are already showing
      if (filtered.length > 0) renderResults();
    })
    .catch(function() { /* availability data not critical */ });

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
        updateSearchIcon();
      });
      document.getElementById('yearFilter').addEventListener('change', doSearch);
      document.getElementById('venueFilter').addEventListener('change', doSearch);
      document.getElementById('areaFilter').addEventListener('change', doSearch);

      // Check URL params for pre-filled search
      var params = new URLSearchParams(window.location.search);
      var hasParam = false;
      if (params.get('q')) {
        document.getElementById('searchBox').value = params.get('q');
        hasParam = true;
      }
      if (params.get('venue')) {
        document.getElementById('venueFilter').value = params.get('venue');
        hasParam = true;
      }
      if (params.get('year')) {
        document.getElementById('yearFilter').value = params.get('year');
        hasParam = true;
      }
      if (params.get('area')) {
        document.getElementById('areaFilter').value = params.get('area');
        hasParam = true;
      }
      if (hasParam) {
        updateSearchIcon();
        doSearch();
      }
    })
    .catch(function(err) {
      document.getElementById('searchStatus').textContent = 'Error loading artifact data.';
      console.error(err);
    });
})();
</script>
