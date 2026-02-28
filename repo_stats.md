---
title: "Repository Statistics"
permalink: /repo_stats.html
top_repos_url: /assets/data/top_repos.json
yearly_chart_url: /assets/data/repo_stats_yearly.json
yearly_chart_area: all
---

GitHub stars and forks for artifact repositories across all tracked conferences.

{% if site.data.repo_stats.overall %}

| | |
|---|---|
| **GitHub Repos** | {{ site.data.repo_stats.overall.github_repos }} |
| **Total Stars** | {{ site.data.repo_stats.overall.total_stars }} |
| **Avg Stars** | {{ site.data.repo_stats.overall.avg_stars }} |
| **Max Stars** | {{ site.data.repo_stats.overall.max_stars }} |
| **Total Forks** | {{ site.data.repo_stats.overall.total_forks }} |
| **Avg Forks** | {{ site.data.repo_stats.overall.avg_forks }} |

{% endif %}

{% if site.data.repo_stats.by_conference.size > 0 %}

## By Area

| Area | GitHub Repos | Total Stars | Avg Stars | Total Forks | Avg Forks | Max Stars |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
{% assign sys_repos = 0 %}{% assign sys_stars = 0 %}{% assign sys_forks = 0 %}{% assign sys_max = 0 %}{% for c in site.data.repo_stats.by_conference %}{% assign _is_sys = false %}{% for conf in site.data.artifacts_by_conference %}{% if conf.name == c.name and conf.category == "systems" %}{% assign _is_sys = true %}{% endif %}{% endfor %}{% if _is_sys %}{% assign sys_repos = sys_repos | plus: c.github_repos %}{% assign sys_stars = sys_stars | plus: c.total_stars %}{% assign sys_forks = sys_forks | plus: c.total_forks %}{% if c.max_stars > sys_max %}{% assign sys_max = c.max_stars %}{% endif %}{% endif %}{% endfor %}{% if sys_repos > 0 %}| **[Systems]({{ '/systems/repo_stats.html' | relative_url }})** | {{ sys_repos }} | {{ sys_stars }} | {{ sys_stars | divided_by: sys_repos }} | {{ sys_forks }} | {{ sys_forks | divided_by: sys_repos }} | {{ sys_max }} |
{% endif %}{% assign sec_repos = 0 %}{% assign sec_stars = 0 %}{% assign sec_forks = 0 %}{% assign sec_max = 0 %}{% for c in site.data.repo_stats.by_conference %}{% assign _is_sec = false %}{% for conf in site.data.artifacts_by_conference %}{% if conf.name == c.name and conf.category == "security" %}{% assign _is_sec = true %}{% endif %}{% endfor %}{% if _is_sec %}{% assign sec_repos = sec_repos | plus: c.github_repos %}{% assign sec_stars = sec_stars | plus: c.total_stars %}{% assign sec_forks = sec_forks | plus: c.total_forks %}{% if c.max_stars > sec_max %}{% assign sec_max = c.max_stars %}{% endif %}{% endif %}{% endfor %}{% if sec_repos > 0 %}| **[Security]({{ '/security/repo_stats.html' | relative_url }})** | {{ sec_repos }} | {{ sec_stars }} | {{ sec_stars | divided_by: sec_repos }} | {{ sec_forks }} | {{ sec_forks | divided_by: sec_repos }} | {{ sec_max }} |
{% endif %}

## Top Repositories

{% include top_repos_table.html %}

## Average Stars & Forks by Year

{% include repo_yearly_chart.html %}

{% else %}

*Repository statistics have not been collected yet. Run the pipeline with `generate_repo_stats.py` to populate this data.*

{% endif %}
