import { ProductConfig } from '@/types/vending';

export const GRID_CONFIG = {
    rows: 6,
    cols: 10,
    storageKey: 'vendingMachineLayout',
} as const;

export const PRODUCT_CONFIGS: ProductConfig[] = [
    {
        product: 'coke',
        size: 1,
        image: '/images/coke.png',
        label: 'Coke',
    },
    {
        product: 'chips',
        size: 2,
        image: '/images/chips.png',
        label: 'Chips',
    },
    {
        product: 'water',
        size: 1,
        image: '/images/water.png',
        label: 'Water',
    },
];

export const STORAGE_KEYS = {
    LAYOUT: 'vendingMachineLayout',
} as const;

export const MESSAGES = {
    CANNOT_PLACE: 'Cannot place here!',
    CONFIRM_REPLACE: 'Replace existing product?',
    CONFIRM_CLEAR: 'Clear all products from the machine?',
    PLACEMENT_VALID: 'Valid placement',
    PLACEMENT_INVALID: 'Invalid placement',
    DRAG_TO_PLACE: 'Drag product to place',
    CLICK_TO_SELECT: 'Click to select product',
    DOUBLE_CLICK_TO_DELETE: 'Double-click to delete',
} as const;

export const PLACEMENT_MODES = {
    PLACE: 'place',
    MOVE: 'move',
    DELETE: 'delete',
} as const;

export const COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#1f2937',
    card: '#374151',
    text: '#f3f4f6',
    muted: '#9ca3af',
} as const;