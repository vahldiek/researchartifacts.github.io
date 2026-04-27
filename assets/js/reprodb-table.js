/**
 * reprodb-table.js — Reusable paginated sortable table for ReproDB.
 *
 * Depends on: reprodb-utils.js (window.ReproDB.escHtml)
 * Provides:   window.ReproDB.Top10Table
 *
 * Usage:
 *   new ReproDB.Top10Table({ headId, bodyId, ... }).init(dataArray);
 */
(function() {
  'use strict';
  var R = window.ReproDB = window.ReproDB || {};

  function Top10Table(cfg) {
    this.headId      = cfg.headId;
    this.bodyId      = cfg.bodyId;
    this.controlsId  = cfg.controlsId;
    this.legendId    = cfg.legendId;
    this.loadingId   = cfg.loadingId;
    this.tableId     = cfg.tableId;
    this.pagerDivId  = cfg.pagerDivId;
    this.prevBtnId   = cfg.prevBtnId;
    this.nextBtnId   = cfg.nextBtnId;
    this.pageInfoId  = cfg.pageInfoId;
    this.totalId     = cfg.totalId;
    this.searchId    = cfg.searchId;
    this.cols        = cfg.cols;
    this.renderRow   = cfg.renderRow;
    this.sortCol     = cfg.sortCol || 0;
    this.sortAsc     = cfg.sortAsc !== undefined ? cfg.sortAsc : false;
    this.allData     = [];
    this.filtered    = [];
    this.sorted      = [];
    this.page        = 0;
    this.pageSize    = cfg.pageSize || 10;
    this.searchQuery = '';

    var self = this;
    document.getElementById(this.prevBtnId).addEventListener('click', function() {
      if (self.page > 0) { self.page--; self.render(); }
    });
    document.getElementById(this.nextBtnId).addEventListener('click', function() {
      var pages = Math.ceil(self.sorted.length / self.pageSize);
      if (self.page < pages - 1) { self.page++; self.render(); }
    });
    if (this.searchId) {
      var timer = null;
      document.getElementById(this.searchId).addEventListener('input', function() {
        clearTimeout(timer);
        var val = this.value;
        timer = setTimeout(function() {
          self.searchQuery = val.toLowerCase().trim();
          self.applyFilter();
          self.page = 0;
          self.doSort();
          self.render();
        }, 200);
      });
    }
  }

  Top10Table.prototype.init = function(data) {
    this.allData = data;
    this.applyFilter();
    this.buildHeader();
    this.doSort();
    this.render();
    document.getElementById(this.loadingId).style.display = 'none';
    document.getElementById(this.tableId).style.display = '';
    document.getElementById(this.controlsId).style.display = '';
    if (this.legendId) document.getElementById(this.legendId).style.display = '';
    document.getElementById(this.pagerDivId).style.display = '';
  };

  Top10Table.prototype.applyFilter = function() {
    if (!this.searchQuery) { this.filtered = this.allData.slice(); return; }
    var q = this.searchQuery;
    var searchKeys = this.cols.filter(function(c) { return c.type === 'alpha'; }).map(function(c) { return c.key; });
    this.filtered = this.allData.filter(function(d) {
      for (var i = 0; i < searchKeys.length; i++) {
        if ((d[searchKeys[i]] || '').toLowerCase().indexOf(q) >= 0) return true;
      }
      return false;
    });
  };

  Top10Table.prototype.doSort = function() {
    var col = this.cols[this.sortCol];
    if (!col) return;
    var key = col.key, type = col.type, asc = this.sortAsc;
    var cmp = function(a, b) {
      var av = a[key], bv = b[key];
      if (av == null) av = type === 'alpha' ? '' : 0;
      if (bv == null) bv = type === 'alpha' ? '' : 0;
      if (type === 'alpha') { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
      if (av < bv) return asc ? -1 : 1;
      if (av > bv) return asc ? 1 : -1;
      return 0;
    };
    var full = this.allData.slice();
    full.sort(cmp);
    for (var i = 0; i < full.length; i++) full[i]._rank = i + 1;
    this.sorted = this.filtered.slice();
    this.sorted.sort(cmp);
  };

  Top10Table.prototype.render = function() {
    var total = this.sorted.length;
    var pages = Math.max(1, Math.ceil(total / this.pageSize));
    if (this.page >= pages) this.page = pages - 1;
    if (this.page < 0) this.page = 0;
    var start = this.page * this.pageSize;
    var end = Math.min(start + this.pageSize, total);
    var display = this.sorted.slice(start, end);
    var rows = [];
    for (var i = 0; i < display.length; i++) {
      rows.push('<tr>' + this.renderRow(display[i], start + i) + '</tr>');
    }
    document.getElementById(this.bodyId).innerHTML = rows.join('');
    document.getElementById(this.prevBtnId).disabled = this.page <= 0;
    document.getElementById(this.nextBtnId).disabled = this.page >= pages - 1;
    var info = total > 0 ? (start + 1) + '\u2013' + end + ' of ' + total : '0';
    document.getElementById(this.pageInfoId).textContent = info;
    document.getElementById(this.totalId).textContent =
      this.searchQuery ? total + ' matching' : this.allData.length + ' total';
  };

  Top10Table.prototype.buildHeader = function() {
    var self = this;
    var tr = document.getElementById(this.headId);
    tr.innerHTML = '';
    for (var c = 0; c < this.cols.length; c++) {
      var th = document.createElement('th');
      th.textContent = this.cols[c].label;
      th.className = 'cp-sortable';
      if (this.cols[c].tip) th.title = this.cols[c].tip;
      if (c === this.sortCol) th.classList.add(this.sortAsc ? 'cp-sorted-asc' : 'cp-sorted-desc');
      th.addEventListener('click', (function(idx) {
        return function(e) {
          if (self.sortCol === idx) self.sortAsc = !self.sortAsc;
          else { self.sortCol = idx; self.sortAsc = false; }
          self.doSort();
          self.page = 0;
          self.render();
          var ths = document.getElementById(self.headId).querySelectorAll('.cp-sortable');
          ths.forEach(function(h) { h.classList.remove('cp-sorted-asc', 'cp-sorted-desc'); });
          e.currentTarget.classList.add(self.sortAsc ? 'cp-sorted-asc' : 'cp-sorted-desc');
        };
      })(c));
      tr.appendChild(th);
    }
  };

  R.Top10Table = Top10Table;
})();
