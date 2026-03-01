---
title: "AE Committee Statistics"
permalink: /committee.html
---

Geographic and institutional diversity of Artifact Evaluation Committee members across all tracked conferences.

{% if site.data.committee_stats %}

## Overview

| | |
|---|---|
| **Total Committee Members** | {{ site.data.committee_stats.total_members }} |
| **Countries Represented** | {{ site.data.committee_stats.total_countries }} |
| **Continents** | {{ site.data.committee_stats.total_continents }} |
| **Institutions** | {{ site.data.committee_stats.total_institutions }} |
| **Conference-Years Tracked** | {{ site.data.committee_stats.total_conferences }} |
| **Last Updated** | {{ site.data.committee_stats.last_updated }} |

---

## Committee Sizes by Conference and Year

The table below shows the number of AE committee members per conference per year. Cells marked with **–** indicate missing committee data; cells with a <span style="color:#c0392b;">†</span> flag values that may be inaccurate (chairs-only or placeholder entries). An asterisk (*) marks conference-years where no artifact results exist yet (e.g. upcoming editions).

{% assign _years = "" %}
{% for s in site.data.committee_stats.committee_sizes %}
  {% unless _years contains s.year %}
    {% if _years == "" %}{% assign _years = s.year %}{% else %}{% assign _years = _years | append: "," | append: s.year %}{% endif %}
  {% endunless %}
{% endfor %}
{% assign _year_list = _years | split: "," | sort %}

{% assign _confs = "" %}
{% for s in site.data.committee_stats.committee_sizes %}
  {% unless _confs contains s.conference %}
    {% if _confs == "" %}{% assign _confs = s.conference %}{% else %}{% assign _confs = _confs | append: "," | append: s.conference %}{% endif %}
  {% endunless %}
{% endfor %}
{% assign _conf_list = _confs | split: "," | sort %}

| Conference | Area | {% for y in _year_list %}{{ y }} | {% endfor %}Total |
|---|---|{% for y in _year_list %}---:|{% endfor %}---:|
{% for c in _conf_list %}| **{{ c }}** | {% for s in site.data.committee_stats.committee_sizes %}{% if s.conference == c %}{{ s.area | slice: 0, 3 }}{% break %}{% endif %}{% endfor %} | {% for y in _year_list %}{% assign y_num = y | plus: 0 %}{% assign _found = false %}{% for s in site.data.committee_stats.committee_sizes %}{% if s.conference == c and s.year == y_num %}{% assign _found = true %}{% if s.size < 5 %}<span title="Possibly incomplete">{{ s.size }}†</span>{% else %}{{ s.size }}{% endif %}{% endif %}{% endfor %}{% unless _found %}–{% endunless %} | {% endfor %}{% assign _total = 0 %}{% for s in site.data.committee_stats.committee_sizes %}{% if s.conference == c %}{% if s.size >= 5 %}{% assign _total = _total | plus: s.size %}{% endif %}{% endif %}{% endfor %}**{{ _total }}** |
{% endfor %}

<div style="width:100%; max-width:800px; margin:1em auto;">
  <img src="{{ '/assets/charts/committee_sizes.svg' | relative_url }}" alt="Committee sizes over time" style="width:100%;">
</div>

---

## Data Coverage Notes

Some discrepancies exist between artifact results and committee data:

- **ACSAC** — 8 years of artifact results but no committee data published on secartifacts.
- **CCS** — 2 years of artifact results but no committee data.
- **ATC & OSDI** share the same AE committee at USENIX, so committee members appear under both conferences for years 2022–2024.
- Some conference-years show only chairs (no full committee): ATC 2023, OSDI 2023, SOSP 2024–2026.

These gaps mean the **systems** committee count ({{ site.data.committee_stats.total_systems }}) is somewhat inflated (ATC/OSDI duplication), while the **security** count ({{ site.data.committee_stats.total_security }}) is understated (missing ACSAC and CCS).

---

## Members by Continent

<div style="width:100%; max-width:600px; margin:1em auto;">
  <img src="{{ '/assets/charts/committee_continents.svg' | relative_url }}" alt="Members by continent" style="width:100%;">
</div>

<div style="width:100%; max-width:800px; margin:1em auto;">
  <img src="{{ '/assets/charts/committee_continent_timeline.svg' | relative_url }}" alt="Continent distribution over time" style="width:100%;">
</div>

| Continent | Members |
|---|:---:|
{% for c in site.data.committee_stats.top_continents %}| {{ c.name }} | {{ c.count }} |
{% endfor %}

---

## Top Countries

<div style="width:100%; max-width:800px; margin:1em auto;">
  <img src="{{ '/assets/charts/committee_countries.svg' | relative_url }}" alt="Top countries" style="width:100%;">
</div>

| Country | Members |
|---|:---:|
{% for c in site.data.committee_stats.top_countries %}| {{ c.name }} | {{ c.count }} |
{% endfor %}

---

## Top Institutions

<div style="width:100%; max-width:800px; margin:1em auto;">
  <img src="{{ '/assets/charts/committee_institutions.svg' | relative_url }}" alt="Top institutions" style="width:100%;">
</div>

| Institution | Members |
|---|:---:|
{% for i in site.data.committee_stats.top_institutions %}| {{ i.name }} | {{ i.count }} |
{% endfor %}

---

## Per-Area Breakdown

- **[Systems Committee Stats]({{ '/systems_committee.html' | relative_url }})** — {{ site.data.committee_stats.total_systems }} members
- **[Security Committee Stats]({{ '/security_committee.html' | relative_url }})** — {{ site.data.committee_stats.total_security }} members

---

## Download Data

- **[committee_stats.json]({{ '/assets/data/committee_stats.json' | relative_url }})** — Complete committee dataset (countries, continents, institutions, per-year breakdowns)

{% else %}

*Committee statistics data is being generated. Please check back soon.*

{% endif %}

---

**Data:** [All Conferences](/assets/data/committee_stats.json) | [Systems](/assets/data/committee_stats.json) | [Security](/assets/data/committee_stats.json)

<style>
table { font-size: 0.85em; white-space: nowrap; border-collapse: collapse; }
table th, table td { padding: 3px 8px; border: 1px solid #ddd; }
table th { background-color: #f2f2f2; position: sticky; top: 0; }
table tr:nth-child(even) { background-color: #f9f9f9; }
table tr:hover { background-color: #e8f4f8; }
</style>
