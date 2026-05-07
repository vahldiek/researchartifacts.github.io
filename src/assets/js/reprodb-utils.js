/**
 * reprodb-utils.js — Shared utility functions for ReproDB website.
 *
 * Provides: window.ReproDB.escHtml, window.ReproDB.fetchJSON
 */
(function() {
  'use strict';
  var R = window.ReproDB = window.ReproDB || {};

  /** Escape HTML to prevent XSS. */
  R.escHtml = function(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(s));
    return d.innerHTML;
  };

  /** Fetch JSON with consistent error handling. */
  R.fetchJSON = function(url) {
    return fetch(url).then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + url);
      return r.json();
    });
  };

  /**
   * Generic null-safe sort, in place. Mirrors the comparator used by
   * ReproDB.Top10Table.doSort: missing values default to '' (alpha) or 0 (num),
   * and alpha keys are compared case-insensitively.
   *
   * @param {Array} rows  - array of objects to sort in place
   * @param {string} key  - object property to sort by
   * @param {string} type - 'alpha' for case-insensitive string compare; otherwise numeric
   * @param {boolean} asc - true for ascending, false for descending
   * @returns {Array} the same array (sorted)
   */
  R.sortRows = function(rows, key, type, asc) {
    var alpha = type === 'alpha';
    rows.sort(function(a, b) {
      var av = a[key], bv = b[key];
      if (av == null) av = alpha ? '' : 0;
      if (bv == null) bv = alpha ? '' : 0;
      if (alpha) { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
      if (av < bv) return asc ? -1 : 1;
      if (av > bv) return asc ? 1 : -1;
      return 0;
    });
    return rows;
  };

  /**
   * Build sortable <th> cells inside a <tr> and wire up click handlers.
   * Each header gets the class `reprodb-sortable`; the currently active
   * column gets `sorted-asc` or `sorted-desc` (see assets/css/reprodb-table.css).
   *
   * @param {HTMLTableRowElement} headTr - the <tr> in <thead> to populate (innerHTML cleared)
   * @param {Array<{label:string, html?:string, tip?:string}>} cols - column descriptors
   * @param {{col:number, asc:boolean}} initial - initial active column / direction
   * @param {function(number):boolean} onSort - invoked on click with the column
   *     index. The callback should update its own sort state and return the
   *     resulting `asc` flag for indicator display.
   * @returns {{setActive: function(number, boolean): void}}
   */
  R.bindSortableHeaders = function(headTr, cols, initial, onSort) {
    headTr.innerHTML = '';
    var ths = [];
    function setActive(idx, asc) {
      for (var i = 0; i < ths.length; i++) {
        ths[i].classList.remove('sorted-asc', 'sorted-desc');
      }
      if (idx >= 0 && idx < ths.length) {
        ths[idx].classList.add(asc ? 'sorted-asc' : 'sorted-desc');
      }
    }
    for (var c = 0; c < cols.length; c++) {
      var th = document.createElement('th');
      var col = cols[c];
      if (col.html != null) th.innerHTML = col.html;
      else th.textContent = col.label;
      th.className = 'reprodb-sortable';
      if (col.tip) th.title = col.tip;
      th.addEventListener('click', (function(idx) {
        return function() {
          var asc = onSort(idx);
          setActive(idx, asc);
        };
      })(c));
      ths.push(th);
      headTr.appendChild(th);
    }
    if (initial && initial.col >= 0 && initial.col < ths.length) {
      setActive(initial.col, !!initial.asc);
    }
    return { setActive: setActive };
  };

  /**
   * Assign dense ranks to an array based on combined_score.
   * Items are sorted by combined_score descending, then by nameKey alphabetically.
   * Each item gets _baseRank (dense: 1,1,2,3 not 1,1,3,4).
   *
   * @param {Array} items - array of objects to rank (modified in place)
   * @param {string} nameKey - property to use for alphabetical tie-breaking
   */
  R.assignDenseRanks = function(items, nameKey) {
    var sorted = items.slice();
    sorted.sort(function(a, b) {
      var av = a.combined_score || 0, bv = b.combined_score || 0;
      if (av > bv) return -1;
      if (av < bv) return 1;
      var an = (a[nameKey] || '').toLowerCase();
      var bn = (b[nameKey] || '').toLowerCase();
      if (an < bn) return -1;
      if (an > bn) return 1;
      return 0;
    });
    var rank = 1;
    for (var i = 0; i < sorted.length; i++) {
      if (i > 0 && (sorted[i].combined_score || 0) < (sorted[i - 1].combined_score || 0)) {
        rank++;
      }
      sorted[i]._baseRank = rank;
    }
  };

  /**
   * Produce rank-change indicator HTML for a single entry.
   * Compares current _baseRank against previous snapshot rank.
   *
   * @param {number} baseRank - current dense rank
   * @param {number|undefined} oldRank - rank from previous snapshot
   * @returns {string} HTML string (may be empty)
   */
  R.rankChangeHtml = function(baseRank, oldRank) {
    if (!baseRank || oldRank == null) return '';
    var diff = oldRank - baseRank;
    if (diff > 0) return '<span class="rdb-rank-up" title="Up ' + diff + ' from #' + oldRank + '">\u25B2' + diff + '</span>';
    if (diff < 0) return '<span class="rdb-rank-down" title="Down ' + (-diff) + ' from #' + oldRank + '">\u25BC' + (-diff) + '</span>';
    return '<span class="rank-unchanged" title="Unchanged">\u2013</span>';
  };

  /* ─── Dark-mode theme helpers ─────────────────────────────────────── */

  /**
   * Returns true if the page is currently in dark mode.
   */
  R.isDark = function() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  /**
   * Returns a palette of theme-aware colors for charts and canvas drawing.
   * All colors are safe for the current background (dark or light).
   */
  R.themeColors = function() {
    var dark = R.isDark();
    return {
      text:       dark ? '#d6d9dc' : '#333',
      textMuted:  dark ? '#aab0b8' : '#666',
      line:       dark ? '#d6d9dc' : '#333',
      grid:       dark ? '#383c43' : '#e0e0e0',
      border:     dark ? '#4a4f57' : '#ddd',
      // A "dark" dataset color that is still visible on dark backgrounds
      totalLine:  dark ? '#aab0b8' : '#333',
      totalBar:   dark ? 'rgba(170,176,184,0.7)' : 'rgba(51,51,51,0.7)',
      // Combined score line on profile pages
      combined:   dark ? '#7fb3d3' : '#2c3e50',
      separator:  dark ? '#6b7280' : '#999'
    };
  };

  /**
   * Apply Chart.js global defaults for the current theme.
   * Call once on DOMContentLoaded and again on theme change if charts are
   * rebuilt.
   */
  R.applyChartDefaults = function() {
    if (typeof Chart === 'undefined') return;
    var tc = R.themeColors();
    Chart.defaults.color = tc.text;
    Chart.defaults.borderColor = tc.grid;
    Chart.defaults.plugins.title = Chart.defaults.plugins.title || {};
    Chart.defaults.plugins.title.color = tc.text;
    Chart.defaults.plugins.legend = Chart.defaults.plugins.legend || {};
    Chart.defaults.plugins.legend.labels = Chart.defaults.plugins.legend.labels || {};
    Chart.defaults.plugins.legend.labels.color = tc.text;
    // Scale defaults
    Chart.defaults.scale = Chart.defaults.scale || {};
    Chart.defaults.scale.ticks = Chart.defaults.scale.ticks || {};
    Chart.defaults.scale.ticks.color = tc.text;
    Chart.defaults.scale.grid = Chart.defaults.scale.grid || {};
    Chart.defaults.scale.grid.color = tc.grid;
    Chart.defaults.scale.title = Chart.defaults.scale.title || {};
    Chart.defaults.scale.title.color = tc.text;
  };

  /**
   * Listen for runtime theme changes and update all Chart.js instances + redraw
   * canvas heatmaps. Page-specific scripts can register redraw callbacks via
   * ReproDB.onThemeChange(fn).
   */
  var themeCallbacks = [];
  R.onThemeChange = function(fn) { themeCallbacks.push(fn); };

  window.addEventListener('reprodb-theme-change', function() {
    // Update Chart.js global defaults
    R.applyChartDefaults();
    // Update all existing Chart.js instances
    if (typeof Chart !== 'undefined') {
      var tc = R.themeColors();
      Object.keys(Chart.instances || {}).forEach(function(id) {
        var chart = Chart.instances[id];
        var opts = chart.options;
        // Update scales
        Object.keys(opts.scales || {}).forEach(function(axis) {
          var s = opts.scales[axis];
          if (s.ticks) s.ticks.color = tc.text;
          if (s.grid) s.grid.color = tc.grid;
          if (s.title) s.title.color = tc.text;
        });
        // Update plugins
        if (opts.plugins) {
          if (opts.plugins.title) opts.plugins.title.color = tc.text;
          if (opts.plugins.legend && opts.plugins.legend.labels) opts.plugins.legend.labels.color = tc.text;
          if (opts.plugins.datalabels) opts.plugins.datalabels.color = tc.text;
        }
        chart.update('none');
      });
    }
    // Fire page-specific callbacks (heatmap redraws, etc.)
    themeCallbacks.forEach(function(fn) { fn(); });
  });
})();
