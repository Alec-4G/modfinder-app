// ===== Telegram WebApp =====
const tg = window.Telegram.WebApp;
tg.ready();

// ===== ДАННЫЕ МОДОВ (с категориями) =====
const modsData = [
    {
        id: 'optifine',
        name: 'OptiFine',
        author: 'sp614x',
        version: 'HD U I4',
        description: 'Оптимизация графики и производительности. Добавляет поддержку шейдеров и настройки FPS.',
        fileName: 'OptiFine.jar',
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
        id: 'xaeros-minimap',
        name: "Xaero's Minimap",
        author: 'xaero96',
        version: '23.1.0',
        description: 'Мини-карта с отображением координат, маркеров и спутников.',
        fileName: 'XaerosMinimap.jar',
        size: '2.1 MB',
        category: 'utility',
        icon: '🗺️',
        tags: ['Карта', 'Навигация']
    },
    {
        id: 'shulker-tooltip',
        name: 'ShulkerBox Tooltip',
        author: 'MisterPeModder',
        version: '2.0.0',
        description: 'Показывает содержимое шалкер-боксов прямо в инвентаре без открытия.',
        fileName: 'ShulkerBoxTooltip.jar',
        size: '0.8 MB',
        category: 'utility',
        icon: '📦',
        tags: ['Инвентарь', 'Утилиты']
    },
    {
        id: 'create',
        name: 'Create',
        author: 'simibubi',
        version: '0.5.1',
        description: 'Технический мод с механизмами, вращением и автоматизацией. Строительство фабрик.',
        fileName: 'Create.jar',
        size: '8.5 MB',
        category: 'tech',
        icon: '⚙️',
        tags: ['Техника', 'Автоматизация']
    },
    {
        id: 'botania',
        name: 'Botania',
        author: 'Vazkii',
        version: '1.18.2-440',
        description: 'Магия через природу. Создавай цветы, артефакты и автоматизируй магию.',
        fileName: 'Botania.jar',
        size: '3.2 MB',
        category: 'magic',
        icon: '✨',
        tags: ['Магия', 'Цветы']
    },
    {
        id: 'sodium',
        name: 'Sodium',
        author: 'JellySquid',
        version: '0.4.10',
        description: 'Мощная оптимизация рендеринга. Повышает FPS в разы на любом железе.',
        fileName: 'Sodium.jar',
        size: '1.1 MB',
        category: 'optimization',
        icon: '🚀',
        tags: ['Оптимизация', 'FPS']
    },
    {
        id: 'litematica',
        name: 'Litematica',
        author: 'masady',
        version: '0.15.2',
        description: 'Схемы и планирование построек. Строй как профессионал!',
        fileName: 'Litematica.jar',
        size: '2.3 MB',
        category: 'building',
        icon: '📐',
        tags: ['Схемы', 'Строительство']
    }
];

// ===== СОСТОЯНИЕ =====
let currentCategory = 'all';
let searchQuery = '';
let visibleMods = [];

// ===== DOM ЭЛЕМЕНТЫ =====
const modList = document.getElementById('modList');
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearSearch');
const resultsCount = document.getElementById('resultsCount');
const loadMoreBtn = document.getElementById('loadMoreBtn');

// ===== ФУНКЦИИ =====

// Фильтрация модов
function getFilteredMods() {
    let filtered = [...modsData];
    
    // Фильтр по категории
    if (currentCategory !== 'all') {
        filtered = filtered.filter(mod => mod.category === currentCategory);
    }
    
    // Фильтр по поиску
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

// Создание карточки мода
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
    
    // Обработчик кнопки
    const downloadBtn = card.querySelector('.download-btn');
    downloadBtn.addEventListener('click', function() {
        const fileName = this.dataset.filename;
        const modName = this.dataset.modname;
        handleDownload(fileName, modName);
    });
    
    return card;
}

// Отображение модов
function displayMods() {
    const filtered = getFilteredMods();
    visibleMods = filtered;
    
    // Обновляем счетчик
    resultsCount.textContent = `Показано ${filtered.length} модов`;
    
    if (filtered.length === 0) {
        modList.innerHTML = `
            <div class="no-results">
                <div class="big-icon">🔍</div>
                <h2>Ничего не найдено</h2>
                <p>Попробуй изменить поиск или категорию</p>
            </div>
        `;
        loadMoreBtn.style.display = 'none';
        return;
    }
    
    // Показываем все моды (без пагинации для простоты)
    modList.innerHTML = '';
    filtered.forEach((mod, index) => {
        const card = createModCard(mod, index);
        modList.appendChild(card);
    });
    
    loadMoreBtn.style.display = 'none';
}

// Обработка скачивания
function handleDownload(fileName, modName) {
    // Визуальная обратная связь
    tg.showPopup({
        title: `⏳ Отправка мода`,
        message: `Мод "${modName}" отправляется в чат...`,
        buttons: [{type: 'ok'}]
    });
    
    // Отправка команды боту
    tg.sendData('DOWNLOAD:' + fileName);
    
    // Хаптик (вибрация)
    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====

// Поиск
searchInput.addEventListener('input', function() {
    searchQuery = this.value;
    clearBtn.style.display = searchQuery ? 'flex' : 'none';
    displayMods();
});

// Очистка поиска
clearBtn.addEventListener('click', function() {
    searchInput.value = '';
    searchQuery = '';
    this.style.display = 'none';
    displayMods();
    searchInput.focus();
});

// Категории
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.dataset.category;
        displayMods();
    });
});

// ===== ЗАПУСК =====
displayMods();

// Сообщаем, что приложение готово
console.log('✅ ModFinder готов к работе!');