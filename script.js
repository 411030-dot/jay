const STORAGE_KEY = "legoCollectorData";
const wishlistKey = "legoWishlistData";

const initialCollection = [
  {
    id: crypto.randomUUID(),
    name: "千年鷹號",
    number: "75257",
    theme: "星際大戰",
    year: 2019,
    parts: 1352,
    image: "https://images.unsplash.com/photo-1598887142485-9060d7023094?auto=format&fit=crop&w=900&q=80",
    notes: "最愛太空系列，收藏於2024年",
  },
  {
    id: crypto.randomUUID(),
    name: "城市消防站",
    number: "60215",
    theme: "城市系列",
    year: 2020,
    parts: 509,
    image: "https://images.unsplash.com/photo-1558669023-094b4139f1da?auto=format&fit=crop&w=900&q=80",
    notes: "實用城市街景",
  },
  {
    id: crypto.randomUUID(),
    name: "披頭四時空旅行",
    number: "40428",
    theme: "其他",
    year: 2024,
    parts: 423,
    image: "https://images.unsplash.com/photo-1592891453394-8743bbaf004d?auto=format&fit=crop&w=900&q=80",
    notes: "特別版收藏",
  },
];

const initialWishlist = [
  {
    id: crypto.randomUUID(),
    name: "鋼鐵人終極裝甲",
    number: "76125",
    price: "$2,299",
    priority: "高",
    image: "https://images.unsplash.com/photo-1619336445157-18ce4f32a2f5?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: crypto.randomUUID(),
    name: "哈利波特霍格華茲城堡",
    number: "75954",
    price: "$3,499",
    priority: "中",
    image: "https://images.unsplash.com/photo-1582621856247-5e8171cb8d1b?auto=format&fit=crop&w=900&q=80",
  },
];

let collection = loadCollection();
let wishlist = loadWishlist();
let currentEditId = null;
let stateUpdated = false;

const elements = {
  overviewCards: document.getElementById("overviewCards"),
  collectionGrid: document.getElementById("collectionGrid"),
  wishlistGrid: document.getElementById("wishlistGrid"),
  themePie: document.getElementById("themePie"),
  pieLegend: document.getElementById("pieLegend"),
  yearBars: document.getElementById("yearBars"),
  progressList: document.getElementById("progressList"),
  wishlistCompletion: document.getElementById("wishlistCompletion"),
  wishlistProgress: document.getElementById("wishlistProgress"),
  updateHint: document.getElementById("updateHint"),
  searchInput: document.getElementById("searchInput"),
  themeFilter: document.getElementById("themeFilter"),
  sortSelect: document.getElementById("sortSelect"),
  modeToggle: document.getElementById("modeToggle"),
  openAddModal: document.getElementById("openAddModal"),
  itemModal: document.getElementById("itemModal"),
  detailModal: document.getElementById("detailModal"),
  closeModal: document.getElementById("closeModal"),
  closeDetail: document.getElementById("closeDetail"),
  itemForm: document.getElementById("itemForm"),
  modalTitle: document.getElementById("modalTitle"),
  setName: document.getElementById("setName"),
  setNumber: document.getElementById("setNumber"),
  setTheme: document.getElementById("setTheme"),
  setYear: document.getElementById("setYear"),
  setParts: document.getElementById("setParts"),
  setImage: document.getElementById("setImage"),
  setNotes: document.getElementById("setNotes"),
  cancelBtn: document.getElementById("cancelBtn"),
  detailBody: document.getElementById("detailBody"),
  toast: document.getElementById("toast"),
};

function loadCollection() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : initialCollection;
}

function loadWishlist() {
  const stored = localStorage.getItem(wishlistKey);
  return stored ? JSON.parse(stored) : initialWishlist;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
  localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
  stateUpdated = true;
  showUpdateHint();
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2400);
}

function showUpdateHint() {
  elements.updateHint.textContent = "資料已更新 🔄";
  elements.updateHint.style.opacity = "1";
  setTimeout(() => {
    elements.updateHint.style.opacity = "0.5";
    elements.updateHint.textContent = "即時資料更新中";
  }, 2200);
}

function renderOverview() {
  const totalSets = collection.length;
  const totalParts = collection.reduce((sum, item) => sum + Number(item.parts), 0);
  const themes = new Set(collection.map((item) => item.theme));
  const wishlistCount = wishlist.length;

  const items = [
    { title: "已收藏套組", value: totalSets, icon: "🧱" },
    { title: "收藏總零件", value: totalParts, icon: "⚙️" },
    { title: "收藏主題", value: themes.size, icon: "🎯" },
    { title: "願望清單", value: wishlistCount, icon: "⭐" },
  ];

  elements.overviewCards.innerHTML = items
    .map(
      (item) => `<article class="overview-card"><div class="card-info"><h3>${item.title}</h3><p class="value">${item.value}</p></div><div class="meta"><span>${item.icon}</span><span>即時更新</span></div></article>`
    )
    .join("");
}

function renderCollection() {
  const searchTerm = elements.searchInput.value.trim().toLowerCase();
  const filterTheme = elements.themeFilter.value;
  const sortOption = elements.sortSelect.value;

  let visibleItems = collection.filter((item) => {
    const matchText = `${item.name} ${item.number}`.toLowerCase();
    const matchesSearch = searchTerm ? matchText.includes(searchTerm) : true;
    const matchesTheme = filterTheme === "all" ? true : item.theme === filterTheme;
    return matchesSearch && matchesTheme;
  });

  visibleItems.sort((a, b) => {
    if (sortOption === "newest") return b.year - a.year;
    if (sortOption === "oldest") return a.year - b.year;
    if (sortOption === "parts") return b.parts - a.parts;
    return a.name.localeCompare(b.name, "zh-Hant");
  });

  elements.collectionGrid.innerHTML = visibleItems
    .map(
      (item) => `
        <article class="set-card monitor-card">
          <div class="card-image"><img src="${item.image}" alt="${item.name}" loading="lazy" /></div>
          <div class="card-details">
            <div class="card-info">
              <div>
                <h4>${item.name}</h4>
                <span>${item.theme}</span>
              </div>
              <span class="badge">收藏中</span>
            </div>
            <div class="card-meta">
              <span>編號：${item.number}</span>
              <span>年份：${item.year}</span>
              <span>零件：${item.parts}</span>
              <span>${item.notes || "無備註"}</span>
            </div>
            <div class="card-actions">
              <button class="btn btn-outline btn-sm" data-action="view" data-id="${item.id}">查看詳細資訊</button>
              <button class="btn btn-outline btn-sm" data-action="edit" data-id="${item.id}">編輯資料</button>
              <button class="btn btn-outline btn-sm" data-action="delete" data-id="${item.id}">刪除收藏</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  if (!visibleItems.length) {
    elements.collectionGrid.innerHTML = `<p class="muted">找不到符合條件的收藏套組，請嘗試調整搜尋或篩選。</p>`;
  }
}

function renderWishlist() {
  elements.wishlistGrid.innerHTML = wishlist
    .map(
      (item) => `
        <article class="wishlist-card monitor-card">
          <div class="wishlist-image"><img src="${item.image}" alt="${item.name}" loading="lazy" /></div>
          <div class="wishlist-body">
            <div>
              <h4>${item.name}</h4>
              <span>編號：${item.number}</span>
            </div>
            <div class="priority-pill">優先：${item.priority}</div>
            <span>預估價格：${item.price}</span>
          </div>
          <button class="btn btn-primary" data-action="bought" data-id="${item.id}">標記已購買</button>
        </article>
      `
    )
    .join("");

  if (!wishlist.length) {
    elements.wishlistGrid.innerHTML = `<p class="muted">願望清單目前為空。新增你想購買的樂高套組。</p>`;
  }
}

function renderStats() {
  const themeCounts = collection.reduce((acc, item) => {
    acc[item.theme] = (acc[item.theme] || 0) + 1;
    return acc;
  }, {});

  const themeEntries = Object.entries(themeCounts);
  const total = collection.length || 1;
  const colors = ["#ef4444", "#f59e0b", "#f97316", "#facc15", "#fb7185", "#60a5fa"];

  let start = 0;
  const pieSegments = themeEntries.map(([theme, count], index) => {
    const ratio = count / total;
    const deg = ratio * 360;
    const end = start + deg;
    const color = colors[index % colors.length];
    const segment = `${color} ${start}deg ${end}deg`;
    start = end;
    return { theme, ratio, color, segment };
  });

  elements.themePie.style.background = `conic-gradient(${pieSegments.map((part) => part.segment).join(", ")})`;
  elements.pieLegend.innerHTML = pieSegments
    .map(
      (part) => `
        <li><span class="legend-badge" style="background:${part.color}"></span>${part.theme}：${Math.round(part.ratio * 100)}%</li>
      `
    )
    .join("");

  const yearCounts = collection.reduce((acc, item) => {
    acc[item.year] = (acc[item.year] || 0) + 1;
    return acc;
  }, {});

  const sortedYears = Object.keys(yearCounts).sort((a, b) => a - b);
  const maxYearCount = Math.max(...Object.values(yearCounts), 1);

  elements.yearBars.innerHTML = `
    <div class="bar-row">
      ${sortedYears
        .map(
          (year) => `
            <div class="bar">
              <div class="bar-rect" style="height:${(yearCounts[year] / maxYearCount) * 100}%"></div>
              <span>${year}</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;

  const totalParts = collection.reduce((sum, item) => sum + Number(item.parts), 0);
  const averageParts = Math.round(totalParts / total);
  const newestYear = Math.max(...collection.map((item) => item.year), new Date().getFullYear());
  const oldestYear = Math.min(...collection.map((item) => item.year), 2000);
  const completionPercent = Math.round((wishlist.length ? (wishlist.length - wishlist.length) / wishlist.length : 0) * 100);

  elements.progressList.innerHTML = `
    <div class="progress-block">
      <label><span>總收藏套組</span><span>${total} 套</span></label>
      <div class="progress-wrapper"><div class="progress-fill" style="width:${Math.min(100, total * 8)}%"></div></div>
    </div>
    <div class="progress-block">
      <label><span>平均零件數</span><span>${averageParts}</span></label>
      <div class="progress-wrapper"><div class="progress-fill" style="width:${Math.min(100, (averageParts / 1200) * 100)}%"></div></div>
    </div>
    <div class="progress-block">
      <label><span>年份跨度</span><span>${oldestYear}–${newestYear}</span></label>
      <div class="progress-wrapper"><div class="progress-fill" style="width:${Math.min(100, ((newestYear - oldestYear) / 10) * 100)}%"></div></div>
    </div>
  `;

  const boughtCount = 0;
  const wishlistRate = wishlist.length ? Math.round(((wishlist.length - boughtCount) / wishlist.length) * 100) : 0;
  elements.wishlistCompletion.textContent = `完成率 ${100 - wishlistRate}%`;
  elements.wishlistProgress.style.width = `${100 - wishlistRate}%`;
}

function resetForm() {
  elements.itemForm.reset();
  currentEditId = null;
  elements.modalTitle.textContent = "新增樂高套組";
}

function openModal() {
  elements.itemModal.classList.remove("hidden");
}

function closeModal() {
  elements.itemModal.classList.add("hidden");
  resetForm();
}

function openDetailModal(html) {
  elements.detailBody.innerHTML = html;
  elements.detailModal.classList.remove("hidden");
}

function closeDetailModal() {
  elements.detailModal.classList.add("hidden");
}

function fillForm(item) {
  elements.setName.value = item.name;
  elements.setNumber.value = item.number;
  elements.setTheme.value = item.theme;
  elements.setYear.value = item.year;
  elements.setParts.value = item.parts;
  elements.setNotes.value = item.notes || "";
  currentEditId = item.id;
  elements.modalTitle.textContent = "編輯樂高套組";
}

function handleAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = button.dataset.id;
  const action = button.dataset.action;
  const item = collection.find((entry) => entry.id === id);
  if (!item && action !== "bought") return;

  if (action === "view") {
    const detailHtml = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="detail-list">
        <div class="detail-row"><span class="detail-label">名稱</span><span class="detail-value">${item.name}</span></div>
        <div class="detail-row"><span class="detail-label">編號</span><span class="detail-value">${item.number}</span></div>
        <div class="detail-row"><span class="detail-label">系列</span><span class="detail-value">${item.theme}</span></div>
        <div class="detail-row"><span class="detail-label">上市年份</span><span class="detail-value">${item.year}</span></div>
        <div class="detail-row"><span class="detail-label">零件數</span><span class="detail-value">${item.parts}</span></div>
        <div class="detail-row"><span class="detail-label">備註</span><span class="detail-value">${item.notes || "無"}</span></div>
      </div>
    `;
    openDetailModal(detailHtml);
  }

  if (action === "edit") {
    fillForm(item);
    openModal();
  }

  if (action === "delete") {
    const confirmDelete = confirm("確定要移除這筆收藏嗎？");
    if (!confirmDelete) return;
    collection = collection.filter((entry) => entry.id !== id);
    saveState();
    renderAll();
    showToast("已移除收藏套組。");
  }

  if (action === "bought") {
    wishlist = wishlist.filter((entry) => entry.id !== id);
    saveState();
    renderAll();
    showToast("已標記為已購買，已從願望清單移除。");
  }
}

function handleFormSubmit(event) {
  event.preventDefault();
  const newData = {
    id: currentEditId || crypto.randomUUID(),
    name: elements.setName.value.trim(),
    number: elements.setNumber.value.trim(),
    theme: elements.setTheme.value,
    year: Number(elements.setYear.value),
    parts: Number(elements.setParts.value),
    notes: elements.setNotes.value.trim(),
    image: "",
  };

  if (elements.setImage.files.length) {
    const file = elements.setImage.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      newData.image = reader.result;
      commitSet(newData);
    };
    reader.readAsDataURL(file);
  } else {
    const existing = collection.find((item) => item.id === currentEditId);
    newData.image = existing ? existing.image : "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80";
    commitSet(newData);
  }
}

function commitSet(data) {
  if (currentEditId) {
    collection = collection.map((item) => (item.id === data.id ? data : item));
    showToast("收藏資料已更新。");
  } else {
    collection.unshift(data);
    showToast("已新增收藏套組。立即生效。" );
  }
  saveState();
  renderAll();
  closeModal();
}

function renderAll() {
  renderOverview();
  renderCollection();
  renderWishlist();
  renderStats();
}

function toggleTheme() {
  document.documentElement.classList.toggle("dark-mode");
  const isDark = document.documentElement.classList.contains("dark-mode");
  elements.modeToggle.textContent = isDark ? "淺色模式" : "深色模式";
}

function init() {
  renderAll();
  elements.searchInput.addEventListener("input", renderCollection);
  elements.themeFilter.addEventListener("change", renderCollection);
  elements.sortSelect.addEventListener("change", renderCollection);
  elements.openAddModal.addEventListener("click", openModal);
  elements.closeModal.addEventListener("click", closeModal);
  elements.closeDetail.addEventListener("click", closeDetailModal);
  elements.cancelBtn.addEventListener("click", closeModal);
  elements.itemForm.addEventListener("submit", handleFormSubmit);
  document.addEventListener("click", handleAction);
  elements.modeToggle.addEventListener("click", toggleTheme);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      closeDetailModal();
    }
  });
}

init();
