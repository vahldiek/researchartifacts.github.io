/**
 * reprodb-ranking.js — Shared logic for combined and institution ranking tables.
 *
 * Depends on: reprodb-utils.js (window.ReproDB.escHtml, .assignDenseRanks,
 *             .bindSortableHeaders, .rankChangeHtml)
 * Provides:   window.ReproDB.RankingTable
 *
 * Usage:
 *   new ReproDB.RankingTable({ ... }).boot();
 */
(function() {
  'use strict';
  var R = window.ReproDB = window.ReproDB || {};

  /**
   * Configuration-driven ranking table with area switching, contribution
   * type filtering, sortable headers, pagination, and rank history.
   *
   * @param {object} cfg
   * @param {object} cfg.dataUrls        — {all, systems, security} area URLs
   * @param {string} cfg.historyUrl      — ranking history JSON URL
   * @param {string} cfg.baseUrl         — site base URL for links
   * @param {Array}  cfg.fixedCols       — column descriptors [{label, key, type, tip}]
   * @param {number} cfg.scoreColIdx     — index of the "Score" column that changes with filterMode
   * @param {string} cfg.nameKey         — key used for dense-rank tie-breaking ('name' or 'affiliation')
   * @param {string} cfg.historyLookupKey — how to look up an entry in the previous snapshot
   * @param {number} [cfg.pageSize=100]
   * @param {string} [cfg.defaultArea='all']
   *
   * DOM element IDs (all required):
   * @param {string} cfg.headId, cfg.bodyId, cfg.tableId, cfg.loadingId
   * @param {string} cfg.controlsId, cfg.legendId, cfg.pagerId
   * @param {string} cfg.prevBtnId, cfg.nextBtnId, cfg.pageInfoId, cfg.totalInfoId
   * @param {string} cfg.areaFilterId, cfg.contributionFilterId
   * @param {string} [cfg.totalLabel='entries']
   *
   * Callbacks:
   * @param {function} cfg.renderRow(item, index, state) — return cells HTML string
   * @param {function} cfg.onInit(data) — optional, called with raw data before filtering
   * @param {function} cfg.applyExtraFilters(baseFiltered, state) — return filtered array
   * @param {function} [cfg.onAreaChange(area)] — optional, called after area switch
   */
  function RankingTable(cfg) {
    this.cfg = cfg;
    this.dataUrls = cfg.dataUrls;
    this.historyUrl = cfg.historyUrl;
    this.baseUrl = cfg.baseUrl || '';
    this.fixedCols = cfg.fixedCols;
    this.scoreColIdx = cfg.scoreColIdx;
    this.nameKey = cfg.nameKey;
    this.historyLookupKey = cfg.historyLookupKey;
    this.pageSize = cfg.pageSize || 100;
    this.totalLabel = cfg.totalLabel || 'entries';

    // State
    this.currentArea = cfg.defaultArea || 'all';
    this.allData = [];
    this.filteredData = [];
    this.sortedData = [];
    this.yearColumns = [];
    this.currentPage = 0;
    this.sortCol = cfg.scoreColIdx;
    this.sortAsc = false;
    this.filterMode = 'both';
    this.scoreKey = 'combined_score';
    this.history = [];
    this.prevSnapshot = null;
  }

  /* ── Sorting ─────────────────────────────────────────────────────── */

  RankingTable.prototype.sortData = function() {
    this.sortedData = this.filteredData.slice();
    var colIdx = this.sortCol;
    var asc = this.sortAsc;
    var fixedCols = this.fixedCols;
    var yearColumns = this.yearColumns;
    var scoreKey = this.scoreKey;
    var scoreColIdx = this.scoreColIdx;
    var nameKey = this.nameKey;

    var key;
    if (colIdx < fixedCols.length) {
      key = (colIdx === scoreColIdx) ? scoreKey : fixedCols[colIdx].key;
    } else {
      var yr = yearColumns[colIdx - fixedCols.length];
      key = '_y' + yr;
    }

    var colType = (colIdx < fixedCols.length) ? fixedCols[colIdx].type : 'num';

    this.sortedData.sort(function(a, b) {
      var av, bv;
      if (key.indexOf('_y') === 0) {
        var y = key.slice(2);
        av = (a.years || {})[y] || (a.years || {})[parseInt(y)] || 0;
        bv = (b.years || {})[y] || (b.years || {})[parseInt(y)] || 0;
      } else if (colType === 'alpha') {
        av = (a[key] || '').toLowerCase();
        bv = (b[key] || '').toLowerCase();
      } else if (key === 'ae_ratio') {
        av = (a.ae_ratio === null || a.ae_ratio === undefined) ? Number.POSITIVE_INFINITY : a.ae_ratio;
        bv = (b.ae_ratio === null || b.ae_ratio === undefined) ? Number.POSITIVE_INFINITY : b.ae_ratio;
      } else {
        av = a[key] || 0;
        bv = b[key] || 0;
      }
      if (av < bv) return asc ? -1 : 1;
      if (av > bv) return asc ? 1 : -1;
      // Secondary sort: alphabetical by name key
      var an = (a[nameKey] || a.display_name || '').toLowerCase();
      var bn = (b[nameKey] || b.display_name || '').toLowerCase();
      if (an < bn) return -1;
      if (an > bn) return 1;
      return 0;
    });
  };

  /* ── Rank assignment ─────────────────────────────────────────────── */

  RankingTable.prototype.assignRanks = function() {
    for (var i = 0; i < this.sortedData.length; i++) {
      this.sortedData[i]._originalRank = this.sortedData[i]._baseRank || (i + 1);
      var prevScore = (i > 0) ? (this.sortedData[i - 1].combined_score || 0) : null;
      var curScore = this.sortedData[i].combined_score || 0;
      this.sortedData[i]._showRank = (i === 0 || curScore !== prevScore);
    }
  };

  /* ── Filtering ───────────────────────────────────────────────────── */

  RankingTable.prototype.applyFilter = function() {
    var filterMode = this.filterMode;

    // Step 1: filter by contribution type
    var baseFiltered = this.allData.filter(function(d) {
      if (filterMode === 'artifacts_only') return d.artifact_score > 0;
      if (filterMode === 'ae_only') return d.ae_score > 0;
      return d.combined_score > 0;
    });

    // Update score key
    if (filterMode === 'artifacts_only') {
      this.scoreKey = 'artifact_score';
    } else if (filterMode === 'ae_only') {
      this.scoreKey = 'ae_score';
    } else {
      this.scoreKey = 'combined_score';
    }
    this.sortCol = this.scoreColIdx;

    // Step 2: assign stable dense ranks
    R.assignDenseRanks(baseFiltered, this.nameKey);

    // Step 3: apply page-specific extra filters (search, geo, etc.)
    if (this.cfg.applyExtraFilters) {
      this.filteredData = this.cfg.applyExtraFilters(baseFiltered, this);
    } else {
      this.filteredData = baseFiltered;
    }

    this.sortData();
    this.currentPage = 0;
  };

  /* ── Pagination ──────────────────────────────────────────────────── */

  RankingTable.prototype.updatePageInfo = function() {
    var total = this.sortedData.length;
    var ps = this.pageSize;
    var start = ps > 0 ? this.currentPage * ps : 0;
    var end = ps > 0 ? Math.min(start + ps, total) : total;
    var pages = ps > 0 ? Math.ceil(total / ps) : 1;
    var info = total > 0 ? (start + 1) + '\u2013' + end + ' of ' + total : '0';
    document.getElementById(this.cfg.pageInfoId).textContent = info;
    document.getElementById(this.cfg.totalInfoId).textContent = total + ' ' + this.totalLabel + ' total';
    document.getElementById(this.cfg.prevBtnId).disabled = this.currentPage <= 0;
    document.getElementById(this.cfg.nextBtnId).disabled = (ps <= 0 || this.currentPage >= pages - 1);
  };

  /* ── Header ──────────────────────────────────────────────────────── */

  RankingTable.prototype.buildHeader = function() {
    var self = this;
    var tr = document.getElementById(this.cfg.headId);
    var allCols = this.fixedCols.slice();
    // Update score column tooltip dynamically
    allCols[this.scoreColIdx].tip = this.getScoreLabel();
    for (var i = 0; i < this.yearColumns.length; i++) {
      allCols.push({ label: '' + (this.yearColumns[i] % 100), key: '_y' + this.yearColumns[i], type: 'num' });
    }
    R.bindSortableHeaders(tr, allCols, { col: this.sortCol, asc: this.sortAsc }, function(idx) {
      if (self.sortCol === idx) { self.sortAsc = !self.sortAsc; }
      else { self.sortCol = idx; self.sortAsc = false; }
      self.sortData();
      self.assignRanks();
      self.currentPage = 0;
      self.render();
      return self.sortAsc;
    });
  };

  RankingTable.prototype.getScoreLabel = function() {
    if (this.filterMode === 'artifacts_only') return 'Artifact Score';
    if (this.filterMode === 'ae_only') return 'AE Service Score';
    return 'Combined Score';
  };

  /* ── Render ──────────────────────────────────────────────────────── */

  RankingTable.prototype.render = function() {
    var ps = this.pageSize;
    var start = ps > 0 ? this.currentPage * ps : 0;
    var end = ps > 0 ? start + ps : this.sortedData.length;
    var page = this.sortedData.slice(start, end);
    var rows = [];

    for (var i = 0; i < page.length; i++) {
      var item = page[i];
      var cells = this.cfg.renderRow(item, start + i, this);
      rows.push('<tr>' + cells + '</tr>');
    }
    document.getElementById(this.cfg.bodyId).innerHTML = rows.join('');
    this.updatePageInfo();
  };

  /* ── Init (called with loaded JSON) ──────────────────────────────── */

  RankingTable.prototype.init = function(data) {
    if (this.cfg.onInit) {
      this.allData = this.cfg.onInit(data, this);
    } else {
      this.allData = data;
    }

    // Extract year columns
    var yrs = {};
    for (var i = 0; i < this.allData.length; i++) {
      if (this.allData[i].years) {
        for (var y in this.allData[i].years) { yrs[y] = true; }
      }
    }
    this.yearColumns = Object.keys(yrs).map(function(y) { return parseInt(y) || y; })
      .sort(function(a, b) { return b - a; });

    this.applyFilter();
    this.buildHeader();
    this.sortData();
    this.assignRanks();
    this.render();

    document.getElementById(this.cfg.loadingId).classList.add('rdb-hidden');
    document.getElementById(this.cfg.tableId).classList.remove('rdb-hidden');
    document.getElementById(this.cfg.controlsId).classList.remove('rdb-hidden');
    if (this.cfg.legendId) document.getElementById(this.cfg.legendId).classList.remove('rdb-hidden');
    document.getElementById(this.cfg.pagerId).classList.remove('rdb-hidden');
  };

  /* ── Area loading ────────────────────────────────────────────────── */

  RankingTable.prototype.loadArea = function(area) {
    var self = this;
    this.currentArea = area;
    document.getElementById(this.cfg.loadingId).classList.remove('rdb-hidden');
    document.getElementById(this.cfg.loadingId).innerHTML = '<em>Loading ' + area + ' ranking data\u2026</em>';
    document.getElementById(this.cfg.tableId).classList.add('rdb-hidden');
    document.getElementById(this.cfg.controlsId).classList.add('rdb-hidden');
    if (this.cfg.legendId) document.getElementById(this.cfg.legendId).classList.add('rdb-hidden');
    document.getElementById(this.cfg.pagerId).classList.add('rdb-hidden');

    fetch(this.dataUrls[area])
      .then(function(r) { return r.json(); })
      .then(function(data) { self.init(data); })
      .catch(function(e) {
        document.getElementById(self.cfg.loadingId).innerHTML =
          '<em>Failed to load ' + area + ' ranking data. ' + e + '</em>';
      });
  };

  /* ── Boot (wires up events, loads history, triggers first load) ──── */

  RankingTable.prototype.boot = function() {
    var self = this;

    // Area filter
    var areaEl = document.getElementById(this.cfg.areaFilterId);
    if (areaEl) {
      areaEl.addEventListener('change', function() { self.loadArea(this.value); });
    }

    // Contribution type filter
    var contribEl = document.getElementById(this.cfg.contributionFilterId);
    if (contribEl) {
      contribEl.addEventListener('change', function() {
        self.filterMode = this.value;
        self.currentPage = 0;
        self.applyFilter();
        self.buildHeader();
        self.sortData();
        self.assignRanks();
        self.render();
      });
    }

    // Pagination
    document.getElementById(this.cfg.prevBtnId).addEventListener('click', function() {
      if (self.currentPage > 0) { self.currentPage--; self.render(); }
    });
    document.getElementById(this.cfg.nextBtnId).addEventListener('click', function() {
      var pages = self.pageSize > 0 ? Math.ceil(self.sortedData.length / self.pageSize) : 1;
      if (self.currentPage < pages - 1) { self.currentPage++; self.render(); }
    });

    // Wire up any extra event listeners (search, geo, etc.)
    if (this.cfg.bindExtraEvents) {
      this.cfg.bindExtraEvents(this);
    }

    // Load history then first area
    var doLoad = function() {
      if (self.historyUrl) {
        fetch(self.historyUrl).then(function(r) { return r.json(); }).catch(function() { return []; })
        .then(function(h) {
          self.history = h || [];
          if (self.history.length >= 2) {
            self.prevSnapshot = self.history[self.history.length - 2].entries;
          }
          self.loadArea(self.currentArea);
        });
      } else {
        self.loadArea(self.currentArea);
      }
    };

    // Lazy-init with IntersectionObserver
    var target = document.getElementById(this.cfg.loadingId);
    if ('IntersectionObserver' in window && target) {
      var io = new IntersectionObserver(function(entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) { io.disconnect(); doLoad(); break; }
        }
      }, { rootMargin: '300px 0px' });
      io.observe(target);
    } else {
      doLoad();
    }

    return this;
  };

  R.RankingTable = RankingTable;
})();
