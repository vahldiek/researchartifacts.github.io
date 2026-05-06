---
title: "Systems: Artifact Authors"
permalink: /systems/authors.html
skip_chartjs: true
author_data_url: /assets/data/systems_combined_rankings.json
institution_data_url: /assets/data/systems_institution_rankings.json
---

Authors ranked by number of evaluated artifacts at systems conferences ({{ site.data.summary.systems_conferences | join: ", " }}).

The total number of artifacts depends on the total number of publications: authors who publish more frequently naturally have more opportunities to contribute artifacts. To complement the raw count, we report **Artifact Rate** (percentage of tracked-conference papers with an evaluated artifact, counting only papers published in years where the conference had artifact evaluation) and **Reproducibility Rate** (percentage of artifacts receiving a "Reproduced" badge). Click any column header to re-sort.

{% include author_table_area.html %}

---

**Data:** [Systems]({{ '/assets/data/systems_combined_rankings.json' | relative_url }})
