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

// Generate ASCII bar chart with dual metrics
function generateASCIIChart(storeStats) {
    // Find max for both metrics to scale properly
    const maxAvailable = Math.max(...storeStats.map(s => s.availableCount));
    const maxHeight = 15; // Vertical space
    const barWidth = 1;   // Single character width
    const barSpacing = 14; // Space between bars

    let chart = '';

    // Draw bars from top to bottom
    for (let row = maxHeight; row >= 0; row--) {
        const threshold = (row / maxHeight) * maxAvailable;
        let line = '';

        // Add Y-axis label every 3 rows
        if (row % 3 === 0) {
            line += String(Math.round(threshold)).padStart(3, ' ') + ' │ ';
        } else {
            line += '    │ ';
        }

        // Add bars for each store
        storeStats.forEach((store, index) => {
            const availableHeight = (store.availableCount / maxAvailable) * maxHeight;
            const cheapestHeight = (store.cheapestCount / maxAvailable) * maxHeight;

            // Draw based on position in the bar
            if (cheapestHeight >= row) {
                line += '█'; // Solid for cheapest products
            } else if (availableHeight >= row) {
                line += '░'; // Light for available but not cheapest
            } else {
                line += ' '; // Empty space
            }

            if (index < storeStats.length - 1) {
                line += ' '.repeat(barSpacing);
            }
        });

        chart += line + '\n';
    }

    // Add X-axis with corner and bar bases
    chart += '  0 └';
    storeStats.forEach((store, index) => {
        chart += '▀';
        if (index < storeStats.length - 1) {
            chart += '─'.repeat(barSpacing);
        }
    });
    chart += '\n';

    // Add labels centered below each bar
    const firstBarOffset = 6; // Account for "  0 └─"
    chart += ' '.repeat(firstBarOffset);

    storeStats.forEach((store, index) => {
        // Calculate centering for the label
        const labelWidth = barWidth + barSpacing;
        const nameLen = Math.min(store.name.length, labelWidth - 2);
        const name = store.name.substring(0, nameLen);
        const leftPad = Math.floor((labelWidth - nameLen) / 2);

        chart += ' '.repeat(leftPad);
        chart += name;

        if (index < storeStats.length - 1) {
            const rightPad = labelWidth - leftPad - nameLen;
            chart += ' '.repeat(rightPad);
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
        let availableCount = 0;
        let totalPrice = 0;

        allProducts.forEach(product => {
            const priceData = product.prices[store];
            if (priceData && priceData.price !== null) {
                totalPrice += priceData.price;
                availableCount++;

                if (getCheapestStore(product) === store) {
                    cheapestCount++;
                }
            }
        });

        const avgPrice = availableCount > 0 ? totalPrice / availableCount : 0;

        return {
            name: store,
            cheapestCount,
            availableCount,
            avgPrice
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

// Update metadata and summary insights
function updateMetadata() {
    document.getElementById('metaProducts').textContent = allProducts.length;
    document.getElementById('metaLastUpdate').textContent = new Date().toLocaleDateString('fi-FI');

    // Calculate summary insights
    const storeTotals = {};
    const storeAvgPrices = {};

    STORE_ORDER.forEach(store => {
        storeTotals[store] = 0;
        storeAvgPrices[store] = { total: 0, count: 0 };
    });

    allProducts.forEach(product => {
        const cheapestStore = getCheapestStore(product);
        if (cheapestStore) {
            storeTotals[cheapestStore]++;
        }

        // Calculate average prices per store
        Object.entries(product.prices).forEach(([store, data]) => {
            if (data && data.price !== null) {
                storeAvgPrices[store].total += data.price;
                storeAvgPrices[store].count++;
            }
        });
    });

    // Cheapest overall (by count)
    const cheapestOverall = Object.entries(storeTotals)
        .sort((a, b) => b[1] - a[1])[0];

    document.getElementById('cheapestOverall').textContent = cheapestOverall[0];
    document.getElementById('cheapestCount').textContent =
        `${cheapestOverall[0]} (${cheapestOverall[1]} / ${allProducts.length})`;

    // Calculate price gap
    const avgPrices = Object.entries(storeAvgPrices)
        .filter(([_, data]) => data.count > 0)
        .map(([store, data]) => ({
            store,
            avg: data.total / data.count
        }));

    const minAvg = Math.min(...avgPrices.map(s => s.avg));
    const maxAvg = Math.max(...avgPrices.map(s => s.avg));
    const priceGap = ((maxAvg - minAvg) / minAvg * 100).toFixed(0);

    document.getElementById('priceGap').textContent = `+${priceGap}%`;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
