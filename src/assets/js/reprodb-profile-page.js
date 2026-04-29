/**
 * reprodb-profile-page.js — Logic for the unified profile page (author + institution).
 * Reads data-endpoint URLs from the #profile-data-urls element.
 */
(function() {
  var escHtml = ReproDBProfile.escHtml;
  var cleanName = ReproDBProfile.cleanName;
  var badgeHtml = ReproDBProfile.badgeHtml;
  var card = ReproDBProfile.card;

  var cfg = document.getElementById('profile-data-urls').dataset;
  var baseUrl = cfg.baseUrl || '';

  // Data URLs
  var AUTHOR_PROFILES_URL = cfg.authorProfiles;
  var CITED_ARTIFACTS_URL = cfg.citedArtifacts;
  var AUTHOR_HISTORY_URL = cfg.authorHistory;
  var ARTIFACTS_URL = cfg.artifacts;
  var PAPERS_URL = cfg.papers;
  var AVAILABILITY_URL = cfg.availability;
  var INST_URL = cfg.institutions;
  var INST_HISTORY_URL = cfg.instHistory;

  // Author state
  var allProfiles = [];
  var profileMap = {};
  var idMap = {};
  var citedArtifactsMap = {};
  var artifactUrlMap = {};
  var paperIndex = {};
  var authorRankHistory = [];
  var urlAccessible = {};
  var availabilityLoaded = false;
  var availabilityCheckedAt = '';
  var authorChart = null;
  var authorHistoryChart = null;

  // Institution state
  var allInstitutions = [];
  var instMap = {};
  var instHistory = [];
  var instHistoryChart = null;

  // Pagination state (institution)
  var contribPage = 0, contribPageSize = 10, contribData = [];
  var artPage = 0, artPageSize = 15, artData = [];
  var aePage = 0, aePageSize = 20, aeData = [];
  var contribSortCol = 'combined_score', contribSortAsc = false;

  // ═══════════════════════════════════════════════════════════════════════
  //  AUTHOR PROFILE RENDERING
  // ═══════════════════════════════════════════════════════════════════════

  function hideAllProfiles() {
    document.getElementById('author-profile').classList.add('rdb-hidden');
    document.getElementById('inst-profile').classList.add('rdb-hidden');
  }

  function renderAuthorProfile(p) {
    hideAllProfiles();
    document.getElementById('author-profile').classList.remove('rdb-hidden');
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
      var rankChange = getAuthorRankChange(p.name);
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
      document.getElementById('papers-section').classList.remove('rdb-hidden');
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
      document.getElementById('papers-section').classList.add('rdb-hidden');
    }

    // AE service
    var hasAE = p.ae_memberships && p.ae_memberships > 0;
    if (hasAE) {
      document.getElementById('ae-section').classList.remove('rdb-hidden');
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
        document.getElementById('ae-table').classList.remove('rdb-hidden');
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
      document.getElementById('ae-section').classList.add('rdb-hidden');
    }

    // Cited artifacts
    var authorData = citedArtifactsMap[p.name];
    if (authorData && authorData.cited_artifacts && authorData.cited_artifacts.length > 0) {
      document.getElementById('citations-section').classList.remove('rdb-hidden');
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
      document.getElementById('citations-section').classList.add('rdb-hidden');
    }

    renderAuthorChart(p);
    renderAuthorHistoryChart(p);
  }

  function renderAuthorChart(p) {
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
      document.getElementById('chart-section').classList.add('rdb-hidden');
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
    document.getElementById('chart-section').classList.remove('rdb-hidden');
    var ctx = document.getElementById('timelineChart').getContext('2d');
    if (authorChart) authorChart.destroy();
    authorChart = new Chart(ctx, {
      type: 'bar',
      data: { labels: allYears.map(String), datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: datasets.length > 1 }, title: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } } }
      }
    });
  }

  function getAuthorRankChange(name) {
    if (authorRankHistory.length < 2) return null;
    var curr = authorRankHistory[authorRankHistory.length - 1].entries[name];
    var prev = authorRankHistory[authorRankHistory.length - 2].entries[name];
    if (!curr || !prev) return null;
    var diff = prev.rank - curr.rank;
    if (diff > 0) return { html: '<span class="rdb-rank-up">▲' + diff + '</span>' };
    if (diff < 0) return { html: '<span class="rdb-rank-down">▼' + (-diff) + '</span>' };
    return { html: '<span class="rank-unchanged">–</span>' };
  }

  function renderAuthorHistoryChart(p) {
    if (authorRankHistory.length < 2) {
      document.getElementById('author-history-section').classList.add('rdb-hidden');
      return;
    }
    var labels = [], scores = [], ranks = [], artScores = [], aeScores = [];
    for (var i = 0; i < authorRankHistory.length; i++) {
      var snap = authorRankHistory[i];
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
      document.getElementById('author-history-section').classList.add('rdb-hidden');
      return;
    }
    document.getElementById('author-history-section').classList.remove('rdb-hidden');
    var ctx = document.getElementById('authorHistoryChart').getContext('2d');
    if (authorHistoryChart) authorHistoryChart.destroy();
    authorHistoryChart = new Chart(ctx, {
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
        maintainAspectRatio: false,
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

  // ═══════════════════════════════════════════════════════════════════════
  //  INSTITUTION PROFILE RENDERING
  // ═══════════════════════════════════════════════════════════════════════

  function paginate(data, page, pageSize, bodyId, infoId, renderFn) {
    var start = page * pageSize;
    var end = Math.min(start + pageSize, data.length);
    var slice = data.slice(start, end);
    document.getElementById(bodyId).innerHTML = renderFn(slice, start);
    document.getElementById(infoId).textContent = (start+1) + '–' + end + ' of ' + data.length;
  }

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
      var url = baseUrl + '/profile.html?name=' + encodeURIComponent(p.name) + (p.author_id != null ? '&id=' + p.author_id : '');
      var rowId = 'contrib-ae-' + (startIdx + i);
      var mainRow = '<tr>' +
        '<td>' + (startIdx + i + 1) + '</td>' +
        '<td><a href="' + url + '">' + escHtml(dn) + '</a></td>' +
        '<td><strong>' + (p.combined_score || 0) + '</strong></td>' +
        '<td>' + (p.artifact_score || 0) + '</td>' +
        '<td>' + (p.ae_score || 0) + '</td>' +
        '<td>' + (p.artifact_count || 0) + '</td>' +
        '<td>' + (p.total_papers || 0) + '</td>' +
        '<td>' + (p.ae_memberships ? '<a href="#" class="ae-toggle" data-target="' + rowId + '">' + p.ae_memberships + '</a>' : '0') + '</td>' +
        '<td>' + (p.chair_count ? p.chair_count + ' ★' : '') + '</td>' +
        '</tr>';
      var detailRow = '';
      if (p.ae_conferences && p.ae_conferences.length > 0) {
        var sorted = p.ae_conferences.slice().sort(function(a, b) {
          var ya = Array.isArray(a) ? a[1] : (a.year || 0);
          var yb = Array.isArray(b) ? b[1] : (b.year || 0);
          return yb - ya;
        });
        var aeRows = sorted.map(function(entry) {
          var conf = Array.isArray(entry) ? entry[0] : (entry.conference || entry);
          var yr = Array.isArray(entry) ? entry[1] : (entry.year || '');
          var role = Array.isArray(entry) ? (entry.length > 2 ? entry[2] : 'member') : (entry.role || 'member');
          var roleLabel = role === 'chair' ? '★ Chair' : 'Member';
          return '<tr><td>' + escHtml(String(conf)) + '</td><td>' + yr + '</td><td>' + roleLabel + '</td></tr>';
        }).join('');
        detailRow = '<tr id="' + rowId + '" class="ae-detail-row rdb-hidden">' +
          '<td colspan="9"><table class="ae-inline-table"><thead><tr><th>Conference</th><th>Year</th><th>Role</th></tr></thead><tbody>' +
          aeRows + '</tbody></table></td></tr>';
      }
      return mainRow + detailRow;
    }).join('');
  }

  function refreshContributors() {
    sortContributors();
    paginate(contribData, contribPage, contribPageSize, 'contributors-body', 'contrib-info', renderContributors);
  }

  function renderArtifacts(slice, startIdx) {
    return slice.map(function(a, i) {
      var titleHtml;
      if (a.url) {
        titleHtml = '<a href="' + escHtml(a.url) + '" target="_blank" rel="noopener">' + escHtml(a.title) + '</a>';
      } else {
        titleHtml = escHtml(a.title);
      }
      var authorsHtml = a.authors.map(function(name) {
        return '<a href="' + baseUrl + '/profile.html?name=' + encodeURIComponent(name) + '">' + escHtml(cleanName(name)) + '</a>';
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

  function renderAE(slice) {
    return slice.map(function(a) {
      var roleLabel = a.role === 'chair' ? '★ Chair' : 'Member';
      return '<tr>' +
        '<td><a href="' + baseUrl + '/profile.html?name=' + encodeURIComponent(a.authorName) + '">' + escHtml(cleanName(a.authorName)) + '</a></td>' +
        '<td>' + escHtml(a.conference) + '</td>' +
        '<td>' + a.year + '</td>' +
        '<td>' + roleLabel + '</td>' +
        '</tr>';
    }).join('');
  }

  function refreshAE() {
    paginate(aeData, aePage, aePageSize, 'ae-detail-body', 'ae-info', renderAE);
  }

  function renderInstHistoryChart(instName) {
    if (instHistory.length < 2) {
      document.getElementById('inst-history-section').classList.add('rdb-hidden');
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
      document.getElementById('inst-history-section').classList.add('rdb-hidden');
      return;
    }
    document.getElementById('inst-history-section').classList.remove('rdb-hidden');
    var ctx = document.getElementById('instHistoryChart').getContext('2d');
    if (instHistoryChart) instHistoryChart.destroy();
    instHistoryChart = new Chart(ctx, {
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
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: true } },
        scales: {
          y: { beginAtZero: true, position: 'left', title: { display: true, text: 'Score' } },
          y1: { reverse: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Rank (#1 = top)' }, ticks: { precision: 0 } }
        }
      }
    });
  }

  function renderInstProfile(inst) {
    hideAllProfiles();
    document.getElementById('inst-profile').classList.remove('rdb-hidden');
    document.getElementById('inst-name').textContent = inst.affiliation;

    var roleTag = '';
    if (inst.role === 'Balanced') roleTag = '<span class="role-tag role-balanced">Balanced</span>';
    else if (inst.role === 'Artifact-focused') roleTag = '<span class="role-tag role-artifact">Artifact-focused</span>';
    else if (inst.role === 'Evaluation-focused') roleTag = '<span class="role-tag role-evaluation">Evaluation-focused</span>';
    document.getElementById('inst-name').innerHTML = escHtml(inst.affiliation) + roleTag;

    var cards = '';
    cards += card(inst.combined_score || 0, 'Combined Score');
    cards += card(inst.artifact_score || 0, 'Artifact Score');
    cards += card(inst.ae_score || 0, 'AE Score');
    var aeRatio = (inst.ae_ratio === null || inst.ae_ratio === undefined) ? '∞' : inst.ae_ratio;
    cards += card(aeRatio, 'A:E Ratio');
    cards += card(inst.artifact_count || 0, 'Artifacts');
    cards += card(inst.total_papers || 0, 'Total Papers');
    cards += card((inst.artifact_pct || 0) + '%', 'Artifact Rate');
    var reproRate = 0;
    if (inst.artifact_count > 0) reproRate = Math.round(((inst.badges_reproducible || 0) / inst.artifact_count) * 100);
    cards += card(reproRate + '%', 'Repro Rate');
    cards += card(inst.ae_memberships || 0, 'AE Memberships');
    if (inst.chair_count) cards += card(inst.chair_count, 'Chair Roles');

    if (instHistory.length >= 2) {
      var curr = instHistory[instHistory.length - 1].entries[inst.affiliation];
      var prev = instHistory[instHistory.length - 2].entries[inst.affiliation];
      if (curr) cards += card('#' + curr.rank, 'Rank');
      if (curr && prev) {
        var diff = prev.rank - curr.rank;
        var changeHtml;
        if (diff > 0) changeHtml = '<span class="rdb-rank-up">▲' + diff + '</span>';
        else if (diff < 0) changeHtml = '<span class="rdb-rank-down">▼' + (-diff) + '</span>';
        else changeHtml = '<span class="rank-unchanged">–</span>';
        cards += card(changeHtml, 'Rank Change');
      }
    }

    renderInstHistoryChart(inst.affiliation);

    var affProfiles = allProfiles.filter(function(p) {
      return p.affiliation === inst.affiliation;
    });

    var researchersCard = card(affProfiles.length, 'Researchers');
    var insertPos = cards.indexOf('A:E Ratio</div></div>') + 'A:E Ratio</div></div>'.length;
    cards = cards.slice(0, insertPos) + researchersCard + cards.slice(insertPos);
    document.getElementById('inst-score-cards').innerHTML = cards;

    // Contributors
    contribData = affProfiles.slice().map(function(p) {
      return {
        name: p.name,
        author_id: p.author_id,
        combined_score: p.combined_score || 0,
        artifact_score: p.artifact_score || 0,
        ae_score: p.ae_score || 0,
        artifacts: p.artifact_count || 0,
        artifact_count: p.artifact_count || 0,
        total_papers: p.total_papers || 0,
        ae_memberships: p.ae_memberships || 0,
        chair_count: p.chair_count || 0,
        ae_conferences: p.ae_conferences || []
      };
    });
    contribPage = 0;
    contribSortCol = 'combined_score';
    contribSortAsc = false;
    if (contribData.length > 0) {
      document.getElementById('inst-contributors-section').classList.remove('rdb-hidden');
      refreshContributors();
    } else {
      document.getElementById('inst-contributors-section').classList.add('rdb-hidden');
    }

    // Artifacts
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
      document.getElementById('inst-artifacts-section').classList.remove('rdb-hidden');
      refreshArtifacts();
    } else {
      document.getElementById('inst-artifacts-section').classList.add('rdb-hidden');
    }

    // AE involvement
    aeData = [];
    var totalAEMemberships = 0, totalChairs = 0;
    var aeConferences = {};
    affProfiles.forEach(function(p) {
      if (p.ae_conferences && p.ae_conferences.length > 0) {
        p.ae_conferences.forEach(function(entry) {
          var conf = Array.isArray(entry) ? entry[0] : (entry.conference || entry);
          var yr = Array.isArray(entry) ? entry[1] : (entry.year || '');
          var role = Array.isArray(entry) ? (entry.length > 2 ? entry[2] : 'member') : (entry.role || 'member');
          aeConferences[conf] = true;
          aeData.push({ authorName: p.name, conference: conf, year: yr, role: role });
        });
      }
      totalAEMemberships += (p.ae_memberships || 0);
      totalChairs += (p.chair_count || 0);
    });
    aeData.sort(function(a, b) {
      if (b.year !== a.year) return (b.year || 0) - (a.year || 0);
      return (a.conference || '').localeCompare(b.conference || '');
    });
    aePage = 0;
    if (aeData.length > 0) {
      document.getElementById('inst-ae-section').classList.remove('rdb-hidden');
      var confList = Object.keys(aeConferences).sort();
      var summaryHtml = '<p><strong>' + totalAEMemberships + '</strong> total AE memberships across <strong>' + affProfiles.filter(function(p){ return p.ae_memberships > 0; }).length + '</strong> researchers';
      if (totalChairs > 0) summaryHtml += ', <strong>' + totalChairs + '</strong> chair roles';
      summaryHtml += '.</p>';
      summaryHtml += '<p>Conferences: ' + confList.map(function(c){ return '<strong>' + escHtml(c) + '</strong>'; }).join(', ') + '</p>';
      document.getElementById('ae-summary-text').innerHTML = summaryHtml;
      refreshAE();
    } else {
      document.getElementById('inst-ae-section').classList.add('rdb-hidden');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  UNIFIED SEARCH
  // ═══════════════════════════════════════════════════════════════════════

  var search = ReproDBProfile.initSearch({
    searchBoxId: 'profile-search-box',
    resultsListId: 'search-results',
    shareBtnId: 'share-btn',
    loadingId: 'loading-msg',
    maxResults: 30,
    filterItems: function(q) {
      var authorMatches = allProfiles.filter(function(p) {
        return p.name.toLowerCase().indexOf(q) >= 0 ||
               (p.affiliation && p.affiliation.toLowerCase().indexOf(q) >= 0);
      }).slice(0, 50).map(function(p) { return { type: 'author', data: p }; });

      var instMatches = allInstitutions.filter(function(inst) {
        return (inst.affiliation || '').toLowerCase().indexOf(q) !== -1;
      }).slice(0, 20).map(function(inst) { return { type: 'institution', data: inst }; });

      // Interleave: institutions first (fewer, more distinct), then authors
      return instMatches.concat(authorMatches);
    },
    renderResult: function(item) {
      if (item.type === 'institution') {
        var inst = item.data;
        return {
          key: 'inst:' + inst.affiliation,
          html: '<span class="sr-type sr-type-inst">Institution</span>' +
                '<strong>' + escHtml(inst.affiliation) + '</strong>' +
                ' <span class="sr-detail">(' + (inst.author_count||0) + ' researchers, score ' + (inst.combined_score||0) + ')</span>'
        };
      } else {
        var p = item.data;
        return {
          key: 'author:' + p.name,
          html: '<span class="sr-type sr-type-author">Author</span>' +
                '<strong>' + escHtml(cleanName(p.name)) + '</strong>' +
                (p.affiliation ? '<br><span class="sr-detail sr-detail-indent">' + escHtml(p.affiliation) + '</span>' : '')
        };
      }
    },
    onSelect: function(key) {
      if (key.indexOf('inst:') === 0) {
        var instName = key.substring(5);
        var inst = instMap[instName];
        if (!inst) return null;
        renderInstProfile(inst);
        // Show institution share button
        var instShareBtn = document.getElementById('inst-share-btn');
        if (instShareBtn) instShareBtn.classList.remove('rdb-hidden');
        return { displayValue: instName, urlParams: { name: instName, type: 'institution' } };
      } else {
        var authorName = key.substring(7);
        var p = profileMap[authorName];
        if (!p) return null;
        renderAuthorProfile(p);
        var params = {};
        if (p.author_id != null) params.id = p.author_id;
        return { displayValue: cleanName(authorName), urlParams: params };
      }
    },
    resolveFromUrl: function(params) {
      var typeParam = params.get('type');
      var idParam = params.get('id');
      var nameParam = params.get('name');
      if (nameParam) nameParam = nameParam.replace(/[\t\n\r]+/g, ' ').replace(/  +/g, ' ').trim();

      // Institution resolution (explicit type)
      if (typeParam === 'institution' && nameParam) {
        if (instMap[nameParam]) return { key: 'inst:' + nameParam, displayValue: nameParam };
        var lower = nameParam.toLowerCase();
        var match = allInstitutions.find(function(inst) { return inst.affiliation.toLowerCase() === lower; });
        if (match) return { key: 'inst:' + match.affiliation, displayValue: match.affiliation };
        return { search: nameParam };
      }

      // Author resolution
      var resolved = null;
      if (idParam && idMap[parseInt(idParam)]) {
        resolved = idMap[parseInt(idParam)];
      } else if (nameParam && profileMap[nameParam]) {
        resolved = profileMap[nameParam];
      } else if (nameParam) {
        var lower2 = nameParam.toLowerCase();
        resolved = allProfiles.find(function(p) { return p.name.toLowerCase() === lower2 || cleanName(p.name).toLowerCase() === lower2; });
      }

      if (resolved) return { key: 'author:' + resolved.name, displayValue: cleanName(resolved.name) };

      // Fallback: try institution if no author matched
      if (nameParam) {
        if (instMap[nameParam]) return { key: 'inst:' + nameParam, displayValue: nameParam };
        var lowerInst = nameParam.toLowerCase();
        var instMatch = allInstitutions.find(function(inst) { return inst.affiliation.toLowerCase() === lowerInst; });
        if (instMatch) return { key: 'inst:' + instMatch.affiliation, displayValue: instMatch.affiliation };
      }

      if (nameParam) return { search: nameParam };
      return null;
    }
  });

  // ── AE toggle in contributors table ────────────────────────────────────
  document.getElementById('contributors-table').addEventListener('click', function(e) {
    var toggle = e.target.closest('.ae-toggle');
    if (!toggle) return;
    e.preventDefault();
    var target = document.getElementById(toggle.dataset.target);
    if (target) target.classList.toggle('rdb-hidden');
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

  // ── Institution share button ──────────────────────────────────────────
  var instShareBtn = document.getElementById('inst-share-btn');
  if (instShareBtn) {
    instShareBtn.addEventListener('click', function() {
      var url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function() {
          instShareBtn.classList.add('copied');
          setTimeout(function() { instShareBtn.classList.remove('copied'); }, 1500);
        });
      } else {
        var ta = document.createElement('textarea');
        ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        instShareBtn.classList.add('copied');
        setTimeout(function() { instShareBtn.classList.remove('copied'); }, 1500);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  LOAD DATA & INIT
  // ═══════════════════════════════════════════════════════════════════════

  Promise.all([
    fetch(AUTHOR_PROFILES_URL).then(function(r) { return r.json(); }),
    fetch(CITED_ARTIFACTS_URL).then(function(r) { return r.json(); }).catch(function() { return {}; }),
    fetch(AUTHOR_HISTORY_URL).then(function(r) { return r.json(); }).catch(function() { return []; }),
    fetch(ARTIFACTS_URL).then(function(r) { return r.json(); }).catch(function() { return []; }),
    fetch(PAPERS_URL).then(function(r) { return r.json(); }).catch(function() { return []; }),
    fetch(AVAILABILITY_URL).then(function(r) { return r.json(); }).catch(function() { return {records:[]}; }),
    fetch(INST_URL).then(function(r) { return r.json(); }),
    fetch(INST_HISTORY_URL).then(function(r) { return r.json(); }).catch(function() { return []; })
  ]).then(function(results) {
    // Author data
    var data = results[0];
    citedArtifactsMap = results[1] || {};
    authorRankHistory = results[2] || [];

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

    // Institution data
    allInstitutions = results[6].filter(function(inst) {
      var a = (inst.affiliation || '').toLowerCase();
      return a && a !== 'unknown' && !a.startsWith('_');
    });
    instMap = {};
    allInstitutions.forEach(function(inst) { instMap[inst.affiliation] = inst; });
    instHistory = results[7] || [];

    search.activate();
  }).catch(function(err) {
    document.getElementById('loading-msg').textContent = 'Error loading profile data.';
    console.error(err);
  });
})();
