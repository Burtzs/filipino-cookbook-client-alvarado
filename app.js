/* ================================================================
   Filipino Cookbook Client — Application Logic
   Consumes the Filipino Cookbook API by John Vhinson Fontanos.
   ================================================================ */

(function () {
    'use strict';

    // ── Configuration ──────────────────────────────────────────────
    const STORAGE_KEYS = {
        baseUrl: 'fc_api_base_url',
        token: 'fc_api_token',
    };

    const DEFAULT_BASE_URL = 'http://localhost/filipino-cookbook-api/public/api';

    const CATEGORY_META = {
        'Appetizer':       { emoji: '🥟', cssClass: 'cat-appetizer' },
        'Dessert':         { emoji: '🍨', cssClass: 'cat-dessert' },
        'Grilled Dish':    { emoji: '🔥', cssClass: 'cat-grilled' },
        'Main Dish':       { emoji: '🍛', cssClass: 'cat-main' },
        'Noodle Dish':     { emoji: '🍜', cssClass: 'cat-noodle' },
        'Soup':            { emoji: '🍲', cssClass: 'cat-soup' },
        'Vegetable Dish':  { emoji: '🥬', cssClass: 'cat-vegetable' },
    };

    function getCategoryMeta(name) {
        return CATEGORY_META[name] || { emoji: '🍽️', cssClass: 'cat-default' };
    }

    // ── State ──────────────────────────────────────────────────────
    let allFoods = [];
    let allCategories = [];
    let allIngredients = [];
    let searchTimeout = null;

    // ── DOM Refs ───────────────────────────────────────────────────
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const dom = {
        // Sections
        sections: $$('.section'),
        navLinks: $$('.nav-link'),

        // Home
        statFoods: $('#statFoods'),
        statCategories: $('#statCategories'),
        statIngredients: $('#statIngredients'),
        featuredGrid: $('#featuredGrid'),

        // Foods
        foodsGrid: $('#foodsGrid'),
        foodsEmpty: $('#foodsEmpty'),
        searchInput: $('#searchInput'),
        searchClear: $('#searchClear'),
        categoryFilter: $('#categoryFilter'),

        // Categories
        categoriesGrid: $('#categoriesGrid'),

        // Ingredients
        ingredientsGrid: $('#ingredientsGrid'),
        ingredientSearch: $('#ingredientSearch'),

        // Settings
        settingsForm: $('#settingsForm'),
        apiBaseUrl: $('#apiBaseUrl'),
        apiToken: $('#apiToken'),
        testConnectionBtn: $('#testConnectionBtn'),
        saveSettingsBtn: $('#saveSettingsBtn'),
        connectionStatus: $('#connectionStatus'),

        // Setup prompt
        setupPrompt: $('#setupPrompt'),
        goToSettingsBtn: $('#goToSettingsBtn'),

        // Modal
        foodModal: $('#foodModal'),
        modalClose: $('#modalClose'),
        modalEmoji: $('#modalEmoji'),
        modalFoodName: $('#modalFoodName'),
        modalCategory: $('#modalCategory'),
        modalOrigin: $('#modalOrigin'),
        modalInstructions: $('#modalInstructions'),
        modalIngredients: $('#modalIngredients'),

        // Toast
        toastContainer: $('#toastContainer'),

        // Mobile
        sidebar: $('#sidebar'),
        menuToggle: $('#menuToggle'),
    };

    // ── API Client ─────────────────────────────────────────────────
    function getConfig() {
        return {
            baseUrl: localStorage.getItem(STORAGE_KEYS.baseUrl) || '',
            token: localStorage.getItem(STORAGE_KEYS.token) || '',
        };
    }

    function isConfigured() {
        const c = getConfig();
        return c.baseUrl.length > 0 && c.token.length > 0;
    }

    async function apiFetch(endpoint) {
        const { baseUrl, token } = getConfig();
        if (!baseUrl || !token) {
            throw new Error('API not configured. Please set your Base URL and Token in Settings.');
        }

        const url = baseUrl.replace(/\/+$/, '') + endpoint;
        const res = await fetch(url, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json',
            },
        });

        if (res.status === 401) throw new Error('Unauthorized — invalid or missing API token.');
        if (res.status === 403) throw new Error('Forbidden — your token does not have access.');
        if (res.status === 404) throw new Error('Resource not found (404).');
        if (res.status === 429) throw new Error('Too many requests — please slow down.');
        if (!res.ok) throw new Error('API error (' + res.status + ')');

        return res.json();
    }

    // ── Toast Notifications ────────────────────────────────────────
    function showToast(message, type = 'error') {
        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.textContent = message;
        dom.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            toast.addEventListener('animationend', () => toast.remove());
        }, 4000);
    }

    // ── Navigation ─────────────────────────────────────────────────
    function navigateTo(sectionId) {
        dom.sections.forEach((s) => s.classList.remove('active'));
        dom.navLinks.forEach((l) => l.classList.remove('active'));

        const section = $('#' + sectionId + '-section');
        const navLink = $('[data-section="' + sectionId + '"]');

        if (section) section.classList.add('active');
        if (navLink) navLink.classList.add('active');

        // Close mobile sidebar
        dom.sidebar.classList.remove('open');

        // Load section data
        switch (sectionId) {
            case 'home':       loadHome(); break;
            case 'foods':      loadFoods(); break;
            case 'categories': loadCategories(); break;
            case 'ingredients':loadIngredients(); break;
            case 'settings':   loadSettings(); break;
        }
    }

    // ── HOME ───────────────────────────────────────────────────────
    async function loadHome() {
        if (!isConfigured()) {
            dom.setupPrompt.classList.remove('hidden');
            return;
        }
        dom.setupPrompt.classList.add('hidden');

        try {
            // Load stats in parallel
            const [foods, categories, ingredients] = await Promise.all([
                apiFetch('/foods'),
                apiFetch('/categories'),
                apiFetch('/ingredients'),
            ]);

            allFoods = foods;
            allCategories = categories;
            allIngredients = ingredients;

            dom.statFoods.textContent = foods.length;
            dom.statCategories.textContent = categories.length;
            dom.statIngredients.textContent = ingredients.length;

            // Show 3 random featured foods
            const shuffled = [...foods].sort(() => 0.5 - Math.random());
            const featured = shuffled.slice(0, 3);
            renderFoodCards(featured, dom.featuredGrid);

        } catch (err) {
            showToast(err.message);
            dom.statFoods.textContent = '—';
            dom.statCategories.textContent = '—';
            dom.statIngredients.textContent = '—';
            dom.featuredGrid.innerHTML = '';
        }
    }

    // ── FOODS ──────────────────────────────────────────────────────
    async function loadFoods() {
        if (!isConfigured()) {
            dom.setupPrompt.classList.remove('hidden');
            return;
        }
        dom.setupPrompt.classList.add('hidden');

        try {
            if (allFoods.length === 0) {
                allFoods = await apiFetch('/foods');
            }
            if (allCategories.length === 0) {
                allCategories = await apiFetch('/categories');
            }

            // Populate category filter
            populateCategoryFilter();

            // Render all foods
            renderFoodCards(allFoods, dom.foodsGrid);
            toggleEmpty(dom.foodsEmpty, allFoods.length === 0);
        } catch (err) {
            showToast(err.message);
        }
    }

    function populateCategoryFilter() {
        const existing = dom.categoryFilter.querySelectorAll('option');
        if (existing.length > 1) return; // already populated

        allCategories.forEach((cat) => {
            const opt = document.createElement('option');
            opt.value = cat.category_name;
            opt.textContent = cat.category_name;
            dom.categoryFilter.appendChild(opt);
        });
    }

    function filterFoods() {
        const query = dom.searchInput.value.trim().toLowerCase();
        const cat = dom.categoryFilter.value;

        let filtered = allFoods;

        if (cat) {
            filtered = filtered.filter((f) => f.category_name === cat);
        }

        if (query.length > 0) {
            filtered = filtered.filter((f) =>
                f.food_name.toLowerCase().includes(query)
            );
        }

        renderFoodCards(filtered, dom.foodsGrid);
        toggleEmpty(dom.foodsEmpty, filtered.length === 0);

        // Show/hide clear button
        dom.searchClear.classList.toggle('hidden', query.length === 0);
    }

    async function searchFoodsApi(query) {
        try {
            const results = await apiFetch('/foods/search/' + encodeURIComponent(query));
            const cat = dom.categoryFilter.value;
            const filtered = cat ? results.filter((f) => f.category_name === cat) : results;
            renderFoodCards(filtered, dom.foodsGrid);
            toggleEmpty(dom.foodsEmpty, filtered.length === 0);
        } catch (err) {
            // On 404 (no results), show empty state
            if (err.message.includes('404')) {
                renderFoodCards([], dom.foodsGrid);
                toggleEmpty(dom.foodsEmpty, true);
            } else {
                showToast(err.message);
            }
        }
    }

    // ── CATEGORIES ─────────────────────────────────────────────────
    async function loadCategories() {
        if (!isConfigured()) {
            dom.setupPrompt.classList.remove('hidden');
            return;
        }
        dom.setupPrompt.classList.add('hidden');

        try {
            if (allCategories.length === 0) {
                allCategories = await apiFetch('/categories');
            }
            if (allFoods.length === 0) {
                allFoods = await apiFetch('/foods');
            }

            renderCategories();
        } catch (err) {
            showToast(err.message);
        }
    }

    function renderCategories() {
        dom.categoriesGrid.innerHTML = '';

        allCategories.forEach((cat) => {
            const meta = getCategoryMeta(cat.category_name);
            const count = allFoods.filter((f) => f.category_name === cat.category_name).length;

            const card = document.createElement('div');
            card.className = 'category-card';
            card.innerHTML =
                '<div class="category-card__emoji ' + meta.cssClass + '">' + meta.emoji + '</div>' +
                '<div class="category-card__info">' +
                    '<span class="category-card__name">' + escapeHtml(cat.category_name) + '</span>' +
                    '<span class="category-card__count">' + count + ' dish' + (count !== 1 ? 'es' : '') + '</span>' +
                '</div>';

            card.addEventListener('click', () => {
                navigateTo('foods');
                dom.categoryFilter.value = cat.category_name;
                filterFoods();
            });

            dom.categoriesGrid.appendChild(card);
        });
    }

    // ── INGREDIENTS ────────────────────────────────────────────────
    async function loadIngredients() {
        if (!isConfigured()) {
            dom.setupPrompt.classList.remove('hidden');
            return;
        }
        dom.setupPrompt.classList.add('hidden');

        try {
            if (allIngredients.length === 0) {
                allIngredients = await apiFetch('/ingredients');
            }
            renderIngredients(allIngredients);
        } catch (err) {
            showToast(err.message);
        }
    }

    function renderIngredients(items) {
        dom.ingredientsGrid.innerHTML = '';

        items.forEach((ing) => {
            const chip = document.createElement('span');
            chip.className = 'ingredient-chip';
            chip.innerHTML =
                '<span class="ingredient-chip__id">#' + ing.ingredient_id + '</span>' +
                escapeHtml(ing.ingredient_name);
            dom.ingredientsGrid.appendChild(chip);
        });
    }

    // ── SETTINGS ───────────────────────────────────────────────────
    function loadSettings() {
        // Always hide the setup prompt when viewing settings
        dom.setupPrompt.classList.add('hidden');

        const config = getConfig();
        dom.apiBaseUrl.value = config.baseUrl || DEFAULT_BASE_URL;
        dom.apiToken.value = config.token || '';
    }

    function saveSettings(e) {
        e.preventDefault();
        const baseUrl = dom.apiBaseUrl.value.trim().replace(/\/+$/, '');
        const token = dom.apiToken.value.trim();

        if (!baseUrl || !token) {
            showToast('Please fill in both the Base URL and Token.');
            return;
        }

        localStorage.setItem(STORAGE_KEYS.baseUrl, baseUrl);
        localStorage.setItem(STORAGE_KEYS.token, token);

        // Reset cached data so it reloads from new config
        allFoods = [];
        allCategories = [];
        allIngredients = [];

        showToast('Settings saved successfully!', 'success');
        dom.setupPrompt.classList.add('hidden');
    }

    async function testConnection() {
        const baseUrl = dom.apiBaseUrl.value.trim().replace(/\/+$/, '');
        const token = dom.apiToken.value.trim();

        if (!baseUrl || !token) {
            showStatus('Please fill in both fields first.', false);
            return;
        }

        dom.testConnectionBtn.textContent = 'Testing…';
        dom.testConnectionBtn.disabled = true;

        try {
            const res = await fetch(baseUrl + '/foods', {
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Accept': 'application/json',
                },
            });

            if (res.ok) {
                const data = await res.json();
                showStatus('Connection successful! Found ' + data.length + ' foods.', true);
            } else if (res.status === 401) {
                showStatus('Unauthorized — check your Bearer token.', false);
            } else {
                showStatus('API responded with status ' + res.status + '.', false);
            }
        } catch (err) {
            showStatus('Cannot reach the API. Check the URL and ensure the server is running.', false);
        }

        dom.testConnectionBtn.textContent = 'Test Connection';
        dom.testConnectionBtn.disabled = false;
    }

    function showStatus(msg, success) {
        dom.connectionStatus.classList.remove('hidden', 'success', 'error');
        dom.connectionStatus.classList.add(success ? 'success' : 'error');
        dom.connectionStatus.textContent = msg;
    }

    // ── MODAL ──────────────────────────────────────────────────────
    function openFoodModal(food) {
        const meta = getCategoryMeta(food.category_name);

        dom.modalEmoji.textContent = meta.emoji;
        dom.modalFoodName.textContent = food.food_name;
        dom.modalCategory.textContent = food.category_name;
        dom.modalOrigin.textContent = food.origin_name;
        dom.modalInstructions.textContent = food.instructions;

        dom.modalIngredients.innerHTML = '';
        const ingredients = food.ingredients || [];
        ingredients.forEach((name) => {
            const li = document.createElement('li');
            li.textContent = name;
            dom.modalIngredients.appendChild(li);
        });

        dom.foodModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeFoodModal() {
        dom.foodModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // ── RENDERERS ──────────────────────────────────────────────────
    function renderFoodCards(foods, container) {
        container.innerHTML = '';

        foods.forEach((food) => {
            const meta = getCategoryMeta(food.category_name);

            const card = document.createElement('div');
            card.className = 'food-card';
            card.innerHTML =
                '<div class="food-card__banner ' + meta.cssClass + '">' + meta.emoji + '</div>' +
                '<div class="food-card__body">' +
                    '<h3 class="food-card__name">' + escapeHtml(food.food_name) + '</h3>' +
                    '<div class="food-card__meta">' +
                        '<span class="badge badge-category">' + escapeHtml(food.category_name) + '</span>' +
                        '<span class="badge badge-origin">' + escapeHtml(food.origin_name) + '</span>' +
                    '</div>' +
                    '<p class="food-card__instructions">' + escapeHtml(food.instructions) + '</p>' +
                '</div>';

            card.addEventListener('click', () => openFoodModal(food));
            container.appendChild(card);
        });
    }

    // ── UTILITIES ──────────────────────────────────────────────────
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function toggleEmpty(el, show) {
        el.classList.toggle('hidden', !show);
    }

    // ── EVENT LISTENERS ────────────────────────────────────────────
    function bindEvents() {
        // Navigation
        dom.navLinks.forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(link.dataset.section);
            });
        });

        // Search input — debounced
        dom.searchInput.addEventListener('input', () => {
            const q = dom.searchInput.value.trim();
            dom.searchClear.classList.toggle('hidden', q.length === 0);

            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (q.length === 0) {
                    // Reset to show all foods (filtered by category if set)
                    filterFoods();
                } else if (q.length >= 2) {
                    // Use API search for longer queries
                    searchFoodsApi(q);
                } else {
                    filterFoods();
                }
            }, 350);
        });

        dom.searchClear.addEventListener('click', () => {
            dom.searchInput.value = '';
            dom.searchClear.classList.add('hidden');
            filterFoods();
        });

        // Category filter
        dom.categoryFilter.addEventListener('change', filterFoods);

        // Ingredient filter
        dom.ingredientSearch.addEventListener('input', () => {
            const q = dom.ingredientSearch.value.trim().toLowerCase();
            if (q.length === 0) {
                renderIngredients(allIngredients);
            } else {
                const filtered = allIngredients.filter((i) =>
                    i.ingredient_name.toLowerCase().includes(q)
                );
                renderIngredients(filtered);
            }
        });

        // Settings
        dom.settingsForm.addEventListener('submit', saveSettings);
        dom.testConnectionBtn.addEventListener('click', testConnection);
        dom.goToSettingsBtn.addEventListener('click', () => navigateTo('settings'));

        // Modal
        dom.modalClose.addEventListener('click', closeFoodModal);
        dom.foodModal.addEventListener('click', (e) => {
            if (e.target === dom.foodModal) closeFoodModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !dom.foodModal.classList.contains('hidden')) {
                closeFoodModal();
            }
        });

        // Mobile menu
        dom.menuToggle.addEventListener('click', () => {
            dom.sidebar.classList.toggle('open');
        });
    }

    // ── INIT ───────────────────────────────────────────────────────
    function init() {
        bindEvents();

        if (isConfigured()) {
            dom.setupPrompt.classList.add('hidden');
            loadHome();
        } else {
            // Pre-fill default URL
            dom.apiBaseUrl.value = DEFAULT_BASE_URL;
            dom.setupPrompt.classList.remove('hidden');
        }
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
