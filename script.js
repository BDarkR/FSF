/* بيانات الروابط */
const LINKS = [
  { id: 'al3mleat', title: 'AL3MLEAT', url: 'https://bdarkr.github.io/AL3MLEAT/' },
  { id: 'al3mleat1', title: 'AL3MLEAT1', url: 'https://bdarkr.github.io/AL3MLEAT1/' },
  { id: 'al3mleat2', title: 'AL3MLEAT2', url: 'https://bdarkr.github.io/AL3MLEAT2/' },
  { id: 'al3mleat4', title: 'AL3MLEAT4', url: 'https://bdarkr.github.io/AL3MLEAT4/' },
];

/* عناصر DOM */
const listEl = document.getElementById('list');
const searchEl = document.getElementById('search');
const openAllBtn = document.getElementById('openAll');

const modal = document.getElementById('modal');
const backdrop = document.getElementById('backdrop');
const previewFrame = document.getElementById('previewFrame');
const frameFallback = document.getElementById('frameFallback');
const modalTitle = document.getElementById('modalTitle');
const copyLinkBtn = document.getElementById('copyLink');
const openNewBtn = document.getElementById('openNew');
const closeModalBtn = document.getElementById('closeModal');

let currentItem = null;

/* توليد البطاقات */
function renderList(items) {
  listEl.innerHTML = '';
  items.forEach(it => {
    const li = document.createElement('li');
    li.className = 'link-card';
    li.innerHTML = `
      <div class="card-top">
        <div>
          <div class="title">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" fill="#021f25"></rect>
              <path d="M8 12h8M8 8h8M8 16h6" stroke="#2dd4bf" stroke-width="1.4" stroke-linecap="round"></path>
            </svg>
            ${escapeHtml(it.title)}
          </div>
          <div class="url">${escapeHtml(it.url)}</div>
        </div>
        <div class="small">#${it.id}</div>
      </div>
      <div class="card-actions">
        <button class="action-btn preview primary" data-id="${it.id}">معاينة</button>
        <button class="action-btn open" data-url="${it.url}">فتح</button>
        <button class="action-btn copy" data-url="${it.url}">نسخ</button>
      </div>
    `;
    listEl.appendChild(li);
  });
}

/* مساعدات */
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }

/* أحداث عامة */
listEl.addEventListener('click', (e) => {
  const p = e.target.closest('.preview');
  if (p) {
    const id = p.dataset.id;
    const item = LINKS.find(x => x.id === id);
    openPreview(item);
    return;
  }
  const o = e.target.closest('.open');
  if (o) {
    const url = o.dataset.url;
    window.open(url, '_blank', 'noopener');
    return;
  }
  const c = e.target.closest('.copy');
  if (c) {
    const url = c.dataset.url;
    navigator.clipboard?.writeText(url).then(() => {
      showToast('تم نسخ الرابط');
    }).catch(() => showToast('حدث خطأ أثناء النسخ'));
  }
});

openAllBtn.addEventListener('click', () => {
  LINKS.forEach(l => window.open(l.url, '_blank', 'noopener'));
});

/* بحث */
searchEl.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = LINKS.filter(l => (l.title + ' ' + l.url + ' ' + l.id).toLowerCase().includes(q));
  renderList(filtered);
});

/* معاينة (Modal) */
function openPreview(item) {
  if (!item) return;
  currentItem = item;
  modal.setAttribute('aria-hidden', 'false');
  modal.style.display = 'flex';
  modalTitle.textContent = `معاينة — ${item.title}`;
  frameFallback.style.display = 'none';
  previewFrame.style.display = 'block';
  previewFrame.src = item.url;

  // إذا منع الـ iframe الظهور، نظهر رسالة بعد تأخير قصير
  let loaded = false;
  const onload = () => { loaded = true; frameFallback.style.display = 'none'; previewFrame.style.display = 'block'; };
  previewFrame.onload = onload;
  setTimeout(() => {
    if (!loaded) {
      previewFrame.style.display = 'none';
      frameFallback.style.display = 'block';
    }
  }, 1200);
}

function closePreview() {
  previewFrame.src = 'about:blank';
  modal.setAttribute('aria-hidden', 'true');
  modal.style.display = 'none';
  currentItem = null;
}

/* نسخ وفتح من المودال */
copyLinkBtn.addEventListener('click', () => {
  if (!currentItem) return;
  navigator.clipboard?.writeText(currentItem.url).then(() => showToast('تم نسخ الرابط')).catch(()=>showToast('خطأ'));
});
openNewBtn.addEventListener('click', () => {
  if (!currentItem) return;
  window.open(currentItem.url, '_blank', 'noopener');
});
closeModalBtn.addEventListener('click', closePreview);
backdrop.addEventListener('click', closePreview);

/* بسيط: إشعار مؤقت */
function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.position = 'fixed';
  t.style.right = '18px';
  t.style.bottom = '18px';
  t.style.padding = '10px 14px';
  t.style.background = 'linear-gradient(90deg,#06303a,#06484b)';
  t.style.color = 'white';
  t.style.borderRadius = '10px';
  t.style.boxShadow = '0 10px 30px rgba(2,6,12,0.6)';
  t.style.zIndex = 120;
  document.body.appendChild(t);
  setTimeout(()=> t.style.opacity = '0', 2200);
  setTimeout(()=> t.remove(), 2800);
}

/* render initial */
renderList(LINKS);