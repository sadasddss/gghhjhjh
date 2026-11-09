// ==UserScript==
// @name         OnlineTravian Yağma Yardımcısı
// @namespace    local.onlinetravian.yagma
// @version      1.2.0
// @description  Mevcut tek yağma listesini en az 5 dakika arayla çalıştırır; belirsizlikte durur.
// @match        https://100000.onlinetravian.com/*
// @grant        none
// @run-at       document-idle
// @noframes
// ==/UserScript==

(() => {
  'use strict';
  if (document.getElementById('ot-raid-panel')) return;
  const PREFIX = 'ot-raid-v1:', INTERVAL = 300000, VERIFY = 20000;
  const url = new URL(location.href);
  const onList = url.pathname === '/build.php' && url.searchParams.get('t') === '99';
  const normalize = s => (s || '').replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '').replace(/\s+/g, ' ').trim();
  const visible = e => !!(e && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
  const text = e => normalize(e?.innerText || e?.textContent || e?.value);
  const buttons = () => [...document.querySelectorAll('button,input[type="submit"]')].filter(e => !panel.contains(e) && visible(e) && text(e).startsWith('Saldırı başlat'));
  const seconds = s => {
    const m = s.match(/(\d+):(\d{2}):(\d{2})/);
    return m ? Number(m[1])*3600 + Number(m[2])*60 + Number(m[3]) : 0;
  };
  const read = () => {
    const data = JSON.parse(localStorage.getItem(PREFIX+'state') || '{"next":0,"pending":0}');
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Kayıt verisi bozuk.');
    if (!Number.isFinite(data.next) || !Number.isFinite(data.pending)) throw new Error('Bekleme kaydı bozuk.');
    return data;
  };
  const write = s => localStorage.setItem(PREFIX+'state', JSON.stringify(s));
  const running = () => sessionStorage.getItem(PREFIX+'enabled-v12') === '1';
  const panel = document.createElement('section');
  panel.id = 'ot-raid-panel';
  panel.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:2147483647;width:320px;max-width:90vw;max-height:75vh;overflow:auto;padding:14px;background:#17232c;color:white;border:2px solid #81c784;border-radius:12px;font:14px/1.5 sans-serif;box-shadow:0 2px 15px #0008';
  panel.innerHTML = '<strong>Yağma paneli · v1.2.0</strong><div id="ot-raid-status" style="margin:8px 0">Hazır — başlatmanı bekliyor.</div><div id="ot-raid-stats" style="padding:8px;background:#243843;border-radius:8px;margin-bottom:8px"></div><button type="button" id="ot-raid-start">5 dk döngü başlat</button><button type="button" id="ot-raid-once">Tek tur gönder</button> <button type="button" id="ot-raid-stop">Durdur</button><button type="button" id="ot-raid-check">Kontrol et</button><div id="ot-raid-heartbeat" style="font-size:12px"></div><details open><summary style="margin-top:10px;cursor:pointer">İşlem kayıtları</summary><div id="ot-raid-log" style="max-height:160px;overflow:auto;font-size:12px"></div></details><div style="font-size:11px;margin-top:8px">Bu sekmeyi açık tut. Android ekranı kapatınca çalışmayı askıya alabilir.</div>';
  (document.body || document.documentElement).append(panel);
  const css = document.createElement('style');
  css.textContent = '#ot-raid-panel{display:block!important;visibility:visible!important;opacity:1!important;position:fixed!important;top:12px!important;right:12px!important;bottom:auto!important;left:auto!important;z-index:2147483647!important;box-sizing:border-box!important;color:white!important;background:#17232c!important}#ot-raid-panel button{display:inline-block!important;width:auto!important;height:auto!important;background:#e7f5ec!important;color:#102a1c!important;font:600 14px sans-serif!important;padding:10px!important;margin:4px!important;float:none!important;position:static!important}';
  document.documentElement.append(css);
  const status = panel.querySelector('#ot-raid-status');
  for (const b of panel.querySelectorAll('button')) b.style.cssText = 'padding:10px 16px;cursor:pointer;border-radius:6px;border:0;font-size:15px';
  const stamp = time => time ? new Date(time).toLocaleTimeString('tr-TR') : '—';
  const render = () => {
    const data = read();
    panel.querySelector('#ot-raid-stats').textContent =
      'Doğrulanan tur: ' + (data.rounds || 0) + ' · Son hedef: ' + (data.lastTargets || 0) +
      ' · Son deneme: ' + stamp(data.lastAttempt) + ' · Son doğrulama: ' + stamp(data.lastConfirmed) +
      ' · Ganimet: rapordan okunmadı';
    const area = panel.querySelector('#ot-raid-log');
    area.replaceChildren();
    for (const item of (data.logs || []).slice(-30).reverse()) {
      const line = document.createElement('div');
      line.textContent = stamp(item.time) + ' — ' + item.message;
      area.append(line);
    }
  };
  const log = message => {
    const data = read();
    data.logs = [...(data.logs || []), {time: Date.now(), message}].slice(-100);
    write(data); render();
  };
  const show = message => { status.textContent = message; try { render(); } catch(e) { status.textContent += ' | Kayıt hatası: ' + e.message; } };
  const stop = message => { try { sessionStorage.removeItem(PREFIX+'enabled-v12'); } catch (_) {} show(message); try { log(message); } catch (_) {} };
  const blocked = () => {
    if ([...document.querySelectorAll('input[type="password"]')].some(visible)) return 'Oturum kapandı. Giriş yapıp tekrar Başlat’a bas.';
    if ([...document.querySelectorAll('iframe[src*="captcha"],iframe[src*="challenges.cloudflare"],input[name*="captcha"],.g-recaptcha,.h-captcha,.cf-turnstile')].some(visible)) return 'Doğrulama ekranı var. Kendin tamamlayıp tekrar başlat.';
    const pageText = [...document.body.children].filter(e => e !== panel).map(e => e.innerText || '').join(' ');
    if (/verify you are human|insan olduğunuzu doğrulayın|checking your browser|access denied|çok fazla istek/i.test(pageText)) return 'Site doğrulama veya erişim engeli gösteriyor. Durduruldu.';
    return '';
  };
  const getSelectAll = () => [...document.querySelectorAll('input[type="checkbox"]')].filter(e => visible(e) && (
    [...e.labels || []].some(l => text(l) === 'Hepsini Seç') ||
    normalize(e.getAttribute('aria-label')) === 'Hepsini Seç' ||
    (e.parentElement && text(e.parentElement) === 'Hepsini Seç')
  ));
  let missingSince = 0, openingAt = 0, busy = false;
  async function tick() {
    if (busy) return;
    busy = true;
    try {
      if (!running()) return;
      if (!navigator.locks) return stop('Bu tarayıcı sekme kilidini desteklemiyor. Güncel Firefox/Chrome kullan.');
      await navigator.locks.request(PREFIX+'send', {ifAvailable:true}, async lock => {
        if (!lock || !running()) return;
        const issue = blocked();
        if (issue) return stop(issue);
        if (!onList) return stop('Yağma Listesi sayfasını açıp Başlat’a bas.');
        const now = Date.now(), state = read();
        const targets = buttons();
        if (targets.length > 1) return stop('Birden fazla liste açık. Sadece kullanacağın listeyi açık bırak.');
        const button = targets[0];
        if (!button) {
          // Birden fazla listeye tahminle tıklama: yalnızca tek Ayrıntılar denetimi desteklenir.
          const details = [...document.querySelectorAll('a,button,div,span')].filter(e => visible(e) && !panel.contains(e) && text(e) === 'Ayrıntılar' && ![...e.children].some(c => text(c) === 'Ayrıntılar'));
          if (details.length === 1 && !openingAt) { openingAt = now; details[0].click(); return show('Liste açılıyor…'); }
          missingSince ||= now;
          if (now - missingSince > 15000) return stop('Liste veya Saldırı başlat düğmesi bulunamadı. Ayrıntılar’ı elle aç.');
          return show('Yağma listesi bekleniyor…');
        }
        missingSince = 0;
        const countdown = seconds(text(button));
        if (state.pending) {
          if (countdown > 0) {
            state.pending = 0;
            state.rounds = (state.rounds || 0) + 1;
            state.lastConfirmed = now;
            state.next = Math.max(state.next, now + countdown*1000 + 2000);
            write(state);
            log('Tur doğrulandı: ' + (state.lastTargets || 0) + ' hedef; site sayacı başladı.');
            if (sessionStorage.getItem(PREFIX+'mode') === 'once') return stop('Tek tur doğrulandı. Durduruldu.');
            show('Gönderim sonrası sayaç doğrulandı. Bekleniyor…');
            return;
          }
          if (now - state.pending > VERIFY) return stop('Gönderim doğrulanamadı. Tekrar gönderilmedi; listeyi kontrol et.');
          return show('Gönderim sonrası sayaç kontrol ediliyor…');
        }
        if (countdown > 0) {
          state.next = Math.max(state.next, now + countdown*1000 + 2000);
          write(state);
        }
        if (now < state.next) return show('Sonraki tur: ' + Math.ceil((state.next-now)/1000) + ' saniye');
        if (button.disabled || button.getAttribute('aria-disabled') === 'true') return stop('Saldırı düğmesi kullanılamıyor. Listeyi kontrol et.');
        const all = getSelectAll();
        if (all.length !== 1) return stop('Hepsini Seç kutusu tekil olarak bulunamadı. Durduruldu.');
        if (!all[0].checked) all[0].click();
        const rows = [...document.querySelectorAll('table input[type="checkbox"]')].filter(e => visible(e) && e !== all[0] && !e.disabled);
        if (!all[0].checked || !rows.length || rows.some(e => !e.checked)) return stop('Hedef seçimi doğrulanamadı. Gönderilmedi.');
        // Tıklamadan ÖNCE kalıcı kayıt: yenileme ve ikinci sekme çift gönderemez.
        write({...state, next:now+INTERVAL+2000, pending:now, lastAttempt:now, lastTargets:rows.length});
        log(rows.length + ' hedef seçildi; gönderim denemesi.');
        show(rows.length + ' hedef için gönderim deneniyor…');
        button.click();
      });
    } catch (e) { stop('Hata: ' + e.message); }
    finally { busy = false; }
  }
  const start = mode => {
    try {
      const issue = blocked();
      if (issue) return stop(issue);
      if (!navigator.locks) return show('Sekme kilidi kullanılamıyor. Güncel Firefox veya Chrome gerekli.');
      const state = read();
      if (state.pending && Date.now()-state.pending > VERIFY) { state.pending=0; write(state); }
      sessionStorage.setItem(PREFIX+'mode',mode);
      sessionStorage.setItem(PREFIX+'enabled-v12','1');
      missingSince=0; openingAt=0;
      log(mode === 'once' ? 'Tek tur istendi.' : '5 dakika döngüsü başlatıldı.');
      if (!onList) {
        show('Yağma listesi açılıyor…');
        location.assign('/build.php?id=39&t=99');
        return;
      }
      show('Başlatıldı'); tick();
    } catch(e) { stop('Başlatılamadı: '+e.message); }
  };
  panel.querySelector('#ot-raid-start').onclick = () => start('loop');
  panel.querySelector('#ot-raid-once').onclick = () => start('once');
  panel.querySelector('#ot-raid-stop').onclick = () => stop('Sen durdurdun. Yeni tur gönderilmeyecek.');
  panel.querySelector('#ot-raid-check').onclick = () => {
    try {
      const issue=blocked(); const state=read();
      show('Kontrol: '+(issue || (onList ? 'Yağma listesi açık' : 'Başlatınca yağma listesine geçilecek'))+
        ' | Gönderme düğmesi: '+buttons().length+' | Seçim kutusu: '+getSelectAll().length+
        ' | Sekme kilidi: '+(navigator.locks ? 'var' : 'yok')+
        ' | Bekleme: '+Math.max(0,Math.ceil((state.next-Date.now())/1000))+' sn');
    } catch(e) { show('Kontrol hatası: '+e.message); }
  };
  try { render(); } catch(e) { show('Kayıt okunamadı: '+e.message); }
  setInterval(() => {
    panel.querySelector('#ot-raid-heartbeat').textContent='Panel çalışıyor · '+stamp(Date.now());
    tick();
  },1000);
  tick();
})();
