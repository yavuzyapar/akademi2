# Black Friday fiyatları

Tema indirimi **kendisi uydurmaz**: üstü çizili fiyat, `-%` rozeti, "You save …" satırı ve
"Black Friday deals" bölümü yalnızca Shopify'da ürünün **Compare-at price** değeri satış
fiyatından yüksekse görünür. Yani indirimlerin sitede çıkması için fiyatların Shopify'da
gerçekten düşürülmesi gerekir. Bu klasördeki dosyalar bunu tek seferde yapmak içindir.

## Dosyalar

| Dosya | Ne işe yarar |
| --- | --- |
| `black-friday-prices-review.csv` | Kontrol tablosu: her ürün/varyant için bugünkü fiyat, Black Friday fiyatı, tasarruf ve oran |
| `black-friday-prices-import.csv` | Shopify'a içe aktarılacak dosya: indirimli fiyat + eski fiyat (compare-at) |
| `restore-prices-import.csv` | Kampanya bitince bugünkü fiyatlara dönmek için |
| `make_prices.py` | Dosyaları üreten betik (oranları değiştirmek isterseniz) |

Öneri oranlar ürün başına %15–25 arasıdır (fiyatı yüksek ürünlerde daha yüksek), indirimli
fiyatlar `.99` ile biter. **Üstü çizili fiyat her zaman ürünün bugün satıldığı fiyattır**,
yani gösterilen indirim gerçektir. Oranlar bir öneridir: kâr marjınıza uymayan satırları
içe aktarmadan önce `black-friday-prices-import.csv` içinde düzeltin.

İçe aktarma dosyalarında yalnızca fiyat sütunları vardır (SKU, stok, görsel, açıklama yok);
içe aktarma bunlara dokunmaz.

## Uygulama

1. **Yedek alın:** Shopify → Products → **Export** (All products, CSV).
2. Kampanya başlarken: Products → **Import** → `black-friday-prices-import.csv` →
   **"Overwrite products with matching handles"** kutusunu işaretleyin → Import.
3. Sitede kontrol edin: ürünlerde üstü çizili fiyat ve `-%` rozeti, ana sayfada
   "Black Friday deals" bölümü, üst şeritte "Black Friday is live: up to …% off" çıkar.
4. Kampanya bitince: aynı yolla `restore-prices-import.csv` dosyasını içe aktarın.

Notlar:

- Farklı ülkeler için Shopify Markets'te **elle sabitlenmiş** fiyatlarınız varsa onları
  Markets ekranından ayrıca güncelleyin; otomatik kur dönüşümü kullanan pazarlar
  kendiliğinden güncellenir.
- Üst şerit tarihleri tema düzenleyicide **Announcement bar → Campaign** altındadır
  (varsayılan: 27–30 Kasım 2026). Başlangıçtan önce geri sayım, tarih aralığında satış
  duyurusu gösterir. Satış duyurusu, indirimli ürün yoksa hiç görünmez.

## Dosyaları yeniden üretmek

```bash
curl -s "https://mavelania.com/products.json?limit=250" -o products.json
```

```bash
python3 make_prices.py products.json
```
