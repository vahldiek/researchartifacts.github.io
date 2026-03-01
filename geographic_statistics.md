---
title: Geographic Statistics
layout: page
permalink: /geographic_statistics/
description: Geographic analysis of research artifacts by country and continent
data_url: /assets/data/geographic_statistics.json
---

This page presents geographic (country and continent) statistics for research artifacts, including reproducibility rates, artifact availability metrics, and comparative analysis across regions.

<div id="stats-legend" style="margin:12px 0; padding:8px; background:#f5f5f5; border-radius:4px; font-size:0.9em; display:none;">
  <strong>Legend:</strong>
  <ul style="margin:4px 0 0 20px; padding:0;">
    <li><strong>Reproducibility</strong>: % of artifacts marked as Reproduced</li>
    <li><strong>Functionality</strong>: % of artifacts marked as Functional</li>
    <li><strong>Artifact Rate</strong>: % of papers with available artifacts</li>
    <li><strong>Papers with Artifacts</strong>: Estimated count from artifact rate</li>
  </ul>
</div>

## By Continent

<div id="continent-controls" style="margin-bottom:12px;">
  <input type="text" id="continentFilter" placeholder="Filter continents..." style="padding:6px; width:250px;">
  <button id="toggleLegend" style="padding:6px 12px; margin-left:8px; cursor:pointer;">Show Legend</button>
</div>

<table id="continentTable" style="width:100%; border-collapse:collapse; margin-bottom:24px;">
<thead style="background:#f0f0f0;">
<tr>
  <th style="border:1px solid #ddd; padding:8px; text-align:left;">Continent</th>
  <th style="border:1px solid #ddd; padding:8px; text-align:center;">Countries</th>
  <th style="border:1px solid #ddd; padding:8px; text-align:center;">Institutions</th>
  <th style="border:1px solid #ddd; padding:8px; text-align:center;">Authors</th>
  <th style="border:1px solid #ddd; padding:8px; text-align:center;">Artifacts</th>
  <th style="border:1px solid #ddd; padding:8px; text-align:center;">Papers</th>
  <th style="border:1px solid #ddd; padding:8px; text-align:center;">Reproducibility (Median)</th>
  <th style="border:1px solid #ddd; padding:8px; text-align:center;">Functionality (Median)</th>
  <th style="border:1px solid #ddd; padding:8px; text-align:center;">Artifact Rate (Median)</th>
</tr>
</thead>
<tbody id="continentBody">
<tr><td colspan="9" style="text-align:center; padding:20px; color:#999;">Loading data...</td></tr>
</tbody>
</table>

## By Country

<div id="country-controls" style="margin-bottom:12px;">
  <input type="text" id="countryFilter" placeholder="Filter countries..." style="padding:6px; width:250px;">
  <select id="sortBy" style="padding:6px; margin-left:8px;">
    <option value="artifacts">Sort by Artifacts</option>
    <option value="repro">Sort by Reproducibility</option>
    <option value="authors">Sort by Authors</option>
    <option value="papers">Sort by Papers</option>
  </select>
</div>

<table id="countryTable" style="width:100%; border-collapse:collapse;">
<thead style="background:#f0f0f0;">
<tr>
  <th style="border:1px solid #ddd; padding:8px; text-align:left;">Country</th>
  <th style="border:1px solid #ddd; padding:8px; text-align:left;">Continent</th>
  <th style="border:1px solid #ddd; padding:8px; text-align:center;">Institutions</th>
  <th style="border:1px solid #ddd; padding:8px; text-align:center;">Authors</th>
  <th style="border:1px solid #ddd; padding:8px; text-align:center;">Artifacts</th>
  <th style="border:1px solid #ddd; padding:8px; text-align:center;">Papers</th>
  <th style="border:1px solid #ddd; padding:8px; text-align:center;">Papers w/ Artifacts</th>
  <th style="border:1px solid #ddd; padding:8px; text-align:center;">Repro % (Med/Mean)</th>
  <th style="border:1px solid #ddd; padding:8px; text-align:center;">Top 50%</th>
</tr>
</thead>
<tbody id="countryBody">
<tr><td colspan="9" style="text-align:center; padding:20px; color:#999;">Loading data...</td></tr>
</tbody>
</table>

<script>
(function() {
  var dataUrl = '{{ page.data_url | relative_url }}';
  var data = null;
  var continents = [];
  var countries = [];
  
  function formatPercent(val) {
    return val !== undefined && val !== null ? val.toFixed(1) + '%' : 'N/A';
  }
  
  function loadData() {
    fetch(dataUrl)
      .then(r => r.json())
      .then(d => {
        data = d;
        
        // Get sorted data
        continents = Object.keys(data.by_continent || {}).sort();
        countries = Object.keys(data.by_country || {}).sort();
        
        renderContinents();
        renderCountries();
        
        document.getElementById('stats-legend').style.display = '';
      })
      .catch(e => {
        console.error('Error loading data:', e);
        document.getElementById('continentBody').innerHTML = 
          '<tr><td colspan="9" style="text-align:center; padding:20px; color:#d00;">Error loading data</td></tr>';
        document.getElementById('countryBody').innerHTML = 
          '<tr><td colspan="9" style="text-align:center; padding:20px; color:#d00;">Error loading data</td></tr>';
      });
  }
  
  function renderContinents() {
    var tbody = document.getElementById('continentBody');
    var filter = document.getElementById('continentFilter').value.toLowerCase();
    
    var rows = continents
      .filter(c => c.toLowerCase().includes(filter))
      .map(c => {
        var d = data.by_continent[c];
        return '<tr style="' + (continents.indexOf(c) % 2 === 0 ? 'background:#fafafa;' : '') + '">' +
          '<td style="border:1px solid #ddd; padding:8px;">' + c + '</td>' +
          '<td style="border:1px solid #ddd; padding:8px; text-align:center;">' + d.num_countries + '</td>' +
          '<td style="border:1px solid #ddd; padding:8px; text-align:center;">' + d.num_institutions + '</td>' +
          '<td style="border:1px solid #ddd; padding:8px; text-align:center;">' + d.num_authors + '</td>' +
          '<td style="border:1px solid #ddd; padding:8px; text-align:center;">' + d.num_artifacts + '</td>' +
          '<td style="border:1px solid #ddd; padding:8px; text-align:center;">' + d.num_papers + '</td>' +
          '<td style="border:1px solid #ddd; padding:8px; text-align:center;">' + 
            formatPercent(d.reproducibility.median) + ' / ' + 
            formatPercent(d.reproducibility.mean) + '</td>' +
          '<td style="border:1px solid #ddd; padding:8px; text-align:center;">' + 
            formatPercent(d.functionality.median) + '</td>' +
          '<td style="border:1px solid #ddd; padding:8px; text-align:center;">' + 
            formatPercent(d.artifact_availability.median) + '</td>' +
          '</tr>';
      });
    
    tbody.innerHTML = rows.length > 0 ? rows.join('') : 
      '<tr><td colspan="9" style="text-align:center; padding:12px; color:#999;">No results</td></tr>';
  }
  
  function renderCountries() {
    var tbody = document.getElementById('countryBody');
    var filter = document.getElementById('countryFilter').value.toLowerCase();
    var sortBy = document.getElementById('sortBy').value;
    
    var sorted = countries
      .filter(c => c.toLowerCase().includes(filter))
      .sort((a, b) => {
        var da = data.by_country[a];
        var db = data.by_country[b];
        
        if (sortBy === 'artifacts') return db.num_artifacts - da.num_artifacts;
        if (sortBy === 'repro') return db.reproducibility.median - da.reproducibility.median;
        if (sortBy === 'authors') return db.num_authors - da.num_authors;
        if (sortBy === 'papers') return db.num_papers - da.num_papers;
        return 0;
      });
    
    var rows = sorted.map((c, idx) => {
      var d = data.by_country[c];
      var repro = d.reproducibility;
      return '<tr style="' + (idx % 2 === 0 ? 'background:#fafafa;' : '') + '">' +
        '<td style="border:1px solid #ddd; padding:8px; font-weight:bold;">' + c + '</td>' +
        '<td style="border:1px solid #ddd; padding:8px;">' + d.continent + '</td>' +
        '<td style="border:1px solid #ddd; padding:8px; text-align:center;">' + d.num_institutions + '</td>' +
        '<td style="border:1px solid #ddd; padding:8px; text-align:center;">' + d.num_authors + '</td>' +
        '<td style="border:1px solid #ddd; padding:8px; text-align:center;">' + d.num_artifacts + '</td>' +
        '<td style="border:1px solid #ddd; padding:8px; text-align:center;">' + d.num_papers + '</td>' +
        '<td style="border:1px solid #ddd; padding:8px; text-align:center;">' + d.papers_with_artifacts + '</td>' +
        '<td style="border:1px solid #ddd; padding:8px; text-align:center;">' + 
          formatPercent(repro.median) + ' / ' + formatPercent(repro.mean) + '</td>' +
        '<td style="border:1px solid #ddd; padding:8px; text-align:center;">' + 
          repro.institutions_in_top_50 + '</td>' +
        '</tr>';
    });
    
    tbody.innerHTML = rows.length > 0 ? rows.join('') : 
      '<tr><td colspan="9" style="text-align:center; padding:12px; color:#999;">No results</td></tr>';
  }
  
  document.getElementById('continentFilter').addEventListener('input', renderContinents);
  document.getElementById('countryFilter').addEventListener('input', renderCountries);
  document.getElementById('sortBy').addEventListener('change', renderCountries);
  
  document.getElementById('toggleLegend').addEventListener('click', function() {
    var legend = document.getElementById('stats-legend');
    var ul = legend.querySelector('ul');
    if (ul.style.display === 'none') {
      ul.style.display = '';
      this.textContent = 'Hide Legend';
    } else {
      ul.style.display = 'none';
      this.textContent = 'Show Legend';
    }
  });
  
  loadData();
})();
</script>

---

## Insights & Observations

**Top Regions by Artifact Contributions:**
- **North America** leads with 1,396 artifacts and 731 authors
- **Asia** follows with 867 artifacts from 75 institutions across 8 countries
- **Europe** has 409 artifacts from 65 institutions across 12 countries

**Reproducibility Leaders:**
- Several countries achieve 100% median reproducibility (Denmark, France, India, Japan, Mexico)
- China (CN) demonstrates high reproducibility at 82.9% with 572 artifacts
- US maintains strong participation with 1,311 artifacts at 73% reproducibility

**Geographic Diversity:**
- 25 countries represented across 5 continents
- Smallest: Oceania (1 country) and South America (1 country)
- Largest: Europe (12 countries) and Asia (8 countries)

---
