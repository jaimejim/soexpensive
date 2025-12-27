// Global state
let allProducts = [];
let allStores = [];
let currentChart = null;

// Store names in order
const STORE_ORDER = ['S-Market', 'Prisma', 'K-Citymarket', 'K-Supermarket', 'Lidl', 'Alepa'];

// Theme management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
    const themeIcon = document.getElementById('themeIcon');
    themeIcon.textContent = theme === 'dark' ? '●' : '◯';
}

// Initialize app
async function init() {
    try {
        // Initialize theme
        initTheme();

        // Fetch stores and products
        await Promise.all([
            fetchStores(),
            fetchProducts()
        ]);

        // Setup event listeners
        setupEventListeners();

        // Initial render
        renderProducts();
        updateSummary();
        updateStoreComparison();
        updateMetadata();
    } catch (error) {
        console.error('Initialization error:', error);
        document.getElementById('loading').textContent = 'Error loading data. Please refresh the page.';
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

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Modal close
    document.getElementById('modalClose').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('historyModal');
        if (e.target === modal) {
            closeModal();
        }
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
            case 'variance':
                return getPriceVariance(b) - getPriceVariance(a);
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

// Get price variance
function getPriceVariance(product) {
    const prices = Object.values(product.prices).map(p => p.price).filter(p => p !== null);
    if (prices.length === 0) return 0;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return max - min;
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
        tbody.innerHTML = '<tr><td colspan="12" class="text-center">No products found</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => {
        const cheapestStore = getCheapestStore(product);
        const minPrice = getMinPrice(product);

        const priceColumns = STORE_ORDER.map(store => {
            const priceData = product.prices[store];
            if (!priceData || priceData.price === null) {
                return `<td><span class="price unavailable">-</span></td>`;
            }

            const isCheapest = store === cheapestStore;
            const priceClass = isCheapest ? 'cheapest' : '';

            return `<td><span class="price ${priceClass}">€${priceData.price.toFixed(2)}</span></td>`;
        }).join('');

        return `
            <tr>
                <td><strong>${product.name}</strong></td>
                <td>${product.category}</td>
                <td>${product.unit}</td>
                ${priceColumns}
                <td class="best-price">€${minPrice.toFixed(2)}</td>
                <td>
                    <button class="history-btn" onclick="showPriceHistory(${product.id}, '${product.name.replace(/'/g, "\\'")}')">
                        📊 History
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Update summary cards
function updateSummary() {
    document.getElementById('totalProducts').textContent = allProducts.length;
    document.getElementById('totalStores').textContent = allStores.length;

    // Calculate which store is cheapest overall
    const storeTotals = {};
    STORE_ORDER.forEach(store => {
        storeTotals[store] = 0;
    });

    allProducts.forEach(product => {
        const cheapestStore = getCheapestStore(product);
        if (cheapestStore) {
            storeTotals[cheapestStore]++;
        }
    });

    const cheapestOverall = Object.entries(storeTotals)
        .sort((a, b) => b[1] - a[1])[0];

    document.getElementById('cheapestStore').innerHTML = `
        <span class="store-badge">${cheapestOverall[0]}</span>
        <div style="font-size: 0.9rem; margin-top: 0.5rem; color: #666;">
            Cheapest for ${cheapestOverall[1]} products
        </div>
    `;
}

// Generate ASCII bar chart
function generateASCIIChart(storeStats) {
    const maxCount = Math.max(...storeStats.map(s => s.cheapestCount));
    const maxHeight = 12;
    const barWidth = 10;

    // Find max name length for spacing
    const maxNameLength = Math.max(...storeStats.map(s => s.name.length));

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
        const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';

        return `
            <tr>
                <td><strong>${store.name}</strong></td>
                <td>${store.cheapestCount}</td>
                <td>€${store.avgPrice.toFixed(2)}</td>
                <td class="${rankClass}">#${rank}</td>
            </tr>
        `;
    }).join('');
}

// Update metadata
function updateMetadata() {
    document.getElementById('metaProducts').textContent = allProducts.length;
    document.getElementById('metaLastUpdate').textContent = new Date().toLocaleDateString('fi-FI');

    // Calculate cheapest overall store
    const storeTotals = {};
    STORE_ORDER.forEach(store => {
        storeTotals[store] = 0;
    });

    allProducts.forEach(product => {
        const cheapestStore = getCheapestStore(product);
        if (cheapestStore) {
            storeTotals[cheapestStore]++;
        }
    });

    const cheapestOverall = Object.entries(storeTotals)
        .sort((a, b) => b[1] - a[1])[0];

    document.getElementById('metaCheapest').textContent = cheapestOverall ? cheapestOverall[0] : '--';
}

// Show price history modal
async function showPriceHistory(productId, productName) {
    const modal = document.getElementById('historyModal');
    const modalTitle = document.getElementById('modalProductName');

    modalTitle.textContent = `Price History: ${productName}`;
    modal.classList.add('active');

    try {
        const response = await fetch(`/api/products/${productId}/history`);
        const history = await response.json();

        renderPriceChart(history);
    } catch (error) {
        console.error('Error fetching price history:', error);
        alert('Error loading price history');
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('historyModal');
    modal.classList.remove('active');

    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }
}

// Render price chart
function renderPriceChart(history) {
    if (currentChart) {
        currentChart.destroy();
    }

    // Group data by store
    const storeData = {};
    history.forEach(entry => {
        if (!storeData[entry.store_name]) {
            storeData[entry.store_name] = [];
        }
        storeData[entry.store_name].push({
            x: new Date(entry.recorded_at),
            y: entry.price
        });
    });

    // Colors for different stores
    const colors = {
        'S-Market': '#ff6384',
        'Prisma': '#36a2eb',
        'K-Citymarket': '#ffce56',
        'K-Supermarket': '#4bc0c0',
        'Lidl': '#9966ff',
        'Alepa': '#ff9f40'
    };

    const datasets = Object.entries(storeData).map(([store, data]) => ({
        label: store,
        data: data,
        borderColor: colors[store] || '#999',
        backgroundColor: colors[store] + '33' || '#99933',
        tension: 0.1
    }));

    const ctx = document.getElementById('priceChart').getContext('2d');
    currentChart = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                        displayFormats: {
                            month: 'MMM yyyy'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price (€)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '€' + value.toFixed(2);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': €' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
