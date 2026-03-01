---
layout: default
title: Institution Ranking
institution_data_url: /assets/data/institution_rankings.json
systems_data_url: /assets/data/systems_institution_rankings.json
security_data_url: /assets/data/security_institution_rankings.json
---

# Institution Ranking

Institutions ranked by aggregate contributions of their researchers. Filter by conference area: all, systems, or security.

**Note**: Affiliation data is sourced from artifact submissions, AE committee listings, [DBLP](https://dblp.org), and [CSRankings](http://csrankings.org). Researchers with unknown or missing institutions are excluded from this ranking.

---

{% include institution_ranking_table.html %}

---

## Methodology

For detailed information about our scoring system and data collection methodology, see the [Methodology](methodology.html) page.

**Scoring Weights:**
- Available artifact: **1 point** (base)
- Functional artifact: **+1 point** (total 2)
- Reproducible artifact: **+1 point** (total 3 max)
- AE membership: **3 points**
- AE chair bonus: **+2 points** (on top of membership)

Institution scores are the sum of all affiliated authors' contributions. Only institutions with a combined score of 3 or higher are listed.

---

**Data:** [All Conferences](/assets/data/institution_rankings.json) | [Systems](/assets/data/systems_institution_rankings.json) | [Security](/assets/data/security_institution_rankings.json)
