---
title: "Combined Rankings"
permalink: /combined_rankings.html
combined_data_url: /assets/data/combined_rankings.json
systems_data_url: /assets/data/systems_combined_rankings.json
security_data_url: /assets/data/security_combined_rankings.json
---

Researchers ranked by weighted contributions: artifact authorship **plus** AE committee service. Use the **Area** filter above the table to view rankings for all conferences, systems conferences only, or security conferences only.

**Weighted scoring:** Each artifact badge adds 1 pt (Available = 1, +Functional = 2, +Reproducible = 3 pts max). Each AE committee membership = 3 pts, each AE chair role = +2 pts bonus. Hover over column headers for details.

**Note**: Author data is sourced from artifact evaluations, AE committee listings, [DBLP](https://dblp.org), and [CSRankings](http://csrankings.org).

{% if site.data.combined_summary %}
- **{{ site.data.combined_summary.combined_total }}** researchers with a weighted score &ge; 3 (all conferences)
- **{{ site.data.combined_summary.both_artifacts_and_ae }}** contributed both artifacts and AE committee service
- Use the **Filter** dropdown to show only people with both contributions, artifacts only, or AE service only.
{% endif %}

{% include combined_ranking_table.html %}

---

**Data:** [All Conferences](/assets/data/combined_rankings.json) | [Systems](/assets/data/systems_combined_rankings.json) | [Security](/assets/data/security_combined_rankings.json)
