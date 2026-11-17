# Yavuz Yapar — erişim kartı

Tek ekranlık kişisel kart. Sayfa hiçbir yöne kaymaz; kaydırma hareketi ziyaretçiyi
aşağı değil, altı savunma katmanından geçirerek çekirdekteki özgeçmişe götürür.

## İçeriği düzenlemek

Her şey **`icerik.js`** dosyasında. Tırnakların içini doldur, kaydet, sayfayı yenile.

- Boş bıraktığın alanlar sitede sansürlü (████) görünür.
- Özgeçmiş için PDF dosyanı bu klasöre **`cv.pdf`** adıyla koy. Şu anki `cv.pdf` yalnızca yer tutucu.
  Site dosyanın SHA-256 özetini kendisi hesaplar; çekirdekteki desen de o özetten çizilir.
- Dolu hâlini görmek için adresin sonuna `?ornek` ekle. Örnek veriler `ornek.js` içinde.

| Katman | Ne gösterir | `icerik.js` alanı |
| --- | --- | --- |
| 01 Çevre | Ad, unvan, tek cümle | `ad`, `soyad`, `unvan`, `konum`, `slogan` |
| 02 Ağ | İletişim kanalları, rehbere ekle (.vcf) | `baglantilar` |
| 03 Uç nokta | Yetkinlikler | `yetkinlikler` |
| 04 Uygulama | Projeler | `calismalar` |
| 05 Veri | Deneyim, eğitim, sertifika | `kayit` |
| 06 Çekirdek | CV indirme ve özet | `cv` |

## Sağdaki düzenek

Altı halkalı bir makine; her halka bir güvenlik kontrolünün mekanik karşılığı. Dışarıdan gelen
paketler sırayla hepsinden geçmek zorunda ve çoğu yolda düşüyor.

| Halka | Kontrol | Ne görürsün |
| --- | --- | --- |
| 01 Çevre | Güvenlik duvarı | On iki port; yalnızca 443 açık. Ötekilere gelen paket kepenge çarpıp kırmızı yanar. Arada bir port taraması olur. |
| 02 Ağ | Bölümleme + IDS | Dört bölge (DMZ, sunucu, yönetim, kullanıcı) ve üzerlerinde dönen tarama ışını. Şüpheli paket ışın gelene kadar bekletilir. |
| 03 Uç nokta | EDR | 24 cihaz sırayla yoklanır; ele geçirilen dışarı çekilip karantinaya alınır. |
| 04 Uygulama | Kimlik doğrulama | Boru tipi pimli kilit. Pimler kesme hattına dizilince göbek bir diş döner; yanlış anahtarda üç pim oturmaz. |
| 05 Veri | Şifreleme | İç içe iki şifre rotoru; üstteki pencerede düz harf ve şifreli karşılığı okunur. |
| 06 Çekirdek | Bütünlük | İris diyaframı ve kasa sürgüleri. Çizgiler ve desen `cv.pdf` dosyasının SHA-256 özetinden çizilir. |

Gerçek olanlar: SHA-256 özeti (tarayıcıda hesaplanır), özetten çizilen desen ve 02 ile 03 arasındaki
gezegen dişli takımı (diş sayıları 186 / 204 / 9, dönüş oranları buna göre). Geri kalanı çalışan bir
makettir; site gerçek bir güvenlik duvarı ya da IDS çalıştırmaz. Çerçevenin altındaki yazı o halkanın
o anki durumunu gösterir.

Kare hızı düşerse tuval çözünürlüğü kendiliğinden bir kademe iner. İşletim sisteminde
"hareketi azalt" açıksa düzenek durağan çizilir.

## Yerelde açmak

Özet hesabı dosyayı okuduğu için sayfayı çift tıklayarak değil, küçük bir sunucuyla aç:

```
cd kart
python3 -m http.server 8000
```

Sonra tarayıcıda `http://localhost:8000`.

## Yayınlamak

Klasör düz dosyalardan oluşur, derleme adımı yok. `kart/` klasörünü olduğu gibi
GitHub Pages, Netlify, Vercel ya da Cloudflare Pages'e koyman yeterli.
Yayınladıktan sonra `index.html` içindeki `og:image` adresini tam adresle değiştir.

## Kullanım

- Tekerlek, dokunmatik kaydırma, ok tuşları ya da `1`–`6`: katman değiştirir.
- Düzeneğe ya da alttaki raya tıklamak da aynı işi yapar.
- Doğrudan bağlantılar: `#baglantilar`, `#yetkinlikler`, `#calismalar`, `#kayit`, `#cv`.

## Güvenlik notları

- Sıkı içerik güvenlik politikası (CSP): yalnızca bu klasördeki dosyalar yüklenir.
- Çerez, izleyici, üçüncü taraf istek yok. Yazı tipleri de buradan sunulur.
- `icerik.js` içindeki metinler sayfaya HTML olarak değil düz metin olarak yazılır;
  bağlantılarda yalnızca `http`, `https`, `mailto` ve `tel` kabul edilir.

Yazı tipleri: Fraunces ve Martian Mono (SIL Open Font License, bkz. `fonts/LISANS.txt`).
