---
title: "Security: AE Committee Statistics"
permalink: /security/committee.html
---

Geographic and institutional diversity of Artifact Evaluation Committee members at security conferences.

{% if site.data.committee_stats %}

## Overview

| | |
|---|---|
| **Total Committee Members** | {{ site.data.committee_stats.total_security }} |

---

## Members by Continent

<div style="position:relative; width:100%; max-width:600px; margin:1em auto; height:340px;">
  <canvas id="committeeContinentsChart"></canvas>
</div>

| Continent | Members |
|---|:---:|
{% for c in site.data.committee_stats.top_continents_security %}| {{ c.name }} | {{ c.count }} |
{% endfor %}

---

## Top Countries

<div style="position:relative; width:100%; max-width:1200px; margin:1em auto; height:480px;">
  <canvas id="committeeCountriesChart"></canvas>
</div>

| Country | Members |
|---|:---:|
{% for c in site.data.committee_stats.top_countries_security %}| {{ c.name }} | {{ c.count }} |
{% endfor %}

---

## Top Institutions

<div style="position:relative; width:100%; max-width:1200px; margin:1em auto; height:580px;">
  <canvas id="committeeInstitutionsChart"></canvas>
</div>

| Institution | Members |
|---|:---:|
{% for i in site.data.committee_stats.top_institutions_security %}| {{ i.name }} | {{ i.count }} |
{% endfor %}

{% include committee_charts.html area="security" %}

{% else %}

*Committee statistics data is being generated. Please check back soon.*

{% endif %}

---

**Data:** [Security]({{ '/assets/data/committee_stats.json' | relative_url }})

<style>
table { font-size: 0.85em; white-space: nowrap; border-collapse: collapse; }
table th, table td { padding: 3px 8px; border: 1px solid #ddd; }
table th { background-color: #f2f2f2; position: sticky; top: 0; }
table tr:nth-child(even) { background-color: #f9f9f9; }
table tr:hover { background-color: #e8f4f8; }
</style>
