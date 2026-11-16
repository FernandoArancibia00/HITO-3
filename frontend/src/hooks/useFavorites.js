import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import favoriteService from '../services/favoriteService';

export default function useFavorites() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const favoritesRef = useRef([]);
  const pendingRef = useRef(new Set());

  const updateFavorites = useCallback((update) => {
    const next = typeof update === 'function' ? update(favoritesRef.current) : update;
    favoritesRef.current = next;
    setFavorites(next);
  }, []);

  useEffect(() => {
    let active = true;

    if (!isAuthenticated) {
      updateFavorites([]);
      setLoading(false);
      setNotice(null);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    favoriteService
      .getFavorites()
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error('La respuesta de favoritos no tiene el formato esperado.');
        }
        if (active) updateFavorites(data);
      })
      .catch((error) => {
        if (active) {
          setNotice({
            type: 'danger',
            message: error?.message || 'No se pudieron cargar tus favoritos.',
          });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, updateFavorites]);

  const toggleFavorite = useCallback(
    async (product) => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      const productId = Number(product?.id);
      if (!Number.isInteger(productId) || productId <= 0) {
        setNotice({ type: 'danger', message: 'No se pudo identificar el producto.' });
        return;
      }
      if (pendingRef.current.has(productId)) return;

      const index = favoritesRef.current.findIndex((item) => Number(item.id) === productId);
      const wasFavorite = index !== -1;
      const previousProduct = wasFavorite ? favoritesRef.current[index] : null;
      pendingRef.current.add(productId);
      setNotice(null);
      updateFavorites((current) =>
        wasFavorite
          ? current.filter((item) => Number(item.id) !== productId)
          : [...current, product]
      );

      try {
        if (wasFavorite) {
          await favoriteService.removeFavorite(productId);
        } else {
          await favoriteService.addFavorite(productId);
        }
        setNotice({
          type: 'success',
          message: wasFavorite
            ? `"${product.title}" eliminado de favoritos.`
            : `"${product.title}" añadido a tus favoritos.`,
        });
      } catch (error) {
        updateFavorites((current) => {
          if (!wasFavorite) return current.filter((item) => Number(item.id) !== productId);
          if (current.some((item) => Number(item.id) === productId)) return current;

          const restored = [...current];
          restored.splice(Math.min(index, restored.length), 0, previousProduct);
          return restored;
        });
        setNotice({
          type: 'danger',
          message: error?.message || 'No se pudo actualizar tus favoritos.',
        });
      } finally {
        pendingRef.current.delete(productId);
      }
    },
    [isAuthenticated, navigate, updateFavorites]
  );

  const removeFavorite = useCallback(
    async (id) => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      const productId = Number(id);
      if (!Number.isInteger(productId) || productId <= 0) {
        setNotice({ type: 'danger', message: 'No se pudo identificar el producto.' });
        return;
      }
      if (pendingRef.current.has(productId)) return;

      const index = favoritesRef.current.findIndex((item) => Number(item.id) === productId);
      if (index === -1) return;

      const previousProduct = favoritesRef.current[index];
      pendingRef.current.add(productId);
      setNotice(null);
      updateFavorites((current) => current.filter((item) => Number(item.id) !== productId));

      try {
        await favoriteService.removeFavorite(productId);
        setNotice({
          type: 'success',
          message: `"${previousProduct.title}" eliminado de favoritos.`,
        });
      } catch (error) {
        updateFavorites((current) => {
          if (current.some((item) => Number(item.id) === productId)) return current;

          const restored = [...current];
          restored.splice(Math.min(index, restored.length), 0, previousProduct);
          return restored;
        });
        setNotice({
          type: 'danger',
          message: error?.message || 'No se pudo eliminar el favorito.',
        });
      } finally {
        pendingRef.current.delete(productId);
      }
    },
    [isAuthenticated, navigate, updateFavorites]
  );

  const dismissNotice = useCallback(() => setNotice(null), []);

  return { favorites, loading, notice, dismissNotice, toggleFavorite, removeFavorite };
}
