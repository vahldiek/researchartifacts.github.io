---
title: "Recurring AE Members"
permalink: /ae_members.html
---

# Recurring AE Committee Members

Members who have served on artifact evaluation committees at least twice, ranked by number of memberships.

{% if site.data.committee_stats %}
| | |
|---|---|
| **Systems Recurring Members** | {{ site.data.committee_stats.recurring_members_systems }} |
| **Security Recurring Members** | {{ site.data.committee_stats.recurring_members_security }} |
| **Include Chair Roles** | {{ site.data.committee_stats.recurring_chairs }} |
{% endif %}

- [Systems AE Members]({{ '/systems_ae_members.html' | relative_url }}) — {{ site.data.committee_stats.recurring_members_systems }} recurring members at systems conferences
- [Security AE Members]({{ '/security_ae_members.html' | relative_url }}) — {{ site.data.committee_stats.recurring_members_security }} recurring members at security conferences
