/*
 * ─────────────────────────────────────────────────────────────
 *  KARTIN İÇERİĞİ — sitede görünen her şey bu dosyadan gelir.
 * ─────────────────────────────────────────────────────────────
 *  • Tırnakların içini doldurman yeterli; başka dosyaya dokunmana gerek yok.
 *  • Boş bıraktığın her alan sitede sansürlü (████) görünür.
 *    Yani yarım kalan bir bölüm bozuk durmaz, "gizli kayıt" gibi durur.
 *  • CV için: PDF dosyanı bu klasöre "cv.pdf" adıyla koy, o kadar.
 *    Site dosyanın SHA-256 özetini kendisi hesaplayıp gösterir.
 *  • Dolu hâlinin nasıl görüneceğini merak edersen adresin sonuna
 *    ?ornek ekle (örn. index.html?ornek). Örnek veriler ornek.js içinde.
 */
window.KART = {
  /* ── 01 ÇEVRE · Kimlik ─────────────────────────────────── */
  ad: "Yavuz",
  soyad: "Yapar",
  unvan: "Siber Güvenlik",            // adının altındaki satır; örn. "SOC Analisti"
  konum: "",                          // örn. "İstanbul"
  slogan: "Altı katman. Tek çekirdek.", // tek cümle; kendini anlatan bir cümleyle değiştirebilirsin

  /* ── 06 ÇEKİRDEK · Özgeçmiş ────────────────────────────── */
  cv: {
    dosya: "cv.pdf",                   // bu klasördeki PDF'in adı
    indirmeAdi: "Yavuz-Yapar-CV.pdf",  // ziyaretçinin bilgisayarına inen dosyanın adı
  },

  /* ── 02 AĞ · Bağlantılar (en fazla 5 satır) ────────────── */
  // deger: ekranda görünen yazı · url: tıklanınca gidilen adres
  // E-posta için url yazmana gerek yok, adresi deger'e yazman yeterli.
  baglantilar: [
    { ad: "E-POSTA",  deger: "", url: "" },
    { ad: "LINKEDIN", deger: "", url: "" },
    { ad: "GITHUB",   deger: "@yavuzyapar", url: "https://github.com/yavuzyapar" },
    { ad: "WEB",      deger: "", url: "" },
  ],

  /* ── 03 UÇ NOKTA · Yetkinlikler (en fazla 3 grup, grup başına 6 öğe) ── */
  // Örnek: { baslik: "SAVUNMA", ogeler: ["SIEM", "Olay müdahalesi", "Tehdit avcılığı"] }
  yetkinlikler: [],

  /* ── 04 UYGULAMA · Çalışmalar (en fazla 3) ─────────────── */
  // Örnek: { etiket: "2026", ad: "Proje adı", aciklama: "Tek cümleyle ne yaptığın.", url: "https://..." }
  calismalar: [],

  /* ── 05 VERİ · Kayıt: deneyim, eğitim, sertifika (en fazla 4) ── */
  // Örnek: { donem: "2023 – 2025", baslik: "Unvan", yer: "Kurum adı" }
  kayit: [],
};
