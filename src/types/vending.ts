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

// New types for the improved system
export interface ProductSlotState {
    id: string;
    product: string;
    size: number;
    r: number;
    c: number;
    isSelected: boolean;
    isHovered: boolean;
}

export interface GridCell {
    row: number;
    col: number;
    occupiedBy: string | null;
    isDragTarget: boolean;
    isPlacementValid: boolean;
}

export interface PlacementMode {
    type: 'place' | 'move' | 'delete';
    product?: string;
    size?: number;
    selectedId?: string;
}

export interface ValidationResult {
    isValid: boolean;
    conflicts: Array<{ r: number; c: number; occupiedBy: string }>;
    message: string;
}