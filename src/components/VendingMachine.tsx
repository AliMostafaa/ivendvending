'use client';

import { useState, useEffect } from 'react';
import { ProductData, DragData } from '@/types/vending';
import { createEmptyGrid, canPlaceProduct, getProductAt, moveProduct, addProduct, deleteProduct } from '@/lib/grid';
import { loadLayout, saveLayout } from '@/lib/storage';
import { GRID_CONFIG, MESSAGES } from '@/lib/constants';
import ProductSlot from './ProductSlot';
import ProductPanel from './ProductPanel';
import StatusBar from './StatusBar';

export default function VendingMachine() {
    const [grid, setGrid] = useState<(string | null)[][]>([]);
    const [products, setProducts] = useState<ProductData[]>([]);
    const [itemCounter, setItemCounter] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState<{ product: string; size: number } | null>(null);

    useEffect(() => {
        initGrid();
        loadLayoutData();
    }, []);

    const initGrid = () => {
        const newGrid = createEmptyGrid(GRID_CONFIG.rows, GRID_CONFIG.cols);
        setGrid(newGrid);
    };

    const loadLayoutData = () => {
        const savedData = loadLayout();
        if (savedData) {
            setProducts(savedData.products);
            setItemCounter(savedData.itemCounter);

            // Rebuild grid from products
            const newGrid = createEmptyGrid(GRID_CONFIG.rows, GRID_CONFIG.cols);
            savedData.products.forEach(product => {
                for (let i = 0; i < product.size; i++) {
                    newGrid[product.r][product.c + i] = product.id;
                }
            });
            setGrid(newGrid);
        }
    };

    const handleSlotClick = (r: number, c: number) => {
        if (!selectedProduct) return;

        const existingProduct = getProductAt(products, { r, c });

        if (existingProduct) {
            if (confirm(MESSAGES.CONFIRM_REPLACE)) {
                // Remove existing product
                const updatedProducts = deleteProduct(products, existingProduct.id);
                setProducts(updatedProducts);

                // Update grid
                const newGrid = deleteProductFromGrid(grid, existingProduct);
                setGrid(newGrid);

                // Place new product if possible
                if (canPlaceProduct(newGrid, { r, c }, selectedProduct.size)) {
                    handleAddProduct(selectedProduct.product, r, c, selectedProduct.size);
                }
            }
        } else {
            if (canPlaceProduct(grid, { r, c }, selectedProduct.size)) {
                handleAddProduct(selectedProduct.product, r, c, selectedProduct.size);
            } else {
                alert(MESSAGES.CANNOT_PLACE);
            }
        }
    };

    const handleAddProduct = (product: string, r: number, c: number, size: number) => {
        const result = addProduct(products, { product, size, position: { r, c } }, itemCounter);
        setProducts(result.products);
        setItemCounter(result.itemCounter);

        const newGrid = createEmptyGrid(GRID_CONFIG.rows, GRID_CONFIG.cols);
        result.products.forEach(p => {
            for (let i = 0; i < p.size; i++) {
                newGrid[p.r][p.c + i] = p.id;
            }
        });
        setGrid(newGrid);

        saveLayout({ products: result.products, itemCounter: result.itemCounter });
    };

    const handleMoveProduct = (id: string, newR: number, newC: number, size: number) => {
        const updatedProducts = moveProduct(products, id, { r: newR, c: newC });
        setProducts(updatedProducts);

        const newGrid = createEmptyGrid(GRID_CONFIG.rows, GRID_CONFIG.cols);
        updatedProducts.forEach(p => {
            for (let i = 0; i < p.size; i++) {
                newGrid[p.r][p.c + i] = p.id;
            }
        });
        setGrid(newGrid);

        saveLayout({ products: updatedProducts, itemCounter });
    };

    const handleDeleteProduct = (id: string) => {
        const updatedProducts = deleteProduct(products, id);
        setProducts(updatedProducts);

        const newGrid = deleteProductFromGrid(grid, products.find(p => p.id === id)!);
        setGrid(newGrid);

        saveLayout({ products: updatedProducts, itemCounter });
    };

    const deleteProductFromGrid = (currentGrid: (string | null)[][], product: ProductData): (string | null)[][] => {
        const newGrid = currentGrid.map(row => [...row]);
        for (let i = 0; i < product.size; i++) {
            newGrid[product.r][product.c + i] = null;
        }
        return newGrid;
    };

    const handleProductSelect = (product: string, size: number) => {
        if (selectedProduct?.product === product) {
            setSelectedProduct(null);
        } else {
            setSelectedProduct({ product, size });
        }
    };

    const handleClearMachine = () => {
        setProducts([]);
        setItemCounter(0);
        initGrid();
        saveLayout({ products: [], itemCounter: 0 });
    };

    const handleDrop = (e: React.DragEvent, r: number, c: number) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData('application/json')) as DragData;

        if (data.source === 'toolbox') {
            handleAddProduct(data.product!, r, c, data.size);
        } else if (data.source === 'grid') {
            handleMoveProduct(data.id!, r, c, data.size);
        }
    };

    return (
        <div className="min-h-screen bg-background text-text">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold mb-2">🛒 Vending Machine Planner</h1>
                    <p className="text-muted">Drag items onto the shelves or click to place. Drop in trash to remove.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="relative mx-auto w-full max-w-md">
                            <img
                                src="/images/FullMachineOnlyNew.jpg"
                                alt="Vending Machine"
                                className="w-full h-auto rounded-xl shadow-machine"
                            />
                            <div className="absolute inset-0 pointer-events-none">
                                <div
                                    className="absolute top-24 left-14 w-56 h-96 grid grid-rows-6 gap-1.5"
                                    style={{
                                        gridTemplateColumns: `repeat(${GRID_CONFIG.cols}, 1fr)`,
                                    }}
                                >
                                    {Array.from({ length: GRID_CONFIG.rows }).map((_, r) =>
                                        Array.from({ length: GRID_CONFIG.cols }).map((_, c) => (
                                            <ProductSlot
                                                key={`${r}-${c}`}
                                                row={r}
                                                col={c}
                                                grid={grid}
                                                products={products}
                                                selectedProduct={selectedProduct}
                                                onSlotClick={handleSlotClick}
                                                onDrop={handleDrop}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <ProductPanel
                            selectedProduct={selectedProduct}
                            onProductSelect={handleProductSelect}
                            onClearMachine={handleClearMachine}
                        />

                        <StatusBar
                            selectedProduct={selectedProduct}
                            products={products}
                            itemCounter={itemCounter}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}