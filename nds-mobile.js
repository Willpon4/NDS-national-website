/* NDS mobile layout adapter.
 * The pages are designed as fixed 1440px canvases with inline styles, so this
 * script rewrites layout on narrow screens (<= 900px) by setting !important
 * inline overrides. Originals are remembered and restored if the screen widens.
 */
(function () {
  var MQ = window.matchMedia('(max-width: 900px)');
  var touched = new Set();
  var LINE = '1px solid rgba(155,176,181,.35)';

  function set(el, prop, val) {
    if (!el.__mo) el.__mo = {};
    if (!(prop in el.__mo)) el.__mo[prop] = [el.style.getPropertyValue(prop), el.style.getPropertyPriority(prop)];
    el.style.setProperty(prop, val, 'important');
    touched.add(el);
  }
  function restoreAll() {
    touched.forEach(function (el) {
      for (var p in el.__mo) {
        var o = el.__mo[p];
        if (o[0]) el.style.setProperty(p, o[0], o[1]); else el.style.removeProperty(p);
      }
      el.__mo = null; el.__mdone = false;
    });
    touched.clear();
    document.querySelectorAll('[data-nds-mobile]').forEach(function (n) { n.remove(); });
  }
  var px = function (v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; };
  function tracks(el) {
    var t = el.style.gridTemplateColumns || '';
    var m = t.match(/^repeat\((\d+),\s*1fr\)$/);
    if (m) { var a = []; for (var i = 0; i < +m[1]; i++) a.push('1fr'); return a; }
    return t.split(/\s+(?![^(]*\))/).filter(Boolean);
  }

  /* ---------- header ---------- */
  function header(h) {
    var logo = h.children[0], nav = h.children[1], cta = h.children[2];
    if (!logo || !nav || nav.tagName !== 'NAV') return;
    set(h, 'display', 'flex'); set(h, 'flex-wrap', 'wrap'); set(h, 'align-items', 'stretch');
    set(h, 'position', 'sticky'); set(h, 'top', '0'); set(h, 'z-index', '50'); set(h, 'background', '#0b1b23');
    set(logo, 'flex', '1 1 0'); set(logo, 'min-width', '0'); set(logo, 'order', '1'); set(logo, 'padding', '10px 16px'); set(logo, 'gap', '12px'); set(logo, 'border-right', '0');
    var img = logo.querySelector('img'); if (img) { set(img, 'width', '40px'); set(img, 'height', '40px'); }
    var sp = logo.querySelectorAll('span span');
    if (sp[0]) set(sp[0], 'font-size', '26px');
    if (sp[1]) { set(sp[1], 'font-size', '9px'); set(sp[1], 'letter-spacing', '.12em'); set(sp[1], 'line-height', '1.3'); set(sp[1], 'white-space', 'normal'); }
    if (cta) {
      set(cta, 'border-left', '0'); set(cta, 'order', '2'); set(cta, 'flex', '0 0 auto'); set(cta, 'padding', '8px 8px 8px 0');
      var a = cta.querySelector('a'); if (a) set(a, 'padding', '11px 16px');
    }
    // menu button
    var btn = document.createElement('button');
    btn.setAttribute('data-nds-mobile', ''); btn.setAttribute('aria-label', 'Menu'); btn.setAttribute('aria-expanded', 'false');
    btn.style.cssText = 'order:3;flex:0 0 56px;align-self:stretch;width:56px;background:none;border:0;border-left:' + LINE + ';color:#fff;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:0';
    for (var i = 0; i < 3; i++) { var b = document.createElement('span'); b.style.cssText = 'display:block;width:20px;height:2px;background:#fff;transition:transform .25s,opacity .25s'; btn.appendChild(b); }
    h.appendChild(btn);
    set(nav, 'order', '4'); set(nav, 'flex', '1 0 100%'); set(nav, 'display', 'none');
    set(nav, 'flex-direction', 'column'); set(nav, 'align-items', 'stretch'); set(nav, 'gap', '0');
    set(nav, 'padding', '0 16px 12px'); set(nav, 'border-top', LINE);
    [].forEach.call(nav.children, function (a) { set(a, 'padding', '16px 0'); set(a, 'font-size', '14px'); set(a, 'border-bottom', '1px solid rgba(155,176,181,.15)'); });
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      nav.style.setProperty('display', open ? 'flex' : 'none', 'important');
      var s = btn.children;
      s[0].style.transform = open ? 'translateY(7px) rotate(45deg)' : '';
      s[1].style.opacity = open ? '0' : '1';
      s[2].style.transform = open ? 'translateY(-7px) rotate(-45deg)' : '';
    });
  }

  /* ---------- grids ---------- */
  function stackChildren(g) {
    var kids = [].slice.call(g.children);
    var bordered = kids.some(function (c) { return c.style.borderRightStyle === 'solid' || c.style.borderLeftStyle === 'solid'; });
    kids.forEach(function (c, i) {
      if (px(c.style.borderRightWidth) || c.style.borderRightStyle === 'solid') set(c, 'border-right', '0');
      if (px(c.style.borderLeftWidth) || c.style.borderLeftStyle === 'solid') set(c, 'border-left', '0');
      if (bordered && i > 0 && !c.style.borderTopStyle && g.style.gap !== '1px') set(c, 'border-top', LINE);
    });
  }
  function grid(g) {
    var t = tracks(g); if (t.length < 2) return;
    var tpx = function (x) { return /px$/.test(x) ? parseFloat(x) : 0; };
    var fixed = t.map(tpx).reduce(function (a, b) { return a + b; }, 0);
    var kids = [].slice.call(g.children);
    // header row of a data table
    if (kids[0] && kids[0].textContent.trim() === '#' && kids.every(function (k) { return k.children.length === 0; })) { set(g, 'display', 'none'); return; }
    // small layouts that already fit a phone
    if (t.length <= 3 && fixed > 0 && fixed <= 200 && t.some(function (x) { return /fr|auto/.test(x); })) return;
    var isRow = t.length >= 4 && t[t.length - 1] === '60px';
    var isIndexed = !isRow && t.length >= 3 && tpx(t[0]) > 0 && tpx(t[0]) <= 90;
    if (isRow) {
      set(g, 'grid-template-columns', 'auto 1fr'); set(g, 'column-gap', '14px'); set(g, 'row-gap', '6px');
      kids.forEach(function (c, i) {
        if (i >= 2) set(c, 'grid-column', '1 / -1');
        if (c.textContent.trim() === '→') set(c, 'display', 'none');
      });
    } else if (isIndexed) {
      set(g, 'grid-template-columns', 'auto 1fr'); set(g, 'column-gap', '14px'); set(g, 'row-gap', '4px');
      kids.forEach(function (c, i) { if (i >= 1) set(c, 'grid-column', '2'); if (i >= 1) set(c, 'grid-row', 'auto'); });
      if (kids[0]) set(kids[0], 'grid-row', '1 / span ' + Math.max(1, kids.length - 1));
    } else if (t.length === 6) {
      set(g, 'grid-template-columns', 'repeat(3,1fr)');
    } else if (t.length === 4 && t.every(function (x) { return x === '1fr'; }) && kids.every(function (k) { return k.textContent.replace(/\s+/g, ' ').trim().length < 90; })) {
      set(g, 'grid-template-columns', 'repeat(2,minmax(0,1fr))');
      kids.forEach(function (c, i) {
        if (i % 2 === 1) set(c, 'border-right', '0');
        if (i >= 2 && g.style.gap !== '1px' && !px(g.style.gap)) set(c, 'border-top', LINE);
      });
    } else {
      set(g, 'grid-template-columns', 'minmax(0,1fr)');
      stackChildren(g);
    }
    if (px(g.style.columnGap) > 24) set(g, 'column-gap', '20px');
    if (px(g.style.rowGap) > 32) set(g, 'row-gap', '28px');
  }

  /* ---------- generic element fixes ---------- */
  function scaleFont(s) { return s <= 22 ? s : Math.round(22 + (s - 22) * 0.42); }
  function generic(el, vw) {
    var st = el.style;
    var fs = px(st.fontSize);
    if (fs > 22) set(el, 'font-size', scaleFont(fs) + 'px');
    else if (fs >= 19 && el.tagName === 'P') set(el, 'font-size', '17px');
    if (px(st.letterSpacing) < 0 && fs > 40) set(el, 'letter-spacing', '0');
    ['padding-left', 'padding-right'].forEach(function (p) { if (px(st.getPropertyValue(p)) > 24) set(el, p, '20px'); });
    ['padding-top', 'padding-bottom'].forEach(function (p) { var v = px(st.getPropertyValue(p)); if (v > 40) set(el, p, Math.round(Math.max(28, v * 0.6)) + 'px'); });
    ['margin-top', 'margin-bottom'].forEach(function (p) { var v = px(st.getPropertyValue(p)); if (v > 32) set(el, p, Math.round(v * 0.6) + 'px'); });
    if (px(st.marginLeft) > 24) set(el, 'margin-left', '0');
    if (px(st.width) > vw - 20 && st.position !== 'absolute') { set(el, 'width', '100%'); set(el, 'max-width', '100%'); }
    if (px(st.minWidth) > vw - 20) set(el, 'min-width', '0');
    if (px(st.minHeight) > 400) set(el, 'min-height', '0');
    if (px(st.height) > 500 && st.position !== 'absolute') set(el, 'height', Math.round(vw * 0.68) + 'px');
    if (st.display === 'flex' && st.flexDirection !== 'column' && el.children.length > 1 && el.tagName !== 'NAV' && el.tagName !== 'A' && el.tagName !== 'LABEL') {
      set(el, 'flex-wrap', 'wrap');
      if (!st.gap && st.justifyContent === 'space-between') set(el, 'gap', '10px 20px');
      if (st.justifyContent === 'flex-end') set(el, 'justify-content', 'flex-start');
    }
    if (px(st.gap) > 24 && st.display === 'flex') set(el, 'gap', '16px');
    if (el.tagName === 'IMG' || el.tagName === 'SVG' || el.tagName === 'FIGURE') set(el, 'max-width', '100%');
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && px(getComputedStyle(el).fontSize) < 16) set(el, 'font-size', '16px');
    if (el.tagName === 'FOOTER') { set(el, 'flex-direction', 'column'); set(el, 'align-items', 'flex-start'); set(el, 'gap', '14px'); set(el, 'line-height', '1.5'); }
  }

  function run() {
    if (!MQ.matches) return;
    var root = document.querySelector('[data-screen-label]');
    var roots = [].filter.call(document.querySelectorAll('div'), function (d) { return d.style.width === '1440px'; });
    if (!roots.length) return;
    var vw = Math.min(window.innerWidth, (window.screen && screen.width) || window.innerWidth, document.documentElement.clientWidth || window.innerWidth);
    roots.forEach(function (r) {
      if (!r.__mdone) { set(r, 'width', '100%'); set(r, 'zoom', '1'); set(r, 'overflow-x', 'hidden'); r.__mdone = true; }
      r.querySelectorAll('*').forEach(function (el) {
        if (el.__mdone || el.closest('nds-map') || el.hasAttribute('data-nds-mobile')) return;
        el.__mdone = true;
        if (el.style.display === 'grid' && el.style.gridTemplateColumns) {
          if (/^350px/.test(el.style.gridTemplateColumns)) { header(el); return; }
          grid(el);
        }
        if (el.closest('nav') && el.tagName !== 'NAV') return;
        if (el.parentElement && el.parentElement.style.gridTemplateColumns && /^350px/.test(el.parentElement.style.gridTemplateColumns)) return;
        if (el.closest('a') && el.closest('a').parentElement && /^350px/.test(el.closest('a').parentElement.style.gridTemplateColumns || '')) return;
        generic(el, vw);
      });
    });
    document.documentElement.style.overflowX = 'hidden';
  }

  var pending = false;
  function schedule() { if (pending) return; pending = true; requestAnimationFrame(function () { pending = false; run(); }); }
  function start() {
    new MutationObserver(function (muts) {
      if (!MQ.matches) return;
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].type === 'childList' && muts[i].addedNodes.length) { schedule(); return; }
      }
    }).observe(document.body, { childList: true, subtree: true });
    schedule();
    var t = 0, iv = setInterval(function () { schedule(); if (++t > 20) clearInterval(iv); }, 250);
  }
  MQ.addEventListener ? MQ.addEventListener('change', function () { if (MQ.matches) schedule(); else restoreAll(); }) : 0;
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
