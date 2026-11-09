# Especificación del Modelo de Datos (SDD — Data Model)

**Proyecto:** Sistema de Reservas Especializado de Canchas Deportivas (`CanchaYa`)  
**Curso:** Tópicos Especiales II — Prof. Regis Rivera  
**Rol Responsable:** Estudiante 2 — Architecture / Development Lead (David)  
**Estado:** Propuesta de entidades base para implementación  

---

> [!NOTE]  
> Este documento debe ser completado y ajustado por el **Estudiante 2 (Architecture / Development Lead)**. A continuación se presentan las entidades sugeridas para satisfacer las especificaciones funcionales sin login.

## 1. Entidades Principales

### Entidad 1: `courts` (Canchas Deportivas)
* `id` (VARCHAR / PK): Identificador único de la cancha (ej. `C1`, `C2`).
* `name` (VARCHAR): Nombre público de la cancha (ej. "Cancha 1 - Fútbol 7 Sintético").
* `sport` (VARCHAR): Tipo de deporte (`FUTBOL_7`, `PADEL`, `TENIS`, `BASQUET`).
* `hourly_rate` (DECIMAL): Tarifa base por hora.
* `is_active` (BOOLEAN): Estado operativo (True = habilitada para reservas).

### Entidad 2: `bookings` (Reservas de Turnos)
* `id` (VARCHAR / PK): Código alfanumérico único para el cliente (ej. `CY-2026-X89J`).
* `court_id` (VARCHAR / FK): Referencia a la cancha reservada.
* `booking_date` (DATE): Fecha del turno (formato `YYYY-MM-DD`).
* `start_time` (TIME): Hora de inicio del partido (ej. `18:00`).
* `end_time` (TIME): Hora de culminación del partido (ej. `19:00`).
* `customer_name` (VARCHAR): Nombre del cliente.
* `customer_phone` (VARCHAR): Teléfono de contacto.
* `customer_email` (VARCHAR): Correo electrónico del cliente.
* `status` (VARCHAR): Estado canónico (`CONFIRMADA`, `CANCELADA`, `COMPLETADA`).
* `created_at` (TIMESTAMP): Fecha y hora UTC del registro de la reserva.

---

## 2. Restricciones e Índices de Integridad
* **Restricción de Anticolisión:** El motor debe indexar `(court_id, booking_date, status)` para garantizar búsquedas de solapamiento rápidas y atómicas.
