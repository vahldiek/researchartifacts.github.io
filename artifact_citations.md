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
  margin: 12px 0;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
.search-box {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9em;
  flex: 1;
  min-width: 250px;
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
.stats-box {
  background: #f9f9f9;
  border: 1px solid #ddd;
  padding: 8px 15px;
  border-radius: 4px;
  margin-bottom: 15px;
}
.stats-box p {
  margin: 0;
  font-size: 0.95em;
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

<h2>Artifact Citations Ranking</h2>

<div class="stats-box">
  <p><strong id="total-artifacts">Loading...</strong> artifacts with citations</p>
  <p>Showing artifacts that have been cited by other research papers (via DOI). <em id="data-status"></em></p>
</div>

<div class="controls">
  <input type="text" id="search-box" class="search-box" placeholder="Search by artifact title, author, or institution...">
  <span class="filter-info" id="filter-info"></span>
</div>

<div id="table-container">
  <div class="loading">Loading artifact citations...</div>
</div>

<script>
(function() {
  const DATA_URL = '{{ "/assets/data/cited_artifacts_list.json" | relative_url }}';
  let allArtifacts = [];
  let filteredArtifacts = [];
  let sortColumn = null;
  let sortDesc = true;

  function escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function renderTable(artifacts) {
    if (artifacts.length === 0) {
      document.getElementById('table-container').innerHTML = '<p style="text-align:center;color:#999;">No artifacts found</p>';
      return;
    }

    let html = '<table id="citations-table"><thead><tr>' +
      '<th data-col="citations" style="width:80px;">Citations</th>' +
      '<th data-col="title">Artifact Title</th>' +
      '<th data-col="conference" style="width:100px;">Venue</th>' +
      '<th data-col="year" style="width:70px;">Year</th>' +
      '<th data-col="authors">Authors</th>' +
      '<th data-col="institutions">Institutions</th>' +
      '</tr></thead><tbody>';

    for (let i = 0; i < artifacts.length; i++) {
      const art = artifacts[i];
      const authorsHtml = (art.authors || []).map(a => 
        `<span class="author-tag" data-author="${escHtml(a)}">${escHtml(a)}</span>`
      ).join('');
      const institutionsHtml = (art.institutions || []).map(inst => 
        `<span class="institution-tag">${escHtml(inst)}</span>`
      ).join('');

      html += '<tr>' +
        `<td class="citations-count">${art.cited_by_count || 0}</td>` +
        `<td><strong>${escHtml(art.title)}</strong></td>` +
        `<td>${escHtml(art.conference || '')}</td>` +
        `<td>${art.year || ''}</td>` +
        `<td>${authorsHtml || '<em style="color:#999;">Unknown</em>'}</td>` +
        `<td>${institutionsHtml || '<em style="color:#999;">Unknown</em>'}</td>` +
        '</tr>';
    }

    html += '</tbody></table>';
    document.getElementById('table-container').innerHTML = html;

    // Add click handlers to author tags
    document.querySelectorAll('.author-tag').forEach(tag => {
      tag.addEventListener('click', function(e) {
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
      document.getElementById('filter-info').textContent = `Showing ${filteredArtifacts.length} of ${allArtifacts.length} artifacts`;
    } else {
      document.getElementById('filter-info').textContent = '';
    }

    sortColumn = 'citations';
    sortDesc = true;
    sortAndRender();
  }

  // Search box listener
  document.getElementById('search-box').addEventListener('input', function() {
    filterArtifacts(this.value);
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
