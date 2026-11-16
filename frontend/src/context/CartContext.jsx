import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import cartService from '../services/cartService';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const tokenRef = useRef(token);
  const loadVersionRef = useRef(0);
  tokenRef.current = token;

  const applyCart = useCallback((cart) => {
    if (!cart || !Array.isArray(cart.items) || !Number.isFinite(Number(cart.total))) {
      throw new Error('La respuesta del carrito no tiene el formato esperado.');
    }
    setItems(cart.items);
    setTotal(Number(cart.total));
  }, []);

  const cargarCarritoDesdeApi = useCallback(async () => {
    const requestVersion = ++loadVersionRef.current;
    if (!token) {
      setItems([]);
      setTotal(0);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await cartService.getCart();
      if (tokenRef.current === token && requestVersion === loadVersionRef.current) {
        applyCart(res);
      }
    } catch (err) {
      if (tokenRef.current === token && requestVersion === loadVersionRef.current) {
        setItems([]);
        setTotal(0);
        setError(err?.message || 'No se pudo cargar el carrito.');
      }
    } finally {
      if (tokenRef.current === token && requestVersion === loadVersionRef.current) {
        setLoading(false);
      }
    }
  }, [token, applyCart]);

  useEffect(() => {
    cargarCarritoDesdeApi();
  }, [cargarCarritoDesdeApi]);

  // Total de unidades (para el badge de la barra de navegación)
  const totalItems = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const addToCart = async (product, quantityToAdd = 1) => {
    setError(null);
    const productId = Number(product?.id);
    const quantity = Number(quantityToAdd);
    if (!token) {
      setError('Inicia sesión para agregar productos al carrito.');
      return;
    }
    if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity < 1) {
      setError('El producto o la cantidad no son válidos.');
      return;
    }

    const requestToken = token;
    loadVersionRef.current += 1;
    try {
      setLoading(true);
      const cart = await cartService.addToCart(productId, quantity);
      if (tokenRef.current === requestToken) applyCart(cart);
    } catch (err) {
      setError(err?.message || 'No se pudo agregar el producto al carrito.');
    } finally {
      if (tokenRef.current === requestToken) setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    setError(null);
    const cartItemId = Number(itemId);
    const quantity = Number(newQuantity);
    if (!token) {
      setError('Inicia sesión para actualizar el carrito.');
      return;
    }
    if (!Number.isInteger(cartItemId) || cartItemId <= 0 || !Number.isInteger(quantity) || quantity < 1) {
      setError('El producto o la cantidad no son válidos.');
      return;
    }

    const requestToken = token;
    loadVersionRef.current += 1;
    try {
      setLoading(true);
      const cart = await cartService.updateQuantity(cartItemId, quantity);
      if (tokenRef.current === requestToken) applyCart(cart);
    } catch (err) {
      setError(err?.message || 'No se pudo actualizar la cantidad.');
    } finally {
      if (tokenRef.current === requestToken) setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    setError(null);
    const cartItemId = Number(itemId);
    if (!token) {
      setError('Inicia sesión para eliminar productos del carrito.');
      return;
    }
    if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
      setError('No se pudo identificar el producto del carrito.');
      return;
    }

    const requestToken = token;
    loadVersionRef.current += 1;
    try {
      setLoading(true);
      const cart = await cartService.removeFromCart(cartItemId);
      if (tokenRef.current === requestToken) applyCart(cart);
    } catch (err) {
      setError(err?.message || 'No se pudo eliminar el producto del carrito.');
    } finally {
      if (tokenRef.current === requestToken) setLoading(false);
    }
  };

  const clearCart = async () => {
    setError(null);
    if (!token) {
      setError('Inicia sesión para vaciar el carrito.');
      return;
    }

    const requestToken = token;
    loadVersionRef.current += 1;
    try {
      setLoading(true);
      await cartService.clearCart();
      if (tokenRef.current === requestToken) {
        setItems([]);
        setTotal(0);
      }
    } catch (err) {
      setError(err?.message || 'No se pudo vaciar el carrito.');
    } finally {
      if (tokenRef.current === requestToken) setLoading(false);
    }
  };

  const value = {
    items,
    cart: items,
    total,
    totalItems,
    loading,
    error,
    setError,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    recargarCarrito: cargarCarritoDesdeApi,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
