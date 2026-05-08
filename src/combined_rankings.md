---
title: "Author Rankings"
permalink: /combined_rankings.html
skip_chartjs: true
combined_data_url: /assets/data/combined_rankings.json
systems_data_url: /assets/data/systems_combined_rankings.json
security_data_url: /assets/data/security_combined_rankings.json
---

<p>Researchers ranked by weighted contributions (artifact authorship + AE committee service). <strong>Scoring:</strong> Each badge = 1 pt; AE membership = 3 pts; AE chair = 5 pts. Minimum combined score ≥ 3 required.</p>

{% if site.data.combined_summary %}
<p><strong>Stats:</strong> {{ site.data.combined_summary.combined_total }} total | {{ site.data.combined_summary.both_artifacts_and_ae }} with both contributions</p>
{% endif %}

{% include combined_ranking_table.html %}

<hr>

<p><strong>Data:</strong> <a href="{{ '/assets/data/combined_rankings.json' | relative_url }}">All Conferences</a> | <a href="{{ '/assets/data/systems_combined_rankings.json' | relative_url }}">Systems</a> | <a href="{{ '/assets/data/security_combined_rankings.json' | relative_url }}">Security</a></p>
