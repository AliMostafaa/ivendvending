'use client';

import { useState } from 'react';
import { ProductData, GridCell, ProductConfig } from '@/types/vending';
import { getProductAt, canPlaceProduct } from '@/lib/grid';
import { PRODUCT_CONFIGS, MESSAGES } from '@/lib/constants';

interface ProductSlotProps {
    cell: GridCell;
    products: ProductData[];
    selectedProduct: { product: string; size: number } | null;
    onProductSelect: (product: string, size: number) => void;
    onProductPlace: (product: string, r: number, c: number, size: number) => void;
}

export default function ProductSlot({
    cell,
    products,
    selectedProduct,
    onProductSelect,
    onProductPlace,
}: ProductSlotProps) {
    const [isHovered, setIsHovered] = useState(false);

    const productAt = getProductAt(products, { r: cell.row, c: cell.col });
    const productConfig = productAt ? PRODUCT_CONFIGS.find(p => p.product === productAt.product) : null;

    // Check if this cell is part of a valid placement area
    const isValidPlacement = selectedProduct && canPlaceProduct(
        products.reduce((grid, p) => {
            for (let i = 0; i < p.size; i++) {
                grid[p.r][p.c + i] = p.id;
            }
            return grid;
        }, Array.from({ length: 6 }, () => Array(10).fill(null))),
        { r: cell.row, c: cell.col },
        selectedProduct.size
    );

    const handleSlotClick = () => {
        if (productAt) {
            // If clicking on an existing product, toggle selection
            if (selectedProduct?.product === productAt.product) {
                onProductSelect('', 0);
            } else {
                onProductSelect(productAt.product, productAt.size);
            }
        } else if (selectedProduct && isValidPlacement) {
            // Place product if valid
            onProductPlace(selectedProduct.product, cell.row, cell.col, selectedProduct.size);
        }
    };

    const handleProductClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (productAt) {
            if (selectedProduct?.product === productAt.product) {
                onProductSelect('', 0);
            } else {
                onProductSelect(productAt.product, productAt.size);
            }
        }
    };

    const getSlotStyle = () => {
        let baseStyle = 'relative rounded-lg transition-all duration-200 cursor-pointer';

        if (productAt) {
            baseStyle += ' cursor-default';
        } else if (selectedProduct && isValidPlacement) {
            baseStyle += ' ring-2 ring-green-400/50 bg-green-400/10';
        } else if (isHovered) {
            baseStyle += ' hover:bg-gray-600/30';
        }

        return baseStyle;
    };

    return (
        <div
            className={getSlotStyle()}
            onClick={handleSlotClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {productAt && (
                <div
                    className={`
                        absolute bottom-0 left-0 h-full rounded-lg z-10 overflow-hidden
                        hover:scale-105 transition-all duration-200
                    `}
                    style={{
                        width: productAt.size > 1 ? `${productAt.size * 100}%` : '100%',
                    }}
                    onClick={handleProductClick}
                >
                    <img
                        src={productConfig?.image || '/images/coke.png'}
                        alt={productAt.product}
                        className="w-full h-full object-contain"
                    />
                    <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            )}

            {/* Visual indicators */}
            {!productAt && selectedProduct && isValidPlacement && (
                <div className="absolute inset-0 border-2 border-dashed border-green-400 rounded-lg pointer-events-none" />
            )}

            {isHovered && !productAt && !isValidPlacement && (
                <div className="absolute inset-0 bg-white/10 rounded-lg pointer-events-none" />
            )}

            {/* Placement preview for multi-cell products */}
            {!productAt && selectedProduct && isValidPlacement && selectedProduct.size > 1 && (
                <div
                    className="absolute bottom-0 left-0 h-full bg-green-400/20 rounded-lg pointer-events-none"
                    style={{
                        width: `${selectedProduct.size * 100}%`,
                    }}
                />
            )}
        </div>
    );
}
