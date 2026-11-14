/* Mavelania storefront layer.
   Bag drawer, quick add, hero carousel, category tabs, quantity steppers,
   recently viewed and the small header behaviours. Loaded with `defer` after
   shopify-theme.js, so window.mvTrapFocus is already defined. */
(function () {
  'use strict';

  var body = document.body;
  var data = body.dataset;
  var recentKey = 'mv-recently-viewed';
  var rootUrl = data.rootUrl || '/';
  var cartUrl = data.cartUrl || '/cart';
  var cartAddUrl = data.cartAddUrl || '/cart/add';
  var cartChangeUrl = data.cartChangeUrl || '/cart/change';
  var moneyFormat = data.moneyFormat || '${{amount}}';
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(selector, scope) { return (scope || document).querySelector(selector); }
  function $$(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  /* Shopify money formats: {{amount}}, {{amount_no_decimals}},
     {{amount_with_comma_separator}}, {{amount_no_decimals_with_comma_separator}} … */
  function money(cents) {
    var value = (cents || 0) / 100;
    var out = moneyFormat.replace(/\{\{\s*(\w+)\s*\}\}/g, function (_, name) {
      var decimals = name.indexOf('no_decimals') > -1 ? 0 : 2;
      var comma = name.indexOf('comma_separator') > -1;
      var space = name.indexOf('space_separator') > -1;
      var apostrophe = name.indexOf('apostrophe_separator') > -1;
      var parts = value.toFixed(decimals).split('.');
      var thousands = comma ? '.' : space ? ' ' : apostrophe ? "'" : ',';
      var decimal = comma || space ? ',' : '.';
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
      return parts.length > 1 ? parts[0] + decimal + parts[1] : parts[0];
    });
    // The format may carry markup (e.g. <span class=money>); show text only.
    var holder = document.createElement('div');
    holder.innerHTML = out;
    return holder.textContent;
  }

  function icon(name) {
    var paths = {
      minus: 'M5.5 12h13',
      plus: 'M12 5.5v13M5.5 12h13',
      trash: 'M5 7h14M9.5 7V4.5h5V7M7 7l.8 12.5h8.4L17 7',
      close: 'M6 6l12 12M18 6 6 18',
      'arrow-left': 'M19.5 12h-15M10.5 6l-6 6 6 6',
      'arrow-right': 'M4.5 12h15M13.5 6l6 6-6 6'
    };
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', 'ms-icon');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.5');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', paths[name] || '');
    svg.appendChild(path);
    return svg;
  }

  /* ── Toast ─────────────────────────────────────────────────────────── */
  var toast = $('[data-toast]');
  var toastTimer = 0;
  function showToast(message) {
    if (!toast || !message) return;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.hidden = true; }, 4200);
  }

  /* ── Top bar: one message at a time on small screens ───────────────── */
  (function () {
    var items = $$('[data-topbar] li');
    if (items.length < 2 || reducedMotion) return;
    var index = Math.max(0, items.findIndex(function (item) { return item.classList.contains('is-active'); }));
    window.setInterval(function () {
      items[index].classList.remove('is-active');
      index = (index + 1) % items.length;
      items[index].classList.add('is-active');
    }, 4200);
  })();

  /* ── Header: hides on scroll down, returns on scroll up ────────────── */
  (function () {
    var header = $('[data-header]');
    if (!header) return;
    var wrap = header.closest('.shopify-section') || header.parentNode;
    if (wrap && wrap !== body) wrap.classList.add('ms-header-wrap');
    var root = document.documentElement;
    var lastY = window.pageYOffset;
    var ticking = false;
    // On phones and tablets the header simply stays put: hiding and showing
    // it on every change of scroll direction made the page appear to jump.
    var compact = window.matchMedia('(max-width: 900px)');
    var panel = $('[data-search-panel]', header);
    var searchInput = panel && $('[data-search-input]', panel);
    var searchLastFocused = null;

    function searchOpen() { return !!(panel && !panel.hidden); }
    function setHidden(hidden) {
      if (header.classList.contains('is-hidden') === hidden) return;
      header.classList.toggle('is-hidden', hidden);
      // Sticky elements further down (gallery, order summary) sit below the
      // header only while it is on screen.
      root.style.setProperty('--ms-sticky', hidden ? '0px' : header.offsetHeight + 'px');
    }
    function update() {
      ticking = false;
      var y = window.pageYOffset;
      header.classList.toggle('is-stuck', y > 8);
      var locked = searchOpen() || body.classList.contains('mv-mobile-menu-open') || header.contains(document.activeElement);
      if (compact.matches) locked = true;
      if (y > 220 && y > lastY + 6 && !locked) setHidden(true);
      else if (y < lastY - 6 || y <= 220) setHidden(false);
      lastY = y;
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', function () {
      if (!header.classList.contains('is-hidden')) root.style.setProperty('--ms-sticky', header.offsetHeight + 'px');
    }, { passive: true });
    header.addEventListener('focusin', function () { setHidden(false); });
    root.style.setProperty('--ms-sticky', header.offsetHeight + 'px');
    update();

    // Search panel
    function setSearch(open) {
      if (!panel || searchOpen() === open) return;
      if (open) searchLastFocused = document.activeElement;
      panel.hidden = !open;
      $$('[data-search-open]').forEach(function (button) { button.setAttribute('aria-expanded', String(open)); });
      if (open) {
        setHidden(false);
        if (searchInput) window.setTimeout(function () { searchInput.focus(); }, 30);
      } else if (searchLastFocused && typeof searchLastFocused.focus === 'function') {
        searchLastFocused.focus();
      }
    }
    document.addEventListener('click', function (event) {
      var opener = event.target.closest('[data-search-open]');
      if (opener) { event.preventDefault(); setSearch(!searchOpen()); return; }
      if (event.target.closest('[data-search-close]')) { setSearch(false); return; }
      if (searchOpen() && !panel.contains(event.target)) setSearch(false);
    });

    // Mega menus open on hover / keyboard focus (CSS). Escape closes them and
    // the search panel.
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (searchOpen()) { setSearch(false); return; }
      var item = document.activeElement && document.activeElement.closest ? document.activeElement.closest('[data-mega]') : null;
      if (item) {
        header.classList.add('is-mega-closed');
        var link = $('a', item);
        if (link) link.focus();
      }
    });
    header.addEventListener('mouseover', function () { header.classList.remove('is-mega-closed'); });
    header.addEventListener('focusout', function (event) {
      if (!event.relatedTarget || !event.relatedTarget.closest || !event.relatedTarget.closest('[data-mega]')) header.classList.remove('is-mega-closed');
    });
  })();

  /* ── Product carousels ─────────────────────────────────────────────── */
  $$('[data-carousel]').forEach(function (carousel) {
    var track = $('[data-carousel-track]', carousel);
    var prev = $('[data-carousel-prev]', carousel);
    var next = $('[data-carousel-next]', carousel);
    if (!track || !prev || !next) return;
    function sync() {
      var max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = max <= 4 || track.scrollLeft >= max - 4;
    }
    function move(direction) {
      track.scrollBy({ left: direction * Math.max(240, track.clientWidth - 40), behavior: reducedMotion ? 'auto' : 'smooth' });
    }
    prev.addEventListener('click', function () { move(-1); });
    next.addEventListener('click', function () { move(1); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    // A carousel inside a hidden tab has no size yet; measure when it shows.
    carousel.addEventListener('ms:shown', sync);
    sync();
  });

  /* ── Colour dots on product cards ──────────────────────────────────── */
  (function () {
    var colors = window.MvColors;
    $$('[data-card-swatches] .ms-swatch').forEach(function (dot) {
      if (!colors) return;
      var name = dot.dataset.color || '';
      var value = colors.resolve(name);
      dot.style.setProperty('--swatch', value);
      var finish = colors.finish(name);
      if (finish && String(value).charAt(0) === '#') dot.dataset.finish = finish;
    });
    function preview(dot) {
      var card = dot.closest('[data-product-card]');
      if (!card) return;
      $$('.ms-swatch', card).forEach(function (other) { other.setAttribute('aria-pressed', String(other === dot)); });
      var image = $('.ms-card__img', card);
      if (image && dot.dataset.image) {
        image.removeAttribute('srcset');
        image.removeAttribute('sizes');
        image.src = dot.dataset.image;
        card.classList.add('has-color-preview');
      }
      if (dot.dataset.url) $$('[data-card-link]', card).forEach(function (link) { link.href = dot.dataset.url; });
    }
    document.addEventListener('click', function (event) {
      var dot = event.target.closest('.ms-swatch');
      if (!dot || !dot.closest('[data-card-swatches]')) return;
      event.preventDefault();
      preview(dot);
    });
  })();

  /* ── Hero carousel ─────────────────────────────────────────────────── */
  (function () {
    var hero = $('[data-hero]');
    if (!hero) return;
    var slides = $$('[data-hero-slide]', hero);
    var dots = $$('[data-hero-dot]', hero);
    var pause = $('[data-hero-pause]', hero);
    if (slides.length < 2) return;
    var index = 0;
    var timer = 0;
    var userPaused = reducedMotion;
    var hydrated = false;

    // Slides after the first keep their images in data-src until the page
    // has loaded, so they never compete with the LCP image.
    function hydrate() {
      if (hydrated) return;
      hydrated = true;
      slides.forEach(function (slide) {
        $$('source[data-srcset]', slide).forEach(function (source) {
          source.setAttribute('srcset', source.getAttribute('data-srcset'));
          source.removeAttribute('data-srcset');
        });
        $$('img[data-src]', slide).forEach(function (img) {
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
        });
      });
    }

    function show(next) {
      hydrate();
      var target = (next + slides.length) % slides.length;
      if (target === index) return;
      slides[index].classList.remove('is-active');
      slides[index].setAttribute('tabindex', '-1');
      slides[target].classList.add('is-active');
      slides[target].removeAttribute('tabindex');
      index = target;
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
        if (i === index) dot.setAttribute('aria-current', 'true'); else dot.removeAttribute('aria-current');
      });
    }
    function stop() { window.clearInterval(timer); timer = 0; }
    function start() {
      stop();
      if (userPaused) return;
      timer = window.setInterval(function () { show(index + 1); }, 6000);
    }
    function go(next) { show(next); start(); }

    var prev = $('[data-hero-prev]', hero);
    var nextButton = $('[data-hero-next]', hero);
    if (prev) prev.addEventListener('click', function () { go(index - 1); });
    if (nextButton) nextButton.addEventListener('click', function () { go(index + 1); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () { go(Number(dot.getAttribute('data-hero-dot')) || 0); });
    });
    if (pause) {
      if (userPaused) { pause.setAttribute('aria-pressed', 'true'); pause.setAttribute('aria-label', pause.dataset.resumeLabel); }
      pause.addEventListener('click', function () {
        userPaused = !userPaused;
        pause.setAttribute('aria-pressed', String(userPaused));
        pause.setAttribute('aria-label', userPaused ? pause.dataset.resumeLabel : pause.dataset.pauseLabel);
        if (userPaused) stop(); else start();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    hero.addEventListener('focusin', stop);
    hero.addEventListener('focusout', start);

    var startX = 0;
    var startY = 0;
    hero.addEventListener('touchstart', function (event) {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    }, { passive: true });
    hero.addEventListener('touchend', function (event) {
      var dx = event.changedTouches[0].clientX - startX;
      var dy = event.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
      go(dx < 0 ? index + 1 : index - 1);
    }, { passive: true });

    if (document.readyState === 'complete') window.setTimeout(hydrate, 150);
    else window.addEventListener('load', function () { window.setTimeout(hydrate, 150); }, { once: true });
    start();
  })();

  /* ── Tabs ──────────────────────────────────────────────────────────── */
  $$('[data-tabs]').forEach(function (group) {
    var tabs = $$('[data-tab]', group);
    var panels = $$('[data-tab-panel]', group);
    function select(tab, focus) {
      tabs.forEach(function (item) {
        var on = item === tab;
        item.setAttribute('aria-selected', String(on));
        item.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (panel) {
        panel.hidden = panel.id !== tab.getAttribute('aria-controls');
        if (!panel.hidden) $$('[data-carousel]', panel).forEach(function (carousel) { carousel.dispatchEvent(new CustomEvent('ms:shown')); });
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (event) {
        var step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (step) { event.preventDefault(); select(tabs[(i + step + tabs.length) % tabs.length], true); }
        if (event.key === 'Home') { event.preventDefault(); select(tabs[0], true); }
        if (event.key === 'End') { event.preventDefault(); select(tabs[tabs.length - 1], true); }
      });
    });
  });

  /* ── Quantity steppers ─────────────────────────────────────────────── */
  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-qty-minus],[data-qty-plus]');
    if (!button) return;
    var wrap = button.closest('[data-qty]');
    var input = wrap && $('input[type="number"]', wrap);
    if (!input) return;
    var min = input.min === '' ? 0 : Number(input.min);
    var current = parseInt(input.value, 10);
    if (isNaN(current)) current = min;
    var next = button.hasAttribute('data-qty-plus') ? current + 1 : Math.max(min, current - 1);
    if (next === current) return;
    input.value = next;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    // On the bag page a stepper click applies straight away.
    if (wrap.hasAttribute('data-qty-submit') && input.form) {
      input.form.classList.add('is-updating');
      input.form.submit();
    }
  });

  /* ── Bag drawer ────────────────────────────────────────────────────── */
  var drawer = document.getElementById('MiniCartDrawer');
  var drawerBackdrop = $('[data-mini-cart-backdrop]');
  var drawerItems = drawer && $('[data-mini-cart-items]', drawer);
  var drawerTotal = drawer && $('[data-mini-cart-total]', drawer);
  var drawerFoot = drawer && $('[data-mini-cart-foot]', drawer);
  var drawerAdded = drawer && $('[data-mini-cart-added]', drawer);
  var drawerLastFocused = null;
  var cartBusy = false;

  function setCounts(count) {
    $$('[data-cart-count]').forEach(function (node) {
      node.textContent = count;
      node.classList.toggle('is-empty', !count);
    });
    $$('[data-cart-count-label]').forEach(function (node) { node.textContent = '(' + count + ')'; });
  }

  function renderCart(cart) {
    if (!drawerItems) return;
    var items = (cart && cart.items) || [];
    drawerItems.textContent = '';
    setCounts((cart && cart.item_count) || 0);
    if (drawerFoot) drawerFoot.hidden = !items.length;

    if (!items.length) {
      var empty = el('div', 'ms-drawer__empty');
      empty.appendChild(el('p', null, data.cartEmpty || 'Your bag is empty.'));
      var shop = el('a', 'ms-button ms-button--primary', data.startShopping || 'Start shopping');
      shop.href = data.shopAllUrl || rootUrl + 'collections/all';
      empty.appendChild(shop);
      drawerItems.appendChild(empty);
      return;
    }

    items.forEach(function (item) {
      var row = el('article', 'ms-line');
      var imageLink = el('a', 'ms-line__image');
      imageLink.href = item.url;
      imageLink.tabIndex = -1;
      if (item.image) {
        var img = document.createElement('img');
        img.src = item.image;
        img.alt = '';
        img.width = 88;
        img.height = 88;
        img.loading = 'lazy';
        imageLink.appendChild(img);
      }
      row.appendChild(imageLink);

      var info = el('div', 'ms-line__info');
      var title = el('a', 'ms-line__title', item.product_title);
      title.href = item.url;
      info.appendChild(title);
      if (item.variant_title && !item.product_has_only_default_variant && item.variant_title !== 'Default Title') {
        info.appendChild(el('p', 'ms-line__variant', item.variant_title));
      }
      // Personalization and other line item properties (keys starting with
      // "_" are private and stay hidden, as in Shopify's own templates).
      Object.keys(item.properties || {}).forEach(function (key) {
        var value = item.properties[key];
        if (!value || key.charAt(0) === '_') return;
        var line = el('p', 'ms-line__prop');
        line.appendChild(el('span', null, key + ': '));
        line.appendChild(el('strong', null, value));
        info.appendChild(line);
      });

      var controls = el('div', 'ms-line__controls');
      var qty = el('div', 'ms-qty ms-qty--small');
      var minus = el('button');
      minus.type = 'button';
      minus.setAttribute('aria-label', data.cartDecrease || 'Decrease quantity');
      minus.appendChild(icon('minus'));
      minus.addEventListener('click', function () { changeLine(item.key, item.quantity - 1); });
      var count = el('output', null, item.quantity);
      count.setAttribute('aria-label', data.cartQuantity || 'Quantity');
      var plus = el('button');
      plus.type = 'button';
      plus.setAttribute('aria-label', data.cartIncrease || 'Increase quantity');
      plus.appendChild(icon('plus'));
      plus.addEventListener('click', function () { changeLine(item.key, item.quantity + 1); });
      qty.appendChild(minus);
      qty.appendChild(count);
      qty.appendChild(plus);
      controls.appendChild(qty);
      controls.appendChild(el('strong', 'ms-line__price', money(item.final_line_price)));
      info.appendChild(controls);
      row.appendChild(info);

      var remove = el('button', 'ms-line__remove');
      remove.type = 'button';
      remove.setAttribute('aria-label', (data.cartRemove || 'Remove') + ': ' + item.product_title);
      remove.appendChild(icon('trash'));
      remove.addEventListener('click', function () { changeLine(item.key, 0); });
      row.appendChild(remove);

      drawerItems.appendChild(row);
    });
    if (drawerTotal) drawerTotal.textContent = money(cart.total_price);
    renderRecommendations(items);
  }

  /* "Goes well with": Shopify's own product recommendations for the first
     item in the bag, minus anything already in it. */
  var recCache = {};
  function renderRecommendations(items) {
    var first = items[0];
    if (!first || !first.product_id || !drawerItems) return;
    var inBag = items.map(function (item) { return item.product_id; });
    var request = recCache[first.product_id] || (recCache[first.product_id] = fetch(rootUrl + 'recommendations/products.json?product_id=' + first.product_id + '&limit=6&intent=related', { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
      .then(function (response) { if (!response.ok) throw new Error('No recommendations'); return response.json(); }));
    request.then(function (payload) {
      // The bag may have been re-rendered while this was loading.
      if (!drawerItems.contains(drawerItems.querySelector('.ms-line')) || $('.ms-drawer__recs', drawerItems)) return;
      var products = ((payload && payload.products) || []).filter(function (product) {
        return product.available && inBag.indexOf(product.id) === -1;
      }).slice(0, 3);
      if (!products.length) return;
      var box = el('div', 'ms-drawer__recs');
      box.appendChild(el('h3', null, data.pairsWith || 'Goes well with'));
      products.forEach(function (product) {
        var row = el('div', 'ms-rec');
        var src = product.featured_image && (product.featured_image.url || product.featured_image.src || product.featured_image);
        if (typeof src === 'string' && src) {
          var img = document.createElement('img');
          img.src = src + (src.indexOf('?') > -1 ? '&' : '?') + 'width=160';
          img.alt = '';
          img.width = 60;
          img.height = 60;
          img.loading = 'lazy';
          row.appendChild(img);
        } else {
          row.appendChild(el('span'));
        }
        var info = el('div', 'ms-rec__info');
        var title = el('a', 'ms-rec__title', product.title);
        title.href = product.url;
        info.appendChild(title);
        info.appendChild(el('span', 'ms-rec__price', money(product.price)));
        row.appendChild(info);
        var add = el('button', null, data.addShort || 'Add');
        add.type = 'button';
        add.setAttribute('aria-label', (data.addLabel || 'Add to bag') + ': ' + product.title);
        add.setAttribute('data-quick-add', '');
        add.dataset.handle = product.handle;
        // One variant can be added on the spot; otherwise the quick-add
        // dialog asks for the colour.
        if (product.variants && product.variants.length === 1) add.dataset.variantId = product.variants[0].id;
        row.appendChild(add);
        box.appendChild(row);
      });
      drawerItems.appendChild(box);
    }).catch(function () { delete recCache[first.product_id]; });
  }

  function fetchCart() {
    return fetch(cartUrl + '.js', { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
      .then(function (response) { return response.json(); });
  }
  function refreshCart() {
    return fetchCart().then(function (cart) { renderCart(cart); return cart; });
  }

  function changeLine(key, quantity) {
    if (cartBusy) return;
    cartBusy = true;
    if (drawer) drawer.classList.add('is-busy');
    fetch(cartChangeUrl + '.js', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: key, quantity: Math.max(0, quantity) })
    }).then(function (response) {
      return response.json().then(function (payload) {
        if (!response.ok) { showToast(payload.description || payload.message || data.cartError); return refreshCart(); }
        renderCart(payload);
      });
    }).catch(function () { showToast(data.cartError); })
      .then(function () {
        cartBusy = false;
        if (drawer) drawer.classList.remove('is-busy');
      });
  }

  function openDrawer(justAdded) {
    if (!drawer || !drawerBackdrop) return;
    drawerLastFocused = document.activeElement;
    if (drawerAdded) drawerAdded.hidden = !justAdded;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    drawerBackdrop.hidden = false;
    body.classList.add('mv-cart-open');
    var close = $('[data-mini-cart-close]', drawer);
    window.setTimeout(function () { (close || drawer).focus({ preventScroll: true }); }, 40);
  }
  function closeDrawer() {
    if (!drawer || !drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    drawerBackdrop.hidden = true;
    body.classList.remove('mv-cart-open');
    if (drawerLastFocused && typeof drawerLastFocused.focus === 'function') drawerLastFocused.focus();
  }

  /* Adds to the bag and opens the drawer. Resolves once the bag is shown.
     A Shopify validation error (sold out, quantity limit) is reported in a
     toast; only a network failure rejects, so the caller can fall back to a
     normal form post. */
  function addToCart(payload, button) {
    var isForm = typeof FormData !== 'undefined' && payload instanceof FormData;
    if (button) {
      button.disabled = true;
      button.classList.add('is-loading');
      button.setAttribute('aria-busy', 'true');
    }
    function restore() {
      if (!button) return;
      button.disabled = false;
      button.classList.remove('is-loading');
      button.removeAttribute('aria-busy');
    }
    return fetch(cartAddUrl + '.js', {
      method: 'POST',
      credentials: 'same-origin',
      headers: isForm ? { Accept: 'application/json' } : { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: isForm ? payload : JSON.stringify(payload)
    }).then(function (response) {
      return response.json().then(function (result) {
        if (!response.ok) {
          showToast(result.description || result.message || data.cartError);
          restore();
          return null;
        }
        return refreshCart().then(function (cart) {
          restore();
          openDrawer(true);
          return cart;
        });
      });
    }, function (error) { restore(); throw error; });
  }

  window.MvCart = { add: addToCart, open: openDrawer, close: closeDrawer, refresh: refreshCart, money: money };

  if (drawer) {
    document.addEventListener('click', function (event) {
      if (event.target.closest('[data-mini-cart-close]')) { closeDrawer(); return; }
      var toggle = event.target.closest('[data-cart-toggle]');
      if (!toggle || event.metaKey || event.ctrlKey || event.shiftKey || event.button > 0) return;
      if (body.dataset.page === 'cart') return; // already on the bag page
      event.preventDefault();
      // Stop the page-transition overlay from treating this as a navigation.
      event.stopPropagation();
      openDrawer(false);
      refreshCart().catch(function () { window.location.href = cartUrl; });
    }, true);
    document.addEventListener('keydown', function (event) {
      if (!drawer.classList.contains('is-open')) return;
      // The quick-add dialog can open on top of the drawer; it handles its own keys.
      var quick = document.getElementById('QuickAdd');
      if (quick && !quick.hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); closeDrawer(); return; }
      if (window.mvTrapFocus) window.mvTrapFocus(drawer, event);
    });
    setCounts(Number(($('[data-cart-count]') || {}).textContent) || 0);
  }

  /* ── Quick add ─────────────────────────────────────────────────────── */
  (function () {
    var modal = document.getElementById('QuickAdd');
    var backdrop = $('[data-quick-backdrop]');
    if (!modal || !backdrop) return;
    var image = $('[data-quick-image]', modal);
    var titleNode = $('[data-quick-title]', modal);
    var priceNode = $('[data-quick-price]', modal);
    var optionsBox = $('[data-quick-options]', modal);
    var submit = $('[data-quick-submit]', modal);
    var link = $('[data-quick-link]', modal);
    var lastFocused = null;
    var product = null;
    var selection = [];
    var cache = {};

    function findVariant() {
      if (!product) return null;
      return product.variants.filter(function (variant) {
        return selection.every(function (value, i) { return variant.options[i] === value; });
      })[0] || null;
    }
    function valueAvailable(optionIndex, value) {
      return product.variants.some(function (variant) {
        if (!variant.available || variant.options[optionIndex] !== value) return false;
        return selection.every(function (chosen, i) { return i === optionIndex || variant.options[i] === chosen; });
      });
    }
    function sync() {
      var variant = findVariant();
      $$('[data-quick-value]', optionsBox).forEach(function (button) {
        var optionIndex = Number(button.dataset.quickOption);
        var on = selection[optionIndex] === button.dataset.quickValue;
        button.setAttribute('aria-checked', String(on));
        button.tabIndex = on ? 0 : -1;
        button.dataset.unavailable = String(!valueAvailable(optionIndex, button.dataset.quickValue));
      });
      $$('[data-quick-current]', optionsBox).forEach(function (node) {
        node.textContent = selection[Number(node.dataset.quickCurrent)] || '';
      });
      priceNode.textContent = '';
      if (variant) {
        priceNode.appendChild(el('span', null, money(variant.price)));
        if (variant.compare_at_price > variant.price) priceNode.appendChild(el('s', null, money(variant.compare_at_price)));
        if (variant.featured_image && variant.featured_image.src) image.src = sized(variant.featured_image.src, 600);
      }
      submit.disabled = !variant || !variant.available;
      submit.textContent = !variant ? (data.unavailableLabel || 'Unavailable') : variant.available ? (data.addLabel || 'Add to bag') : (data.soldLabel || 'Sold out');
    }
    function sized(src, width) {
      if (!src) return '';
      return src + (src.indexOf('?') > -1 ? '&' : '?') + 'width=' + width;
    }
    function build(productData) {
      product = productData;
      titleNode.textContent = product.title;
      link.href = product.url || rootUrl + 'products/' + product.handle;
      image.src = sized(product.featured_image, 600);
      image.alt = product.title;
      optionsBox.textContent = '';
      var first = product.variants.filter(function (variant) { return variant.available; })[0] || product.variants[0];
      selection = first.options.slice();
      product.options.forEach(function (option, optionIndex) {
        var values = option.values || [];
        if (values.length < 2 && product.variants.length < 2) return;
        var group = el('div', 'ms-quick__option');
        var legend = el('p', 'ms-quick__label', option.name + ': ');
        var current = el('strong');
        current.dataset.quickCurrent = optionIndex;
        legend.appendChild(current);
        group.appendChild(legend);
        var list = el('div', 'ms-quick__values');
        list.setAttribute('role', 'radiogroup');
        list.setAttribute('aria-label', option.name);
        values.forEach(function (value) {
          var button = el('button', 'ms-pill', value);
          button.type = 'button';
          button.setAttribute('role', 'radio');
          button.dataset.quickOption = optionIndex;
          button.dataset.quickValue = value;
          button.addEventListener('click', function () { selection[optionIndex] = value; sync(); });
          list.appendChild(button);
        });
        group.appendChild(list);
        optionsBox.appendChild(group);
      });
      sync();
    }
    function open() {
      lastFocused = document.activeElement;
      modal.hidden = false;
      backdrop.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      body.classList.add('mv-cart-open');
      window.requestAnimationFrame(function () { modal.classList.add('is-open'); });
      window.setTimeout(function () { ($('[data-quick-close]', modal) || modal).focus({ preventScroll: true }); }, 40);
    }
    function close(restoreFocus) {
      if (modal.hidden) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      modal.hidden = true;
      backdrop.hidden = true;
      if (!drawer || !drawer.classList.contains('is-open')) body.classList.remove('mv-cart-open');
      if (restoreFocus !== false && lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    document.addEventListener('click', function (event) {
      if (event.target.closest('[data-quick-close]')) { close(); return; }
      var trigger = event.target.closest('[data-quick-add]');
      if (!trigger) return;
      event.preventDefault();
      var handle = trigger.dataset.handle;

      // One variant: nothing to choose, add it straight away.
      if (trigger.dataset.variantId) {
        addToCart({ items: [{ id: Number(trigger.dataset.variantId), quantity: 1 }] }, trigger)
          .catch(function () { window.location.href = rootUrl + 'products/' + handle; });
        return;
      }

      trigger.classList.add('is-loading');
      var request = cache[handle] || (cache[handle] = fetch(rootUrl + 'products/' + handle + '.js', { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
        .then(function (response) { if (!response.ok) throw new Error('Product unavailable'); return response.json(); }));
      request.then(function (productData) {
        trigger.classList.remove('is-loading');
        build(productData);
        open();
      }).catch(function () {
        delete cache[handle];
        trigger.classList.remove('is-loading');
        window.location.href = rootUrl + 'products/' + handle;
      });
    });

    submit.addEventListener('click', function () {
      var variant = findVariant();
      if (!variant || !variant.available) return;
      addToCart({ items: [{ id: variant.id, quantity: 1 }] }, submit).then(function (cart) {
        if (cart) close(false);
      }).catch(function () { window.location.href = link.href; });
    });

    document.addEventListener('keydown', function (event) {
      if (modal.hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); close(); return; }
      if (window.mvTrapFocus) window.mvTrapFocus(modal, event);
    });
  })();

  /* ── Product page: sale badge, stock line, recently viewed record ──── */
  (function () {
    var root = $('[data-product-root]');
    if (!root) return;
    var idInput = $('[data-variant-id]', root);
    var saveBadge = $('[data-product-save]', root);
    var saving = $('[data-product-saving]', root);
    var savingText = $('[data-product-saving-text]', root);
    var stock = $('[data-stock]', root);
    var stockText = $('[data-stock-text]', root);
    var price = $('[data-product-price]', root);
    var variants = [];
    var stockMap = {};
    try { variants = JSON.parse($('[data-product-json]', root).textContent) || []; } catch (error) { variants = []; }
    try { stockMap = JSON.parse($('[data-stock-json]', root).textContent) || {}; } catch (error) { stockMap = {}; }

    function syncVariant() {
      var id = idInput ? idInput.value : '';
      var variant = variants.filter(function (item) { return String(item.id) === String(id); })[0];
      var onSale = !!(variant && variant.compare_at_price > variant.price);
      if (price) price.classList.toggle('is-sale', onSale);
      if (saveBadge) {
        saveBadge.hidden = !onSale;
        if (onSale) {
          var percent = Math.round((variant.compare_at_price - variant.price) * 100 / variant.compare_at_price);
          saveBadge.textContent = (root.dataset.saveLabel || 'Save [percent]%').replace('[percent]', percent);
        }
      }
      if (saving && savingText) {
        saving.hidden = !onSale;
        if (onSale) savingText.textContent = (root.dataset.savingLabel || 'You save [amount]').replace('[amount]', money(variant.compare_at_price - variant.price));
      }
      if (stock && stockText) {
        var state = variant ? (stockMap[variant.id] || (variant.available ? 'in' : 'out')) : 'out';
        stock.classList.toggle('is-out', state === 'out');
        stock.classList.toggle('is-low', state.indexOf('low:') === 0);
        if (state === 'out') stockText.textContent = variant ? root.dataset.stockOut : (data.unavailableLabel || root.dataset.stockOut);
        else if (state.indexOf('low:') === 0) stockText.textContent = (root.dataset.stockLow || '').replace('[count]', state.slice(4));
        else stockText.textContent = root.dataset.stockIn;
      }
    }
    var form = $('[data-product-form]', root);
    if (form) form.addEventListener('change', function () { window.setTimeout(syncVariant, 30); });
    syncVariant();

    // Desktop buy bar, shown once the main button has scrolled out of view.
    var bar = $('[data-stickybar]', root);
    var addButton = $('[data-add-button]', root);
    if (bar && addButton && 'IntersectionObserver' in window) {
      var barAdd = $('[data-stickybar-add]', bar);
      var barPrice = $('[data-stickybar-price]', bar);
      var barVariant = $('[data-stickybar-variant]', bar);
      var barImage = $('[data-stickybar-image]', bar);
      var syncBar = function () {
        var id = idInput ? idInput.value : '';
        var variant = variants.filter(function (item) { return String(item.id) === String(id); })[0];
        if (barPrice) barPrice.textContent = variant ? money(variant.price) : '';
        if (barVariant) barVariant.textContent = variant && variant.title && variant.title !== 'Default Title' ? variant.title : '';
        if (barImage && variant && variant.featured_image && variant.featured_image.src) {
          barImage.src = variant.featured_image.src + (variant.featured_image.src.indexOf('?') > -1 ? '&' : '?') + 'width=160';
        }
        if (barAdd) {
          barAdd.disabled = addButton.disabled;
          barAdd.textContent = addButton.textContent.trim();
        }
      };
      bar.hidden = false;
      new IntersectionObserver(function (entries) {
        var entry = entries[0];
        bar.classList.toggle('is-visible', !entry.isIntersecting && entry.boundingClientRect.top < 0);
      }).observe(addButton);
      if (barAdd) barAdd.addEventListener('click', function () { addButton.click(); });
      if (form) form.addEventListener('change', function () { window.setTimeout(syncBar, 60); });
      syncBar();
    }

    // Full-screen image viewer for the gallery.
    var mainMedia = $('.mv-product-main-media', root);
    var mainImage = mainMedia && $('img', mainMedia);
    if (mainImage) {
      var lightbox = null;
      var lightboxImage = null;
      var lightboxCount = null;
      var lightboxIndex = 0;
      var lightboxLast = null;
      var gallerySources = function () {
        var thumbs = $$('.mv-product-thumbs [data-media-src]', root).filter(function (thumb) { return !thumb.hidden; });
        if (!thumbs.length) return [{ src: mainImage.currentSrc || mainImage.src, alt: mainImage.alt, current: true }];
        return thumbs.map(function (thumb) {
          return { src: thumb.dataset.mediaSrc, alt: thumb.dataset.mediaAlt || mainImage.alt, current: thumb.getAttribute('aria-current') === 'true' };
        });
      };
      var showLightbox = function (index) {
        var list = gallerySources();
        lightboxIndex = (index + list.length) % list.length;
        lightboxImage.src = list[lightboxIndex].src;
        lightboxImage.alt = list[lightboxIndex].alt || '';
        lightboxCount.textContent = (lightboxIndex + 1) + ' / ' + list.length;
        $$('[data-lightbox-step]', lightbox).forEach(function (button) { button.hidden = list.length < 2; });
      };
      var closeLightbox = function () {
        if (!lightbox || lightbox.hidden) return;
        lightbox.hidden = true;
        body.classList.remove('mv-cart-open');
        if (lightboxLast && typeof lightboxLast.focus === 'function') lightboxLast.focus();
      };
      var buildLightbox = function () {
        lightbox = el('div', 'ms-lightbox');
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-modal', 'true');
        lightbox.setAttribute('aria-label', root.dataset.rvTitle || '');
        lightbox.tabIndex = -1;
        lightbox.hidden = true;
        lightboxImage = document.createElement('img');
        lightbox.appendChild(lightboxImage);
        var make = function (className, name, label, step) {
          var button = el('button', className);
          button.type = 'button';
          button.setAttribute('aria-label', label);
          if (step) button.setAttribute('data-lightbox-step', step);
          button.appendChild(icon(name));
          lightbox.appendChild(button);
          return button;
        };
        make('ms-lightbox__close', 'close', root.dataset.zoomClose || 'Close').addEventListener('click', closeLightbox);
        make('ms-lightbox__prev', 'arrow-left', root.dataset.prevLabel || 'Previous', '-1').addEventListener('click', function () { showLightbox(lightboxIndex - 1); });
        make('ms-lightbox__next', 'arrow-right', root.dataset.nextLabel || 'Next', '1').addEventListener('click', function () { showLightbox(lightboxIndex + 1); });
        lightboxCount = el('p', 'ms-lightbox__count');
        lightbox.appendChild(lightboxCount);
        lightboxImage.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function (event) { if (event.target === lightbox) closeLightbox(); });
        document.addEventListener('keydown', function (event) {
          if (!lightbox || lightbox.hidden) return;
          if (event.key === 'Escape') { event.preventDefault(); closeLightbox(); }
          else if (event.key === 'ArrowRight') showLightbox(lightboxIndex + 1);
          else if (event.key === 'ArrowLeft') showLightbox(lightboxIndex - 1);
          else if (window.mvTrapFocus) window.mvTrapFocus(lightbox, event);
        });
        body.appendChild(lightbox);
      };
      var openLightbox = function () {
        if (!lightbox) buildLightbox();
        lightboxLast = document.activeElement;
        var list = gallerySources();
        var start = Math.max(0, list.findIndex(function (item) { return item.current; }));
        lightbox.hidden = false;
        body.classList.add('mv-cart-open');
        showLightbox(start);
        window.setTimeout(function () { $('.ms-lightbox__close', lightbox).focus({ preventScroll: true }); }, 30);
      };
      mainImage.addEventListener('click', openLightbox);
      // Keyboard and screen-reader route to the same viewer.
      mainImage.tabIndex = 0;
      mainImage.setAttribute('role', 'button');
      mainImage.setAttribute('aria-label', (root.dataset.zoomLabel || 'Zoom image') + ': ' + (root.dataset.rvTitle || ''));
      mainImage.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openLightbox(); }
      });
    }

    // Remember this product for the "Recently viewed" rail.
    if (root.dataset.rvHandle) {
      var entry = {
        handle: root.dataset.rvHandle,
        title: root.dataset.rvTitle,
        url: root.dataset.rvUrl,
        image: root.dataset.rvImage,
        price: root.dataset.rvPrice,
        currency: window.Shopify && Shopify.currency ? Shopify.currency.active : ''
      };
      var list = readRecent().filter(function (item) { return item.handle !== entry.handle; });
      list.unshift(entry);
      try { localStorage.setItem(recentKey, JSON.stringify(list.slice(0, 9))); } catch (error) {}
    }
  })();

  /* ── Campaign bar: countdown to the real start date ────────────────── */
  (function () {
    var bar = $('[data-campaign]');
    if (!bar) return;
    var live = bar.dataset.campaign === 'live';
    if (live) {
      // Name the sale where reduced prices are shown.
      $$('[data-campaign-tag]').forEach(function (tag) { tag.textContent = bar.dataset.campaignPriceLabel || ''; });
      $$('[data-deals-title]').forEach(function (title) { if (bar.dataset.campaignDealsLabel) title.textContent = bar.dataset.campaignDealsLabel; });
      return;
    }
    var clock = $('[data-countdown]', bar);
    if (!clock) return;
    var parts = (clock.dataset.countdown || '').split('-');
    if (parts.length !== 3) return;
    // Midnight at the start of the campaign day, in the shopper's own time zone.
    var target = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
    if (isNaN(target)) return;
    var days = $('[data-countdown-days]', clock);
    var hours = $('[data-countdown-hours]', clock);
    var minutes = $('[data-countdown-minutes]', clock);
    var seconds = $('[data-countdown-seconds]', clock);
    var pad = function (value) { return (value < 10 ? '0' : '') + value; };
    var timer = 0;
    function tick() {
      var left = Math.floor((target - Date.now()) / 1000);
      if (left <= 0) { clock.hidden = true; window.clearInterval(timer); return; }
      days.textContent = Math.floor(left / 86400);
      hours.textContent = pad(Math.floor(left % 86400 / 3600));
      minutes.textContent = pad(Math.floor(left % 3600 / 60));
      seconds.textContent = pad(left % 60);
      clock.hidden = false;
    }
    tick();
    timer = window.setInterval(tick, 1000);
  })();

  /* ── Personalization ───────────────────────────────────────────────
     Product page: a switch reveals the fields (they stay disabled, and so
     are not submitted, while it is off), a preview shows the text in the
     chosen colour, and the text is checked before anything is added.
     Exposed as window.MvPers for the add-to-bag and buy-now paths. */
  (function () {
    var box = $('[data-pers]');
    if (!box) return;
    var toggle = $('[data-pers-toggle]', box);
    var fields = $('[data-pers-fields]', box);
    var text = $('[data-pers-text]', box);
    var count = $('[data-pers-count]', box);
    var error = $('[data-pers-error]', box);
    var plate = $('[data-pers-plate]', box);
    var preview = $('[data-pers-preview]', box);
    var colorName = $('[data-pers-color-name]', box);
    var max = Number(box.dataset.max) || 12;
    var sample = preview ? preview.textContent : '';
    // Letters (any alphabet), digits, spaces and . & - ' only.
    var allowed = /^[\p{L}\p{N} .&'\-]*$/u;

    function inputs() { return $$('input', fields); }
    function setOn(on) {
      fields.hidden = !on;
      inputs().forEach(function (input) { input.disabled = !on; });
      box.classList.toggle('is-on', on);
      if (on) window.setTimeout(function () { text.focus(); }, 30);
      else showError('');
    }
    function showError(message) {
      error.textContent = message;
      error.hidden = !message;
      text.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
    function sync() {
      var value = text.value;
      count.textContent = value.length + '/' + max;
      if (preview) preview.textContent = value.trim() || sample;
      var color = $('[data-pers-color]:checked', box);
      if (color && plate) plate.dataset.tone = color.dataset.tone;
      if (color && colorName) colorName.textContent = color.value;
      if (value && !allowed.test(value)) showError(box.dataset.invalid);
      else if (!error.hidden && value.trim()) showError('');
    }
    toggle.addEventListener('change', function () { setOn(toggle.checked); });
    box.addEventListener('input', sync);
    box.addEventListener('change', sync);
    setOn(false);
    sync();

    // Arriving at #personalize (from the home page or a card) opens the area.
    if (window.location.hash === '#personalize') {
      toggle.checked = true;
      setOn(true);
      box.scrollIntoView({ block: 'center' });
    }

    window.MvPers = {
      active: function () { return toggle.checked; },
      // Returns the properties, false when the text needs fixing, or null when off.
      read: function () {
        if (!toggle.checked) return null;
        var value = text.value.trim();
        if (!value) { showError(box.dataset.required); text.focus(); return false; }
        if (!allowed.test(value)) { showError(box.dataset.invalid); text.focus(); return false; }
        showError('');
        var props = {};
        inputs().forEach(function (input) {
          if (input.disabled || !/^properties\[/.test(input.name)) return;
          if ((input.type === 'radio' || input.type === 'checkbox') && !input.checked) return;
          props[input.name.slice(11, -1)] = input.name === 'properties[Personalization]' ? value : input.value;
        });
        return props;
      }
    };
  })();

  /* Live preview in "Make It Yours" (home page) */
  $$('[data-personal-demo]').forEach(function (demo) {
    var input = $('[data-demo-input]', demo);
    var plateText = $('[data-demo-text]', demo);
    var plate = $('[data-demo-plate]', demo);
    if (input && plateText) input.addEventListener('input', function () { plateText.textContent = input.value.trim() || 'M.A.'; });
    $$('[data-demo-tone]', demo).forEach(function (button) {
      button.addEventListener('click', function () {
        $$('[data-demo-tone]', demo).forEach(function (other) {
          other.classList.toggle('is-active', other === button);
          other.setAttribute('aria-pressed', String(other === button));
        });
        if (plate) plate.dataset.tone = button.dataset.demoTone;
      });
    });
  });

  /* ── Product page: add-ons, buy now, bundle ────────────────────────── */
  (function () {
    var root = $('[data-product-root]');
    if (!root) return;
    var form = $('[data-product-form]', root);
    var idInput = $('[data-variant-id]', root);
    var quantityInput = form && $('[name="quantity"]', form);
    var variants = [];
    try { variants = JSON.parse($('[data-product-json]', root).textContent) || []; } catch (error) { variants = []; }

    function currentVariant() {
      var id = idInput ? idInput.value : '';
      return variants.filter(function (item) { return String(item.id) === String(id); })[0] || null;
    }
    function quantity() { return Math.max(1, parseInt(quantityInput && quantityInput.value, 10) || 1); }
    function picked(node) {
      // A <select> of variants, or a hidden input for single-variant products.
      if (!node) return null;
      var option = node.tagName === 'SELECT' ? node.options[node.selectedIndex] : node;
      if (!option || !node.value) return null;
      return { id: Number(node.value), price: Number(option.getAttribute('data-price')) || 0 };
    }

    // Add-ons: switched-on extras travel with the main product.
    var addonRows = $$('[data-addon]', root);
    var orderTotal = $('[data-order-total]', root);
    var orderTotalValue = $('[data-order-total-value]', root);
    function selectedAddons() {
      return addonRows.filter(function (row) { return $('[data-addon-check]', row).checked; })
        .map(function (row) { return picked($('[data-addon-variant]', row)); })
        .filter(Boolean);
    }
    function syncAddons() {
      addonRows.forEach(function (row) {
        var choice = picked($('[data-addon-variant]', row));
        var price = $('[data-addon-price]', row);
        if (choice && price) price.textContent = money(choice.price);
        row.classList.toggle('is-on', $('[data-addon-check]', row).checked);
      });
      if (!orderTotal) return;
      var extras = selectedAddons();
      var variant = currentVariant();
      orderTotal.hidden = !extras.length || !variant;
      if (extras.length && variant) {
        var sum = variant.price * quantity();
        extras.forEach(function (extra) { sum += extra.price; });
        orderTotalValue.textContent = money(sum);
      }
    }
    // null when the personalization text needs fixing (the message is shown).
    function orderItems() {
      var variant = currentVariant();
      if (!variant) return [];
      var personal = window.MvPers ? window.MvPers.read() : null;
      if (personal === false) return null;
      var items = [{ id: variant.id, quantity: quantity() }];
      if (personal) items[0].properties = personal;
      selectedAddons().forEach(function (extra) { items.push({ id: extra.id, quantity: 1 }); });
      return items;
    }
    if (form) {
      form.addEventListener('change', function () { window.setTimeout(syncAddons, 40); });
      syncAddons();
    }

    // Used by the product form (mavelania-product-enhancements.js).
    if (window.MvCart) {
      window.MvCart.addProductForm = function (productForm, button) {
        var items = orderItems();
        if (items === null) return Promise.resolve(null);
        if (!items.length) return Promise.reject(new Error('No variant selected'));
        return window.MvCart.add({ items: items }, button);
      };
    }

    // Buy now: a cart permalink takes the shopper straight to checkout.
    var buyNow = $('[data-buy-now]', root);
    var addButton = $('[data-add-button]', root);
    if (buyNow) {
      var syncBuyNow = function () {
        var variant = currentVariant();
        buyNow.disabled = !variant || !variant.available;
      };
      buyNow.addEventListener('click', function () {
        var items = orderItems();
        if (!items || !items.length) return;
        buyNow.classList.add('is-loading');
        var base = root.dataset.rootUrl || rootUrl;
        // A cart permalink cannot carry personalization, so a personalized
        // piece is added to the bag first and the shopper goes to checkout.
        if (items.some(function (item) { return item.properties; })) {
          fetch(cartAddUrl + '.js', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ items: items })
          }).then(function (response) {
            if (!response.ok) throw new Error('Add failed');
            window.location.href = base + 'checkout';
          }).catch(function () {
            buyNow.classList.remove('is-loading');
            showToast(data.cartError);
          });
          return;
        }
        window.location.href = base + 'cart/' + items.map(function (item) { return item.id + ':' + item.quantity; }).join(',');
      });
      // Coming back with the browser's back button must not leave the spinner on.
      window.addEventListener('pageshow', function () { buyNow.classList.remove('is-loading'); });
      if (form) form.addEventListener('change', function () { window.setTimeout(syncBuyNow, 40); });
      syncBuyNow();
    }

    // Bundle
    var bundle = $('[data-bundle]', root);
    if (bundle) {
      var bundleTotal = $('[data-bundle-total]', bundle);
      var bundleCount = $('[data-bundle-count]', bundle);
      var bundleAdd = $('[data-bundle-add]', bundle);
      var mainPrice = $('[data-bundle-main-price]', bundle);
      var mainVariant = $('[data-bundle-main-variant]', bundle);
      var mainImage = $('[data-bundle-main] img', bundle);
      var optional = $$('[data-bundle-item]', bundle).filter(function (item) { return !item.hasAttribute('data-bundle-main'); });
      var bundleItems = function () {
        var variant = currentVariant();
        var items = variant && variant.available ? [{ id: variant.id, quantity: 1, price: variant.price }] : [];
        optional.forEach(function (item) {
          if (!$('[data-bundle-check]', item).checked) return;
          var choice = picked($('[data-bundle-variant]', item));
          if (choice) items.push({ id: choice.id, quantity: 1, price: choice.price });
        });
        return items;
      };
      var syncBundle = function () {
        var variant = currentVariant();
        if (variant) {
          if (mainPrice) mainPrice.textContent = money(variant.price);
          if (mainVariant) mainVariant.textContent = variant.title && variant.title !== 'Default Title' ? variant.title : '';
          if (mainImage && variant.featured_image && variant.featured_image.src) {
            mainImage.removeAttribute('srcset');
            mainImage.src = variant.featured_image.src + (variant.featured_image.src.indexOf('?') > -1 ? '&' : '?') + 'width=320';
          }
        }
        optional.forEach(function (item) {
          var choice = picked($('[data-bundle-variant]', item));
          var price = $('[data-bundle-price]', item);
          if (choice && price) price.textContent = money(choice.price);
          item.classList.toggle('is-off', !$('[data-bundle-check]', item).checked);
        });
        var items = bundleItems();
        var sum = 0;
        items.forEach(function (item) { sum += item.price; });
        if (bundleTotal) bundleTotal.textContent = money(sum);
        if (bundleCount) bundleCount.textContent = items.length > 1 ? (root.dataset.setCount || '[count] pieces').replace('[count]', items.length) : '';
        if (bundleAdd) bundleAdd.disabled = items.length < 2 || !variant || !variant.available;
      };
      bundle.addEventListener('change', syncBundle);
      if (form) form.addEventListener('change', function () { window.setTimeout(syncBundle, 40); });
      if (bundleAdd) {
        bundleAdd.addEventListener('click', function () {
          var items = bundleItems().map(function (item) { return { id: item.id, quantity: item.quantity }; });
          if (items.length < 2 || !window.MvCart) return;
          var code = bundle.dataset.code;
          // A real Shopify discount code, when the merchant configured one:
          // visiting /discount/CODE makes checkout apply it automatically.
          var applied = code ? fetch((root.dataset.rootUrl || rootUrl) + 'discount/' + encodeURIComponent(code), { credentials: 'same-origin' }).catch(function () {}) : Promise.resolve();
          applied.then(function () { return window.MvCart.add({ items: items }, bundleAdd); })
            .catch(function () { if (addButton) addButton.click(); });
        });
      }
      syncBundle();
    }
  })();

  /* ── Chapters: the page colour glides with the chapter in view ─────
     Each [data-chapter] names a tone (cream, coffee, green). The tone of
     the chapter crossing the middle of the screen is set on <html>, and
     the CSS eases the background and text colours between tones. */
  (function () {
    var chapters = $$('[data-chapter]');
    if (!chapters.length || !('IntersectionObserver' in window)) return;
    var root = document.documentElement;
    var current = '';
    function apply(tone) {
      if (!tone || tone === current) return;
      current = tone;
      root.setAttribute('data-tone', tone);
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) apply(entry.target.dataset.chapter); });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    chapters.forEach(function (chapter) { observer.observe(chapter); });
    apply(chapters[0].dataset.chapter);
    root.classList.add('ms-tones');
  })();

  /* ── Monogram ──────────────────────────────────────────────────────
     The visitor types their initials once; every product photo then shows
     them as a small stamped leather tab (a preview, stored in this browser
     only), and the personalization form starts with them. */
  (function () {
    var root = $('[data-monogram]');
    if (!root) return;
    var key = 'mv-monogram';
    var pill = $('[data-monogram-toggle]', root);
    var panel = $('[data-monogram-panel]', root);
    var input = $('[data-monogram-input]', root);
    var seal = $('[data-monogram-seal]', root);
    var label = $('[data-monogram-label]', root);
    var defaultLabel = label ? label.textContent : '';
    var lastFocus = null;

    function read() { try { return (localStorage.getItem(key) || '').slice(0, 6); } catch (error) { return ''; } }
    function write(value) { try { if (value) localStorage.setItem(key, value); else localStorage.removeItem(key); } catch (error) {} }
    function clean(value) { return String(value || '').toUpperCase().replace(/[^\p{L}\p{N} .&'\-]/gu, '').trim().slice(0, 6); }

    function paint(value) {
      root.classList.toggle('is-set', !!value);
      if (seal) seal.textContent = value || 'Aa';
      if (label) label.textContent = value ? value : defaultLabel;
      $$('[data-monogram-target], .ms-essential__media, .mv-product-main-media').forEach(function (target) {
        var stamp = $(':scope > .ms-stamp', target);
        if (!value) { if (stamp) stamp.remove(); return; }
        if (!stamp) {
          stamp = el('span', 'ms-stamp');
          stamp.setAttribute('aria-hidden', 'true');
          target.appendChild(stamp);
        }
        stamp.textContent = value;
      });
      var personal = $('[data-pers-text]');
      if (personal && value && !personal.value) {
        personal.value = value;
        personal.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    function open() {
      lastFocus = document.activeElement;
      panel.hidden = false;
      pill.setAttribute('aria-expanded', 'true');
      root.classList.add('is-open');
      input.value = read();
      window.setTimeout(function () { input.focus(); input.select(); }, 30);
    }
    function close() {
      if (panel.hidden) return;
      panel.hidden = true;
      pill.setAttribute('aria-expanded', 'false');
      root.classList.remove('is-open');
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    pill.addEventListener('click', function () { if (panel.hidden) open(); else close(); });
    $('[data-monogram-close]', root).addEventListener('click', close);
    $('[data-monogram-form]', root).addEventListener('submit', function (event) {
      event.preventDefault();
      var value = clean(input.value);
      write(value);
      paint(value);
      close();
    });
    input.addEventListener('input', function () { if (seal) seal.textContent = clean(input.value) || 'Aa'; });
    $('[data-monogram-clear]', root).addEventListener('click', function () { input.value = ''; write(''); paint(''); close(); });
    document.addEventListener('click', function (event) {
      if (event.target.closest('[data-monogram-open]')) { event.preventDefault(); open(); return; }
      if (!panel.hidden && !root.contains(event.target)) close();
    });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') close(); });
    paint(read());
  })();

  /* Personalization: the "special request" mail carries the product and the
     text typed so far. */
  $$('[data-pers-mail]').forEach(function (link) {
    var box = link.closest('[data-pers]');
    var text = box && $('[data-pers-text]', box);
    function sync() {
      var body = link.dataset.body + (text && text.value.trim() ? '\n\nText: ' + text.value.trim() : '');
      link.href = 'mailto:' + link.dataset.email + '?subject=' + encodeURIComponent(link.dataset.subject) + '&body=' + encodeURIComponent(body);
    }
    if (text) text.addEventListener('input', sync);
    sync();
  });

  /* ── Recently viewed ───────────────────────────────────────────────── */
  function readRecent() {
    try {
      var value = JSON.parse(localStorage.getItem(recentKey) || '[]');
      return Array.isArray(value) ? value.filter(function (item) { return item && item.handle && item.url; }) : [];
    } catch (error) { return []; }
  }
  $$('[data-recently-viewed]').forEach(function (section) {
    var list = $('[data-recently-viewed-list]', section);
    if (!list) return;
    var currency = window.Shopify && Shopify.currency ? Shopify.currency.active : '';
    var items = readRecent().filter(function (item) { return item.handle !== section.dataset.exclude; }).slice(0, 8);
    if (!items.length) return;
    items.forEach(function (item) {
      var card = el('a', 'ms-mini');
      card.href = item.url;
      var frame = el('span', 'ms-mini__image');
      if (item.image) {
        var img = document.createElement('img');
        img.src = item.image;
        img.alt = '';
        img.loading = 'lazy';
        img.width = 240;
        img.height = 240;
        frame.appendChild(img);
      }
      card.appendChild(frame);
      card.appendChild(el('span', 'ms-mini__title', item.title));
      // A stored price is only shown while the shopper is still in the
      // currency it was recorded in.
      if (item.price && (!item.currency || !currency || item.currency === currency)) {
        card.appendChild(el('span', 'ms-mini__price', item.price));
      }
      list.appendChild(card);
    });
    section.hidden = false;
  });
})();
