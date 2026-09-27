// ---------- Theme ----------
function setTheme(isDark){
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  const st = document.getElementById('settingsThemeToggle');
  if (st) st.classList.toggle('on', isDark);
  try { localStorage.setItem('asorin_theme', isDark ? 'dark' : 'light'); } catch (e) { /* storage unavailable */ }
}
document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', () => setTheme(document.documentElement.getAttribute('data-theme') !== 'dark'));
  const settingsThemeBtn = document.getElementById('settingsThemeToggle');
  if (settingsThemeBtn) settingsThemeBtn.addEventListener('click', () => setTheme(document.documentElement.getAttribute('data-theme') !== 'dark'));
});

// ---------- Product data (base catalog starts empty — add real items via admin.html) ----------
const products = [];

let currentLang = 'ckb';
let currentCat = 'all';
const catLabelMap = { electronics: {ckb:'کەرەستەی پیشەسازی',en:'Industrial Materials',ar:'مواد صناعية',zh:'工业物资'}, food: {ckb:'بەرهەمی خۆراکی و نەوتی',en:'Oil & Food Products',ar:'منتجات نفطية وغذائية',zh:'石油与食品产品'} };
const stockLabelMap = { ckb:'بەردەستە', en:'In stock', ar:'متوفر', zh:'现货' };
const emptyStateMap = { ckb:'هێشتا هیچ کاڵایەک تۆمار نەکراوە', en:'No items have been listed yet', ar:'لم يتم إدراج أي منتج بعد', zh:'尚未上架任何产品' };

// ---- Admin overlay: products added/removed/edited via admin.html, merged into the base catalog ----
function getAdminProducts(){
  try { return JSON.parse(localStorage.getItem('asorin_admin_products') || '[]'); }
  catch (e) { return []; }
}
function getDeletedIds(){
  try { return JSON.parse(localStorage.getItem('asorin_deleted_ids') || '[]'); }
  catch (e) { return []; }
}
function getProductOverrides(){
  try { return JSON.parse(localStorage.getItem('asorin_product_overrides') || '{}'); }
  catch (e) { return {}; }
}
function getAllProducts(){
  const deleted = getDeletedIds();
  const overrides = getProductOverrides();
  const base = products.filter(p => !deleted.includes(p.id)).map(p => overrides[p.id] ? Object.assign({}, p, overrides[p.id]) : p);
  return base.concat(getAdminProducts());
}

function renderGrid(){
  const grid = document.getElementById('grid');
  if (!grid) return;
  const all = getAllProducts();
  const filtered = all.filter(p => currentCat === 'all' || p.cat === currentCat);
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state">${emptyStateMap[currentLang] || emptyStateMap.ckb}</div>`;
    return;
  }
  grid.innerHTML = filtered.map(p => {
    const t = p[currentLang] || p.ku;
    const catLabel = catLabelMap[p.cat][currentLang];
    return `<div class="p-card ${p.cat}" data-id="${p.id}">
      <img class="p-img" src="${p.img}" alt="${t.n}">
      <div class="p-body">
        <span class="badge ${p.cat}">${catLabel}</span>
        <h3>${t.n}</h3>
        <p class="code">${p.code}</p>
        <div class="p-foot">
          <span class="stock"><span class="dot"></span>${stockLabelMap[currentLang]}</span>
        </div>
      </div>
    </div>`;
  }).join('');
  grid.querySelectorAll('.p-card').forEach(card => card.addEventListener('click', () => openModal(card.dataset.id)));
}

function openModal(id){
  const p = getAllProducts().find(x => String(x.id) === String(id));
  if (!p) return;
  const t = p[currentLang] || p.ku;
  document.getElementById('modalImg').src = p.img;
  document.getElementById('modalBadge').textContent = catLabelMap[p.cat][currentLang];
  document.getElementById('modalBadge').className = 'badge ' + p.cat;
  document.getElementById('modalTitle').textContent = t.n;
  document.getElementById('modalCode').textContent = p.code;
  document.getElementById('modalDesc').textContent = t.d;
  document.getElementById('overlay').classList.add('open');
}

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('closeModal');
  if (closeBtn) closeBtn.addEventListener('click', () => document.getElementById('overlay').classList.remove('open'));
  const overlay = document.getElementById('overlay');
  if (overlay) overlay.addEventListener('click', (e) => { if (e.target.id === 'overlay') e.currentTarget.classList.remove('open'); });

  document.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCat = tab.dataset.cat;
      renderGrid();
    });
  });

  // ---- Restore saved theme + language (persists across real page loads) ----
  try {
    const savedTheme = localStorage.getItem('asorin_theme');
    if (savedTheme) setTheme(savedTheme === 'dark');
  } catch (e) { /* storage unavailable, fall back to default theme */ }
  try {
    const savedLang = localStorage.getItem('asorin_lang');
    if (savedLang && dict[savedLang]) currentLang = savedLang;
  } catch (e) { /* storage unavailable, fall back to default language */ }

  const langSelect = document.getElementById('langSelect');
  const settingsLangSelect = document.getElementById('settingsLangSelect');
  if (langSelect) langSelect.value = currentLang;
  if (settingsLangSelect) settingsLangSelect.value = currentLang;
  function changeLang(newLang){
    currentLang = newLang;
    applyLang();
  }
  if (langSelect) langSelect.addEventListener('change', (e) => changeLang(e.target.value));
  if (settingsLangSelect) settingsLangSelect.addEventListener('change', (e) => changeLang(e.target.value));

  applyLang();

  // ---- Mobile hamburger menu (slides in from the screen edge) ----
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
  const mobileNavClose = document.getElementById('mobileNavClose');
  function openMobileNav(){ if (mobileNav) mobileNav.classList.add('open'); if (mobileNavBackdrop) mobileNavBackdrop.classList.add('open'); }
  function closeMobileNav(){ if (mobileNav) mobileNav.classList.remove('open'); if (mobileNavBackdrop) mobileNavBackdrop.classList.remove('open'); }
  if (menuToggle) menuToggle.addEventListener('click', openMobileNav);
  if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileNav);
  if (mobileNavBackdrop) mobileNavBackdrop.addEventListener('click', closeMobileNav);
  if (mobileNav) mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));
});

// ---------- i18n ----------
const dict = {
  ckb: { brand:'ئاسۆرین', nav_home:'سەرەکی', nav_products:'بوار و چالاکییەکان', nav_settings:'ڕێکخستن', nav_about:'دەربارە',
    lbl_home:'سەرەکی', hv_title:'بوارە سەرەکییەکانمان', hero_title:'بەخێربێن بۆ<br><span class="accent">کۆمپانیای ئاسۆرین</span>', hero_sub:'ئاسۆرین کۆمپانیایەکی بازرگانی و لۆجیستیی نێودەوڵەتییە، چالاک لە بازرگانی گشتی، زنجیرەی دابینکردن، چارەسەری پیشەسازی، و دابینکردنی ستراتیژی بۆ تەندەر.',
    cta_shop:'بوارەکانی کارمان ببینە', cta_about:'زیاتر بزانە', stat_products:'بوارە ستراتیژیەکان', stat_sections:'خزمەتگوزاری بازرگانی', stat_langs:'زمان',
    vr_ref:'کۆدی کاڵا', vr_stock:'بەردەستی', vr_stock_val:'هەیە',
    lbl_products:'بوار و چالاکییەکان', prod_page_title:'بوار و چالاکییەکانی کۆمپانیا', prod_page_sub:'ئاسۆرین لە چەند بوارێکی ستراتیژیدا کاردەکات کە پێکەوە پێکهاتەی تەواوی خزمەتگوزارییەکانی بازرگانی و پیشەسازیمان دەگرنە خۆ.',
    act1_desc:'هاوردەکردن و دابینکردنی کەرەستەی خاوی پیشەسازی وەک، زەیتی خۆراکی خاو و پاڵێوراو، و کواسبی فول سۆیا بە بڕی گەورە بۆ کارگە و بازاڕەکان بەپێی ستانداردە نێودەوڵەتییەکان و مافی بەکارهێنانی براندە جیهانییەکان.',
    act2_desc:'پێشکەشکردنی ڕێکاری تەواوکاری لۆجیستی، بەڕێوەبردنی بارە نێودەوڵەتییەکان بە ڕێگەی دەریایی و زەمینی، گومرگکردن و کۆگاکردنی ڕێکخراو بە ئەوپەڕی ئاسایش و خێرایی.',
    act3_desc:'دیزاین، دابینکردن و دامەزراندنی هێڵی بەرهەمهێنانی پێشکەوتوو بۆ کارگەکان، هاوبەش لەگەڵ سیستەمی وزەی خۆری هاوچەرخ (Solar PV Solutions) بۆ کەمکردنەوەی تێچووی وزە و پاراستنی ژینگە.',
    act4_desc:'جێبەجێکردنی تەندەر و گرێبەستی گەورەی حکومی و تایبەت بۆ دابینکردنی پێداویستییە خێرا و ستراتیژییەکان، بە تایبەت لە کەرتی خۆراک و پشتیوانی مەیدانی.',
    act1_title:'١. بازرگانی گشتی و دابینکردنی نێودەوڵەتی', act2_title:'٢. خزمەتگوزارییە لۆجیستییەکان و زنجیرەی دابینکردن', act3_title:'٣. پڕۆژە و ڕێکارە پیشەسازییە تەواوکارەکان', act4_title:'٤. دابینکردنی پێداویستییە ستراتیژییەکان و تەندەرەکان',
    lbl_settings:'ڕێکخستن', settings_page_title:'ڕێکخستنی ئەژمار و وێبسایت', settings_page_sub:'دۆخی وێبسایت و پڕۆفایلەکەت بەم شێوەیە بەڕێوە ببە.',
    s_theme:'دۆخی ڕووناک/تاریک', s_theme_p:'دیمەنی وێبسایت بگۆڕە بەپێی حەزت', s_lang:'زمانی وێبسایت', s_lang_p:'کوردی، ئینگلیزی، عەرەبی، چینی', s_change:'گۆڕین',
    s_profile:'ناوی پڕۆفایل', s_profile_p:'دەستکاری ناو و زانیاری کەسیت بکە', s_edit:'دەستکاری', s_notif:'ئاگادارکردنەوەکان', s_notif_p:'ئاگاداری پەیامی نوێ ببەرەوە',
    s_delete:'سڕینەوەی ئەژمار', s_delete_p:'ئەم کردارە ناگەڕێتەوە و هەموو زانیارییەکانت دەسڕدرێتەوە', s_delete_btn:'سڕینەوە',
    lbl_about:'دەربارە', about_page_title:'دەربارەی ئاسۆرین', about_intro:'ئاسۆرین کۆمپانیایەکی بازرگانی و لۆجیستیی نێودەوڵەتییە کە لە چەند بوارێکی ستراتیژیدا کاردەکات:',
    p1_title:'بازرگانی گشتی و دابینکردنی نێودەوڵەتی', p1_b1_t:'دابینکردنی سەرمایە و کەرەستەی پیشەسازی', p1_b1_d:'هاوردەکردن و دابینکردنی کەرەستەی خاو بە بڕی گەورە بۆ کۆمپانیا و کارگەکان بە بەرزترین پێوەری کوالیتی نێودەوڵەتی.', p1_b2_t:'بازرگانیی بەرهەمە زەیتی و خۆراکییەکان', p1_b2_d:'دابینکردن و دابەشکردنی بەرهەمە خاو و پاڵێوراوەکان بۆ بازاڕە ناوخۆیی و هەرێمییەکان بەپێی گرێبەستی درێژخایەن.', p1_b3_t:'بریکارنامەی بازرگانی و دابەشکاری لەخۆگر', p1_b3_d:'وەرگرتنی مافی بەکارهێنان و دابەشکردنی نێودەوڵەتی (Exclusive Distribution) بۆ براندە جیهانییە پێشەنگەکان لە ناوچەکەدا.',
    p2_title:'خزمەتگوزارییە لۆجیستییەکان و زنجیرەی دابینکردن', p2_b1_t:'گواستنەوە و بەڕێوەبردنی بارە نێودەوڵەتییەکان', p2_b1_d:'گواستنەوەی کەرەستە و بەرهەمە بازرگانییەکان بە ڕێگەی دەریایی، ئاسمانی، و زەمینی بە بەرزترین ئاستی سۆزداری و ئاسایش.', p2_b2_t:'بەڕێوەبردنی عەمبار و کۆگاکردن', p2_b2_d:'دابینکردنی ڕێکاری پێشکەوتوو بۆ کۆگاکردنی کەرەستە بازرگانی و پیشەسازییەکان بە شێوازێکی تەندروست و پارێزراو.', p2_b3_t:'ڕێکارە گومرگی و بازرگانییەکان', p2_b3_d:'ڕاپەڕاندنی تەواوی مامەڵە یاسایی و گومرگییەکان بۆ ئاسانکاری لە جوڵەی کاڵا لە سنوور و بەندەرەکاندا.',
    p3_title:'پڕۆژە و ڕێکارە پیشەسازییە تەواوکارەکان', p3_b1_t:'پێشکەشکردنی هێڵی بەرهەمهێنانی هاوچەرخ', p3_b1_d:'دیزاین، دابینکردن، و دامەزراندنی کارگە و هێڵەکانی بەرهەمهێنان بە تەکنەلۆژیای پێشکەوتوو و بەرزترین کارایی.', p3_b2_t:'تێکەڵکردنی وزەی پاک و نوێبووەوە', p3_b2_d:'دابینکردن و جێبەجێکردنی سیستەمی وزەی خۆر بۆ کارگە و پڕۆژە پیشەسازییە گەورەکان بۆ کەمکردنەوەی تێچوو و پاراستنی ژینگە.',
    p4_title:'دابینکردنی پێداویستییە ستراتیژییەکان بۆ کەرتی گشتی و تایبەت', p4_b1_t:'پشتگیری و دابینکردنی تەندەرە گەورەکان', p4_b1_d:'بەشداری و جێبەجێکردنی تەندەر و گرێبەستی گەورە بۆ دابینکردنی پێداویستییە خێرا و درێژخایەنەکان لە کەرتی خۆراک، لۆجیستیک، و پشتیوانی مەیدانی.',
    contact_title:'پەیوەندیمان پێوە بکە', contact_sub:'بۆ پرسیار یان داواکاری بازرگانی، پەیوەندیمان پێوە بکە.', phone_label:'ژمارە تەلەفۆن', whatsapp_label:'واتساپ',
    footer_note:'GENERAL TRADING · LOGISTICS · INDUSTRIAL SOLUTIONS', modal_wa:'وەڵام لە واتساپ' },
  en: { brand:'ASORIN', nav_home:'Home', nav_products:'Fields & Activities', nav_settings:'Settings', nav_about:'About',
    lbl_home:'Home', hv_title:'Our Key Fields', hero_title:'Welcome to<br><span class="accent">ASORIN Company</span>', hero_sub:'ASORIN is an international trading and logistics company, active in general trading, supply chain services, turnkey industrial solutions, and strategic tender supply.',
    cta_shop:'See our fields of work', cta_about:'Learn more', stat_products:'Strategic fields', stat_sections:'Trading services', stat_langs:'Languages',
    vr_ref:'Product code', vr_stock:'Availability', vr_stock_val:'In stock',
    lbl_products:'Fields & Activities', prod_page_title:'ASORIN Fields & Activities', prod_page_sub:'ASORIN operates across several strategic fields that together form our full range of trading and industrial services.',
    act1_desc:'Importing and supplying industrial raw materials such as crude and refined edible oil, and full-fat soybean meal, in bulk to factories and markets according to international standards and licensed use of global brands.',
    act2_desc:'Providing comprehensive logistics solutions, managing international shipments by sea and land, and organized customs clearance and warehousing with the utmost safety and speed.',
    act3_desc:'Designing, supplying, and installing advanced production lines for factories, integrated with modern Solar PV Solutions to reduce energy costs and protect the environment.',
    act4_desc:'Executing tenders and major government and private contracts to supply urgent and strategic needs, particularly in the food sector and field support.',
    act1_title:'1. General Trading & International Procurement', act2_title:'2. Logistics & Supply Chain Services', act3_title:'3. Turnkey Industrial Solutions', act4_title:'4. Strategic Procurement & Tenders',
    lbl_settings:'Settings', settings_page_title:'Account & Website Settings', settings_page_sub:'Manage your website appearance and profile.',
    s_theme:'Light/Dark Mode', s_theme_p:'Change the site appearance to your liking', s_lang:'Website Language', s_lang_p:'Kurdish, English, Arabic, Chinese', s_change:'Change',
    s_profile:'Profile Name', s_profile_p:'Edit your name and personal info', s_edit:'Edit', s_notif:'Notifications', s_notif_p:'Get notified of new messages',
    s_delete:'Delete Account', s_delete_p:'This action is irreversible and deletes all your data', s_delete_btn:'Delete',
    lbl_about:'About', about_page_title:'About ASORIN', about_intro:'ASORIN is an international trading and logistics company operating across several strategic fields:',
    p1_title:'General Trading & International Procurement', p1_b1_t:'Industrial Supply & Raw Materials', p1_b1_d:'Importing and supplying raw materials in bulk for companies and factories to the highest international quality standards.', p1_b2_t:'Oil & Food Products Trading', p1_b2_d:'Supplying and distributing raw and refined products to local and regional markets under long-term contracts.', p1_b3_t:'Exclusive Trade & Distribution Agency', p1_b3_d:'Securing exclusive distribution rights for leading global brands across the region.',
    p2_title:'Logistics & Supply Chain Management', p2_b1_t:'International Freight Management', p2_b1_d:'Shipping goods by sea, air, and land with the highest standards of care and safety.', p2_b2_t:'Warehousing & Storage', p2_b2_d:'Advanced storage solutions for commercial and industrial materials, safely and reliably.', p2_b3_t:'Customs & Trade Procedures', p2_b3_d:'Handling all legal and customs formalities to ease the movement of goods across borders and ports.',
    p3_title:'Turnkey Industrial Solutions', p3_b1_t:'Modern Production Lines', p3_b1_d:'Designing, supplying, and installing factories and production lines with advanced, high-efficiency technology.', p3_b2_t:'Clean & Renewable Energy', p3_b2_d:'Supplying and implementing solar energy systems for large industrial facilities to cut costs and protect the environment.',
    p4_title:'Strategic Procurement & Tender Supply', p4_b1_t:'Large-Scale Tender Support', p4_b1_d:'Participating in and fulfilling major tenders and contracts for urgent and long-term supply needs in the food, logistics, and field support sectors.',
    contact_title:'Contact Us', contact_sub:'For inquiries or business requests, reach out to us.', phone_label:'Phone Number', whatsapp_label:'WhatsApp',
    footer_note:'GENERAL TRADING · LOGISTICS · INDUSTRIAL SOLUTIONS', modal_wa:'Reply on WhatsApp' },
  ar: { brand:'أسورين', nav_home:'الرئيسية', nav_products:'المجالات والأنشطة', nav_settings:'الإعدادات', nav_about:'من نحن',
    lbl_home:'الرئيسية', hv_title:'مجالات عملنا الرئيسية', hero_title:'مرحبًا بكم في<br><span class="accent">شركة أسورين</span>', hero_sub:'أسورين شركة تجارة ولوجستيات دولية، تعمل في التجارة العامة، خدمات سلسلة التوريد، الحلول الصناعية المتكاملة، والتوريد الاستراتيجي للعطاءات.',
    cta_shop:'تعرف على مجالات عملنا', cta_about:'اعرف المزيد', stat_products:'مجالات استراتيجية', stat_sections:'خدمات تجارية', stat_langs:'لغات',
    vr_ref:'كود المنتج', vr_stock:'التوفر', vr_stock_val:'متوفر',
    lbl_products:'المجالات والأنشطة', prod_page_title:'مجالات وأنشطة أسورين', prod_page_sub:'تعمل أسورين في عدة مجالات استراتيجية تشكل معًا مجموعة خدماتنا التجارية والصناعية الكاملة.',
    act1_desc:'استيراد وتوفير المواد الصناعية الخام مثل الزيت الغذائي الخام والمكرر، وكسبة فول الصويا الكاملة الدسم، بكميات كبيرة للمصانع والأسواق وفق المعايير الدولية وحقوق استخدام العلامات التجارية العالمية.',
    act2_desc:'تقديم حلول لوجستية متكاملة، وإدارة الشحنات الدولية عبر البحر والبر، والتخليص الجمركي والتخزين المنظم بأعلى مستويات الأمان والسرعة.',
    act3_desc:'تصميم وتوريد وتركيب خطوط إنتاج متطورة للمصانع، بالتكامل مع أنظمة الطاقة الشمسية الحديثة (Solar PV Solutions) لخفض تكاليف الطاقة وحماية البيئة.',
    act4_desc:'تنفيذ المناقصات والعقود الحكومية والخاصة الكبرى لتوريد الاحتياجات العاجلة والاستراتيجية، وبالأخص في قطاع الغذاء والدعم الميداني.',
    act1_title:'١. التجارة العامة والتوريد الدولي', act2_title:'٢. الخدمات اللوجستية وسلسلة التوريد', act3_title:'٣. المشاريع والحلول الصناعية المتكاملة', act4_title:'٤. توريد الاحتياجات الاستراتيجية والمناقصات',
    lbl_settings:'الإعدادات', settings_page_title:'إعدادات الحساب والموقع', settings_page_sub:'أدر مظهر الموقع وملفك الشخصي.',
    s_theme:'الوضع الفاتح/الداكن', s_theme_p:'غيّر مظهر الموقع كما تفضل', s_lang:'لغة الموقع', s_lang_p:'كردية، إنجليزية، عربية، صينية', s_change:'تغيير',
    s_profile:'اسم الملف الشخصي', s_profile_p:'عدّل اسمك ومعلوماتك الشخصية', s_edit:'تعديل', s_notif:'الإشعارات', s_notif_p:'احصل على تنبيه بالرسائل الجديدة',
    s_delete:'حذف الحساب', s_delete_p:'هذا الإجراء لا رجعة فيه ويحذف جميع بياناتك', s_delete_btn:'حذف',
    lbl_about:'من نحن', about_page_title:'عن أسورين', about_intro:'أسورين شركة تجارة ولوجستيات دولية تعمل في عدة مجالات استراتيجية:',
    p1_title:'التجارة العامة والتوريد الدولي', p1_b1_t:'توريد المواد الصناعية الخام', p1_b1_d:'استيراد وتوفير المواد الخام بكميات كبيرة للشركات والمصانع وفق أعلى معايير الجودة العالمية.', p1_b2_t:'تجارة المنتجات النفطية والغذائية', p1_b2_d:'توريد وتوزيع المنتجات الخام والمكررة للأسواق المحلية والإقليمية بعقود طويلة الأمد.', p1_b3_t:'وكالات التجارة والتوزيع الحصري', p1_b3_d:'الحصول على حقوق التوزيع الحصري لعلامات تجارية عالمية رائدة في المنطقة.',
    p2_title:'الخدمات اللوجستية وإدارة سلسلة التوريد', p2_b1_t:'إدارة الشحنات الدولية', p2_b1_d:'نقل البضائع بحرًا وجوًا وبرًا بأعلى مستويات العناية والأمان.', p2_b2_t:'إدارة المستودعات والتخزين', p2_b2_d:'حلول تخزين متقدمة للمواد التجارية والصناعية بطريقة آمنة وسليمة.', p2_b3_t:'الإجراءات الجمركية والتجارية', p2_b3_d:'إنجاز كافة المعاملات القانونية والجمركية لتسهيل حركة البضائع عبر الحدود والموانئ.',
    p3_title:'الحلول الصناعية المتكاملة', p3_b1_t:'خطوط الإنتاج الحديثة', p3_b1_d:'تصميم وتوريد وتركيب المصانع وخطوط الإنتاج بتقنيات متطورة وكفاءة عالية.', p3_b2_t:'الطاقة النظيفة والمتجددة', p3_b2_d:'توريد وتنفيذ أنظمة الطاقة الشمسية للمصانع والمشاريع الصناعية الكبرى لخفض التكاليف وحماية البيئة.',
    p4_title:'التوريد الاستراتيجي والعطاءات', p4_b1_t:'دعم وتنفيذ المناقصات الكبرى', p4_b1_d:'المشاركة وتنفيذ المناقصات والعقود الكبرى لتوريد الاحتياجات العاجلة وطويلة الأمد في قطاعات الغذاء واللوجستيات والدعم الميداني.',
    contact_title:'تواصل معنا', contact_sub:'لأي استفسار أو طلب تجاري، تواصل معنا.', phone_label:'رقم الهاتف', whatsapp_label:'واتساب',
    footer_note:'GENERAL TRADING · LOGISTICS · INDUSTRIAL SOLUTIONS', modal_wa:'الرد عبر واتساب' },
  zh: { brand:'ASORIN 阿索林', nav_home:'首页', nav_products:'业务领域', nav_settings:'设置', nav_about:'关于我们',
    lbl_home:'首页', hv_title:'我们的主要领域', hero_title:'欢迎来到<br><span class="accent">ASORIN 公司</span>', hero_sub:'ASORIN 是一家国际贸易与物流公司，业务涵盖全面贸易、供应链服务、交钥匙工业解决方案以及战略招标供应。',
    cta_shop:'查看我们的业务领域', cta_about:'了解更多', stat_products:'战略领域', stat_sections:'贸易服务', stat_langs:'语言',
    vr_ref:'产品编号', vr_stock:'库存', vr_stock_val:'有货',
    lbl_products:'业务领域', prod_page_title:'ASORIN 的业务领域', prod_page_sub:'ASORIN 在多个战略领域开展业务，共同构成我们完整的贸易与工业服务体系。',
    act1_desc:'大批量进口并供应工业原材料，如原油及精炼食用油、全脂大豆粕，供应工厂和市场，符合国际标准并获得全球品牌的使用授权。',
    act2_desc:'提供全面的物流解决方案，通过海运和陆运管理国际货运，并进行有序的清关和仓储，确保最高的安全性和速度。',
    act3_desc:'为工厂设计、供应并安装先进的生产线，并与现代太阳能光伏系统（Solar PV Solutions）相结合，以降低能源成本并保护环境。',
    act4_desc:'执行招标及大型政府与私营合同，供应紧急和战略性需求，尤其是在食品行业和现场支持方面。',
    act1_title:'1. 全面贸易与国际采购', act2_title:'2. 物流服务与供应链', act3_title:'3. 交钥匙工业项目与解决方案', act4_title:'4. 战略物资与招标供应',
    lbl_settings:'设置', settings_page_title:'账户与网站设置', settings_page_sub:'管理您的网站外观和个人资料。',
    s_theme:'明暗模式', s_theme_p:'根据喜好更改网站外观', s_lang:'网站语言', s_lang_p:'库尔德语、英语、阿拉伯语、中文', s_change:'更改',
    s_profile:'个人资料名称', s_profile_p:'编辑您的姓名和个人信息', s_edit:'编辑', s_notif:'通知', s_notif_p:'接收新消息提醒',
    s_delete:'删除账户', s_delete_p:'此操作不可撤销，将删除您的所有数据', s_delete_btn:'删除',
    lbl_about:'关于我们', about_page_title:'关于 ASORIN', about_intro:'ASORIN 是一家国际贸易与物流公司，业务涵盖多个战略领域：',
    p1_title:'全面贸易与国际采购', p1_b1_t:'工业物资供应', p1_b1_d:'大批量进口并供应原材料给企业和工厂，符合最高国际质量标准。', p1_b2_t:'石油与食品贸易', p1_b2_d:'按长期合同向本地和区域市场供应原材料及精炼产品。', p1_b3_t:'独家代理与经销', p1_b3_d:'获得全球领先品牌在本地区的独家经销权。',
    p2_title:'物流与供应链管理', p2_b1_t:'国际货运管理', p2_b1_d:'以最高安全标准通过海运、空运和陆运运输货物。', p2_b2_t:'仓储管理', p2_b2_d:'为商业和工业物资提供先进、安全的仓储解决方案。', p2_b3_t:'海关与贸易手续', p2_b3_d:'办理所有法律和海关手续，便利货物跨境和港口流通。',
    p3_title:'交钥匙工业解决方案', p3_b1_t:'现代化生产线', p3_b1_d:'设计、供应并安装采用先进技术、高效率的工厂和生产线。', p3_b2_t:'清洁与可再生能源', p3_b2_d:'为大型工业项目供应并实施太阳能系统，降低成本并保护环境。',
    p4_title:'战略采购与招标供应', p4_b1_t:'大型招标支持', p4_b1_d:'参与并履行食品、物流和现场支持领域的紧急及长期招标合同。',
    contact_title:'联系我们', contact_sub:'如有咨询或业务需求，请联系我们。', phone_label:'电话号码', whatsapp_label:'WhatsApp',
    footer_note:'GENERAL TRADING · LOGISTICS · INDUSTRIAL SOLUTIONS', modal_wa:'通过WhatsApp回复' }
};

function applyLang(){
  const html = document.documentElement;
  html.setAttribute('dir', (currentLang === 'ar' || currentLang === 'ckb') ? 'rtl' : 'ltr');
  html.setAttribute('lang', currentLang);
  document.querySelectorAll('[lang-target]').forEach(el => {
    const key = el.getAttribute('lang-target');
    if (dict[currentLang][key]) el.innerHTML = dict[currentLang][key];
  });
  const langSelectEl = document.getElementById('langSelect');
  const settingsLangSelectEl = document.getElementById('settingsLangSelect');
  if (langSelectEl) langSelectEl.value = currentLang;
  if (settingsLangSelectEl) settingsLangSelectEl.value = currentLang;
  try { localStorage.setItem('asorin_lang', currentLang); } catch (e) { /* storage unavailable */ }
  renderGrid();
}
