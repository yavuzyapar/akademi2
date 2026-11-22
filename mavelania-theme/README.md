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

## Görsel kimlik: doğal gün ışığı

Sitenin tamamı ana ekran videosundaki doğallıkla kuruludur: keten zemin, olgun buğday tonu bantlar,
deri (konyak) vurgular, tarla yeşili ayrıntılar ve kâğıt tonunda ürün kartları. Kaydırırken renk değişmez;
her bölüm göründüğünde üst kenarına bir kez, deri dikişi gibi kesik bir çizgi "dikilir". İçerik hiçbir zaman
gizlenmez ya da kaymaz; "hareketi azalt" açık olanlarda dikişler baştan çizili durur.

| Rol | Renk |
| --- | --- |
| Zemin (keten) | `#f6f1e7` |
| Bant (buğday) | `#ece3d2` |
| Ürün kartı (kâğıt) | `#fdfaf4` |
| Yazı | `#2a211b` |
| İkincil yazı | `#5a4d42` / `#6f6154` |
| Vurgu ve "Add to bag" (deri) | `#8a4a23`, üzerine gelince `#6f3a1a` |
| "Genuine leather", stokta (tarla yeşili) | `#56603f` |
| İndirim | `#a3412a` |

Bölümler sırayla keten ve buğday zeminde durur (Çantalar keten, imza bölümü buğday, Cüzdanlar buğday,
Kartlıklar keten …). Tüm metinler zemine karşı en az 4,5:1 okunabilirlikte.
Renkleri değiştirmek için: `assets/mavelania-shop.css` → "26 Natural daylight" bloğu ve "19" bloğunun başındaki palet.

Sitede tek iletişim adresi vardır: `contact_email` ayarı (info@mavelania.com). Başlık, alt bilgi,
ürün sayfası, SSS ve Hakkımızda hep bu ayarı okur.

## Marka kurgusu: "Genuine leather. Nothing else."

- **Navigasyon:** Home · Shop (Bags / Wallets / Card Holders menüsü) · Personalize Your Piece · About Mavelania · Contact.
- **Ana sayfa:** açılış fotoğrafı (her ekranda kırpılmadan, tam; geniş ekranda yazılar fotoğrafın sol boş
  duvarında, dar ekranda fotoğrafın altında) → kayan şerit → I Çantalar → **Mavelania imzası** (sizin logonuz ve
  "Mavelania" yazınız + "Genuine leather. Nothing else.") → II Cüzdanlar → III Kartlıklar → e-posta ile
  kişiselleştirme → diğer ürünler → marka ve güven → SSS.
- **Az ürün, ön planda kalite:** her bölümde 4 ürün (masaüstünde tek sıra, telefonda 2×2). Tema düzenleyicide
  **Home: chapters → Products per chapter** ile 2–8 arası ayarlanabilir.
- **Fotoğraflar:** temadaki fotoğraflar orijinal halleriyle kullanılır (yapay netleştirme yok). Daha keskin
  sonuç için tema düzenleyicide **Home: chapters** altından açılış ve bölüm fotoğraflarının orijinal, büyük
  boyutlu hallerini yükleyebilirsiniz.
- Görseller hiçbir yerde kaymaz, yakınlaşmaz ve gölge bırakmaz.

## Ana ekran videosu (banner)

Açılışta sessiz, döngülü bir video oynar (sonu başına yumuşak bir geçişle bağlanır, kesinti görünmez):
bilgisayar ve tablette `assets/hero-film.mp4` (1920×1080), telefonda modele odaklı dikey `assets/hero-film-mobile.mp4`
(864×1080). Kaynak video 480p olduğu için ikisi de gürültü temizleme, yüksek kaliteli büyütme ve keskinleştirme ile
hazırlandı. Kapak görseli `hero-film-poster.webp`, video yüklenene kadar görünür.

- **Masaüstü:** video çerçeveyi doldurur; yazılar soldaki tarlanın üzerinde, model sağda.
- **Tablet:** videonun tamamı, yazılar altında.
- **Telefon:** video ekranı doldurur (başlığın altında), yazılar ve düğmeler videonun alt kısmında, hafif bir gölgenin üzerinde.
- Sağ alttaki düğme videoyu durdurur. "Hareketi azalt" ya da veri tasarrufu açık olan ziyaretçilerde video
  ilk karede bekler, düğmeyle başlatılır.
- Videoyu değiştirmek için: Tema düzenleyici → **Home: chapters → Film (optional)** alanına yeni videoyu yükleyin.
  Fotoğrafa dönmek için **Play the film in the opening** ayarını kapatın.

## Ürün videoları ve fotoğrafları

Higgsfield hesabındaki 157 video ve 312 görselin hepsi tek tek incelendi; ürünle birebir eşleşen,
temiz (kart, para, bozuk logo, garip yüz içermeyen) olanlar temaya alındı: **23 ürün videosu**
(`assets/film-*.mp4`, her birinin `-poster.webp` kapağı var) ve **85 günlük yaşam fotoğrafı**
(`assets/look-<ürün>-<n>.webp`, 900×900). Videolar sessiz, dikey, 24 kare/sn; sonları başlarına yumuşak
geçişle bağlıdır.

- **Ürün sayfası, "See it carried" bölümü:** her ürün sayfasında ürün bilgilerinin hemen üstünde.
  Bilgisayarda solda ürünün videosu, sağda dört fotoğraf; telefonda önce yazı, sonra video, sonra
  kaydırılabilir fotoğraf şeridi. Videosu olmayan üründe yalnızca fotoğraflar, ikisi de olmayan üründe
  bölüm hiç görünmez. Shopify'da ürüne video yüklerseniz bölüm önce onu gösterir.
- **Koleksiyon kartları:** imleç karta gelince ürünün ilk günlük yaşam fotoğrafı açılır (yoksa ürünün
  ikinci görseli).
- **Ana sayfa bölümleri:** her bölümün kendi sakin videosu var (insan yüzü, kart ya da para görünmez;
  4:5 pencere): Çantalar `home-bags` (Margaux, ışıklı odada traverten blok üzerinde), Cüzdanlar
  `home-wallets` (Conrad, güneşli masada), Kartlıklar `home-cards` (Soren, cepten avuca, sonra kahvenin
  yanına). Tema düzenleyici → **Home: chapters → Films** altında başka bir ürün seçilirse o ürünün videosu oynar.
- **Hakkımızda:** I `film-atelier` (dikiş yakın çekimi), II `film-isadora`, III `film-amelie`.
- **Tek liste:** hangi ürünün hangi video ve fotoğrafları gösterdiği `snippets/film-name.liquid`
  dosyasındadır (`video|kısa ad|fotoğraf sayısı`). Yeni medya eklemek için dosyayı `assets/` içine
  koyup bu listeye satır eklemek yeterlidir.
- **Medyası olmayanlar:** Elena Leather Shoulder Bag için Higgsfield'da güvenle eşleşen görsel yok.
  Varen ve Arden'de yalnızca video, Marlow, Conrad, Rowan, Lior, F360 ve Ultimate Jacket'ta yalnızca
  fotoğraf var.
- **Yüklenme:** videolar ekrana gelmeden indirilmez, yalnızca ekrandaki oynar; fotoğraflar tembel yüklenir.
  "Hareketi azalt" ya da veri tasarrufu açıksa video düğmeyle başlar.
- **Kart ve para yok:** yapay zekâ videolarındaki banka kartı, para, kart makinesi ve cebinden cüzdan çıkarma
  anları çıkarıldı; yeni medya eklerken buna dikkat edin.
- **Boyut:** Shopify tema paketi sınırı 50 MB'tır. Tema şu an yaklaşık 41 MB (videolar 34 MB, fotoğraflar
  5 MB). Yeni medya eklerken toplamı 48 MB'ın altında tutun; tek dosya 20 MB'ı geçemez.

## Hız

- **Açılış videosu** sayfa yüklendikten sonra inmeye başlar; o ana kadar ilk karesi (kapak görseli) görünür.
  Böylece video, sayfanın kendi görselleri ve stilleriyle yarışmaz. Telefonda ilk 6 saniyede inen veri
  6 MB'tan yaklaşık 2,7 MB'a indi. Veri tasarrufu açıksa ya da bağlantı çok yavaşsa (2G) video düğmeyle başlar.
- **Sayfa geçişleri:** her tıklamada ekranı kaplayan beyaz, bulanık yükleme perdesi kaldırıldı. Ziyaretçinin
  açmak üzere olduğu sayfa önceden getirilir (bilgisayarda imleç linkin üzerinde durunca, telefonda parmak
  değince; `layout/theme.liquid` içindeki speculation rules). Sayfalar tarayıcının kendi yumuşak geçişiyle
  açılır. Sepet, ödeme, hesap ve arama önceden getirilmez. Perde yalnızca ülke/para birimi değişiminde görünür.
- **Ürün kartları:** telefonlar, kartın üzerine gelince açılan ikinci fotoğrafı hiç indirmez (dokunmatik
  ekranda gösterilemez). Koleksiyon sayfasında telefonda inen veri yaklaşık %40 azaldı.
- **Kapalı çekmeceler** (favoriler) ekran dışındayken çizilmez; kaydırma sırasında boşuna işlemci harcamaz.

## Güvenlik

- Depoda ve git geçmişinde API anahtarı, token ya da şifre **yoktur** (dosyalar ve tüm geçmiş tarandı).
- Tema içindeki her şey ziyaretçinin tarayıcısına gider; bu yüzden tema dosyalarına hiçbir zaman gizli anahtar
  konmaz. Bir araç (örn. Shopify CLI) anahtar isterse depo kökündeki `.env` dosyasına yazılır; `.env` git'e
  girmez (`.gitignore`), örnek şablon `.env.example` dosyasındadır.
- Tema yalnızca Shopify'ın kendi adreslerine ve Google Fonts'a bağlanır; üçüncü taraf izleme kodu yoktur.

## Kişiselleştirme nasıl çalışır

Monogram önizleme penceresi kaldırıldı. Kişiselleştirme iki yoldan yapılır:

1. **E-posta ile** (`snippets/bespoke.liquid`): ana sayfada, Hakkımızda'da ve Personalize Your Piece
   sayfasında. Düğme, hazır bir şablonla (ürün, metin, stil, yer) info@mavelania.com'a e-posta açar.
   Kartta "We reply within 24 hours." sözü yazar; metni `locales/en.default.json` → `bespoke` altından değiştirebilirsiniz.
2. **Ürün sayfasında**: "Add personalization" anahtarı ile metin alanı, yöntem ve renk. Seçimler
   sepete, ödeme sayfasına ve Shopify'daki siparişe **satır özelliği** olarak geçer. Altındaki
   "Have a style in mind?" bağlantısı ürün adıyla birlikte e-posta açar.

Yöntem ve renk kaynağı: ürün metafield'ı `custom.personalization` → açıklamadaki `Personalization: ...`
satırı → varsayılan `Laser and Embossed (Silver | Gold | Transparent | Black | Red)`. Bir üründe
kişiselleştirmeyi kapatmak için ürüne `no-personalization` etiketi ekleyin.

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

## Telefonda yalnızca dik kullanım

Tarayıcılar bir web sitesinin ekran yönünü kilitlemesine izin vermez. Bu yüzden telefon yan çevrildiğinde site
yerine logolu, sakin bir ekran çıkar: "Please turn your phone upright to view Mavelania." Telefon dik tutulunca
site kaldığı yerden devam eder. Tablet ve bilgisayarlar bu ekranı hiç görmez. Ana ekrana eklenmiş (uygulama gibi
açılan) sitede Android'de yön gerçekten dik olarak kilitlenir.

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
