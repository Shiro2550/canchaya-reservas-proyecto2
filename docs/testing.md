# Estrategia y Plan de Pruebas Automatizadas (QA & Testing)

**Proyecto:** Sistema de Reservas Especializado de Canchas Deportivas (`CanchaYa`)  
**Curso:** Tópicos Especiales II — Prof. Regis Rivera  
**Rol Responsable:** Estudiante 3 — QA / DevOps Lead  
**Estado:** Plantilla de estrategia de aseguramiento de calidad  

---

> [!NOTE]  
> Este documento debe ser completado por el **Estudiante 3 (QA / DevOps Lead)**. Su responsabilidad principal es garantizar la suite de pruebas automatizadas y la integración continua del proyecto.

## 1. Alcance de Pruebas Obligatorias (Según Rúbrica)

1. **Prueba de Prevención de Doble Reserva (OBLIGATORIA):**
   * Archivo objetivo: `tests/integration/conflict.test.ts`.
   * Validar que dos peticiones concurrentes para la misma cancha y hora resulten en exactamente 1 reserva confirmada (201 Creado) y 1 rechazo con error 409 Conflict.
2. **Pruebas de Unidad del Algoritmo Anticolisión (BR-01):**
   * Archivo objetivo: `tests/unit/collision.test.ts`.
   * Cobertura de los 5 casos teóricos de solapamiento de intervalos temporales (total, interno, envolvente, por inicio, por fin).
3. **Pruebas de Reglas Críticas de Horarios y Ventanas Temporales:**
   * Archivo objetivo: `tests/integration/booking-rules.test.ts`.
   * Restricción de horario operativo (rechazo fuera de 08:00 a 23:00 con HTTP 400).
   * Restricción de hora no exacta (ej. 17:30 rechazada con HTTP 400).
   * Restricción de tiempo pasado (rechazada con HTTP 400).
   * Límite de 30 días de anticipación (31 días rechazada con HTTP 400; 30 días aceptada con HTTP 201).
4. **Pruebas de Cancelación y Restricción de 2 Horas:**
   * Archivo objetivo: `tests/integration/cancellation.test.ts`.
   * Cancelación oportuna ($\ge 2$ h) con HTTP 200 y liberación de slot.
   * Cancelación tardía ($< 2$ h) con HTTP 400 (`LATE_CANCELLATION`).
5. **Pruebas de Validación de Formato de Entrada:**
   * Validación de campos faltantes, email inválido y teléfono (mínimo 7 y máximo 15 dígitos numéricos) retornando HTTP 422.
6. **Pruebas de Criterios de Aceptación:**
   * Verificación automatizada de los escenarios definidos en `specs/acceptance-criteria.md`.

## 2. Herramientas y Convenciones de Testing (TypeScript)
* **Runner y Framework:** Vitest (ejecución nativa de TypeScript y soporte de mocks de fecha/hora integrados).
* **Cliente de Pruebas HTTP:** Fastify `inject()` o Supertest para pruebas de integración contra la API REST sin levantar puertos externos.
* **Integración Continua:** Flujo de GitHub Actions con servicio de base de datos MySQL 8.4 para validación en cada Pull Request.
