---
title: "Systems: Repository Statistics"
permalink: /systems/repo_stats.html
---

GitHub stars and forks for artifact repositories from systems conferences ({{ site.data.summary.systems_conferences | join: ", " }}).

{% if site.data.repo_stats.by_conference.size > 0 %}

## By Conference

| Conference | GitHub Repos | Total Stars | Avg Stars | Total Forks | Avg Forks | Max Stars |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
{% for c in site.data.repo_stats.by_conference %}{% assign _is_sys = false %}{% for conf in site.data.artifacts_by_conference %}{% if conf.name == c.name and conf.category == "systems" %}{% assign _is_sys = true %}{% endif %}{% endfor %}{% if _is_sys %}| **{{ c.name }}** | {{ c.github_repos }} | {{ c.total_stars }} | {{ c.avg_stars }} | {{ c.total_forks }} | {{ c.avg_forks }} | {{ c.max_stars }} |
{% endif %}{% endfor %}

<div style="width:100%; max-width:400px; margin:1em 0;">
<canvas id="sysRepoChart" height="200"></canvas>
</div>

{% else %}

*Repository statistics have not been collected yet. Run the pipeline with `generate_repo_stats.py` to populate this data.*

{% endif %}

{% if site.data.repo_stats.by_conference.size > 0 %}
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  var confNames = [];
  var confStars = [];
  var confForks = [];
  {% for c in site.data.repo_stats.by_conference %}{% assign _is_sys = false %}{% for conf in site.data.artifacts_by_conference %}{% if conf.name == c.name and conf.category == "systems" %}{% assign _is_sys = true %}{% endif %}{% endfor %}{% if _is_sys %}
  confNames.push("{{ c.name }}"); confStars.push({{ c.avg_stars }}); confForks.push({{ c.avg_forks }});
  {% endif %}{% endfor %}

  new Chart(document.getElementById('sysRepoChart'), {
    type: 'bar',
    data: {
      labels: confNames,
      datasets: [
        { label: 'Avg Stars', data: confStars, backgroundColor: 'rgba(41,128,185,0.7)' },
        { label: 'Avg Forks', data: confForks, backgroundColor: 'rgba(26,188,156,0.7)' }
      ]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Systems: Average Stars & Forks by Conference' } },
      scales: { y: { beginAtZero: true } }
    }
  });
});
</script>
{% endif %}

<style>
table { font-size: 0.85em; white-space: nowrap; border-collapse: collapse; }
table th, table td { padding: 4px 8px; border: 1px solid #ddd; }
table th { background-color: #f2f2f2; }
table tr:nth-child(even) { background-color: #f9f9f9; }
table tr:hover { background-color: #e8f4f8; }
</style>
