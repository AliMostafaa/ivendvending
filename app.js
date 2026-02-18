// Vending Machine Planner - Main Application
// Works offline with localStorage, deployable to Vercel

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        rows: 6,
        cols: 10,
        storageKey: 'vendingMachineLayout',
        productImages: {
            coke: 'coke.png',
            chips: 'chips.png',
            water: 'water.png'
        }
    };

    // State
    let grid = [];
    let itemCounter = 0;
    let selectedProduct = null;

    // DOM Elements
    let slotsDiv, selectedProductEl, trashEl;

    // Initialize
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        slotsDiv = document.getElementById('slots');
        selectedProductEl = document.getElementById('selected-product');
        trashEl = document.getElementById('trash');

        initGrid();
        initProductButtons();
        initTrash();
        loadLayout();

        // Auto-save on any changes
        document.addEventListener('change', debounce(saveLayout, 1000));
    }

    // ==========================================
    // GRID INITIALIZATION
    // ==========================================

    function initGrid() {
        // Initialize empty grid
        grid = Array(CONFIG.rows).fill().map(() => Array(CONFIG.cols).fill(null));

        // Create grid elements
        for (let r = 0; r < CONFIG.rows; r++) {
            const row = document.createElement('div');
            row.className = 'row';

            for (let c = 0; c < CONFIG.cols; c++) {
                const slot = document.createElement('div');
                slot.className = 'slot';
                slot.dataset.r = r;
                slot.dataset.c = c;

                // Drag events
                slot.addEventListener('dragover', handleDragOver);
                slot.addEventListener('dragleave', handleDragLeave);
                slot.addEventListener('drop', handleDrop);

                // Click event for click-to-place
                slot.addEventListener('click', handleSlotClick);

                row.appendChild(slot);
            }
            slotsDiv.appendChild(row);
        }
    }

    // ==========================================
    // PRODUCT BUTTONS
    // ==========================================

    function initProductButtons() {
        const buttons = document.querySelectorAll('.product-btn');

        buttons.forEach(btn => {
            // Drag start from toolbox
            btn.addEventListener('dragstart', handleToolboxDragStart);

            // Click for click-to-place mode
            btn.addEventListener('click', handleProductButtonClick);
        });
    }

    function handleToolboxDragStart(e) {
        const product = e.currentTarget.dataset.product;
        const size = parseInt(e.currentTarget.dataset.size);

        const data = {
            source: 'toolbox',
            product: product,
            size: size
        };

        e.dataTransfer.setData('application/json', JSON.stringify(data));
        e.dataTransfer.effectAllowed = 'copy';
    }

    function handleProductButtonClick(e) {
        const btn = e.currentTarget;
        const product = btn.dataset.product;
        const size = parseInt(btn.dataset.size);

        // Toggle selection
        if (selectedProduct && selectedProduct.product === product) {
            // Deselect
            clearSelection();
        } else {
            // Select product
            clearSelection();
            selectedProduct = { product, size };
            btn.classList.add('selected');
            selectedProductEl.textContent = 'Selected: ' + capitalize(product) + ' (' + size + ' slot' + (size > 1 ? 's' : '') + ')';
        }
    }

    function clearSelection() {
        selectedProduct = null;
        document.querySelectorAll('.product-btn').forEach(function (btn) {
            btn.classList.remove('selected');
        });
        selectedProductEl.textContent = 'Selected: None';

        // Remove all slot selections
        document.querySelectorAll('.slot').forEach(function (slot) {
            slot.classList.remove('selected');
        });
    }

    // ==========================================
    // TRASH
    // ==========================================

    function initTrash() {
        trashEl.addEventListener('dragover', handleDragOver);
        trashEl.addEventListener('dragleave', handleDragLeave);
        trashEl.addEventListener('drop', handleTrashDrop);

        // Click to clear all
        trashEl.addEventListener('click', function () {
            if (confirm('Clear all products from the machine?')) {
                clearMachine();
            }
        });
    }

    // ==========================================
    // DRAG AND DROP HANDLERS
    // ==========================================

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        var data = JSON.parse(e.dataTransfer.getData('application/json'));
        var r = parseInt(this.dataset.r);
        var c = parseInt(this.dataset.c);
        var size = data.size;

        // Validate placement
        if (!canPlaceProduct(r, c, size, data.id)) {
            showStatus('Cannot place here!', 'error');
            return;
        }

        if (data.source === 'grid') {
            // Move existing product
            moveProduct(data.id, r, c, size);
        } else if (data.source === 'toolbox') {
            // Add new product from toolbox
            addProduct(data.product, r, c, size);
        }
    }

    function handleTrashDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        var data = JSON.parse(e.dataTransfer.getData('application/json'));

        if (data.source === 'grid') {
            removeProduct(data.id);
        }
    }

    // ==========================================
    // CLICK TO PLACE
    // ==========================================

    function handleSlotClick(e) {
        if (!selectedProduct) return;

        var r = parseInt(this.dataset.r);
        var c = parseInt(this.dataset.c);
        var size = selectedProduct.size;

        // Check if clicking on existing product
        var existingProduct = getProductAt(r, c);

        if (existingProduct) {
            // If clicking on an existing product, select it for moving
            // Or remove it if same product type
            if (confirm('Replace existing product?')) {
                removeProduct(existingProduct.id);
                if (!canPlaceProduct(r, c, size)) {
                    showStatus('Cannot place here!', 'error');
                    return;
                }
                addProduct(selectedProduct.product, r, c, size);
            }
        } else {
            // Empty slot - place product
            if (!canPlaceProduct(r, c, size)) {
                showStatus('Cannot place here!', 'error');
                return;
            }
            addProduct(selectedProduct.product, r, c, size);
        }
    }

    // ==========================================
    // PRODUCT MANAGEMENT
    // ==========================================

    function canPlaceProduct(r, c, size, excludeId) {
        excludeId = excludeId || null;

        // Check bounds
        if (c + size > CONFIG.cols) return false;
        if (r < 0 || r >= CONFIG.rows || c < 0 || c >= CONFIG.cols) return false;

        // Check for conflicts
        for (var i = 0; i < size; i++) {
            var cell = grid[r][c + i];
            if (cell !== null && cell !== excludeId) {
                return false;
            }
        }
        return true;
    }

    function addProduct(product, r, c, size) {
        itemCounter++;
        var id = 'prod_' + itemCounter;

        // Create product element
        var productEl = document.createElement('div');
        productEl.id = id;
        productEl.className = 'product';
        productEl.draggable = true;
        productEl.dataset.product = product;
        productEl.dataset.size = size;
        productEl.dataset.r = r;
        productEl.dataset.c = c;

        // Product image
        var img = document.createElement('img');
        img.src = 'images/' + CONFIG.productImages[product];
        img.alt = capitalize(product);
        productEl.appendChild(img);

        // Drag events for existing products
        productEl.addEventListener('dragstart', function (e) {
            var data = {
                source: 'grid',
                id: id,
                size: size,
                oldR: r,
                oldC: c
            };
            e.dataTransfer.setData('application/json', JSON.stringify(data));
            this.classList.add('dragging');
        });

        productEl.addEventListener('dragend', function (e) {
            this.classList.remove('dragging');
        });

        // Find the slot element and append
        var slot = slotsDiv.querySelector('.slot[data-r="' + r + '"][data-c="' + c + '"]');
        if (slot) {
            slot.appendChild(productEl);
        }

        // Update grid
        for (var i = 0; i < size; i++) {
            grid[r][c + i] = id;
        }

        // Save layout
        saveLayout();
    }

    function moveProduct(id, newR, newC, size) {
        var productEl = document.getElementById(id);
        if (!productEl) return;

        var oldR = parseInt(productEl.dataset.r);
        var oldC = parseInt(productEl.dataset.c);

        // Clear old position
        for (var i = 0; i < size; i++) {
            grid[oldR][oldC + i] = null;
        }

        // Update element data
        productEl.dataset.r = newR;
        productEl.dataset.c = newC;

        // Move to new slot
        var slot = slotsDiv.querySelector('.slot[data-r="' + newR + '"][data-c="' + newC + '"]');
        if (slot) {
            slot.appendChild(productEl);
        }

        // Update new position
        for (var j = 0; j < size; j++) {
            grid[newR][newC + j] = id;
        }

        saveLayout();
    }

    function removeProduct(id) {
        var productEl = document.getElementById(id);
        if (!productEl) return;

        var r = parseInt(productEl.dataset.r);
        var c = parseInt(productEl.dataset.c);
        var size = parseInt(productEl.dataset.size);

        // Clear grid
        for (var i = 0; i < size; i++) {
            grid[r][c + i] = null;
        }

        // Remove element
        productEl.remove();

        saveLayout();
    }

    function getProductAt(r, c) {
        var id = grid[r][c];
        if (!id) return null;

        var productEl = document.getElementById(id);
        if (!productEl) return null;

        return {
            id: id,
            element: productEl,
            product: productEl.dataset.product,
            size: parseInt(productEl.dataset.size)
        };
    }

    // ==========================================
    // SAVE / LOAD / CLEAR
    // ==========================================

    function saveLayout() {
        var products = [];

        document.querySelectorAll('.product').forEach(function (el) {
            products.push({
                id: el.id,
                product: el.dataset.product,
                size: parseInt(el.dataset.size),
                r: parseInt(el.dataset.r),
                c: parseInt(el.dataset.c)
            });
        });

        var data = {
            products: products,
            itemCounter: itemCounter
        };

        localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
    }

    function loadLayout() {
        var saved = localStorage.getItem(CONFIG.storageKey);
        if (!saved) return;

        try {
            var data = JSON.parse(saved);
            itemCounter = data.itemCounter || 0;

            // Clear existing products
            document.querySelectorAll('.product').forEach(function (el) {
                el.remove();
            });

            // Reset grid
            grid = Array(CONFIG.rows).fill().map(function () { return Array(CONFIG.cols).fill(null); });

            // Restore products
            if (data.products) {
                data.products.forEach(function (p) {
                    // Create element
                    var productEl = document.createElement('div');
                    productEl.id = p.id;
                    productEl.className = 'product';
                    productEl.draggable = true;
                    productEl.dataset.product = p.product;
                    productEl.dataset.size = p.size;
                    productEl.dataset.r = p.r;
                    productEl.dataset.c = p.c;

                    var img = document.createElement('img');
                    img.src = 'images/' + CONFIG.productImages[p.product];
                    img.alt = capitalize(p.product);
                    productEl.appendChild(img);

                    productEl.addEventListener('dragstart', function (e) {
                        var dragData = {
                            source: 'grid',
                            id: p.id,
                            size: p.size,
                            oldR: p.r,
                            oldC: p.c
                        };
                        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                        this.classList.add('dragging');
                    });

                    productEl.addEventListener('dragend', function (e) {
                        this.classList.remove('dragging');
                    });

                    var slot = slotsDiv.querySelector('.slot[data-r="' + p.r + '"][data-c="' + p.c + '"]');
                    if (slot) {
                        slot.appendChild(productEl);
                    }

                    for (var i = 0; i < p.size; i++) {
                        grid[p.r][p.c + i] = p.id;
                    }
                });
            }
        } catch (e) {
            console.error('Error loading layout:', e);
        }
    }

    function clearMachine() {
        // Clear grid
        grid = Array(CONFIG.rows).fill().map(function () { return Array(CONFIG.cols).fill(null); });

        // Remove all products
        document.querySelectorAll('.product').forEach(function (el) {
            el.remove();
        });

        // Reset counter
        itemCounter = 0;

        // Clear storage
        localStorage.removeItem(CONFIG.storageKey);
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function showStatus(message, type) {
        // Simple alert for now - could be enhanced with a toast notification
        console.log(message);
    }

    function debounce(func, wait) {
        var timeout;
        return function () {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                func.apply(context, args);
            }, wait);
        };
    }

    // ==========================================
    // EXPORT GLOBAL FUNCTIONS
    // ==========================================

    window.saveLayout = saveLayout;
    window.loadLayout = loadLayout;
    window.clearMachine = clearMachine;

})();
