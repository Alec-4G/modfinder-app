// ===== Telegram WebApp =====
const tg = window.Telegram.WebApp;
tg.ready();

// ===== АДРЕС ТВОЕГО API (Flask из bot.py) =====
// Обязательно HTTPS — иначе Telegram заблокирует запросы со страницы.
const API_BASE = "https://alec-4g.github.io/modfinder-app/index.html";

// ===== АДМИН =====
const ADMIN_ID = 6149681042; // ← тот же ID, что и в bot.py
const tgUser = tg.initDataUnsafe?.user;
const isAdmin = !!(tgUser && tgUser.id === ADMIN_ID);

// ===== СОСТОЯНИЕ =====
let modsData = [];
let currentCategory = 'all';
let searchQuery = '';
let editingModId = null; // id мода, который сейчас редактируется (null = форма добавления)

// ===== DOM ЭЛЕМЕНТЫ =====
const modList = document.getElementById('modList');
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearSearch');
const resultsCount = document.getElementById('resultsCount');

// ===== ЗАГРУЗКА МОДОВ С СЕРВЕРА =====

async function loadMods() {
    resultsCount.textContent = 'Загрузка…';
    try {
        const res = await fetch(`${API_BASE}/api/mods`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        modsData = await res.json();
    } catch (err) {
        console.error('Не удалось загрузить моды:', err);
        modList.innerHTML = `
            <div class="no-results">
                <div class="big-icon">⚠️</div>
                <h2>Не удалось загрузить моды</h2>
                <p>Проверь соединение и попробуй ещё раз</p>
            </div>
        `;
        resultsCount.textContent = 'Ошибка загрузки';
        return;
    }
    displayMods();
}

// ===== ФУНКЦИИ =====

function getFilteredMods() {
    let filtered = [...modsData];

    if (currentCategory !== 'all') {
        filtered = filtered.filter(mod => mod.category === currentCategory);
    }

    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(mod =>
            mod.name.toLowerCase().includes(query) ||
            mod.description.toLowerCase().includes(query) ||
            mod.author.toLowerCase().includes(query) ||
            (mod.tags || []).some(tag => tag.toLowerCase().includes(query))
        );
    }

    return filtered;
}

function createModCard(mod, index) {
    const card = document.createElement('div');
    card.className = 'mod-card';
    card.style.animationDelay = `${index * 0.06}s`;
    card.dataset.id = mod.id;

    card.innerHTML = `
        <div class="mod-icon">${mod.icon || '📦'}</div>
        <h3>${mod.name}</h3>
        <div class="mod-author">${mod.author}</div>
        <p class="mod-description">${mod.description}</p>
        <div class="mod-meta">
            <div class="mod-tags">
                ${(mod.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
                <span class="mod-size">📦 ${mod.size || ''}</span>
                ${isAdmin ? `<button class="edit-btn" data-id="${mod.id}">✏️</button>` : ''}
                <button class="download-btn" data-filename="${mod.fileName}" data-modname="${mod.name}">
                    ⬇️ Скачать
                </button>
            </div>
        </div>
    `;

    card.querySelector('.download-btn').addEventListener('click', function () {
        handleDownload(this.dataset.filename, this.dataset.modname);
    });

    const editBtn = card.querySelector('.edit-btn');
    if (editBtn) {
        editBtn.addEventListener('click', function () {
            openEditForm(mod);
        });
    }

    return card;
}

function displayMods() {
    const filtered = getFilteredMods();
    resultsCount.textContent = `Показано ${filtered.length} модов`;

    if (filtered.length === 0) {
        modList.innerHTML = `
            <div class="no-results">
                <div class="big-icon">🔍</div>
                <h2>Ничего не найдено</h2>
                <p>Попробуй изменить поиск или категорию</p>
            </div>
        `;
        return;
    }

    modList.innerHTML = '';
    filtered.forEach((mod, index) => {
        modList.appendChild(createModCard(mod, index));
    });
}

function handleDownload(fileName, modName) {
    tg.showPopup({
        title: `⏳ Отправка мода`,
        message: `Мод "${modName}" отправляется в чат...`,
        buttons: [{ type: 'ok' }]
    });

    tg.sendData('DOWNLOAD:' + fileName);

    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
}

// ===== ОБРАБОТЧИКИ ПОИСКА И КАТЕГОРИЙ =====

searchInput.addEventListener('input', function () {
    searchQuery = this.value;
    clearBtn.style.display = searchQuery ? 'flex' : 'none';
    displayMods();
});

clearBtn.addEventListener('click', function () {
    searchInput.value = '';
    searchQuery = '';
    this.style.display = 'none';
    displayMods();
    searchInput.focus();
});

document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.dataset.category;
        displayMods();
    });
});

// ==========================================================
// АДМИН-ПАНЕЛЬ: РЕДАКТИРОВАНИЕ МОДА
// ==========================================================

const adminPanel = document.getElementById('adminPanel');
const addModForm = document.getElementById('addModForm');
const adminTitle = document.getElementById('adminTitle');
const submitBtn = document.getElementById('adminSubmitBtn');
const fileRow = document.getElementById('fileRow');
const uploadStatus = document.getElementById('uploadStatus');

if (isAdmin) {
    const adminBtn = document.createElement('button');
    adminBtn.textContent = '＋';
    adminBtn.className = 'admin-fab';
    adminBtn.setAttribute('aria-label', 'Добавить мод');
    adminBtn.onclick = () => openAddForm();
    document.body.appendChild(adminBtn);
}

function openAddForm() {
    editingModId = null;
    addModForm.reset();
    adminTitle.textContent = 'Добавить мод';
    submitBtn.textContent = 'Загрузить мод';
    fileRow.style.display = 'block';
    document.getElementById('modFile').required = true;
    uploadStatus.textContent = '';
    adminPanel.style.display = 'grid';
}

function openEditForm(mod) {
    editingModId = mod.id;
    document.getElementById('modName').value = mod.name || '';
    document.getElementById('modAuthor').value = mod.author || '';
    document.getElementById('modVersion').value = mod.version || '';
    document.getElementById('modDescription').value = mod.description || '';
    document.getElementById('modCategory').value = mod.category || 'utility';

    adminTitle.textContent = `Редактировать: ${mod.name}`;
    submitBtn.textContent = 'Сохранить изменения';
    // При редактировании файл не перезаливаем — только метаданные
    fileRow.style.display = 'none';
    document.getElementById('modFile').required = false;
    uploadStatus.textContent = '';
    adminPanel.style.display = 'grid';
}

function closeAdminPanel() {
    adminPanel.style.display = 'none';
    editingModId = null;
}
document.getElementById('adminCloseBtn')?.addEventListener('click', closeAdminPanel);

addModForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (editingModId) {
        await submitEdit();
    } else {
        await submitNewMod();
    }
});

// ===== СОХРАНЕНИЕ ИЗМЕНЕНИЙ СУЩЕСТВУЮЩЕГО МОДА =====

async function submitEdit() {
    const name = document.getElementById('modName').value.trim();
    const author = document.getElementById('modAuthor').value.trim();
    const version = document.getElementById('modVersion').value.trim();
    const description = document.getElementById('modDescription').value.trim();
    const category = document.getElementById('modCategory').value;

    if (!name || !author || !version || !description) {
        uploadStatus.textContent = '❌ Заполни все поля!';
        uploadStatus.style.color = '#f04848';
        return;
    }

    uploadStatus.textContent = '⏳ Сохраняю…';
    uploadStatus.style.color = '#9aa0a6';

    try {
        const res = await fetch(`${API_BASE}/api/mods/${editingModId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // Подпись Telegram — сервер по ней проверяет, что это правда ты
                'X-Telegram-Init-Data': tg.initData
            },
            body: JSON.stringify({ name, author, version, description, category })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `HTTP ${res.status}`);
        }

        const updated = await res.json();
        const idx = modsData.findIndex(m => m.id === editingModId);
        if (idx !== -1) modsData[idx] = { ...modsData[idx], ...updated };

        uploadStatus.textContent = '✅ Сохранено!';
        uploadStatus.style.color = '#1bd96a';
        displayMods();

        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');

        setTimeout(closeAdminPanel, 1200);
    } catch (err) {
        console.error('Ошибка сохранения:', err);
        uploadStatus.textContent = '❌ Не удалось сохранить: ' + err.message;
        uploadStatus.style.color = '#f04848';
    }
}

// ===== ДОБАВЛЕНИЕ НОВОГО МОДА (через бота, как раньше) =====

async function submitNewMod() {
    const name = document.getElementById('modName').value.trim();
    const author = document.getElementById('modAuthor').value.trim();
    const version = document.getElementById('modVersion').value.trim();
    const description = document.getElementById('modDescription').value.trim();
    const category = document.getElementById('modCategory').value;
    const file = document.getElementById('modFile').files[0];

    if (!name || !author || !version || !description || !file) {
        uploadStatus.textContent = '❌ Заполни все поля и выбери файл!';
        uploadStatus.style.color = '#f04848';
        return;
    }

    uploadStatus.textContent = '⏳ Загрузка...';
    uploadStatus.style.color = '#9aa0a6';

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const base64 = e.target.result.split(',')[1];
            const modData = { name, author, version, description, category, fileName: file.name, fileData: base64 };
            const jsonStr = JSON.stringify(modData);

            console.log("Отправляю:", jsonStr.substring(0, 100) + "...");
            tg.sendData('UPLOAD_MOD:' + jsonStr);

            uploadStatus.textContent = '✅ Мод отправлен на сервер!';
            uploadStatus.style.color = '#1bd96a';

            setTimeout(closeAdminPanel, 2000);
        } catch (err) {
            console.error("Ошибка:", err);
            uploadStatus.textContent = '❌ Ошибка: ' + err.message;
            uploadStatus.style.color = '#f04848';
        }
    };
    reader.readAsDataURL(file);
}

// ===== ЗАПУСК =====
loadMods();
console.log('✅ ModFinder готов!');
