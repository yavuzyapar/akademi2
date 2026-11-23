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

Açılışta sessiz, döngülü bir video oynar; her ekran yalnızca kendi videosunu indirir:

- **Bilgisayar ve tablet:** `assets/hero-alicia-wide.mp4` (1920×1080, 10,5 sn). Dikey Alicia videosunun
  Higgsfield'da yatay (16:9) yeniden çerçevelenmiş hali; logo kartı ve başı kadraj dışında kalan köprü sahnesi çıkarıldı (video çeşme sahnesiyle başlar), kenarları yapay zekâ ile
  doldurulan pazar sahnesi kare kare kontrolde tezgâhlar değiştiği için çıkarıldı. Yazılar videonun sol
  tarafında, hafif bir gölgenin üzerinde.
- **Telefon:** `assets/hero-alicia.mp4` (720×1280, dikey); video ekranı doldurur, yazılar altta.
- Kapak görselleri `hero-alicia-wide-poster.webp` ve `hero-alicia-poster.webp`, video yüklenene kadar görünür.
- Video kendiliğinden başlar, durdurma düğmesi yoktur.
- Videoyu değiştirmek için: Tema düzenleyici → **Home: chapters → Film (optional)** alanına yeni videoyu yükleyin.
  Fotoğrafa dönmek için **Play the film in the opening** ayarını kapatın.

## Ürün videoları ve fotoğrafları

Higgsfield hesabındaki videolar ve görseller tek tek incelendi; yalnızca ürünü gerçekte olduğu gibi
(aynı biçim, renk, toka, fermuar) gösteren ve temiz olanlar temada: **16 ürün videosu**
(`assets/film-*.mp4`, her birinin `-poster.webp` kapağı var) ve **günlük yaşam fotoğrafları**
(`assets/look-<ürün>-<n>.webp`, 900×900). Margaux, Bennett, Everett, Rowan, Varen, Soren, Arden, Heart ve
F360'ın ürünle uyuşmayan videoları/fotoğrafları kaldırıldı. Bennett, Rowan, Varen, Arden ve F360 sayfalarında
bu bölüm görünmez; Margaux, Everett, Soren ve Heart'ta yalnızca doğru fotoğraflar kalır.

- **Ürün sayfası, "See it carried" bölümü:** her ürün sayfasında ürün bilgilerinin hemen üstünde.
  Bilgisayarda solda ürünün videosu başlıktan fotoğrafların altına kadar aynı hizada; sağda aynı anda iki
  fotoğraf, diğerleri oklarla ya da kaydırarak; telefonda önce yazı, sonra video, sonra
  kaydırılabilir fotoğraf şeridi. Videosu olmayan üründe yalnızca fotoğraflar, ikisi de olmayan üründe
  bölüm hiç görünmez. Shopify'da ürüne video yüklerseniz bölüm önce onu gösterir.
- **Koleksiyon kartları:** imleç karta gelince ürünün ilk günlük yaşam fotoğrafı açılır (yoksa ürünün
  ikinci görseli).
- **Açılış videosu:** `hero-alicia` (dikey; Alicia çantayla çeşme önünde ve şehirde yürüyüş). Geniş ekranda
  sağda dikey pencere, solda yazılar; tablette ortada; telefonda ekranı doldurur.
- **Ana sayfa bölümleri:** Çantalar bölümünde video ya da fotoğraf yok; başlık ve ürünler tam genişlikte.
  Cüzdanlar `home-wallets` (Margaux'nun yapılışı: deri kesimi, dikiş, kutu, sokakta), Kartlıklar `film-valeria`
  (Valeria kutu açılışı). Geniş ekranda video bölüm numarasından ürün kartlarının altına kadar uzanır;
  telefonda ekran yüksekliğini aşmaz. Tema düzenleyici → **Home: chapters → Films** altında bir ürün seçilirse
  o ürünün videosu oynar.
- **Videolar kendiliğinden başlar,** durdurma düğmesi yoktur (sessiz oynarlar; telefon pil tasarrufu
  modunda bekletirse ilk dokunuşta başlar).
- **Valeria ürün sayfası:** `film-valeria` kutu açılışıyla başlar.
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

- **Yazı tipleri temanın içinde** (`assets/font-*.woff2`, `snippets/fonts.liquid`). Google Fonts'a istek gitmez;
  yazılar daha erken ve hep doğru yazı tipiyle görünür. Ana iki yazı tipi önceden yüklenir. "Mavelania" el
  yazısı, yazı tipi gelmeden başka bir yazı tipiyle gösterilmez (taşma olmaz).
- **Açılış videosu** sayfa yüklendikten sonra başlar; o ana kadar ilk karesi görünür. Video kalitesi gözle
  ayırt edilmeyecek şekilde sıkıştırıldı (5,2 MB → 3,2 MB).
- **Yükleme ekranı:** başka bir sayfaya geçerken ekranda dönen halka içinde Mavelania logosu görünür. Bulanıklık
  efekti yoktur (çizimi ucuzdur), hızlı açılıp kapanır.
- **Sayfa geçişleri:** ziyaretçinin açmak üzere olduğu sayfa önceden getirilir (bilgisayarda imleç linkin üzerinde
  durunca); tıklama anında sayfa arka planda hazırlanmaya başlar (prerender), böylece çoğu geçiş anında olur.
  Sayfalar yumuşak bir geçişle açılır. Sepet, ödeme, hesap ve arama önceden getirilmez.
- **Ürün kartları:** telefonlar, kartın üzerine gelince açılan ikinci fotoğrafı indirmez.
- **Kapalı çekmeceler** (favoriler) ekran dışındayken çizilmez.

## İletişim formu

Ana sayfanın sonunda ve İletişim sayfasında aynı "Write to us" kartı vardır (`snippets/contact-card.liquid`):
solda kimin, ne zaman cevap verdiği; sağda konu seçimi, ad, e-posta, sipariş numarası ve mesaj. Form Shopify'ın
kendi iletişim formudur; mesajlar mağazanın **iletişim e-postasına** gider. Mesajların info@mavelania.com'a
gelmesi için: Shopify yönetim paneli → **Ayarlar → Mağaza ayrıntıları → İletişim bilgileri** altında e-posta
adresinin info@mavelania.com olduğundan emin olun.

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
