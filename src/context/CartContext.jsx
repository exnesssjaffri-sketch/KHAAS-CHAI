// Cart Context - Manages shopping cart state
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) {
            setItems([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await cartApi.get();
            setItems(data.items || []);
            setError(null);
        } catch (err) {
            setError(err.message);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addItem = async (productId, quantity = 1) => {
        setError(null);
        try {
            await cartApi.add(productId, quantity);
            await fetchCart();
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const updateItem = async (itemId, quantity) => {
        setError(null);
        try {
            await cartApi.update(itemId, quantity);
            await fetchCart();
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const removeItem = async (itemId) => {
        setError(null);
        try {
            await cartApi.remove(itemId);
            await fetchCart();
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const clearCart = async () => {
        setError(null);
        try {
            await cartApi.clear();
            setItems([]);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const subtotal = items.reduce((sum, item) => sum + item.products.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const value = {
        items,
        loading,
        error,
        subtotal,
        itemCount,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        refresh: fetchCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}