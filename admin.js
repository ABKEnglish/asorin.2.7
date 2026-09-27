// ==================== Tabs ====================
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.panel).classList.add('active');
    const titleEl = document.getElementById('adminPageTitle');
    if (titleEl && tab.dataset.title) titleEl.textContent = tab.dataset.title;
  });
});

// ==================== Products ====================
const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&q=60';
let selectedImageData = null;

const fileInput = document.getElementById('productImage');
const fileDrop = document.getElementById('fileDrop');
const filePreview = document.getElementById('filePreview');
const fileDropText = document.getElementById('fileDropText');

if (fileInput) {
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      selectedImageData = reader.result;
      filePreview.src = selectedImageData;
      filePreview.style.display = 'block';
      fileDropText.textContent = file.name;
    };
    reader.readAsDataURL(file);
  });
}

function saveAdminProducts(list){
  try { localStorage.setItem('asorin_admin_products', JSON.stringify(list)); } catch (e) {}
}
function saveDeletedIds(list){
  try { localStorage.setItem('asorin_deleted_ids', JSON.stringify(list)); } catch (e) {}
}
function saveProductOverrides(obj){
  try { localStorage.setItem('asorin_product_overrides', JSON.stringify(obj)); } catch (e) {}
}

let editingProductId = null;
const productForm = document.getElementById('productForm');
const productSubmitBtn = document.getElementById('productSubmitBtn');
const productCancelBtn = document.getElementById('productCancelBtn');

function resetProductForm(){
  productForm.reset();
  selectedImageData = null;
  filePreview.style.display = 'none';
  fileDropText.textContent = 'کلیک بکە بۆ هەڵبژاردنی وێنە';
  editingProductId = null;
  productSubmitBtn.textContent = 'زیادکردنی کاڵا';
  productCancelBtn.style.display = 'none';
}

function startEditProduct(id){
  const p = getAllProducts().find(x => String(x.id) === String(id));
  if (!p) return;
  editingProductId = p.id;
  document.getElementById('productName').value = p.ku.n;
  document.getElementById('productDesc').value = p.ku.d;
  document.getElementById('productCat').value = p.cat;
  document.getElementById('productCode').value = p.code;
  selectedImageData = p.img;
  filePreview.src = p.img;
  filePreview.style.display = 'block';
  fileDropText.textContent = 'وێنەی نوێ هەڵبژێرە بۆ گۆڕینی وێنەکە';
  productSubmitBtn.textContent = 'پاشەکەوتکردنی گۆڕانکاری';
  productCancelBtn.style.display = 'inline-flex';
  productForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

if (productCancelBtn) productCancelBtn.addEventListener('click', resetProductForm);

if (productForm) {
  productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('productName').value.trim();
    const desc = document.getElementById('productDesc').value.trim();
    const cat = document.getElementById('productCat').value;
    const code = document.getElementById('productCode').value.trim() || ('ASR-' + Math.floor(1000 + Math.random() * 9000));
    if (!name || !desc) return;

    const fields = {
      cat: cat,
      img: selectedImageData || PLACEHOLDER_IMG,
      code: code,
      ku: { n: name, d: desc },
      en: { n: name, d: desc },
      ar: { n: name, d: desc },
      zh: { n: name, d: desc }
    };

    if (editingProductId !== null) {
      const idNum = Number(editingProductId);
      if (!isNaN(idNum) && products.some(p => p.id === idNum)) {
        // Editing a base sample product -> save as an override
        const overrides = getProductOverrides();
        overrides[idNum] = fields;
        saveProductOverrides(overrides);
      } else {
        // Editing an admin-added product -> update it in place
        const list = getAdminProducts();
        const idx = list.findIndex(p => String(p.id) === String(editingProductId));
        if (idx !== -1) { list[idx] = Object.assign({ id: editingProductId }, fields); saveAdminProducts(list); }
      }
    } else {
      // New product
      const newProduct = Object.assign({ id: 'a' + Date.now() }, fields);
      const list = getAdminProducts();
      list.push(newProduct);
      saveAdminProducts(list);
    }

    resetProductForm();
    renderAdminProductList();
  });
}

function renderAdminProductList(){
  const container = document.getElementById('adminProductList');
  if (!container) return;
  const all = getAllProducts();
  if (typeof renderStats === 'function') renderStats();
  if (all.length === 0) {
    container.innerHTML = '<div class="admin-empty">هیچ کاڵایەک تۆمار نەکراوە</div>';
    return;
  }
  container.innerHTML = all.map(p => {
    const t = p.ku;
    const isBase = typeof p.id === 'number';
    return `<div class="admin-list-row" data-id="${p.id}">
      <img class="thumb" src="${p.img}" alt="">
      <div class="info">
        <h4>${t.n}</h4>
        <p>${p.code} · ${p.cat === 'electronics' ? 'ئەلیکترۆنی' : 'خۆراک'}${isBase ? ' · نموونەی سەرەکی' : ''}</p>
      </div>
      <div class="actions">
        <button class="btn btn-outline btn-sm" data-edit="${p.id}">دەستکاری</button>
        <button class="btn btn-danger btn-sm" data-del="${p.id}">سڕینەوە</button>
      </div>
    </div>`;
  }).join('');

  container.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => startEditProduct(btn.getAttribute('data-edit')));
  });

  container.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-del');
      const idNum = Number(id);
      if (!isNaN(idNum) && products.some(p => p.id === idNum)) {
        // Base sample product -> mark as deleted
        const deleted = getDeletedIds();
        if (!deleted.includes(idNum)) deleted.push(idNum);
        saveDeletedIds(deleted);
        // Also drop any override for it, no longer needed
        const overrides = getProductOverrides();
        delete overrides[idNum];
        saveProductOverrides(overrides);
      } else {
        // Admin-added product -> remove from admin list
        const list = getAdminProducts().filter(p => String(p.id) !== String(id));
        saveAdminProducts(list);
      }
      if (String(editingProductId) === String(id)) resetProductForm();
      renderAdminProductList();
    });
  });
}

// ==================== Users (demo data + localStorage overrides) ====================
const seedUsers = [
  { id: 'u1', name: 'ئارام ڕەشید', email: 'aram@example.com', joined: '2026/06/12' },
  { id: 'u2', name: 'سارا کەریم', email: 'sara@example.com', joined: '2026/07/03' },
  { id: 'u3', name: 'هێمن عوسمان', email: 'hemn@example.com', joined: '2026/08/21' },
  { id: 'u4', name: 'شنە ئازاد', email: 'shne@example.com', joined: '2026/08/29' }
];

function getUserOverrides(){
  try { return JSON.parse(localStorage.getItem('asorin_user_overrides') || '{}'); }
  catch (e) { return {}; }
}
function saveUserOverrides(obj){
  try { localStorage.setItem('asorin_user_overrides', JSON.stringify(obj)); } catch (e) {}
}

function renderUserList(){
  const container = document.getElementById('userList');
  if (!container) return;
  if (typeof renderStats === 'function') renderStats();
  const overrides = getUserOverrides();
  const visible = seedUsers.filter(u => !(overrides[u.id] && overrides[u.id].deleted));
  if (visible.length === 0) {
    container.innerHTML = '<div class="admin-empty">هیچ ئەژمارێک نییە</div>';
    return;
  }
  container.innerHTML = visible.map(u => {
    const blocked = overrides[u.id] && overrides[u.id].blocked;
    return `<div class="admin-list-row" data-uid="${u.id}">
      <span class="avatar" style="width:52px;height:52px;border-radius:10px;display:flex;align-items:center;justify-content:center;">${u.name.charAt(0)}</span>
      <div class="info">
        <h4>${u.name} <span class="status-pill ${blocked ? 'blocked' : 'active'}">${blocked ? 'بلۆککراو' : 'چالاک'}</span></h4>
        <p>${u.email} · تۆمارکراو لە ${u.joined}</p>
      </div>
      <div class="actions">
        <button class="btn btn-outline btn-sm" data-toggle="${u.id}">${blocked ? 'لابردنی بلۆک' : 'بلۆککردن'}</button>
        <button class="btn btn-danger btn-sm" data-deluser="${u.id}">سڕینەوە</button>
      </div>
    </div>`;
  }).join('');

  container.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-toggle');
      const overrides = getUserOverrides();
      overrides[id] = overrides[id] || {};
      overrides[id].blocked = !overrides[id].blocked;
      saveUserOverrides(overrides);
      renderUserList();
    });
  });
  container.querySelectorAll('[data-deluser]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-deluser');
      const overrides = getUserOverrides();
      overrides[id] = overrides[id] || {};
      overrides[id].deleted = true;
      saveUserOverrides(overrides);
      renderUserList();
    });
  });
}

// ==================== Stats ====================
function renderStats(){
  const statsEl = document.getElementById('adminStats');
  if (!statsEl) return;
  const deleted = getDeletedIds();
  const totalProducts = products.filter(p => !deleted.includes(p.id)).length + getAdminProducts().length;
  const overrides = getUserOverrides();
  const visibleUsers = seedUsers.filter(u => !(overrides[u.id] && overrides[u.id].deleted));
  const blockedUsers = visibleUsers.filter(u => overrides[u.id] && overrides[u.id].blocked).length;

  statsEl.innerHTML = `
    <div class="stat-card"><div class="stat-num">${totalProducts}</div><div class="stat-label">کۆی کاڵاکان</div></div>
    <div class="stat-card"><div class="stat-num">${visibleUsers.length}</div><div class="stat-label">کۆی ئەژمارەکان</div></div>
    <div class="stat-card"><div class="stat-num">${blockedUsers}</div><div class="stat-label">ئەژماری بلۆککراو</div></div>
  `;
}

// ==================== Init ====================
document.addEventListener('DOMContentLoaded', () => {
  renderAdminProductList();
  renderUserList();
  renderStats();
});
