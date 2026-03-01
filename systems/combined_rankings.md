---
title: "Systems: Combined Rankings"
permalink: /systems/combined_rankings.html
combined_data_url: /assets/data/systems_combined_rankings.json
---

Researchers ranked by weighted contributions to systems conferences ({{ site.data.summary.systems_conferences | join: ", " }}): artifact authorship **plus** AE committee service.

**Weighted scoring:** Each artifact badge adds 1 pt (Available = 1, +Functional = 2, +Reproducible = 3 pts max). Each AE committee membership = 3 pts, each AE chair role = +2 pts bonus. Hover over column headers for details.

{% if site.data.combined_summary %}
- **{{ site.data.combined_summary.combined_systems }}** researchers with a weighted score &ge; 3
- **{{ site.data.combined_summary.both_artifacts_and_ae_systems }}** contributed both artifacts and AE committee service
- Use the **Filter** dropdown to show only people with both contributions, artifacts only, or AE service only.
{% endif %}

{% include combined_ranking_table.html %}

---

**Data:** [systems_combined_rankings.json](/assets/data/systems_combined_rankings.json)
