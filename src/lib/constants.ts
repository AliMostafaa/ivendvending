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
} as const;