export interface ProductData {
    id: string;
    product: string;
    size: number;
    r: number;
    c: number;
}

export interface GridState {
    rows: number;
    cols: number;
    storageKey: string;
    productImages: Record<string, string>;
}

export interface ProductConfig {
    product: string;
    size: number;
    image: string;
    label: string;
}

export interface LayoutData {
    products: ProductData[];
    itemCounter: number;
}

export interface DragData {
    source: 'toolbox' | 'grid';
    product?: string;
    size: number;
    id?: string;
    oldR?: number;
    oldC?: number;
}

export interface GridPosition {
    r: number;
    c: number;
}

export interface ProductPlacement {
    product: string;
    size: number;
    position: GridPosition;
}