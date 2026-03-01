---
title: "Research Artifacts Statistics"
---

**Research Artifacts & Artifact Evaluation (AE)** drive reproducibility and scientific impact. This project tracks and analyzes artifact evaluation outcomes across major [systems]({{ '/systems/' | relative_url }}) and [security]({{ '/security/' | relative_url }}) conferences, recognizing the contributions of both artifact authors and artifact evaluation committees. We aggregate comprehensive data on artifact evaluation badges, contributor achievements, and repository engagement to promote reproducible research and celebrate the researchers advancing this critical work.

**Browse rankings:** [Combined Rankings]({{ '/combined_rankings.html' | relative_url }}) (researchers by artifact + AE contributions) · [Institution Rankings]({{ '/institution_rankings.html' | relative_url }}) (institutions by author engagement)

{% if site.data.summary %}

## Overview

| | |
|---|---|
| **Total Artifacts** | {{ site.data.summary.total_artifacts }} |
| **Conferences Tracked** | {{ site.data.summary.total_conferences }} ({{ site.data.summary.conferences_list | join: ", " }}) |
| **Years Covered** | {{ site.data.summary.year_range }} |
| **Total Authors** | {{ site.data.author_summary.total_authors }} |
| **AE Committee Members** | {{ site.data.committee_stats.total_members }} ({{ site.data.committee_stats.recurring_members }} recurring) |
| **Last Updated** | {{ site.data.summary.last_updated }} |

## Artifacts by Year and Area

<div style="width:100%; max-width:400px; margin:1em 0;">
<canvas id="areaChart" height="200"></canvas>
</div>

| Area | Total | {% for y in site.data.artifacts_by_year reversed %}{{ y.year }} | {% endfor %}
|---|:---:|{% for y in site.data.artifacts_by_year reversed %}:---:|{% endfor %}
| **[Systems]({{ '/systems/' | relative_url }})** | {% assign _st = 0 %}{% assign _sa = 0 %}{% assign _sf = 0 %}{% assign _sr = 0 %}{% for conf in site.data.artifacts_by_conference %}{% if conf.category == "systems" %}{% for yd in conf.years %}{% assign _st = _st | plus: yd.total %}{% assign _sa = _sa | plus: yd.available %}{% assign _sf = _sf | plus: yd.functional %}{% assign _sr = _sr | plus: yd.reproducible %}{% endfor %}{% endif %}{% endfor %}**{{ _st }}** ({{ _sa }}, {{ _sf }}, {{ _sr }}) | {% for y in site.data.artifacts_by_year reversed %}{% assign _ct = 0 %}{% assign _ca = 0 %}{% assign _cf = 0 %}{% assign _cr = 0 %}{% for conf in site.data.artifacts_by_conference %}{% if conf.category == "systems" %}{% for yd in conf.years %}{% if yd.year == y.year %}{% assign _ct = _ct | plus: yd.total %}{% assign _ca = _ca | plus: yd.available %}{% assign _cf = _cf | plus: yd.functional %}{% assign _cr = _cr | plus: yd.reproducible %}{% endif %}{% endfor %}{% endif %}{% endfor %}{% if _ct > 0 %}{{ _ct }} ({{ _ca }}, {{ _cf }}, {{ _cr }}){% else %}&ndash;{% endif %} | {% endfor %}
| **[Security]({{ '/security/' | relative_url }})** | {% assign _st = 0 %}{% assign _sa = 0 %}{% assign _sf = 0 %}{% assign _sr = 0 %}{% for conf in site.data.artifacts_by_conference %}{% if conf.category == "security" %}{% for yd in conf.years %}{% assign _st = _st | plus: yd.total %}{% assign _sa = _sa | plus: yd.available %}{% assign _sf = _sf | plus: yd.functional %}{% assign _sr = _sr | plus: yd.reproducible %}{% endfor %}{% endif %}{% endfor %}**{{ _st }}** ({{ _sa }}, {{ _sf }}, {{ _sr }}) | {% for y in site.data.artifacts_by_year reversed %}{% assign _ct = 0 %}{% assign _ca = 0 %}{% assign _cf = 0 %}{% assign _cr = 0 %}{% for conf in site.data.artifacts_by_conference %}{% if conf.category == "security" %}{% for yd in conf.years %}{% if yd.year == y.year %}{% assign _ct = _ct | plus: yd.total %}{% assign _ca = _ca | plus: yd.available %}{% assign _cf = _cf | plus: yd.functional %}{% assign _cr = _cr | plus: yd.reproducible %}{% endif %}{% endfor %}{% endif %}{% endfor %}{% if _ct > 0 %}{{ _ct }} ({{ _ca }}, {{ _cf }}, {{ _cr }}){% else %}&ndash;{% endif %} | {% endfor %}
| **Total** | {% assign _st = 0 %}{% assign _sa = 0 %}{% assign _sf = 0 %}{% assign _sr = 0 %}{% for conf in site.data.artifacts_by_conference %}{% for yd in conf.years %}{% assign _st = _st | plus: yd.total %}{% assign _sa = _sa | plus: yd.available %}{% assign _sf = _sf | plus: yd.functional %}{% assign _sr = _sr | plus: yd.reproducible %}{% endfor %}{% endfor %}**{{ _st }}** ({{ _sa }}, {{ _sf }}, {{ _sr }}) | {% for y in site.data.artifacts_by_year reversed %}{% assign _ct = 0 %}{% assign _ca = 0 %}{% assign _cf = 0 %}{% assign _cr = 0 %}{% for conf in site.data.artifacts_by_conference %}{% for yd in conf.years %}{% if yd.year == y.year %}{% assign _ct = _ct | plus: yd.total %}{% assign _ca = _ca | plus: yd.available %}{% assign _cf = _cf | plus: yd.functional %}{% assign _cr = _cr | plus: yd.reproducible %}{% endif %}{% endfor %}{% endfor %}**{{ _ct }}** ({{ _ca }}, {{ _cf }}, {{ _cr }}) | {% endfor %}

Each cell shows **total (available, functional, reproduced)**.

## Top Contributors: Combined Ranking

Researchers contribute through artifact publication and AE committee service. The [combined ranking]({{ '/combined_rankings.html' | relative_url }}) merges both contributions into a unified score recognizing dual impact. Below are the top 10 most prolific contributors:

<table id="top10Table">
<thead><tr><th>#</th><th>Name</th><th>Affiliation</th><th>Ar</th><th>AE</th><th>Ch</th><th>Score</th></tr></thead>
<tbody><tr><td colspan="7"><em>Loading…</em></td></tr></tbody>
</table>

## Statistics & Analysis

Explore detailed insights across institutions, authors, and conferences:

- **[Combined Rankings]({{ '/combined_rankings.html' | relative_url }})** — Researchers ranked by artifact contributions + AE committee work
- **[Institution Rankings]({{ '/institution_rankings.html' | relative_url }})** — Institutions ranked by artifact contributions and author engagement
- **[Author Rankings]({{ '/authors.html' | relative_url }})** — Individual authors ranked by artifact evaluation impact
- **[Statistics]({{ '/statistics/' | relative_url }})** — Artifact evaluation trends by country and continent
- **[Repository Statistics]({{ '/repo_stats.html' | relative_url }})** — Most popular artifact repositories by stars, forks, and citations

<script>
(function(){
  fetch('{{ "/assets/data/combined_rankings.json" | relative_url }}')
    .then(function(r){ return r.json(); })
    .then(function(data){
      data.sort(function(a,b){ return (b.combined_score||0) - (a.combined_score||0); });
      var top = data.slice(0, 10);
      var tbody = document.querySelector('#top10Table tbody');
      tbody.innerHTML = '';
      top.forEach(function(e, i){
        var name = (e.name || '').replace(/\t/g, ' ');
        var aff  = (e.affiliation || '').replace(/^_/, '');
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + (i+1) + '</td>'
          + '<td>' + name + '</td>'
          + '<td>' + aff + '</td>'
          + '<td>' + (e.artifacts||0) + '</td>'
          + '<td>' + (e.ae_memberships||0) + '</td>'
          + '<td>' + (e.chair_count||0) + '</td>'
          + '<td><strong>' + (e.combined_score||0) + '</strong></td>';
        tbody.appendChild(tr);
      });
    });
})();
</script>

## Explore by Conference Area

- [Systems]({{ '/systems/' | relative_url }}) — Breakdown and rankings for systems venues (EuroSys, OSDI, SC, SOSP)
- [Security]({{ '/security/' | relative_url }}) — Breakdown and rankings for security venues (ACSAC, CHES, NDSS, PETS, USENIX Security, WOOT)
- [Methodology]({{ '/methodology.html' | relative_url }}) — How we collect, process, and analyze the data
- [About]({{ '/about.html' | relative_url }}) — Project information and how to contribute

{% else %}
Statistics are being generated. Check back soon!
{% endif %}

## Data Sources

- **[sysartifacts.github.io](https://sysartifacts.github.io)** — Systems conference artifact evaluation results (EuroSys, OSDI, SC, SOSP)
- **[secartifacts.github.io](https://secartifacts.github.io)** — Security conference artifact evaluation results (ACSAC, CHES, NDSS, PETS, SysTEX, USENIX Security, WOOT)
- **[usenix.org](https://www.usenix.org)** — Badge information for USENIX conferences (ATC, FAST)
- **[dblp.org](https://dblp.org)** — Author name matching and disambiguation
- **[GitHub](https://docs.github.com/en/rest)**, **[Zenodo](https://developers.zenodo.org)**, **[Figshare](https://docs.figshare.com)** — Repository statistics (stars, forks, downloads)

## Acknowledgements

This project celebrates the work of **artifact authors** who go the extra mile to make research reproducible, and **artifact evaluation committees** (AE chairs and members) who invest time reviewing and certifying artifacts. Their contributions strengthen our scientific record. We thank the communities maintaining [sysartifacts](https://sysartifacts.github.io) and [secartifacts](https://secartifacts.github.io) for publishing detailed evaluation results. Inspired by [Systems Circus](https://nebelwelt.net/pubstats/) and [csrankings.org](https://csrankings.org).

<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  var years = [{% for y in site.data.artifacts_by_year %}"{{ y.year }}"{% unless forloop.last %},{% endunless %}{% endfor %}];
  var systems = [{% for y in site.data.artifacts_by_year %}{{ y.systems }}{% unless forloop.last %},{% endunless %}{% endfor %}];
  var security = [{% for y in site.data.artifacts_by_year %}{{ y.security }}{% unless forloop.last %},{% endunless %}{% endfor %}];
  var totals = [{% for y in site.data.artifacts_by_year %}{{ y.count }}{% unless forloop.last %},{% endunless %}{% endfor %}];

  new Chart(document.getElementById('areaChart'), {
    type: 'line',
    data: {
      labels: years,
      datasets: [
        { label: 'Total', data: totals, borderColor: '#333', backgroundColor: 'rgba(51,51,51,0.1)', fill: false, tension: 0.2 },
        { label: 'Security', data: security, borderColor: '#c0392b', backgroundColor: 'rgba(192,57,43,0.1)', fill: false, tension: 0.2 },
        { label: 'Systems', data: systems, borderColor: '#2980b9', backgroundColor: 'rgba(41,128,185,0.1)', fill: false, tension: 0.2 }
      ]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Artifacts by Year and Area' } },
      scales: { y: { beginAtZero: true, title: { display: true, text: 'Artifacts' } } }
    }
  });
});
</script>

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

**Data:** [All Artifacts](/assets/data/artifacts.json) | [Artifacts by Conference](/assets/data/artifacts_by_conference.json) | [Rankings](/assets/data/combined_rankings.json) | [Authors](/assets/data/authors.json) | [Repository Stats](/assets/data/top_repos.json)
