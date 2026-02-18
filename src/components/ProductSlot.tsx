'use client';

import { useState } from 'react';
import { ProductData, GridPosition } from '@/types/vending';
import { canPlaceProduct, getProductAt } from '@/lib/grid';
import { MESSAGES } from '@/lib/constants';

interface ProductSlotProps {
    row: number;
    col: number;
    grid: (string | null)[][];
    products: ProductData[];
    selectedProduct: { product: string; size: number } | null;
    onSlotClick: (r: number, c: number) => void;
    onDrop: (e: React.DragEvent, r: number, c: number) => void;
}

export default function ProductSlot({
    row,
    col,
    grid,
    products,
    selectedProduct,
    onSlotClick,
    onDrop,
}: ProductSlotProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const productAt = getProductAt(products, { r: row, c: col });

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        onDrop(e, row, col);
    };

    const handleClick = () => {
        onSlotClick(row, col);
    };

    const canPlace = selectedProduct ? canPlaceProduct(grid, { r: row, c: col }, selectedProduct.size) : false;

    return (
        <div
            className={`
                relative rounded-lg transition-colors duration-200
                ${productAt ? 'cursor-default' : 'cursor-pointer hover:bg-gray-600/30'}
                ${isDragOver ? 'bg-green-500/40 border-2 border-white/80 scale-105' : ''}
                ${!productAt && canPlace && selectedProduct ? 'ring-2 ring-primary-500/50' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            {productAt && (
                <ProductItem
                    product={productAt}
                    size={productAt.size}
                    imageSrc={productAt.product === 'coke' ? '/images/coke.png' :
                        productAt.product === 'chips' ? '/images/chips.png' : '/images/water.png'}
                />
            )}
        </div>
    );
}

interface ProductItemProps {
    product: ProductData;
    size: number;
    imageSrc: string;
}

function ProductItem({ product, size, imageSrc }: ProductItemProps) {
    return (
        <div
            className="absolute bottom-0 left-0 h-full rounded-lg z-10 overflow-hidden cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
            style={{
                width: size > 1 ? `${size * 100}%` : '100%',
            }}
            draggable
            onDragStart={(e) => {
                const data = {
                    source: 'grid' as const,
                    id: product.id,
                    size: product.size,
                    oldR: product.r,
                    oldC: product.c,
                };
                e.dataTransfer.setData('application/json', JSON.stringify(data));
            }}
        >
            <img
                src={imageSrc}
                alt={product.product}
                className="w-full h-full object-contain"
            />
        </div>
    );
}