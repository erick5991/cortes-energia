export type RolUsuario = 'user' | 'admin';

export interface Usuario {
  uid: string;
  email: string;
  nombre: string;
  role: RolUsuario;
}
