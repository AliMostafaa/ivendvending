import { LayoutData } from '@/types/vending';

const STORAGE_KEY = 'vendingMachineLayout';

export const saveLayout = (data: LayoutData): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving layout:', error);
    }
};

export const loadLayout = (): LayoutData | null => {
    if (typeof window === 'undefined') return null;

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Error loading layout:', error);
        return null;
    }
};

export const clearLayout = (): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing layout:', error);
    }
};