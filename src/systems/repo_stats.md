---
title: "Systems: Repository Statistics"
permalink: /systems/repo_stats.html
top_repos_url: /assets/data/systems_top_repos.json
yearly_chart_url: /assets/data/repo_stats_yearly.json
yearly_chart_area: systems
---

GitHub stars and forks for artifact repositories from systems conferences ({{ site.data.summary.systems_conferences | join: ", " }}).

{% if site.data.repo_stats.by_conference.size > 0 %}

{% assign _sys_repos = 0 %}{% assign _sys_stars = 0 %}{% assign _sys_forks = 0 %}{% assign _sys_max = 0 %}{% for c in site.data.repo_stats.by_conference %}{% assign _is_sys = false %}{% for conf in site.data.artifacts_by_conference %}{% if conf.name == c.name and conf.category == "systems" %}{% assign _is_sys = true %}{% endif %}{% endfor %}{% if _is_sys %}{% assign _sys_repos = _sys_repos | plus: c.github_repos %}{% assign _sys_stars = _sys_stars | plus: c.total_stars %}{% assign _sys_forks = _sys_forks | plus: c.total_forks %}{% if c.max_stars > _sys_max %}{% assign _sys_max = c.max_stars %}{% endif %}{% endif %}{% endfor %}

<div class="rdb-cards">
  <div class="rdb-card">
    <div class="rdb-card-value">{{ _sys_repos }}</div>
    <div class="rdb-card-label">GitHub Repos</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ _sys_stars }}</div>
    <div class="rdb-card-label">Total Stars</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ _sys_forks }}</div>
    <div class="rdb-card-label">Total Forks</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ _sys_max }}</div>
    <div class="rdb-card-label">Max Stars</div>
  </div>
</div>

## By Conference

{% include repo_stats_summary_table.html type="conference" category="systems" %}

## Top Repositories

{% include top_repos_table.html %}

## Median Stars & Forks by Year

{% include repo_yearly_chart.html %}

---

**Data:** [Systems]({{ '/assets/data/systems_top_repos.json' | relative_url }}) | [Yearly Stats]({{ '/assets/data/repo_stats_yearly.json' | relative_url }})

{% else %}

*Repository statistics have not been collected yet. Run the pipeline with `generate_repo_stats.py` to populate this data.*

{% endif %}
