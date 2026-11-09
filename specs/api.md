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
* **Descripción:** Retorna la grilla de slots de 60 min (08:00 a 23:00) para una fecha dada, indicando cuáles están libres y cuáles ocupados.
* **Respuesta 200 OK:**
  ```json
  [
    { "start_time": "08:00", "end_time": "09:00", "available": true },
    { "start_time": "18:00", "end_time": "19:00", "available": false }
  ]
  ```

---

## 2. Endpoints de Reservas

### `POST /api/v1/bookings`
* **Descripción:** Intenta registrar una nueva reserva. Ejecuta la validación de no colisión BR-01.
* **Cuerpo de Solicitud (JSON):**
  ```json
  {
    "court_id": "C1",
    "date": "2026-11-20",
    "start_time": "18:00",
    "end_time": "19:00",
    "customer_name": "Carlos Méndez",
    "customer_email": "carlos@example.com",
    "customer_phone": "+507 6000-0000"
  }
  ```
* **Respuesta 201 Created:** Retorna el `booking_id` generado y los detalles confirmados.
* **Respuesta 409 Conflict:** Cuando el horario solicitado colisiona con una reserva existente.

### `GET /api/v1/bookings/{booking_id}`
* **Descripción:** Consulta el estado y detalle de una reserva mediante su código alfanumérico.
* **Respuesta 200 OK:** Datos de la reserva.
* **Respuesta 404 Not Found:** Código inexistente.

### `DELETE /api/v1/bookings/{booking_id}` (o `POST .../cancel`)
* **Descripción:** Solicita la cancelación de la reserva aplicando la regla BR-05 (anticipación $\ge$ 2 horas).
* **Respuesta 200 OK:** Reserva cancelada con éxito.
* **Respuesta 422 Unprocessable Entity:** Cancelación tardía rechazada.
