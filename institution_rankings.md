---
layout: default
title: Institution Rankings
institution_data_url: /assets/data/institution_rankings.json
---

# Institution Rankings

This page ranks institutions by their aggregate contributions to research artifact evaluation and availability across systems and security conferences. Institutions are scored by combining:

- **Artifacts**: Number of papers with available artifacts by authors affiliated with the institution
- **AE Service**: Artifact evaluation committee memberships by members of the institution  
- **AE Chair**: Bonus for chairing artifact evaluation committees (+2 points per chair role)

Each artifact earns 1 point (Available), plus 1 additional point for each higher badge level (Functional, Reproducible), for a maximum of 3 points per artifact. AE committee membership earns 3 points. AE chairs receive an additional +2 points on top of membership.

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
