# OnlineTravian Yağma Yardımcısı

Sürüm **1.3.0** — Türkçe arayüz ve `100000.onlinetravian.com` sunucusu.

## Kurulum

[Betik dosyasını kur / güncelle](https://github.com/sadasddss/gghhjhjh/raw/refs/heads/main/onlinetravian/onlinetravian-yagma.user.js).
Tampermonkey ekranında güncellemeyi kaydet ve oyun sayfasını yenile. İkinci bir eski betik kopyası varsa devre dışı bırak. Panelin başlığında **v1.3.0** yazmalıdır.

## Otomatik çalışma

Bu sürüm ilk açılışta otomatik devreye girer; her tur için Başlat veya onay istemez. Kullanıcı Durdur'a basana kadar süre dolduğunda mevcut tek yağma listesini kendisi açar, hedefleri seçer ve gönderir. En az 5 dakika + 2 saniye bekler; sitenin kendi sayacı daha uzunsa onu da bekler.

Köy ekranına geçmek veya sayfayı yenilemek döngüyü kapatmaz. Süre dolunca açık oyun sekmesini yağma listesine yönlendirir. Durdur ayarı tarayıcıda saklanır ve diğer sekmelerde de geçerlidir. Durdurduktan sonra yeniden çalıştırmak için Otomatiği aç düğmesine basılır. Zaten gönderilmiş askerler Durdur ile geri çağrılmaz.

Tek tur seçeneği kaldırıldı. Bir sekme gönderimleri yönetir; aynı tarayıcıdaki diğer sekmeler bekler. Yöneten sekme kapanır veya askıya alınırsa başka bir açık oyun sekmesi yaklaşık 12 saniye sonra yönetimi devralabilir. Farklı cihazlar/tarayıcı profilleri bu kilidi paylaşmaz.

## Panel

Otomatik durum, sonraki gönderime kalan dakika:saniye, son hedef sayısı, son deneme ve doğrulama zamanı, doğrulanan tur sayısı, Kontrol et düğmesi ve işlem kayıtları bulunur. Son 100 kayıt saklanır; panel son 30 kaydı gösterir.

Doğrulanan tur, gönderimden sonra sitenin bekleme sayacının başlamasıdır. Askerlerin ulaştığı veya bütün hedeflere başarıyla gönderildiği yalnız bu sayaçla kanıtlanamaz. Ganimet miktarı raporlardan henüz okunmuyor.

Eksik seçimde, tanınan giriş/CAPTCHA/erişim engeli ekranında ve doğrulanamayan gönderimde hata yazarak durur. Android ekran kapalıyken tarayıcıyı askıya alabilir; kesintisiz çalışma garantisi yoktur. Bot tespitini aşma veya hesap cezasından korunma garantisi yoktur.

## Doğrulama

9 Kasım 2026, v1.3.0: JavaScript sözdizimi kontrolü ve canlı DOM kopyası üzerinde 18 yerel jsdom senaryosu geçti. Otomatik ilk tur, süre dolunca ikinci/üçüncü tur, azalan sayaç, kalıcı Durdur, yeniden açma, yenilemede beklemenin korunması, köyden otomatik listeye geçiş, iki sekmede tek gönderim ve devralma, site sayacına uyma, doğrulanamayan gönderimde durma, eksik seçim, giriş/CAPTCHA, çoklu liste ve bozuk kayıt kontrol edildi. Saat, navigasyon, kilit ve site yanıtları test ortamında simüle edildi.

Önceki v1.1 sürümünde canlı hesapta 98 hedeflik bir gönderim ve site sayacı 20:18:40–20:18:42 arasında gözlendi. **v1.3.0 için canlı veya Android uçtan uca doğrulama henüz yapılmadı.**
