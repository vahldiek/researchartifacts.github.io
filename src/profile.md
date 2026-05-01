---
title: "Profile"
permalink: /profile.html
layout: default
---

{% include profile_common.html %}



<div class="rdb-search-box-wrap">
  <input type="text" id="profile-search-box" class="profile-search-box" placeholder="Search for an author or institution..." autocomplete="off">
  <ul id="search-results" class="profile-search-results rdb-hidden"></ul>
</div>

<div id="loading-msg" class="profile-loading">Loading profile data…</div>

<!-- ═══════════════ AUTHOR PROFILE SECTION ═══════════════ -->
<div id="author-profile" class="profile-container rdb-hidden">
  <div class="profile-header">
    <h2 id="prof-name"></h2><span id="share-btn" class="share-btn rdb-hidden" title="Copy link to this profile">&#128279; Share<span class="share-tip">Link copied!</span></span>
    <div class="affil" id="prof-affil"></div>
  </div>

  <div class="score-cards" id="score-cards"></div>

  <div id="chart-section" class="rdb-hidden">
    <h3>Contributions Over Time</h3>
    <div class="chart-container"><canvas id="timelineChart"></canvas></div>
  </div>

  <div id="papers-section" class="rdb-hidden">
    <h3>Artifact Papers</h3>
    <table class="profile-table">
      <thead><tr><th>#</th><th>Title</th><th>Conference</th><th>Year</th><th>Badges</th></tr></thead>
      <tbody id="papers-body"></tbody>
    </table>
  </div>

  <div id="ae-section" class="rdb-hidden">
    <h3>AE Committee Service</h3>
    <div id="ae-summary"></div>
    <table class="ae-table rdb-hidden" id="ae-table">
      <thead><tr><th>Conference</th><th>Year</th><th>Role</th></tr></thead>
      <tbody id="ae-body"></tbody>
    </table>
  </div>

  <div id="citations-section" class="rdb-hidden">
    <h3>Cited Artifacts</h3>
    <p id="citations-summary"></p>
    <table class="profile-table" id="citations-table">
      <thead><tr><th>#</th><th>Artifact Title</th><th>Conference</th><th>Year</th><th>Citations</th></tr></thead>
      <tbody id="citations-body"></tbody>
    </table>
  </div>

  <div id="author-history-section" class="rdb-hidden">
    <details class="ranking-history-details">
      <summary><h3>Ranking History</h3></summary>
      <div class="chart-container"><canvas id="authorHistoryChart"></canvas></div>
    </details>
  </div>
</div>

<!-- ═══════════════ INSTITUTION PROFILE SECTION ═══════════════ -->
<div id="inst-profile" class="profile-container rdb-hidden">
  <div class="profile-header">
    <h2 id="inst-name"></h2><span id="inst-share-btn" class="share-btn rdb-hidden" title="Copy link to this profile">&#128279; Share<span class="share-tip">Link copied!</span></span>
  </div>

  <div class="score-cards" id="inst-score-cards"></div>

  <div id="inst-contributors-section" class="rdb-hidden">
    <h3>Top Contributors</h3>
    <table class="inst-table" id="contributors-table">
      <thead><tr>
        <th data-col="rank">#</th>
        <th data-col="name">Researcher</th>
        <th data-col="combined_score">Score</th>
        <th data-col="artifact_score">Artifact</th>
        <th data-col="ae_score">AE</th>
        <th data-col="artifacts">Artifacts</th>
        <th data-col="total_papers">Papers</th>
        <th data-col="ae_memberships">AE Svc</th>
        <th data-col="chair_count">Chair</th>
      </tr></thead>
      <tbody id="contributors-body"></tbody>
    </table>
    <div class="pag-controls">
      <button id="contrib-prev">&laquo; Prev</button>
      <span id="contrib-info"></span>
      <button id="contrib-next">Next &raquo;</button>
    </div>
  </div>

  <div id="inst-artifacts-section" class="rdb-hidden">
    <h3>Artifact Papers</h3>
    <table class="inst-table" id="artifacts-table">
      <thead><tr>
        <th>#</th>
        <th>Title</th>
        <th>Authors</th>
        <th>Conference</th>
        <th>Year</th>
        <th>Badges</th>
      </tr></thead>
      <tbody id="artifacts-body"></tbody>
    </table>
    <div class="pag-controls">
      <button id="art-prev">&laquo; Prev</button>
      <span id="art-info"></span>
      <button id="art-next">Next &raquo;</button>
    </div>
  </div>

  <div id="inst-ae-section" class="rdb-hidden">
    <h3>AE Committee Involvement</h3>
    <div id="ae-summary-text"></div>
    <table class="inst-table" id="ae-detail-table">
      <thead><tr>
        <th>Researcher</th>
        <th>Conference</th>
        <th>Year</th>
        <th>Role</th>
      </tr></thead>
      <tbody id="ae-detail-body"></tbody>
    </table>
    <div class="pag-controls">
      <button id="ae-prev">&laquo; Prev</button>
      <span id="ae-info"></span>
      <button id="ae-next">Next &raquo;</button>
    </div>
  </div>

  <div id="inst-history-section" class="rdb-hidden">
    <details class="ranking-history-details">
      <summary><h3>Ranking History</h3></summary>
      <div class="chart-container"><canvas id="instHistoryChart"></canvas></div>
    </details>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<div id="profile-data-urls" class="rdb-hidden"
  data-base-url='{{ "" | relative_url }}'
  data-author-profiles='{{ "/assets/data/author_profiles.json" | relative_url }}'
  data-cited-artifacts='{{ "/assets/data/cited_artifacts_by_author.json" | relative_url }}'
  data-author-history='{{ "/assets/data/ranking_history.json" | relative_url }}'
  data-artifacts='{{ "/assets/data/artifacts.json" | relative_url }}'
  data-papers='{{ "/assets/data/papers.json" | relative_url }}'
  data-availability='{{ "/assets/data/artifact_availability.json" | relative_url }}'
  data-institutions='{{ "/assets/data/institution_rankings.json" | relative_url }}'
  data-inst-history='{{ "/assets/data/institution_ranking_history.json" | relative_url }}'
></div>
<script src="{{ '/assets/js/reprodb-profile-page.js' | relative_url }}"></script>
