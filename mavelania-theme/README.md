# Mavelania – Shopify teması (mağaza kurgusu)

mavelania.com temasının e-ticaret odaklı sürümü. İlk commit, sitenin 10 Kasım 2026
tarihli tema dışa aktarımıdır; sonraki commit'ler yapılan değişikliklerdir, yani
`git diff` ile neyin değiştiği satır satır görülebilir.

Kurgu, önde gelen deri ürün mağazalarının (Bellroy, Polène, Cuyana, Aspinal of London,
Leatherology gibi) ortak kalıplarını izler: ortada marka, solda mega menülü kategori
navigasyonu, tam genişlik hero, kategori görselleri, ürün karuselleri, renk noktalı
ürün kartları, yan çekmece sepet ve satın almaya odaklı ürün sayfası. Hiçbir sitenin
tasarımı, görseli ya da metni kopyalanmadı; yalnızca bu yerleşim kalıpları esas alındı.

**Logo ve "Mavelania" yazısı değiştirilmedi.** Başlıkta ve alt bilgide orijinal
işaretleme (`.mv-brand` / `.brandlock`) ve orijinal stil kuralları kullanılıyor; ölçüler
canlı sitedekiyle aynı (masaüstü: amblem 49×49, yazı 180×47; mobil: 42×42, 158×39).

## Mağazaya yükleme

1. Bu klasörün içindeki `assets`, `config`, `layout`, `locales`, `sections`,
   `snippets`, `templates` klasörlerini tek bir zip dosyası yapın (klasörler zip'in
   kökünde olmalı, `README.md` dahil edilmemeli).
2. Shopify yönetim paneli → **Online Store → Themes → Add theme → Upload zip file**.
3. Tema, yayındaki temaya dokunmadan "yayınlanmamış" olarak eklenir. **Preview** ile
   kontrol edin, memnunsanız **Publish** deyin. Eski tema listede kalır; istediğiniz
   an geri dönebilirsiniz.

## Görsel kimlik: üç bölüm

Ana sayfa üç bölümden oluşur; her bölüm bir ana ürüne ayrılmıştır ve kendi renk dünyasına sahiptir.
Kaydırdıkça sayfa zemini bir bölümden diğerine yumuşakça geçer (1,1 sn):

| Bölüm | Ürün | Zemin |
| --- | --- | --- |
| I | Çantalar | Krem `#f6f1e8` |
| II | Cüzdanlar | Kahve `#3a2a21` |
| III | Kartlıklar | Yeşil `#2f3b32` |

Hakkımızda sayfası da aynı üç renkte üç inançla ilerler. Ürün kartları her zeminde aynı fildişi
etiket görünümünü korur. Metinler ve bölüm başlıkları tema düzenleyicide **Home: chapters** altındadır.

Sitede tek iletişim adresi vardır: `contact_email` ayarı (info@mavelania.com). Başlık, alt bilgi,
ürün sayfası, SSS ve Hakkımızda hep bu ayarı okur.

## Marka kurgusu: "Crafted with Intention. Made Personal."

- **Navigasyon:** Home · Shop (Bags / Wallets / Card Holders menüsü) · Personalize Your Piece · About Mavelania · Contact.
- **Slider:** 1. çanta (her zaman ilk), 2. cüzdan, 3. kartlık. Telefon kılıfı slider'da yok.
  3. slayt, seçilen kartlığın ürün verisinde kişiselleştirme varsa "Your Initials. Your Identity." /
  "Personalize your piece", yoksa "Small in Size. Considered in Detail." / "Explore card holders" gösterir.
- **Ana sayfa:** slider → marka cümlesi ve iki düğme → kayan şerit → Selected Essentials (tam 3 ürün)
  → Make It Yours → Bags / Wallets / Card Holders → (indirim varsa) fırsatlar → Our Philosophy
  → Who is Mavelania? → hizmet bilgileri → SSS → bülten.
- **Selected Essentials:** tema düzenleyicide **Home: brand** bölümünden üç ürün seçilir
  (varsayılan: Odette Leather Tote Bag, Everett Leather Zip Wallet, Lior Leather Card Holder).

## Kişiselleştirme nasıl çalışır

Kişiselleştirme **yalnızca ürün verisi bunu söylüyorsa** gösterilir. Kaynak sırası:

1. Ürün metafield'ı `custom.personalization` (metin), örn. `Laser and Embossed (Silver | Gold | Black)`
2. Ürün açıklamasındaki `Personalization: ...` satırı (bugün katalogda böyle yazılı)
3. Ürün etiketi `personalizable` (yöntem/renk listelemeden)

Yöntemler (Laser engraving / Embossing / Stamping) ve renkler (Silver, Gold, Transparent, Black,
Red, White, Blind) yalnızca bu metinde geçiyorsa sunulur. Müşterinin metni, yöntemi ve rengi
sepete, ödeme sayfasına ve Shopify'daki siparişe **satır özelliği** olarak geçer.

Bugün katalogda kişiselleştirme yazan ürünler: Heart Leather Bag Charm, Markora Bookmark,
Lined Leather Desk Mat, Amanda Jewelry Box, Sonat ve F360 telefon kılıfları. **Hiçbir çanta,
cüzdan veya kartlığın** verisinde kişiselleştirme yok; o ürünlerde sunmak istiyorsanız ürüne
yukarıdaki metafield'ı ya da açıklama satırını ekleyin, tema otomatik gösterir.

"Personalize Your Piece" sayfası `/collections/all?view=personalize` adresindedir (sayfa
oluşturmak gerekmez). İsterseniz `personalize` adlı bir sayfa açıp **page.personalize**
şablonunu seçin; menü otomatik ona yönlenir.

## Satışa dönük katman

- **Sepete ekle düğmesi** sayfadaki en dikkat çekici renkte (turuncu); ürün sayfası, sabit
  satın alma çubuğu, mobil çubuk, hızlı ekleme, set ve ödeme düğmelerinde aynı renk.
- **Hemen al (Buy now):** seçili varyantı (ve açılan ek ürünleri) Shopify'ın sepet
  bağlantısıyla **doğrudan ödeme sayfasına** götürür; müşteri üyelik adımı olmadan
  iletişim ve teslimat bilgilerini girer. Bunun çalışması için Shopify'da
  **Settings → Customer accounts** altında girişin zorunlu olmaması gerekir; zorunluysa
  Shopify ödeme öncesi giriş ister ve tema bunu değiştiremez. "No account needed" notu
  yalnızca mağaza misafir ödemeye izin veriyorsa görünür.
- **Ek ürünler (add-ons):** satın alma kutusunda aç/kapa anahtarlı gerçek ürünler. Açılanlar
  ana ürünle birlikte sepete eklenir, toplam anında güncellenir. Varsayılan olarak
  Accessories koleksiyonunun en uygun fiyatlı stoktaki ürünleri gelir; ürün bazında seçmek
  için `custom.addons` (ürün listesi) metafield'ı kullanılır.
- **Set (bundle):** "Buy it as a set": ürün + ona uyan iki parça, tek düğmeyle sepete.
  Parçalar işaret kaldırılarak çıkarılabilir, renk seçilebilir. Ürün bazında seçmek için
  `custom.bundle_products` metafield'ı. Sete indirim tanımlamak isterseniz Shopify'da bir
  indirim kodu oluşturup tema düzenleyicide **Product info → Bundle discount code** alanına
  yazın; kod ödeme sırasında uygulanır. Kod yoksa set için indirim iddia edilmez.
- **İndirim gösterimi:** `-%` rozeti, üstü çizili eski fiyat, "You save …" tutarı (kartlarda
  ve ürün sayfasında) ve ana sayfada indirimli ürünler şeridi. Hepsi gerçek compare-at
  fiyatından hesaplanır; fiyat dosyaları için `../black-friday/README.md`.
- **Black Friday şeridi:** başlangıç tarihine kadar geri sayım, kampanya süresince
  "up to X% off" (X gerçek fiyatlardan hesaplanır). Tarihler tema düzenleyicide.
- **Açıklama:** ürün bilgisi ayrı bir bölümde; açıklamanın ilk maddeleri fiyatın yanında
  özet olarak, açıklamanın sonundaki "Brand: … / Material: …" satırları özellik tablosu
  olarak gösterilir; kargo, iade, bakım ve ödeme yanıtları belirgin +/− düğmeli kutularda.
- **Boşluklar** e-ticarete göre sıkılaştırıldı: daha kısa hero, daha küçük bölüm aralıkları,
  geniş ekranda 5'li ürün şeridi.

## Sayfa sayfa kurgu

| Alan | İçerik |
| --- | --- |
| Üst şerit | Kargo duyurusu, iade süresi, güvenli ödeme (mobilde sırayla döner) |
| Başlık | Solda kategoriler (üzerine gelince **mega menü**: koleksiyon tanıtımı, ürün listesi, 3 ürün görseli), ortada orijinal logo, sağda ülke/para birimi, SSS, arama, hesap, favoriler, sepet. Aşağı kaydırınca gizlenir, yukarı kaydırınca geri gelir |
| Arama | Simgeye basınca başlığın altında açılan panel: canlı ürün önerileri + kategori kısayolları |
| Ana sayfa | Tam genişlik hero (her görselin kendi "Shop …" düğmesi) → güven şeridi → 4 kategori görseli (ürün sayısı + başlangıç fiyatı) → öne çıkanlar karuseli → cüzdan vitrini → kategori sekmeli karusel → telefon kılıfı bandı → "Neden Mavelania" → yaşam tarzı bandı → SSS → son gezilenler → bülten |
| Ürün kartı | İkinci görsel, rozetler (indirim / yeni / tükendi), **renk noktaları** (tıklayınca karttaki görsel o renge döner, kart o rengi açar), hızlı sepete ekleme |
| Koleksiyon | Kısa başlık, ürün sayısı, kategori geçiş düğmeleri, filtre/sıralama, 4'lü ızgara |
| Ürün sayfası | Solda dikey küçük resimler, tıklayınca **tam ekran büyütme**; sağda fiyat → stok → renk → adet + sepete ekle → güven kutusu → ödeme logoları → kargo / iade / bakım akordeonları. Düğme ekrandan çıkınca altta **sabit satın alma çubuğu** (mobilde zaten vardı) |
| Sepet çekmecesi | Her sayfadan açılır; adet değiştir / sil, "Goes well with" önerileri (Shopify'ın kendi öneri motoru), güvenli ödeme |
| Sepet sayfası | Ürün listesi + sipariş özeti kartı |
| Alt bilgi | Bülten bandı, orijinal logo, mağaza / yardım / şirket linkleri, sosyal hesaplar, ödeme logoları |

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
- **"Goes well with"** Shopify'ın ürün öneri uç noktasından gelir.
- **"From $…" fiyatları ve ürün sayıları** koleksiyonlardan canlı hesaplanır.

## Tema düzenleyiciden ayarlanabilenler

- **Home: shop** → Öne çıkan koleksiyon, başlık, ürün sayısı. Koleksiyon seçilmezse
  her kategoriden stoktaki ilk ürünler gösterilir.
- **Promo banner** → görsel, metinler, düğme.
- **Home: trust and help** → "Neden Mavelania", yaşam tarzı bandı ve SSS bloğu
  ayrı ayrı açılıp kapatılabilir.
- **Announcement bar** → kampanya adı, başlangıç/bitiş tarihi ve bağlantısı; iade süresi ve güvenli ödeme mesajları.
- **Product info** → az stok uyarısı ve eşiği, ek ürünler (koleksiyon, adet), set (aç/kapa, indirim kodu ve metni).
- **Footer** → bülten kaydı (aboneler Customers altında `newsletter` etiketiyle saklanır).

## Dosyalar

- `assets/mavelania-shop.css`, `assets/mavelania-shop.js` – mağaza katmanı
  (tüm yeni sınıflar `ms-` ile başlar, eski `mv-` kurallarıyla çakışmaz).
- `assets/mavelania-colors.js` – renk adı → renk eşlemesi; ürün sayfası ve ürün
  kartları aynı haritayı kullanır.
- `snippets/product-card.liquid` – tüm ızgara ve karusellerde kullanılan ürün kartı.
- `snippets/cart-drawer.liquid` – sepet çekmecesi, hızlı ekleme penceresi, bildirim.
- `snippets/product-addons.liquid`, `product-addon-row.liquid` – ek ürünler.
- `snippets/product-bundle.liquid`, `product-bundle-item.liquid` – set.
- `snippets/product-info.liquid` – ürün bilgisi, özellik tablosu, aç/kapa kutuları.
- `sections/announcement-bar.liquid` – üst şerit ve kampanya (Black Friday) şeridi.
- `snippets/trust-strip.liquid`, `payment-icons.liquid`, `rating.liquid`,
  `recently-viewed.liquid`, `icon.liquid`.
- `sections/header.liquid` – başlık, mega menü, arama paneli, mobil menü.
- `sections/mavelania-home.liquid`, `sections/home-trust.liquid` – ana sayfa.
