// ADMINISTRADORES DE DEMOSTRACIÓN para el área interna (login mock). No es una persona real de la
// empresa: el nombre es genérico a propósito. `usuario`/`password` solo sirven para el login
// simulado de `utils/authMock.js` (no hay seguridad real), igual que en clientes y asesores.
//
// Cuando exista PostgreSQL, este archivo se reemplaza por la tabla de usuarios con rol ADMIN.
export const administradoresMock = [
  {
    id: 'admin-1',
    codigo: 'ADM001',
    usuario: 'admin01',
    password: '123456',
    nombre: 'Administración Leones',
    cargo: 'Administrador',
  },
]
