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
| **Last Updated** | {{ site.data.committee_stats.last_updated }} |

---

## Members by Continent

<div style="width:100%; max-width:600px; margin:1em auto;">
  <img src="{{ '/assets/charts/committee_continents_security.svg' | relative_url }}" alt="Security: Members by continent" style="width:100%;">
</div>

| Continent | Members |
|---|:---:|
{% for c in site.data.committee_stats.top_continents_security %}| {{ c.name }} | {{ c.count }} |
{% endfor %}

---

## Top Countries

<div style="width:100%; max-width:800px; margin:1em auto;">
  <img src="{{ '/assets/charts/committee_countries_security.svg' | relative_url }}" alt="Security: Top countries" style="width:100%;">
</div>

| Country | Members |
|---|:---:|
{% for c in site.data.committee_stats.top_countries_security %}| {{ c.name }} | {{ c.count }} |
{% endfor %}

---

## Top Institutions

<div style="width:100%; max-width:800px; margin:1em auto;">
  <img src="{{ '/assets/charts/committee_institutions_security.svg' | relative_url }}" alt="Security: Top institutions" style="width:100%;">
</div>

| Institution | Members |
|---|:---:|
{% for i in site.data.committee_stats.top_institutions_security %}| {{ i.name }} | {{ i.count }} |
{% endfor %}

{% else %}

*Committee statistics data is being generated. Please check back soon.*

{% endif %}

<style>
table { font-size: 0.85em; white-space: nowrap; border-collapse: collapse; }
table th, table td { padding: 3px 8px; border: 1px solid #ddd; }
table th { background-color: #f2f2f2; position: sticky; top: 0; }
table tr:nth-child(even) { background-color: #f9f9f9; }
table tr:hover { background-color: #e8f4f8; }
</style>
