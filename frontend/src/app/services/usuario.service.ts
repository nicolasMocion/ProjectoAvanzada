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

  crear(req: CrearUsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>('/usuarios', req);
  }

  actualizar(id: string, req: Partial<CrearUsuarioRequest>): Observable<Usuario> {
    return this.http.put<Usuario>(`/usuarios/${id}`, req);
  }

  toggleActivo(id: string): Observable<Usuario> {
    return this.http.patch<Usuario>(`/usuarios/${id}/toggle-activo`, {});
  }
}
