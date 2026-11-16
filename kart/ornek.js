/*
 * ÖRNEK İÇERİK — yalnızca adresin sonuna ?ornek eklendiğinde kullanılır.
 * Kartın dolu hâlini görmen için var; gerçek bilgilerin icerik.js dosyasında.
 * İstersen bu dosyayı ve index.html'deki satırını silebilirsin.
 */
window.KART_ORNEK = {
  unvan: "Siber Güvenlik Uzmanı",
  konum: "İstanbul",
  baglantilar: [
    { ad: "E-POSTA",  deger: "ad@alanadi.com" },
    { ad: "LINKEDIN", deger: "/in/kullanici-adi", url: "https://www.linkedin.com/" },
    { ad: "GITHUB",   deger: "@kullanici-adi", url: "https://github.com/" },
    { ad: "WEB",      deger: "alanadi.com", url: "https://example.com/" },
  ],
  yetkinlikler: [
    { baslik: "SAVUNMA",  ogeler: ["SIEM", "Olay müdahalesi", "Tehdit avcılığı", "Sıkılaştırma"] },
    { baslik: "SALDIRI",  ogeler: ["Sızma testi", "Web güvenliği", "Zafiyet analizi"] },
    { baslik: "ALTYAPI",  ogeler: ["Linux", "Ağ güvenliği", "Python", "Bulut"] },
  ],
  calismalar: [
    { etiket: "2026", ad: "Proje adı", aciklama: "Hangi sorunu çözdüğünü tek cümleyle yaz.", url: "https://example.com/" },
    { etiket: "2025", ad: "İkinci proje", aciklama: "Kullandığın yöntemi ve sonucu yaz." },
    { etiket: "2024", ad: "Üçüncü proje", aciklama: "Varsa ölçülebilir bir sonuç ekle." },
  ],
  kayit: [
    { donem: "2025 —",      baslik: "Unvan",           yer: "Kurum adı" },
    { donem: "2023 – 2025", baslik: "Önceki unvan",    yer: "Kurum adı" },
    { donem: "2023",        baslik: "Sertifika adı",   yer: "Veren kurum" },
    { donem: "2019 – 2023", baslik: "Bölüm, lisans",   yer: "Üniversite adı" },
  ],
};
