---
title: "Artifact Citations"
permalink: /artifact_citations.html
layout: default
---

<style>
#citations-table {
  font-size: 0.9em;
  border-collapse: collapse;
  width: 100%;
  margin: 15px 0;
}
#citations-table th {
  background: #f2f2f2;
  padding: 8px 10px;
  text-align: left;
  border: 1px solid #ddd;
  cursor: pointer;
  user-select: none;
  font-weight: bold;
}
#citations-table th:hover {
  background: #e8e8e8;
}
#citations-table th.sort-asc::after {
  content: " ↑";
}
#citations-table th.sort-desc::after {
  content: " ↓";
}
#citations-table td {
  padding: 8px 10px;
  border: 1px solid #ddd;
}
#citations-table tr:nth-child(even) {
  background: #fafafa;
}
#citations-table tr:hover {
  background: #f0f8ff;
}
.citations-count {
  font-weight: bold;
  color: #c0392b;
  font-size: 1.1em;
}
.controls {
  margin: 6px 0;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.pagination-controls {
  margin-top: 6px;
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 0.9em;
}
.pagination-controls button {
  padding: 2px 6px;
  font-size: 0.9em;
}
.search-box {
  padding: 2px 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
  width: 200px;
}
.filter-info {
  color: #666;
  font-size: 0.85em;
}
.author-tag {
  display: inline-block;
  background: #e8f4f8;
  padding: 2px 6px;
  margin: 1px;
  border-radius: 3px;
  font-size: 0.85em;
  cursor: pointer;
  border: 1px solid #b0dce8;
}
.author-tag:hover {
  background: #d0ebf5;
  text-decoration: underline;
}
.institution-tag {
  display: inline-block;
  background: #f0f0f0;
  padding: 2px 6px;
  margin: 1px;
  border-radius: 3px;
  font-size: 0.85em;
  color: #555;
}
.stats-box p {
  margin: 2px 0;
  font-size: 0.9em;
}
.loading {
  text-align: center;
  color: #999;
  padding: 40px;
  font-style: italic;
}
#citations-table a {
  color: #0066cc;
  text-decoration: none;
  cursor: pointer;
}
#citations-table a:hover {
  text-decoration: underline;
  color: #0052a3;
}
</style>

<h2>Artifact Citations</h2>

<p>We queried <a href="https://openalex.org/">OpenAlex</a> for citations of <strong>782</strong> artifact DOIs (Zenodo &amp; Figshare) across <strong>2,576</strong> artifacts.
OpenAlex reported <strong>14</strong> artifacts with a total of <strong>43</strong> citing DOIs.
We verified each citing DOI using <a href="https://www.crossref.org/">Crossref</a> publisher-submitted reference lists to check whether the citing paper's bibliography actually contains the artifact DOI (rather than the associated paper DOI).</p>

<p><strong>Result: 0 genuine third-party artifact citations.</strong> All 43 citing DOIs were either false positives (36 &mdash; the paper was cited, not the artifact), self-citations (6 &mdash; the paper cites its own artifact), or unknown (1).</p>

<p><strong id="total-artifacts">0</strong> artifacts with verified third-party citations. <em id="data-status"></em></p>

<div class="controls">
  <label style="font-weight:bold; margin-right:4px; font-size:1em;">Search:</label>
  <input type="text" id="search-box" class="search-box" placeholder="Filter by title, author, institution...">
  <span class="filter-info" id="filter-info"></span>
</div>

<div id="table-container">
  <div class="loading">Loading artifact citations...</div>
</div>

<div class="pagination-controls" id="pagination-bottom" style="display:none;">
  <button id="prevBtn">&laquo; Prev</button>
  <span id="pageInfo"></span>
  <button id="nextBtn">Next &raquo;</button>
  <span id="totalInfo" style="margin-left:12px; color:#666;"></span>
</div>

<script>
(function() {
  const DATA_URL = '{{ "/assets/data/cited_artifacts_list.json" | relative_url }}';
  const baseUrl = '{{ "" | relative_url }}';
  let allArtifacts = [];
  let filteredArtifacts = [];
  let sortColumn = null;
  let sortDesc = true;
  let currentPage = 0;
  let pageSize = 25;

  function escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function renderTable(artifacts) {
    if (artifacts.length === 0) {
      document.getElementById('table-container').innerHTML = '<p style="text-align:center;color:#999;">No artifacts found</p>';
      document.getElementById('pagination-bottom').style.display = 'none';
      return;
    }

    // Pagination
    const totalPages = Math.ceil(artifacts.length / pageSize);
    const startIdx = currentPage * pageSize;
    const endIdx = Math.min(startIdx + pageSize, artifacts.length);
    const pageArtifacts = artifacts.slice(startIdx, endIdx);

    let html = '<table id="citations-table"><thead><tr>' +
      '<th data-col="citations" style="width:80px;">Citations</th>' +
      '<th data-col="title">Artifact Title</th>' +
      '<th data-col="conference" style="width:100px;">Venue</th>' +
      '<th data-col="year" style="width:70px;">Year</th>' +
      '<th data-col="authors">Authors</th>' +
      '<th data-col="institutions">Institutions</th>' +
      '</tr></thead><tbody>';

    for (let i = 0; i < pageArtifacts.length; i++) {
      const art = pageArtifacts[i];
      const authorsHtml = (art.authors || []).map(a => {
        const authorUrl = `${baseUrl}/author.html?author=${encodeURIComponent(a)}`;
        return `<a href="${authorUrl}" class="author-tag" data-author="${escHtml(a)}">${escHtml(a)}</a>`;
      }).join('');
      const institutionsHtml = (art.institutions || []).map(inst => 
        `<span class="institution-tag">${escHtml(inst)}</span>`
      ).join('');
      
      // Make title clickable with DOI link
      let titleHtml = `<strong>${escHtml(art.title)}</strong>`;
      if (art.doi) {
        titleHtml = `<a href="https://doi.org/${escHtml(art.doi)}" target="_blank" rel="noopener noreferrer"><strong>${escHtml(art.title)}</strong></a>`;
      }

      html += '<tr>' +
        `<td class="citations-count">${art.cited_by_count || 0}</td>` +
        `<td>${titleHtml}</td>` +
        `<td>${escHtml(art.conference || '')}</td>` +
        `<td>${art.year || ''}</td>` +
        `<td>${authorsHtml || '<em style="color:#999;">Unknown</em>'}</td>` +
        `<td>${institutionsHtml || '<em style="color:#999;">Unknown</em>'}</td>` +
        '</tr>';
    }

    html += '</tbody></table>';
    document.getElementById('table-container').innerHTML = html;

    // Update pagination controls
    document.getElementById('pagination-bottom').style.display = 'flex';
    document.getElementById('pageInfo').textContent = `Page ${currentPage + 1} of ${totalPages}`;
    document.getElementById('totalInfo').textContent = `Showing ${startIdx + 1}-${endIdx} of ${artifacts.length}`;
    document.getElementById('prevBtn').disabled = currentPage === 0;
    document.getElementById('nextBtn').disabled = currentPage >= totalPages - 1;

    // Add click handlers to author tags for filtering
    document.querySelectorAll('.author-tag').forEach(tag => {
      tag.addEventListener('click', function(e) {
        // Check if it's a genuine click on the tag itself (for filtering)
        // Links will handle navigation themselves
        if (e.target.tagName === 'A') {
          return; // Let the link handle navigation
        }
        e.preventDefault();
        e.stopPropagation();
        const author = this.dataset.author;
        document.getElementById('search-box').value = author;
        filterArtifacts(author);
      });
    });

    // Add click handlers to column headers
    document.querySelectorAll('#citations-table th[data-col]').forEach(th => {
      th.addEventListener('click', function() {
        const col = this.dataset.col;
        if (sortColumn === col) {
          sortDesc = !sortDesc;
        } else {
          sortColumn = col;
          sortDesc = true;
        }
        sortAndRender();
        updateHeaderStyles();
      });
    });

    updateHeaderStyles();
  }

  function updateHeaderStyles() {
    document.querySelectorAll('#citations-table th').forEach(th => {
      th.classList.remove('sort-asc', 'sort-desc');
      if (th.dataset.col === sortColumn) {
        th.classList.add(sortDesc ? 'sort-desc' : 'sort-asc');
      }
    });
  }

  function sortAndRender() {
    filteredArtifacts.sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      // Handle numeric columns
      if (sortColumn === 'citations' || sortColumn === 'year') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }

      if (aVal < bVal) return sortDesc ? 1 : -1;
      if (aVal > bVal) return sortDesc ? -1 : 1;
      return 0;
    });

    renderTable(filteredArtifacts);
  }

  function filterArtifacts(query) {
    if (!query) {
      filteredArtifacts = allArtifacts.slice();
    } else {
      const q = query.toLowerCase();
      filteredArtifacts = allArtifacts.filter(art => {
        const titleMatch = (art.title || '').toLowerCase().includes(q);
        const confMatch = (art.conference || '').toLowerCase().includes(q);
        const authorsMatch = (art.authors || []).some(a => a.toLowerCase().includes(q));
        const instMatch = (art.institutions || []).some(i => i.toLowerCase().includes(q));
        return titleMatch || confMatch || authorsMatch || instMatch;
      });
    }

    // Update filter info
    if (query) {
      document.getElementById('filter-info').textContent = `Showing ${filteredArtifacts.length} of ${allArtifacts.length}`;
    } else {
      document.getElementById('filter-info').textContent = '';
    }

    // Reset to first page when filtering
    currentPage = 0;
    sortColumn = 'citations';
    sortDesc = true;
    sortAndRender();
  }

  // Search box listener
  document.getElementById('search-box').addEventListener('input', function() {
    filterArtifacts(this.value);
  });

  // Pagination listeners
  document.getElementById('prevBtn').addEventListener('click', function() {
    if (currentPage > 0) {
      currentPage--;
      renderTable(filteredArtifacts);
    }
  });

  document.getElementById('nextBtn').addEventListener('click', function() {
    const totalPages = Math.ceil(filteredArtifacts.length / pageSize);
    if (currentPage < totalPages - 1) {
      currentPage++;
      renderTable(filteredArtifacts);
    }
  });

  // Load data
  fetch(DATA_URL)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status} - data not yet available`);
      return r.json();
    })
    .then(data => {
      allArtifacts = data || [];
      
      if (allArtifacts.length === 0) {
        document.getElementById('data-status').textContent = '(Data will be populated after the analysis pipeline runs)';
        document.getElementById('total-artifacts').textContent = '0';
        document.getElementById('table-container').innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No artifacts with citations yet. Run the analysis pipeline to generate citation data.</p>';
      } else {
        document.getElementById('total-artifacts').textContent = allArtifacts.length;
        // Initial sort by citations descending
        sortColumn = 'citations';
        sortDesc = true;
        filterArtifacts('');
      }
    })
    .catch(err => {
      console.error('Error loading citation data:', err);
      document.getElementById('data-status').textContent = '(data loading disabled)';
      document.getElementById('total-artifacts').textContent = '0';
      document.getElementById('table-container').innerHTML = 
        `<p style="text-align:center;color:#666;padding:40px;">
          <strong>Citation data not yet available</strong><br>
          <small>The analysis pipeline needs to run to generate artifact citation metrics from OpenAlex.</small>
        </p>`;
    });
})();
</script>
