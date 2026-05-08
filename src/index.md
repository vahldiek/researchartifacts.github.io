---
title: ""
skip_chartjs: true
---

<link rel="stylesheet" href="{{ '/assets/css/reprodb-profile.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/reprodb-search.css' | relative_url }}">

**Research artifacts & artifact evaluation (AE)** drive reproducibility and scientific impact. This project analyzes and makes accessible artifact evaluation outcomes across major [security]({{ '/security/' | relative_url }}) and [systems]({{ '/systems/' | relative_url }}) conferences, recognizing the contributions of both artifact authors and artifact evaluation committees.

<div id="search-container">
  <div class="rdb-search-box-wrap">
    <input id="searchBox" type="text" placeholder="Search artifacts by title, author, affiliation, or venue…"
      autocomplete="off">
    <svg id="searchIcon" class="rdb-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <svg id="clearIcon" class="rdb-hidden" onclick="clearSearch()" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  </div>
  <div id="filters">
    <select id="yearFilter">
      <option value="">All Years</option>
    </select>
    <select id="venueFilter">
      <option value="">All Venues</option>
    </select>
    <span class="rdb-area-checks">
      <label><input type="checkbox" class="areaCheck" value="systems" checked> Systems</label>
      <label><input type="checkbox" class="areaCheck" value="security" checked> Security</label>
    </span>
  </div>
  <div id="searchStatus">Loading artifact data…</div>
  <button id="downloadBtn" class="rdb-search-action-btn rdb-hidden" onclick="downloadResults()">⬇ Download JSON</button>
  <button id="shareBtn" class="rdb-search-action-btn rdb-hidden" onclick="shareSearch()">🔗 Share</button>
</div>

<div id="sort-controls" class="rdb-hidden">
  Sort by:
  <a href="#" onclick="sortResults('year'); return false;">Year</a> ·
  <a href="#" onclick="sortResults('title'); return false;">Title</a> ·
  <a href="#" onclick="sortResults('venue'); return false;">Venue</a>
</div>

<div id="profileCards" class="rdb-hidden"></div>

<div id="results-container">
  <div id="resultsList" class="rdb-hidden"></div>
  <div id="noResults" class="rdb-hidden">No artifacts found matching your search.</div>
</div>

<div id="pagination" class="rdb-hidden">
  <button id="prevBtn" onclick="changePage(-1)">← Prev</button>
  <span id="pageInfo"></span>
  <button id="nextBtn" onclick="changePage(1)">Next →</button>
</div>

<div id="search-data-urls"
  data-base-url='{{ "" | relative_url }}'
  data-availability='{{ "/assets/data/artifact_availability.json" | relative_url }}'
  data-author-profiles='{{ "/assets/data/author_profiles.json" | relative_url }}'
  data-institutions='{{ "/assets/data/institution_rankings.json" | relative_url }}'
  data-search-data='{{ "/assets/data/search_data.json" | relative_url }}'
></div>
<script src="{{ '/assets/js/reprodb-search.js' | relative_url }}"></script>

