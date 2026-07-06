// backend/data/db.js

// Simulación de una base de datos en memoria
const users = [];
let userIdCounter = 1;

// Simulación de un ORM con funciones de acceso a datos
export const db = {
  user: {
    /**
     * Busca un usuario por su auth0Id.
     * @param {string} auth0Id - El ID de Auth0.
     * @returns {Promise<object|null>} El usuario encontrado o null.
     */
    async findUnique({ where: { auth0Id } }) {
      return users.find((user) => user.auth0Id === auth0Id) || null;
    },

    /**
     * Crea un nuevo usuario.
     * @param {object} data - Los datos del nuevo usuario.
     * @returns {Promise<object>} El usuario creado.
     */
    async create({ data }) {
      const newUser = {
        id: userIdCounter++,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.push(newUser);
      return newUser;
    },
  },
};
