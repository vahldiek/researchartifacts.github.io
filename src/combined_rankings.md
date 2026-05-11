---
title: "Author Rankings"
permalink: /combined_rankings.html
skip_chartjs: true
combined_data_url: /assets/data/combined_rankings.json
systems_data_url: /assets/data/systems_combined_rankings.json
security_data_url: /assets/data/security_combined_rankings.json
---

<p>Researchers ranked by weighted contributions (artifact authorship + AE committee service). <strong>Scoring:</strong> Each badge = 1 pt; AE membership = 3 pts; AE chair = 5 pts. Minimum combined score ≥ 3 required.{% if site.data.combined_summary %} <strong>{{ site.data.combined_summary.combined_total }}</strong> researchers ranked, <strong>{{ site.data.combined_summary.both_artifacts_and_ae }}</strong> with both artifacts &amp; AE service.{% endif %}</p>

{% include combined_ranking_table.html %}

{% include data_footer.html %}
