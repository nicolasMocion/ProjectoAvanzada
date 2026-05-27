import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, type OperatorFunction } from 'rxjs';
import {
  ActualizarSolicitudRequest,
  AsignarSolicitudRequest,
  CerrarSolicitudRequest,
  ClasificarSolicitudRequest,
  CrearSolicitudRequest,
  HistorialAccion,
  HistorialAccionApiResponse,
  PagedResponse,
  PriorizarSolicitudRequest,
  ResolverSolicitudRequest,
  Solicitud,
  SolicitudApiResponse
} from '../models/solicitud.model';

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  constructor(private http: HttpClient) {}

  listar(params?: {
    estado?: string; tipo?: string; prioridad?: string;
    responsableId?: string; solicitanteId?: string; page?: number; size?: number
  }): Observable<PagedResponse<Solicitud>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) httpParams = httpParams.set(k, v);
      });
    }
    return this.mapObservable(
      this.http.get<PagedResponse<SolicitudApiResponse>>('/solicitudes', { params: httpParams }),
      (response) => ({
        total: response.total,
        items: response.items.map(item => this.mapSolicitud(item))
      })
    );
  }

  obtener(id: string): Observable<Solicitud> {
    return this.mapObservable(
      this.http.get<SolicitudApiResponse>(`/solicitudes/${id}`),
      (response) => this.mapSolicitud(response)
    );
  }

  crear(req: CrearSolicitudRequest): Observable<Solicitud> {
    return this.mapObservable(
      this.http.post<SolicitudApiResponse>('/solicitudes', req),
      (response) => this.mapSolicitud(response)
    );
  }

  actualizar(id: string, req: ActualizarSolicitudRequest): Observable<Solicitud> {
    return this.mapObservable(
      this.http.patch<SolicitudApiResponse>(`/solicitudes/${id}`, req),
      (response) => this.mapSolicitud(response)
    );
  }

  clasificar(id: string, req: ClasificarSolicitudRequest): Observable<Solicitud> {
    return this.mapObservable(
      this.http.patch<SolicitudApiResponse>(`/solicitudes/${id}/clasificar`, req),
      (response) => this.mapSolicitud(response)
    );
  }

  priorizar(id: string, req: PriorizarSolicitudRequest): Observable<Solicitud> {
    return this.mapObservable(
      this.http.patch<SolicitudApiResponse>(`/solicitudes/${id}/priorizar`, req),
      (response) => this.mapSolicitud(response)
    );
  }

  asignar(id: string, req: AsignarSolicitudRequest): Observable<Solicitud> {
    return this.mapObservable(
      this.http.patch<SolicitudApiResponse>(`/solicitudes/${id}/asignar`, req),
      (response) => this.mapSolicitud(response)
    );
  }

  iniciarAtencion(id: string, observacion?: string): Observable<Solicitud> {
    return this.mapObservable(
      this.http.patch<SolicitudApiResponse>(
        `/solicitudes/${id}/iniciar-atencion`,
        observacion ? { observacion } : {}
      ),
      (response) => this.mapSolicitud(response)
    );
  }

  resolver(id: string, req: ResolverSolicitudRequest): Observable<Solicitud> {
    return this.mapObservable(
      this.http.patch<SolicitudApiResponse>(`/solicitudes/${id}/resolver`, req),
      (response) => this.mapSolicitud(response)
    );
  }

  cerrar(id: string, req: CerrarSolicitudRequest): Observable<Solicitud> {
    return this.mapObservable(
      this.http.post<SolicitudApiResponse>(`/solicitudes/${id}/cerrar`, req),
      (response) => this.mapSolicitud(response)
    );
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`/solicitudes/${id}`);
  }

  historial(id: string): Observable<HistorialAccion[]> {
    return this.mapObservable(
      this.http.get<HistorialAccionApiResponse[]>(`/solicitudes/${id}/historial`),
      (response) => response.map(item => ({
        id: item.id,
        solicitudId: item.solicitudId,
        accion: item.accion,
        usuario: item.usuario ?? null,
        timestamp: item.timestamp,
        observacion: item.observacion ?? undefined
      }))
    );
  }

  private mapSolicitud(api: SolicitudApiResponse): Solicitud {
    const hasPrioridad = !!api.prioridad || !!api.justificacionPrioridad || !!api.fechaLimite;

    return {
      id: api.id,
      tipo: api.tipo,
      descripcion: api.descripcion,
      canalOrigen: api.canalOrigen,
      fechaCreacion: api.timestamp,
      solicitante: api.solicitante,
      solicitanteNombre: api.solicitanteNombre ?? undefined,
      solicitanteIdentificacion: api.solicitanteIdentificacion ?? undefined,
      solicitanteEmail: api.solicitanteEmail ?? undefined,
      responsable: api.responsable ?? null,
      estado: api.estado,
      prioridad: hasPrioridad ? {
        nivel: api.prioridad ?? undefined,
        justificacion: api.justificacionPrioridad ?? undefined,
        fechaLimite: api.fechaLimite ?? undefined
      } : null,
      observacion: api.observacion ?? undefined,
      observacionCierre: api.observacionCierre ?? undefined,
      respuesta: api.respuesta ?? undefined,
      fechaLimite: api.fechaLimite ?? null,
      tipoSugerenciaIa: api.tipoSugerenciaIa ?? null,
      prioridadSugerenciaIa: api.prioridadSugerenciaIa ?? null,
      valorConfianzaIa: api.valorConfianzaIa ?? null
    };
  }

  private mapObservable<TSource, TMapped>(
    source: Observable<TSource>,
    mapper: (value: TSource) => TMapped
  ): Observable<TMapped> {
    const mappedObservable: Observable<TMapped> = {
      subscribe: (observer) => source.subscribe({
        next: (value: TSource) => {
          const mapped = mapper(value);
          if (typeof observer === 'function') {
            observer(mapped);
            return;
          }
          observer?.next?.(mapped);
        },
        error: (err: unknown) => {
          if (typeof observer !== 'function') {
            observer?.error?.(err);
          }
        },
        complete: () => {
          if (typeof observer !== 'function') {
            observer?.complete?.();
          }
        }
      }),
      pipe: <A, B>(op1: OperatorFunction<TMapped, A>, op2?: OperatorFunction<A, B>) => {
        const firstResult = op1(mappedObservable);
        return op2 ? op2(firstResult) : firstResult;
      }
    };

    return mappedObservable;
  }
}
