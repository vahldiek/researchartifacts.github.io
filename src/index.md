---
title: ""
---

<link rel="stylesheet" href="{{ '/assets/css/reprodb-profile.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/reprodb-search.css' | relative_url }}">

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

<div id="profileCards" style="display:none; max-width:720px; margin:0 auto 16px;"></div>

<div id="results-container">
  <div id="resultsList" style="display:none;"></div>
  <div id="noResults" style="display:none; padding:16px; text-align:center; color:#999;">No artifacts found matching your search.</div>
</div>

<div id="pagination" style="margin-top:12px; text-align:center; display:none;">
  <button id="prevBtn" onclick="changePage(-1)" style="padding:6px 16px; margin:0 4px; border:1px solid #ccc; border-radius:4px; background:#fff; cursor:pointer;">← Prev</button>
  <span id="pageInfo" style="margin:0 10px; font-size:0.95em;"></span>
  <button id="nextBtn" onclick="changePage(1)" style="padding:6px 16px; margin:0 4px; border:1px solid #ccc; border-radius:4px; background:#fff; cursor:pointer;">Next →</button>
</div>

<div id="search-data-urls" style="display:none"
  data-base-url='{{ "" | relative_url }}'
  data-availability='{{ "/assets/data/artifact_availability.json" | relative_url }}'
  data-author-profiles='{{ "/assets/data/author_profiles.json" | relative_url }}'
  data-institutions='{{ "/assets/data/institution_rankings.json" | relative_url }}'
  data-search-data='{{ "/assets/data/search_data.json" | relative_url }}'
></div>
<script src="{{ '/assets/js/reprodb-search.js' | relative_url }}"></script>

