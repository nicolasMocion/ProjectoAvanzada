# AGENTS.md — ProjectoAvanzada

## Quick start

```sh
# Backend (Maven Wrapper handles both Windows mvnw.cmd and Unix mvnw)
./mvnw spring-boot:run

# Frontend (separate terminal)
cd frontend && npm start          # ng serve --proxy-config proxy.conf.js
```

## Tests

```sh
./mvnw test                       # SpringBootTest + H2 in-memory (no setup needed)
cd frontend && npm test           # Jasmine/Karma (single spec: app.component.spec.ts)
```

No CI, no linter, no formatter config exists in this repo.

## Demo users (seeded on startup via `ReferenceDataInitializer`)

| Rol            | Email                         | Password         |
|----------------|-------------------------------|------------------|
| ESTUDIANTE     | estudiante.demo@example.com   | CambioSeguro123! |
| OPERADOR       | operador.demo@example.com     | CambioSeguro123! |
| ADMINISTRADOR  | admin.demo@example.com        | CambioSeguro123! |

## Auth & security

- `POST /auth/login` → JWT. All other endpoints require `Authorization: Bearer <token>`.
- JWT principal claim is `email` (not `sub`). Authority claim is `authorities`.
- Public: `/auth/login`, `/swagger-ui/**`, `/v3/api-docs/**`, `/error`, `/static/**`.
- Swagger UI at `/swagger-ui.html`.

## Config (env vars with defaults, from `application.properties`)

| Env / Key               | Default                                                  |
|-------------------------|----------------------------------------------------------|
| `DB_URL`                | `jdbc:postgresql://localhost:5432/gestion_solicitudes`   |
| `DB_USERNAME`           | `postgres`                                               |
| DB password (no env)    | hardcoded `mint`                                         |
| `JWT_SECRET`            | `change-this-jwt-secret-with-at-least-32-bytes`          |
| `JWT_ISSUER`            | `gestion-solicitudes`                                    |
| `JWT_ACCESS_TOKEN_TTL`  | `PT8H`                                                   |

- `spring.jpa.hibernate.ddl-auto=update` — Hibernate manages schema
- `spring.jpa.open-in-view=false`
- `spring.jpa.show-sql=true` in dev (expect SQL log noise)
- Test uses H2 with `MODE=PostgreSQL` and `create-drop`

## State machine (`EstadoSolicitud.canTransitionTo()`)

- REGISTRADA → CLASIFICADA
- CLASIFICADA → EN_ATENCION | CERRADA
- EN_ATENCION → ATENDIDA | CERRADA
- ATENDIDA → CERRADA
- CERRADA → (terminal)

## API endpoints

**`/solicitudes`** — CRUD + state transitions at `/{id}/{action}`:
- Most transitions are `@PatchMapping`; **`/cerrar` is `@PostMapping`** (odd one out).
- GET supports query params: `estado`, `tipo`, `prioridad`, `responsableId`, `page`, `size`.
- Actions: `/clasificar`, `/priorizar`, `/asignar`, `/iniciar-atencion`, `/resolver`, `/cerrar`.
- Also `GET /{id}/historial`.

**`/usuarios`** — CRUD, admin only (`@PreAuthorize("hasRole('ADMINISTRADOR')")`).

**`/sugerencias/clasificar`** — AI classification suggestion.

## State machine constraints

- Classify, prioritize, assign → OPERADOR/ADMINISTRADOR only.
- Start attention, resolve, close → assigned responsible or OPERADOR/ADMINISTRADOR.
- Closed requests are immutable.
- ESTUDIANTE sees own requests; OPERADOR/ADMINISTRADOR see all.

## Frontend specifics

- Angular 19 **standalone** (no NgModules). `bootstrapApplication` in `main.ts`.
- Proxy (`proxy.conf.js`) forwards `/auth/**`, `/solicitudes/**`, `/sugerencias/**`, `/usuarios/**` → `http://localhost:8080`.
- Routes: `/login` (public), `/estudiante/**`, `/operador/**`, `/administrador/**` (guarded by `AuthGuard` + `RoleGuard`).
