---
title: "Systems: Repository Statistics"
permalink: /systems/repo_stats.html
top_repos_url: /assets/data/systems_top_repos.json
yearly_chart_url: /assets/data/repo_stats_yearly.json
yearly_chart_area: systems
---

GitHub stars and forks for artifact repositories from systems conferences ({{ site.data.summary.systems_conferences | join: ", " }}).

{% if site.data.repo_stats.by_conference.size > 0 %}

## By Conference

| Conference | GitHub Repos | Total Stars | Avg Stars | Total Forks | Avg Forks | Max Stars |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
{% for c in site.data.repo_stats.by_conference %}{% assign _is_sys = false %}{% for conf in site.data.artifacts_by_conference %}{% if conf.name == c.name and conf.category == "systems" %}{% assign _is_sys = true %}{% endif %}{% endfor %}{% if _is_sys %}| **{{ c.name }}** | {{ c.github_repos }} | {{ c.total_stars }} | {{ c.avg_stars }} | {{ c.total_forks }} | {{ c.avg_forks }} | {{ c.max_stars }} |
{% endif %}{% endfor %}

## Top Repositories

{% include top_repos_table.html %}

## Average Stars & Forks by Year

{% include repo_yearly_chart.html %}

---

**Data:** [Systems](/assets/data/systems_top_repos.json) | [Yearly Stats](/assets/data/repo_stats_yearly.json)

{% else %}

*Repository statistics have not been collected yet. Run the pipeline with `generate_repo_stats.py` to populate this data.*

{% endif %}
