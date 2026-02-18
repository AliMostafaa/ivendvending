'use client';

import { saveLayout, loadLayout } from '@/lib/storage';
import { LayoutData } from '@/types/vending';

interface StatusBarProps {
    selectedProduct: { product: string; size: number } | null;
    products: ProductData[];
    itemCounter: number;
}

interface ProductData {
    id: string;
    product: string;
    size: number;
    r: number;
    c: number;
}

export default function StatusBar({
    selectedProduct,
    products,
    itemCounter,
}: StatusBarProps) {
    const handleSave = () => {
        const layoutData: LayoutData = {
            products,
            itemCounter,
        };
        saveLayout(layoutData);
        alert('Layout saved successfully!');
    };

    const handleLoad = () => {
        const savedData = loadLayout();
        if (savedData) {
            alert('Layout loaded successfully!');
        } else {
            alert('No saved layout found.');
        }
    };

    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    return (
        <div className="flex flex-wrap justify-center items-center gap-4 p-4 bg-background/50 rounded-xl">
            <div className="flex items-center space-x-2 bg-background/80 px-4 py-2 rounded-full">
                <span className="text-sm text-muted">Selected:</span>
                <span className="font-semibold text-text">
                    {selectedProduct
                        ? `${capitalize(selectedProduct.product)} (${selectedProduct.size} slot${selectedProduct.size > 1 ? 's' : ''})`
                        : 'None'
                    }
                </span>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                    💾 Save
                </button>
                <button
                    onClick={handleLoad}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                    📂 Load
                </button>
            </div>

            <div className="text-sm text-muted">
                Products: {products.length}
            </div>
        </div>
    );
}