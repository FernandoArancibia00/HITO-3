import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('unab_marketplace_cart', JSON.stringify(items));
    } catch {
      // Ignorar errores de almacenamiento local
    }
  }, [items]);

  const total = items.reduce((acc, item) => {
    const precio = Number(item.product?.price ?? item.product?.precio ?? 0);
    return acc + precio * (item.quantity || 1);
  }, 0);

  const totalItems = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const addToCart = (product, quantityToAdd = 1) => {
    setError(null);
    const productId = product.id;
    const stockDisponible = product.stock ?? 999;

    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (it) => it.productId === productId || it.product?.id === productId
      );

      if (existingItemIndex > -1) {
        const currentQty = prevItems[existingItemIndex].quantity;
        const newQty = currentQty + quantityToAdd;

        if (newQty > stockDisponible) {
          setError(`No puedes agregar más unidades. Stock disponible: ${stockDisponible}`);
          return prevItems;
        }

        const updated = [...prevItems];
        updated[existingItemIndex] = {
          ...updated[existingItemIndex],
          quantity: newQty,
        };
        return updated;
      } else {
        if (quantityToAdd > stockDisponible) {
          setError(`Stock insuficiente. Disponible: ${stockDisponible}`);
          return prevItems;
        }

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

  const updateQuantity = (itemId, newQuantity) => {
    setError(null);
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId || item.productId === itemId) {
          const stockDisponible = item.product?.stock ?? 999;
          if (newQuantity > stockDisponible) {
            setError(`Stock insuficiente para "${item.product?.title || item.product?.nombre}". Máximo disponible: ${stockDisponible}`);
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemId) => {
    setError(null);
    setItems((prevItems) =>
      prevItems.filter((item) => item.id !== itemId && item.productId !== itemId)
    );
  };

  const clearCart = () => {
    setError(null);
    setItems([]);
  };

  const value = {
    items,
    cart: items, // alias para retrocompatibilidad
    total,
    totalItems,
    error,
    setError,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
