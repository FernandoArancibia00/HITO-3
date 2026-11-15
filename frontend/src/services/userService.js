import api from './api';

/**
 * Servicio de perfiles (T11).
 */
export const userService = {
  /**
   * Perfil del usuario conectado.
   * GET /api/users/me → { id, name, email, role, career, campus, phone, createdAt }
   */
  async getMe() {
    return api.get('/users/me');
  },

  /**
   * Edita el perfil propio. email y role no se envían (el backend responde 400).
   * Un texto vacío en career, campus o phone borra el dato.
   * PATCH /api/users/me  { name?, career?, campus?, phone? }
   */
  async updateMe({ name, career, campus, phone }) {
    const body = {};
    if (name !== undefined) body.name = name.trim();
    if (career !== undefined) body.career = career.trim();
    if (campus !== undefined) body.campus = campus.trim();
    if (phone !== undefined) body.phone = phone.trim();
    return api.patch('/users/me', body);
  },

  /**
   * Perfil público de un usuario con sus productos activos y con stock.
   * GET /api/users/:id → { id, name, career, campus, products }
   */
  async getPublicProfile(id) {
    return api.get(`/users/${id}`);
  },
};

export default userService;
