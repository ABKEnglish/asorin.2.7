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

// ---------- Product data (no prices) ----------
const products = [
  { id:1, cat:'electronics', img:'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500&q=60', code:'ELC-1042', ku:{n:'هێدفۆنی بێ وایەر', d:'کوالێتی دەنگی بەرز، بەتەری ٣٠ کاتژمێر، پەیوەندی بلوتوس V5.3.'}, en:{n:'Wireless Headphones', d:'High-quality sound, 30h battery, Bluetooth V5.3.'}, ar:{n:'سماعات لاسلكية', d:'صوت عالي الجودة، بطارية 30 ساعة، بلوتوث V5.3.'}, zh:{n:'无线耳机', d:'高音质，30小时电池续航，蓝牙V5.3。'} },
  { id:2, cat:'electronics', img:'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&q=60', code:'ELC-1071', ku:{n:'شارژەری خێرای مۆبایل', d:'وات ٦٥، پشتگیری بۆ هەموو جۆرەکانی مۆبایل و لاپتۆپ.'}, en:{n:'Fast Mobile Charger', d:'65W, supports all phone and laptop types.'}, ar:{n:'شاحن سريع للجوال', d:'65 واط، يدعم جميع أنواع الهواتف واللابتوب.'}, zh:{n:'快速手机充电器', d:'65瓦，支持所有手机和笔记本电脑类型。'} },
  { id:3, cat:'electronics', img:'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=60', code:'ELC-1098', ku:{n:'سپیکەری بلوتوس', d:'دەنگی بەهێز، خۆڕاگری لە ئاو، باتەری درێژخایەن.'}, en:{n:'Bluetooth Speaker', d:'Powerful sound, water resistant, long battery life.'}, ar:{n:'سماعة بلوتوث', d:'صوت قوي، مقاومة للماء، بطارية طويلة الأمد.'}, zh:{n:'蓝牙音箱', d:'强劲音效，防水，长效电池。'} },
  { id:4, cat:'food', img:'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=60', code:'FD-2011', ku:{n:'زەیتی زەیتوونی سروشتی', d:'دەرهێنراو لە زەیتوونی چنراوی دەستی، ١ لیتر.'}, en:{n:'Natural Olive Oil', d:'Extracted from hand-picked olives, 1 liter.'}, ar:{n:'زيت زيتون طبيعي', d:'مستخرج من زيتون مقطوف يدويًا، 1 لتر.'}, zh:{n:'天然橄榄油', d:'手工采摘橄榄榨取，1升装。'} },
  { id:5, cat:'food', img:'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&q=60', code:'FD-2033', ku:{n:'هەنگوینی چیایی', d:'کۆکراوەتەوە لە هەورازەکانی کوردستان، ٥٠٠ گرام.'}, en:{n:'Mountain Honey', d:'Harvested from the mountains of Kurdistan, 500g.'}, ar:{n:'عسل جبلي', d:'يُجمع من جبال كردستان، 500 غرام.'}, zh:{n:'山地蜂蜜', d:'采自库尔德斯坦山区，500克。'} },
  { id:6, cat:'food', img:'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500&q=60', code:'FD-2059', ku:{n:'قاوەی برژاوی تازە', d:'برژاوی تازە بە ڕۆشی مامناوەند، ٢٥٠ گرام.'}, en:{n:'Fresh Roasted Coffee', d:'Medium roast, freshly ground, 250g.'}, ar:{n:'قهوة محمصة طازجة', d:'تحميص متوسط، طازجة، 250 غرام.'}, zh:{n:'新鲜烘焙咖啡', d:'中度烘焙，新鲜研磨，250克。'} },
];

let currentLang = 'ckb';
let currentCat = 'all';
const catLabelMap = { electronics: {ckb:'ئەلیکترۆنی',en:'Electronics',ar:'إلكترونيات',zh:'电子产品'}, food: {ckb:'خۆراک',en:'Grocery',ar:'أغذية',zh:'食品'} };
const stockLabelMap = { ckb:'بەردەستە', en:'In stock', ar:'متوفر', zh:'现货' };

function renderGrid(){
  const grid = document.getElementById('grid');
  if (!grid) return;
  const filtered = products.filter(p => currentCat === 'all' || p.cat === currentCat);
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
  grid.querySelectorAll('.p-card').forEach(card => card.addEventListener('click', () => openModal(parseInt(card.dataset.id))));
}

function openModal(id){
  const p = products.find(x => x.id === id);
  const t = p[currentLang] || p.ku;
  document.getElementById('modalImg').src = p.img;
  document.getElementById('modalBadge').textContent = catLabelMap[p.cat][currentLang];
  document.getElementById('modalBadge').className = 'badge ' + p.cat;
  document.getElementById('modalTitle').textContent = t.n;
  document.getElementById('modalCode').textContent = p.code;
  document.getElementById('modalDesc').textContent = t.d;
  const chatBtn = document.getElementById('modalChatBtn');
  if (chatBtn) chatBtn.href = 'chat.html?product=' + p.id;
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
  initChatProductContext();

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

// ---- Chat: show the product image when arriving from a product's "Chat about this item" button ----
let contextProductId = null;

function initChatProductContext(){
  const params = new URLSearchParams(window.location.search);
  const pid = params.get('product');
  if (pid) contextProductId = pid;
  renderChatProductContext();
}

function renderChatProductContext(){
  const chatBody = document.getElementById('chatBody');
  if (!chatBody || !contextProductId) return;
  const p = products.find(x => String(x.id) === String(contextProductId));
  if (!p) return;
  const t = p[currentLang] || p.ku;
  const existing = document.getElementById('productContextMsg');
  if (existing) existing.remove();
  const wrapper = document.createElement('div');
  wrapper.className = 'msg out';
  wrapper.id = 'productContextMsg';
  wrapper.innerHTML = `<div class="bubble" style="padding:8px;">
      <img src="${p.img}" alt="${t.n}" style="width:100%; max-width:220px; border-radius:8px; display:block; margin-bottom:8px;">
      <b style="display:block; font-size:0.85rem;">${t.n}</b>
      <span class="mono" style="font-size:0.72rem; color:rgba(255,255,255,0.7);">${p.code}</span>
    </div>`;
  chatBody.insertBefore(wrapper, chatBody.firstChild);
}

// ---------- i18n ----------
const dict = {
  ckb: { brand:'ئاسۆرین', nav_home:'سەرەکی', nav_products:'کاڵاکان', nav_chat:'چات', nav_settings:'ڕێکخستن', nav_about:'دەربارە',
    lbl_home:'سەرەکی', hero_title:'پێداویستی رۆژانەت<br><span class="accent">لە یەک شوێن</span>', hero_sub:'ئاسۆرین کاڵای ئەلیکترۆنی و خۆراکی جێگیر بە کوالێتی بەرز پێشکەش دەکات، بە خزمەتگوزاری خێرا و متمانەپێکراو.',
    cta_shop:'سەیری کاڵاکان بکە', cta_about:'زیاتر بزانە', stat_products:'کاڵای تۆمارکراو', stat_sections:'بەشی کاڵا', stat_langs:'زمان',
    vr_ref:'کۆدی کاڵا', vr_stock:'بەردەستی', vr_stock_val:'هەیە',
    lbl_products:'کاڵاکان', prod_page_title:'کاڵاکانمان', prod_page_sub:'هەموو کاڵاکانی تۆمارکراو، دابەشکراو بەسەر دوو بەشی سەرەکیدا.', cat_all:'هەموو', cat_elec:'ئەلیکترۆنی', cat_food:'خۆراک',
    lbl_chat:'چات', chat_page_title:'پەیوەندی ڕاستەوخۆ لەگەڵ ئاسۆرین', chat_page_sub:'هەر پرسیارێکت هەبێت لەسەر کاڵایەک، ڕاستەوخۆ لێرە پەیامی بۆ ناردین. پەیامەکان دوای ٤٨ کاتژمێر بە شێوەیەکی خۆکار دەسڕدرێنەوە.',
    chat_brand:'پشتگیری ئاسۆرین', chat_online:'● ئۆنلاینە', chat_msg1:'سڵاو، ئایا ئەم هێدفۆنە پشتگیری بلوتوس ٥.٣ دەکات؟', chat_msg2:'سڵاو بەخێربێیت، بەڵێ، پشتگیری V5.3 دەکات و باتەریەکەی ٣٠ کاتژمێرە.', chat_translate:'🌐 وەرگێڕان', chat_send:'ناردن', chat_note:'پێویستە ئەژمارت هەبێت بۆ چاتکردن. تەنها تۆ و ئاسۆرین دەتوانن پەیامەکان ببینن.',
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
    footer_note:'GENERAL TRADING · LOGISTICS · INDUSTRIAL SOLUTIONS', modal_chat:'چات لەسەر ئەم کاڵایە', modal_wa:'وەڵام لە واتساپ' },
  en: { brand:'ASORIN', nav_home:'Home', nav_products:'Products', nav_chat:'Chat', nav_settings:'Settings', nav_about:'About',
    lbl_home:'Home', hero_title:'Everyday essentials,<br><span class="accent">one place</span>', hero_sub:'ASORIN supplies reliable electronics and groceries with high quality, fast and trusted service.',
    cta_shop:'Browse products', cta_about:'Learn more', stat_products:'Listed products', stat_sections:'Categories', stat_langs:'Languages',
    vr_ref:'Product code', vr_stock:'Availability', vr_stock_val:'In stock',
    lbl_products:'Products', prod_page_title:'Our Products', prod_page_sub:'All listed products, split across two main categories.', cat_all:'All', cat_elec:'Electronics', cat_food:'Grocery',
    lbl_chat:'Chat', chat_page_title:'Talk directly with ASORIN', chat_page_sub:'Have a question about a product? Message us here directly. Messages auto-delete after 48 hours.',
    chat_brand:'ASORIN Support', chat_online:'● Online', chat_msg1:'Hi, does this headphone support Bluetooth 5.3?', chat_msg2:'Hello! Yes, it supports V5.3 and has a 30-hour battery.', chat_translate:'🌐 Translate', chat_send:'Send', chat_note:'An account is required to chat. Only you and ASORIN can see the messages.',
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
    footer_note:'GENERAL TRADING · LOGISTICS · INDUSTRIAL SOLUTIONS', modal_chat:'Chat about this item', modal_wa:'Reply on WhatsApp' },
  ar: { brand:'أسورين', nav_home:'الرئيسية', nav_products:'المنتجات', nav_chat:'الدردشة', nav_settings:'الإعدادات', nav_about:'من نحن',
    lbl_home:'الرئيسية', hero_title:'احتياجاتك اليومية<br><span class="accent">في مكان واحد</span>', hero_sub:'تقدم أسورين إلكترونيات ومواد غذائية موثوقة بجودة عالية وخدمة سريعة وموثوقة.',
    cta_shop:'تصفح المنتجات', cta_about:'اعرف المزيد', stat_products:'منتج مسجل', stat_sections:'أقسام', stat_langs:'لغات',
    vr_ref:'كود المنتج', vr_stock:'التوفر', vr_stock_val:'متوفر',
    lbl_products:'المنتجات', prod_page_title:'منتجاتنا', prod_page_sub:'جميع المنتجات المسجلة، موزعة على قسمين رئيسيين.', cat_all:'الكل', cat_elec:'إلكترونيات', cat_food:'أغذية',
    lbl_chat:'الدردشة', chat_page_title:'تواصل مباشرة مع أسورين', chat_page_sub:'لديك سؤال عن منتج؟ راسلنا مباشرة هنا. تُحذف الرسائل تلقائيًا بعد 48 ساعة.',
    chat_brand:'دعم أسورين', chat_online:'● متصل', chat_msg1:'مرحبًا، هل تدعم هذه السماعة بلوتوث 5.3؟', chat_msg2:'مرحبًا بك، نعم تدعم V5.3 والبطارية تدوم 30 ساعة.', chat_translate:'🌐 ترجمة', chat_send:'إرسال', chat_note:'يلزم وجود حساب للدردشة. أنت وأسورين فقط من يمكنكما رؤية الرسائل.',
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
    footer_note:'GENERAL TRADING · LOGISTICS · INDUSTRIAL SOLUTIONS', modal_chat:'الدردشة حول هذا المنتج', modal_wa:'الرد عبر واتساب' },
  zh: { brand:'ASORIN 阿索林', nav_home:'首页', nav_products:'产品', nav_chat:'聊天', nav_settings:'设置', nav_about:'关于我们',
    lbl_home:'首页', hero_title:'日常所需，<br><span class="accent">一站搞定</span>', hero_sub:'ASORIN 提供高品质、快速可靠的电子产品和食品杂货服务。',
    cta_shop:'浏览产品', cta_about:'了解更多', stat_products:'已上架产品', stat_sections:'分类', stat_langs:'语言',
    vr_ref:'产品编号', vr_stock:'库存', vr_stock_val:'有货',
    lbl_products:'产品', prod_page_title:'我们的产品', prod_page_sub:'所有上架产品，分为两大类别。', cat_all:'全部', cat_elec:'电子产品', cat_food:'食品',
    lbl_chat:'聊天', chat_page_title:'直接联系 ASORIN', chat_page_sub:'对产品有疑问？直接在此给我们发消息。消息将在48小时后自动删除。',
    chat_brand:'ASORIN 客服', chat_online:'● 在线', chat_msg1:'您好，这款耳机支持蓝牙5.3吗？', chat_msg2:'您好，是的，支持V5.3，电池续航30小时。', chat_translate:'🌐 翻译', chat_send:'发送', chat_note:'聊天需要账户。只有您和ASORIN可以看到消息。',
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
    footer_note:'GENERAL TRADING · LOGISTICS · INDUSTRIAL SOLUTIONS', modal_chat:'咨询此商品', modal_wa:'通过WhatsApp回复' }
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
  renderChatProductContext();
}
