# OnlineTravian Yağma Yardımcısı

Sürüm **1.4.0** — Türkçe arayüz ve `100000.onlinetravian.com` sunucusu.

## Kurulum

[Betik dosyasını kur / güncelle](https://github.com/sadasddss/gghhjhjh/raw/refs/heads/main/onlinetravian/onlinetravian-yagma.user.js?v=1.4.0).
Tampermonkey ekranında güncellemeyi kaydet ve oyun sayfasını yenile. Panelin başlığında **v1.4.0** yazmalıdır. Eski ikinci bir betik kopyası varsa kapat. İlk açılışta bu sürüm otomatik çalışır. Eski sürümün hata nedeniyle kapattığı ayar bu sürümü kapatmaz.

## Neden her defasında Otomatiği aç gerekiyordu?

v1.3.0, site sayacını 20 saniyede okuyamazsa `stop()` çağırıp açık/kapalı kaydını kalıcı kapatıyordu. Önceki simülasyonlar bu davranışı beklenen sonuç kabul etmişti. v1.4.0'da geçici hata ile kullanıcının Durdur kararı ayrıldı.

## Otomatik çalışma ve yeniden deneme

- Kalıcı kapatma yalnızca kullanıcı **Durdur** düğmesine basınca yapılır. Sonraki yenilemelerde ve sekmelerde bu karar korunur. Yeniden açmak için bir kez **Otomatiği aç** kullanılır.
- İlk kurulumda otomatik devreye girer; her tur onay istemez. Köy ekranına geçmek döngüyü kapatmaz. Süre dolunca yağma listesine döner.
- En az 5 dakika + 2 saniye aralık korunur. Site daha uzun bir sayaç gösterirse o da beklenir.
- Gönderim sonucu için en fazla 60 saniye izleme yapılır. Yeni bir site hata bildirimi görülürse reddedilen deneme olarak kaydedilir. Site sayacı veya yeni bir kabul bildirimi görülürse site kabulü kaydedilir.
- Sonuç belirsiz kalırsa başarılı sayılmaz. Otomatik açık kalır ve 5 dakikalık aralık dolunca sonraki tur kendisi denenir; hemen art arda göndermez. Panelde belirsiz ve reddedilen denemeler ayrı gösterilir.
- Düğme geçici pasifse/bulunamazsa veya seçim tamamlanmazsa genellikle 30 saniye sonra tekrar kontrol edilir. Bekleme aralığı dolmadan gönderim yapılmaz. Geç tamamlanan checkbox seçimi için 10 saniye beklenir.
- Saat:dakika:saniye ve dakika:saniye sayaçları okunur. Hepsini Seç kutusu gözlenen kalıcı ID biçiminden ve etiketinden bulunur.
- Giriş, CAPTCHA ve erişim engeli varken gönderim yapılmaz. Kullanıcı giriş/doğrulamayı tamamladığında, sonraki otomatik kontrolde devam edilir. CAPTCHA çözülmez ve engeller atlatılmaz.
- Yalnızca tek açık yağma listesi desteklenir. Birden fazla liste varsa bekler; tek liste kalınca otomatik devam eder.
- Aynı tarayıcıdaki tek sekme gönderimleri yönetir. Diğerleri bekler. Farklı cihaz/tarayıcı profilleri bu kilidi paylaşmaz.
- Firefox'a dönüşte görünürlük, odak, sayfa geri yükleme ve bağlantının gelmesi olaylarında hemen tekrar kontrol yapılır. Kaçırılan turları arka arkaya telafi etmez.

## Panel ve doğrulama sınırı

Sonraki gönderime kalan dakika:saniye, yeniden kontrol süresi, son deneme, site kabulü, belirsiz/reddedilen denemeler, işlem kayıtları ve **Kontrol et** tanısı bulunur.

Site kabulü, sitenin sayacı veya kabul bildirimidir. Bu, her hedefe tam asker gönderildiğini, askerlerin ulaştığını ya da ganimet getirdiğini kanıtlamaz. Askeri Üs hareketleri ve dönüş raporları otomatik okunmuyor. Ganimet raporlardan henüz hesaplanmıyor.

## Firefox Android

Oyun sekmesini ve uygulamayı ön planda tut. Firefox Android arka plan zamanlayıcılarını geciktirebilir, sekmeyi tamamen boşaltabilir. Betik işletim sisteminin bu kısıtlamasını kaldıramaz; ekran kapalıyken kesintisiz 5 dakika garantisi yoktur. Otomatik açık ayarı korunur ve sayfa yeniden çalışınca kaldığı kaydı kontrol eder.

[MDN: arka plan zamanlayıcıları](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout#timeouts_in_inactive_tabs)

Bot tespitini aşma veya hesap cezasından korunma garantisi yoktur.

## Test durumu

9 Kasım 2026: Son dosya üzerinde sözdizimi kontrolü ve 21 hedefli yerel jsdom regresyon testi geçti. Özellikle hata sonrası yeniden düğmeye basmadan devam, reddedilen/belirsiz gönderim, sayaç biçimleri, geç gelen seçim, geçici pasif/kayıp düğme, CAPTCHA/girişten sonra devam, yenileme ve uyanma olayları test edildi. Saat, site yanıtı ve navigasyon simüle edildi.

Geliştirme sırasında 20 senaryo türünden 10.000 parametreli simülasyon da geçti; ardından hata metni ayrımı ve metadata için küçük ekler yapılıp 21 hedefli test son dosyada tekrarlandı. Eski v1.3.0 için önceki 10.000 rapor bu sürümün kanıtı değildir.

Yerel Firefox 153 açılabildi ancak test sayfası açılırken yanıt alınamadı; bu deneme başarılı tarayıcı testi sayılmadı. **Gerçek Android cihazında Tampermonkey ve canlı oyunla uçtan uca test henüz yapılmadı.**
