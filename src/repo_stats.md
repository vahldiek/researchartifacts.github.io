---
title: "Repository Statistics"
permalink: /repo_stats.html
top_repos_url: /assets/data/top_repos.json
yearly_chart_url: /assets/data/repo_stats_yearly.json
yearly_chart_area: all
---

GitHub stars and forks for artifact repositories across all tracked conferences.

{% if site.data.repo_stats.overall %}

<div class="rdb-cards">
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.repo_stats.overall.github_repos }}</div>
    <div class="rdb-card-label">GitHub Repos</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.repo_stats.overall.total_stars }}</div>
    <div class="rdb-card-label">Total Stars</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.repo_stats.overall.median_stars }}</div>
    <div class="rdb-card-label">Median Stars</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.repo_stats.overall.total_forks }}</div>
    <div class="rdb-card-label">Total Forks</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.repo_stats.overall.max_stars }}</div>
    <div class="rdb-card-label">Max Stars</div>
  </div>
</div>

{% endif %}

{% if site.data.repo_stats.by_conference.size > 0 %}

## By Area

{% include repo_stats_summary_table.html type="area" %}

## Top Repositories

{% include top_repos_table.html %}

## Median Stars & Forks by Year

{% include repo_yearly_chart.html %}

---

**Data:** [All Conferences]({{ '/assets/data/top_repos.json' | relative_url }}) | [Systems]({{ '/assets/data/systems_top_repos.json' | relative_url }}) | [Security]({{ '/assets/data/security_top_repos.json' | relative_url }}) | [Yearly Stats]({{ '/assets/data/repo_stats_yearly.json' | relative_url }})

{% else %}

*Repository statistics have not been collected yet. Run the pipeline with `generate_repo_stats.py` to populate this data.*

{% endif %}
