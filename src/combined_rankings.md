---
title: "Author Rankings"
permalink: /combined_rankings.html
skip_chartjs: true
combined_data_url: /assets/data/combined_rankings.json
systems_data_url: /assets/data/systems_combined_rankings.json
security_data_url: /assets/data/security_combined_rankings.json
---

Researchers ranked by weighted contributions (artifact authorship + AE committee service). **Scoring:** Each badge = 1 pt; AE membership = 3 pts; AE chair = 5 pts. Minimum combined score ≥ 3 required.

{% if site.data.combined_summary %}
**Stats:** {{ site.data.combined_summary.combined_total }} total | {{ site.data.combined_summary.both_artifacts_and_ae }} with both contributions
{% endif %}

<div markdown="0">
{% include combined_ranking_table.html %}
</div>

---

**Data:** [All Conferences]({{ '/assets/data/combined_rankings.json' | relative_url }}) | [Systems]({{ '/assets/data/systems_combined_rankings.json' | relative_url }}) | [Security]({{ '/assets/data/security_combined_rankings.json' | relative_url }})
