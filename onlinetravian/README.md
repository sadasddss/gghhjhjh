# OnlineTravian Yağma Yardımcısı

Sürüm 1.1.0 — Türkçe arayüz ve 100000.onlinetravian.com sunucusu.

## Kurulum

[Betik dosyasını aç](https://github.com/sadasddss/gghhjhjh/raw/refs/heads/main/onlinetravian/onlinetravian-yagma.user.js). Tampermonkey kurulum ekranı açılmazsa içeriği kopyalayıp Tampermonkey → Yeni betik alanına yapıştır ve kaydet. Yağma listesi sayfasını yenileyip panelde Başlat’a bas.

## Panel

Başlat/Durdur, sonraki tur için kalan süre, son hedef sayısı, son gönderim denemesi, son doğrulama, doğrulanan tur sayısı ve kalıcı işlem kayıtları. Son 100 kayıt saklanır, panelde son 30 kayıt gösterilir.

Ganimet miktarı raporlardan henüz okunmuyor. Doğrulanan tur, gönderim sonrası site sayacının başlamasıdır; asker varışı veya ganimet başarısı değildir.

## Çalışma

En az 5 dakika + 2 saniye ve site sayacının bitmesini bekler. Tek açık liste desteklenir. Eksik seçimde, giriş ekranında, tanınan CAPTCHA/erişim engelinde ve doğrulanamayan gönderimde durur. Sekme kilidi ve kalıcı bekleme kaydı çift gönderimi önler. Android arka planda çalışmayı askıya alabilir. Bot tespitinden veya hesap cezasından korunma garantisi yoktur.

## Doğrulama

9 Kasım 2026: Canlı sayfada Hepsini Seç kutusu (raidListMarkAll1), Saldırı başlat düğmesi ve 98 hedef doğrulandı. Canlı DOM kopyası üzerinde jsdom ile 12 senaryo geçti. Bunlar seçim, gönderim sayacı, bekleme süresi, durdurma, belirsiz gönderim, eksik seçim, giriş/CAPTCHA, iki sekme, mevcut sayaç, birden fazla liste ve bekleme kaydının korunmasını kapsar. Saat, kilit ve site yanıtları simüle edildi. JavaScript sözdizimi kontrolü geçti. Gerçek Android/Tampermonkey kurulumu ve canlı otomatik ikinci tur henüz doğrulanmadı.
