export async function searchOpenLibraryBooks(query) {
  if (!query || !query.trim()) {
    return [];
  }

  const cleanQuery = query.trim();
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(cleanQuery)}&limit=6`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error en la consulta a Open Library: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.docs || !Array.isArray(data.docs)) {
      return [];
    }

    const librosProcesados = data.docs.map((doc) => {
      const coverUrl = doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : 'https://placehold.co/300x400/ad0f0f/ffffff?text=Sin+Portada';

      const autorNormalizado = Array.isArray(doc.author_name)
        ? doc.author_name.join(', ')
        : (doc.author_name || 'Autor no especificado');

      return {
        id: doc.key || `ol-${Math.random().toString(36).substring(2, 9)}`,
        titulo: doc.title || 'Título no disponible',
        autor: autorNormalizado,
        anio: doc.first_publish_year || 'Año desconocido',
        imagen: coverUrl
      };
    });

    return librosProcesados;
  } catch (error) {
    console.error('Error al consumir Open Library API:', error);
    throw new Error(error.message || 'No fue posible conectar con el catálogo de Open Library');
  }
}
