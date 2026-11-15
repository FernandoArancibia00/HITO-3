import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('unab_marketplace_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sincronizar con localStorage como fallback de persistencia
  useEffect(() => {
    try {
      localStorage.setItem('unab_marketplace_cart', JSON.stringify(items));
    } catch {
      // Ignorar errores en almacenamiento local
    }
  }, [items]);

  // Cargar carrito desde el backend si hay token activo
  const cargarCarritoDesdeApi = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const res = await cartService.getCart();
      if (res && Array.isArray(res.items)) {
        setItems(res.items);
      }
    } catch {
      // Si falla la API o no está disponible, mantenemos los datos locales
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarCarritoDesdeApi();
  }, [cargarCarritoDesdeApi]);

  // Cálculo del total general respetando precio entero CLP
  const total = items.reduce((acc, item) => {
    const precio = Number(item.product?.price ?? item.product?.precio ?? 0);
    return acc + precio * (item.quantity || 1);
  }, 0);

  // Total de unidades (para el badge de la barra de navegación)
  const totalItems = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  /**
   * Agregar un producto al carrito
   */
  const addToCart = async (product, quantityToAdd = 1) => {
    setError(null);
    const productId = product.id;
    const stockDisponible = product.stock ?? 999;
    const token = localStorage.getItem('token');

    // Validación optimista de stock
    const existingItem = items.find(
      (it) => it.productId === productId || it.product?.id === productId
    );
    const currentQty = existingItem ? existingItem.quantity : 0;
    const newQty = currentQty + quantityToAdd;

    if (newQty > stockDisponible) {
      setError(`Stock insuficiente para "${product.title || product.nombre}". Máximo disponible: ${stockDisponible}`);
      return;
    }

    // Si hay sesión, intentar sincronizar con la API NestJS
    if (token) {
      try {
        setLoading(true);
        const res = await cartService.addToCart(productId, quantityToAdd);
        if (res && Array.isArray(res.items)) {
          setItems(res.items);
          return;
        }
      } catch (err) {
        setError(err.message || 'Error al sincronizar con el servidor.');
      } finally {
        setLoading(false);
      }
    }

    // Modo local / optimista
    setItems((prevItems) => {
      const idx = prevItems.findIndex(
        (it) => it.productId === productId || it.product?.id === productId
      );

      if (idx > -1) {
        const updated = [...prevItems];
        updated[idx] = {
          ...updated[idx],
          quantity: newQty,
        };
        return updated;
      } else {
        const newItem = {
          id: Date.now(),
          productId: productId,
          quantity: quantityToAdd,
          product: product,
        };
        return [...prevItems, newItem];
      }
    });
  };

  /**
   * Actualizar cantidad de un ítem
   */
  const updateQuantity = async (itemId, newQuantity) => {
    setError(null);
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    const token = localStorage.getItem('token');
    const targetItem = items.find((it) => it.id === itemId || it.productId === itemId);
    const stockDisponible = targetItem?.product?.stock ?? 999;

    if (newQuantity > stockDisponible) {
      setError(`Stock insuficiente. Máximo disponible: ${stockDisponible}`);
      return;
    }

    if (token) {
      try {
        setLoading(true);
        const res = await cartService.updateQuantity(itemId, newQuantity);
        if (res && Array.isArray(res.items)) {
          setItems(res.items);
          return;
        }
      } catch (err) {
        setError(err.message || 'Error al actualizar cantidad.');
      } finally {
        setLoading(false);
      }
    }

    // Fallback local
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId || it.productId === itemId ? { ...it, quantity: newQuantity } : it
      )
    );
  };

  /**
   * Eliminar un ítem del carrito
   */
  const removeFromCart = async (itemId) => {
    setError(null);
    const token = localStorage.getItem('token');

    if (token) {
      try {
        setLoading(true);
        const res = await cartService.removeFromCart(itemId);
        if (res && Array.isArray(res.items)) {
          setItems(res.items);
          return;
        }
      } catch {
        // En caso de fallo en backend, procedemos con eliminación local
      } finally {
        setLoading(false);
      }
    }

    setItems((prev) => prev.filter((it) => it.id !== itemId && it.productId !== itemId));
  };

  /**
   * Vaciar carrito
   */
  const clearCart = async () => {
    setError(null);
    const token = localStorage.getItem('token');

    if (token) {
      try {
        setLoading(true);
        await cartService.clearCart();
      } catch {
        // Ignorar fallo de red
      } finally {
        setLoading(false);
      }
    }

    setItems([]);
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
