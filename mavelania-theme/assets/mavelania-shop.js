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
      trash: 'M5 7h14M9.5 7V4.5h5V7M7 7l.8 12.5h8.4L17 7'
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

  /* ── Header: sticky, and slimmer while scrolling down ──────────────── */
  (function () {
    var header = $('[data-header]');
    if (!header) return;
    var wrap = header.closest('.shopify-section') || header.parentNode;
    if (wrap && wrap !== body) wrap.classList.add('ms-header-wrap');
    var main = $('.ms-header__main', header);
    var lastY = window.pageYOffset;
    var ticking = false;

    function measure() {
      if (!main) return;
      document.documentElement.style.setProperty('--ms-sticky', main.offsetHeight + 'px');
    }
    function update() {
      ticking = false;
      var y = window.pageYOffset;
      var condensed = header.classList.contains('is-condensed');
      if (y > 180 && y > lastY + 4 && !condensed) header.classList.add('is-condensed');
      else if ((y < lastY - 4 || y <= 180) && condensed) header.classList.remove('is-condensed');
      header.classList.toggle('is-stuck', y > 8);
      lastY = y;
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    header.addEventListener('focusin', function () { header.classList.remove('is-condensed'); });
    measure();
    update();
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
      panels.forEach(function (panel) { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
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
      body.classList.remove('mv-cart-open');
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
