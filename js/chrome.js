// Shared page chrome: icon sprite, navigation, mega menu, mobile menu, footer
(function () {
  const sprite = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-chev" viewBox="0 0 12 12"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-sap" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="4"/></g></symbol>
  <symbol id="i-code" viewBox="0 0 24 24"><path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 4v16M4 12h16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7" opacity=".35"/></symbol>
  <symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>
  <symbol id="i-chart" viewBox="0 0 24 24"><path d="M3 20h18M6 16l4-5 3 3 5-7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-flask" viewBox="0 0 24 24"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>
  <symbol id="i-leaf" viewBox="0 0 24 24"><path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19l7-7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-people" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c1.8.8 3 2.6 3.5 5.2"/></g></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="9" r="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/></symbol>
</svg>`;
  document.body.insertAdjacentHTML('afterbegin', sprite);

  const page = document.body.dataset.page || 'home';
  const a = (href, label, key) => `<li><a href="${href}"${key === page ? ' aria-current="page"' : ''}>${label}</a></li>`;
  const ico = id => `<span class="mega__ico"><svg><use href="#${id}"/></svg></span>`;

  const nav = `
<header class="nav" id="nav">
  <a class="nav__logo" href="index.html" aria-label="Comcom, domov"><img src="assets/img/comcom-logo.jpg" alt="Comcom"></a>
  <ul class="nav__links">
    <li data-mega><a href="sap.html">SAP <svg class="chev"><use href="#i-chev"/></svg></a></li>
    <li data-mega><a href="analitika.html">Podatkovna analitika <svg class="chev"><use href="#i-chev"/></svg></a></li>
    ${a('projekti.html', 'Projekti', 'projekti')}
    ${a('o-nas.html', 'O nas', 'o-nas')}
    ${a('o-nas.html#kariera', 'Kariera', 'kariera')}
  </ul>
  <div class="nav__right">
    <div class="lang"><a class="is-active" href="#">SLO</a><a href="https://www.comcom.si/en/">ENG</a></div>
    <a class="btn btn--ink" href="kontakt.html">Dogovorite se za posvet <svg><use href="#i-arrow"/></svg></a>
    <button class="burger" aria-label="Meni"><span></span></button>
  </div>
</header>
<div class="mega" id="mega">
  <div class="mega__panel">
    <div class="mega__col">
      <h6>SAP</h6>
      <a class="mega__item" href="sap.html#svetovanje">${ico('i-sap')}<span><strong>SAP svetovanje</strong><small>Certificirani svetovalci za 13 modulov</small></span></a>
      <a class="mega__item" href="sap.html#abap">${ico('i-code')}<span><strong>SAP ABAP razvoj</strong><small>ABAP, Fiori, WebDynPro, vmesniki</small></span></a>
      <a class="mega__item" href="sap.html#razsiritve">${ico('i-plus')}<span><strong>Razširitve SAP sistema</strong><small>Rešitve, povsem integrirane s SAP</small></span></a>
    </div>
    <div class="mega__col">
      <h6>Podatkovna analitika in inženiring</h6>
      <a class="mega__item" href="analitika.html#vpp">${ico('i-bolt')}<span><strong>Optimizacija virtualnih elektrarn</strong><small>Maksimizacija prihodkov portfelja naprav</small></span></a>
      <a class="mega__item" href="analitika.html#tableau">${ico('i-chart')}<span><strong>Vizualizacija podatkov</strong><small>Implementacija BI orodja Tableau</small></span></a>
      <a class="mega__item" href="projekti.html">${ico('i-flask')}<span><strong>Razvojni projekti</strong><small>SmartIM, BETAi, Tvoj košček sonca</small></span></a>
    </div>
    <a class="mega__feature" href="kontakt.html">
      <canvas data-ribbons="mini"></canvas>
      <span class="mono" style="color:#8B8F95">Od leta 1992</span>
      <div><p>Imate projekt? Pogovorimo se.</p><span class="link-arrow" style="margin-top:14px">Dogovorite se za posvet <svg><use href="#i-arrow"/></svg></span></div>
    </a>
  </div>
</div>
<div class="mobile" id="mobile">
  <div class="mobile__top"><span class="mono" style="color:#8B8F95">Meni</span><button class="mobile__close" aria-label="Zapri">×</button></div>
  <nav>
    <a href="sap.html">SAP</a>
    <a class="sub" href="sap.html#svetovanje">SAP svetovanje</a>
    <a class="sub" href="sap.html#abap">SAP ABAP razvoj</a>
    <a class="sub" href="sap.html#razsiritve">Razširitve SAP sistema</a>
    <a href="analitika.html">Podatkovna analitika</a>
    <a class="sub" href="analitika.html#vpp">Optimizacija virtualnih elektrarn</a>
    <a class="sub" href="analitika.html#tableau">Vizualizacija podatkov</a>
    <a href="projekti.html">Projekti</a>
    <a href="o-nas.html">O nas</a>
    <a href="kontakt.html">Kontakt</a>
  </nav>
  <a class="btn btn--brand" href="kontakt.html">Dogovorite se za posvet <svg><use href="#i-arrow"/></svg></a>
</div>`;

  const footer = `
<footer class="footer">
  <div class="footer__top">
    <div>
      <img src="assets/img/comcom-logo.jpg" alt="Comcom">
      <p>SAP svetovanje in razvoj ter podatkovna analitika za energetiko in finance. Iz Idrije, od leta 1992.</p>
      <div class="footer__badges"><img src="assets/badges/sap_silver_partner.png" alt="SAP Silver Partner"><img src="assets/badges/avtenta.jpg" alt="Avtenta"></div>
    </div>
    <div><h6>Storitve</h6><ul>
      <li><a href="sap.html#svetovanje">SAP svetovanje</a></li>
      <li><a href="sap.html#abap">SAP ABAP razvoj</a></li>
      <li><a href="sap.html#razsiritve">Razširitve SAP sistema</a></li>
      <li><a href="analitika.html#vpp">Virtualne elektrarne</a></li>
      <li><a href="analitika.html#tableau">Vizualizacija podatkov</a></li>
    </ul></div>
    <div><h6>Podjetje</h6><ul>
      <li><a href="o-nas.html">O nas</a></li>
      <li><a href="projekti.html">Projekti</a></li>
      <li><a href="o-nas.html#kariera">Zaposlitev</a></li>
      <li><a href="o-nas.html#odgovornost">Družbena odgovornost</a></li>
      <li><a href="kontakt.html">Kontakt</a></li>
    </ul></div>
    <div><h6>Kontakt</h6><ul>
      <li>Lapajnetova ulica 29<br>5280 Idrija, Slovenija</li>
      <li><a href="tel:+38653722020">+386 (0) 5 372 20 20</a></li>
      <li><a href="mailto:pisarna@comcom.si">pisarna@comcom.si</a></li>
    </ul></div>
  </div>
  <div class="footer__bottom"><span>© 2026 Comcom d.o.o. Vse pravice pridržane.</span><span>Skupaj lahko premikamo meje.</span></div>
</footer>`;

  const navSlot = document.querySelector('[data-chrome="nav"]');
  const footSlot = document.querySelector('[data-chrome="footer"]');
  if (navSlot) navSlot.outerHTML = nav;
  if (footSlot) footSlot.outerHTML = footer;
})();
