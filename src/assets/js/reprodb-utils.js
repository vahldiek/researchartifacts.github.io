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
})();
