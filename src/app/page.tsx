'use client';

import { useEffect, useState } from 'react';

interface ProductData {
    id: string;
    product: string;
    size: number;
    r: number;
    c: number;
}

interface GridState {
    rows: number;
    cols: number;
    storageKey: string;
    productImages: Record<string, string>;
}

const CONFIG: GridState = {
    rows: 6,
    cols: 10,
    storageKey: 'vendingMachineLayout',
    productImages: {
        coke: '/Images/coke.png',
        chips: '/Images/chips.png',
        water: '/Images/water.png'
    }
};

export default function Home() {
    const [grid, setGrid] = useState<(string | null)[][]>([]);
    const [itemCounter, setItemCounter] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState<{ product: string; size: number } | null>(null);
    const [products, setProducts] = useState<ProductData[]>([]);

    useEffect(() => {
        initGrid();
        loadLayout();
    }, []);

    const initGrid = () => {
        const newGrid = Array(CONFIG.rows).fill(null).map(() => Array(CONFIG.cols).fill(null));
        setGrid(newGrid);
    };

    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    const canPlaceProduct = (r: number, c: number, size: number, excludeId?: string): boolean => {
        if (c + size > CONFIG.cols) return false;
        if (r < 0 || r >= CONFIG.rows || c < 0 || c >= CONFIG.cols) return false;

        for (let i = 0; i < size; i++) {
            const cell = grid[r]?.[c + i];
            if (cell !== null && cell !== undefined && cell !== excludeId) {
                return false;
            }
        }
        return true;
    };

    const addProduct = (product: string, r: number, c: number, size: number) => {
        if (!canPlaceProduct(r, c, size)) {
            alert('Cannot place here!');
            return;
        }

        const newId = `prod_${itemCounter + 1}`;
        setItemCounter(prev => prev + 1);

        const newProduct: ProductData = {
            id: newId,
            product,
            size,
            r,
            c
        };

        setProducts(prev => [...prev, newProduct]);
        saveLayout([...products, newProduct]);
    };

    const moveProduct = (id: string, newR: number, newC: number, size: number) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        const newGrid = grid.map(row => [...row]);
        for (let i = 0; i < product.size; i++) {
            newGrid[product.r][product.c + i] = null;
        }

        const updatedProducts = products.map(p =>
            p.id === id ? { ...p, r: newR, c: newC } : p
        );
        setProducts(updatedProducts);

        for (let i = 0; i < size; i++) {
            newGrid[newR][newC + i] = id;
        }
        setGrid(newGrid);
        saveLayout(updatedProducts);
    };

    const removeProduct = (id: string) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        const updatedProducts = products.filter(p => p.id !== id);
        setProducts(updatedProducts);
        saveLayout(updatedProducts);
    };

    const saveLayout = (prods: ProductData[]) => {
        const data = {
            products: prods,
            itemCounter
        };
        if (typeof window !== 'undefined') {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
        }
    };

    const loadLayout = () => {
        if (typeof window === 'undefined') return;

        const saved = localStorage.getItem(CONFIG.storageKey);
        if (!saved) return;

        try {
            const data = JSON.parse(saved);
            setItemCounter(data.itemCounter || 0);
            if (data.products) {
                setProducts(data.products);
            }
        } catch (e) {
            console.error('Error loading layout:', e);
        }
    };

    const clearMachine = () => {
        if (confirm('Clear all products from the machine?')) {
            setProducts([]);
            setItemCounter(0);
            initGrid();
            if (typeof window !== 'undefined') {
                localStorage.removeItem(CONFIG.storageKey);
            }
        }
    };

    const handleSlotClick = (r: number, c: number) => {
        if (!selectedProduct) return;

        const existingProduct = products.find(p => p.r === r && p.c === c);

        if (existingProduct) {
            if (confirm('Replace existing product?')) {
                removeProduct(existingProduct.id);
                if (canPlaceProduct(r, c, selectedProduct.size)) {
                    addProduct(selectedProduct.product, r, c, selectedProduct.size);
                }
            }
        } else {
            if (canPlaceProduct(r, c, selectedProduct.size)) {
                addProduct(selectedProduct.product, r, c, selectedProduct.size);
            } else {
                alert('Cannot place here!');
            }
        }
    };

    const handleProductDragStart = (e: React.DragEvent, product: string, size: number) => {
        const data = { source: 'toolbox', product, size };
        e.dataTransfer.setData('application/json', JSON.stringify(data));
    };

    const handleDrop = (e: React.DragEvent, r: number, c: number) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        const size = data.size;

        if (data.source === 'toolbox') {
            addProduct(data.product, r, c, size);
        } else if (data.source === 'grid') {
            moveProduct(data.id, r, c, size);
        }
    };

    const handleProductDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const getProductAt = (r: number, c: number) => {
        return products.find(p => p.r === r && p.c === c);
    };

    return (
        <main style={{
            minHeight: '100vh',
            background: '#222',
            color: 'white',
            fontFamily: 'Arial, sans-serif',
            textAlign: 'center',
            padding: '20px'
        }}>
            <h2>🛒 Vending Machine Layout</h2>
            <p style={{ color: '#aaa' }}>Drag items onto the shelves or click to place. Drop in trash to remove.</p>

            <div style={{ position: 'relative', width: '420px', margin: '0 auto 20px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)', borderRadius: '8px', overflow: 'hidden' }}>
                <img
                    src="/Images/FullMachineOnlyNew.jpg"
                    alt="Vending Machine"
                    style={{ width: '420px', maxWidth: '100%', height: 'auto', display: 'block', borderRadius: '8px' }}
                />
                <div style={{
                    position: 'absolute',
                    top: '85px',
                    left: '58px',
                    width: '230px',
                    height: '390px',
                    display: 'grid',
                    gridTemplateRows: 'repeat(6, 1fr)',
                    gap: '6px'
                }}>
                    {Array(CONFIG.rows).fill(null).map((_, r) => (
                        <div key={r} style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(10, 1fr)',
                            gap: '4px',
                            borderBottom: '1px dashed rgba(255,255,255,0.3)',
                            paddingBottom: '2px'
                        }}>
                            {Array(CONFIG.cols).fill(null).map((_, c) => {
                                const productAt = getProductAt(r, c);
                                return (
                                    <div
                                        key={c}
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '4px',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                        onClick={() => handleSlotClick(r, c)}
                                        onDragOver={handleProductDragOver}
                                        onDrop={(e) => handleDrop(e, r, c)}
                                    >
                                        {productAt && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                height: '100%',
                                                width: productAt.size > 1 ? `${productAt.size * 100}%` : '100%',
                                                borderRadius: '6px',
                                                zIndex: 10,
                                                overflow: 'hidden'
                                            }}>
                                                <img
                                                    src={CONFIG.productImages[productAt.product]}
                                                    alt={productAt.product}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                    draggable
                                                    onDragStart={(e) => {
                                                        const data = { source: 'grid', id: productAt.id, size: productAt.size, oldR: productAt.r, oldC: productAt.c };
                                                        e.dataTransfer.setData('application/json', JSON.stringify(data));
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', padding: '10px' }}>
                {Object.entries(CONFIG.productImages).map(([product, src]) => {
                    const size = product === 'chips' ? 2 : 1;
                    const isSelected = selectedProduct?.product === product;
                    return (
                        <div
                            key={product}
                            draggable
                            onDragStart={(e) => handleProductDragStart(e, product, size)}
                            onClick={() => {
                                if (selectedProduct?.product === product) {
                                    setSelectedProduct(null);
                                } else {
                                    setSelectedProduct({ product, size });
                                }
                            }}
                            style={{
                                background: '#333',
                                padding: '12px',
                                borderRadius: '8px',
                                cursor: 'grab',
                                width: '85px',
                                minHeight: '100px',
                                border: `2px solid ${isSelected ? '#4CAF50' : '#555'}`,
                                backgroundColor: isSelected ? '#3a5a3a' : '#333',
                                transition: 'transform 0.2s, background 0.2s, border-color 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <img src={src} alt={product} style={{ width: '50px', height: '70px', objectFit: 'contain', marginBottom: '5px' }} />
                            <span style={{ color: '#ccc', fontSize: '0.85rem' }}>{capitalize(product)}<br /><small>{size} Slot{size > 1 ? 's' : ''}</small></span>
                        </div>
                    );
                })}

                <div
                    onClick={clearMachine}
                    style={{
                        border: '2px dashed #ff4c4c',
                        color: '#ff4c4c',
                        padding: '15px 25px',
                        borderRadius: '8px',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                >
                    🗑️ Trash
                </div>

                <button
                    onClick={clearMachine}
                    style={{
                        background: '#d32f2f',
                        color: 'white',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Clear All
                </button>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <span style={{ color: '#4CAF50', fontWeight: 'bold', padding: '8px 15px', background: 'rgba(76,175,80,0.1)', borderRadius: '20px' }}>
                    {selectedProduct ? `Selected: ${capitalize(selectedProduct.product)} (${selectedProduct.size} slot${selectedProduct.size > 1 ? 's' : ''})` : 'Selected: None'}
                </span>
            </div>
        </main>
    );
}
