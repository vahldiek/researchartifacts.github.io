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

<div class="rdb-md-chart" style="max-width:600px; height:340px;">
  <canvas id="committeeContinentsChart"></canvas>
</div>

| Continent | Members |
|---|:---:|
{% for c in site.data.committee_stats.top_continents_security %}| {{ c.name }} | {{ c.count }} |
{% endfor %}

---

## Top Countries

<div class="rdb-md-chart" style="max-width:1200px; height:480px;">
  <canvas id="committeeCountriesChart"></canvas>
</div>

| Country | Members |
|---|:---:|
{% for c in site.data.committee_stats.top_countries_security %}| {{ c.name }} | {{ c.count }} |
{% endfor %}

---

## Top Institutions

<div class="rdb-md-chart" style="max-width:1200px; height:580px;">
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
