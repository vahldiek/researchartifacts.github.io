---
title: "Systems: AE Service Ranking"
permalink: /systems/ae_members.html
skip_chartjs: true
member_data_url: /assets/data/systems_ae_members.json
---

Artifact Evaluation committee members at systems conferences ({{ site.data.summary.systems_conferences | join: ", " }}), ranked by AE service score (3×memberships + 2×chairs). Only members who served at least twice are listed. The **Chaired** column (★) indicates how many times the member served as AE chair or co-chair.

- **{{ site.data.committee_stats.unique_members_systems }}** unique members at systems conferences
- **{{ site.data.committee_stats.recurring_chairs }}** include chairing roles (across all areas)

{% include ae_member_table.html %}

---

**Data:** [Systems]({{ '/assets/data/systems_ae_members.json' | relative_url }})
