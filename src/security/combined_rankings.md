---
title: "Security: Combined Rankings"
permalink: /security/combined_rankings.html
skip_chartjs: true
default_area: security
combined_data_url: /assets/data/combined_rankings.json
systems_data_url: /assets/data/systems_combined_rankings.json
security_data_url: /assets/data/security_combined_rankings.json
---

<p>Researchers ranked by weighted contributions (artifact authorship + AE committee service) at security conferences. <strong>Scoring:</strong> Each badge (Available, Functional, Reproduced) = 1 pt, each citation = 1 pt; AE membership = 3 pts, AE chair = 5 pts.</p>

{% include combined_ranking_table.html %}

<hr>

<p><strong>Data:</strong> <a href="{{ '/assets/data/security_combined_rankings.json' | relative_url }}">Security</a></p>
