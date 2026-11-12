# Especificación de Contrato de API (SDD — API Contract)

**Proyecto:** Sistema de Reservas Especializado de Canchas Deportivas (`CanchaYa`)  
**Curso:** Tópicos Especiales II — Prof. Regis Rivera  
**Rol Responsable:** Estudiante 2 — Architecture / Development Lead (David)  
**Estado:** Contrato REST preliminar derivado de los Requisitos Funcionales  

---

> [!NOTE]  
> Este documento debe ser completado y ajustado por el **Estudiante 2 (Architecture / Development Lead)**. Define los endpoints necesarios para cumplir los casos de uso descritos en `specs/requirements.md`.

## 1. Endpoints de Canchas y Disponibilidad

### `GET /api/v1/courts`
* **Descripción:** Retorna el catálogo de canchas disponibles.
* **Respuesta 200 OK:** Lista de canchas activas con ID, nombre, deporte y tarifa.

### `GET /api/v1/courts/{id}/availability?date=YYYY-MM-DD`
* **Descripción:** Retorna la grilla de slots discretos de 60 min (08:00 a 23:00 en zona horaria America/Panama) para una fecha dada, indicando el estado de cada horario: `DISPONIBLE`, `OCUPADO` o `PASADO` (horas del día actual que ya transcurrieron).
* **Respuesta 200 OK:**
  ```json
  [
    { "start_time": "08:00", "end_time": "09:00", "status": "PASADO", "available": false },
    { "start_time": "10:00", "end_time": "11:00", "status": "DISPONIBLE", "available": true },
    { "start_time": "18:00", "end_time": "19:00", "status": "OCUPADO", "available": false }
  ]
  ```

---

## 2. Endpoints de Reservas

### `POST /api/v1/bookings`
* **Descripción:** Intenta registrar una nueva reserva sin login. El cliente envía únicamente `start_time`; el servidor calcula `end_time = start_time + 60 min` y valida reglas de horario (BR-02) y anticolisión (BR-01).
* **Cuerpo de Solicitud (JSON):**
  ```json
  {
    "court_id": "C1",
    "date": "2026-11-20",
    "start_time": "18:00",
    "customer_name": "Carlos Méndez",
    "customer_email": "carlos@example.com",
    "customer_phone": "+507 6123-4567"
  }
  ```
* **Respuesta 201 Created:** Retorna el `booking_id` generado (formato `CY-` + 8 caracteres criptográficos base32), `end_time` calculado y el estado inicial `CONFIRMADA`.
  ```json
  {
    "booking_id": "CY-7K3M9QXA",
    "court_id": "C1",
    "date": "2026-11-20",
    "start_time": "18:00",
    "end_time": "19:00",
    "customer_name": "Carlos Méndez",
    "customer_email": "carlos@example.com",
    "customer_phone": "+507 6123-4567",
    "status": "CONFIRMADA",
    "created_at": "2026-11-11T21:00:00Z"
  }
  ```
* **Respuesta 400 Bad Request:** Violación de reglas de tiempo (fuera de rango 08:00-23:00, hora no exacta ej. 17:30, fecha pasada o fecha > 30 días).
* **Respuesta 409 Conflict:** Cuando el horario solicitado colisiona con una reserva existente activa (`CONFIRMADA`).
* **Respuesta 422 Unprocessable Entity:** Formato de email inválido, nombre fuera de rango (3-80) o teléfono fuera de 7-15 dígitos numéricos.

### `GET /api/v1/bookings/{booking_id}`
* **Descripción:** Consulta el estado y detalle de una reserva mediante su código localizador. Si la reserva estaba `CONFIRMADA` pero su hora de fin ya pasó en hora de Panamá, se retorna como `COMPLETADA` mediante evaluación perezosa.
* **Respuesta 200 OK:** Datos de la reserva y estado (`CONFIRMADA`, `CANCELADA` o `COMPLETADA`).
* **Respuesta 404 Not Found:** Código inexistente.

### `DELETE /api/v1/bookings/{booking_id}` (o `POST /api/v1/bookings/{booking_id}/cancel`)
* **Descripción:** Solicita la cancelación de la reserva aplicando la regla BR-05 (anticipación $\ge$ 2 horas respecto a `start_time` en hora local de Panamá).
* **Respuesta 200 OK:** Reserva cancelada con éxito; retorna estado `CANCELADA` y libera el slot inmediatamente.
* **Respuesta 400 Bad Request:** Cancelación tardía rechazada (`LATE_CANCELLATION`, anticipación menor a 2 horas).
* **Respuesta 404 Not Found:** Reserva inexistente.
* **Respuesta 409 Conflict:** Intento de cancelar una reserva ya `CANCELADA` o `COMPLETADA`.

---

## 3. Formato Estándar de Respuestas de Error

Todas las respuestas de error (4xx y 5xx) siguen la estructura homogénea:

```json
{
  "error": {
    "code": "STRING_ERROR_CODE",
    "message": "Descripción clara del motivo del rechazo."
  }
}
```

### Catálogo de Códigos de Error Principales

| Código HTTP | Error Code (`code`) | Causa |
| :--- | :--- | :--- |
| **400** | `OUT_OF_OPERATING_HOURS` | Solicitud fuera del rango 08:00 - 23:00. |
| **400** | `INVALID_TIME_SLOT` | Hora de inicio no exacta (no termina en `:00`). |
| **400** | `PAST_DATE_TIME` | Fecha u hora de inicio anterior a la hora actual del complejo. |
| **400** | `MAX_ADVANCE_EXCEEDED` | Fecha solicitada a más de 30 días de anticipación. |
| **400** | `LATE_CANCELLATION` | Intento de cancelación con menos de 2 horas de anticipación. |
| **404** | `COURT_NOT_FOUND` | El ID de cancha no existe o está inactiva. |
| **404** | `BOOKING_NOT_FOUND` | El `booking_id` no existe en el sistema. |
| **409** | `BOOKING_CONFLICT` | Solapamiento con otra reserva confirmada en la misma cancha (BR-01). |
| **409** | `INVALID_STATE_TRANSITION`| Intento de cancelar una reserva ya cancelada o completada. |
| **422** | `VALIDATION_ERROR` | Falla en esquema de entrada (email inválido, nombre < 3 chars, teléfono no cumple 7-15 dígitos). |
