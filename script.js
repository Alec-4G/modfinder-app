// ===== Telegram WebApp =====
const tg = window.Telegram.WebApp;
tg.ready();

// ===== ДАННЫЕ МОДОВ =====
const modsData = [
    {
        id: 'optifine',
        name: 'OptiFine',
        author: 'sp614x',
        version: 'HD U I4',
        description: 'Оптимизация графики и FPS. Добавляет шейдеры.',
        fileName: 'OptiFine_1.21.11_HD_U_J9.jar',
        size: '4.2 MB',
        category: 'optimization',
        icon: '⚡',
        tags: ['Оптимизация', 'Шейдеры']
    },
    {
        id: 'worldedit',
        name: 'WorldEdit',
        author: 'sk89q',
        version: '7.2.0',
        description: 'Мощный инструмент для редактирования мира. Строительство становится в разы быстрее!',
        fileName: 'WorldEdit.jar',
        size: '3.8 MB',
        category: 'building',
        icon: '🏗️',
        tags: ['Строительство', 'Инструменты']
    },
    {
        id: 'jei',
        name: 'Just Enough Items',
        author: 'mezz',
        version: '12.0.0',
        description: 'Показывает все рецепты крафта и предметы. Незаменим для выживания.',
        fileName: 'JEI.jar',
        size: '1.5 MB',
        category: 'utility',
        icon: '📦',
        tags: ['Рецепты', 'Интерфейс']
    },
    {
    id: 'forge',
    name: 'Forge',
    author: 'Forge Team',
    version: '61.2.0',
    description: 'Установщик Forge для Minecraft 1.21.11. Необходим для запуска большинства модов.',
    fileName: 'forge-1.21.11-61.2.0-installer.jar',  // ← ТОЧНОЕ ИМЯ ИЗ ПАПКИ
    size: '8.5 MB',
    category: 'utility',
    icon: '🔧',
    tags: ['Forge', 'API', 'Установщик']
    }
];
// ===== СОСТОЯНИЕ =====
let currentCategory = 'all';
let searchQuery = '';

// ===== DOM ЭЛЕМЕНТЫ =====
const modList = document.getElementById('modList');
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearSearch');
const resultsCount = document.getElementById('resultsCount');

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
            mod.tags.some(tag => tag.toLowerCase().includes(query))
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
                ${mod.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
                <span class="mod-size">📦 ${mod.size}</span>
                <button class="download-btn" data-filename="${mod.fileName}" data-modname="${mod.name}">
                    ⬇️ Скачать
                </button>
            </div>
        </div>
    `;
    
    const downloadBtn = card.querySelector('.download-btn');
    downloadBtn.addEventListener('click', function() {
        const fileName = this.dataset.filename;
        const modName = this.dataset.modname;
        handleDownload(fileName, modName);
    });
    
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
        const card = createModCard(mod, index);
        modList.appendChild(card);
    });
}

function handleDownload(fileName, modName) {
    tg.showPopup({
        title: `⏳ Отправка мода`,
        message: `Мод "${modName}" отправляется в чат...`,
        buttons: [{type: 'ok'}]
    });
    
    tg.sendData('DOWNLOAD:' + fileName);
    
    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
}

// ===== ОБРАБОТЧИКИ =====

searchInput.addEventListener('input', function() {
    searchQuery = this.value;
    clearBtn.style.display = searchQuery ? 'flex' : 'none';
    displayMods();
});

clearBtn.addEventListener('click', function() {
    searchInput.value = '';
    searchQuery = '';
    this.style.display = 'none';
    displayMods();
    searchInput.focus();
});

document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.dataset.category;
        displayMods();
    });
});

// ===== АДМИН-ПАНЕЛЬ =====
const ADMIN_ID = 6149681042; // ← ВСТАВЬ СВОЙ TELEGRAM ID

const tgUser = tg.initDataUnsafe?.user;
if (tgUser && tgUser.id === ADMIN_ID) {
    const adminBtn = document.createElement('button');
    adminBtn.textContent = '＋';
    adminBtn.className = 'admin-fab';
    adminBtn.setAttribute('aria-label', 'Добавить мод');
    adminBtn.onclick = () => {
        document.getElementById('adminPanel').style.display = 'grid';
    };
    document.body.appendChild(adminBtn);
}

document.getElementById('addModForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('modName').value.trim();
    const author = document.getElementById('modAuthor').value.trim();
    const version = document.getElementById('modVersion').value.trim();
    const description = document.getElementById('modDescription').value.trim();
    const category = document.getElementById('modCategory').value;
    const file = document.getElementById('modFile').files[0];
    
    if (!name || !author || !version || !description || !file) {
        document.getElementById('uploadStatus').textContent = '❌ Заполни все поля и выбери файл!';
        document.getElementById('uploadStatus').style.color = '#f04848';
        return;
    }
    
    document.getElementById('uploadStatus').textContent = '⏳ Загрузка...';
    document.getElementById('uploadStatus').style.color = '#9aa0a6';
    
    const reader = new FileReader();
reader.onload = function(e) {
    try {
        const base64 = e.target.result.split(',')[1];
        const modData = {
            name, author, version, description, category,
            fileName: file.name,
            fileData: base64
        };
        
        const jsonStr = JSON.stringify(modData);
        console.log("Отправляю:", jsonStr.substring(0, 100) + "...");
        
        tg.sendData('UPLOAD_MOD:' + jsonStr);
        
        document.getElementById('uploadStatus').textContent = '✅ Мод отправлен на сервер!';
        document.getElementById('uploadStatus').style.color = '#1bd96a';
        
        setTimeout(() => {
            document.getElementById('uploadStatus').textContent = '';
            document.getElementById('addModForm').reset();
            document.getElementById('adminPanel').style.display = 'none';
        }, 2000);
    } catch (err) {
        console.error("Ошибка:", err);
        document.getElementById('uploadStatus').textContent = '❌ Ошибка: ' + err.message;
        document.getElementById('uploadStatus').style.color = '#f04848';
    }
};
    reader.readAsDataURL(file);
});

// ===== ЗАПУСК =====
displayMods();
console.log('✅ ModFinder готов!');
