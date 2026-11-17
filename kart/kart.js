/*
 * kart.js — tek ekranlık erişim kartı.
 * Sayfa kaymaz; kaydırma hareketi kamerayı altı savunma katmanından içeri taşır.
 * Bağımlılık yok. İçerik icerik.js dosyasından okunur.
 */
(() => {
  'use strict';

  /* ══════════ Sabitler ══════════ */
  const LAYERS = [
    { n: '01', name: 'ÇEVRE',    ctl: 'GÜVENLİK DUVARI',  title: 'Kimlik',       slug: 'kimlik',       note: '' },
    { n: '02', name: 'AĞ',       ctl: 'BÖLÜMLEME + IDS',  title: 'Bağlantılar',  slug: 'baglantilar',  note: 'Bana ulaşan yollar.' },
    { n: '03', name: 'UÇ NOKTA', ctl: 'EDR',              title: 'Yetkinlikler', slug: 'yetkinlikler', note: 'Sahada kullandıklarım.' },
    { n: '04', name: 'UYGULAMA', ctl: 'KİMLİK DOĞRULAMA', title: 'Çalışmalar',   slug: 'calismalar',   note: 'Üzerinde çalıştıklarım.' },
    { n: '05', name: 'VERİ',     ctl: 'ŞİFRELEME',        title: 'Kayıt',        slug: 'kayit',        note: 'Bugüne kadar.' },
    { n: '06', name: 'ÇEKİRDEK', ctl: 'BÜTÜNLÜK',         title: 'Özgeçmiş',     slug: 'cv',           note: 'Altı katmanın koruduğu tek dosya.' },
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
  // Yalnızca önizlemede tanımlıdır: dosyayı tarayıcı yerine önizleme penceresinin kendi kaydetme onayına verir.
  const BRIDGE = typeof window.KART_KAYDET === 'function' ? window.KART_KAYDET : null;
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

  const cv = { state: 'wait', hex: '', size: 0, buf: null };
  let cvRefs = null;

  /* ══════════ Paneller ══════════ */
  function tagLine(L) {
    return h('p', { class: 'tag' },
      h('span', { class: 'tag-n' }, L.n),
      h('span', { class: 'tag-rule', 'aria-hidden': 'true' }),
      h('span', null, L.name),
      h('span', { class: 'tag-ctl' }, L.ctl));
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
    return PREVIEW && h('p', { class: 'fine' }, 'Önizlemede .vcf kaydı kapalı. Yayındaki sitede çalışır.');
  }
  function cvClick(e, dive) {
    if (PREVIEW) { e.preventDefault(); previewSave(); }
    if (dive) setTimeout(() => go(N - 1), 90);   // kart çekirdeğe iner: ziyaretçi indirdiği dosyanın özetini görür
  }
  async function previewSave() {
    const say = t => { if (cvRefs) cvRefs.fine.textContent = t; };
    if (!BRIDGE || !cv.buf) { say('Önizlemede indirme kullanılamıyor. Yayındaki sitede çalışır.'); return; }
    say('Kaydetme onayı bekleniyor.');
    const r = await BRIDGE(cvName(content()), new Blob([cv.buf], { type: 'application/pdf' }));
    say(r === 'tamam' ? 'Dosya kaydedildi.'
      : r === 'declined' ? 'Kaydetme iptal edildi.'
      : 'Önizlemede indirme kullanılamıyor. Yayındaki sitede çalışır.');
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
        h('a', { class: 'btn primary', href: cvHref(d), download: cvName(d), onclick: e => cvClick(e, true) }, 'CV’Yİ İNDİR', icon('down')),
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
      const fine = h('p', { class: 'fine' }, 'İndirdiğin dosyanın SHA-256 özeti buradakiyle aynıysa dosya yolda değişmemiştir.');
      cvRefs = { meta, code, state, copyBtn, fine };
      queueMicrotask(paintCv);
      return [
        tagLine(L), head(L),
        h('p', { class: 'file' }, h('span', null, cvName(d)), meta),
        h('dl', { class: 'hash' }, h('dt', { class: 'k' }, 'SHA-256'), h('dd', null, code, state)),
        h('div', { class: 'actions' },
          h('a', { class: 'btn primary', href: cvHref(d), download: cvName(d), onclick: e => cvClick(e, false) }, 'CV’Yİ İNDİR', icon('down')),
          copyBtn),
        fine,
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
      if (BRIDGE) cv.buf = buf;
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
    if (PREVIEW) return;
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

  /* ══════════ Makine: altı halkalı savunma düzeneği ══════════ */
  // Sağdaki düzenek süs değil, katmanlı savunmanın çalışan bir maketi. Her halka gerçek bir
  // güvenlik kontrolünün mekanik karşılığı; dışarıdan gelen her paket sırayla hepsinden geçmek zorunda:
  //   01 güvenlik duvarı   port kepenkleri; yalnızca 443 açık, ötekiler çarpıp düşer
  //   02 bölümleme + IDS   dört ağ bölgesi ve üzerlerinde dönen tarama ışını
  //   03 EDR               24 uç nokta; ele geçirilen karantinaya çekilir
  //   04 kimlik doğrulama  pimli kilit; pimler kesme hattına dizilince göbek döner
  //   05 şifreleme         iç içe iki şifre rotoru
  //   06 kasa              iris diyaframı ve CV dosyasının SHA-256 özeti
  // Halkalar B oranıyla iç içe oturur; kamera daldıkça dıştaki büyüyüp geçer, içteki çerçeveye yerleşir.
  const eye = { cx: 0, cy: 0, R: 0, w: 0, h: 0, ex: 0, ey: 0 };
  let dpr = 1, dprCap = 2;      // dprCap: yavaş cihazda kademeli düşer (bkz. frame)
  const B = 1.39, Q = 1 / B;   // bir halkanın dış/iç yarıçap oranı
  const ROLL = TAU / 12;       // her katmanda düzenek bir port aralığı kadar döner

  const tilt = { x: 0, y: 0 }; // kartın eğimi; yalnızca imleç hareket ederken, boşta düzleşir
  let tiltSent = '';
  const ptr = { x: 0, y: 0 };
  let lastMove = -1e9;
  let intro = RM ? 1 : 0;
  let coreLevel = RM ? 1 : 0;
  let pulse = 0;
  const asm = new Float32Array(N).fill(RM ? 1 : 0);   // açılışta halkaların yerine oturması

  const rIn = k => eye.R * Math.pow(Q, k - pos);       // k. halkanın iç yarıçapı
  const rotOf = k => (pos - k) * ROLL;
  const ringAlpha = rel => (rel >= 0 ? 1 : Math.pow(clamp01(1 + rel / .5), 2));
  const irisAt = p => .22 + .78 * Math.pow(clamp01(p / (N - 1)), 1.15);
  const mod = (a, n) => ((a % n) + n) % n;
  const angDiff = (a, b) => mod(a - b + Math.PI, TAU) - Math.PI;

  function measure() {
    const w = card.offsetWidth, hh = card.offsetHeight;
    if (!w || !hh) return;
    dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    eye.w = w; eye.h = hh;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(hh * dpr);
    const sw = slot.offsetWidth, sh = slot.offsetHeight;
    eye.R = Math.max(18, (Math.min(sw, sh) / 2 - 19) / B);   // 19 px: çerçevedeki yazıtların payı
    eye.cx = slot.offsetLeft + sw / 2;
    eye.cy = slot.offsetTop + sh / 2;
    const d = Math.round(eye.R * B * 2);
    eyeBtn.style.width = eyeBtn.style.height = d + 'px';
    eyeBtn.style.left = Math.round(sw / 2 - d / 2) + 'px';
    eyeBtn.style.top = Math.round(sh / 2 - d / 2) + 'px';
    const wr = wrap.getBoundingClientRect();
    eye.ex = wr.left + wr.width / 2; eye.ey = wr.top + wr.height / 2;
    fit(panels[cur]);
    if (!running) render();
  }

  /* ── Düzeneğin sabitleri ve anlık durumu ── */
  const PORTS = [22, 25, 53, 80, 110, 143, 443, 445, 993, 1433, 3306, 3389];
  const OPEN = 6;                                          // yalnızca 443 açık
  const pa = i => (i - OPEN) * TAU / 12 - TAU / 6;         // port açısı; 443 sağ üstte durur
  const ZONES = ['DMZ', 'SUNUCU', 'YÖNETİM', 'KULLANICI'];
  const TRACK = [.4, .52, .64];
  const NS = 186, NR = 204, NP = 9, NPL = 6;               // gezegen dişli takımı: güneş, çember, gezegen dişleri; gezegen sayısı
  const NEP = 24, NPIN = 18, NCELL = 32, SHEAR = .46, QT = 3.4;
  const HEX2 = '0123456789ABCDEF0123456789ABCDEF';
  const DROP = [0, .3, .17, .22];                          // güvenlik duvarını geçen paketin sonraki halkalarda düşme payı
  const RATE = [1.5, .9, .75, .55, .5, .45];

  const mech = {
    denied: 0, alerts: 0, ok: 0, no: 0,
    portFlash: new Float32Array(12), led: 0,
    beam: .9, carrier: 0,
    quar: new Float32Array(NEP), blink: new Float32Array(NEP),
    pin: new Float32Array(NPIN), pinFrom: new Float32Array(NPIN), pinTo: new Float32Array(NPIN),
    plug: 0, plugFrom: 0, shearFlash: 0,
    rotA: 0, rotAt: 0, rotB: 0, rotBt: 0, rotT: 0,
  };
  const auth = { ph: 0, t: 0, ok: true, idle: 3, pkt: null };   // 0 bekliyor · 1 pimler diziliyor · 2 göbek dönüyor · 3 dağılıyor · 4 reddedildi
  let perm = HEX2.split('');                                  // iç rotorun karışık alfabesi
  let nodes = [[], [], [], []];                               // bölgelerdeki ağ düğümleri

  /* ── Düzeneğin verisi: adın ve CV dosyasının özetinden türetilir ── */
  function seedBytes(s) {
    let x = 0x811c9dc5;
    for (const ch of s) { x ^= ch.codePointAt(0); x = Math.imul(x, 0x01000193); }
    x = x >>> 0 || 1;
    const out = new Uint8Array(32);
    for (let i = 0; i < 32; i++) { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; out[i] = x & 255; }
    return out;
  }
  let nameBytes = seedBytes('Yavuz Yapar');
  function setName(bytes) {
    nameBytes = bytes;
    let s = (bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3]) >>> 0;
    const rnd = () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    perm = HEX2.split('');
    for (let i = perm.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const x = perm[i]; perm[i] = perm[j]; perm[j] = x; }
    nodes = [0, 1, 2, 3].map(() => {
      const arr = [];
      for (let tr = 0; tr < 3; tr++) { const n = 3 + Math.floor(rnd() * 3); for (let i = 0; i < n; i++) arr.push({ tr, f: (i + .25 + rnd() * .5) / n, link: rnd() < .55 }); }
      return arr;
    });
    if (auth.ph === 0) for (let i = 0; i < NPIN; i++) mech.pin[i] = (rnd() - .5) * .26;
    if (!running) render();
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
  function annulus(r0, r1) { ctx.beginPath(); ctx.arc(0, 0, r1, 0, TAU); ctx.arc(0, 0, r0, 0, TAU, true); }
  function sector(r0, r1, a0, a1) { ctx.beginPath(); ctx.arc(0, 0, r1, a0, a1); ctx.arc(0, 0, r0, a1, a0, true); ctx.closePath(); }
  function ticks(r0, r1, n, off = 0) {
    for (let i = 0; i < n; i++) {
      const a = off + i / n * TAU, c = Math.cos(a), s = Math.sin(a);
      ctx.moveTo(c * r0, s * r0); ctx.lineTo(c * r1, s * r1);
    }
  }
  function bolts(rad, n, size, off, c) {
    ctx.lineWidth = Math.max(.5, size * .4);
    for (let i = 0; i < n; i++) {
      const a = off + i / n * TAU, x = Math.cos(a) * rad, y = Math.sin(a) * rad, sa = a * 1.7 + i;
      ctx.fillStyle = rgba(mix(SURF, c, .3), 1); ctx.strokeStyle = rgba(c, .6);
      ctx.beginPath(); ctx.arc(x, y, size, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - Math.cos(sa) * size * .7, y - Math.sin(sa) * size * .7); ctx.lineTo(x + Math.cos(sa) * size * .7, y + Math.sin(sa) * size * .7); ctx.stroke();
    }
  }
  // Yay boyunca yazı. flip: alt yay için; harflerin tepesi merkeze bakar, yine soldan sağa okunur.
  function arcText(text, r, mid, px, col, alpha, flip) {
    if (px < 5 || alpha < .03) return;
    ctx.font = `500 ${px.toFixed(2)}px ${MONO}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = rgba(col, alpha);
    const track = px * .3, ws = [];
    let total = 0;
    for (const ch of text) { const w = ctx.measureText(ch).width + track; ws.push(w); total += w; }
    const dir = flip ? -1 : 1;
    let a = mid - dir * total / 2 / r, i = 0;
    for (const ch of text) {
      const half = ws[i++] / 2 / r * dir;
      a += half;
      ctx.save(); ctx.rotate(a + dir * Math.PI / 2); ctx.fillText(ch, 0, -dir * r); ctx.restore();
      a += half;
    }
  }
  // Dişli çevresi: trapez dişler. inward: dişler merkeze bakar (çember dişli).
  function gearPath(Rp, n, h, phase, inward) {
    const s = inward ? -1 : 1, rt = Rp + s * h / 2, rr = Rp - s * h / 2, st = TAU / n;
    for (let i = 0; i < n; i++) {
      const a0 = phase + (i - .5) * st;
      let a = a0 + .22 * st;
      if (i) ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      a = a0 + .34 * st; ctx.lineTo(Math.cos(a) * rt, Math.sin(a) * rt);
      a = a0 + .66 * st; ctx.lineTo(Math.cos(a) * rt, Math.sin(a) * rt);
      a = a0 + .78 * st; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
  }
  // Gezegen dişli takımının ölçüleri. r2: güneş dişlisini taşıyan halkanın (03) iç yarıçapı.
  function gearGeom(r2) {
    const Ra = 1.335 * r2, pitch = TAU * Ra / NS, Rb = pitch * NR / TAU;
    return { Ra, Rb, rp: (Rb - Ra) / 2, pitch, h: pitch * .52 };
  }
  // 02 sabit çember dişli olduğundan taşıyıcı döndükçe güneş (03) şu açıyla döner: θ·(1 + NR/NS)
  const sunAngle = () => (1 + NR / NS) * mech.carrier + Math.PI / NS;
  const ring2Rot = () => rotOf(1) + sunAngle();

  const SHEEN = [.3, 1.2, 2.1, .8, 1.7, 2.7];
  // Levha: tornalanmış metal. Karşılıklı açık-koyu dilimler fırça izini, kenardaki gölge üstteki halkayı verir.
  function plate(k, r, ro, t) {
    const tone = RAMP[k], base = mix(SURF, tone, .075);
    annulus(r, ro);
    if (ctx.createConicGradient) {
      const g = ctx.createConicGradient(SHEEN[k] + t * .025, 0, 0);
      const hi = css(mix(base, BONE, .1)), md = css(base), lo = css(mix(base, VOID, .6));
      g.addColorStop(0, hi); g.addColorStop(.125, md); g.addColorStop(.25, lo); g.addColorStop(.375, md);
      g.addColorStop(.5, hi); g.addColorStop(.625, md); g.addColorStop(.75, lo); g.addColorStop(.875, md); g.addColorStop(1, hi);
      ctx.fillStyle = g;
    } else ctx.fillStyle = css(base);
    ctx.fill();
    const d = ro * .03;                                   // ışık sol üstten: gölge sol üst kenarda kalınlaşır
    const sh = ctx.createRadialGradient(d, d, ro * .8, d, d, ro * 1.04);
    sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.66)');
    ctx.fillStyle = sh; ctx.fill();
    const lip = ctx.createRadialGradient(0, 0, r, 0, 0, r + (ro - r) * .2);
    lip.addColorStop(0, rgba(tone, .17)); lip.addColorStop(1, rgba(tone, 0));
    ctx.fillStyle = lip; ctx.fill();
    const lw = Math.max(.7, (ro - r) / 40);
    const eg = ctx.createLinearGradient(-r, -r, r, r);
    eg.addColorStop(0, rgba(tone, .3)); eg.addColorStop(1, rgba(tone, 1));
    ctx.strokeStyle = eg; ctx.lineWidth = lw * 1.3; ring(r);
    const og = ctx.createLinearGradient(-ro, -ro, ro, ro);
    og.addColorStop(0, rgba(tone, .5)); og.addColorStop(1, rgba(tone, .1));
    ctx.strokeStyle = og; ctx.lineWidth = lw * .8; ring(ro);
  }
  function halo(ro) { // halkanın altına düşürdüğü gölge
    const g = ctx.createRadialGradient(0, 0, ro * .98, 0, 0, ro * 1.1);
    g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    annulus(ro * .98, ro * 1.1); ctx.fillStyle = g; ctx.fill();
  }

  /* ── Halkalar. r: iç yarıçap, w: halkanın genişliği, c: katman rengi, rot: ekrandaki dönüş ── */
  const RING = [
    // 01 ÇEVRE · güvenlik duvarı: on iki port, on biri kepenkli
    (r, w, c, t, rot) => {
      const U = u => r + u * w, lw = Math.max(.6, w / 44), gap = .15;
      if (w > 18) {
        ctx.strokeStyle = rgba(c, .32); ctx.lineWidth = lw * .7;
        ctx.beginPath(); ticks(U(.03), U(.062), 180); ticks(U(.03), U(.095), 36); ctx.stroke();
      }
      const wall = rgba(mix(SURF, c, .22), .97);
      for (let i = 0; i < 12; i++) {
        const a0 = pa(i) + gap / 2, a1 = pa(i + 1) - gap / 2;
        sector(U(.3), U(.76), a0, a1);
        ctx.fillStyle = wall; ctx.fill();
        ctx.strokeStyle = rgba(c, .74); ctx.lineWidth = lw; ctx.stroke();
        if (w > 26) {
          ctx.strokeStyle = rgba(c, .26); ctx.lineWidth = lw * .7;
          ctx.beginPath(); ctx.arc(0, 0, U(.45), a0 + .035, a1 - .035); ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, U(.61), a0 + .035, a1 - .035); ctx.stroke();
        }
      }
      const half = Math.sin(gap / 2) * U(.53) * .84;
      for (let i = 0; i < 12; i++) {
        const f = mech.portFlash[i];
        ctx.save(); ctx.rotate(pa(i));
        if (i === OPEN) {
          ctx.strokeStyle = rgba(AMBER, .7 + .3 * mech.led); ctx.lineWidth = lw * 1.3;
          ctx.beginPath(); ctx.moveTo(U(.3), -half); ctx.lineTo(U(.76), -half); ctx.moveTo(U(.3), half); ctx.lineTo(U(.76), half); ctx.stroke();
          ctx.fillStyle = rgba(AMBER, 1);
          ctx.beginPath(); ctx.arc(U(.855), 0, Math.max(1, w * .032) * (1 + mech.led * .5), 0, TAU); ctx.fill();
        } else {
          const col = mix(c, DENY, f), s0 = U(.45) - f * w * .03, len = w * .15;
          ctx.fillStyle = rgba(col, .5 + .5 * f); ctx.fillRect(s0, -half, len, half * 2);
          ctx.strokeStyle = rgba(col, .95); ctx.lineWidth = lw * .8; ctx.strokeRect(s0, -half, len, half * 2);
          if (w > 30) { ctx.fillStyle = rgba(c, .45); ctx.beginPath(); ctx.arc(U(.855), 0, Math.max(.7, w * .017), 0, TAU); ctx.fill(); }
        }
        ctx.restore();
      }
      if (w > 22) bolts(U(.915), 24, Math.max(.9, w * .026), pa(0) + TAU / 48, c);
      if (w > 40) {
        const px = w * .118;
        for (let i = 0; i < 12; i++) arcText(String(PORTS[i]), U(.19), pa(i), px, i === OPEN ? AMBER : c, i === OPEN ? 1 : .82, Math.sin(pa(i) + rot) > .15);
      }
    },

    // 02 AĞ · bölümleme + IDS: dört bölge, üzerlerinde dönen tarama ışını; iç kenarda sabit çember dişli
    (r, w, c, t, rot) => {
      const U = u => r + u * w, lw = Math.max(.6, w / 44);
      const g = gearGeom(r * Q);
      ctx.strokeStyle = rgba(c, .62); ctx.lineWidth = lw * .8;
      if (g.pitch > 2) { ctx.beginPath(); gearPath(g.Rb, NR, g.h, 0, true); ctx.stroke(); } else ring(g.Rb);
      ctx.strokeStyle = rgba(c, .3); ctx.lineWidth = lw * .7; ring(U(.215));
      for (let z = 0; z < 4; z++) { // bölge panelleri, iletim hatları ve düğümler
        const a0 = -TAU / 8 + z * TAU / 4 + .1, a1 = a0 + TAU / 4 - .2;
        sector(U(.31), U(.75), a0 - .035, a1 + .035);
        ctx.fillStyle = rgba(mix(SURF, c, .13), .9); ctx.fill();
        ctx.strokeStyle = rgba(c, .3); ctx.lineWidth = lw * .7; ctx.stroke();
        ctx.strokeStyle = rgba(c, .4); ctx.lineWidth = lw * .8;
        for (const tr of TRACK) { ctx.beginPath(); ctx.arc(0, 0, U(tr), a0, a1); ctx.stroke(); }
        if (w > 16) {
          const s = Math.max(1.1, w * .038);
          for (const nd of nodes[z]) {
            const a = a0 + nd.f * (a1 - a0), rad = U(TRACK[nd.tr]), x = Math.cos(a) * rad, y = Math.sin(a) * rad;
            if (nd.link && nd.tr < 2) { const r2 = U(TRACK[nd.tr + 1]); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); ctx.stroke(); }
            ctx.fillStyle = rgba(c, .92); ctx.fillRect(x - s / 2, y - s / 2, s, s);
          }
        }
      }
      for (let z = 0; z < 4; z++) { // bölgeleri ayıran perdeler
        const th = Math.max(1.1, w * .042);
        ctx.save(); ctx.rotate(-TAU / 8 + z * TAU / 4);
        ctx.fillStyle = rgba(mix(SURF, c, .3), 1); ctx.fillRect(U(.25), -th, U(.94) - U(.25), th * 2);
        ctx.strokeStyle = rgba(c, .78); ctx.lineWidth = lw; ctx.strokeRect(U(.25), -th, U(.94) - U(.25), th * 2);
        if (w > 26) { ctx.fillStyle = rgba(c, .7); for (const u of [.34, .85]) { ctx.beginPath(); ctx.arc(U(u), 0, th * .42, 0, TAU); ctx.fill(); } }
        ctx.restore();
      }
      const bm = mech.beam; // IDS: ray, tarama izi, ışın
      ctx.strokeStyle = rgba(c, .34); ctx.lineWidth = lw * .7; ring(U(.27));
      for (let j = 0; j < 18; j++) {
        sector(U(.29), U(.74), bm - (j + 1) * .045, bm - j * .045 + .004);
        ctx.fillStyle = rgba(c, .22 * (1 - j / 18)); ctx.fill();
      }
      const p0 = P(bm, U(.27)), p1 = P(bm, U(.77));
      ctx.strokeStyle = rgba(BONE, .95); ctx.lineWidth = lw * 1.4;
      ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
      ctx.fillStyle = rgba(BONE, 1); ctx.beginPath(); ctx.arc(p0[0], p0[1], Math.max(1, w * .04), 0, TAU); ctx.fill();
      ctx.strokeStyle = rgba(c, .28); ctx.lineWidth = lw * .7; ring(U(.915));
      if (w > 34) {
        const px = w * .115;
        for (let z = 0; z < 4; z++) { const mid = z * TAU / 4 - TAU / 4; arcText(ZONES[z], U(.835), mid, px, c, .86, Math.sin(mid + rot) > .15); }
      }
    },

    // 03 UÇ NOKTA · EDR: 24 cihaz sırayla yoklanır; ele geçirilen dışarı çekilip karantinaya alınır. Dış kenar güneş dişlisi.
    (r, w, c, t) => {
      const U = u => r + u * w, lw = Math.max(.6, w / 44), cell = TAU / NEP, g2 = .03;
      const g = gearGeom(r);
      if (g.pitch > 2) {
        ctx.beginPath(); gearPath(g.Ra, NS, g.h, 0, false); ctx.moveTo(U(.775), 0); ctx.arc(0, 0, U(.775), 0, TAU, true);
        ctx.fillStyle = rgba(mix(SURF, c, .26), 1); ctx.fill('evenodd');
        ctx.strokeStyle = rgba(c, .66); ctx.lineWidth = lw * .8; ctx.stroke();
      } else { ctx.strokeStyle = rgba(c, .5); ctx.lineWidth = lw; ring(g.Ra); ring(U(.775)); }
      const poll = Math.floor(t * 5) % NEP;
      for (let i = 0; i < NEP; i++) {
        const qv = mech.quar[i], s = qv > 0 ? Math.min(1, (QT - qv) / .3, qv / .4) : 0;
        const col = mix(c, DENY, s), off = s * w * .085, lit = Math.max(mech.blink[i], i === poll ? 1 : 0);
        ctx.save(); ctx.rotate(i * cell);
        sector(U(.17) + off, U(.69) + off, -cell / 2 + g2, cell / 2 - g2);
        ctx.fillStyle = rgba(mix(SURF, col, .2 + .14 * lit), .97); ctx.fill();
        ctx.strokeStyle = rgba(col, .68 + .32 * lit); ctx.lineWidth = lw; ctx.stroke();
        if (w > 20) {
          ctx.strokeStyle = rgba(col, .34); ctx.lineWidth = lw * .7;
          ctx.beginPath(); ctx.arc(0, 0, U(.44) + off, -cell / 2 + g2 * 2.2, cell / 2 - g2 * 2.2); ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, U(.55) + off, -cell / 2 + g2 * 2.2, cell / 2 - g2 * 2.2); ctx.stroke();
        }
        ctx.fillStyle = s > 0 ? rgba(DENY, 1) : lit > .05 ? rgba(BONE, .5 + .5 * lit) : rgba(c, .7);
        ctx.beginPath(); ctx.arc(U(.27) + off, 0, Math.max(.8, w * .03) * (1 + lit * .4), 0, TAU); ctx.fill();
        ctx.restore();
      }
      if (w > 18) { ctx.strokeStyle = rgba(c, .32); ctx.lineWidth = lw * .7; ctx.beginPath(); ticks(U(.03), U(.09), 96); ctx.stroke(); }
    },

    // 04 UYGULAMA · kimlik doğrulama: boru tipi pimli kilit. Pimlerin ek yeri kesme hattına gelince göbek bir diş döner.
    (r, w, c) => {
      const U = u => r + u * w, lw = Math.max(.6, w / 44), cell = TAU / NPIN;
      const half = Math.min(w * .085, Math.sin(cell / 2) * U(.17) * .6);
      let aligned = true;
      for (let i = 0; i < NPIN; i++) {
        const sp = SHEAR + mech.pin[i];
        if (Math.abs(mech.pin[i]) > .006) aligned = false;
        ctx.save(); ctx.rotate(i * cell);
        ctx.strokeStyle = rgba(c, .3); ctx.lineWidth = lw * .7;
        ctx.strokeRect(U(.15), -half, U(.87) - U(.15), half * 2);
        const d0 = U(sp + .014), d1 = U(sp + .2); // sürücü pim
        ctx.fillStyle = rgba(mix(SURF, c, .5), 1); ctx.fillRect(d0, -half * .74, d1 - d0, half * 1.48);
        ctx.strokeStyle = rgba(c, .82); ctx.lineWidth = lw * .8; ctx.strokeRect(d0, -half * .74, d1 - d0, half * 1.48);
        if (w > 24) { // yay
          const s1 = U(.86), nz = 6;
          ctx.strokeStyle = rgba(c, .5); ctx.lineWidth = lw * .7; ctx.beginPath(); ctx.moveTo(d1, 0);
          for (let z = 1; z <= nz; z++) ctx.lineTo(d1 + (s1 - d1) * z / nz, z === nz ? 0 : (z % 2 ? 1 : -1) * half * .6);
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.save(); // göbek: anahtar pimleri
      ctx.rotate(auth.ph === 2 || auth.ph === 4 ? mech.plug - mech.plugFrom : 0);
      ctx.fillStyle = rgba(mix(c, AMBER, .4), .96);
      for (let i = 0; i < NPIN; i++) {
        const k0 = U(.17), k1 = U(SHEAR + mech.pin[i] - .014);
        ctx.save(); ctx.rotate(i * cell); ctx.fillRect(k0, -half * .74, k1 - k0, half * 1.48); ctx.restore();
      }
      ctx.restore();
      ctx.save(); ctx.rotate(mech.plug); // göbeğin dönüşünü gösteren işaret
      if (w > 18) { ctx.strokeStyle = rgba(c, .34); ctx.lineWidth = lw * .7; ctx.beginPath(); ticks(U(.03), U(.085), 72); ctx.stroke(); }
      ctx.fillStyle = rgba(AMBER, .95); ctx.beginPath(); ctx.moveTo(U(.02), 0); ctx.lineTo(U(.12), -w * .04); ctx.lineTo(U(.12), w * .04); ctx.closePath(); ctx.fill();
      ctx.restore();
      const hit = mech.shearFlash > .05;
      ctx.strokeStyle = hit ? rgba(DENY, .4 + .6 * mech.shearFlash) : aligned ? rgba(AMBER, 1) : rgba(c, .6);
      ctx.lineWidth = lw * (aligned || hit ? 1.7 : 1);
      if (!aligned && !hit) ctx.setLineDash([w * .07, w * .05]);
      ring(U(SHEAR)); ctx.setLineDash([]);
    },

    // 05 VERİ · şifreleme: iç içe iki rotor. Üstteki pencerede dış rotor düz harfi, iç rotor şifreli karşılığını gösterir.
    (r, w, c) => {
      const U = u => r + u * w, lw = Math.max(.6, w / 44), cell = TAU / NCELL, px = w * .2;
      const tracks = [[.52, .85, mech.rotA, HEX2], [.14, .47, mech.rotB, perm]];
      for (const [u0, u1, p, glyphs] of tracks) {
        const mid = U((u0 + u1) / 2);
        ctx.save(); ctx.rotate(p * cell);
        ctx.strokeStyle = rgba(c, .5); ctx.lineWidth = lw * .8; ring(U(u0)); ring(U(u1));
        ctx.strokeStyle = rgba(c, .42); ctx.lineWidth = lw * .7; ctx.beginPath();
        ticks(U(u0), U(u0 + .07), NCELL, -Math.PI / 2 + cell / 2); ticks(U(u1 - .07), U(u1), NCELL, -Math.PI / 2 + cell / 2); ctx.stroke();
        if (px >= 5) {
          ctx.font = `500 ${px.toFixed(2)}px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = rgba(c, .94);
          for (let j = 0; j < NCELL; j++) { ctx.save(); ctx.rotate(j * cell); ctx.fillText(glyphs[j], 0, -mid); ctx.restore(); }
        } else {
          ctx.fillStyle = rgba(c, .8);
          for (let j = 0; j < NCELL; j++) { const a = j * cell - Math.PI / 2, s = Math.max(.6, w * .035) * (.6 + (HEX2.indexOf(glyphs[j]) % 4) * .2); ctx.beginPath(); ctx.arc(Math.cos(a) * mid, Math.sin(a) * mid, s, 0, TAU); ctx.fill(); }
        }
        ctx.restore();
      }
      const hw = Math.sin(cell / 2) * U(.5) * 1.3; // okuma penceresi
      ctx.strokeStyle = rgba(AMBER, .95); ctx.lineWidth = lw * 1.3;
      ctx.strokeRect(-hw, -U(.89), hw * 2, U(.89) - U(.1));
      ctx.fillStyle = rgba(AMBER, .95); ctx.beginPath(); ctx.moveTo(0, -U(.9)); ctx.lineTo(-w * .05, -U(.99)); ctx.lineTo(w * .05, -U(.99)); ctx.closePath(); ctx.fill();
    },

    // 06 ÇEKİRDEK · bütünlük: kasa yuvası. Çizgiler CV dosyasının SHA-256 özetinin 64 basamağı; sürgüler çekirdeğe varınca çekilir.
    (r, w, c) => {
      const U = u => r + u * w, lw = Math.max(.6, w / 44);
      ctx.strokeStyle = rgba(AMBER, .9); ctx.lineWidth = Math.max(.8, w * .03); ctx.beginPath();
      for (let i = 0; i < 64; i++) {
        const g = i / 64 * TAU - Math.PI / 2, cs = Math.cos(g), sn = Math.sin(g), a0 = U(.07), a1 = U(.12 + sig.nib[i] / 15 * .26);
        ctx.moveTo(cs * a0, sn * a0); ctx.lineTo(cs * a1, sn * a1);
      }
      ctx.stroke();
      ctx.strokeStyle = rgba(c, .4); ctx.lineWidth = lw * .7; ring(U(.44));
      const ext = 1 - easeInOut(clamp01(pos - (N - 2)));
      for (let j = 0; j < 6; j++) {
        const b0 = U(.5), b1 = U(.66 + .28 * ext), hh = w * .13;
        ctx.save(); ctx.rotate(j * TAU / 6 + TAU / 12);
        ctx.fillStyle = rgba(mix(SURF, c, .34), 1); ctx.fillRect(b0, -hh, b1 - b0, hh * 2);
        ctx.strokeStyle = rgba(c, .85); ctx.lineWidth = lw; ctx.strokeRect(b0, -hh, b1 - b0, hh * 2);
        ctx.strokeStyle = rgba(c, .4); ctx.beginPath(); ctx.moveTo(U(.57), -hh); ctx.lineTo(U(.57), hh); ctx.stroke();
        ctx.restore();
      }
      if (w > 24) bolts(U(.9), 6, Math.max(.9, w * .03), 0, c);
    },
  ];

  // Gezegen dişliler: 02'nin sabit çember dişlisi içinde yuvarlanır, 03'ü döndürür. Diş sayıları gerçek orana uyar.
  function gearset(r1) {
    const g = gearGeom(r1 * Q);
    if (g.rp < 2.4) return;
    const rc = g.Ra + g.rp, c1 = RAMP[1], c2 = RAMP[2];
    ctx.save(); ctx.rotate(rotOf(1));
    ctx.strokeStyle = rgba(c1, .3); ctx.lineWidth = Math.max(.6, g.rp * .18); ring(rc); // taşıyıcı
    for (let j = 0; j < NPL; j++) {
      const al = mech.carrier + j * TAU / NPL, rho = al * (1 - NR / NP) + Math.PI / NP;
      ctx.save(); ctx.translate(Math.cos(al) * rc, Math.sin(al) * rc);
      ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.arc(g.rp * .2, g.rp * .2, g.rp * 1.14, 0, TAU); ctx.fill();
      ctx.beginPath(); gearPath(g.rp, NP, g.h, rho, false);
      ctx.fillStyle = css(mix(SURF, c2, .36)); ctx.fill();
      ctx.strokeStyle = rgba(BONE, .82); ctx.lineWidth = Math.max(.6, g.rp * .1); ctx.stroke();
      ctx.rotate(rho);
      ctx.strokeStyle = rgba(c2, .75); ctx.lineWidth = Math.max(.5, g.rp * .09); ring(g.rp * .46);
      ctx.beginPath(); for (let s = 0; s < 3; s++) { const a = s * TAU / 3; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * g.rp * .46, Math.sin(a) * g.rp * .46); } ctx.stroke();
      ctx.fillStyle = rgba(BONE, .95); ctx.beginPath(); ctx.arc(0, 0, Math.max(.7, g.rp * .14), 0, TAU); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  // Kasanın içi: CV'nin özetinden çizilen desen.
  function coreInterior(b, t, lvl) {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(1, b * 1.25));
    g.addColorStop(0, css(mix(VOID, [62, 36, 10], coreLevel)));
    g.addColorStop(.5, css(mix(VOID, [22, 14, 8], coreLevel)));
    g.addColorStop(1, css([6, 8, 11]));
    ctx.fillStyle = g; ctx.fillRect(-b - 2, -b - 2, b * 2 + 4, b * 2 + 4);
    if (lvl < .01) return;
    const rc = b * .92;
    const K = clamp(Math.round(rc / 5), 6, 26), SEG = clamp(Math.round(rc * 1.1), 56, 200);
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
        const px = Math.cos(ph) * rr, py = Math.sin(ph) * rr;
        if (j) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      }
      ctx.strokeStyle = `rgba(255,${(168 + 62 * (1 - f)) | 0},${(72 + 120 * (1 - f)) | 0},${((.1 + .34 * (1 - f)) * lvl).toFixed(3)})`;
      ctx.stroke();
    }
    const hot = ctx.createRadialGradient(0, 0, 0, 0, 0, rc * .55);
    hot.addColorStop(0, `rgba(255,226,170,${(.62 * lvl).toFixed(3)})`);
    hot.addColorStop(.18, `rgba(255,186,96,${(.3 * lvl).toFixed(3)})`);
    hot.addColorStop(1, 'rgba(255,170,70,0)');
    ctx.fillStyle = hot; ctx.beginPath(); ctx.arc(0, 0, rc * .55, 0, TAU); ctx.fill();
    ctx.restore();
  }

  // İris diyaframı: dokuz bıçak. Kamera derine indikçe açılır; çekirdekte tamamen çekilir.
  function drawIris(b, frac) {
    if (frac > .965) return;
    const n = 9, R0 = Math.max(.02, frac) * b / Math.cos(Math.PI / n), phi = frac * 1.3 + .3, tone = RAMP[N - 1];
    ctx.beginPath(); ctx.arc(0, 0, b + 1, 0, TAU);
    for (let i = 0; i < n; i++) { const p = P(phi + i * TAU / n, R0); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }
    ctx.closePath();
    const g = ctx.createLinearGradient(-b, -b, b, b);
    g.addColorStop(0, css(mix(SURF, tone, .24))); g.addColorStop(1, css(mix(VOID, tone, .06)));
    ctx.fillStyle = g; ctx.fill('evenodd');
    ctx.strokeStyle = rgba(tone, .5); ctx.lineWidth = Math.max(.6, b / 110); ctx.beginPath();
    for (let i = 0; i < n; i++) { // her bıçağın kenarı: bir köşeden komşusuna, oradan dış çembere
      const v = P(phi + i * TAU / n, R0), v2 = P(phi + (i + 1) * TAU / n, R0);
      let dx = v2[0] - v[0], dy = v2[1] - v[1];
      const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
      const vd = v[0] * dx + v[1] * dy, s = -vd + Math.sqrt(Math.max(0, vd * vd - (R0 * R0 - b * b)));
      ctx.moveTo(v[0], v[1]); ctx.lineTo(v[0] + dx * s, v[1] + dy * s);
    }
    ctx.stroke();
    ctx.strokeStyle = rgba(AMBER, .85); ctx.lineWidth = Math.max(.7, b / 90); ctx.beginPath();
    for (let i = 0; i < n; i++) { const p = P(phi + i * TAU / n, R0); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }
    ctx.closePath(); ctx.stroke();
  }

  /* ── Kilit: bir kimlik doğrulamanın adımları ── */
  function scatter() {
    auth.ph = 3; auth.t = 0;
    for (let i = 0; i < NPIN; i++) { mech.pinFrom[i] = mech.pin[i]; mech.pinTo[i] = (Math.random() - .5) * .26; }
  }
  function startAuth(ok, pkt) {
    auth.ph = 1; auth.t = 0; auth.ok = ok; auth.pkt = pkt || null;
    for (let i = 0; i < NPIN; i++) { mech.pinFrom[i] = mech.pin[i]; mech.pinTo[i] = 0; }
    if (!ok) for (let j = 0; j < 3; j++) mech.pinTo[(Math.random() * NPIN) | 0] = (Math.random() < .5 ? -1 : 1) * (.05 + Math.random() * .05); // yanlış anahtar: üç pim oturmaz
  }
  function stepAuth(dt) {
    const A = auth; A.t += dt;
    if (A.ph === 0) { A.idle += dt; if (A.idle > 5.5) startAuth(true, null); return; }
    if (A.ph === 1) {
      for (let i = 0; i < NPIN; i++) mech.pin[i] = mech.pinFrom[i] + (mech.pinTo[i] - mech.pinFrom[i]) * easeOut(clamp01((A.t - i * .034) / .24));
      if (A.t > NPIN * .034 + .36) {
        A.t = 0; mech.plugFrom = mech.plug;
        if (A.ok) A.ph = 2;
        else { A.ph = 4; mech.shearFlash = 1; mech.no++; if (A.pkt) kill(A.pkt, true); }
      }
    } else if (A.ph === 2) {
      const p = clamp01(A.t / .5);
      mech.plug = mech.plugFrom + TAU / NPIN * easeInOut(p);
      if (p >= 1) { if (A.pkt) { mech.ok++; A.pkt.hold = false; } scatter(); }
    } else if (A.ph === 4) {
      const p = clamp01(A.t / .45);
      mech.plug = mech.plugFrom + Math.sin(p * Math.PI * 5) * .03 * (1 - p);
      if (p >= 1) { mech.plug = mech.plugFrom; scatter(); }
    } else {
      const p = clamp01(A.t / .42);
      for (let i = 0; i < NPIN; i++) mech.pin[i] = mech.pinFrom[i] + (mech.pinTo[i] - mech.pinFrom[i]) * easeOut(p);
      if (p >= 1) { A.ph = 0; A.idle = 0; A.pkt = null; }
    }
  }
  function stepMech(dt) {
    mech.beam = (mech.beam + dt * TAU / 4.6) % TAU;
    mech.carrier += dt * .05;
    mech.led *= Math.exp(-dt * 3);
    mech.shearFlash *= Math.exp(-dt * 2.6);
    for (let i = 0; i < 12; i++) mech.portFlash[i] *= Math.exp(-dt * 3.4);
    for (let i = 0; i < NEP; i++) { mech.blink[i] *= Math.exp(-dt * 5); if (mech.quar[i] > 0) mech.quar[i] = Math.max(0, mech.quar[i] - dt); }
    mech.rotT += dt;
    if (mech.rotT > .9) { mech.rotT = 0; mech.rotAt += 1; if (mech.rotAt % 8 === 0) mech.rotBt -= 1; }
    const kr = 1 - Math.exp(-dt * 16);
    mech.rotA += (mech.rotAt - mech.rotA) * kr; mech.rotB += (mech.rotBt - mech.rotB) * kr;
    stepAuth(dt);
  }

  /* ── Paketler: dışarıdan gelir, her halkada sınanır; çoğu çekirdeğe varamaz ── */
  const pk = [];
  let spawnAcc = 0, scanT = 5;
  const scanQ = [];
  function kill(p, denied) { p.st = denied ? 1 : 2; p.life = 0; p.hold = false; }
  function spawnPacket(port, fast) {
    const k0 = clamp(Math.ceil(pos - .3), 0, N - 1);
    const p = { k: k0, u: 1.05, a: Math.random() * TAU, v: fast ? 2.4 : 1.05 + Math.random() * .35, fate: 9, st: 0, life: 0, hold: false, enc: false, port: -1, seen: false, ping: 0, authd: false, fast: !!fast };
    if (k0 === 0) {
      p.port = port != null ? port : Math.random() < .4 ? OPEN : (Math.random() * 12) | 0;
      p.a = pa(p.port) + rotOf(0); p.u = 1.12;
    }
    if (k0 === 0 && p.port !== OPEN) p.fate = 0;
    else if (fast) p.fate = 1;                             // tarama, açık portu bulsa da IDS'e yakalanır
    else for (let j = Math.max(1, k0); j <= 3; j++) if (Math.random() < DROP[j]) { p.fate = j; break; }
    pk.push(p);
  }
  function stepPackets(dt) {
    const k0 = clamp(Math.ceil(pos - .3), 0, N - 1);
    if (k0 === 0 && !cam) { // port taraması: arada bir bütün portlar sırayla yoklanır
      scanT -= dt;
      if (scanT <= 0) { scanT = 9 + Math.random() * 5; const s = (Math.random() * 12) | 0; for (let i = 0; i < 12; i++) scanQ.push({ t: i * .06, port: (s + i) % 12 }); }
    }
    for (let i = scanQ.length - 1; i >= 0; i--) { scanQ[i].t -= dt; if (scanQ[i].t <= 0) { if (k0 === 0) spawnPacket(scanQ[i].port, true); scanQ.splice(i, 1); } }
    spawnAcc += dt * RATE[k0] * (cam ? .4 : 1);
    while (spawnAcc > 1) { spawnAcc -= 1; if (pk.length < 18 && pos < N - 1.02) spawnPacket(); }
    const beam = mech.beam + rotOf(1), r2 = ring2Rot(), cell = TAU / NEP;
    for (let i = pk.length - 1; i >= 0; i--) {
      const p = pk[i];
      p.life += dt;
      if (p.st) { if (p.life > .6) pk.splice(i, 1); continue; }
      if (p.k - pos < -.5) { pk.splice(i, 1); continue; }
      p.ping = Math.max(0, p.ping - dt * 3);
      let v = p.v;
      if (p.k === 1) {
        if (p.fate === 1 && !p.fast) v = Math.min(v, .45);
        if (p.u < .8 && p.u > .24 && Math.abs(angDiff(beam, p.a)) < .08) { // ışın paketin üzerinden geçti
          if (p.fate === 1) { mech.alerts++; kill(p, true); continue; }
          if (!p.seen) { p.seen = true; p.ping = 1; }
        }
        if (p.fate === 1 && p.u < .36) v = 0;              // şüpheli paket taranana kadar bekletilir
      }
      if (p.hold) v = 0;
      const u0 = p.u;
      p.u -= v * dt;
      if (p.k === 0) {
        if (p.fate === 0 && p.u <= .62) { p.u = .62; mech.portFlash[p.port] = 1; mech.denied++; kill(p, true); continue; }
        if (p.port === OPEN && u0 > .5 && p.u <= .5) mech.led = 1;
      } else if (p.k === 2 && u0 > .45 && p.u <= .45) {
        const m = mod(Math.round((p.a - r2) / cell), NEP);
        mech.blink[m] = 1;
        if (p.fate === 2) { mech.quar[m] = QT; kill(p, true); continue; }
      } else if (p.k === 3 && !p.authd && p.u <= SHEAR + .1) {
        p.u = SHEAR + .1;                                  // kilit meşgulse sırada bekler
        if (auth.ph === 0) { p.authd = true; p.hold = true; startAuth(p.fate !== 3, p); }
      } else if (p.k === 4 && u0 > .5 && p.u <= .5) { p.enc = true; mech.rotAt += 3; }
      if (p.u <= 0) {
        if (p.k >= N - 1) { pulse = Math.min(1, pulse + .4); kill(p, false); continue; }   // kasaya ulaştı
        p.k++; p.u = 1;
      }
    }
  }
  function drawPackets() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of pk) {
      const rel = p.k - pos;
      if (rel < -.5) continue;
      const r = rIn(p.k), w = r * (B - 1), rad = r + p.u * w, al = ringAlpha(rel) * clamp01(p.life * 5);
      const cs = Math.cos(p.a), sn = Math.sin(p.a), x = cs * rad, y = sn * rad, size = clamp(w * .042, .8, 2.3);
      if (p.st === 0) {
        const col = p.enc ? AMBER : BONE, tl = p.hold ? 0 : Math.min(w * .22, 12);
        ctx.strokeStyle = rgba(col, .5 * al); ctx.lineWidth = size * .9;
        ctx.beginPath(); ctx.moveTo(cs * (rad + tl), sn * (rad + tl)); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = rgba(col, al); ctx.beginPath();
        if (p.enc) { const d = size * 1.5; ctx.moveTo(x, y - d); ctx.lineTo(x + d, y); ctx.lineTo(x, y + d); ctx.lineTo(x - d, y); ctx.closePath(); } // şifrelenmiş paket
        else ctx.arc(x, y, size, 0, TAU);
        ctx.fill();
        if (p.ping > 0) { ctx.strokeStyle = rgba(BONE, p.ping * .8 * al); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, size + (1 - p.ping) * 7, 0, TAU); ctx.stroke(); }
      } else {
        const q = p.life / .6, col = p.st === 1 ? DENY : AMBER, a2 = ringAlpha(rel) * (1 - q);
        ctx.strokeStyle = rgba(col, a2); ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.arc(x, y, size + q * Math.max(5, w * .16), 0, TAU); ctx.stroke();
        ctx.fillStyle = rgba(col, a2); ctx.beginPath(); ctx.arc(x, y, size * (1.3 - q * .6), 0, TAU); ctx.fill();
      }
    }
    ctx.restore();
  }

  const LABEL = LAYERS.map(L => `${L.n} · ${L.name} · ${L.ctl}`);
  function readout(k) { // çerçevenin altındaki canlı gösterge: o halkanın şu anki durumu
    switch (k) {
      case 0: return `1 PORT AÇIK · 11 KAPALI · ${mech.denied} RET`;
      case 1: return `4 BÖLGE · IDS TARIYOR · ${mech.alerts} UYARI`;
      case 2: { let q = 0; for (let i = 0; i < NEP; i++) if (mech.quar[i] > 0) q++; return `${NEP} UÇ NOKTA · ${q} KARANTİNADA`; }
      case 3: return `PİMLİ KİLİT · ${mech.ok} KABUL · ${mech.no} RET`;
      case 4: return `DÜZ ${HEX2[mod(-Math.round(mech.rotA), NCELL)]} · ŞİFRELİ ${perm[mod(-Math.round(mech.rotB), NCELL)]}`;
      default: return cv.hex ? `SHA-256 ${cv.hex.slice(0, 8).toUpperCase()} ${cv.hex.slice(8, 16).toUpperCase()}` : 'SHA-256';
    }
  }

  function draw(t) {
    const { cx, cy, R, w, h: hh } = eye;
    if (!R) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, hh);
    const lvl = coreLevel * (1 + pulse * .4);
    const near = Math.pow(Q, N - 1 - pos);                 // çekirdeğe yakınlık (çekirdekte 1)
    const iris = clamp01(irisAt(pos) * easeOut(clamp01((intro - .62) / .38)) + pulse * .025);
    ctx.save();
    ctx.translate(cx, cy);

    // 1) kasanın içi ve iris
    const r5 = rIn(N - 1) * (1 + (1 - asm[N - 1]) * .1);
    ctx.save();
    ctx.beginPath(); ctx.arc(0, 0, r5, 0, TAU); ctx.clip();
    coreInterior(r5, t, lvl);
    drawIris(r5, iris);
    ctx.restore();

    // 2) halkalar, içten dışa
    for (let k = N - 1; k >= 0; k--) {
      const al = ringAlpha(k - pos) * asm[k];
      if (al < .01) continue;
      const r = rIn(k) * (1 + (1 - asm[k]) * .1), spin = (1 - asm[k]) * (k % 2 ? .8 : -.8);
      const rot = (k === 2 ? ring2Rot() : rotOf(k)) + spin;
      ctx.save();
      ctx.globalAlpha = al;
      halo(r * B);
      plate(k, r, r * B, t);
      ctx.rotate(rot);
      RING[k](r, r * (B - 1), RAMP[k], t, rot);
      ctx.restore();
      if (k === 1) { ctx.save(); ctx.globalAlpha = al * asm[2]; gearset(r); ctx.restore(); }
    }

    // 3) paketler
    if (!RM) drawPackets();

    // 4) çekirdeğin ışığı: iristen sızar, iç halkalara vurur; çekirdeğe yaklaştıkça karta taşar
    if (lvl > .01) {
      const gr = Math.min(R * B * 1.25, r5 * (3 + 3 * iris));
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, gr);
      g.addColorStop(0, `rgba(255,176,80,${(.3 * lvl * (.3 + .7 * iris)).toFixed(3)})`);
      g.addColorStop(.4, `rgba(255,150,60,${(.1 * lvl * (.3 + .7 * iris)).toFixed(3)})`);
      g.addColorStop(1, 'rgba(255,140,50,0)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, gr, 0, TAU); ctx.fill();
      const ro = R * B, sp = ctx.createRadialGradient(0, 0, ro * .96, 0, 0, ro * (1.25 + near * .5));
      sp.addColorStop(0, `rgba(255,170,70,${((.02 + .1 * near * near) * lvl).toFixed(3)})`);
      sp.addColorStop(1, 'rgba(255,170,70,0)');
      annulus(ro * .96, ro * (1.25 + near * .5)); ctx.fillStyle = sp; ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }

    // 5) çerçevedeki yazıtlar: üstte katman ve kontrol, altta o halkanın canlı durumu
    const veil = easeOut(clamp01(intro * 1.8));
    for (let k = 0; k < N; k++) {
      const rel = k - pos, a = clamp01(1 - Math.abs(rel) / .42);
      if (a <= .01) continue;
      const ro = rIn(k) * B, px = clamp(ro * .05, 7.5, 10.5), al = a * a * veil * asm[k], rr = ro + px * 1.2;
      arcText(LABEL[k], rr, -Math.PI / 2 + rel * .5, px, RAMP[k], .95 * al, false);
      arcText(readout(k), rr, Math.PI / 2 + rel * .5, px * .9, mix(RAMP[k], BONE, .2), .72 * al, true);
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
    const kt = 1 - Math.exp(-dt * (idle ? 2.2 : 6));
    tilt.x += ((idle ? 0 : ptr.x) - tilt.x) * kt; tilt.y += ((idle ? 0 : ptr.y) - tilt.y) * kt;

    if (intro < 1) intro = Math.min(1, intro + dt / 2.7);
    for (let k = 0; k < N; k++) asm[k] = easeOut(clamp01((intro * (N + 2.4) - k) / 2.4));   // halkalar dıştan içe yerine oturur
    coreLevel = easeOut(clamp01((intro - .6) / .4));
    pulse *= Math.exp(-dt * 2.4);
    stepMech(dt);
    stepPackets(dt);

    // Metin okunurken kart yerinde durur: stil yalnızca eğim gerçekten değişince yazılır.
    const tf = `rotateX(${(-tilt.y * 3.6).toFixed(2)}deg) rotateY(${(tilt.x * 4.4).toFixed(2)}deg)`;
    if (tf !== tiltSent) {
      tiltSent = tf;
      card.style.transform = tf;
      card.style.setProperty('--sx', (50 + tilt.x * 38).toFixed(1) + '%');
      card.style.setProperty('--sy', (38 + tilt.y * 38).toFixed(1) + '%');
    }
  }
  let emaMs = 16, slowFor = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const raw = now - last || 16, dt = Math.min(.05, raw / 1000);
    last = now; clock += dt;
    // Kare süresi uzun süre 38 ms'nin üstünde kalırsa (yaklaşık 26 kare/sn altı) tuval çözünürlüğü bir kademe düşer.
    emaMs += (Math.min(raw, 120) - emaMs) * .06;
    if (emaMs > 38 && intro >= 1 && !cam && dprCap > 1) {
      slowFor += dt;
      if (slowFor > 2) { dprCap = Math.max(1, dprCap - .5); slowFor = 0; emaMs = 20; measure(); }
    } else slowFor = 0;
    step(dt, now);
    draw(clock);
  }
  function render() { draw(0); } // hareket azaltılmışken tek kare
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
    if (RM) { stop(); intro = 1; coreLevel = 1; asm.fill(1); cam = null; pos = cur; card.style.transform = ''; tiltSent = ''; tilt.x = tilt.y = 0; render(); }
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
