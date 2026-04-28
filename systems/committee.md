---
title: "Systems: AE Committee Statistics"
permalink: /systems/committee.html
---

Geographic and institutional diversity of Artifact Evaluation Committee members at systems conferences.

{% if site.data.committee_stats %}

## Overview

| | |
|---|---|
| **Total Committee Members** | {{ site.data.committee_stats.total_systems }} |

---

## Members by Continent

<div style="width:100%; max-width:900px; margin:1em auto;">
  <canvas id="committeeContinentsChart" height="340"></canvas>
</div>

| Continent | Members |
|---|:---:|
{% for c in site.data.committee_stats.top_continents_systems %}| {{ c.name }} | {{ c.count }} |
{% endfor %}

---

## Top Countries

<div style="width:100%; max-width:1200px; margin:1em auto; height:480px;">
  <canvas id="committeeCountriesChart"></canvas>
</div>

| Country | Members |
|---|:---:|
{% for c in site.data.committee_stats.top_countries_systems %}| {{ c.name }} | {{ c.count }} |
{% endfor %}

---

## Top Institutions

<div style="width:100%; max-width:1200px; margin:1em auto; height:580px;">
  <canvas id="committeeInstitutionsChart"></canvas>
</div>

| Institution | Members |
|---|:---:|
{% for i in site.data.committee_stats.top_institutions_systems %}| {{ i.name }} | {{ i.count }} |
{% endfor %}

{% include committee_charts.html area="systems" %}

{% else %}

*Committee statistics data is being generated. Please check back soon.*

{% endif %}

---

**Data:** [Systems]({{ '/assets/data/committee_stats.json' | relative_url }})

<style>
table { font-size: 0.85em; white-space: nowrap; border-collapse: collapse; }
table th, table td { padding: 3px 8px; border: 1px solid #ddd; }
table th { background-color: #f2f2f2; position: sticky; top: 0; }
table tr:nth-child(even) { background-color: #f9f9f9; }
table tr:hover { background-color: #e8f4f8; }
</style>
