---
title: "Security: Repository Statistics"
permalink: /security/repo_stats.html
top_repos_url: /assets/data/security_top_repos.json
yearly_chart_url: /assets/data/repo_stats_yearly.json
yearly_chart_area: security
---

GitHub stars and forks for artifact repositories from security conferences ({{ site.data.summary.security_conferences | join: ", " }}).

{% if site.data.repo_stats.by_conference.size > 0 %}

{% assign _sec_repos = 0 %}{% assign _sec_stars = 0 %}{% assign _sec_forks = 0 %}{% assign _sec_max = 0 %}{% for c in site.data.repo_stats.by_conference %}{% assign _is_sec = false %}{% for conf in site.data.artifacts_by_conference %}{% if conf.name == c.name and conf.category == "security" %}{% assign _is_sec = true %}{% endif %}{% endfor %}{% if _is_sec %}{% assign _sec_repos = _sec_repos | plus: c.github_repos %}{% assign _sec_stars = _sec_stars | plus: c.total_stars %}{% assign _sec_forks = _sec_forks | plus: c.total_forks %}{% if c.max_stars > _sec_max %}{% assign _sec_max = c.max_stars %}{% endif %}{% endif %}{% endfor %}

<div class="rdb-cards">
  <div class="rdb-card">
    <div class="rdb-card-value">{{ _sec_repos }}</div>
    <div class="rdb-card-label">GitHub Repos</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ _sec_stars }}</div>
    <div class="rdb-card-label">Total Stars</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ _sec_forks }}</div>
    <div class="rdb-card-label">Total Forks</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ _sec_max }}</div>
    <div class="rdb-card-label">Max Stars</div>
  </div>
</div>

## By Conference

{% include repo_stats_summary_table.html type="conference" category="security" %}

## Top Repositories

{% include top_repos_table.html %}

## Median Stars & Forks by Year

{% include repo_yearly_chart.html %}

---

**Data:** [Security]({{ '/assets/data/security_top_repos.json' | relative_url }}) | [Yearly Stats]({{ '/assets/data/repo_stats_yearly.json' | relative_url }})

{% else %}

*Repository statistics have not been collected yet. Run the pipeline with `generate_repo_stats.py` to populate this data.*

{% endif %}
