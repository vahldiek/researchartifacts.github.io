---
title: "AE Chair Statistics"
permalink: /ae_chairs.html
chair_data_url: /assets/data/ae_chairs.json
chair_stats_url: /assets/data/chair_stats.json
---

<link rel="stylesheet" href="{{ '/assets/css/reprodb-charts.css' | relative_url }}">

A dedicated view of **Artifact Evaluation Committee chairs** — the people who organize and lead the AE process across systems and security conferences.

{% if site.data.committee_stats.chair_stats %}

## Overview

<div class="rdb-cards">
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.committee_stats.chair_stats.total_chairs }}</div>
    <div class="rdb-card-label">Unique Chairs</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.committee_stats.chair_stats.repeat_chairs }}</div>
    <div class="rdb-card-label">Repeat Chairs</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.committee_stats.chair_stats.cross_conference_chairs }}</div>
    <div class="rdb-card-label">Cross-Conference</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.committee_stats.chair_stats.pipeline_promoted_pct }}%</div>
    <div class="rdb-card-label">Promoted from Member</div>
  </div>
</div>

| | All | Systems | Security |
|---|:---:|:---:|:---:|
| **Unique Chairs** | {{ site.data.committee_stats.chair_stats.total_chairs }} | {{ site.data.committee_stats.chair_stats.total_chairs_systems }} | {{ site.data.committee_stats.chair_stats.total_chairs_security }} |
| **Repeat Chairs** | {{ site.data.committee_stats.chair_stats.repeat_chairs }} | — | — |
| **Avg. Chairs/Edition** | {{ site.data.committee_stats.chair_stats.avg_chairs_per_edition }} | — | — |

---

## Member-to-Chair Pipeline

Of all chairs, **{{ site.data.committee_stats.chair_stats.pipeline_promoted_pct }}%** served as regular AE members before being promoted to chair, taking an average of **{{ site.data.committee_stats.chair_stats.pipeline_avg_years }} years** to make the transition. This indicates a healthy mentorship pipeline where experienced reviewers graduate to leadership roles.

---

## Retention & Cross-Conference Service

- **{{ site.data.committee_stats.chair_stats.repeat_chairs_pct }}%** of chairs have chaired more than once
- **{{ site.data.committee_stats.chair_stats.cross_conference_chairs }}** chairs have led AE processes at multiple different conference series

{% endif %}

---

## Chair Ranking

Ranked by number of times served as AE chair. The **Pipeline** column shows years from first AE member role to first chair role (— = started directly as chair).

{% include ae_chair_table.html %}

---

**Data:** [All Chairs]({{ '/assets/data/ae_chairs.json' | relative_url }}) | [Systems]({{ '/assets/data/systems_ae_chairs.json' | relative_url }}) | [Security]({{ '/assets/data/security_ae_chairs.json' | relative_url }}) | [Chair Stats]({{ '/assets/data/chair_stats.json' | relative_url }})
