(function () {
  document.documentElement.classList.remove('no-js');
  function trapFocus(container, event) {
    if (!container || event.key !== 'Tab') return;
    var selector = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    var focusable = Array.prototype.slice.call(container.querySelectorAll(selector)).filter(function (element) {
      return element.getClientRects().length > 0 && element.getAttribute('aria-hidden') !== 'true';
    });
    if (!focusable.length) { event.preventDefault(); container.focus(); return; }
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    var active = document.activeElement;
    if (event.shiftKey && (active === first || active === container || !container.contains(active))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (active === last || !container.contains(active))) {
      event.preventDefault(); first.focus();
    }
  }
  window.mvTrapFocus = trapFocus;
 
  var menuButton = document.querySelector('.mv-menu-toggle');
  var menu = document.querySelector('.mv-mobile-menu');
  if (menuButton && menu) {
    var menuCloseButton = menu.querySelector('[data-mobile-menu-close]');
    var menuLastFocused = null;
    function setMenuOpen(open) {
      if (open) menuLastFocused = document.activeElement;
      menu.classList.toggle('is-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? menuButton.dataset.closeLabel : menuButton.dataset.openLabel);
      menu.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('mv-mobile-menu-open', open);
      if (open) window.setTimeout(function () { menu.focus({ preventScroll: true }); }, 40);
      if (!open && menuLastFocused && typeof menuLastFocused.focus === 'function') menuLastFocused.focus();
    }
    menuButton.addEventListener('click', function () { setMenuOpen(!menu.classList.contains('is-open')); });
    if (menuCloseButton) menuCloseButton.addEventListener('click', function () { setMenuOpen(false); });
    menu.addEventListener('click', function (event) { if (event.target.closest('a') || event.target.closest('[data-favorites-toggle]')) setMenuOpen(false); });
    document.addEventListener('keydown', function (event) {
      if (!menu.classList.contains('is-open')) return;
      if (event.key === 'Escape') setMenuOpen(false); else trapFocus(menu, event);
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 900 && menu.classList.contains('is-open')) setMenuOpen(false); });
  }
 
  var favoritesKey = 'mv-shopify-favorites';
  var favorites = [];
  try { favorites = JSON.parse(localStorage.getItem(favoritesKey) || '[]'); } catch (error) { favorites = []; }
  var favoritesDrawer = document.getElementById('FavoritesDrawer');
  var favoritesBackdrop = document.querySelector('.mv-drawer-backdrop');
  var favoritesLastFocused = null;
  var favoriteEmptyLabel = document.body.dataset.favoriteEmpty || '';
  var favoriteAddLabel = document.body.dataset.favoriteAdd || '';
  var favoriteRemoveLabel = document.body.dataset.favoriteRemove || '';
  var favoriteAddedLabel = document.body.dataset.favoriteAdded || favoriteAddLabel;
  var favoriteRemovedLabel = document.body.dataset.favoriteRemoved || favoriteRemoveLabel;
  var favoriteStatus = document.querySelector('[data-favorites-status]');
  function announceFavorite(message) {
    if (!favoriteStatus) return;
    favoriteStatus.textContent = '';
    window.setTimeout(function () { favoriteStatus.textContent = message; }, 30);
  }
  function saveFavorites() { try { localStorage.setItem(favoritesKey, JSON.stringify(favorites)); } catch (error) {} }
  function renderFavorites() {
    document.querySelectorAll('[data-favorites-count]').forEach(function (count) { count.textContent = favorites.length; count.classList.toggle('is-empty', !favorites.length); });
    document.querySelectorAll('[data-favorite-product]').forEach(function (button) {
      var selected = favorites.some(function (item) { return item.handle === button.dataset.handle; });
      button.setAttribute('aria-pressed', String(selected));
      button.setAttribute('aria-label', selected ? favoriteRemoveLabel : favoriteAddLabel);
      var label = button.querySelector('span'); if (label) label.textContent = selected ? favoriteRemoveLabel : favoriteAddLabel;
    });
    var list = document.querySelector('[data-favorites-list]');
    if (!list) return;
    if (!favorites.length) { list.innerHTML = '<p>' + favoriteEmptyLabel + '</p>'; return; }
    function esc(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    list.innerHTML = favorites.map(function (item) {
      var image = item.image ? '<img src="' + esc(item.image) + '" alt="">' : '<span></span>';
      return '<article class="mv-favorite-item">' + image + '<a href="' + esc(item.url) + '"><strong>' + esc(item.title) + '</strong><small>' + esc(item.price) + '</small></a><button type="button" data-remove-favorite="' + esc(item.handle) + '" aria-label="' + esc(favoriteRemoveLabel) + '">×</button></article>';
    }).join('');
  }
  function setFavoritesOpen(open) {
    if (!favoritesDrawer || !favoritesBackdrop) return;
    if (open) favoritesLastFocused = document.activeElement;
    favoritesDrawer.classList.toggle('is-open', open);
    favoritesDrawer.setAttribute('aria-hidden', String(!open));
    favoritesBackdrop.hidden = !open;
    document.body.classList.toggle('mv-favorites-open', open);
    if (open) {
      var closeButton = favoritesDrawer.querySelector('[data-favorites-close]');
      if (closeButton) window.setTimeout(function () { closeButton.focus({ preventScroll: true }); }, 40);
    } else if (favoritesLastFocused && typeof favoritesLastFocused.focus === 'function') {
      favoritesLastFocused.focus();
    }
  }
  document.addEventListener('click', function (event) {
    var productButton = event.target.closest('[data-favorite-product]');
    if (productButton) {
      event.preventDefault();
      var handle = productButton.dataset.handle;
      var index = favorites.findIndex(function (item) { return item.handle === handle; });
      if (index >= 0) { favorites.splice(index, 1); announceFavorite(favoriteRemovedLabel); } else { favorites.push({ handle: handle, title: productButton.dataset.title, url: productButton.dataset.url, image: productButton.dataset.image, price: productButton.dataset.price }); announceFavorite(favoriteAddedLabel); }
      saveFavorites(); renderFavorites(); return;
    }
    var removeButton = event.target.closest('[data-remove-favorite]');
    if (removeButton) { favorites = favorites.filter(function (item) { return item.handle !== removeButton.dataset.removeFavorite; }); saveFavorites(); renderFavorites(); announceFavorite(favoriteRemovedLabel); return; }
    if (event.target.closest('[data-favorites-toggle]')) { event.preventDefault(); setFavoritesOpen(true); return; }
    if (event.target.closest('[data-favorites-close]')) { setFavoritesOpen(false); }
  });
  document.addEventListener('keydown', function (event) {
    if (!favoritesDrawer || !favoritesDrawer.classList.contains('is-open')) return;
    if (event.key === 'Escape') setFavoritesOpen(false); else trapFocus(favoritesDrawer, event);
  });
  renderFavorites();
 
  var transition = document.getElementById('pageTransition');
  if (transition) {
    var transitionActive = false;
    var transitionTimer = 0;
    function hideTransition() {
      transition.classList.remove('on');
      transition.setAttribute('aria-hidden', 'true');
      transitionActive = false;
      if (transitionTimer) window.clearTimeout(transitionTimer);
      transitionTimer = 0;
    }
    function showTransition() {
      transition.classList.add('on');
      transition.setAttribute('aria-hidden', 'false');
    }
    transition.addEventListener('click', hideTransition);
    /* Onceki surum her ic linkte preventDefault edip gezinmeyi transitionDuration
       kadar bekletiyordu; bu her tiklamaya sabit bir gecikme ekliyordu. Artik
       tarayici gezinmeyi normal hizinda baslatiyor, biz yalnizca ortu
       animasyonunu ustune bindiriyoruz. */
    document.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      var link = event.target.closest('a[href]');
      if (!link || link.hasAttribute('download') || link.target === '_blank') return;
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(href)) return;
      var destination;
      try { destination = new URL(link.href, window.location.href); } catch (error) { return; }
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname && destination.search === window.location.search && destination.hash) return;
      if (transitionActive) return;
      transitionActive = true;
      showTransition();
      /* Gezinme herhangi bir nedenle gerceklesmezse (indirme, iptal edilen
         istek) ortu ekranda takili kalmasin. */
      transitionTimer = window.setTimeout(hideTransition, 2500);
    });
    window.addEventListener('pageshow', function () { window.setTimeout(hideTransition, 80); });
    window.addEventListener('pagehide', showTransition);
    window.addEventListener('focus', function () { if (!transitionActive) hideTransition(); });
  }
 
  document.querySelectorAll('[data-product-root]').forEach(function (root) {
    var mainImage = root.querySelector('.mv-product-main-media img');
    var mediaButtons = Array.prototype.slice.call(root.querySelectorAll('[data-media-src]'));
    function applyMedia(button) {
      if (!mainImage || !button) return;
      if (button.dataset.mediaSrcset) mainImage.setAttribute('srcset', button.dataset.mediaSrcset); else mainImage.removeAttribute('srcset');
      mainImage.setAttribute('sizes', '(max-width: 900px) 100vw, 58vw');
      mainImage.src = button.dataset.mediaSrc;
      if (button.dataset.mediaAlt) mainImage.alt = button.dataset.mediaAlt;
      mediaButtons.forEach(function (item) {
        if (item === button) item.setAttribute('aria-current', 'true'); else item.removeAttribute('aria-current');
      });
    }
    mediaButtons.forEach(function (button) { button.addEventListener('click', function () { applyMedia(button); }); });
    var json = root.querySelector('[data-product-json]');
    var idInput = root.querySelector('[data-variant-id]');
    var addButton = root.querySelector('[data-add-button]');
    var price = root.querySelector('[data-product-price]');
    var selectors = Array.prototype.slice.call(root.querySelectorAll('[data-option-index]'));
    if (!json || !idInput || !selectors.length) return;
    var variants;
    try { variants = JSON.parse(json.textContent); } catch (error) { return; }
    // Prices are formatted from the variant data itself; the theme used to
    // ship a second JSON block repeating every price, which is now gone.
    var moneyFormat = root.dataset.moneyFormat || '${{amount}}';
    function formatMoney(cents) {
      if (cents == null) return '';
      if (window.MvCart && window.MvCart.money) return window.MvCart.money(cents);
      var value = (cents / 100).toFixed(2);
      var parts = value.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      var amount = parts.join('.');
      return moneyFormat.replace(/\{\{\s*amount[^}]*\}\}/, amount);
    }
    function moneyFor(variantId, field) {
      var variant = variants.filter(function (v) { return String(v.id) === String(variantId); })[0];
      if (!variant) return '';
      if (field === 'compare_at_price') {
        return variant.compare_at_price > variant.price ? formatMoney(variant.compare_at_price) : '';
      }
      return formatMoney(variant.price);
    }
    function findVariant(values) {
      return variants.find(function (candidate) {
        return values.every(function (value, index) { return candidate.options[index] === value; });
      }) || null;
    }
 
    // Can this option value still be purchased alongside the other selected values?
    function valueIsPurchasable(optionIndex, value) {
      var values = selectors.map(function (select, index) { return index === optionIndex ? value : select.value; });
      var exact = findVariant(values);
      if (exact) return exact.available;
      return variants.some(function (candidate) {
        return candidate.options[optionIndex] === value && candidate.available;
      });
    }
 
    function markUnavailableValues() {
      selectors.forEach(function (select, optionIndex) {
        Array.prototype.forEach.call(select.options, function (option) {
          var ok = valueIsPurchasable(optionIndex, option.value);
          option.dataset.unavailable = String(!ok);
        });
      });
      root.dispatchEvent(new CustomEvent('mv:options-updated', { bubbles: true }));
    }
 
    var productForm = idInput.form || root.querySelector('[data-product-form]');
    var dynamicCheckout = root.querySelector('.shopify-payment-button');
 
    function setDynamicCheckoutEnabled(enabled) {
      if (!dynamicCheckout) return;
      dynamicCheckout.setAttribute('aria-disabled', String(!enabled));
      dynamicCheckout.style.opacity = enabled ? '' : '.42';
      dynamicCheckout.style.pointerEvents = enabled ? '' : 'none';
      dynamicCheckout.querySelectorAll('button').forEach(function (button) { button.disabled = !enabled; });
    }
 
    function setUnavailableState() {
      idInput.value = '';
      if (price) price.innerHTML = '';
      if (addButton) {
        addButton.disabled = true;
        addButton.textContent = root.dataset.unavailableLabel || root.dataset.soldLabel;
      }
      setDynamicCheckoutEnabled(false);
    }
 
    function updateVariant() {
      var values = selectors.map(function (select) { return select.value; });
      var variant = findVariant(values);
      markUnavailableValues();
 
      // No matching variant: never fall through to the previously selected one.
      if (!variant) { setUnavailableState(); return; }
 
      idInput.value = variant.id;
      if (price) {
        var regular = moneyFor(variant.id, 'price');
        var compare = moneyFor(variant.id, 'compare_at_price');
        price.innerHTML = regular + (compare ? '<s>' + compare + '</s>' : '');
      }
      if (addButton) {
        addButton.disabled = !variant.available;
        addButton.textContent = variant.available ? root.dataset.addLabel : root.dataset.soldLabel;
      }
      setDynamicCheckoutEnabled(variant.available);
      var featuredMediaId = variant.featured_media && variant.featured_media.id ? variant.featured_media.id : (variant.featured_image && variant.featured_image.id ? variant.featured_image.id : null);
      var variantMedia = featuredMediaId ? mediaButtons.find(function (button) { return String(button.dataset.mediaId) === String(featuredMediaId) || String(button.dataset.imageId) === String(featuredMediaId); }) : null;
      if (variantMedia) applyMedia(variantMedia); else if (mainImage && variant.featured_image && variant.featured_image.src) {
        mainImage.removeAttribute('srcset');
        mainImage.removeAttribute('sizes');
        mainImage.src = variant.featured_image.src;
      }
      if (history.replaceState) {
        var nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set('variant', variant.id);
        history.replaceState({}, '', nextUrl.pathname + nextUrl.search + nextUrl.hash);
      }
    }
 
    if (productForm) {
      productForm.addEventListener('submit', function (event) {
        if (!idInput.value) { event.preventDefault(); event.stopImmediatePropagation(); }
      }, true);
    }
    selectors.forEach(function (selector) { selector.addEventListener('change', updateVariant); });
    markUnavailableValues();
  });
 
  /* Apply the selected market immediately so prices update without requiring
     a second click elsewhere on the page.
 
     Switching market is a full page load and cannot be done client side:
     Shopify prices each market separately, so the new figures are not a
     currency conversion of the old ones (e.g. $209.99 in the US is EUR 185,95
     in Germany, not the FX equivalent). Converting in the browser would show
     prices the customer would not be charged. What we can do is make the wait
     legible instead of leaving the old price sitting there. */
  [].slice.call(document.querySelectorAll('[data-localization-select]')).forEach(function (select) {
    select.addEventListener('change', function () {
      var form = select.form;
      if (!form) return;
      select.setAttribute('aria-busy', 'true');
      /* Not `disabled` — a disabled select is left out of the submission and
         the chosen country would never reach Shopify. */
      form.classList.add('is-submitting');
      [].slice.call(document.querySelectorAll('[data-product-price], [data-mobile-price], .ms-card__price, .ms-line__price, .ms-mini__price, [data-mini-cart-total]'))
        .forEach(function (el) { el.classList.add('mv-price-pending'); });
      var overlay = document.getElementById('pageTransition');
      if (overlay) {
        overlay.classList.add('on');
        overlay.setAttribute('aria-hidden', 'false');
      }
      form.submit();
    });
  });
 
  /* Search suggestions: show five useful choices, remember recent searches,
     and replace them with Shopify product matches while the customer types. */
  (function () {
    var storageKey = 'mavelania_recent_searches_v1';
    var rootUrl = window.Shopify && Shopify.routes && Shopify.routes.root ? Shopify.routes.root : '/';
 
    function readRecent() {
      try {
        var value = JSON.parse(window.localStorage.getItem(storageKey) || '[]');
        return Array.isArray(value) ? value.filter(function (item) { return typeof item === 'string' && item.trim(); }).slice(0, 5) : [];
      } catch (error) { return []; }
    }
 
    function saveRecent(value) {
      var clean = String(value || '').trim();
      if (!clean) return;
      var next = readRecent().filter(function (item) { return item.toLocaleLowerCase() !== clean.toLocaleLowerCase(); });
      next.unshift(clean);
      try { window.localStorage.setItem(storageKey, JSON.stringify(next.slice(0, 5))); } catch (error) {}
    }
 
    function searchUrl(query) {
      return rootUrl + 'search?q=' + encodeURIComponent(query);
    }
 
    function fallbackItems() {
      var items = [];
      [].slice.call(document.querySelectorAll('[data-nav-collection]')).forEach(function (link) {
        var label = link.textContent.trim();
        if (label && link.href) items.push({ title: label, url: link.href, meta: 'Collection', kind: 'fallback' });
      });
      items = items.concat([
        { title: 'Bags', url: rootUrl + 'collections/bags', meta: 'Collection', kind: 'fallback' },
        { title: 'Wallets / Purses', url: rootUrl + 'collections/wallets-purses', meta: 'Collection', kind: 'fallback' },
        { title: 'Phone Cases', url: rootUrl + 'collections/phone-cases', meta: 'Collection', kind: 'fallback' },
        { title: 'Accessories', url: rootUrl + 'collections/accessories', meta: 'Collection', kind: 'fallback' },
        { title: 'All products', url: rootUrl + 'collections/all', meta: 'Collection', kind: 'fallback' }
      ]);
      return items;
    }
 
    function uniqueFive(items) {
      var seen = {};
      return items.filter(function (item) {
        var key = String(item.url || item.title).toLocaleLowerCase();
        if (!key || seen[key]) return false;
        seen[key] = true;
        return true;
      }).slice(0, 5);
    }
 
    function recentItems(query) {
      var normalized = String(query || '').trim().toLocaleLowerCase();
      return readRecent().filter(function (item) {
        return !normalized || item.toLocaleLowerCase().indexOf(normalized) !== -1;
      }).map(function (item) {
        return { title: item, url: searchUrl(item), meta: 'Recent search', kind: 'recent', query: item };
      });
    }
 
    function fillToFive(items, query) {
      var combined = items.slice();
      var clean = String(query || '').trim();
      if (clean) combined.push({ title: clean, url: searchUrl(clean), meta: 'Search', kind: 'query', query: clean });
      combined = combined.concat(recentItems(clean), fallbackItems());
      return uniqueFive(combined);
    }
 
    function makeSuggestion(item) {
      var link = document.createElement('a');
      link.className = 'mv-search-suggestion';
      link.href = item.url;
      link.setAttribute('role', 'option');
      link.tabIndex = -1;
      if (item.query) link.dataset.searchQuery = item.query;
 
      if (item.image) {
        var image = document.createElement('img');
        image.src = item.image;
        image.alt = '';
        image.loading = 'lazy';
        link.appendChild(image);
      } else {
        var placeholder = document.createElement('span');
        placeholder.className = 'mv-search-suggestion-placeholder';
        placeholder.setAttribute('aria-hidden', 'true');
        placeholder.textContent = item.kind === 'recent' ? '↺' : '⌕';
        link.appendChild(placeholder);
      }
 
      var copy = document.createElement('span');
      copy.className = 'mv-search-suggestion-copy';
      var title = document.createElement('span');
      title.className = 'mv-search-suggestion-title';
      title.textContent = item.title;
      var meta = document.createElement('small');
      meta.className = 'mv-search-suggestion-meta';
      meta.textContent = item.meta || '';
      copy.appendChild(title);
      copy.appendChild(meta);
      link.appendChild(copy);
 
      var arrow = document.createElement('span');
      arrow.className = 'mv-search-suggestion-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '→';
      link.appendChild(arrow);
      return link;
    }
 
    [].slice.call(document.querySelectorAll('[data-smart-search]')).forEach(function (form) {
      var input = form.querySelector('[data-search-input]');
      var panel = form.querySelector('[data-search-suggestions]');
      if (!input || !panel) return;
      var timer = null;
      var controller = null;
 
      function render(items) {
        panel.textContent = '';
        uniqueFive(items).forEach(function (item) { panel.appendChild(makeSuggestion(item)); });
        var hasItems = panel.children.length > 0;
        panel.hidden = !hasItems;
        input.setAttribute('aria-expanded', String(hasItems));
      }
 
      function showInitial() { render(fillToFive(recentItems(''), '')); }
 
      function fetchMatches(query) {
        if (controller && controller.abort) controller.abort();
        controller = 'AbortController' in window ? new AbortController() : null;
        var endpoint = rootUrl + 'search/suggest.json?q=' + encodeURIComponent(query) + '&resources[type]=product&resources[limit]=5&resources[options][unavailable_products]=last&resources[options][fields]=title,product_type,variants.title,body';
        fetch(endpoint, controller ? { signal: controller.signal } : {}).then(function (response) {
          if (!response.ok) throw new Error('Search unavailable');
          return response.json();
        }).then(function (data) {
          if (input.value.trim() !== query) return;
          var products = data && data.resources && data.resources.results && data.resources.results.products ? data.resources.results.products : [];
          var matches = products.map(function (product) {
            var image = '';
            if (typeof product.image === 'string') image = product.image;
            else if (product.image && product.image.url) image = product.image.url;
            else if (product.featured_image && product.featured_image.url) image = product.featured_image.url;
            return { title: product.title, url: product.url, image: image, meta: product.product_type || 'Product', kind: 'product' };
          });
          render(fillToFive(matches, query));
        }).catch(function (error) {
          if (error && error.name === 'AbortError') return;
          render(fillToFive([], query));
        });
      }
 
      input.addEventListener('focus', function () {
        var query = input.value.trim();
        if (query) fetchMatches(query); else showInitial();
      });
      input.addEventListener('input', function () {
        window.clearTimeout(timer);
        var query = input.value.trim();
        if (!query) { showInitial(); return; }
        render(fillToFive([], query));
        timer = window.setTimeout(function () { fetchMatches(query); }, 180);
      });
      input.addEventListener('keydown', function (event) {
        var options = [].slice.call(panel.querySelectorAll('.mv-search-suggestion'));
        if (!options.length || panel.hidden) return;
        if (event.key === 'ArrowDown') { event.preventDefault(); options[0].focus(); }
        if (event.key === 'Escape') { panel.hidden = true; input.setAttribute('aria-expanded', 'false'); }
      });
      panel.addEventListener('keydown', function (event) {
        var options = [].slice.call(panel.querySelectorAll('.mv-search-suggestion'));
        var index = options.indexOf(document.activeElement);
        if (event.key === 'ArrowDown') { event.preventDefault(); options[(index + 1) % options.length].focus(); }
        if (event.key === 'ArrowUp') { event.preventDefault(); if (index <= 0) input.focus(); else options[index - 1].focus(); }
        if (event.key === 'Escape') { event.preventDefault(); panel.hidden = true; input.setAttribute('aria-expanded', 'false'); input.focus(); }
      });
      panel.addEventListener('click', function (event) {
        var link = event.target.closest('.mv-search-suggestion');
        if (link) saveRecent(link.dataset.searchQuery || input.value);
      });
      form.addEventListener('submit', function () { saveRecent(input.value); });
      document.addEventListener('click', function (event) {
        if (!form.contains(event.target)) { panel.hidden = true; input.setAttribute('aria-expanded', 'false'); }
      });
    });
  })();
 
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) { entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); } }); }, { threshold: 0.08 });
    document.querySelectorAll('.rv').forEach(function (element) { observer.observe(element); });
  } else { document.querySelectorAll('.rv').forEach(function (element) { element.classList.add('in'); }); }
})();
 