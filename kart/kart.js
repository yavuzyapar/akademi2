/*
 * kart.js — tek ekranlık erişim kartı.
 * Sayfa kaymaz; kaydırma hareketi kamerayı altı savunma katmanından içeri taşır.
 * Bağımlılık yok. İçerik icerik.js dosyasından okunur.
 */
(() => {
  'use strict';

  /* ══════════ Sabitler ══════════ */
  const LAYERS = [
    { n: '01', name: 'ÇEVRE',    title: 'Kimlik',       slug: 'kimlik',       note: '' },
    { n: '02', name: 'AĞ',       title: 'Bağlantılar',  slug: 'baglantilar',  note: 'Bana ulaşan yollar.' },
    { n: '03', name: 'UÇ NOKTA', title: 'Yetkinlikler', slug: 'yetkinlikler', note: 'Sahada kullandıklarım.' },
    { n: '04', name: 'UYGULAMA', title: 'Çalışmalar',   slug: 'calismalar',   note: 'Üzerinde çalıştıklarım.' },
    { n: '05', name: 'VERİ',     title: 'Kayıt',        slug: 'kayit',        note: 'Bugüne kadar.' },
    { n: '06', name: 'ÇEKİRDEK', title: 'Özgeçmiş',     slug: 'cv',           note: 'Altı katmanın koruduğu tek dosya.' },
  ];
  const N = LAYERS.length;
  const TAU = Math.PI * 2;

  const SURF = [10, 14, 19];      // stil.css'teki --surface ile aynı
  const VOID = [3, 5, 8];
  const COLD = [157, 178, 198];
  const AMBER = [255, 180, 84];
  const BONE = [236, 232, 223];
  const DENY = [255, 106, 85];
  const MONO = '"Martian Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace';

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const clamp01 = v => clamp(v, 0, 1);
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
  const css = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
  const easeInOut = p => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const easeOut = p => 1 - Math.pow(1 - p, 3);

  // Derinlik rengi: dışta soğuk çelik, çekirdekte kehribar.
  const RAMP = LAYERS.map((_, k) => mix(COLD, AMBER, Math.pow(k / (N - 1), 1.25)));

  /* ══════════ İçerik ══════════ */
  const SRC = window.KART || {};
  const SAMPLE = window.KART_ORNEK || null;
  const PREVIEW = window.KART_ONIZLEME === true;
  let useSample = !!SAMPLE && /[?&]ornek\b/.test(location.search);

  const str = v => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '');
  const list = v => (Array.isArray(v) ? v.filter(x => x && typeof x === 'object') : []);
  const content = () => (useSample ? Object.assign({}, SRC, SAMPLE) : SRC);

  function safeUrl(u) {
    u = str(u);
    if (!u) return '';
    try {
      const p = new URL(u, location.href).protocol;
      return ['http:', 'https:', 'mailto:', 'tel:', location.protocol].includes(p) ? u : '';
    } catch (_) { return ''; }
  }
  const isEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  const isWeb = u => /^https?:/i.test(u);

  /* ══════════ DOM yardımcıları ══════════ */
  const $ = (s, r = document) => r.querySelector(s);
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false || kid === '') continue;
      el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }
  const ICONS = {
    out: 'M3 9 9 3M4.4 3H9v4.6',
    down: 'M6 1.5v7M3 5.8 6 8.8l3-3M2 10.6h8',
    copy: 'M4.2 4.2h6.3v6.3H4.2zM1.5 7.8V1.5h6.3',
    dive: 'M1.5 6a4.5 4.5 0 1 0 9 0 4.5 4.5 0 1 0-9 0M5 6a1 1 0 1 0 2 0 1 1 0 1 0-2 0',
    up: 'M6 10.5v-8M2.8 5.6 6 2.4l3.2 3.2',
  };
  function icon(name) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 12 12');
    svg.setAttribute('class', 'ico');
    svg.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', ICONS[name]);
    p.setAttribute('stroke-linecap', 'square');
    svg.append(p);
    return svg;
  }
  const RW = [9.5, 13, 7.5, 11.5, 6.5, 12];
  function redact(i, scale = 1) {
    const el = h('span', { class: 'redact', role: 'img', 'aria-label': 'Gizlenmiş kayıt' });
    el.style.setProperty('--w', (RW[i % RW.length] * scale).toFixed(1) + 'em');
    return el;
  }

  const stage = $('#stage');
  const wrap = $('.card-wrap');
  const card = $('#card');
  const canvas = $('#eye');
  const ctx = canvas.getContext('2d');
  const panelsRoot = $('#panels');
  const slot = $('#eye-slot');
  const eyeBtn = $('#eye-btn');
  const rail = $('#rail');
  const hint = $('#hint');

  const reduceQ = matchMedia('(prefers-reduced-motion: reduce)');
  let RM = reduceQ.matches;

  /* ══════════ Durum ══════════ */
  let cur = 0;                 // seçili katman
  let pos = 0;                 // kameranın derinliği (katman birimi, kesirli)
  let cam = null;              // süren dalış animasyonu
  let panels = [];
  let tabs = [];
  let hasRedaction = [];
  let running = false, raf = 0, last = 0, clock = 0;   // çizim döngüsü

  const cv = { state: 'wait', hex: '', size: 0 };
  let cvRefs = null;

  /* ══════════ Paneller ══════════ */
  function tagLine(L) {
    return h('p', { class: 'tag' },
      h('span', { class: 'tag-n' }, L.n),
      h('span', { class: 'tag-rule', 'aria-hidden': 'true' }),
      h('span', null, L.name));
  }
  function head(L) {
    return h('div', { class: 'head' },
      h('h2', { class: 'title' }, L.title),
      L.note && h('p', { class: 'note' }, L.note));
  }
  function sealed(all) {
    return h('p', { class: 'sealed' }, all ? 'BU KATMANIN KAYITLARI GİZLİ' : 'BAZI KAYITLAR GİZLİ');
  }
  function cvHref(d) { return safeUrl(str(d.cv && d.cv.dosya)) || 'cv.pdf'; }
  function cvName(d) { return str(d.cv && d.cv.indirmeAdi) || 'cv.pdf'; }
  function fullName(d) { return [str(d.ad), str(d.soyad)].filter(Boolean).join(' ') || 'Yavuz Yapar'; }
  function previewNote() {
    return PREVIEW && h('p', { class: 'fine' }, 'Önizlemede indirme kapalı. Yayındaki sitede çalışır.');
  }

  const BUILD = [
    /* 01 ÇEVRE · Kimlik */
    (d, L) => [
      tagLine(L),
      h('h1', { class: 'name' },
        h('span', { class: 'name-a' }, str(d.ad) || 'Yavuz'), ' ',
        h('span', { class: 'name-b' }, str(d.soyad) || 'Yapar')),
      (str(d.unvan) || str(d.konum)) && h('p', { class: 'role' },
        str(d.unvan) && h('span', null, str(d.unvan)),
        str(d.konum) && h('span', { class: 'role-loc' }, str(d.konum))),
      str(d.slogan) && h('p', { class: 'lede' }, str(d.slogan)),
      h('div', { class: 'actions' },
        // İndirme başlar, kart da çekirdeğe iner: ziyaretçi indirdiği dosyanın özetini görür.
        h('a', { class: 'btn primary', href: cvHref(d), download: cvName(d),
          onclick: e => { if (PREVIEW) e.preventDefault(); setTimeout(() => go(N - 1), 90); } }, 'CV’Yİ İNDİR', icon('down')),
        h('button', { class: 'btn', type: 'button', onclick: () => go(cur + 1) }, 'İÇERİ GİR', icon('dive'))),
    ],

    /* 02 AĞ · Bağlantılar */
    (d, L, mark) => {
      let rows = list(d.baglantilar).slice(0, 5);
      if (!rows.length) rows = [{ ad: 'E-POSTA' }, { ad: 'LINKEDIN' }, { ad: 'GITHUB' }];
      let hidden = 0;
      const items = rows.map((b, i) => {
        const val = str(b.deger);
        const url = safeUrl(b.url) || (isEmail(val) ? 'mailto:' + val : '');
        let cell;
        if (!val) { cell = redact(i); hidden++; }
        else if (url) cell = h('a', Object.assign({ class: 'v', href: url }, isWeb(url) ? { target: '_blank', rel: 'noopener noreferrer' } : null), h('span', null, val), icon('out'));
        else cell = h('span', { class: 'v' }, val);
        return h('li', { class: 'row' }, h('span', { class: 'k' }, str(b.ad) || '—'), h('div', { class: 'c' }, cell));
      });
      mark(hidden, rows.length);
      return [
        tagLine(L), head(L),
        h('ul', { class: 'rows' }, items),
        h('div', { class: 'actions' },
          h('button', { class: 'btn', type: 'button', onclick: saveVcard }, 'REHBERE EKLE', icon('down'))),
        hidden ? sealed(hidden === rows.length) : null,
        previewNote(),
      ];
    },

    /* 03 UÇ NOKTA · Yetkinlikler */
    (d, L, mark) => {
      const groups = list(d.yetkinlikler)
        .map(g => ({ baslik: str(g.baslik), ogeler: (Array.isArray(g.ogeler) ? g.ogeler : []).map(str).filter(Boolean).slice(0, 6) }))
        .filter(g => g.ogeler.length).slice(0, 3);
      let items;
      if (groups.length) {
        items = groups.map(g => h('li', { class: 'row' },
          h('span', { class: 'k' }, g.baslik || '—'),
          h('ul', { class: 'chips' }, g.ogeler.map(o => h('li', { class: 'chip' }, o)))));
        mark(0, groups.length);
      } else {
        const shape = [[.55, .8, .45, .7], [.7, .5, .9], [.5, .65, .4, .6]];
        items = shape.map((ws, i) => h('li', { class: 'row' },
          h('span', { class: 'k' }, 'ALAN 0' + (i + 1)),
          h('ul', { class: 'chips' }, ws.map((w, j) => h('li', { class: 'chip is-redact' }, redact(i + j, w * .62))))));
        mark(3, 3);
      }
      return [tagLine(L), head(L), h('ul', { class: 'rows' }, items), groups.length ? null : sealed(true)];
    },

    /* 04 UYGULAMA · Çalışmalar */
    (d, L, mark) => {
      const works = list(d.calismalar).filter(w => str(w.ad)).slice(0, 3);
      let items;
      if (works.length) {
        items = works.map((w, i) => {
          const url = safeUrl(w.url);
          const title = url
            ? h('a', Object.assign({ class: 'v v-big', href: url }, isWeb(url) ? { target: '_blank', rel: 'noopener noreferrer' } : null), h('span', null, str(w.ad)), icon('out'))
            : h('span', { class: 'v v-big' }, str(w.ad));
          return h('li', { class: 'row' },
            h('span', { class: 'k' }, str(w.etiket) || '0' + (i + 1)),
            h('div', { class: 'c' }, title, str(w.aciklama) && h('span', { class: 'sub' }, str(w.aciklama))));
        });
        mark(0, works.length);
      } else {
        items = [0, 1, 2].map(i => h('li', { class: 'row' },
          h('span', { class: 'k' }, 'ÇALIŞMA 0' + (i + 1)),
          h('div', { class: 'c' }, h('span', { class: 'v v-big' }, redact(i + 1, .62)), h('span', { class: 'sub' }, redact(i + 3, 1.25)))));
        mark(3, 3);
      }
      return [tagLine(L), head(L), h('ol', { class: 'rows' }, items), works.length ? null : sealed(true)];
    },

    /* 05 VERİ · Kayıt */
    (d, L, mark) => {
      const recs = list(d.kayit).filter(r => str(r.baslik)).slice(0, 4);
      let items;
      if (recs.length) {
        items = recs.map(r => h('li', { class: 'row' },
          h('span', { class: 'k' }, str(r.donem) || '—'),
          h('div', { class: 'c' }, h('span', { class: 'v' }, str(r.baslik)), str(r.yer) && h('span', { class: 'sub' }, str(r.yer)))));
        mark(0, recs.length);
      } else {
        items = [0, 1, 2, 3].map(i => h('li', { class: 'row' },
          h('span', { class: 'k' }, redact(i + 2, .42)),
          h('div', { class: 'c' }, h('span', { class: 'v' }, redact(i, 1)), h('span', { class: 'sub' }, redact(i + 4, .7)))));
        mark(4, 4);
      }
      return [tagLine(L), head(L), h('ol', { class: 'rows' }, items), recs.length ? null : sealed(true)];
    },

    /* 06 ÇEKİRDEK · Özgeçmiş */
    (d, L) => {
      const meta = h('span', { class: 'file-meta' }, 'PDF');
      const code = h('code', { 'aria-label': 'SHA-256 özeti' });
      const state = h('span', { class: 'hash-state', role: 'status' }, 'Özet hesaplanıyor');
      const copyBtn = h('button', { class: 'btn', type: 'button', onclick: copyHash }, h('span', null, 'ÖZETİ KOPYALA'), icon('copy'));
      cvRefs = { meta, code, state, copyBtn };
      queueMicrotask(paintCv);
      return [
        tagLine(L), head(L),
        h('p', { class: 'file' }, h('span', null, cvName(d)), meta),
        h('dl', { class: 'hash' }, h('dt', { class: 'k' }, 'SHA-256'), h('dd', null, code, state)),
        h('div', { class: 'actions' },
          h('a', { class: 'btn primary', href: cvHref(d), download: cvName(d) }, 'CV’Yİ İNDİR', icon('down')),
          copyBtn),
        PREVIEW
          ? previewNote()
          : h('p', { class: 'fine' }, 'İndirdiğin dosyanın SHA-256 özeti buradakiyle aynıysa dosya yolda değişmemiştir.'),
      ];
    },
  ];

  function buildPanels() {
    const d = content();
    hasRedaction = LAYERS.map(() => false);
    panels = LAYERS.map((L, i) => {
      const el = h('section', { class: 'panel', id: 'p-' + i, role: 'tabpanel', 'aria-labelledby': 't-' + i });
      el.style.setProperty('--tone', css(RAMP[i]));
      el.append(...BUILD[i](d, L, (hiddenCount) => { hasRedaction[i] = hiddenCount > 0; }).filter(Boolean));
      el.hidden = i !== cur;
      return el;
    });
    panelsRoot.replaceChildren(...panels);
    const nm = fullName(d);
    $('#hud-name').textContent = nm.toLocaleUpperCase('tr');
    card.setAttribute('aria-label', nm + ' erişim kartı');
    document.title = nm;
    fit(panels[cur]);
  }

  function buildRail() {
    const fill = h('span', { class: 'rail-fill', 'aria-hidden': 'true' });
    tabs = LAYERS.map((L, i) => {
      const b = h('button', {
        class: 'stop', type: 'button', role: 'tab', id: 't-' + i, 'aria-controls': 'p-' + i,
        'aria-label': `Katman ${i + 1}: ${L.title}`, onclick: () => go(i),
      }, h('span', { class: 'stop-n' }, L.n), h('span', { class: 'stop-l' }, L.name));
      b.style.setProperty('--tone', css(RAMP[i]));
      return b;
    });
    rail.replaceChildren(fill, ...tabs);
  }

  // İçerik sığmazsa yazıyı kademeli küçült: kartın içinde de kaydırma yok.
  function fit(panel) {
    if (!panel || panel.hidden) return;
    let f = 1, guard = 0;
    panel.style.setProperty('--fit', '1');
    while (panel.scrollHeight > panel.clientHeight + 1 && f > .66 && guard++ < 14) {
      f -= .03;
      panel.style.setProperty('--fit', f.toFixed(2));
    }
  }

  /* ══════════ CV: özet ve indirme ══════════ */
  const hex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');

  async function loadCv() {
    const file = cvHref(content());
    try {
      if (!window.crypto || !crypto.subtle) throw new Error('subtle');
      const res = await fetch(file, { cache: 'no-cache' });
      if (!res.ok) throw new Error(String(res.status));
      const buf = await res.arrayBuffer();
      const dig = new Uint8Array(await crypto.subtle.digest('SHA-256', buf));
      cv.state = 'ok'; cv.size = buf.byteLength; cv.hex = hex(dig);
      setSigil(dig);
    } catch (_) {
      cv.state = 'none';
    }
    paintCv();
  }

  function paintCv() {
    if (!cvRefs) return;
    const { meta, code, state, copyBtn } = cvRefs;
    if (cv.state === 'ok') {
      const kb = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(Math.max(1, cv.size / 1024));
      meta.textContent = `PDF · ${kb} KB`;
      code.replaceChildren(...cv.hex.match(/.{8}/g).map(g => h('span', null, g)));
      state.textContent = 'Doğrulandı. Özet az önce tarayıcında hesaplandı.';
      state.classList.add('is-ok');
      copyBtn.hidden = false;
    } else if (cv.state === 'none') {
      code.replaceChildren(redact(1, 1.6));
      state.textContent = 'Özet hesaplanamadı. cv.pdf dosyası bulunamadı ya da sayfa yerelden açıldı.';
      state.classList.remove('is-ok');
      copyBtn.hidden = true;
    } else {
      code.replaceChildren(redact(1, 1.6));
      copyBtn.hidden = true;
    }
    if (cur === N - 1) fit(panels[cur]);
  }

  async function copyHash() {
    const label = cvRefs && cvRefs.copyBtn.firstElementChild;
    if (!cv.hex || !label) return;
    let done = false;
    try { await navigator.clipboard.writeText(cv.hex); done = true; } catch (_) {
      const r = document.createRange(); r.selectNodeContents(cvRefs.code);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    }
    label.textContent = done ? 'KOPYALANDI' : 'SEÇİLDİ, CTRL+C';
    setTimeout(() => { label.textContent = 'ÖZETİ KOPYALA'; }, 1800);
  }

  function saveVcard() {
    const d = content();
    const esc = s => s.replace(/([\\;,])/g, '\\$1').replace(/\r?\n/g, '\\n');
    const lines = ['BEGIN:VCARD', 'VERSION:3.0',
      `N:${esc(str(d.soyad))};${esc(str(d.ad))};;;`, `FN:${esc(fullName(d))}`];
    if (str(d.unvan)) lines.push('TITLE:' + esc(str(d.unvan)));
    for (const b of list(d.baglantilar)) {
      const val = str(b.deger), url = safeUrl(b.url);
      if (isEmail(val)) lines.push('EMAIL;TYPE=INTERNET:' + esc(val));
      else if (isWeb(url)) lines.push('URL:' + url);
    }
    if (/^https?:$/.test(location.protocol)) lines.push('URL:' + location.origin + location.pathname);
    lines.push('END:VCARD');
    const blob = new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/vcard;charset=utf-8' });
    const a = h('a', { href: URL.createObjectURL(blob), download: fullName(d).replace(/\s+/g, '-') + '.vcf' });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  /* ══════════ Katmanlar arası geçiş ══════════ */
  function go(i, o = {}) {
    i = clamp(i | 0, 0, N - 1);
    if (i === cur && !o.force) return;
    const prev = cur;
    cur = i;
    const dist = Math.max(1, Math.abs(i - pos));
    const dur = RM || o.instant ? 0 : 940 + (dist - 1) * 240;
    if (dur) cam = { from: pos, to: i, t0: performance.now(), dur };
    else { cam = null; pos = i; }
    swapPanels(prev, i, dur);
    syncUi();
    if (!o.keepHash) setHash();
    hint.classList.add('is-done');
    if (!running) render();
  }

  function swapPanels(prev, next, dur) {
    const out = panels[prev], inn = panels[next];
    panels.forEach((p, j) => {
      p.getAnimations().forEach(a => a.cancel());
      [...p.children].forEach(c => c.getAnimations().forEach(a => a.cancel()));
      if (j !== prev && j !== next) p.hidden = true;
    });
    inn.hidden = false;
    fit(inn);
    if (prev === next) return;
    if (!dur) { out.hidden = true; return; }
    const fwd = next > prev;
    const leave = out.animate(
      [{ opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' },
       { opacity: 0, transform: `scale(${fwd ? 1.15 : .9})`, filter: 'blur(7px)' }],
      { duration: 360, easing: 'cubic-bezier(.5,0,.9,.5)', fill: 'forwards' });
    leave.finished.then(() => { if (panels[cur] !== out) out.hidden = true; leave.cancel(); }).catch(() => {});
    const delay = Math.min(dur * .4, 480);
    inn.animate(
      [{ opacity: 0, transform: `scale(${fwd ? .9 : 1.12})`, filter: 'blur(7px)' },
       { opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' }],
      { duration: 620, delay, easing: 'cubic-bezier(.16,.8,.24,1)', fill: 'backwards' });
    stagger(inn, delay + 80);
  }
  function stagger(panel, delay) {
    [...panel.children].forEach((el, i) => el.animate(
      [{ opacity: 0, transform: 'translateY(.9em)' }, { opacity: 1, transform: 'none' }],
      { duration: 560, delay: delay + i * 60, easing: 'cubic-bezier(.16,.8,.24,1)', fill: 'backwards' }));
  }

  function syncUi() {
    card.toggleAttribute('data-deep', cur > 0);
    card.toggleAttribute('data-core', cur === N - 1);
    $('#depth-n').textContent = LAYERS[cur].n;
    tabs.forEach((t, i) => {
      t.setAttribute('aria-selected', i === cur ? 'true' : 'false');
      t.tabIndex = i === cur ? 0 : -1;
    });
    rail.firstElementChild.style.setProperty('--p', (cur / N).toFixed(4));
    eyeBtn.setAttribute('aria-label', cur < N - 1 ? 'Bir katman içeri gir' : 'Yüzeye dön');
  }

  function setHash() {
    const want = cur === 0 ? '' : '#' + LAYERS[cur].slug;
    if (location.hash === want) return;
    try { history.replaceState(null, '', want || location.pathname + location.search); } catch (_) {}
  }
  function fromHash() {
    const s = location.hash.replace(/^#/, '').toLowerCase();
    const i = LAYERS.findIndex(L => L.slug === s);
    return i < 0 ? 0 : i;
  }

  /* ══════════ Göz: altı katmanlı kuyu ══════════ */
  const eye = { cx: 0, cy: 0, R: 0, w: 0, h: 0, ex: 0, ey: 0 };
  let dpr = 1;
  const RIM_OUT = 1.275;       // çerçeve oymasının dış sınırı (R cinsinden)
  const G = .3;                // katman başına perspektif
  const APER = .92;            // derindeki kapılar biraz daha dar
  const PAR = .44;             // bakış açısına göre kayma

  const view = { x: 0, y: 0 }; // gözün bakış yönü (-1..1); boşta kendi kendine gezinir
  const tilt = { x: 0, y: 0 }; // kartın eğimi; yalnızca imleç hareket ederken, boşta düzleşir
  let tiltSent = '';
  const ptr = { x: 0, y: 0 };
  let lastMove = -1e9;
  let intro = RM ? 1 : 0;
  let coreLevel = RM ? 1 : 0;
  let pulse = 0;
  const flash = new Float32Array(N);
  const flashAng = new Float32Array(N);
  const open = new Float32Array(N).fill(RM ? 1 : 0);

  const scaleAt = rel => 1 / (1 + Math.max(rel, -1.6) * G);
  const holeAt = rel => eye.R * scaleAt(rel) * Math.pow(APER, Math.max(0, rel));
  const fogAt = rel => 1 / (1 + Math.max(0, rel) * .28);
  function centerAt(rel) {
    const s = 1 - scaleAt(rel);
    return [eye.cx + view.x * eye.R * PAR * s, eye.cy + view.y * eye.R * PAR * s];
  }

  function measure() {
    const w = card.offsetWidth, hh = card.offsetHeight;
    if (!w || !hh) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    eye.w = w; eye.h = hh;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(hh * dpr);
    const sw = slot.offsetWidth, sh = slot.offsetHeight;
    eye.R = Math.max(20, Math.min(sw, sh) / 2 / RIM_OUT);
    eye.cx = slot.offsetLeft + sw / 2;
    eye.cy = slot.offsetTop + sh / 2;
    const d = Math.round(eye.R * 2);
    eyeBtn.style.width = eyeBtn.style.height = d + 'px';
    eyeBtn.style.left = Math.round(sw / 2 - eye.R) + 'px';
    eyeBtn.style.top = Math.round(sh / 2 - eye.R) + 'px';
    const wr = wrap.getBoundingClientRect();
    eye.ex = wr.left + eye.cx; eye.ey = wr.top + eye.cy;
    fit(panels[cur]);
    if (!running) render();
  }

  /* ── Halkaların verisi: adın ve CV dosyasının özetinden türetilir ── */
  function seedBytes(s) {
    let x = 0x811c9dc5;
    for (const ch of s) { x ^= ch.codePointAt(0); x = Math.imul(x, 0x01000193); }
    x = x >>> 0 || 1;
    const out = new Uint8Array(32);
    for (let i = 0; i < 32; i++) { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; out[i] = x & 255; }
    return out;
  }
  let nameBytes = seedBytes('Yavuz Yapar');
  let segs = [];
  const bit = i => (nameBytes[(i >> 3) % 32] >> (i & 7)) & 1;
  function setName(bytes) {
    nameBytes = bytes;
    let s = (bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3]) >>> 0;
    const rnd = () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    segs = [0, 1, 2].map(() => {
      const arr = []; let a = rnd() * .6;
      while (a < TAU - .2) { const len = .16 + rnd() * .95; arr.push([a, Math.min(a + len, TAU - .06)]); a += len + .07 + rnd() * .24; }
      return arr;
    });
  }
  const sig = { n1: 5, n2: 11, a1: .12, a2: .04, p1: 0, p2: 0, d1: 3, d2: 4, w1: .16, w2: .1, nib: new Uint8Array(64) };
  function setSigil(b) {
    sig.n1 = 3 + b[0] % 5;
    sig.n2 = sig.n1 * (2 + b[1] % 3) + (b[2] & 1 ? 1 : -1);
    sig.a1 = .075 + b[3] / 255 * .1;
    sig.a2 = .02 + b[4] / 255 * .045;
    sig.p1 = b[5] / 255 * TAU; sig.p2 = b[6] / 255 * TAU;
    sig.d1 = 1.6 + b[7] / 255 * 3.4; sig.d2 = 2 + b[8] / 255 * 5;
    sig.w1 = .1 + b[9] / 255 * .12; sig.w2 = .07 + b[10] / 255 * .1;
    for (let i = 0; i < 64; i++) sig.nib[i] = i & 1 ? b[i >> 1] & 15 : b[i >> 1] >> 4;
    if (!running) render();
  }
  setName(nameBytes);
  setSigil(nameBytes);

  /* ── Çizim yardımcıları ── */
  const P = (a, r) => [Math.cos(a) * r, Math.sin(a) * r];
  function ring(r) { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); }
  function ticks(r0, r1, n, off = 0) {
    for (let i = 0; i < n; i++) {
      const a = off + i / n * TAU, c = Math.cos(a), s = Math.sin(a);
      ctx.moveTo(c * r0, s * r0); ctx.lineTo(c * r1, s * r1);
    }
  }
  function arcText(text, r, mid, px, col, alpha) {
    if (px < 5 || alpha < .03) return;
    ctx.font = `500 ${px.toFixed(2)}px ${MONO}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = rgba(col, alpha);
    const track = px * .3, ws = [];
    let total = 0;
    for (const ch of text) { const w = ctx.measureText(ch).width + track; ws.push(w); total += w; }
    let a = mid - total / 2 / r, i = 0;
    for (const ch of text) {
      const w = ws[i++];
      a += w / 2 / r;
      ctx.save(); ctx.rotate(a + Math.PI / 2); ctx.fillText(ch, 0, -r); ctx.restore();
      a += w / 2 / r;
    }
  }

  const SPIN = [.011, -.016, .013, -.02, .017, -.008];   // rad/sn, sırayla ters yönlere
  const TWIST = [.5, -.8, .65, -.95, .75, -.4];          // dalışta kilit gibi dönme
  const LABEL = LAYERS.map(L => `${L.n} · ${L.name} · ${L.title.toLocaleUpperCase('tr')}`);

  /* Her katmanın oyması o katmanın işini anlatır. r: deliğin yarıçapı. */
  const MOTIF = [
    // 01 ÇEVRE: sur ve dört kapı
    (r, lw, c, a) => {
      ctx.strokeStyle = rgba(c, .4 * a); ctx.lineWidth = lw * .8;
      ctx.beginPath(); ticks(r * 1.036, r * 1.05, 120); ticks(r * 1.036, r * 1.066, 24); ctx.stroke();
      ctx.strokeStyle = rgba(c, .82 * a); ctx.lineWidth = Math.max(1.2, r * .028);
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, 0, r * 1.108, i * TAU / 4 + .15, (i + 1) * TAU / 4 - .15); ctx.stroke(); }
      ctx.lineWidth = lw; ctx.beginPath();
      for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
        const g = i * TAU / 4 + s * .15, p0 = P(g, r * 1.082), p1 = P(g, r * 1.14);
        ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]);
      }
      ctx.stroke();
      ctx.strokeStyle = rgba(c, .28 * a); ctx.lineWidth = lw * .7; ring(r * 1.156);
    },
    // 02 AĞ: düğümler ve bağlar
    (r, lw, c, a, t) => {
      const n = 18, ri = r * 1.06, ro = r * 1.134;
      ctx.strokeStyle = rgba(c, .46 * a); ctx.lineWidth = lw * .75; ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const p = P(i / n * TAU, ri), q = P((i + .5) / n * TAU, ro), q0 = P((i - .5) / n * TAU, ro), nx = P((i + 1) / n * TAU, ri);
        ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]);
        ctx.moveTo(p[0], p[1]); ctx.lineTo(q0[0], q0[1]);
        ctx.moveTo(p[0], p[1]); ctx.lineTo(nx[0], nx[1]);
      }
      ctx.stroke();
      const live = Math.floor(t * 1.7) % n, d1 = Math.max(1, r * .012), d2 = Math.max(.8, r * .008);
      for (let i = 0; i < n; i++) {
        const p = P(i / n * TAU, ri), q = P((i + .5) / n * TAU, ro);
        const on = i === live || i === (live * 7 + 5) % n;
        ctx.fillStyle = on ? rgba(BONE, a) : rgba(c, .9 * a);
        ctx.beginPath(); ctx.arc(p[0], p[1], on ? d1 * 1.5 : d1, 0, TAU); ctx.fill();
        ctx.fillStyle = rgba(c, .7 * a);
        ctx.beginPath(); ctx.arc(q[0], q[1], d2, 0, TAU); ctx.fill();
      }
    },
    // 03 UÇ NOKTA: tek tek cihazlar; dolu olanlar adın özetindeki bitler
    (r, lw, c, a) => {
      const n = 36, s = r * .034, rr = r * 1.098;
      ctx.strokeStyle = rgba(c, .26 * a); ctx.lineWidth = lw * .7; ring(r * 1.045); ring(r * 1.152);
      ctx.lineWidth = Math.max(.7, lw * .8);
      for (let i = 0; i < n; i++) {
        ctx.save(); ctx.rotate(i / n * TAU);
        if (bit(i + 40)) { ctx.fillStyle = rgba(c, .85 * a); ctx.fillRect(rr - s / 2, -s / 2, s, s); }
        else { ctx.strokeStyle = rgba(c, .55 * a); ctx.strokeRect(rr - s / 2, -s / 2, s, s); }
        ctx.restore();
      }
    },
    // 04 UYGULAMA: iç içe servis yayları
    (r, lw, c, a) => {
      ctx.lineWidth = Math.max(1, r * .013);
      for (let tr = 0; tr < 3; tr++) {
        ctx.strokeStyle = rgba(c, (.86 - tr * .22) * a);
        for (const [a0, a1] of segs[tr]) { ctx.beginPath(); ctx.arc(0, 0, r * (1.056 + tr * .041), a0, a1); ctx.stroke(); }
      }
    },
    // 05 VERİ: adın SHA-256 özeti, ışınsal barkod olarak
    (r, lw, c, a) => {
      const n = 96, L = [.02, .045, .075, .105];
      ctx.strokeStyle = rgba(c, .3 * a); ctx.lineWidth = lw * .7; ring(r * 1.034);
      ctx.strokeStyle = rgba(c, .82 * a); ctx.lineWidth = Math.max(.8, r * .0085); ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const v = bit(i * 2) | bit(i * 2 + 1) << 1, g = i / n * TAU, p0 = P(g, r * 1.048), p1 = P(g, r * (1.048 + L[v]));
        ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]);
      }
      ctx.stroke();
    },
    // 06 ÇEKİRDEK: CV dosyasının özeti, 64 basamak
    (r, lw, c, a) => {
      ctx.strokeStyle = rgba(AMBER, .85 * a); ctx.lineWidth = Math.max(.9, r * .011); ctx.beginPath();
      for (let i = 0; i < 64; i++) {
        const g = i / 64 * TAU, p0 = P(g, r * 1.048), p1 = P(g, r * (1.066 + sig.nib[i] / 15 * .078));
        ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]);
      }
      ctx.stroke();
      ctx.strokeStyle = rgba(AMBER, .3 * a); ctx.lineWidth = lw * .7; ring(r * 1.158);
    },
  ];

  function rim(k, rel, t, alpha) {
    if (alpha < .015) return;
    const [x, y] = centerAt(rel);
    const r = holeAt(rel) * (k < N - 1 ? open[k] : 1);
    if (r < 5) return;
    const c = RAMP[k], lw = Math.max(.6, r / eye.R * 1.15);
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = rgba(c, .92 * alpha); ctx.lineWidth = lw * 1.25; ring(r);
    ctx.strokeStyle = rgba(c, .22 * alpha); ctx.lineWidth = lw * .8; ring(r - Math.max(2, r * .016));   // levhanın kalınlığı
    if (flash[k] > .02) {
      ctx.strokeStyle = rgba(DENY, flash[k] * alpha); ctx.lineWidth = lw * 2.2;
      ctx.beginPath(); ctx.arc(0, 0, r, flashAng[k] - .2, flashAng[k] + .2); ctx.stroke();
    }
    ctx.save();
    ctx.rotate(SPIN[k] * t + TWIST[k] * pos);
    MOTIF[k](r, lw, c, alpha, t);
    ctx.restore();
    const px = Math.max(r * .056, 7.5 * clamp01(1 - rel));   // öndeki halkanın yazıtı küçük ekranda da okunur
    arcText(LABEL[k], r * 1.218, -Math.PI / 2 + (k - pos) * .62, px, c, alpha * clamp01((px - 5) / 2.5) * .95);
    ctx.restore();
  }

  function plane(k, rel, t) {
    const { cx, cy, R } = eye;
    const [x, y] = centerAt(rel);
    const fog = fogAt(rel);
    if (k === N - 1) { core(x, y, holeAt(rel), fog, t); rim(k, rel, t, fog * coreLevel); return; }
    const r = holeAt(rel) * open[k];
    if (r > .5) { // bu kapının, altındaki katmana düşürdüğü gölge
      const g = ctx.createRadialGradient(x, y, r * .5, x, y, r);
      g.addColorStop(0, 'rgba(1,2,4,0)'); g.addColorStop(1, 'rgba(1,2,4,.7)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
    ctx.beginPath(); ctx.rect(cx - R - 2, cy - R - 2, R * 2 + 4, R * 2 + 4);
    if (r > .5) ctx.arc(x, y, r, 0, TAU, true);
    const warm = Math.pow(k / (N - 1), 1.3) * coreLevel;
    // En öndeki levha kartın yüzeyiyle aynı renktir; gölgelendirme bir katman geriden başlar.
    const deep = Math.max(0, rel - 1), sh = clamp01(deep);
    const base = mix(mix(SURF, VOID, (1 - fogAt(deep)) * .7), [46, 28, 10], warm * .3 * sh);
    const lg = ctx.createLinearGradient(x - r, y - r * 1.5, x + r, y + r * 1.5);   // üstten gelen soğuk ışık
    lg.addColorStop(0, css(mix(base, COLD, .05 * sh))); lg.addColorStop(1, css(mix(base, VOID, .3 * sh)));
    ctx.fillStyle = lg; ctx.fill('evenodd');
    if (warm > .02 && r > .5) { // çekirdeğin ışığı deliğin kenarını yalar
      const g = ctx.createRadialGradient(x, y, r, x, y, r * 1.7);
      g.addColorStop(0, rgba(AMBER, .3 * warm * fog)); g.addColorStop(1, rgba(AMBER, 0));
      ctx.fillStyle = g; ctx.fill('evenodd');
    }
    rim(k, rel, t, fog);
  }

  function core(x, y, r, fog, t) {
    const { cx, cy, R } = eye;
    const lvl = coreLevel * (1 + pulse * .5);
    const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, r * 1.3));
    g.addColorStop(0, css(mix(VOID, [62, 36, 10], coreLevel)));
    g.addColorStop(.5, css(mix(VOID, [22, 14, 8], coreLevel)));
    g.addColorStop(1, css([6, 8, 11]));
    ctx.fillStyle = g; ctx.fillRect(cx - R - 2, cy - R - 2, R * 2 + 4, R * 2 + 4);
    if (lvl < .01) return;

    const rc = r * .9;
    const K = clamp(Math.round(rc / 5), 6, 30), SEG = clamp(Math.round(rc * 1.15), 56, 240);
    const breathe = 1 + Math.sin(t * 1.15) * .018;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = Math.max(.6, rc / 250);
    for (let i = 0; i < K; i++) {
      const f = i / (K - 1);
      const base = rc * (.14 + .78 * f) * breathe;
      const a1 = sig.a1 * (.3 + .7 * f), a2 = sig.a2 * (1.2 - f * .5);
      ctx.beginPath();
      for (let j = 0; j <= SEG; j++) {
        const ph = j / SEG * TAU;
        const rr = base * (1 + a1 * Math.sin(sig.n1 * ph + sig.p1 + t * sig.w1 + f * sig.d1)
                             + a2 * Math.sin(sig.n2 * ph + sig.p2 - t * sig.w2 - f * sig.d2));
        const px = x + Math.cos(ph) * rr, py = y + Math.sin(ph) * rr;
        if (j) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      }
      ctx.strokeStyle = `rgba(255,${(168 + 62 * (1 - f)) | 0},${(72 + 120 * (1 - f)) | 0},${((.1 + .34 * (1 - f)) * lvl).toFixed(3)})`;
      ctx.stroke();
    }
    const hot = ctx.createRadialGradient(x, y, 0, x, y, rc * .55);
    hot.addColorStop(0, `rgba(255,226,170,${(.62 * lvl).toFixed(3)})`);
    hot.addColorStop(.18, `rgba(255,186,96,${(.3 * lvl).toFixed(3)})`);
    hot.addColorStop(1, 'rgba(255,170,70,0)');
    ctx.fillStyle = hot; ctx.beginPath(); ctx.arc(x, y, rc * .55, 0, TAU); ctx.fill();
    ctx.restore();
  }

  /* ── Paketler: dışarıdan girer, her kapıda sınanır; çoğu çekirdeğe varamaz ── */
  const parts = [];
  let spawnAcc = 0;
  function spawn() {
    const z0 = pos - .1;
    let fate = N - 1;
    for (let k = Math.max(0, Math.ceil(z0)); k < N - 1; k++) if (Math.random() < .3) { fate = k; break; }
    parts.push({ z: z0, pz: z0, th: Math.random() * TAU, om: (Math.random() - .5) * 1.1, rho: .22 + Math.random() * .62,
      v: .5 + Math.random() * .45, fate, st: 0, life: 0 });
  }
  function stepParts(dt) {
    spawnAcc += dt * (cam ? .6 : 1.7);
    while (spawnAcc > 1) { spawnAcc -= 1; if (parts.length < 22 && pos < N - 1.02) spawn(); }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (p.st === 0) {
        p.pz = p.z; p.z += p.v * dt; p.th += p.om * dt; p.life += dt;
        if (p.z >= p.fate) {
          p.z = p.fate;
          if (p.fate === N - 1) { p.st = 2; pulse = Math.min(1, pulse + .35); }
          else { p.st = 1; flash[p.fate] = 1; flashAng[p.fate] = p.th; }
          p.life = 0;
        }
      } else { p.life += dt; if (p.life > .7) { parts.splice(i, 1); continue; } }
      if (p.z - pos < -.45) parts.splice(i, 1);
    }
  }
  function drawParts() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of parts) {
      const rel = p.z - pos;
      if (rel < -.3) continue;
      const [x0, y0] = centerAt(rel), rr = holeAt(rel) * p.rho;
      const x = x0 + Math.cos(p.th) * rr, y = y0 + Math.sin(p.th) * rr;
      const fog = fogAt(rel), size = Math.max(.7, 1.7 * Math.sqrt(scaleAt(rel)));
      if (p.st === 0) {
        const prel = p.pz - pos - .05, [x1, y1] = centerAt(prel), r1 = holeAt(prel) * p.rho;
        const col = mix(BONE, AMBER, clamp01(p.z / (N - 1)) * .8), a = clamp01(p.life * 4) * fog;
        ctx.strokeStyle = rgba(col, .45 * a); ctx.lineWidth = size * .9;
        ctx.beginPath(); ctx.moveTo(x1 + Math.cos(p.th) * r1, y1 + Math.sin(p.th) * r1); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = rgba(col, .95 * a); ctx.beginPath(); ctx.arc(x, y, size, 0, TAU); ctx.fill();
      } else if (p.st === 1) { // reddedildi
        const q = p.life / .7;
        ctx.strokeStyle = rgba(DENY, (1 - q) * fog); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, size + q * 9 * scaleAt(rel), 0, TAU); ctx.stroke();
        ctx.fillStyle = rgba(DENY, (1 - q) * fog); ctx.beginPath(); ctx.arc(x, y, size * (1 - q * .5), 0, TAU); ctx.fill();
      } else { // çekirdeğe ulaştı
        const q = p.life / .7;
        ctx.fillStyle = rgba(AMBER, (1 - q) * .9); ctx.beginPath(); ctx.arc(x, y, size * (1 + q * 2), 0, TAU); ctx.fill();
      }
    }
    ctx.restore();
  }

  function draw(t) {
    const { cx, cy, R, w, h: hh } = eye;
    if (!R) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, hh);
    const relCore = N - 1 - pos, lvl = coreLevel * (1 + pulse * .4);
    const [gx, gy] = centerAt(relCore), near = scaleAt(relCore);

    // 1) pencerenin içi: en derinden öne doğru
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
    for (let k = N - 1; k >= 0; k--) {
      const rel = k - pos;
      if (rel < -.001 && k < N - 1) continue;
      plane(k, rel, t);
    }
    if (!RM) drawParts();
    if (lvl > .01) { // çekirdekten yukarı vuran ışık
      const gr = holeAt(relCore) * 3.1;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
      g.addColorStop(0, `rgba(255,176,80,${(.26 * lvl).toFixed(3)})`);
      g.addColorStop(.4, `rgba(255,150,60,${(.1 * lvl).toFixed(3)})`);
      g.addColorStop(1, 'rgba(255,140,50,0)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.globalCompositeOperation = 'source-over';
    }
    // cam: üstte ince bir yansıma
    const gl = ctx.createLinearGradient(cx, cy - R, cx, cy + R);
    gl.addColorStop(0, 'rgba(210,225,245,.055)'); gl.addColorStop(.38, 'rgba(210,225,245,0)');
    ctx.fillStyle = gl; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    ctx.restore();

    // 2) pencerenin dışı: geçilen ve yaklaşan kapıların karta kazınmış halkaları
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, w, hh); ctx.arc(cx, cy, R, 0, TAU, true); ctx.clip('evenodd');
    if (lvl > .01) { // ışığın karta taşması
      const g = ctx.createRadialGradient(cx, cy, R * .9, cx, cy, R * (1.5 + near));
      g.addColorStop(0, `rgba(255,170,70,${((.04 + .1 * near * near) * lvl).toFixed(3)})`);
      g.addColorStop(1, 'rgba(255,170,70,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, hh);
    }
    const veil = easeOut(clamp01(intro * 2.2));
    for (let k = 0; k < N; k++) {
      const rel = k - pos;
      if (rel <= -.56 || rel >= .6) continue;
      const a = rel <= 0 ? clamp01(1 + rel / .5) : clamp01(1 - rel / .55);
      rim(k, rel, t, a * a * veil * (k === N - 1 ? Math.max(.25, coreLevel) : 1));
    }
    ctx.restore();
  }

  /* ══════════ Döngü ══════════ */
  function step(dt, now) {
    if (cam) {
      const p = clamp01((now - cam.t0) / cam.dur);
      pos = cam.from + (cam.to - cam.from) * easeInOut(p);
      if (p >= 1) { pos = cam.to; cam = null; }
    }
    const idle = now - lastMove > 2600;
    let tx = ptr.x, ty = ptr.y;
    if (idle) { tx = Math.sin(clock * .37) * .4; ty = Math.cos(clock * .29) * .3; }
    const kf = 1 - Math.exp(-dt * (idle ? 1.4 : 7));
    view.x += (tx - view.x) * kf; view.y += (ty - view.y) * kf;
    const kt = 1 - Math.exp(-dt * (idle ? 2.2 : 6));
    tilt.x += ((idle ? 0 : ptr.x) - tilt.x) * kt; tilt.y += ((idle ? 0 : ptr.y) - tilt.y) * kt;

    if (intro < 1) intro = Math.min(1, intro + dt / 2.5);
    for (let k = 0; k < N; k++) open[k] = easeOut(clamp01((intro * (N + 1.4) - k * .95) / 1.7));
    coreLevel = easeOut(clamp01((intro - .42) / .58));
    pulse *= Math.exp(-dt * 2.4);
    for (let k = 0; k < N; k++) flash[k] *= Math.exp(-dt * 3.2);
    stepParts(dt);

    // Metin okunurken kart yerinde durur: stil yalnızca eğim gerçekten değişince yazılır.
    const tf = `rotateX(${(-tilt.y * 3.6).toFixed(2)}deg) rotateY(${(tilt.x * 4.4).toFixed(2)}deg)`;
    if (tf !== tiltSent) {
      tiltSent = tf;
      card.style.transform = tf;
      card.style.setProperty('--sx', (50 + tilt.x * 38).toFixed(1) + '%');
      card.style.setProperty('--sy', (38 + tilt.y * 38).toFixed(1) + '%');
    }
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000 || .016);
    last = now; clock += dt;
    step(dt, now);
    draw(clock);
  }
  function render() { // hareket azaltılmışken tek kare
    view.x = .2; view.y = -.14;
    draw(0);
  }
  function start() {
    if (RM || running || document.hidden) return;
    running = true; last = performance.now(); raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  /* ══════════ Girdi ══════════ */
  // Tekerlek: sayfa kaymaz, bir hareket bir katman.
  // İzleme dörtgeninin ataleti (giderek küçülen olaylar) yeni bir hareket sayılmaz.
  let wAcc = 0, wLast = 0, wLock = 0, wArmed = true, wPrev = 0;
  stage.addEventListener('wheel', e => {
    if (e.ctrlKey) return;                       // yakınlaştırma tarayıcıya kalsın
    e.preventDefault();
    const now = performance.now(), gap = now - wLast;
    wLast = now;
    const raw = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    const d = raw * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? 400 : 1);
    const mag = Math.abs(d), rising = mag > Math.abs(wPrev) + 4 && mag >= 8;
    wPrev = d;
    if (now < wLock) return;
    if (!wArmed) { if (gap > 130 || rising || (now - wLock > 800 && mag >= 50)) wArmed = true; else return; }
    if (gap > 220) wAcc = 0;
    wAcc += d;
    if (Math.abs(wAcc) >= 34) {
      go(cur + (wAcc > 0 ? 1 : -1));
      wAcc = 0; wArmed = false; wLock = now + 780;
    }
  }, { passive: false });

  // Dokunmatik: yukarı kaydır içeri, aşağı kaydır dışarı.
  let touch = null;
  stage.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' && e.isPrimary) touch = { x: e.clientX, y: e.clientY, t: performance.now() };
  });
  addEventListener('pointerup', e => {
    if (!touch || e.pointerType === 'mouse') return;
    const dx = e.clientX - touch.x, dy = e.clientY - touch.y;
    touch = null;
    if (Math.abs(dy) > 42 && Math.abs(dy) > Math.abs(dx) * 1.2) go(cur + (dy < 0 ? 1 : -1));
  });
  addEventListener('pointercancel', () => { touch = null; });

  addEventListener('pointermove', e => {
    const span = Math.max(innerWidth, innerHeight) * .5;
    let x = (e.clientX - eye.ex) / span, y = (e.clientY - eye.ey) / span;
    const len = Math.hypot(x, y);
    if (len > 1) { x /= len; y /= len; }
    ptr.x = x; ptr.y = y; lastMove = performance.now();
  }, { passive: true });
  document.addEventListener('pointerleave', () => { lastMove = -1e9; });

  addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const el = e.target instanceof Element ? e.target : null;
    const onControl = el && el.closest('a,button');
    let to = null;
    switch (e.key) {
      case 'ArrowDown': case 'ArrowRight': case 'PageDown': to = cur + 1; break;
      case 'ArrowUp': case 'ArrowLeft': case 'PageUp': to = cur - 1; break;
      case 'Home': case 'Escape': to = 0; break;
      case 'End': to = N - 1; break;
      case ' ': if (onControl) return; to = cur + (e.shiftKey ? -1 : 1); break;
      default: if (/^[1-6]$/.test(e.key)) to = +e.key - 1;
    }
    if (to == null) return;
    e.preventDefault();
    const inRail = el && el.closest('[role="tablist"]');
    go(to);
    if (inRail) tabs[cur].focus();
  });

  eyeBtn.addEventListener('click', () => go(cur < N - 1 ? cur + 1 : 0));
  addEventListener('hashchange', () => go(fromHash(), { keepHash: true }));
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  reduceQ.addEventListener('change', e => {
    RM = e.matches;
    if (RM) { stop(); intro = 1; coreLevel = 1; open.fill(1); cam = null; pos = cur; card.style.transform = ''; tiltSent = ''; tilt.x = tilt.y = 0; render(); }
    else start();
  });
  new ResizeObserver(measure).observe(wrap);
  addEventListener('resize', measure);

  /* ══════════ Önizleme: örnek içerik anahtarı ══════════ */
  function sampleToggle() {
    if (!SAMPLE || !(PREVIEW || useSample)) return;
    const b = h('button', { class: 'toggle', type: 'button', id: 'ornek-btn', 'aria-pressed': String(useSample) }, 'ÖRNEK İÇERİK');
    b.addEventListener('click', () => {
      useSample = !useSample;
      b.setAttribute('aria-pressed', String(useSample));
      buildPanels();
      if (!RM) stagger(panels[cur], 0);
    });
    $('#foot-r').append(b);
  }

  /* ══════════ Başlangıç ══════════ */
  cur = fromHash();
  pos = cur;
  buildRail();
  buildPanels();
  syncUi();
  sampleToggle();
  measure();
  if (RM) render(); else { start(); stagger(panels[cur], 380); }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); });
  if (window.crypto && crypto.subtle) {
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(fullName(SRC)))
      .then(buf => { setName(new Uint8Array(buf)); if (cv.state !== 'ok') setSigil(nameBytes); })
      .catch(() => {});
  }
  loadCv();

  try {
    console.log('%cYavuz Yapar', 'font:300 28px Georgia,serif;color:#ffb454');
    console.log('Konsolu açtın. Doğru refleks.\nBurada gizli bir şey yok: içerik icerik.js, çizim kart.js.\nÇerez yok, izleyici yok, üçüncü taraf istek yok. Ağ sekmesinden doğrulayabilirsin.');
  } catch (_) {}
})();
