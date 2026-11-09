// ==UserScript==
// @name         OnlineTravian Yağma Yardımcısı
// @namespace    local.onlinetravian.yagma
// @version      1.4.0
// @description  Otomatik devreye girer; mevcut tek yağma listesini en az 5 dakika arayla gönderir. Geçici hatalarda tekrar kontrol eder; yalnızca kullanıcı Durdur ile kapatır.
// @match        https://100000.onlinetravian.com/*
// @updateURL    https://raw.githubusercontent.com/sadasddss/gghhjhjh/main/onlinetravian/onlinetravian-yagma.user.js
// @downloadURL  https://raw.githubusercontent.com/sadasddss/gghhjhjh/main/onlinetravian/onlinetravian-yagma.user.js
// @grant        none
// @run-at       document-idle
// @noframes
// ==/UserScript==

(() => {
  'use strict';
  if (document.getElementById('ot-raid-panel')) return;
  const PREFIX = 'ot-raid-v1:', INTERVAL = 300000, VERIFY = 60000;
  const url = new URL(location.href);
  const onList = url.pathname === '/build.php' && url.searchParams.get('t') === '99';
  const normalize = s => (s || '').replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '').replace(/\s+/g, ' ').trim();
  const visible = e => !!(e && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
  const text = e => normalize(e?.innerText || e?.textContent || e?.value);
  const buttons = () => [...document.querySelectorAll('button,input[type="submit"]')].filter(e => !panel.contains(e) && visible(e) && /Saldırı başlat/i.test(text(e) || normalize(e.getAttribute('aria-label')) || normalize(e.getAttribute('title'))));
  const seconds = s => {
    const m = s.match(/(\d+):([0-5]\d)(?::([0-5]\d))?/);
    return !m ? 0 : m[3] === undefined ? Number(m[1])*60+Number(m[2]) : Number(m[1])*3600+Number(m[2])*60+Number(m[3]);
  };
  const read = () => {
    const data = JSON.parse(localStorage.getItem(PREFIX+'state') || '{"next":0,"pending":0}');
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Kayıt verisi bozuk.');
    if (!Number.isFinite(data.next) || !Number.isFinite(data.pending)) throw new Error('Bekleme kaydı bozuk.');
    return data;
  };
  const write = s => localStorage.setItem(PREFIX+'state', JSON.stringify(s));
  // Bu sürüm otomatik çalışır; Durdur tüm sekmelerde ve yenilemede korunur.
  const CONTROL = PREFIX+'auto-v14', LEASE = PREFIX+'owner-v13', LEASE_MS = 12000;
  const owner = crypto.randomUUID();
  const running = () => localStorage.getItem(CONTROL) !== '0';
  const ownsLease = () => {
    const data = JSON.parse(localStorage.getItem(LEASE) || 'null');
    if (data && data.id !== owner && data.until > Date.now()) return false;
    localStorage.setItem(LEASE, JSON.stringify({id:owner, until:Date.now()+LEASE_MS}));
    return true;
  };
  const releaseLease = () => {
    const data = JSON.parse(localStorage.getItem(LEASE) || 'null');
    if (data?.id === owner) localStorage.removeItem(LEASE);
  };
  const panel = document.createElement('section');
  panel.id = 'ot-raid-panel';
  panel.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:2147483647;width:320px;max-width:90vw;max-height:75vh;overflow:auto;padding:14px;background:#17232c;color:white;border:2px solid #81c784;border-radius:12px;font:14px/1.5 sans-serif;box-shadow:0 2px 15px #0008';
  panel.innerHTML = '<strong>Yağma paneli · v1.4.0</strong><div id="ot-raid-status" style="margin:8px 0">Otomatik durum kontrol ediliyor…</div><div id="ot-raid-stats" style="padding:8px;background:#243843;border-radius:8px;margin-bottom:8px"></div><button type="button" id="ot-raid-start">Otomatiği aç</button> <button type="button" id="ot-raid-stop">Durdur</button><button type="button" id="ot-raid-check">Kontrol et</button><div id="ot-raid-countdown" style="padding:10px 0;font-size:18px;font-weight:bold"></div><div id="ot-raid-heartbeat" style="font-size:12px"></div><details open><summary style="margin-top:10px;cursor:pointer">İşlem kayıtları</summary><div id="ot-raid-log" style="max-height:160px;overflow:auto;font-size:12px"></div></details><div style="font-size:11px;margin-top:8px">Bu sekmeyi açık tut. Android ekranı kapatınca çalışmayı askıya alabilir.</div>';
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
      ' · Belirsiz: ' + (data.unconfirmed || 0) + ' · Reddedilen: '+(data.rejected || 0)+
      ' · Sonuç: '+(data.sendStatus || 'henüz deneme yok')+' · Ganimet: rapordan okunmadı';
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
  const updateCountdown = () => {
    const output = panel.querySelector('#ot-raid-countdown');
    try {
      const data=read(), now=Date.now();
      const remaining = Math.max(0, Math.ceil((Math.max(data.next,data.pauseUntil || 0)-now) / 1000));
      const clock = String(Math.floor(remaining / 60)).padStart(2,'0') + ':' + String(remaining % 60).padStart(2,'0');
      output.textContent = running()
        ? ((data.pauseUntil || 0)>now ? 'Otomatik açık · Yeniden kontrol: '+clock : remaining ? 'Sonraki gönderime kalan: ' + clock : 'Otomatik açık · Gönderim kontrol ediliyor…')
        : (remaining ? 'Durduruldu · Bekleme: ' + clock : 'Durduruldu · Başlatmanı bekliyor');
    } catch (_) { output.textContent = 'Sayaç okunamadı — Kontrol et düğmesine bas.'; }
  };
  const show = message => { status.textContent = message; updateCountdown(); try { render(); } catch(e) { status.textContent += ' | Kayıt hatası: ' + e.message; } };
  const stop = message => { try { localStorage.setItem(CONTROL,'0'); releaseLease(); } catch (_) {} show(message); try { log(message); } catch (_) {} };
  let localRetryAt = 0;
  const pause = (message, delay=30000) => {
    const data=read();
    const changed=data.pauseReason!==message;
    data.pauseUntil=Date.now()+Math.max(1000,delay);
    data.pauseReason=message;
    write(data);
    if(changed) log('Otomatik bekleme: '+message);
    show('Otomatik açık · '+message);
  };
  const blocked = () => {
    if ([...document.querySelectorAll('input[type="password"]')].some(visible)) return 'Oturum kapalı. Girişten sonra otomatik devam edilecek.';
    if ([...document.querySelectorAll('iframe[src*="captcha"],iframe[src*="challenges.cloudflare"],input[name*="captcha"],.g-recaptcha,.h-captcha,.cf-turnstile')].some(visible)) return 'Doğrulama ekranı var. Kendin tamamlayınca otomatik devam edilecek.';
    const pageText = [...document.body.children].filter(e => e !== panel && visible(e) && !/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(e.tagName)).map(e => e.innerText || '').join(' ');
    if (/verify you are human|insan olduğunuzu doğrulayın|checking your browser|access denied|çok fazla istek/i.test(pageText)) return 'Site doğrulama veya erişim engeli gösteriyor. Engel varken gönderim yapılmaz.';
    return '';
  };
  const getSelectAll = () => [...document.querySelectorAll('input[type="checkbox"]')].filter(e => visible(e) && (
    /^raidListMarkAll\d+$/.test(e.id) ||
    [...e.labels || []].some(l => text(l) === 'Hepsini Seç') ||
    normalize(e.getAttribute('aria-label')) === 'Hepsini Seç' ||
    (e.parentElement && text(e.parentElement) === 'Hepsini Seç')
  ));
  const siteMessages = () => [...document.querySelectorAll('[role="alert"],.error,.errorMessage,.error-message,.success,.successMessage,.success-message,.notice')]
    .filter(e=>!panel.contains(e) && visible(e)).map(text).filter(Boolean);
  const siteRejection = () => siteMessages().find(s=>/yeterli.*asker|asker.*yeterli değil|asker.*yetersiz|gönderilemedi|gönderilmedi|başlatılamadı|not enough troops|insufficient troops|could not send|unable to send|failed to send|troops.*not sent|raid.*failed/i.test(s))?.slice(0,240) || '';
  const siteReceipt = () => siteMessages().find(s=>/askerler.*gönderildi|saldırı.*gönderildi|yağma.*başlatıldı|troops.*sent|raid.*started/i.test(s))?.slice(0,240) || '';
  let missingSince = 0, openingAt = 0, selectionAt = 0, busy = false;
  async function tick() {
    if (busy) return;
    busy = true;
    try {
      if (!running() || Date.now()<localRetryAt) return;
      if (!navigator.locks) {localRetryAt=Date.now()+60000;return pause('Sekme kilidi yok; güncel Firefox gerekli. Gönderim yapılmıyor.',60000);}
      await navigator.locks.request(PREFIX+'send', {ifAvailable:true}, async lock => {
        if (!lock || !running()) return;
        if (!ownsLease()) return show('Otomatik açık · Diğer sekme gönderimleri yönetiyor.');
        const now = Date.now(), state = read();
        if (now<(state.pauseUntil || 0)) return show('Otomatik açık · '+state.pauseReason);
        if(state.pauseUntil) {state.pauseUntil=0;state.pauseReason='';write(state);}
        const issue = blocked();
        if (issue) return pause(issue);
        if (!onList) {
          // Köy ekranına geçmek otomatiği kapatmaz. Süre dolunca listeye dönülür.
          if (now < state.next) return show('Otomatik açık · Süre dolunca yağma listesine geçilecek.');
          show('Süre doldu · Yağma listesine geçiliyor…');
          releaseLease();
          location.assign('/build.php?id=39&t=99');
          return;
        }
        const targets = buttons();
        if (targets.length > 1) return pause('Birden fazla liste açık. Tek liste kalınca otomatik devam edilecek.');
        const button = targets[0];
        const countdown = button ? seconds(text(button)) : 0;
        if (state.pending) {
          const rejected=siteRejection(),receipt=siteReceipt();
          if(rejected && rejected!==state.beforeError) {
            state.pending=0;
            state.rejected=(state.rejected || 0)+1;
            state.sendStatus='site gönderimi reddetti';
            write(state);
            return pause('Site hatası: '+rejected+' · Bekleme aralığı korunarak otomatik yeniden denenecek.');
          }
          if (countdown > 0 || (receipt && receipt!==state.beforeReceipt)) {
            state.pending = 0;
            state.rounds = (state.rounds || 0) + 1;
            state.lastConfirmed = now;
            state.sendStatus=countdown>0?'site sayacı başladı':'site kabul bildirimi verdi';
            state.next = Math.max(state.next, now + countdown*1000 + 2000);
            write(state);
            log('Tur doğrulandı: ' + (state.lastTargets || 0) + ' hedef; site sayacı başladı.');
            show('Gönderim sonrası sayaç doğrulandı. Bekleniyor…');
            return;
          }
          if (now - state.pending > VERIFY) {
            state.next=Math.max(state.next,state.pending+INTERVAL+2000);
            state.pending=0;
            state.unconfirmed=(state.unconfirmed || 0)+1;
            state.sendStatus='sonuç belirsiz; otomatik tekrar planlandı';
            write(state);
            return pause('Gönderim sonucu belirsiz; 5 dakikalık aralık korunarak sonraki tur otomatik denenecek.',Math.max(1000,state.next-now));
          }
          return show('Gönderim sonrası sayaç kontrol ediliyor…');
        }
        if (!button) {
          // Birden fazla listeye tahminle tıklama: yalnızca tek Ayrıntılar denetimi desteklenir.
          const details = [...document.querySelectorAll('a,button,div,span')].filter(e => visible(e) && !panel.contains(e) && text(e) === 'Ayrıntılar' && ![...e.children].some(c => text(c) === 'Ayrıntılar'));
          if (details.length === 1 && !openingAt) { openingAt = now; show('Liste otomatik açılıyor…'); details[0].click(); return; }
          missingSince ||= now;
          if (now - missingSince > 15000) {openingAt=0;missingSince=0;return pause('Gönderme düğmesi henüz bulunamadı; sayfa yeniden kontrol edilecek.');}
          return show('Yağma listesi bekleniyor…');
        }
        missingSince = 0;
        if (countdown > 0) {
          state.next = Math.max(state.next, now + countdown*1000 + 2000);
          write(state);
        }
        if (now < state.next) return show('Sonraki tur: ' + Math.ceil((state.next-now)/1000) + ' saniye');
        if (button.disabled || button.getAttribute('aria-disabled') === 'true') return pause('Site gönderme düğmesini pasif tutuyor; yeniden kontrol edilecek.');
        const all = getSelectAll();
        if (all.length !== 1) return pause('Hepsini Seç kutusu tekil bulunamadı; sayfa yeniden kontrol edilecek.');
        if (!all[0].checked && !selectionAt) all[0].click();
        const rows = [...document.querySelectorAll('table input[type="checkbox"]')].filter(e => visible(e) && e !== all[0] && !e.disabled);
        if (!all[0].checked || !rows.length || rows.some(e => !e.checked)) {
          selectionAt ||= now;
          if(now-selectionAt<10000) return show('Otomatik açık · Hedef seçiminin tamamlanması bekleniyor…');
          selectionAt=0;
          if(all[0].checked)all[0].click();
          return pause('Hedef seçimi tamamlanmadı; seçmeden gönderilmeyecek ve otomatik tekrar kontrol edilecek.');
        }
        selectionAt=0;
        // Tıklamadan ÖNCE kalıcı kayıt: yenileme ve ikinci sekme çift gönderemez.
        write({...state, next:now+INTERVAL+2000, pending:now, lastAttempt:now, lastTargets:rows.length,
          sendStatus:'gönderim denendi; site yanıtı bekleniyor',beforeError:siteRejection(),beforeReceipt:siteReceipt()});
        log(rows.length + ' hedef seçildi; gönderim denemesi.');
        show(rows.length + ' hedef için gönderim deneniyor…');
        button.click();
      });
    } catch (e) { localRetryAt=Date.now()+30000; show('Otomatik açık · Hata: '+e.message+' · 30 saniye sonra tekrar kontrol edilecek.'); }
    finally { busy = false; }
  }
  const start = () => {
    try {
      localStorage.setItem(CONTROL,'1');
      localRetryAt=0;
      log('Otomatik açıldı. Sonraki turlar için yeniden basman gerekmiyor.');
      show('Otomatik açık');tick();
    } catch(e) {show('Kayıt erişim hatası: '+e.message);}
  };
  panel.querySelector('#ot-raid-start').onclick = start;
  panel.querySelector('#ot-raid-stop').onclick = () => stop('Sen durdurdun. Yeni tur gönderilmeyecek.');
  panel.querySelector('#ot-raid-check').onclick = () => {
    try {
      const issue=blocked(); const state=read();
      show('Kontrol: '+(issue || (onList ? 'Yağma listesi açık' : 'Süre dolunca listeye otomatik geçilecek'))+
        ' | Gönderme düğmesi: '+buttons().length+' | Seçim kutusu: '+getSelectAll().length+
        ' | Sekme kilidi: '+(navigator.locks ? 'var' : 'yok')+
        ' | Bekleme: '+Math.max(0,Math.ceil((Math.max(state.next,state.pauseUntil || 0)-Date.now())/1000))+' sn'+
        ' | Otomatik: '+(running()?'açık':'kullanıcı durdurdu')+' | Son uyarı: '+(state.pauseReason || 'yok')+
        ' | Site düğmesi: '+(buttons()[0] ? text(buttons()[0]) : 'bulunamadı'));
    } catch(e) { show('Kontrol hatası: '+e.message); }
  };
  try { show(running() ? 'Otomatik açık · Her tur kendiliğinden gönderilecek.' : 'Durduruldu · Otomatik gönderim kapalı.'); } catch(e) { show('Kayıt okunamadı: '+e.message); }
  updateCountdown();
  setInterval(() => {
    updateCountdown();
    panel.querySelector('#ot-raid-heartbeat').textContent='Panel çalışıyor · '+stamp(Date.now());
    tick();
  },1000);
  const wake = () => { updateCountdown();tick(); };
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake();});
  window.addEventListener('pageshow',wake);
  window.addEventListener('focus',wake);
  window.addEventListener('online',wake);
  tick();
})();
