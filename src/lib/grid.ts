import { ProductData, GridPosition, ProductPlacement } from '@/types/vending';

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
    return products.find(p => p.r === position.r && p.c === position.c);
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