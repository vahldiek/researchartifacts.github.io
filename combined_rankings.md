---
title: "Combined Rankings"
permalink: /combined_rankings.html
combined_data_url: /assets/data/combined_rankings.json
---

Researchers ranked by weighted contributions across all systems and security conferences: artifact authorship **plus** AE committee service.

**Weighted scoring:** Artifact Available = 1 pt, Functional = 2 pts, Reproducible = 3 pts. Each AE committee membership = 3 pts, each AE chair role = +3 pts bonus. Hover over column headers for details.

{% if site.data.combined_summary %}
- **{{ site.data.combined_summary.combined_total }}** researchers with a weighted score &ge; 3
- **{{ site.data.combined_summary.both_artifacts_and_ae }}** contributed both artifacts and AE committee service
- Use the **Filter** dropdown to show only people with both contributions, artifacts only, or AE service only.
{% endif %}

{% include combined_ranking_table.html %}
