# Especificación de Arquitectura de Software

**Proyecto:** Sistema de Reservas Especializado de Canchas Deportivas (`CanchaYa`)  
**Curso:** Tópicos Especiales II — Prof. Regis Rivera  
**Rol Responsable:** Estudiante 2 — Architecture / Development Lead (David)  
**Versión:** 1.0.0  
**Fecha:** 2026-11-11  
**Estado:** Aprobado y Consensuado por el Equipo (Product Lead, Dev Lead y QA Lead)  

---

> [!NOTE]  
> Esta arquitectura se deriva de `specs/outcomes.md`, `specs/requirements.md`, `specs/business-rules.md` y `specs/acceptance-criteria.md`. Todas las aclaraciones y resoluciones de especificaciones solicitadas al Product Lead (Ivan Wu) para el Milestone 1 han sido formalizadas y aprobadas.

## 0. Alcance y Supuestos de Arquitectura

| ID | Supuesto / Decisión | Estado |
| :--- | :--- | :--- |
| **AS-01** | **Administrador fuera de alcance en la v1.** US-06 (agenda general) y el bloqueo de canchas no se implementan. Las canchas se cargan mediante datos semilla (*seed*) en la base de datos. | **Aprobado** — Registrado en `docs/decisions.md` (ADR-006) |
| **AS-02** | Estados canónicos de la reserva: `CONFIRMADA`, `CANCELADA`, `COMPLETADA`. | **Aprobado** — Unificado en RF-08, US-04, BR-04 y ADR-007 |
| **AS-03** | El cliente envía solo `start_time`; el servidor calcula `end_time = start_time + 60 min`. | **Aprobado** — Formalizado en RF-03, BR-02 y `specs/api.md` |
| **AS-04** | Zona horaria del complejo: **America/Panama** (UTC−5, sin horario de verano). | **Aprobado** — Registrado en BR-02 y `docs/decisions.md` (ADR-007) |
| **AS-05** | El estado `COMPLETADA` se calcula al leer la reserva (si está `CONFIRMADA` y ya pasó su hora de fin), sin tareas programadas. | **Aprobado** — Formalizado en BR-04 y ADR-007 |
| **AS-06** | Códigos HTTP y orden de validación según la sección 6 de este documento. | **Aprobado** — Formalizado en BR-05, `specs/api.md` y `specs/acceptance-criteria.md` |

---

## 1. Stack Tecnológico Seleccionado

* **Lenguaje de Programación:** **TypeScript** en backend y frontend (un solo lenguaje y tipos compartidos de punta a punta).
* **Framework Web / API:** **Fastify** (API REST) con validación de esquemas mediante **Zod**.
* **Motor de Base de Datos:** **MySQL 8.4** (InnoDB), accedido mediante el ORM **Prisma**.
* **Mecanismo de Concurrencia:** transacción SQL con **bloqueo pesimista de la fila de la cancha** (`SELECT ... FOR UPDATE`) + verificación de solapamiento BR-01 + **índice único** como segunda barrera a nivel de base de datos (ver sección 5).
* **Interfaz de Usuario:** **SPA en React + Vite** con Tailwind CSS y componentes shadcn/ui, responsiva para móvil y escritorio.

### 1.1 Detalle de Herramientas

| Capa | Tecnología | Versión mayor | Propósito |
| :--- | :--- | :--- | :--- |
| Runtime | Node.js | ≥ 24 LTS (desarrollo con 26.x) | Ejecución del backend y herramientas |
| Lenguaje | TypeScript | 7.x | Tipado estático en todo el proyecto |
| API | Fastify | 5.x | Servidor HTTP, *plugins*, logging integrado (pino) |
| Validación | Zod + `fastify-type-provider-zod` | 4.x / 7.x | Esquemas de entrada/salida compartidos con el frontend |
| Documentación API | `@fastify/swagger` + `@fastify/swagger-ui` | 9.x / 6.x | OpenAPI generado desde los esquemas Zod (`/docs`) |
| Protección | `@fastify/rate-limit` | 11.x | Limitar intentos de consulta/cancelación por código (anti-enumeración) |
| ORM / Migraciones | Prisma | 7.x | Esquema, migraciones versionadas y *seed* |
| Base de datos | MySQL | 8.4 | Persistencia relacional transaccional |
| Fechas | date-fns + date-fns-tz | 4.x / 3.x | Cálculos en zona America/Panama |
| Frontend | React + Vite | 19.x / 8.x | SPA |
| UI | Tailwind CSS + shadcn/ui + Motion | 4.x / — / 14.x | Diseño visual, componentes accesibles y animaciones |
| Estado servidor | TanStack Query | 5.x | Caché y sincronización de datos de la API |
| Ruteo | React Router | 8.x | Navegación entre pantallas |
| Formularios | react-hook-form + Zod | 7.x | Validación en cliente con los mismos esquemas del backend |
| Pruebas | Vitest + Supertest (+ Playwright opcional) | 5.x / 7.x / 1.x | Unitarias, integración API y E2E |
| Contenedores | Docker Compose | — | MySQL local idéntico para todo el equipo y CI |

> Las versiones exactas quedarán fijadas en `package-lock.json` al crear el andamiaje (TASK-10).

---

## 2. Diagrama de Arquitectura de Componentes

```mermaid
flowchart TB
    subgraph Cliente["Navegador (móvil / escritorio)"]
        UI["SPA React + Vite<br/>Páginas · Componentes · TanStack Query"]
    end

    subgraph Servidor["Servidor Node.js (Fastify)"]
        R["Capa de Presentación / Controladores<br/>Rutas REST /api/v1 · Esquemas Zod · Mapeo de errores HTTP"]
        S["Capa de Servicios (Casos de uso)<br/>CourtService · AvailabilityService · BookingService"]
        D["Capa de Dominio (lógica pura, sin E/S)<br/>hayConflicto() · generarSlots() · reglasHorario() · generarBookingId() · Clock"]
        P["Capa de Persistencia / Repositorios<br/>Prisma · transacciones · consultas con bloqueo"]
    end

    DB[("MySQL 8.4<br/>courts · bookings · booking_events")]

    UI -- "HTTP/JSON" --> R
    R --> S
    S --> D
    S --> P
    P --> DB
```

**Regla de dependencias:** cada capa solo conoce a la de abajo. La **capa de dominio no accede a la base de datos, a la red ni al reloj del sistema** (recibe la hora actual mediante un `Clock` inyectado). Así, las reglas BR-01, BR-02 y BR-05 se prueban con pruebas unitarias puras, sin interfaz gráfica ni base de datos (RNF-05).

| Capa | Responsabilidad |
| :--- | :--- |
| Presentación | Recibir la petición, validar el formato con Zod, invocar al servicio y traducir errores de dominio a códigos HTTP. |
| Servicios | Orquestar cada caso de uso: abrir transacciones, aplicar reglas de dominio, registrar auditoría. |
| Dominio | Reglas de negocio deterministas: detección de colisión, rango operativo, ventana de cancelación, generación de código. |
| Persistencia | Acceso a datos con Prisma; consultas con bloqueo (`FOR UPDATE`) y traducción de errores de la base de datos. |

---

## 3. Estructura del Repositorio de Código

```text
├── package.json                 # Raíz con npm workspaces (backend, frontend, shared)
├── docker-compose.yml           # MySQL 8.4 para desarrollo y pruebas
├── .env.example                 # Variables de entorno de referencia
│
├── src/
│   ├── shared/                  # Esquemas Zod y tipos compartidos front/back
│   ├── backend/
│   │   ├── prisma/              # schema.prisma, migraciones, seed.ts
│   │   └── src/
│   │       ├── app.ts           # Construcción de la app (inyectable para pruebas)
│   │       ├── server.ts        # Punto de entrada
│   │       ├── config/          # Lectura y validación de variables de entorno
│   │       ├── domain/          # Reglas puras: conflict, slots, schedule, booking-id, clock
│   │       ├── modules/
│   │       │   ├── courts/      # rutas, servicio, repositorio
│   │       │   └── bookings/    # rutas, servicio, repositorio
│   │       └── shared/          # errores de dominio, auditoría, utilidades
│   └── frontend/
│       └── src/
│           ├── pages/           # Catálogo, Disponibilidad, Confirmación, Mi reserva
│           ├── components/      # UI (shadcn/ui) y componentes propios
│           ├── api/             # Cliente HTTP + hooks de TanStack Query
│           └── lib/             # Utilidades de fecha/formato
│
└── tests/                       # Responsabilidad del QA Lead (Estudiante 3)
    ├── unit/                    # Dominio: hayConflicto, reglas de horario, cancelación
    ├── integration/             # API + MySQL real (incluye prueba obligatoria de doble reserva)
    └── e2e/                     # Opcional: flujos completos en navegador (Playwright)
```

> La convención de nombres de pruebas (por ejemplo `tests/integration/conflict.test.ts`) la definirá el QA Lead en `docs/testing.md`, reemplazando las referencias previas a `test_conflict.py`.

---

## 4. Flujo Crítico: Creación de Reserva

```mermaid
sequenceDiagram
    autonumber
    participant C as Cliente (SPA)
    participant API as Ruta POST /api/v1/bookings
    participant SV as BookingService
    participant DOM as Dominio
    participant DB as MySQL

    C->>API: court_id, date, start_time, datos de contacto
    API->>API: Validar formato (Zod) → 422 si falla
    API->>SV: crearReserva(datos)
    SV->>DOM: validarHorario(fecha, hora, ahora) → 400 si viola BR-02
    SV->>DB: BEGIN (READ COMMITTED)
    SV->>DB: SELECT ... FROM courts WHERE id = ? FOR UPDATE
    Note over SV,DB: Las reservas de la misma cancha quedan en fila (una a la vez)
    DB-->>SV: cancha (404 si no existe / 400 si inactiva)
    SV->>DB: SELECT reservas CONFIRMADAS que solapan (fórmula BR-01)
    alt Hay solapamiento
        SV->>DB: ROLLBACK
        SV-->>API: SlotUnavailableError → 409
    else Slot libre
        SV->>DOM: generarBookingId()
        SV->>DB: INSERT booking + INSERT booking_event (CREATED)
        SV->>DB: COMMIT
        SV-->>API: reserva creada → 201
    end
    API-->>C: Respuesta JSON
```

---

## 5. Mecanismo de Concurrencia (Garantía de Cero Doble Reserva — BR-01 / RNF-01)

La garantía se apoya en **dos barreras independientes**:

1. **Barrera principal — serialización por cancha:**
   * La transacción usa nivel de aislamiento `READ COMMITTED`.
   * Lo primero que hace es bloquear la fila de la cancha: `SELECT id FROM courts WHERE id = ? FOR UPDATE`.
   * Dos solicitudes simultáneas para la misma cancha esperan en fila: la segunda solo continúa cuando la primera hizo `COMMIT`, y entonces **ve la reserva recién creada** y recibe `409`.
   * Las reservas de canchas diferentes no se bloquean entre sí.
   * Luego se aplica la fórmula de BR-01 sobre reservas `CONFIRMADA`:
     ```sql
     SELECT id FROM bookings
     WHERE court_id = :court_id
       AND booking_date = :date
       AND status = 'CONFIRMADA'
       AND :start_time < end_time
       AND :end_time   > start_time;
     ```
2. **Barrera de respaldo — índice único en la base de datos:**
   * Columna generada `active_slot` = `1` si `status = 'CONFIRMADA'`, `NULL` en otro caso.
   * Índice `UNIQUE (court_id, booking_date, start_time, active_slot)`.
   * MySQL permite múltiples `NULL` en un índice único, por lo que las reservas canceladas no bloquean el horario (excepción de BR-01), pero es **imposible** guardar dos reservas confirmadas en el mismo slot aunque existiera un error en el código.
   * Si se dispara (error de duplicado), el repositorio lo traduce también a `409`.

> Prisma no modela columnas generadas; la columna y el índice se agregarán en una migración SQL personalizada (`prisma migrate dev --create-only`). El detalle de tablas se documenta en `specs/data-model.md`.

**Por qué este enfoque:** la barrera principal funciona también con la futura regla del buffer de 15 minutos (sección 9), mientras que el índice único protege el caso actual de slots fijos de 60 minutos.

---

## 6. Validación y Manejo de Errores — [PENDIENTE PL]

**Orden de validación al crear una reserva** (la primera regla que falla determina la respuesta):

| Orden | Validación | Código HTTP | Código de error |
| :---: | :--- | :---: | :--- |
| 1 | Formato de datos (campos requeridos, email RFC, nombre 3–80, teléfono ≥ 7 dígitos) | `422` | `VALIDATION_ERROR` |
| 2 | Reglas de horario BR-02 (08:00–23:00, inicio en hora exacta, no en el pasado, ≤ 30 días) | `400` | `OUT_OF_SCHEDULE`, `PAST_DATE`, `TOO_FAR_AHEAD`, `INVALID_SLOT` |
| 3 | Cancha inexistente / inactiva | `404` / `400` | `COURT_NOT_FOUND`, `COURT_INACTIVE` |
| 4 | Colisión BR-01 | `409` | `SLOT_UNAVAILABLE` |

**Otros casos:**

| Situación | Código HTTP | Código de error |
| :--- | :---: | :--- |
| Reserva no encontrada por `booking_id` | `404` | `BOOKING_NOT_FOUND` |
| Cancelación con menos de 2 horas (BR-05) | `400` | `CANCELLATION_WINDOW_CLOSED` |
| Cancelar una reserva ya `CANCELADA` o `COMPLETADA` (BR-04) | `409` | `BOOKING_NOT_CANCELLABLE` |
| Exceso de intentos de consulta/cancelación | `429` | `RATE_LIMITED` |

**Formato único de error:**
```json
{
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "La cancha solicitada no está disponible en el horario seleccionado."
  }
}
```

Los mensajes (`message`) son los textos definidos en `specs/business-rules.md` y `specs/acceptance-criteria.md`.

---

## 7. Manejo del Tiempo

* **Hora del complejo:** fecha y horas de las reservas (`booking_date`, `start_time`, `end_time`) se interpretan en **America/Panama** [PENDIENTE PL].
* **Marcas de auditoría:** `created_at` y los eventos de auditoría se guardan en **UTC** (RNF-06).
* **Reloj inyectable:** la aplicación recibe un objeto `Clock` (`now()`); en producción usa la hora real y en las pruebas una hora fija. Esto permite probar BR-02 (tiempo pasado) y BR-05 (ventana de 2 horas) de forma determinista, como piden los escenarios de cancelación en `acceptance-criteria.md`.

---

## 8. Seguridad del Código de Reserva (`booking_id`) — [PENDIENTE PL]

* Como el `booking_id` es la única credencial para consultar y cancelar (modelo sin login, ADR-002), debe ser **difícil de adivinar**.
* Formato propuesto: `CY-` + **8 caracteres** generados con un generador criptográfico (`crypto.randomInt`), usando un alfabeto sin caracteres ambiguos (sin `0`, `O`, `1`, `I`). Ejemplo: `CY-7K3M9QXA` (≈ 10¹² combinaciones).
* Si se produce una colisión de código al insertar (probabilidad despreciable), se genera otro y se reintenta.
* Los endpoints `GET` y `DELETE` por `booking_id` tienen límite de intentos por IP (`@fastify/rate-limit`).

---

## 9. Preparación para el Cambio de Requerimiento (BR-06 — Buffer de 15 minutos)

La función de dominio de colisión recibe el margen como parámetro:

```ts
hayConflicto(nueva, existente, bufferMinutos = 0): boolean
// Conflicto ⇔ nueva.inicio < existente.fin + buffer  ∧  nueva.fin + buffer > existente.inicio
```

* En la v1 el buffer es `0` (BR-01 tal como está especificada).
* Cuando el Product Lead formalice BR-06, el cambio en código se limita a la configuración del buffer, la consulta SQL de solapamiento y la generación de slots, lo que deja un ciclo de cambio pequeño y trazable.
* La definición exacta de cómo convive el buffer con los slots de 60 minutos (bloquear turnos vecinos o redefinir la grilla) queda a cargo del Product Lead en ese ciclo.

---

## 10. Frontend (SPA)

| Pantalla | Historia | Contenido |
| :--- | :--- | :--- |
| Catálogo de canchas | US-01 | Tarjetas por cancha con deporte, tarifa y filtro por deporte |
| Disponibilidad | US-01 | Selector de fecha (hoy a +30 días) y grilla de slots `DISPONIBLE` / `OCUPADO` / `PASADO` |
| Formulario de reserva | US-02 | Panel lateral/modal con nombre, teléfono y email; validación en vivo con los mismos esquemas Zod |
| Confirmación | US-02 / OC-03 | Código `booking_id` destacado con botón de copiar |
| Mi reserva | US-04 / US-05 | Búsqueda por código, detalle, estado y botón de cancelar (deshabilitado si faltan < 2 h) |
| Conflicto | US-03 | Mensaje claro y actualización automática de la grilla al recibir `409` |

* En desarrollo, Vite redirige `/api` al backend (*proxy*), sin configurar CORS.
* En producción, Fastify sirve los archivos compilados del frontend: un solo proceso que desplegar, manteniendo el desacoplamiento porque la SPA solo se comunica por la API REST (RNF-04).

---

## 11. Observabilidad y Auditoría (RNF-06)

* **Logs estructurados** en JSON con pino (incluido en Fastify), con timestamp UTC y un identificador por petición.
* **Tabla de auditoría `booking_events`**: cada creación y cancelación registra la reserva, la acción (`CREATED`, `CANCELLED`) y la fecha en UTC, dentro de la **misma transacción** que la operación. Detalle en `specs/data-model.md`.

---

## 12. Trazabilidad de Requisitos No Funcionales

| RNF | Cómo lo satisface la arquitectura |
| :--- | :--- |
| **RNF-01** Concurrencia | Bloqueo `FOR UPDATE` por cancha + índice único (sección 5) |
| **RNF-02** Simplicidad | Un solo servicio Node + una base MySQL; MySQL en Docker Compose para el equipo |
| **RNF-03** < 200 ms | Índices en `(court_id, booking_date, status)`; consultas de un solo día y una sola cancha |
| **RNF-04** Desacoplamiento | SPA React independiente que consume solo la API REST; diseño responsivo con Tailwind |
| **RNF-05** Testabilidad | Dominio puro + `Clock` inyectable + `buildApp()` reutilizable en pruebas de integración |
| **RNF-06** Auditoría | Tabla `booking_events` + logs estructurados en UTC |

---

## 13. Decisiones de Despliegue y Ejecución Local

> Los comandos estarán disponibles al completar el andamiaje del proyecto (TASK-10).

**Requisitos previos:** Node.js ≥ 24, npm, Docker (para MySQL). Opcional: MySQL 8.4 instalado localmente en lugar de Docker.

**Variables de entorno (`.env`, a partir de `.env.example`):**

| Variable | Ejemplo | Uso |
| :--- | :--- | :--- |
| `DATABASE_URL` | `mysql://canchaya:canchaya@localhost:3306/canchaya` | Conexión de Prisma |
| `PORT` | `3000` | Puerto del backend |
| `TZ_COMPLEX` | `America/Panama` | Zona horaria del complejo |

**Pasos previstos:**
```bash
docker compose up -d            # Levanta MySQL 8.4
npm install                     # Instala dependencias de todos los workspaces
npm run db:migrate              # Aplica migraciones de Prisma
npm run db:seed                 # Carga las canchas iniciales
npm run dev                     # Backend + frontend en modo desarrollo
npm test                        # Ejecuta las pruebas
```

**Base de datos compartida:** la base de datos vive en el servidor donde corre el backend, no en el dispositivo de cada cliente. Todos los navegadores consultan la misma API y, por tanto, la misma base de datos; por eso una reserva hecha por un cliente aparece inmediatamente como `OCUPADO` para los demás. En desarrollo, cada integrante usa su propia base local con datos semilla.

**Integración continua:** el QA / DevOps Lead definirá el pipeline de GitHub Actions; la arquitectura asume un contenedor de servicio MySQL 8.4 para ejecutar las pruebas de integración.

---

## 14. Alternativas Consideradas

| Alternativa | Motivo de descarte |
| :--- | :--- |
| Python + FastAPI | Buen soporte de validación, pero obliga a usar dos lenguajes junto al frontend React y el Dev Lead prefiere no trabajar con Python. |
| SQLite | Sin instalación, pero una sola escritura simultánea y menos adecuada para desplegar; MySQL refleja mejor la concurrencia real que exige RNF-01. |
| PostgreSQL con restricción `EXCLUDE` | La garantía más fuerte a nivel de base de datos, pero agrega una dependencia que el equipo no tiene instalada; el bloqueo por cancha en MySQL cumple el mismo objetivo. |
| HTML + Alpine.js | Más simple, pero el equipo prefiere una SPA más completa y vistosa para la presentación. |
