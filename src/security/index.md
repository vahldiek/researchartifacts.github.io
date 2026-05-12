---
title: "Security Conferences"
permalink: /security/
---

Artifact evaluation statistics for security conferences ({{ site.data.summary.security_conferences | join: ", " }}).

{% if site.data.artifacts_by_conference %}

<div class="rdb-cards">
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.summary.security_artifacts }}</div>
    <div class="rdb-card-label">Total Artifacts</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.summary.security_conferences | size }}</div>
    <div class="rdb-card-label">Conferences</div>
  </div>
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.summary.year_range }}</div>
    <div class="rdb-card-label">Year Range</div>
  </div>
  {% if site.data.committee_stats %}
  <div class="rdb-card">
    <div class="rdb-card-value">{{ site.data.committee_stats.unique_members_security }}</div>
    <div class="rdb-card-label">AE Members</div>
  </div>
  {% endif %}
</div>

<div class="rdb-cards">
  <div class="rdb-card">
    <a href="{{ '/combined_rankings.html' | relative_url }}?area=security&contrib=artifacts">
      <div class="rdb-card-value">👤</div>
      <div class="rdb-card-label">Author Rankings</div>
    </a>
  </div>
  <div class="rdb-card">
    <a href="{{ '/institution_rankings.html' | relative_url }}?area=security&contrib=artifacts">
      <div class="rdb-card-value">🏛</div>
      <div class="rdb-card-label">Institution Rankings</div>
    </a>
  </div>
  <div class="rdb-card">
    <a href="{{ '/combined_rankings.html' | relative_url }}?area=security&contrib=ae">
      <div class="rdb-card-value">📋</div>
      <div class="rdb-card-label">AE Service</div>
    </a>
  </div>
  <div class="rdb-card">
    <a href="{{ '/security/committee.html' | relative_url }}">
      <div class="rdb-card-value">📊</div>
      <div class="rdb-card-label">AE Statistics</div>
    </a>
  </div>
  <div class="rdb-card">
    <a href="{{ '/security/repo_stats.html' | relative_url }}">
      <div class="rdb-card-value">📦</div>
      <div class="rdb-card-label">Repositories</div>
    </a>
  </div>
</div>

## Artifacts per Conference

<div class="rdb-md-chart" id="secConfChartWrap" style="max-width:600px;display:none;">
<div id="secConfChart" style="height:300px"></div>
</div>

<div class="rdb-chart-wide rdb-chart-wrap--lg">
<div id="secConfHeatmap" style="width:100%;height:100%"></div>
</div>

## Conference Overview

{% include conference_overview_table.html category="security" %}

{% else %}

*Statistics data is being generated. Please check back soon.*

{% endif %}

{% if site.data.artifacts_by_conference %}
<script>
document.addEventListener('DOMContentLoaded', function() {
  var years = [{% for y in site.data.artifacts_by_year %}"{{ y.year }}"{% unless forloop.last %},{% endunless %}{% endfor %}];
  var confColors = ['#c0392b','#2980b9','#27ae60','#8e44ad','#e67e22','#1abc9c','#34495e','#d4ac0d'];
  var confDatasets = [];
  {% assign ci = 0 %}{% for conf in site.data.artifacts_by_conference %}{% if conf.category == "security" %}
  (function(){
    var data = [];
    var confYears = { {% for yd in conf.years %}"{{ yd.year }}": {{ yd.total }}{% unless forloop.last %},{% endunless %}{% endfor %} };
    years.forEach(function(yr){ data.push(confYears[yr] || 0); });
    confDatasets.push({ label: "{{ conf.name }}", data: data, borderColor: confColors[{{ ci }}%confColors.length], fill: false, tension: 0.2 });
  })();
  {% assign ci = ci | plus: 1 %}{% endif %}{% endfor %}

  /* Show line chart only when many years of data exist */
  if (years.length > 15) {
    document.getElementById('secConfChartWrap').style.display = '';
    var chart = ReproDB.initEChart('secConfChart');
    chart.setOption({
      title: { text: 'Security: Artifacts per Conference', left: 'center' },
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
  }

  /* ── Heatmap: Artifacts per Conference ── */
  var hmEl = document.getElementById('secConfHeatmap');
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
    {% for conf in site.data.artifacts_by_conference %}{% if conf.category == "security" %}
    {% for yd in conf.years %}
    badgeMap["{{ conf.name }}_{{ yd.year }}"] = { total: {{ yd.total }}, available: {{ yd.available }}, functional: {{ yd.functional }}, reproducible: {{ yd.reproducible }} };
    {% endfor %}
    {% endif %}{% endfor %}

    function hmCellColor(v) {
      var dark = ReproDB.isDark();
      if (v === 0) return dark ? 'rgba(50,55,65,0.5)' : 'rgba(220,220,220,0.3)';
      var t = v / maxVal;
      if (dark) {
        var r = Math.round(80 + 140 * t);
        var g = Math.round(20 + 20 * t);
        var b = Math.round(20 + 15 * t);
        return 'rgb(' + r + ',' + g + ',' + b + ')';
      }
      return 'rgba(192,57,43,' + (0.15 + t * 0.7) + ')';
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
    function setSecHeatmap() {
      var dark = ReproDB.isDark();
      hmChart.setOption({
        title: { text: 'Security: Artifacts per Conference × Year', left: 'center', textStyle: { fontSize: 14 } },
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
    setSecHeatmap();
    ReproDB.registerEChart(hmChart);
    ReproDB.onThemeChange(setSecHeatmap);
  }
});
</script>
{% endif %}

{% include data_footer.html files="artifacts.json,security_combined_rankings.json,security_top_repos.json,participation_stats.json" %}
