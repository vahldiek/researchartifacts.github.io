/**
 * reprodb-search.js — Main search page logic (index.md).
 * Reads data-endpoint URLs from the #search-data-urls element.
 */
(function(){
  var cfg = document.getElementById('search-data-urls').dataset;
  var baseUrl = cfg.baseUrl || '';

  var allData = [];
  var filtered = [];
  var currentPage = 1;
  var pageSize = 25;
  var sortField = 'year';
  var sortAsc = false;
  var urlAccessible = {};  // url -> boolean
  var availabilityLoaded = false;
  var availabilityCheckedAt = '';
  var authorProfiles = [];
  var institutionData = [];

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
    var cleaned = query.replace(/#(unavailable|awarded|github|zenodo|nourl)/g, '').trim();
    var terms = normalizeText(cleaned).split(/\s+/).filter(function(t) { return t.length > 0; });
    var yearVal = document.getElementById('yearFilter').value;
    var venueVal = document.getElementById('venueFilter').value;
    var areaVal = document.getElementById('areaFilter').value;

    if (!query && !yearVal && !venueVal && !areaVal) {
      list.classList.add('rdb-hidden');
      noRes.classList.add('rdb-hidden');
      pagination.classList.add('rdb-hidden');
      sortCtrl.classList.add('rdb-hidden');
      document.getElementById('downloadBtn').classList.add('rdb-hidden');
      document.getElementById('shareBtn').classList.add('rdb-hidden');
      document.getElementById('profileCards').classList.add('rdb-hidden');
      document.getElementById('profileCards').innerHTML = '';
      status.textContent = allData.length + ' artifacts available. Type a query or select a filter to search.';
      return;
    }

    var maxPage = Math.ceil(filtered.length / pageSize) || 1;
    var start = (currentPage - 1) * pageSize;
    var pageData = filtered.slice(start, start + pageSize);

    list.innerHTML = '';
    if (filtered.length === 0) {
      list.classList.add('rdb-hidden');
      noRes.classList.remove('rdb-hidden');
      pagination.classList.add('rdb-hidden');
      sortCtrl.classList.add('rdb-hidden');
      document.getElementById('downloadBtn').classList.add('rdb-hidden');
      document.getElementById('shareBtn').classList.add('rdb-hidden');
      // Still show profile cards even when no artifact results
      renderProfileCards(query, terms);
      var pcCount = document.getElementById('profileCards').querySelectorAll('.profile-card').length;
      status.textContent = '0 artifact results' + (pcCount > 0 ? ' (' + pcCount + ' matching profile' + (pcCount !== 1 ? 's' : '') + ')' : '');
      return;
    }

    // Render profile cards above results
    renderProfileCards(query, terms);

    noRes.classList.add('rdb-hidden');
    pageData.forEach(function(d) {
      var entry = document.createElement('div');
      entry.className = 'rdb-result-entry';

      // Line 1: Bold title (linked to artifact)
      var artUrls = d.artifact_urls || [];
      var titleLink = artUrls.length > 0 ? artUrls[0] : (d.repository_url || d.artifact_url || '');
      var titleHtml = titleLink
        ? '<a href="' + escHtml(titleLink) + '" target="_blank" rel="noopener">' + escHtml(d.title) + '</a>'
        : escHtml(d.title);

      // Line 2: Authors (clickable)
      var authorsArr = d.authors || [];
      var authorsHtml = authorsArr.map(function(a) {
        var profileUrl = baseUrl + '/profile.html?name=' + encodeURIComponent(a);
        return '<a href="' + profileUrl + '">' + escHtml(a) + '</a>';
      }).join(', ');
      var authorsLine = authorsHtml || '';

      // Line 3: Venue, Year, Badges
      var badges = (d.badges || []).map(function(b) {
        return '<span class="rdb-badge">' + badgeLabel(b) + '</span>';
      }).join(' ');
      var awardTag = d.award ? ' <span class="rdb-badge rdb-badge--award">🏆 ' + escHtml(d.award) + '</span>' : '';
      var metaLine = escHtml(d.conference) + ' ' + d.year + (badges ? ' &middot; ' + badges : '') + awardTag;

      // Line 4: Links
      var links = [];
      // Paper link: prefer doi_url, fall back to paper_url
      if (d.doi_url) {
        links.push('<a href="' + escHtml(d.doi_url) + '" target="_blank" rel="noopener">📄 Paper</a>');
      } else if (d.paper_url) {
        links.push('<a href="' + escHtml(d.paper_url) + '" target="_blank" rel="noopener">📄 Paper</a>');
      }
      // Artifact URLs (unified list)
      var artUrlList = d.artifact_urls || [];
      if (artUrlList.length === 1) {
        var isGH = artUrlList[0].indexOf('github.com') !== -1;
        var lbl = isGH ? '💻 GitHub' : '📦 Artifact';
        var avail1 = availabilityTag(artUrlList[0]);
        links.push('<a href="' + escHtml(artUrlList[0]) + '" target="_blank" rel="noopener">' + lbl + '</a>' + avail1);
      } else {
        artUrlList.forEach(function(u, i) {
          if (u) {
            var isGH = u.indexOf('github.com') !== -1;
            var lbl = isGH ? '💻 GitHub' : '📦 Artifact';
            if (artUrlList.length > 1) lbl += ' #' + (i+1);
            var availN = availabilityTag(u);
            links.push('<a href="' + escHtml(u) + '" target="_blank" rel="noopener">' + lbl + '</a>' + availN);
          }
        });
      }
      if (d.appendix_url) links.push('<a href="' + escHtml(d.appendix_url) + '" target="_blank" rel="noopener">📋 Appendix</a>');
      var linksLine = links.length > 0 ? links.join(' &middot; ') : '';

      entry.innerHTML =
        '<div class="rdb-result-title">' + titleHtml + '</div>' +
        (authorsLine ? '<div class="rdb-result-authors">' + authorsLine + '</div>' : '') +
        '<div class="rdb-result-meta">' + metaLine + '</div>' +
        (linksLine ? '<div class="rdb-result-links">' + linksLine + '</div>' : '');

      list.appendChild(entry);
    });

    list.classList.remove('rdb-hidden');
    sortCtrl.classList.remove('rdb-hidden');
    var profileCardCount = document.getElementById('profileCards').querySelectorAll('.profile-card').length;
    var statusExtra = profileCardCount > 0 ? ' (' + profileCardCount + ' matching profile' + (profileCardCount !== 1 ? 's' : '') + ')' : '';
    status.textContent = filtered.length + ' result' + (filtered.length !== 1 ? 's' : '') + ' found' + statusExtra;
    document.getElementById('downloadBtn').classList.toggle('rdb-hidden', filtered.length <= 0);
    document.getElementById('shareBtn').classList.toggle('rdb-hidden', filtered.length <= 0);
    pagination.classList.toggle('rdb-hidden', maxPage <= 1);
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
    document.getElementById('searchIcon').classList.toggle('rdb-hidden', hasText);
    document.getElementById('clearIcon').classList.toggle('rdb-hidden', !hasText);
  }

  window.clearSearch = function() {
    var box = document.getElementById('searchBox');
    box.value = '';
    box.focus();
    updateSearchIcon();
    doSearch();
  };

  function getInitials(name) {
    var parts = (name || '').split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
    return (name || '?')[0].toUpperCase();
  }

  function renderProfileCards(query, terms) {
    var container = document.getElementById('profileCards');
    if (!terms || terms.length === 0 || query.trim().length < 2) {
      container.classList.add('rdb-hidden');
      container.innerHTML = '';
      return;
    }

    // Score: lower = better. Name-starts-with beats name-contains beats affiliation-only.
    function scoreMatch(name, affiliation) {
      var normName = normalizeText(name);
      var normAffil = normalizeText(affiliation || '');
      var nameStarts = terms.every(function(t) {
        return normName.split(' ').some(function(w) { return w.indexOf(t) === 0; });
      });
      if (nameStarts) return 0;
      var nameContains = terms.every(function(t) { return normName.indexOf(t) !== -1; });
      if (nameContains) return 1;
      var fullText = normName + ' ' + normAffil;
      var fullMatch = terms.every(function(t) { return fullText.indexOf(t) !== -1; });
      if (fullMatch) {
        // Only match on affiliation if at least one term hits the name
        var anyNameHit = terms.some(function(t) { return normName.indexOf(t) !== -1; });
        if (anyNameHit) return 2;
      }
      return -1; // no match
    }

    var candidates = [];
    authorProfiles.forEach(function(p) {
      var s = scoreMatch(p.name, p.affiliation);
      if (s >= 0) candidates.push({ type: 'author', data: p, score: s });
    });
    institutionData.forEach(function(inst) {
      var s = scoreMatch(inst.affiliation, '');
      if (s >= 0) candidates.push({ type: 'institution', data: inst, score: s });
    });

    candidates.sort(function(a, b) { return a.score - b.score; });
    candidates = candidates.slice(0, 3);

    if (candidates.length === 0) {
      container.classList.add('rdb-hidden');
      container.innerHTML = '';
      return;
    }

    var html = '<div class="profile-cards-row">';
    candidates.forEach(function(c) {
      if (c.type === 'institution') {
        var inst = c.data;
        var url = baseUrl + '/profile.html?name=' + encodeURIComponent(inst.affiliation) + '&type=institution';
        var caps = (inst.affiliation || '').replace(/[^A-Z]/g, '');
        var initials = caps.length > 0 ? caps.slice(0, 4) : (inst.affiliation || '?')[0].toUpperCase();
        html += '<a class="profile-card" href="' + url + '">' +
          '<div class="avatar inst-avatar">' + escHtml(initials) + '</div>' +
          '<div class="card-info">' +
            '<div class="card-name">' + escHtml(inst.affiliation) + '</div>' +
            '<div class="card-detail">' + (inst.author_count || 0) + ' researchers</div>' +
          '</div></a>';
      } else {
        var p = c.data;
        var cleanN = (p.name || '').replace(/\s+\d{4}$/, '').replace(/\t/g, ' ');
        var url = baseUrl + '/profile.html?name=' + encodeURIComponent(p.name) + (p.author_id != null ? '&id=' + p.author_id : '');
        html += '<a class="profile-card" href="' + url + '">' +
          '<div class="avatar author-avatar">' + escHtml(getInitials(cleanN)) + '</div>' +
          '<div class="card-info">' +
            '<div class="card-name">' + escHtml(cleanN) + '</div>' +
            '<div class="card-detail">' + escHtml(p.affiliation || '') + '</div>' +
          '</div></a>';
      }
    });
    html += '</div>';
    container.innerHTML = html;
    container.classList.remove('rdb-hidden');
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

  // Load data
  var availPromise = fetch(cfg.availability)
    .then(function(r) { return r.json(); })
    .then(function(avail) {
      availabilityCheckedAt = (avail.summary && avail.summary.checked_at) ? avail.summary.checked_at.replace(/ UTC$/, '') : '';
      (avail.records || []).forEach(function(rec) {
        var u = (rec.url || '').replace(/\/+$/, '');
        if (u) {
          if (rec.accessible === false) urlAccessible[u] = false;
          else if (urlAccessible[u] === undefined) urlAccessible[u] = true;
        }
      });
      availabilityLoaded = true;
      if (filtered.length > 0) renderResults();
    })
    .catch(function() { /* availability data not critical */ });

  // Load author profiles for profile cards
  var profilesPromise = fetch(cfg.authorProfiles)
    .then(function(r) { return r.json(); })
    .then(function(data) { authorProfiles = data || []; })
    .catch(function() { authorProfiles = []; });

  // Load institution data for profile cards
  var instPromise = fetch(cfg.institutions)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      institutionData = (data || []).filter(function(inst) {
        var a = (inst.affiliation || '').toLowerCase();
        return a && a !== 'unknown' && !a.startsWith('_');
      });
    })
    .catch(function() { institutionData = []; });

  fetch(cfg.searchData)
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
