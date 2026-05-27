export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  usuario: UsuarioResponse;
}

export interface UsuarioResponse {
  id: string;
  nombre: string;
  email?: string;
  rol: RolUsuario;
  identificacion?: string;
  activo?: boolean;
}

export type RolUsuario = 'estudiante' | 'operador' | 'administrador' | 'docente';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: RolUsuario;
  authorities: string[];
  iat: number;
  exp: number;
  iss: string;
}
