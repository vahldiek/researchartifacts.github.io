/**
 * ReproDBProfile — shared utilities for author & institution profile pages.
 * Provides: escHtml, cleanName, badgeHtml, card, initSearch.
 */
var ReproDBProfile = (function() {
  'use strict';

  function escHtml(s) {
    if (!s) return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function cleanName(n) {
    return (n || '').replace(/\s+\d{4}$/, '').replace(/\t/g, ' ');
  }

  function badgeHtml(badges) {
    if (!badges) return '';
    var list = Array.isArray(badges) ? badges : badges.split(',');
    return list.map(function(b) {
      var bl = b.trim().toLowerCase();
      var cls = 'badge-available';
      var label = b.trim().replace(/^Badges:\s*/i, '');
      if (bl.indexOf('functional') >= 0) cls = 'badge-functional';
      else if (bl.indexOf('reproduc') >= 0 || bl.indexOf('reusable') >= 0) cls = 'badge-reproducible';
      return '<span class="badge-tag ' + cls + '">' + escHtml(label) + '</span>';
    }).join(' ');
  }

  function card(value, label) {
    return '<div class="score-card"><div class="val">' + value + '</div><div class="lbl">' + label + '</div></div>';
  }

  /**
   * Initialise search/autocomplete, share button, and URL management.
   *
   * cfg.searchBoxId      – <input> element ID
   * cfg.resultsListId    – <ul> autocomplete list ID
   * cfg.shareBtnId       – share <span> element ID
   * cfg.loadingId        – loading message element ID
   * cfg.maxResults       – max autocomplete items (default 30)
   * cfg.filterItems(q)   – return array of matching items for query string q
   * cfg.renderResult(item) – return {key: string, html: string}
   * cfg.onSelect(key)    – render profile; return {displayValue, urlParams?} or null
   * cfg.resolveFromUrl(params) – return {key, displayValue} | {search: string} | null
   */
  function initSearch(cfg) {
    var searchBox = document.getElementById(cfg.searchBoxId);
    var resultsList = document.getElementById(cfg.resultsListId);
    var shareBtn = document.getElementById(cfg.shareBtnId);
    var maxResults = cfg.maxResults || 30;
    var activeIdx = -1;

    function showShare() {
      if (shareBtn) shareBtn.classList.remove('rdb-hidden');
    }

    if (shareBtn) {
      shareBtn.addEventListener('click', function() {
        var url = window.location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function() { flashCopied(); });
        } else {
          var ta = document.createElement('textarea');
          ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
          document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); document.body.removeChild(ta);
          flashCopied();
        }
      });
    }

    function flashCopied() {
      if (!shareBtn) return;
      shareBtn.classList.add('copied');
      setTimeout(function() { shareBtn.classList.remove('copied'); }, 1500);
    }

    function showResults(matches) {
      resultsList.innerHTML = '';
      if (matches.length === 0) { resultsList.classList.add('rdb-hidden'); return; }
      activeIdx = -1;
      var shown = matches.slice(0, maxResults);
      for (var i = 0; i < shown.length; i++) {
        var item = cfg.renderResult(shown[i]);
        var li = document.createElement('li');
        li.dataset.key = item.key;
        li.innerHTML = item.html;
        li.addEventListener('click', function() { doSelect(this.dataset.key); });
        resultsList.appendChild(li);
      }
      if (matches.length > maxResults) {
        var more = document.createElement('li');
        more.style.color = '#999';
        more.textContent = '\u2026 and ' + (matches.length - maxResults) + ' more \u2014 type to narrow';
        resultsList.appendChild(more);
      }
      resultsList.classList.remove('rdb-hidden');
    }

    function doSelect(key) {
      resultsList.classList.add('rdb-hidden');
      var result = cfg.onSelect(key);
      if (!result) return;
      if (result.displayValue !== undefined) searchBox.value = result.displayValue;
      var url = new URL(window.location);
      url.searchParams.delete('q');
      url.searchParams.delete('name');
      url.searchParams.delete('id');
      url.searchParams.set('name', key);
      if (result.urlParams) {
        for (var k in result.urlParams) {
          if (result.urlParams.hasOwnProperty(k)) url.searchParams.set(k, result.urlParams[k]);
        }
      }
      history.pushState(null, '', url);
      showShare();
    }

    searchBox.addEventListener('input', function() {
      var q = this.value.trim().toLowerCase();
      if (q.length < 2) { resultsList.classList.add('rdb-hidden'); return; }
      var matches = cfg.filterItems(q);
      showResults(matches);
      var url = new URL(window.location);
      url.searchParams.set('q', this.value.trim());
      url.searchParams.delete('name');
      url.searchParams.delete('id');
      history.replaceState(null, '', url);
    });

    searchBox.addEventListener('keydown', function(e) {
      var items = resultsList.querySelectorAll('li[data-key]');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIdx = Math.min(activeIdx + 1, items.length - 1);
        items.forEach(function(li, i) { li.classList.toggle('active', i === activeIdx); });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIdx = Math.max(activeIdx - 1, 0);
        items.forEach(function(li, i) { li.classList.toggle('active', i === activeIdx); });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIdx >= 0 && items[activeIdx]) doSelect(items[activeIdx].dataset.key);
      } else if (e.key === 'Escape') {
        resultsList.classList.add('rdb-hidden');
      }
    });

    document.addEventListener('click', function(e) {
      if (!searchBox.contains(e.target) && !resultsList.contains(e.target)) {
        resultsList.classList.add('rdb-hidden');
      }
    });

    return {
      /** Call after data is loaded to activate the page. */
      activate: function() {
        document.getElementById(cfg.loadingId).classList.add('rdb-hidden');
        searchBox.classList.remove('rdb-hidden');
        var params = new URLSearchParams(window.location.search);
        var resolved = cfg.resolveFromUrl(params);
        if (resolved && resolved.key) {
          searchBox.value = resolved.displayValue;
          cfg.onSelect(resolved.key);
          showShare();
        } else {
          var q = (resolved && resolved.search) || params.get('q');
          if (q) {
            searchBox.value = q;
            searchBox.dispatchEvent(new Event('input'));
          }
        }
      },
      select: doSelect,
      showShare: showShare
    };
  }

  return {
    escHtml: escHtml,
    cleanName: cleanName,
    badgeHtml: badgeHtml,
    card: card,
    initSearch: initSearch
  };
})();
