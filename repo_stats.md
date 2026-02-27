---
title: "Repository Statistics"
permalink: /repo_stats.html
---

# Repository Statistics

GitHub stars and forks for artifact repositories across all tracked conferences.

{% if site.data.repo_stats.by_conference.size > 0 %}

| Area | Details |
|---|---|
| **Systems** | [View systems repository stats]({{ '/systems/repo_stats.html' | relative_url }}) |
| **Security** | [View security repository stats]({{ '/security/repo_stats.html' | relative_url }}) |

## All Conferences

| Conference | GitHub Repos | Total Stars | Avg Stars | Total Forks | Avg Forks | Max Stars |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
{% for c in site.data.repo_stats.by_conference %}| **{{ c.name }}** | {{ c.github_repos }} | {{ c.total_stars }} | {{ c.avg_stars }} | {{ c.total_forks }} | {{ c.avg_forks }} | {{ c.max_stars }} |
{% endfor %}

{% else %}

*Repository statistics have not been collected yet. Run the pipeline with `generate_repo_stats.py` to populate this data.*

{% endif %}
