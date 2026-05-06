---
title: "AE Service Ranking"
permalink: /ae_members.html
skip_chartjs: true
member_data_url: /assets/data/ae_members.json
---

Artifact Evaluation committee members across all tracked systems and security conferences, ranked by AE service score (3×memberships + 2×chairs). Only members who served at least twice are listed. The **Chaired** column (★) indicates how many times the member served as AE chair or co-chair.

{% if site.data.committee_stats %}
- **{{ site.data.committee_stats.unique_members_systems }}** unique members at systems conferences
- **{{ site.data.committee_stats.unique_members_security }}** unique members at security conferences
- **{{ site.data.committee_stats.recurring_chairs }}** include chairing roles (across all areas)
{% endif %}

{% include ae_member_table.html %}

---

**Data:** [All Conferences]({{ '/assets/data/ae_members.json' | relative_url }}) | [Systems]({{ '/assets/data/systems_ae_members.json' | relative_url }}) | [Security]({{ '/assets/data/security_ae_members.json' | relative_url }})
