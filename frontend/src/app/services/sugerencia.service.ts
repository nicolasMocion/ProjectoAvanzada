import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SugerenciaResponse } from '../models/solicitud.model';

@Injectable({ providedIn: 'root' })
export class SugerenciaService {
  constructor(private http: HttpClient) {}

  clasificar(descripcion: string): Observable<SugerenciaResponse> {
    return this.http.post<SugerenciaResponse>('/sugerencias/clasificar', { descripcion });
  }
}
