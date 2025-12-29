// Global state
let allProducts = [];
let allStores = [];
let currentTheme = 'light';
let sortColumn = 'name';
let sortDirection = 'asc';

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

// Fetch stores with caching
async function fetchStores() {
    // Try to load from cache first
    if (isCacheValid()) {
        const cachedStores = localStorage.getItem(CACHE_KEY_STORES);
        if (cachedStores) {
            allStores = JSON.parse(cachedStores);
            return;
        }
    }

    const response = await fetch('/api/stores');
    allStores = await response.json();

    // Cache the stores
    try {
        localStorage.setItem(CACHE_KEY_STORES, JSON.stringify(allStores));
    } catch (e) {
        console.warn('Failed to cache stores:', e);
    }
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY_PRODUCTS = 'soexpensive_products';
const CACHE_KEY_STORES = 'soexpensive_stores';
const CACHE_KEY_TIMESTAMP = 'soexpensive_timestamp';

// Check if cache is valid
function isCacheValid() {
    const timestamp = localStorage.getItem(CACHE_KEY_TIMESTAMP);
    if (!timestamp) return false;

    const age = Date.now() - parseInt(timestamp);
    return age < CACHE_TTL;
}

// Pre-process products: calculate cheapest store and min/max prices
function preprocessProducts(products) {
    products.forEach(product => {
        let minPrice = Infinity;
        let maxPrice = 0;
        let cheapestStore = null;

        Object.entries(product.prices).forEach(([store, data]) => {
            if (data && data.price !== null) {
                if (data.price < minPrice) {
                    minPrice = data.price;
                    cheapestStore = store;
                }
                if (data.price > maxPrice) {
                    maxPrice = data.price;
                }
            }
        });

        // Store pre-calculated values
        product._cheapestStore = cheapestStore;
        product._minPrice = minPrice === Infinity ? null : minPrice;
        product._maxPrice = maxPrice === 0 ? null : maxPrice;
    });

    return products;
}

// Fetch products with caching
async function fetchProducts() {
    document.getElementById('loading').classList.remove('hidden');

    // Try to load from cache first
    if (isCacheValid()) {
        const cachedProducts = localStorage.getItem(CACHE_KEY_PRODUCTS);
        if (cachedProducts) {
            allProducts = JSON.parse(cachedProducts);
            document.getElementById('loading').classList.add('hidden');
            return;
        }
    }

    const response = await fetch('/api/products');
    const rawProducts = await response.json();

    // Pre-process products to calculate expensive values once
    allProducts = preprocessProducts(rawProducts);

    // Cache the processed products
    try {
        localStorage.setItem(CACHE_KEY_PRODUCTS, JSON.stringify(allProducts));
        localStorage.setItem(CACHE_KEY_TIMESTAMP, Date.now().toString());
    } catch (e) {
        console.warn('Failed to cache products:', e);
    }

    document.getElementById('loading').classList.add('hidden');
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', debounce(renderProducts, 300));

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleTheme);
    }

    // Add sorting event listeners to table headers
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.sort;
            handleSort(column);
        });
    });
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

// Handle column sorting
function handleSort(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }

    // Update UI indicators
    document.querySelectorAll('th.sortable').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        if (th.dataset.sort === column) {
            th.classList.add(`sort-${sortDirection}`);
        }
    });

    renderProducts();
}

// Filter and sort products
function getFilteredProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    let filtered = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        return matchesSearch;
    });

    // Sort based on current sort column and direction
    filtered.sort((a, b) => {
        let aVal, bVal;

        if (sortColumn === 'name' || sortColumn === 'category' || sortColumn === 'unit') {
            // Text sorting
            aVal = a[sortColumn];
            bVal = b[sortColumn];
            const comparison = aVal.localeCompare(bVal);
            return sortDirection === 'asc' ? comparison : -comparison;
        } else if (sortColumn === 'best') {
            // Sort by minimum price
            aVal = getMinPrice(a);
            bVal = getMinPrice(b);
        } else {
            // Sort by store price
            aVal = a.prices[sortColumn]?.price ?? Infinity;
            bVal = b.prices[sortColumn]?.price ?? Infinity;
        }

        const comparison = aVal - bVal;
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
}

// Calculate products with biggest price differences
function getProductsWithBiggestDifferences(products) {
    const productsWithDiff = products
        .map(product => {
            const minPrice = getMinPrice(product);
            const maxPrice = getMaxPrice(product);
            const difference = maxPrice - minPrice;
            const percentDiff = minPrice > 0 ? ((difference / minPrice) * 100) : 0;
            return { product, difference, percentDiff };
        })
        .filter(item => item.difference > 0)
        .sort((a, b) => b.percentDiff - a.percentDiff)
        .slice(0, 10); // Top 10

    return new Set(productsWithDiff.map(item => item.product.name));
}

// Get minimum price for a product (uses pre-calculated value)
function getMinPrice(product) {
    return product._minPrice !== undefined ? product._minPrice : Infinity;
}

// Get maximum price for a product (uses pre-calculated value)
function getMaxPrice(product) {
    return product._maxPrice !== undefined ? product._maxPrice : 0;
}

// Get cheapest store for a product (uses pre-calculated value)
function getCheapestStore(product) {
    return product._cheapestStore !== undefined ? product._cheapestStore : null;
}

// Render products table
function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    const products = getFilteredProducts();

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10">No products found</td></tr>';
        return;
    }

    // Calculate products with biggest differences
    const biggestDiffs = getProductsWithBiggestDifferences(products);

    tbody.innerHTML = products.map(product => {
        const cheapestStore = getCheapestStore(product);
        const minPrice = getMinPrice(product);
        const maxPrice = getMaxPrice(product);
        const difference = maxPrice - minPrice;
        const percentDiff = minPrice > 0 ? ((difference / minPrice) * 100) : 0;
        const isBiggestDiff = biggestDiffs.has(product.name);

        const priceColumns = STORE_ORDER.map(store => {
            const priceData = product.prices[store];
            if (!priceData || priceData.price === null) {
                return `<td>--</td>`;
            }

            const isCheapest = store === cheapestStore;
            const priceClass = isCheapest ? 'cheapest' : '';

            // Add freshness indicator: K-Citymarket, S-Market, Prisma have verified data
            const verifiedStores = ['K-Citymarket', 'S-Market', 'Prisma'];
            const isVerified = verifiedStores.includes(store);
            const indicator = isVerified ? '<sup class="verified-indicator" title="Verified price">✓</sup>' : '';

            return `<td class="price ${priceClass}">€${priceData.price.toFixed(2)}${indicator}</td>`;
        }).join('');

        const tooltipText = `€${minPrice.toFixed(2)} → €${maxPrice.toFixed(2)}`;
        const diffBadge = isBiggestDiff ? `<span class="price-diff-badge" title="Big price difference! Cheapest: €${minPrice.toFixed(2)}, Most expensive: €${maxPrice.toFixed(2)} (+${percentDiff.toFixed(0)}%)" data-mobile-text="${tooltipText}">+${percentDiff.toFixed(0)}%</span>` : '';
        const rowClass = isBiggestDiff ? 'biggest-difference' : '';

        return `
            <tr class="${rowClass}">
                <td><strong>${product.name}</strong>${diffBadge}</td>
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
    const barSpacing = 8; // Space between bars

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
    chart += '    └─';
    storeStats.forEach((store, index) => {
        chart += '▀';
        if (index < storeStats.length - 1) {
            chart += '─'.repeat(barSpacing);
        }
    });
    chart += '\n';

    // Add labels centered below each bar
    const firstBarOffset = 3; // Aligned 3 chars to the left
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
    const chartElement = document.getElementById('asciiChart');
    chartElement.textContent = chart;
    chartElement.classList.remove('hidden');

    // Hide chart skeleton
    const chartSkeleton = document.getElementById('chartSkeleton');
    if (chartSkeleton) {
        chartSkeleton.classList.add('hidden');
    }

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
