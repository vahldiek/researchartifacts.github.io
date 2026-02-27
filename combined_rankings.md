---
title: "Combined Rankings"
permalink: /combined_rankings.html
---

# Combined Artifact & AE Committee Rankings

A unified ranking of researchers by their combined contributions — artifact authorship plus AE committee service.

**Weighted scoring:** Artifact Available = 1 pt, Functional = 2 pts, Reproducible = 3 pts. Each AE committee membership = 3 pts, each AE chair role = +3 pts bonus.

{% if site.data.combined_summary %}
| | |
|---|---|
| **Total Ranked** | {{ site.data.combined_summary.combined_total }} |
| **With Both Artifacts & AE** | {{ site.data.combined_summary.both_artifacts_and_ae }} |
| **Top Score** | {{ site.data.combined_summary.top_combined_score }} |
{% endif %}

- [Systems Combined Rankings]({{ '/systems_combined_rankings.html' | relative_url }}) — {{ site.data.combined_summary.combined_systems }} researchers at systems conferences
- [Security Combined Rankings]({{ '/security_combined_rankings.html' | relative_url }}) — {{ site.data.combined_summary.combined_security }} researchers at security conferences
