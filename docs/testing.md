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
   * Archivo objetivo: `tests/test_conflict.py` (o similar según stack).
   * Validar que dos peticiones para la misma cancha y hora resulten en exactamente 1 reserva confirmada y 1 error 409 Conflict.
2. **Pruebas de Reglas Críticas de Negocio:**
   * Restricción de horario operativo (rechazo de reservas fuera de 08:00 a 23:00).
   * Restricción de tiempo pasado (no agendar fechas pasadas).
   * Cancelación oportuna vs fuera de plazo (< 2 horas).
3. **Pruebas de Validación de Entrada:**
   * Validación de campos requeridos y formato de email.
4. **Pruebas de Criterios de Aceptación:**
   * Verificación automatizada de los escenarios definidos en `specs/acceptance-criteria.md`.

## 2. Herramientas de Testing Sugeridas
* Runner de pruebas (ej. `pytest`, `jest`, etc.).
* Cliente de pruebas HTTP para endpoints de API.
* GitHub Actions workflow para validación en cada Pull Request.
