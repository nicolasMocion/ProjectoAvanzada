import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, CrearUsuarioRequest } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  constructor(private http: HttpClient) {}

  listarOperadoresActivos(): Observable<{ id: string; nombre: string }[]> {
    return this.http.get<{ id: string; nombre: string }[]>('/usuarios/operadores-activos');
  }

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>('/usuarios');
  }

  obtener(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`/usuarios/${id}`);
  }

  buscarPorIdentificacion(identificacion: string): Observable<{ id: string; nombre: string; identificacion: string; email: string } | null> {
    return this.http.get<{ id: string; nombre: string; identificacion: string; email: string }>(`/usuarios/buscar-por-identificacion/${encodeURIComponent(identificacion)}`);
  }

  crear(req: CrearUsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>('/usuarios', req);
  }

  actualizar(id: string, req: Partial<CrearUsuarioRequest>): Observable<Usuario> {
    return this.http.put<Usuario>(`/usuarios/${id}`, req);
  }

  toggleActivo(id: string): Observable<Usuario> {
    return this.http.patch<Usuario>(`/usuarios/${id}/toggle-activo`, {});
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`/usuarios/${id}`);
  }
}
