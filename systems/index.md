---
title: "Systems Conferences"
permalink: /systems/
---

Artifact evaluation statistics for systems conferences ({{ site.data.summary.systems_conferences | join: ", " }}).

Each cell shows **total (available, functional, reproduced)**.

{% if site.data.artifacts_by_conference %}

## Artifacts per Conference

<div style="width:100%; max-width:400px; margin:1em 0;">
<canvas id="sysConfChart" height="200"></canvas>
</div>

| Conference | Total | {% for y in site.data.artifacts_by_year reversed %}{{ y.year }} | {% endfor %}
|---|:---:|{% for y in site.data.artifacts_by_year reversed %}:---:|{% endfor %}
{% for conf in site.data.artifacts_by_conference %}{% if conf.category == "systems" %}{% assign _conf_url = '/' | append: conf.category | append: '/' | append: conf.name | downcase | append: '.html' %}| [**{{ conf.name }}**]({{ _conf_url | relative_url }}) | {% assign _ct = 0 %}{% assign _ca = 0 %}{% assign _cf = 0 %}{% assign _cr = 0 %}{% for yd in conf.years %}{% assign _ct = _ct | plus: yd.total %}{% assign _ca = _ca | plus: yd.available %}{% assign _cf = _cf | plus: yd.functional %}{% assign _cr = _cr | plus: yd.reproducible %}{% endfor %}**{{ _ct }}** ({{ _ca }}, {{ _cf }}, {{ _cr }}) | {% for y in site.data.artifacts_by_year reversed %}{% assign _found = false %}{% for yd in conf.years %}{% if yd.year == y.year %}{% assign _found = true %}{{ yd.total }} ({{ yd.available }}, {{ yd.functional }}, {{ yd.reproducible }}){% endif %}{% endfor %}{% unless _found %}&ndash;{% endunless %} | {% endfor %}
{% endif %}{% endfor %}

{% else %}

*Statistics data is being generated. Please check back soon.*

{% endif %}


## Top 10 Most Prolific Contributors

Ranked by combined score (artifacts published + AE committee memberships) at systems conferences. See the full [systems combined rankings]({{ '/systems/combined_rankings.html' | relative_url }}) for more.

<table id="sysTop10Table">
<thead><tr><th>#</th><th>Name</th><th>Affiliation</th><th>Artifacts</th><th>AE&nbsp;Memberships</th><th>AE&nbsp;Chair</th><th>Score</th><th>Conferences</th></tr></thead>
<tbody><tr><td colspan="8"><em>Loading…</em></td></tr></tbody>
</table>

<script>
(function(){
  fetch('{{ "/assets/data/systems_combined_rankings.json" | relative_url }}')
    .then(function(r){ return r.json(); })
    .then(function(data){
      data.sort(function(a,b){ return (b.combined_score||0) - (a.combined_score||0); });
      var top = data.slice(0, 10);
      var tbody = document.querySelector('#sysTop10Table tbody');
      tbody.innerHTML = '';
      top.forEach(function(e, i){
        var name = (e.name || '').replace(/\t/g, ' ').replace(/\s+\d{4}$/, '');
        var aff  = (e.affiliation || '').replace(/^_/, '');
        var confs = (e.conferences || []).join(', ');
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + (i+1) + '</td>'
          + '<td>' + name + '</td>'
          + '<td>' + aff + '</td>'
          + '<td>' + (e.artifacts||0) + '</td>'
          + '<td>' + (e.ae_memberships||0) + '</td>'
          + '<td>' + (e.chair_count||0) + '</td>'
          + '<td><strong>' + (e.combined_score||0) + '</strong></td>'
          + '<td>' + confs + '</td>';
        tbody.appendChild(tr);
      });
    });
})();
</script>

## Repository Statistics

{% if site.data.repo_stats.by_conference.size > 0 %}
High-level GitHub repository metrics for systems conferences. See the full [systems repository statistics]({{ '/systems/repo_stats.html' | relative_url }}) for charts and details.

| Conference | GitHub Repos | Total Stars | Avg Stars | Total Forks | Avg Forks | Max Stars |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
{% for c in site.data.repo_stats.by_conference %}{% assign _is_sys = false %}{% for conf in site.data.artifacts_by_conference %}{% if conf.name == c.name and conf.category == "systems" %}{% assign _is_sys = true %}{% endif %}{% endfor %}{% if _is_sys %}| **{{ c.name }}** | {{ c.github_repos }} | {{ c.total_stars }} | {{ c.avg_stars }} | {{ c.total_forks }} | {{ c.avg_forks }} | {{ c.max_stars }} |
{% endif %}{% endfor %}
{% else %}
*Repository statistics not yet available.*
{% endif %}

{% if site.data.artifacts_by_conference %}
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  var years = [{% for y in site.data.artifacts_by_year %}"{{ y.year }}"{% unless forloop.last %},{% endunless %}{% endfor %}];
  var confColors = ['#E6194B','#3CB44B','#4363D8','#F58231','#911EB4','#42D4F4'];
  var confDatasets = [];
  {% assign ci = 0 %}{% for conf in site.data.artifacts_by_conference %}{% if conf.category == "systems" %}
  (function(){
    var data = [];
    var confYears = { {% for yd in conf.years %}"{{ yd.year }}": {{ yd.total }}{% unless forloop.last %},{% endunless %}{% endfor %} };
    years.forEach(function(yr){ data.push(confYears[yr] || 0); });
    confDatasets.push({ label: "{{ conf.name }}", data: data, borderColor: confColors[{{ ci }}%confColors.length], fill: false, tension: 0.2 });
  })();
  {% assign ci = ci | plus: 1 %}{% endif %}{% endfor %}

  new Chart(document.getElementById('sysConfChart'), {
    type: 'line',
    data: { labels: years, datasets: confDatasets },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Systems: Artifacts per Conference' } },
      scales: { y: { beginAtZero: true, title: { display: true, text: 'Artifacts' } } }
    }
  });
});
</script>
{% endif %}

<style>
table {
  font-size: 0.78em;
  white-space: nowrap;
  border-collapse: collapse;
}
table th, table td {
  padding: 3px 6px;
  border: 1px solid #ddd;
}
table th {
  background-color: #f2f2f2;
  position: sticky;
  top: 0;
}
table tr:nth-child(even) {
  background-color: #f9f9f9;
}
table tr:hover {
  background-color: #e8f4f8;
}
</style>

---

**Data:** [Artifacts by Conference](/assets/data/artifacts.json) | [Rankings](/assets/data/systems_combined_rankings.json) | [Repository Stats](/assets/data/systems_top_repos.json)
