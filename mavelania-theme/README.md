# Mavelania – Shopify teması (mağaza görünümü)

mavelania.com temasının e-ticaret odaklı sürümü. İlk commit, sitenin 10 Kasım 2026
tarihli tema dışa aktarımıdır; sonraki commit'ler yapılan değişikliklerdir, yani
`git diff` ile neyin değiştiği satır satır görülebilir.

## Mağazaya yükleme

1. Bu klasörün içindeki `assets`, `config`, `layout`, `locales`, `sections`,
   `snippets`, `templates` klasörlerini tek bir zip dosyası yapın (klasörler zip'in
   kökünde olmalı, `README.md` dahil edilmemeli).
2. Shopify yönetim paneli → **Online Store → Themes → Add theme → Upload zip file**.
3. Tema, yayındaki temaya dokunmadan "yayınlanmamış" olarak eklenir. **Preview** ile
   kontrol edin, memnunsanız **Publish** deyin. Eski tema listede kalır; istediğiniz
   an geri dönebilirsiniz.

## Neler değişti

| Alan | Önce | Şimdi |
| --- | --- | --- |
| Ana sayfa | Ürün ve fiyat göstermeyen görsel vitrin | Kategori kısayolları, slider + 2 kampanya kutusu, güven şeridi, kategoriler, öne çıkan ürünler, kategori sekmeli ürün rafları, promo, "Neden Mavelania", SSS, son gezilenler |
| Başlık | Ortada logo, küçük arama | Büyük arama çubuğu, hesap / favori / sepet, kategori menüsü, kaydırırken yapışkan |
| Ürün kartı | Görsel + isim + fiyat | İndirim / yeni / tükendi rozetleri, ikinci görsel, renk sayısı, **hızlı sepete ekle** |
| Sepet | Sadece ürün sayfasında açılan çekmece | Her sayfada açılan sepet çekmecesi (adet değiştir, sil, güvenli ödeme) |
| Ürün sayfası | Açıklama satın alma düğmesinin üstünde | Fiyat → stok → seçenek → sepete ekle; güven kutusu, ödeme logoları, kargo / iade / bakım akordeonları |
| Koleksiyon | Ekranı kaplayan büyük başlık | Kısa başlık, ürün sayısı, kategori geçiş düğmeleri, 4'lü ızgara |
| Sepet sayfası | Tek sütun liste | Ürün listesi + sipariş özeti kartı |
| Alt bilgi | Logo + 2 sütun | Mağaza / yardım / şirket linkleri, bülten kaydı, ödeme logoları |

## Gösterilen her bilgi gerçektir

Tema hiçbir şeyi uydurmaz; veri yoksa ilgili öğe hiç görünmez.

- **İndirim rozeti** yalnızca üründe "Compare-at price" girilmişse çıkar.
- **"Only X left"** yalnızca Shopify'ın stok takibi yaptığı ve gerçekten az kalan
  varyantlarda çıkar (tema düzenleyicide kapatılabilir / eşik değiştirilebilir).
- **Yıldızlar** yalnızca bir yorum uygulaması (ör. Judge.me, Shopify uyumlu yorum
  uygulamaları) ürüne puan yazdığında çıkar. Uygulama kurulunca kartlarda ve ürün
  sayfasında kendiliğinden görünür.
- **Ödeme logoları** Shopify'da gerçekten açık olan ödeme yöntemleridir.
- **İade süresi** tema ayarındaki `return_window_days` değerinden gelir.

## Tema düzenleyiciden ayarlanabilenler

- **Home: shop** → Öne çıkan koleksiyon, başlık, ürün sayısı. Koleksiyon seçilmezse
  her kategoriden stoktaki ilk ürünler gösterilir.
- **Promo banner** → görsel, metinler, düğme.
- **Home: trust and help** → "Neden Mavelania", yaşam tarzı bandı ve SSS bloğu
  ayrı ayrı açılıp kapatılabilir.
- **Announcement bar** → iade süresi ve güvenli ödeme mesajları.
- **Product info** → az stok uyarısı ve eşiği.
- **Footer** → bülten kaydı (aboneler Customers altında `newsletter` etiketiyle saklanır).

## Dosyalar

- `assets/mavelania-shop.css`, `assets/mavelania-shop.js` – yeni mağaza katmanı
  (tüm yeni sınıflar `ms-` ile başlar, eski `mv-` kurallarıyla çakışmaz).
- `snippets/product-card.liquid` – tüm ızgaralarda kullanılan ortak ürün kartı.
- `snippets/cart-drawer.liquid` – sepet çekmecesi, hızlı ekleme penceresi, bildirim.
- `snippets/trust-strip.liquid`, `payment-icons.liquid`, `rating.liquid`,
  `recently-viewed.liquid`, `icon.liquid`.
- `sections/mavelania-home.liquid`, `sections/home-trust.liquid` – ana sayfa.
