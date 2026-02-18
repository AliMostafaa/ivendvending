'use client';

import { useState, useEffect } from 'react';
import { ProductData, GridCell, ProductPlacement } from '@/types/vending';
import { createEmptyGrid, getProductAt, getGridCells, addProduct } from '@/lib/grid';
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

    const handleProductSelect = (product: string, size: number) => {
        if (selectedProduct?.product === product) {
            setSelectedProduct(null);
        } else {
            setSelectedProduct({ product, size });
        }
    };

    const handleProductPlace = (product: string, r: number, c: number, size: number) => {
        // Validate placement first
        const grid = products.reduce((grid, p) => {
            for (let i = 0; i < p.size; i++) {
                grid[p.r][p.c + i] = p.id;
            }
            return grid;
        }, Array.from({ length: GRID_CONFIG.rows }, () => Array(GRID_CONFIG.cols).fill(null)));

        // Check bounds
        if (c + size > GRID_CONFIG.cols || r < 0 || r >= GRID_CONFIG.rows || c < 0) {
            alert('Cannot place product here - extends beyond grid boundary');
            return;
        }

        // Check for conflicts
        for (let i = 0; i < size; i++) {
            if (grid[r][c + i] !== null) {
                alert('Cannot place product here - conflicts with existing item');
                return;
            }
        }

        // Add the product
        const result = addProduct(products, { product, size, position: { r, c } }, itemCounter);
        setProducts(result.products);
        setItemCounter(result.itemCounter);

        // Update grid
        const newGrid = createEmptyGrid(GRID_CONFIG.rows, GRID_CONFIG.cols);
        result.products.forEach(p => {
            for (let i = 0; i < p.size; i++) {
                newGrid[p.r][p.c + i] = p.id;
            }
        });
        setGrid(newGrid);

        // Save to localStorage
        saveLayout({ products: result.products, itemCounter: result.itemCounter });
    };

    const handleClearMachine = () => {
        setProducts([]);
        setItemCounter(0);
        initGrid();
        saveLayout({ products: [], itemCounter: 0 });
    };

    return (
        <div className="min-h-screen bg-background text-text">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold mb-2">🛒 Vending Machine Planner</h1>
                    <p className="text-muted">Drag items onto the shelves or click to place. Drop in trash to remove.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        <div className="relative mx-auto w-full max-w-2xl">
                            <img
                                src="/images/FullMachineOnlyNew.jpg"
                                alt="Vending Machine"
                                className="w-full h-auto rounded-xl shadow-machine"
                            />
                            <div className="absolute inset-0 pointer-events-none">
                                <div
                                    className="absolute top-24 left-14 w-80 h-96 grid grid-rows-6 gap-1.5"
                                    style={{
                                        gridTemplateColumns: `repeat(${GRID_CONFIG.cols}, 1fr)`,
                                    }}
                                >
                                    {getGridCells(grid, products, selectedProduct, null).map((row, r) =>
                                        row.map((cell, c) => (
                                            <ProductSlot
                                                key={`${r}-${c}`}
                                                cell={cell}
                                                products={products}
                                                selectedProduct={selectedProduct}
                                                onProductSelect={handleProductSelect}
                                                onProductPlace={handleProductPlace}
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