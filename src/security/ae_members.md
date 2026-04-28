---
title: "Security: AE Service Ranking"
permalink: /security/ae_members.html
member_data_url: /assets/data/security_ae_members.json
---

Artifact Evaluation committee members at security conferences ({{ site.data.summary.security_conferences | join: ", " }}), ranked by AE service score (3×memberships + 2×chairs). Only members who served at least twice are listed. The **Chaired** column (★) indicates how many times the member served as AE chair or co-chair.

- **{{ site.data.committee_stats.unique_members_security }}** unique members at security conferences
- **{{ site.data.committee_stats.recurring_chairs }}** include chairing roles (across all areas)

{% include ae_member_table.html %}

---

**Data:** [Security]({{ '/assets/data/security_ae_members.json' | relative_url }})
