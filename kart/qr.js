/*
 * qr.js — bağımsız, küçük bir QR kod üretici.
 * Site dışarıdan kütüphane yüklemediği için burada. Bayt kipi, hata düzeltme düzeyi M, sürüm 1–10
 * (213 bayta kadar; bir site adresi için fazlasıyla yeter).
 * KartQR.matrix("metin") kare bir 0/1 matrisi döndürür (1 = koyu modül); metin sığmazsa null.
 */
(() => {
  'use strict';

  // Sürüm başına: [blok başına hata düzeltme sözcüğü, 1. grup blok sayısı, 1. grup veri sözcüğü, 2. grup blok sayısı, 2. grup veri sözcüğü]
  const BLOCKS = [null,
    [10, 1, 16, 0, 0], [16, 1, 28, 0, 0], [26, 1, 44, 0, 0], [18, 2, 32, 0, 0], [24, 2, 43, 0, 0],
    [16, 4, 27, 0, 0], [18, 4, 31, 0, 0], [22, 2, 38, 2, 39], [22, 3, 36, 2, 37], [26, 4, 43, 1, 44]];
  // Hizalama desenlerinin merkezleri
  const ALIGN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];

  // GF(256) çarpımı ve Reed-Solomon
  function mul(x, y) {
    let z = 0;
    for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; }
    return z;
  }
  function rsDivisor(deg) {
    const r = new Array(deg).fill(0);
    r[deg - 1] = 1;
    let root = 1;
    for (let i = 0; i < deg; i++) {
      for (let j = 0; j < deg; j++) { r[j] = mul(r[j], root); if (j + 1 < deg) r[j] ^= r[j + 1]; }
      root = mul(root, 2);
    }
    return r;
  }
  function rsRemainder(data, div) {
    const r = div.map(() => 0);
    for (const b of data) {
      const f = b ^ r.shift();
      r.push(0);
      for (let i = 0; i < div.length; i++) r[i] ^= mul(div[i], f);
    }
    return r;
  }

  const MASK = [
    (x, y) => (x + y) % 2 === 0,
    (x, y) => y % 2 === 0,
    (x, y) => x % 3 === 0,
    (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
    (x, y) => (x * y) % 2 + (x * y) % 3 === 0,
    (x, y) => ((x * y) % 2 + (x * y) % 3) % 2 === 0,
    (x, y) => ((x + y) % 2 + (x * y) % 3) % 2 === 0,
  ];

  // Okunabilirlik cezası: uzun diziler, 2x2 bloklar, bulucu desenine benzeyen diziler, koyu/açık dengesi
  function penalty(m, size) {
    let p = 0, dark = 0;
    for (let a = 0; a < size; a++) {
      for (let dir = 0; dir < 2; dir++) {
        let run = 0, prev = -1, hist = 0;
        for (let b = 0; b < size; b++) {
          const v = dir ? m[b][a] : m[a][b];
          if (v === prev) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else { run = 1; prev = v; }
          hist = ((hist << 1) | v) & 0x7FF;
          if (b >= 10 && (hist === 0x5D || hist === 0x5D0)) p += 40;
        }
      }
    }
    for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) {
      const v = m[y][x];
      if (v === m[y][x + 1] && v === m[y + 1][x] && v === m[y + 1][x + 1]) p += 3;
    }
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) dark += m[y][x];
    return p + Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
  }

  function matrix(text) {
    const bytes = Array.from(new TextEncoder().encode(String(text)));
    let ver = 0;
    for (let v = 1; v <= 10; v++) {
      const b = BLOCKS[v], cap = b[1] * b[2] + b[3] * b[4];
      if (bytes.length <= Math.floor((cap * 8 - 4 - (v < 10 ? 8 : 16)) / 8)) { ver = v; break; }
    }
    if (!ver || !bytes.length) return null;
    const [ecLen, n1, d1, n2, d2] = BLOCKS[ver], dataCw = n1 * d1 + n2 * d2;

    // Bit dizisi: kip (bayt), uzunluk, veri, sonlandırıcı, dolgu
    const bits = [];
    const put = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    put(4, 4);
    put(bytes.length, ver < 10 ? 8 : 16);
    for (const b of bytes) put(b, 8);
    put(0, Math.min(4, dataCw * 8 - bits.length));
    put(0, (8 - bits.length % 8) % 8);
    for (let pad = 0xEC; bits.length < dataCw * 8; pad ^= 0xEC ^ 0x11) put(pad, 8);
    const data = [];
    for (let i = 0; i < bits.length; i += 8) { let v = 0; for (let j = 0; j < 8; j++) v = (v << 1) | bits[i + j]; data.push(v); }

    // Bloklara böl, hata düzeltme sözcüklerini ekle, sütun sütun harmanla
    const div = rsDivisor(ecLen), blocks = [];
    for (let i = 0, k = 0; i < n1 + n2; i++) {
      const len = i < n1 ? d1 : d2, d = data.slice(k, k + len);
      k += len;
      blocks.push({ d, e: rsRemainder(d, div) });
    }
    const out = [];
    for (let i = 0; i < Math.max(d1, d2); i++) for (const b of blocks) if (i < b.d.length) out.push(b.d[i]);
    for (let i = 0; i < ecLen; i++) for (const b of blocks) out.push(b.e[i]);

    // Matris: işlev desenleri
    const size = ver * 4 + 17;
    const m = Array.from({ length: size }, () => new Uint8Array(size));
    const fn = Array.from({ length: size }, () => new Uint8Array(size));
    const set = (x, y, dark) => { m[y][x] = dark ? 1 : 0; fn[y][x] = 1; };
    for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    const finder = (cx, cy) => {
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx, y = cy + dy, dist = Math.max(Math.abs(dx), Math.abs(dy));
        if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, dist !== 2 && dist !== 4);
      }
    };
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    const al = ALIGN[ver], last = al.length - 1;
    for (let i = 0; i <= last; i++) for (let j = 0; j <= last; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(al[i] + dx, al[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
    const format = mask => { // biçim bilgisi: düzey M (00) + maske, BCH(15,5)
      let rem = mask;
      for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      const fb = ((mask << 10) | rem) ^ 0x5412, bit = i => ((fb >>> i) & 1) === 1;
      for (let i = 0; i <= 5; i++) set(8, i, bit(i));
      set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
      for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
      for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
      for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
      set(8, size - 8, true);
    };
    format(0);
    if (ver >= 7) { // sürüm bilgisi, BCH(18,6)
      let rem = ver;
      for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
      const vb = (ver << 12) | rem;
      for (let i = 0; i < 18; i++) {
        const dark = ((vb >>> i) & 1) === 1, a = size - 11 + i % 3, b = Math.floor(i / 3);
        set(a, b, dark); set(b, a, dark);
      }
    }

    // Veri: sağ alttan başlayıp ikişer sütun hâlinde zikzak
    let bi = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) {
        const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert;
        if (!fn[y][x] && bi < out.length * 8) { m[y][x] = (out[bi >>> 3] >>> (7 - (bi & 7))) & 1; bi++; }
      }
    }

    // Sekiz maskeden cezası en düşük olanı seç
    const apply = k => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fn[y][x] && MASK[k](x, y)) m[y][x] ^= 1; };
    let best = 0, bestScore = Infinity;
    for (let k = 0; k < 8; k++) {
      apply(k); format(k);
      const s = penalty(m, size);
      if (s < bestScore) { bestScore = s; best = k; }
      apply(k);
    }
    apply(best); format(best);
    return m;
  }

  window.KartQR = { matrix };
})();
