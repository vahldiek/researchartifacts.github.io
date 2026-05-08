---
title: "Systems Conferences"
permalink: /systems/
---

Artifact evaluation statistics for systems conferences ({{ site.data.summary.systems_conferences | join: ", " }}).

Each cell shows **total (available, functional, reproduced)**.

{% if site.data.artifacts_by_conference %}

## Artifacts per Conference

<div class="rdb-md-chart" style="max-width:600px;">
<div id="sysConfChart" style="height:300px"></div>
</div>

<div class="rdb-chart-wide rdb-chart-wrap--xl">
<div id="sysConfHeatmap" style="width:100%;height:100%"></div>
</div>

{% else %}

*Statistics data is being generated. Please check back soon.*

{% endif %}


## Top 10 Most Prolific Contributors

Ranked by combined score (artifacts published + AE committee memberships) at systems conferences. See the full [systems combined rankings]({{ '/systems/combined_rankings.html' | relative_url }}) for more.

<div id="sysTop10Table"></div>

<script>
(function(){
  var escHtml = ReproDB.escHtml;
  fetch('{{ "/assets/data/systems_combined_rankings.json" | relative_url }}')
    .then(function(r){ return r.json(); })
    .then(function(data){
      data.sort(function(a,b){ return (b.combined_score||0) - (a.combined_score||0); });
      ReproDB.createTable('#sysTop10Table', {
        data: data.slice(0, 10),
        pagination: false,
        columns: [
          { title: '#', formatter: 'rownum', width: 40, headerSort: false },
          { title: 'Name', field: 'name', formatter: function(cell) {
            var d = cell.getData(), n = (d.name||'').replace(/\t/g,' ').replace(/\s+\d{4}$/,'');
            return '<a href="/profile.html?name=' + encodeURIComponent(d.name) + '">' + escHtml(n) + '</a>';
          }},
          { title: 'Affiliation', field: 'affiliation', formatter: function(cell) {
            var d = cell.getData(), a = (d.affiliation||'').replace(/^_/,'');
            return '<a href="/profile.html?type=institution&name=' + encodeURIComponent(d.affiliation) + '">' + escHtml(a) + '</a>';
          }},
          { title: 'Artifacts', field: 'artifact_count', sorter: 'number' },
          { title: 'AE Memberships', field: 'ae_memberships', sorter: 'number' },
          { title: 'AE Chair', field: 'chair_count', sorter: 'number' },
          { title: 'Score', field: 'combined_score', sorter: 'number', formatter: function(cell) { return '<strong>' + (cell.getValue()||0) + '</strong>'; } },
          { title: 'Conferences', field: 'conferences', formatter: function(cell) { return (cell.getValue()||[]).join(', '); }, headerSort: false }
        ]
      });
    });
})();
</script>

## Repository Statistics

{% if site.data.repo_stats.by_conference.size > 0 %}
High-level GitHub repository metrics for systems conferences. See the full [systems repository statistics]({{ '/systems/repo_stats.html' | relative_url }}) for charts and details.

| Conference | GitHub Repos | Total Stars | Median Stars | Total Forks | Median Forks | Max Stars |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
{% for c in site.data.repo_stats.by_conference %}{% assign _is_sys = false %}{% for conf in site.data.artifacts_by_conference %}{% if conf.name == c.name and conf.category == "systems" %}{% assign _is_sys = true %}{% endif %}{% endfor %}{% if _is_sys %}| **{{ c.name }}** | {{ c.github_repos }} | {{ c.total_stars }} | {{ c.median_stars }} | {{ c.total_forks }} | {{ c.median_forks }} | {{ c.max_stars }} |
{% endif %}{% endfor %}
{% else %}
*Repository statistics not yet available.*
{% endif %}

{% if site.data.artifacts_by_conference %}
<script>
document.addEventListener('DOMContentLoaded', function() {
  var years = [{% for y in site.data.artifacts_by_year %}"{{ y.year }}"{% unless forloop.last %},{% endunless %}{% endfor %}];
  var confColors = ['#E6194B','#3CB44B','#4363D8','#F58231','#911EB4','#42D4F4'];
  var confDatasets = [];
  {% assign ci = 0 %}{% for conf in site.data.artifacts_by_conference %}{% if conf.category == "systems" %}
  (function(){
    var data = [];
    var confYears = { {% for yd in conf.years %}"{{ yd.year }}": {{ yd.total }}{% unless forloop.last %},{% endunless %}{% endfor %} };
    years.forEach(function(yr){ data.push(confYears[yr] || 0); });
    confDatasets.push({ label: "{{ conf.name }}", data: data, borderColor: confColors[{{ ci }}%confColors.length], fill: false, tension: 0.2 });
  })();
  {% assign ci = ci | plus: 1 %}{% endif %}{% endfor %}

  var chart = ReproDB.initEChart('sysConfChart');
  chart.setOption({
    title: { text: 'Systems: Artifacts per Conference', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, type: 'scroll' },
    grid: { containLabel: true, left: 40, right: 20, bottom: 50, top: 40 },
    xAxis: { type: 'category', data: years },
    yAxis: { type: 'value', name: 'Artifacts', min: 0 },
    series: confDatasets.map(function(ds) {
      return { name: ds.label, type: 'line', data: ds.data, smooth: 0.2, itemStyle: { color: ds.borderColor } };
    })
  });
  ReproDB.registerEChart(chart);

  /* ── Heatmap: Artifacts per Conference ── */
  var hmEl = document.getElementById('sysConfHeatmap');
  if (hmEl) {
    var confNames = confDatasets.map(function(ds) { return ds.label; });
    var rawHeatData = [];
    var maxVal = 0;
    confDatasets.forEach(function(ds, ci) {
      ds.data.forEach(function(v, yi) {
        rawHeatData.push({ x: yi, y: ci, v: v });
        if (v > maxVal) maxVal = v;
      });
    });

    // Lookup badge details per conference/year for tooltips
    var badgeMap = {};
    {% for conf in site.data.artifacts_by_conference %}{% if conf.category == "systems" %}
    {% for yd in conf.years %}
    badgeMap["{{ conf.name }}_{{ yd.year }}"] = { total: {{ yd.total }}, available: {{ yd.available }}, functional: {{ yd.functional }}, reproducible: {{ yd.reproducible }} };
    {% endfor %}
    {% endif %}{% endfor %}

    function hmCellColor(v) {
      var dark = ReproDB.isDark();
      if (v === 0) return dark ? 'rgba(50,55,65,0.5)' : 'rgba(220,220,220,0.3)';
      var t = v / maxVal;
      if (dark) {
        var r = Math.round(20 + 20 * t);
        var g = Math.round(50 + 70 * t);
        var b = Math.round(80 + 130 * t);
        return 'rgb(' + r + ',' + g + ',' + b + ')';
      }
      return 'rgba(41,128,185,' + (0.15 + t * 0.7) + ')';
    }

    function hmLabelColor(v) {
      var dark = ReproDB.isDark();
      var tc = ReproDB.themeColors();
      var t = maxVal > 0 ? v / maxVal : 0;
      var textThreshold = dark ? 0.25 : 0.6;
      return (v > 0 && t > textThreshold) ? '#fff' : tc.text;
    }

    function buildHmData() {
      return rawHeatData.map(function(d) {
        return { value: [d.x, d.y, d.v], itemStyle: { color: hmCellColor(d.v) }, label: { color: hmLabelColor(d.v) } };
      });
    }

    var hmChart = ReproDB.initEChart(hmEl);
    function setSysHeatmap() {
      var dark = ReproDB.isDark();
      hmChart.setOption({
        title: { text: 'Systems: Artifacts per Conference × Year', left: 'center', textStyle: { fontSize: 14 } },
        tooltip: { formatter: function(p) {
          var cn = confNames[p.value[1]], yr = years[p.value[0]];
          var key = cn + '_' + yr, b = badgeMap[key];
          if (b) return cn + ' ' + yr + ': ' + b.total + ' artifacts<br>Available: ' + b.available + ' · Functional: ' + b.functional + ' · Reproduced: ' + b.reproducible;
          return cn + ' (' + yr + '): ' + p.value[2];
        }},
        grid: { containLabel: true, left: 20, right: 20, bottom: 30, top: 40 },
        xAxis: { type: 'category', data: years, splitArea: { show: false } },
        yAxis: { type: 'category', data: confNames, splitArea: { show: false }, inverse: true },
        series: [{ type: 'heatmap', data: buildHmData(), label: { show: true, fontSize: 10,
          formatter: function(p) { return p.value[2] > 0 ? p.value[2] : ''; }
        }, itemStyle: { borderColor: dark ? '#333' : '#fff', borderWidth: 1 } }]
      });
    }
    setSysHeatmap();
    ReproDB.registerEChart(hmChart);
    ReproDB.onThemeChange(setSysHeatmap);
  }
});
</script>
{% endif %}

---

**Data:** [Artifacts by Conference]({{ '/assets/data/artifacts.json' | relative_url }}) | [Rankings]({{ '/assets/data/systems_combined_rankings.json' | relative_url }}) | [Repository Stats]({{ '/assets/data/systems_top_repos.json' | relative_url }})
