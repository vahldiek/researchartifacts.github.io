---
title: "Combined Rankings"
permalink: /combined_rankings.html
combined_data_url: /assets/data/combined_rankings.json
systems_data_url: /assets/data/systems_combined_rankings.json
security_data_url: /assets/data/security_combined_rankings.json
---

Researchers ranked by weighted contributions (artifact authorship + AE committee service). **Scoring:** Artifacts = 1–3 pts based on level; AE membership = 3 pts, chair = +2 bonus. Use the filters below. Data from [DBLP](https://dblp.org), evaluations, and committee listings.

{% if site.data.combined_summary %}
**Stats:** {{ site.data.combined_summary.combined_total }} total | {{ site.data.combined_summary.both_artifacts_and_ae }} with both contributions
{% endif %}

{% include combined_ranking_table.html %}

---

**Data:** [All Conferences](/assets/data/combined_rankings.json) | [Systems](/assets/data/systems_combined_rankings.json) | [Security](/assets/data/security_combined_rankings.json)
