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
})();
