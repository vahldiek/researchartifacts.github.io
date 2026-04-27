/**
 * reprodb-chart.js — Tiny SVG-based replacement for Chart.js.
 *
 * Exposes `window.Chart` with a Chart.js-compatible subset just large enough
 * for ReproDB's site:
 *   - type: 'line' | 'bar'
 *   - data.labels, data.datasets[]
 *     (label, data, borderColor, backgroundColor, borderWidth, borderDash,
 *      pointRadius, fill ('-1' for band fill to previous dataset),
 *      tension (ignored — straight segments), yAxisID, stack)
 *   - options.responsive (always true)
 *   - options.plugins.title.{display,text}
 *   - options.plugins.legend.{display,position,labels.filter}
 *   - options.scales.<axisId>.{type,position,beginAtZero,reverse,stacked,
 *                              title.{display,text},grid.drawOnChartArea,
 *                              ticks.precision/stepSize}
 *   - options.interaction.mode = 'index' (vertical crosshair + tooltip)
 *   - chart.destroy()
 *
 * Intentional limitations vs Chart.js: no animations, no per-point hover
 * styling, no logarithmic scales, no `chart.update()` (just create a new one).
 *
 * Size: ~12 KB unminified, ~4 KB minified vs Chart.js's ~150 KB.
 */
(function() {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var DEFAULT_W = 600;
  var DEFAULT_H = 320;
  var FONT = '11px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';
  var TITLE_FONT = 'bold 13px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';

  function el(name, attrs, parent) {
    var n = document.createElementNS(SVG_NS, name);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function escHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** Pick a useful canvas-or-context element. Chart.js accepts both. */
  function resolveCanvas(target) {
    if (!target) return null;
    if (target.canvas) return target.canvas;          // CanvasRenderingContext2D
    if (target.tagName) return target;                // HTMLElement
    return null;
  }

  /** Compute "nice" tick values for an axis range. */
  function niceTicks(min, max, count) {
    count = count || 5;
    if (min === max) { min -= 1; max += 1; }
    var range = max - min;
    var rough = range / count;
    var pow10 = Math.pow(10, Math.floor(Math.log10(rough)));
    var norm = rough / pow10;
    var step;
    if (norm < 1.5) step = 1 * pow10;
    else if (norm < 3) step = 2 * pow10;
    else if (norm < 7) step = 5 * pow10;
    else step = 10 * pow10;
    var tMin = Math.floor(min / step) * step;
    var tMax = Math.ceil(max / step) * step;
    var ticks = [];
    for (var v = tMin; v <= tMax + step / 2; v += step) {
      ticks.push(parseFloat(v.toFixed(12)));
    }
    return { ticks: ticks, min: tMin, max: tMax, step: step };
  }

  function fmtNum(v, precision) {
    if (v == null || isNaN(v)) return '';
    if (precision != null) return v.toFixed(precision);
    if (Math.abs(v) >= 1000) return v.toLocaleString();
    if (Math.abs(v) >= 10 || v === Math.floor(v)) return String(v);
    return parseFloat(v.toFixed(2)).toString();
  }

  /** Group all series by their yAxisID (default: 'y'). */
  function groupByAxis(datasets) {
    var groups = {};
    for (var i = 0; i < datasets.length; i++) {
      var ax = datasets[i].yAxisID || 'y';
      (groups[ax] = groups[ax] || []).push({ ds: datasets[i], idx: i });
    }
    return groups;
  }

  /** Compute min/max for an axis given its datasets and scale config. */
  function axisRange(scaleCfg, datasetEntries, isStacked, type) {
    var min = Infinity, max = -Infinity;
    if (isStacked && type === 'bar') {
      // Build per-label stacks per `stack` group.
      var stacks = {};
      datasetEntries.forEach(function(e) {
        var key = e.ds.stack || '_default';
        var arr = stacks[key] = stacks[key] || [];
        for (var i = 0; i < e.ds.data.length; i++) {
          var v = +e.ds.data[i] || 0;
          arr[i] = (arr[i] || 0) + v;
        }
      });
      for (var k in stacks) {
        for (var j = 0; j < stacks[k].length; j++) {
          if (stacks[k][j] < min) min = stacks[k][j];
          if (stacks[k][j] > max) max = stacks[k][j];
        }
      }
    } else {
      datasetEntries.forEach(function(e) {
        for (var i = 0; i < e.ds.data.length; i++) {
          var v = e.ds.data[i];
          if (v == null || isNaN(v)) continue;
          v = +v;
          if (v < min) min = v;
          if (v > max) max = v;
        }
      });
    }
    if (!isFinite(min)) { min = 0; max = 1; }
    if (scaleCfg && scaleCfg.beginAtZero && min > 0) min = 0;
    if (scaleCfg && scaleCfg.beginAtZero && max < 0) max = 0;
    var t = niceTicks(min, max, 5);
    if (scaleCfg && scaleCfg.beginAtZero) {
      if (min >= 0) t.min = 0;
      if (max <= 0) t.max = 0;
      t.ticks = t.ticks.filter(function(v) { return v >= t.min && v <= t.max; });
      if (t.ticks[0] !== t.min) t.ticks.unshift(t.min);
      if (t.ticks[t.ticks.length - 1] !== t.max) t.ticks.push(t.max);
    }
    return t;
  }

  /** Convert a value to color with optional alpha override. */
  function colorOf(c, fallback) {
    return c || fallback;
  }

  // ---------------------------------------------------------------------------
  // Renderer
  // ---------------------------------------------------------------------------

  function Chart(target, config) {
    this.canvas = resolveCanvas(target);
    if (!this.canvas) throw new Error('Chart: invalid target');
    this.config = config || {};
    this._listeners = [];
    this._render();
  }

  Chart.prototype.destroy = function() {
    var p = this._wrap && this._wrap.parentNode;
    if (this._wrap) {
      this._listeners.forEach(function(f) { f(); });
      this._listeners = [];
      if (this._wrap.parentNode) this._wrap.parentNode.removeChild(this._wrap);
    }
    if (this._origDisplay !== undefined) {
      this.canvas.style.display = this._origDisplay;
    }
  };

  Chart.prototype._render = function() {
    var cfg = this.config;
    var type = cfg.type || 'line';
    var data = cfg.data || { labels: [], datasets: [] };
    var labels = data.labels || [];
    var datasets = (data.datasets || []).slice();
    var options = cfg.options || {};
    var plugins = options.plugins || {};
    var titleCfg = plugins.title || {};
    var legendCfg = plugins.legend || {};

    // --- Determine size from canvas / parent ---
    var rect = this.canvas.getBoundingClientRect();
    var width = Math.max(280, Math.floor(rect.width)) || DEFAULT_W;
    // Chart.js default aspect ratio for line/bar is 2:1
    var height = this.canvas.height
      ? Math.floor(this.canvas.height)
      : Math.max(180, Math.round(width / 2));
    if (height > 500) height = Math.round(width / 2);

    // --- Build wrapper that replaces the <canvas> visually ---
    var wrap = document.createElement('div');
    wrap.className = 'reprodb-chart';
    wrap.style.position = 'relative';
    wrap.style.width = '100%';
    wrap.style.maxWidth = width + 'px';

    var svg = el('svg', {
      xmlns: SVG_NS,
      viewBox: '0 0 ' + width + ' ' + height,
      width: '100%',
      height: height,
      role: 'img',
      'aria-label': (titleCfg.display && titleCfg.text) || 'chart'
    });
    wrap.appendChild(svg);

    // Hide the original canvas; insert wrapper after it.
    this._origDisplay = this.canvas.style.display;
    this.canvas.style.display = 'none';
    this.canvas.parentNode.insertBefore(wrap, this.canvas.nextSibling);
    this._wrap = wrap;

    // --- Determine axis groups ---
    var scales = options.scales || {};
    var axisGroups = groupByAxis(datasets);
    var leftAxisId = null, rightAxisId = null;
    Object.keys(axisGroups).forEach(function(id) {
      var pos = (scales[id] && scales[id].position) || (leftAxisId ? 'right' : 'left');
      if (pos === 'right') rightAxisId = rightAxisId || id;
      else leftAxisId = leftAxisId || id;
    });
    // If only one axis was declared, fall back to first group
    if (!leftAxisId && !rightAxisId) leftAxisId = Object.keys(axisGroups)[0] || 'y';
    else if (!leftAxisId && rightAxisId) {
      // Promote the one we have to "left" if it really is left
      leftAxisId = rightAxisId; rightAxisId = null;
    }

    var xStacked = scales.x && scales.x.stacked;
    var leftStacked = leftAxisId && scales[leftAxisId] && scales[leftAxisId].stacked;
    var rightStacked = rightAxisId && scales[rightAxisId] && scales[rightAxisId].stacked;

    var leftRange = leftAxisId
      ? axisRange(scales[leftAxisId], axisGroups[leftAxisId], leftStacked, type)
      : null;
    var rightRange = rightAxisId
      ? axisRange(scales[rightAxisId], axisGroups[rightAxisId], rightStacked, type)
      : null;

    // Reverse for rank-style axes
    if (leftAxisId && scales[leftAxisId] && scales[leftAxisId].reverse) leftRange.reverse = true;
    if (rightAxisId && scales[rightAxisId] && scales[rightAxisId].reverse) rightRange.reverse = true;

    // --- Layout ---
    var titleH = (titleCfg.display && titleCfg.text) ? 22 : 6;
    var legendVisible = legendCfg.display !== false && datasets.length > 0;
    var legendPos = legendCfg.position || 'top';
    var legendH = legendVisible ? Math.max(22, Math.ceil(datasets.length / 4) * 18) : 0;
    var xAxisTitle = scales.x && scales.x.title && scales.x.title.display ? scales.x.title.text : '';
    var leftAxisTitle = leftAxisId && scales[leftAxisId] && scales[leftAxisId].title && scales[leftAxisId].title.display
      ? scales[leftAxisId].title.text : '';
    var rightAxisTitle = rightAxisId && scales[rightAxisId] && scales[rightAxisId].title && scales[rightAxisId].title.display
      ? scales[rightAxisId].title.text : '';

    var padTop = titleH + (legendPos === 'top' ? legendH : 6) + 4;
    var padBottom = (xAxisTitle ? 18 : 6) + 22 + (legendPos === 'bottom' ? legendH : 0);
    var padLeft = 44 + (leftAxisTitle ? 16 : 0);
    var padRight = (rightAxisId ? 44 : 12) + (rightAxisTitle ? 16 : 0);
    var plotW = width - padLeft - padRight;
    var plotH = height - padTop - padBottom;
    if (plotW < 50 || plotH < 50) return; // don't try to render in tiny boxes

    // --- Title ---
    if (titleCfg.display && titleCfg.text) {
      var t = el('text', {
        x: width / 2, y: 14, 'text-anchor': 'middle',
        style: TITLE_FONT, fill: '#222'
      }, svg);
      t.textContent = titleCfg.text;
    }

    // --- Plot background + frame ---
    el('rect', {
      x: padLeft, y: padTop, width: plotW, height: plotH,
      fill: '#fff', stroke: '#d0d7de', 'stroke-width': 1
    }, svg);

    // --- Axis helpers ---
    function yScale(range, v) {
      if (v == null || isNaN(v)) return null;
      var t = (v - range.min) / (range.max - range.min);
      if (range.reverse) t = 1 - t;
      return padTop + (1 - t) * plotH;
    }

    var nLabels = labels.length;
    function xCenterAt(i) {
      if (nLabels <= 1) return padLeft + plotW / 2;
      return padLeft + (i / (nLabels - 1)) * plotW;
    }
    function xBandAt(i) {
      var bw = plotW / Math.max(1, nLabels);
      return { center: padLeft + bw * (i + 0.5), bandWidth: bw };
    }

    // --- Y-axis ticks + gridlines (left) ---
    var leftScaleCfg = leftAxisId ? scales[leftAxisId] : null;
    function drawYAxis(range, axisId, side, titleText) {
      if (!range) return;
      var precision = scales[axisId] && scales[axisId].ticks && scales[axisId].ticks.precision;
      var x = side === 'left' ? padLeft : padLeft + plotW;
      range.ticks.forEach(function(v) {
        var y = yScale(range, v);
        if (y == null) return;
        // Gridline (left axis only, unless explicitly enabled on right)
        var drawGrid = side === 'left' || (scales[axisId] && scales[axisId].grid && scales[axisId].grid.drawOnChartArea !== false);
        if (drawGrid && side === 'left') {
          el('line', {
            x1: padLeft, x2: padLeft + plotW, y1: y, y2: y,
            stroke: '#eef0f3', 'stroke-width': 1
          }, svg);
        }
        // Tick mark
        el('line', {
          x1: side === 'left' ? x - 3 : x, x2: side === 'left' ? x : x + 3,
          y1: y, y2: y, stroke: '#666', 'stroke-width': 1
        }, svg);
        // Label
        var tx = el('text', {
          x: side === 'left' ? x - 6 : x + 6, y: y + 3,
          'text-anchor': side === 'left' ? 'end' : 'start',
          style: FONT, fill: '#444'
        }, svg);
        tx.textContent = fmtNum(v, precision);
      });
      // Axis title
      if (titleText) {
        var ttX = side === 'left' ? 12 : width - 12;
        var ttY = padTop + plotH / 2;
        var tt = el('text', {
          x: ttX, y: ttY, 'text-anchor': 'middle',
          transform: 'rotate(' + (side === 'left' ? -90 : 90) + ' ' + ttX + ' ' + ttY + ')',
          style: FONT, fill: '#444'
        }, svg);
        tt.textContent = titleText;
      }
    }
    drawYAxis(leftRange, leftAxisId, 'left', leftAxisTitle);
    drawYAxis(rightRange, rightAxisId, 'right', rightAxisTitle);

    // --- X axis ticks + labels ---
    var xTickStride = 1;
    if (nLabels > 0) {
      var maxLabelCharW = 7;
      var maxLabels = Math.max(2, Math.floor(plotW / 50));
      xTickStride = Math.max(1, Math.ceil(nLabels / maxLabels));
    }
    for (var li = 0; li < nLabels; li++) {
      if (li % xTickStride !== 0 && li !== nLabels - 1) continue;
      var xc = type === 'bar' ? xBandAt(li).center : xCenterAt(li);
      el('line', {
        x1: xc, x2: xc, y1: padTop + plotH, y2: padTop + plotH + 3,
        stroke: '#666', 'stroke-width': 1
      }, svg);
      var xt = el('text', {
        x: xc, y: padTop + plotH + 14,
        'text-anchor': 'middle', style: FONT, fill: '#444'
      }, svg);
      xt.textContent = String(labels[li]);
    }
    if (xAxisTitle) {
      var xtt = el('text', {
        x: padLeft + plotW / 2, y: height - (legendPos === 'bottom' ? legendH + 6 : 6),
        'text-anchor': 'middle', style: FONT, fill: '#444'
      }, svg);
      xtt.textContent = xAxisTitle;
    }

    // --- Render datasets ---
    if (type === 'line') {
      // Line/area
      // For "fill: '-1'" support, render in order; remember each ds's polyline points.
      var dsPoints = [];
      datasets.forEach(function(ds, i) {
        var ax = axisGroups[ds.yAxisID || 'y'] ? (ds.yAxisID || 'y') : leftAxisId;
        var range = (ax === leftAxisId) ? leftRange : rightRange;
        var pts = [];
        for (var p = 0; p < ds.data.length; p++) {
          var v = ds.data[p];
          if (v == null || isNaN(v)) { pts.push(null); continue; }
          var x = xCenterAt(p);
          var y = yScale(range, +v);
          pts.push({ x: x, y: y, v: +v });
        }
        dsPoints.push(pts);

        var stroke = colorOf(ds.borderColor, '#2563eb');
        var fillCol = colorOf(ds.backgroundColor, stroke);
        var strokeW = ds.borderWidth != null ? ds.borderWidth : 2;
        var dash = ds.borderDash ? ds.borderDash.join(',') : null;

        // Banded area: fill: '-1' fills between previous dataset and this one.
        if (ds.fill === '-1' && dsPoints[i - 1]) {
          var prev = dsPoints[i - 1];
          var pathTop = '', pathBottom = '';
          var first = true;
          for (var k = 0; k < pts.length; k++) {
            if (!pts[k] || !prev[k]) continue;
            pathTop += (first ? 'M' : 'L') + pts[k].x + ',' + pts[k].y + ' ';
            first = false;
          }
          for (var k2 = pts.length - 1; k2 >= 0; k2--) {
            if (!pts[k2] || !prev[k2]) continue;
            pathBottom += 'L' + prev[k2].x + ',' + prev[k2].y + ' ';
          }
          if (pathTop) {
            el('path', {
              d: pathTop + pathBottom + 'Z',
              fill: fillCol, stroke: 'none', opacity: 1
            }, svg);
          }
          // Don't draw the line/points if border is transparent (banded helper).
          var transparent = /rgba?\([^)]*,\s*0\s*\)/.test(stroke || '') || stroke === 'transparent';
          if (transparent) return;
        }

        // Solid fill (fill: true) — area down to 0 baseline
        if (ds.fill === true) {
          var baselineY = yScale(range, 0);
          if (baselineY == null) baselineY = padTop + plotH;
          var areaPath = '';
          var areaFirst = true;
          var lastIdx = -1;
          for (var k3 = 0; k3 < pts.length; k3++) {
            if (!pts[k3]) continue;
            areaPath += (areaFirst ? 'M' : 'L') + pts[k3].x + ',' + pts[k3].y + ' ';
            areaFirst = false;
            lastIdx = k3;
          }
          if (lastIdx >= 0) {
            areaPath = 'M' + pts.find(function(q) { return q; }).x + ',' + baselineY + ' '
                     + areaPath
                     + 'L' + pts[lastIdx].x + ',' + baselineY + ' Z';
            el('path', { d: areaPath, fill: fillCol, opacity: 0.18, stroke: 'none' }, svg);
          }
        }

        // Polyline
        var d = '';
        var started = false;
        for (var k4 = 0; k4 < pts.length; k4++) {
          if (!pts[k4]) { started = false; continue; }
          d += (started ? 'L' : 'M') + pts[k4].x + ',' + pts[k4].y + ' ';
          started = true;
        }
        if (d) {
          var lineAttrs = {
            d: d, fill: 'none',
            stroke: stroke, 'stroke-width': strokeW,
            'stroke-linecap': 'round', 'stroke-linejoin': 'round'
          };
          if (dash) lineAttrs['stroke-dasharray'] = dash;
          el('path', lineAttrs, svg);
        }

        // Points
        var pr = ds.pointRadius != null ? ds.pointRadius : 2;
        if (pr > 0) {
          for (var k5 = 0; k5 < pts.length; k5++) {
            if (!pts[k5]) continue;
            el('circle', {
              cx: pts[k5].x, cy: pts[k5].y, r: pr,
              fill: stroke, stroke: '#fff', 'stroke-width': 0.5
            }, svg);
          }
        }
      });

      // Crosshair tooltip on hover
      attachLineTooltip(svg, wrap, datasets, dsPoints, labels, padLeft, padTop, plotW, plotH, this);

    } else if (type === 'bar') {
      // Grouped or stacked bars
      var nBars = datasets.length;
      var bandSlot = plotW / Math.max(1, nLabels);
      var groupPad = 0.18; // 18% of the band reserved for inter-group padding
      var innerW = bandSlot * (1 - groupPad);
      var stacked = leftStacked || rightStacked || xStacked;
      var barW = stacked ? innerW : innerW / Math.max(1, nBars);

      // For stacked: track running totals per index per stack key.
      var stacksPos = {}; // [stackKey][i] -> running positive
      var stacksNeg = {}; // [stackKey][i] -> running negative

      datasets.forEach(function(ds, di) {
        var ax = axisGroups[ds.yAxisID || 'y'] ? (ds.yAxisID || 'y') : leftAxisId;
        var range = (ax === leftAxisId) ? leftRange : rightRange;
        var fillCol = colorOf(ds.backgroundColor, '#2563eb');
        var stroke = colorOf(ds.borderColor, fillCol);
        var stackKey = ds.stack || '_default';
        if (stacked) {
          stacksPos[stackKey] = stacksPos[stackKey] || [];
          stacksNeg[stackKey] = stacksNeg[stackKey] || [];
        }

        for (var i = 0; i < ds.data.length; i++) {
          var v = +ds.data[i];
          if (isNaN(v)) continue;
          var band = xBandAt(i);
          var x;
          var y0, y1;
          if (stacked) {
            var prev = v >= 0 ? (stacksPos[stackKey][i] || 0) : (stacksNeg[stackKey][i] || 0);
            var next = prev + v;
            y0 = yScale(range, prev);
            y1 = yScale(range, next);
            if (v >= 0) stacksPos[stackKey][i] = next;
            else stacksNeg[stackKey][i] = next;
            x = band.center - innerW / 2;
            el('rect', {
              x: x, y: Math.min(y0, y1),
              width: innerW, height: Math.abs(y1 - y0),
              fill: fillCol, stroke: 'none'
            }, svg);
          } else {
            var baselineY = yScale(range, 0);
            if (baselineY == null) baselineY = padTop + plotH;
            y1 = yScale(range, v);
            x = band.center - innerW / 2 + di * barW;
            el('rect', {
              x: x, y: Math.min(baselineY, y1),
              width: Math.max(1, barW - 1), height: Math.abs(baselineY - y1),
              fill: fillCol, stroke: 'none'
            }, svg);
          }
        }
      });

      attachBarTooltip(svg, wrap, datasets, labels, padLeft, padTop, plotW, plotH, xBandAt, this);
    }

    // --- Legend ---
    if (legendVisible) {
      var legendY = legendPos === 'bottom' ? height - legendH + 12 : titleH + 12;
      var filterFn = legendCfg.labels && legendCfg.labels.filter;
      var items = datasets.map(function(ds, i) { return { text: ds.label || ('Dataset ' + (i + 1)), color: ds.borderColor || ds.backgroundColor || '#2563eb', i: i, datasetIndex: i }; });
      if (typeof filterFn === 'function') {
        items = items.filter(function(it) {
          try { return filterFn({ text: it.text, datasetIndex: it.datasetIndex }) !== false; }
          catch (_e) { return true; }
        });
      }
      var lx = padLeft;
      var ly = legendY;
      var lineH = 18;
      var maxRowW = plotW;
      items.forEach(function(it) {
        var label = it.text;
        var w = 14 + label.length * 6 + 14;
        if (lx + w > padLeft + maxRowW) { lx = padLeft; ly += lineH; }
        el('rect', { x: lx, y: ly - 8, width: 10, height: 10, fill: it.color }, svg);
        var lt = el('text', { x: lx + 14, y: ly, style: FONT, fill: '#222' }, svg);
        lt.textContent = label;
        lx += w;
      });
    }
  };

  // ---------------------------------------------------------------------------
  // Tooltip helpers
  // ---------------------------------------------------------------------------

  function makeTooltip(wrap) {
    var tip = document.createElement('div');
    tip.className = 'reprodb-chart-tooltip';
    tip.style.cssText = 'position:absolute;pointer-events:none;display:none;'
      + 'background:rgba(20,20,20,0.92);color:#fff;padding:6px 8px;border-radius:4px;'
      + 'font:11px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;'
      + 'white-space:nowrap;z-index:10;max-width:260px;';
    wrap.appendChild(tip);
    return tip;
  }

  function attachLineTooltip(svg, wrap, datasets, dsPoints, labels, padLeft, padTop, plotW, plotH, chart) {
    var tip = makeTooltip(wrap);
    var crosshair = el('line', {
      x1: 0, x2: 0, y1: padTop, y2: padTop + plotH,
      stroke: '#888', 'stroke-width': 1, 'stroke-dasharray': '3,3', visibility: 'hidden'
    }, svg);
    function onMove(evt) {
      var rect = svg.getBoundingClientRect();
      var vbW = +svg.getAttribute('viewBox').split(' ')[2];
      var scale = vbW / rect.width;
      var x = (evt.clientX - rect.left) * scale;
      if (x < padLeft || x > padLeft + plotW) { onLeave(); return; }
      var n = labels.length;
      if (n === 0) return;
      var t = (x - padLeft) / plotW;
      var idx = Math.round(t * (n - 1));
      if (idx < 0) idx = 0;
      if (idx > n - 1) idx = n - 1;
      var cx = padLeft + (n > 1 ? (idx / (n - 1)) * plotW : plotW / 2);
      crosshair.setAttribute('x1', cx);
      crosshair.setAttribute('x2', cx);
      crosshair.setAttribute('visibility', 'visible');

      var html = '<div style="font-weight:600;margin-bottom:3px;">' + escHtml(labels[idx]) + '</div>';
      var any = false;
      datasets.forEach(function(ds, di) {
        var p = dsPoints[di][idx];
        if (!p) return;
        var lbl = ds.label || ('Dataset ' + (di + 1));
        if (lbl.indexOf('(hidden anchor)') !== -1) return;
        var color = ds.borderColor || ds.backgroundColor || '#2563eb';
        html += '<div><span style="display:inline-block;width:8px;height:8px;background:' + color + ';margin-right:5px;"></span>'
              + escHtml(lbl) + ': ' + fmtNum(p.v) + '</div>';
        any = true;
      });
      if (!any) { onLeave(); return; }
      tip.innerHTML = html;
      tip.style.display = 'block';
      // Position via clientX/wrap-relative
      var wrapRect = wrap.getBoundingClientRect();
      var px = evt.clientX - wrapRect.left + 12;
      var py = evt.clientY - wrapRect.top + 12;
      var tw = tip.offsetWidth;
      if (px + tw > wrap.clientWidth - 4) px = evt.clientX - wrapRect.left - tw - 12;
      tip.style.left = px + 'px';
      tip.style.top = py + 'px';
    }
    function onLeave() {
      tip.style.display = 'none';
      crosshair.setAttribute('visibility', 'hidden');
    }
    svg.addEventListener('mousemove', onMove);
    svg.addEventListener('mouseleave', onLeave);
    chart._listeners.push(function() {
      svg.removeEventListener('mousemove', onMove);
      svg.removeEventListener('mouseleave', onLeave);
    });
  }

  function attachBarTooltip(svg, wrap, datasets, labels, padLeft, padTop, plotW, plotH, xBandAt, chart) {
    var tip = makeTooltip(wrap);
    function onMove(evt) {
      var rect = svg.getBoundingClientRect();
      var vbW = +svg.getAttribute('viewBox').split(' ')[2];
      var scale = vbW / rect.width;
      var x = (evt.clientX - rect.left) * scale;
      var y = (evt.clientY - rect.top) * scale;
      if (x < padLeft || x > padLeft + plotW || y < padTop || y > padTop + plotH) { onLeave(); return; }
      var n = labels.length;
      var bandSlot = plotW / Math.max(1, n);
      var idx = Math.floor((x - padLeft) / bandSlot);
      if (idx < 0 || idx >= n) { onLeave(); return; }
      var html = '<div style="font-weight:600;margin-bottom:3px;">' + escHtml(labels[idx]) + '</div>';
      var any = false;
      datasets.forEach(function(ds, di) {
        var v = ds.data[idx];
        if (v == null || isNaN(v)) return;
        var lbl = ds.label || ('Dataset ' + (di + 1));
        var color = ds.backgroundColor || ds.borderColor || '#2563eb';
        html += '<div><span style="display:inline-block;width:8px;height:8px;background:' + color + ';margin-right:5px;"></span>'
              + escHtml(lbl) + ': ' + fmtNum(+v) + '</div>';
        any = true;
      });
      if (!any) { onLeave(); return; }
      tip.innerHTML = html;
      tip.style.display = 'block';
      var wrapRect = wrap.getBoundingClientRect();
      var px = evt.clientX - wrapRect.left + 12;
      var py = evt.clientY - wrapRect.top + 12;
      var tw = tip.offsetWidth;
      if (px + tw > wrap.clientWidth - 4) px = evt.clientX - wrapRect.left - tw - 12;
      tip.style.left = px + 'px';
      tip.style.top = py + 'px';
    }
    function onLeave() { tip.style.display = 'none'; }
    svg.addEventListener('mousemove', onMove);
    svg.addEventListener('mouseleave', onLeave);
    chart._listeners.push(function() {
      svg.removeEventListener('mousemove', onMove);
      svg.removeEventListener('mouseleave', onLeave);
    });
  }

  // ---------------------------------------------------------------------------

  // Polyfill Math.log10 for very old browsers (defensive — modern browsers OK).
  if (!Math.log10) Math.log10 = function(x) { return Math.log(x) / Math.LN10; };

  window.Chart = Chart;
})();
