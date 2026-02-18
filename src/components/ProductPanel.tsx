'use client';

import { useState } from 'react';
import { ProductConfig } from '@/types/vending';
import { PRODUCT_CONFIGS } from '@/lib/constants';

interface ProductPanelProps {
    selectedProduct: { product: string; size: number } | null;
    onProductSelect: (product: string, size: number) => void;
    onClearMachine: () => void;
}

export default function ProductPanel({
    selectedProduct,
    onProductSelect,
    onClearMachine,
}: ProductPanelProps) {
    const [isTrashHovered, setIsTrashHovered] = useState(false);

    const handleProductClick = (config: ProductConfig) => {
        if (selectedProduct?.product === config.product) {
            onProductSelect('', 0);
        } else {
            onProductSelect(config.product, config.size);
        }
    };

    const handleTrashClick = () => {
        if (confirm('Clear all products from the machine?')) {
            onClearMachine();
        }
    };

    return (
        <div className="flex flex-wrap justify-center gap-4 p-4 bg-background/50 rounded-xl">
            {PRODUCT_CONFIGS.map((config) => {
                const isSelected = selectedProduct?.product === config.product;
                return (
                    <div
                        key={config.product}
                        draggable
                        onDragStart={(e) => {
                            const data = {
                                source: 'toolbox' as const,
                                product: config.product,
                                size: config.size,
                            };
                            e.dataTransfer.setData('application/json', JSON.stringify(data));
                            e.dataTransfer.effectAllowed = 'copy';
                        }}
                        onClick={() => handleProductClick(config)}
                        className={`
                            relative p-3 rounded-lg cursor-grab transition-all duration-200
                            ${isSelected
                                ? 'bg-primary-600/20 border-2 border-primary-400 shadow-lg shadow-primary-500/20'
                                : 'bg-card hover:bg-card/80 border-2 border-transparent'
                            }
                            hover:scale-105 active:scale-95
                        `}
                    >
                        <div className="flex flex-col items-center space-y-2">
                            <img
                                src={config.image}
                                alt={config.label}
                                className="w-12 h-16 object-contain"
                            />
                            <div className="text-center">
                                <div className="font-semibold text-text">{config.label}</div>
                                <div className="text-sm text-muted">
                                    {config.size} Slot{config.size > 1 ? 's' : ''}
                                </div>
                            </div>
                            {isSelected && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full" />
                            )}
                        </div>
                    </div>
                );
            })}

            <div
                onClick={handleTrashClick}
                onMouseEnter={() => setIsTrashHovered(true)}
                onMouseLeave={() => setIsTrashHovered(false)}
                className={`
                    flex items-center justify-center px-6 py-3 rounded-lg cursor-pointer
                    border-2 transition-all duration-200 text-red-400
                    ${isTrashHovered
                        ? 'bg-red-500/20 border-red-400 scale-105 shadow-lg shadow-red-500/20'
                        : 'border-red-500/50 hover:border-red-400 hover:bg-red-500/10'
                    }
                `}
            >
                <span className="text-2xl mr-2">🗑️</span>
                <span className="font-semibold uppercase tracking-wide">Trash</span>
            </div>

            <button
                onClick={handleTrashClick}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
                Clear All
            </button>
        </div>
    );
}