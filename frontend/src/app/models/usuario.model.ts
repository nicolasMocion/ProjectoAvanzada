export interface Usuario {
  id: string;
  identificacion: string;
  nombre: string;
  email: string;
  rol: 'estudiante' | 'operador' | 'administrador' | 'docente';
  activo: boolean;
}

export interface CrearUsuarioRequest {
  identificacion: string;
  nombre: string;
  email: string;
  password: string;
  rol: 'estudiante' | 'operador' | 'administrador' | 'docente';
}
