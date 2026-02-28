---
title: "Recurring AE Members"
permalink: /ae_members.html
member_data_url: /assets/data/ae_members.json
---

Recurring Artifact Evaluation committee members across all tracked systems and security conferences, ranked by number of committee memberships. Only members who served at least twice are listed. The **Chaired** column (★) indicates how many times the member served as AE chair or co-chair.

{% if site.data.committee_stats %}
- **{{ site.data.committee_stats.recurring_members_systems }}** recurring members at systems conferences
- **{{ site.data.committee_stats.recurring_members_security }}** recurring members at security conferences
- **{{ site.data.committee_stats.recurring_chairs }}** include chairing roles (across all areas)
- Data was processed on {{ site.data.committee_stats.last_updated }}.
{% endif %}

{% include ae_member_table.html %}

See also: [Systems AE Members]({{ '/systems/ae_members.html' | relative_url }}) · [Security AE Members]({{ '/security/ae_members.html' | relative_url }})
