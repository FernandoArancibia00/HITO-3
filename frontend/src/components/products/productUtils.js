// Utilidades compartidas por los componentes de productos.

export const DEFAULT_PRODUCT_IMAGE = 'https://placehold.co/400x300/ad0f0f/ffffff?text=UNAB+Marketplace';

export const CONDITION_LABELS = {
  nuevo: 'Nuevo',
  usado: 'Usado',
};

// Precio entero en CLP → "$15.000"
export function formatPrice(value) {
  return `$${Number(value ?? 0).toLocaleString('es-CL')}`;
}

// Si la URL de la imagen falla, se reemplaza una sola vez por la imagen por defecto.
export function handleProductImageError(e) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
}
