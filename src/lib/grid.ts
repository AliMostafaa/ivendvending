import { ProductData, GridPosition, ProductPlacement, GridCell, ValidationResult } from '@/types/vending';

export const createEmptyGrid = (rows: number, cols: number): (string | null)[][] => {
    return Array(rows).fill(null).map(() => Array(cols).fill(null));
};

export const canPlaceProduct = (
    grid: (string | null)[][],
    position: GridPosition,
    size: number,
    excludeId?: string
): boolean => {
    const { r, c } = position;

    // Check bounds
    if (c + size > grid[0].length) return false;
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return false;

    // Check for conflicts
    for (let i = 0; i < size; i++) {
        const cell = grid[r]?.[c + i];
        if (cell !== null && cell !== undefined && cell !== excludeId) {
            return false;
        }
    }
    return true;
};

export const placeProduct = (
    grid: (string | null)[][],
    product: ProductData
): (string | null)[][] => {
    const newGrid = grid.map(row => [...row]);

    for (let i = 0; i < product.size; i++) {
        newGrid[product.r][product.c + i] = product.id;
    }

    return newGrid;
};

export const removeProduct = (
    grid: (string | null)[][],
    product: ProductData
): (string | null)[][] => {
    const newGrid = grid.map(row => [...row]);

    for (let i = 0; i < product.size; i++) {
        newGrid[product.r][product.c + i] = null;
    }

    return newGrid;
};

export const getProductAt = (
    products: ProductData[],
    position: GridPosition
): ProductData | undefined => {
    // Find product that occupies this position (including multi-cell products)
    return products.find(p => {
        // Check if the position is within the product's occupied cells
        if (p.r !== position.r) return false;
        // Product occupies cells from p.c to p.c + p.size - 1
        return position.c >= p.c && position.c < p.c + p.size;
    });
};

export const moveProduct = (
    products: ProductData[],
    id: string,
    newPosition: GridPosition
): ProductData[] => {
    return products.map(p =>
        p.id === id ? { ...p, r: newPosition.r, c: newPosition.c } : p
    );
};

export const addProduct = (
    products: ProductData[],
    placement: ProductPlacement,
    itemCounter: number
): { products: ProductData[]; itemCounter: number } => {
    const newProduct: ProductData = {
        id: `prod_${itemCounter + 1}`,
        product: placement.product,
        size: placement.size,
        r: placement.position.r,
        c: placement.position.c
    };

    return {
        products: [...products, newProduct],
        itemCounter: itemCounter + 1
    };
};

export const deleteProduct = (
    products: ProductData[],
    id: string
): ProductData[] => {
    return products.filter(p => p.id !== id);
};

// New functions for the improved system
export const validatePlacement = (
    grid: (string | null)[][],
    position: GridPosition,
    size: number,
    excludeId?: string
): ValidationResult => {
    const { r, c } = position;
    const conflicts: Array<{ r: number; c: number; occupiedBy: string }> = [];

    // Check bounds
    if (c + size > grid[0].length) {
        return {
            isValid: false,
            conflicts: [],
            message: 'Product extends beyond grid boundary'
        };
    }
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) {
        return {
            isValid: false,
            conflicts: [],
            message: 'Invalid position'
        };
    }

    // Check for conflicts
    for (let i = 0; i < size; i++) {
        const cell = grid[r]?.[c + i];
        if (cell !== null && cell !== undefined && cell !== excludeId) {
            conflicts.push({ r, c: c + i, occupiedBy: cell });
        }
    }

    if (conflicts.length > 0) {
        return {
            isValid: false,
            conflicts,
            message: `Cannot place product here. Conflicts with ${conflicts.length} existing item(s).`
        };
    }

    return {
        isValid: true,
        conflicts: [],
        message: 'Valid placement'
    };
};

export const getGridCells = (
    grid: (string | null)[][],
    products: ProductData[],
    selectedProduct: { product: string; size: number } | null,
    dragTarget: { r: number; c: number } | null
): GridCell[][] => {
    return grid.map((row, r) =>
        row.map((cell, c) => {
            const isDragTarget = dragTarget ? dragTarget.r === r && dragTarget.c === c : false;
            const isPlacementValid = selectedProduct
                ? canPlaceProduct(grid, { r, c }, selectedProduct.size)
                : false;

            return {
                row: r,
                col: c,
                occupiedBy: cell,
                isDragTarget,
                isPlacementValid
            };
        })
    );
};

export const getProductsFromGrid = (
    grid: (string | null)[][],
    products: ProductData[]
): ProductData[] => {
    // Rebuild products list from grid state
    const productMap = new Map<string, ProductData>();
    const processedIds = new Set<string>();

    grid.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell && !processedIds.has(cell)) {
                const product = products.find(p => p.id === cell);
                if (product) {
                    productMap.set(cell, product);
                    processedIds.add(cell);
                }
            }
        });
    });

    return Array.from(productMap.values());
};

export const clearGrid = (rows: number, cols: number): (string | null)[][] => {
    return createEmptyGrid(rows, cols);
};