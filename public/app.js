// Global state
let allProducts = [];
let allStores = [];
let currentTheme = 'light';

// Store names in order
const STORE_ORDER = ['S-Market', 'Prisma', 'K-Citymarket', 'K-Supermarket', 'Lidl', 'Alepa'];

// Theme management
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');

    applyTheme(theme);

    const checkbox = document.getElementById('themeToggle');
    if (checkbox) {
        checkbox.checked = theme === 'dark';
    }
}

function toggleTheme() {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
}

function applyTheme(theme) {
    const root = document.documentElement;
    currentTheme = theme;

    if (theme === 'dark') {
        root.style.setProperty('--text-color', '#fff');
        root.style.setProperty('--text-color-alt', '#aaa');
        root.style.setProperty('--background-color', '#000');
        root.style.setProperty('--background-color-alt', '#111');
    } else {
        root.style.setProperty('--text-color', '#000');
        root.style.setProperty('--text-color-alt', '#666');
        root.style.setProperty('--background-color', '#fff');
        root.style.setProperty('--background-color-alt', '#eee');
    }
}

// Initialize app
async function init() {
    try {
        initTheme();

        await Promise.all([
            fetchStores(),
            fetchProducts()
        ]);

        setupEventListeners();
        renderProducts();
        updateStoreComparison();
        updateMetadata();
    } catch (error) {
        console.error('Initialization error:', error);
        document.getElementById('loading').textContent = 'Error loading data.';
    }
}

// Fetch stores
async function fetchStores() {
    const response = await fetch('/api/stores');
    allStores = await response.json();
}

// Fetch products
async function fetchProducts() {
    document.getElementById('loading').classList.remove('hidden');

    const response = await fetch('/api/products');
    allProducts = await response.json();

    document.getElementById('loading').classList.add('hidden');

    // Populate category filter
    const categories = [...new Set(allProducts.map(p => p.category))].sort();
    const categoryFilter = document.getElementById('categoryFilter');

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', debounce(renderProducts, 300));
    document.getElementById('categoryFilter').addEventListener('change', renderProducts);
    document.getElementById('sortBy').addEventListener('change', renderProducts);

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleTheme);
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Filter and sort products
function getFilteredProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const sortBy = document.getElementById('sortBy').value;

    let filtered = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || product.category === category;
        return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'category':
                return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
            case 'price-low':
                return getMinPrice(a) - getMinPrice(b);
            case 'price-high':
                return getMaxPrice(b) - getMaxPrice(a);
            default:
                return 0;
        }
    });

    return filtered;
}

// Get minimum price for a product
function getMinPrice(product) {
    const prices = Object.values(product.prices).map(p => p.price).filter(p => p !== null);
    return prices.length > 0 ? Math.min(...prices) : Infinity;
}

// Get maximum price for a product
function getMaxPrice(product) {
    const prices = Object.values(product.prices).map(p => p.price).filter(p => p !== null);
    return prices.length > 0 ? Math.max(...prices) : 0;
}

// Get cheapest store for a product
function getCheapestStore(product) {
    let minPrice = Infinity;
    let cheapestStore = null;

    Object.entries(product.prices).forEach(([store, data]) => {
        if (data.price < minPrice) {
            minPrice = data.price;
            cheapestStore = store;
        }
    });

    return cheapestStore;
}

// Render products table
function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    const products = getFilteredProducts();

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10">No products found</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => {
        const cheapestStore = getCheapestStore(product);
        const minPrice = getMinPrice(product);

        const priceColumns = STORE_ORDER.map(store => {
            const priceData = product.prices[store];
            if (!priceData || priceData.price === null) {
                return `<td>--</td>`;
            }

            const isCheapest = store === cheapestStore;
            const priceClass = isCheapest ? 'cheapest' : '';

            return `<td class="price ${priceClass}">€${priceData.price.toFixed(2)}</td>`;
        }).join('');

        return `
            <tr>
                <td><strong>${product.name}</strong></td>
                <td>${product.category}</td>
                <td>${product.unit}</td>
                ${priceColumns}
                <td class="price"><strong>€${minPrice.toFixed(2)}</strong></td>
            </tr>
        `;
    }).join('');
}

// Generate ASCII bar chart
function generateASCIIChart(storeStats) {
    const maxCount = Math.max(...storeStats.map(s => s.cheapestCount));
    const maxHeight = 10;
    const barWidth = 10;

    let chart = '';

    // Draw bars from top to bottom
    for (let row = maxHeight; row >= 0; row--) {
        const threshold = (row / maxHeight) * maxCount;
        let line = '';

        // Add Y-axis label
        if (row === maxHeight || row === 0) {
            line += String(Math.round(threshold)).padStart(3, ' ') + ' │ ';
        } else if (row === Math.floor(maxHeight / 2)) {
            line += String(Math.round(threshold)).padStart(3, ' ') + ' │ ';
        } else {
            line += '    │ ';
        }

        // Add bars
        storeStats.forEach((store, index) => {
            const barHeight = (store.cheapestCount / maxCount) * maxHeight;

            if (barHeight >= row) {
                line += '█'.repeat(barWidth);
            } else {
                line += ' '.repeat(barWidth);
            }

            if (index < storeStats.length - 1) {
                line += '  ';
            }
        });

        chart += line + '\n';
    }

    // Add X-axis
    chart += '  0 └';
    storeStats.forEach((store, index) => {
        chart += '─'.repeat(barWidth);
        if (index < storeStats.length - 1) {
            chart += '──';
        }
    });
    chart += '\n';

    // Add labels
    chart += '      ';
    storeStats.forEach((store, index) => {
        const shortName = store.name.length > barWidth
            ? store.name.substring(0, barWidth - 1) + '…'
            : store.name.padEnd(barWidth, ' ');
        chart += shortName;
        if (index < storeStats.length - 1) {
            chart += '  ';
        }
    });

    return chart;
}

// Update store comparison table
function updateStoreComparison() {
    const tbody = document.getElementById('storeComparisonBody');

    // Calculate stats for each store
    const storeStats = STORE_ORDER.map(store => {
        let cheapestCount = 0;
        let totalPrice = 0;
        let priceCount = 0;

        allProducts.forEach(product => {
            const priceData = product.prices[store];
            if (priceData && priceData.price !== null) {
                totalPrice += priceData.price;
                priceCount++;

                if (getCheapestStore(product) === store) {
                    cheapestCount++;
                }
            }
        });

        const avgPrice = priceCount > 0 ? totalPrice / priceCount : 0;

        return {
            name: store,
            cheapestCount,
            avgPrice,
            priceCount
        };
    });

    // Sort by cheapest count (descending)
    storeStats.sort((a, b) => b.cheapestCount - a.cheapestCount);

    // Generate and display ASCII chart
    const chart = generateASCIIChart(storeStats);
    document.getElementById('asciiChart').textContent = chart;

    // Render table
    tbody.innerHTML = storeStats.map((store, index) => {
        const rank = index + 1;
        const rankClass = rank === 1 ? 'rank-1' : '';

        return `
            <tr>
                <td><strong>${store.name}</strong></td>
                <td>${store.cheapestCount}</td>
                <td>€${store.avgPrice.toFixed(2)}</td>
                <td class="${rankClass}">${rank}</td>
            </tr>
        `;
    }).join('');
}

// Update metadata
function updateMetadata() {
    document.getElementById('metaProducts').textContent = allProducts.length;
    document.getElementById('metaLastUpdate').textContent = new Date().toLocaleDateString('fi-FI');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
