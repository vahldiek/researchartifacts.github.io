---
layout: default
title: Ranking
institution_data_url: /assets/data/institution_rankings.json
systems_data_url: /assets/data/systems_institution_rankings.json
security_data_url: /assets/data/security_institution_rankings.json
---

# Institution Ranking

This page ranks institutions by their aggregate contributions to research artifact evaluation and availability. Use the filter above the table to view rankings for all conferences, systems conferences only, or security conferences only.

Institution scores are calculated by aggregating individual researchers' [combined ranking](combined_rankings.html) scores.

**Note**: Affiliation data is sourced from artifact submissions and AE committee listings. Some entries may have missing or outdated affiliations labeled as "Unknown".

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
