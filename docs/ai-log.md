# Bitácora de Desarrollo Asistido por Inteligencia Artificial (AI Development Log)

**Proyecto:** Sistema de Reservas Especializado de Canchas Deportivas (`CanchaYa`)  
**Curso:** Tópicos Especiales II — Prof. Regis Rivera  
**Ubicación:** `docs/ai-log.md`  
**Estructura Requerida por la Cátedra:** Actividad | IA Utilizada | Solicitud (Prompt) | Resultado Obtenido | Decisión Tomada  

---

## Registro de Actividades

### Entrada 01: Análisis de Requerimientos y Definición de Filosofía ODD
* **Fecha:** 2026-11-09
* **Responsable:** Estudiante 1 — Product / Spec Lead (Ivan Wu)
* **Actividad:** Análisis del documento del proyecto (`DSaIA-Proyecto2.pdf`) e identificación de los outcomes clave para el sistema de reserva.
* **IA Utilizada:** Antigravity / Gemini 3.8 Flash (DeepMind Agentic Environment).
* **Solicitud (Prompt):**
  > *"Analiza el PDF del Proyecto #2 del Prof. Regis Rivera y la conversación del equipo. Extrae los requisitos para el rol de Estudiante 1 (Product / Spec Lead) y formula el marco ODD respondiendo '¿Qué resultado queremos conseguir para el usuario?' enfocado en reserva de canchas deportivas sin login."*
* **Resultado Obtenido:**
  Identificación clara de los 5 outcomes principales: Cero doble reserva, reserva sin fricción de cuentas (< 60s), código único de reserva, grilla en tiempo real y previsibilidad operativa.
* **Decisión Tomada:**
  Adoptar el enfoque de "Zero-Auth Guest Booking" (reserva rápida como invitado con localizador único) para eliminar fricción al usuario y simplificar el modelo de datos relacional sin sacrificar la seguridad de las reservas.

---

### Entrada 02: Inicialización del Andamiaje SDD con Spec-Kit
* **Fecha:** 2026-11-09
* **Responsable:** Estudiante 1 — Product / Spec Lead (Ivan Wu)
* **Actividad:** Configuración de la herramienta oficial `specify-cli` (GitHub Spec-Kit) mediante `uv`.
* **IA Utilizada:** Antigravity CLI / Gemini 3.8 Flash.
* **Solicitud (Prompt):**
  > *"Ejecuta la inicialización de Spec Kit en el repositorio utilizando `uvx --from specify-cli specify init` para generar las plantillas de constitución y flujo de trabajo SDD."*
* **Resultado Obtenido:**
  Instalación y generación automática del directorio `.specify/` con workflows, scripts de validación en PowerShell y plantillas de especificaciones.
* **Decisión Tomada:**
  Mantener la estructura canónica exigida en el PDF (`specs/` y `docs/` en la raíz) integrando el flujo de trabajo de Spec-Kit como motor de desarrollo guiado por especificaciones.

---

### Entrada 03: Formalización Matemática de la Regla Anticolisión (BR-01)
* **Fecha:** 2026-11-09
* **Responsable:** Estudiante 1 — Product / Spec Lead (Ivan Wu)
* **Actividad:** Modelado formal de las condiciones de no solapamiento temporal para evitar la doble reserva.
* **IA Utilizada:** Antigravity / Gemini 3.8 Flash.
* **Solicitud (Prompt):**
  > *"Genera la especificación rigurosa de la regla de no permitir doble reserva, incluyendo la inecuación matemática de solapamiento de intervalos de tiempo y los cinco casos borde (solapamiento total, interno, envolvente, por inicio y por fin)."*
* **Resultado Obtenido:**
  Definición formal: `(N_start < E_end) AND (N_end > E_start) AND (E_status == 'CONFIRMADA')`, acompañada de los códigos de respuesta HTTP correspondientes (409 Conflict).
* **Decisión Tomada:**
  Establecer esta regla como no negociable en `specs/business-rules.md` y generar escenarios Gherkin específicos en `specs/acceptance-criteria.md` para que el Estudiante 3 (QA Lead) implemente la prueba automatizada obligatoria.

---

### Entrada 04: Creación de Criterios de Aceptación en Sintaxis Gherkin
* **Fecha:** 2026-11-09
* **Responsable:** Estudiante 1 — Product / Spec Lead (Ivan Wu)
* **Actividad:** Traducción de reglas de negocio a escenarios BDD reproducibles (Given-When-Then).
* **IA Utilizada:** Antigravity / Gemini 3.8 Flash.
* **Solicitud (Prompt):**
  > *"Redacta en sintaxis Gherkin en español todos los criterios de aceptación para: 1. Conflicto de doble reserva; 2. Creación sin cuenta y validación de datos; 3. Cancelación antes y después del límite de 2 horas."*
* **Resultado Obtenido:**
  Archivo `specs/acceptance-criteria.md` con 11 escenarios BDD cubriendo flujos exitosos, de error y de borde.
* **Decisión Tomada:**
  Vincular directamente cada escenario a un futuro archivo de prueba en `tests/` para facilitar la labor del QA Lead y asegurar la cobertura exigida en la rúbrica.

---

### Entrada 05: Resolución de Inconsistencias de Especificaciones (Milestone 1)
* **Fecha:** 2026-11-11
* **Responsable:** Estudiante 1 — Product / Spec Lead (Ivan Wu)
* **Actividad:** Análisis y resolución integral de las 13 inconsistencias detectadas en la revisión de especificaciones del Dev Lead (Milestone 1: issues #6, #7, #8, #9, #10, #11, #12, #13, #15, #17, #18, #19, #20).
* **IA Utilizada:** Antigravity / Gemini 3.8 Flash (DeepMind Agentic Environment).
* **Solicitud (Prompt):**
  > *"Analiza el milestone 1 y resuelve todas las inconsistencias de especificación reportadas: unificar estados canónicos (CONFIRMADA, CANCELADA, COMPLETADA), clarificar orden de validación y solapamiento, calcular end_time en servidor, fijar códigos HTTP unificados (422, 400, 404, 409), reforzar formato booking_id a 8 caracteres criptográficos, marcar admin fuera de alcance v1 (ADR-006), definir zona horaria America/Panama y evaluación perezosa (ADR-007), unificar nombres de tests en TypeScript, incluir Básquetbol en RF-01, clarificar validación de teléfono (7-15 dígitos), agregar estado PASADO a la grilla y agregar escenarios BDD para límite de 30 días."*
* **Resultado Obtenido:**
  Actualización coordinada de `specs/requirements.md`, `specs/business-rules.md`, `specs/acceptance-criteria.md`, `specs/api.md`, `specs/architecture.md`, `specs/implementation-plan.md`, `docs/decisions.md` (ADR-006, ADR-007), `docs/testing.md` y `README.md`.
* **Decisión Tomada:**
  Formalizar el pipeline de validación en 4 fases, fijar un formato estándar de error JSON, adoptar evaluación perezosa para el estado COMPLETADA sin daemons y estandarizar la convención de pruebas automatizadas a TypeScript (Vitest + Fastify).

---

### Entrada 06: Revisión de Especificaciones y Propuesta de Stack Tecnológico
* **Fecha:** 2026-11-11
* **Responsable:** Estudiante 2 — Architecture / Development Lead (David)
* **Actividad:** Lectura completa del repositorio (README, `specs/`, `docs/`, configuración de Spec-Kit y `DSaIA-Proyecto2.pdf`) para entender el estado del proyecto, detectar inconsistencias entre especificaciones y elegir el stack.
* **IA Utilizada:** Claude Code (aplicación de escritorio) — Claude Opus 5.5.
* **Solicitud (Prompt):**
  > *"Revisa el README y las especificaciones del proyecto (Spec-Kit / SDD), dime qué vamos a hacer según los requisitos y la arquitectura, y propónme un stack si no está definido. No hagas ningún cambio, solo lee, no asumas y pregúntame si no entiendes."*
* **Resultado Obtenido:**
  Resumen del estado por rol, 15 inconsistencias detectadas en las especificaciones (estados, códigos HTTP, `end_time`, formato del `booking_id`, zona horaria, alcance del administrador, entre otras) y comparación de stacks. Se descartó Python (dos lenguajes junto a React) y SQLite (una sola escritura simultánea), explicando además que la base de datos vive en el servidor y no en el dispositivo de cada cliente.
* **Decisión Tomada:**
  Adoptar **TypeScript en todo el proyecto**: Fastify + Zod + Prisma + **MySQL 8.4** en el backend y **React + Vite + Tailwind + shadcn/ui** en el frontend. El módulo de administrador queda fuera de la v1.

---

### Entrada 07: Especificación de la Arquitectura de Software
* **Fecha:** 2026-11-11
* **Responsable:** Estudiante 2 — Architecture / Development Lead (David)
* **Actividad:** Redacción de `specs/architecture.md` (TASK-07) en la rama `feature/architecture-dev-lead`.
* **IA Utilizada:** Claude Code (aplicación de escritorio) — Claude Opus 5.5.
* **Solicitud (Prompt):**
  > *"Confirmo TypeScript + React + MySQL como stack para empezar architecture.md."*
* **Resultado Obtenido:**
  Documento con stack y versiones verificadas en npm, diagrama de capas (presentación → servicios → dominio → persistencia), estructura de `src/` y `tests/`, diagrama de secuencia de creación de reserva, mecanismo anticolisión con dos barreras (bloqueo `SELECT ... FOR UPDATE` de la cancha y un índice único sobre reservas confirmadas), orden de validación, manejo del tiempo con reloj inyectable, seguridad del `booking_id`, preparación para el buffer de 15 minutos y pasos de ejecución local.
* **Decisión Tomada:**
  Marcar como `[PENDIENTE PL]` todo lo que dependía del Product Lead y no implementar nada hasta resolver las inconsistencias. Commit `c4e7920` subido a la rama sin abrir PR, porque el issue #2 aún requería `data-model.md` y `api.md`.

---

### Entrada 08: Registro de Inconsistencias como Issues y Organización en Milestones
* **Fecha:** 2026-11-11
* **Responsable:** Estudiante 2 — Architecture / Development Lead (David)
* **Actividad:** Publicación de las inconsistencias detectadas como issues de GitHub y creación de milestones reales para ordenar el backlog del equipo.
* **IA Utilizada:** Claude Code (aplicación de escritorio) — Claude Opus 5.5, usando GitHub CLI (`gh`).
* **Solicitud (Prompt):**
  > *"Prepárame una lista de cómo arreglamos esas inconsistencias (como issues en GitHub)."* y luego: *"Créalos y acomoda los milestones; el #14 va en el mío."*
* **Resultado Obtenido:**
  15 issues (#6 a #20), cada uno con problema, propuesta y archivos afectados. 5 milestones: *Corrección de Inconsistencias de Specs*, *Arquitectura y Diseño Técnico* (#2, #14), *Implementación Core* (#3), *Pruebas Automatizadas y CI* (#4) y *Cambio de Requerimiento: Buffer 15 min* (#5, #16).
* **Decisión Tomada:**
  Cada PR debe cerrar un issue concreto y abrirse solo con el trabajo completo, para conservar la trazabilidad issue → PR → commit que exige la rúbrica. El #16 (convivencia del buffer con los turnos de hora exacta) se pospone al milestone del cambio de requerimiento.

---

### Entrada 09: Verificación de la Resolución de Inconsistencias (Milestone 1)
* **Fecha:** 2026-11-15
* **Responsable:** Estudiante 2 — Architecture / Development Lead (David)
* **Actividad:** Revisión del commit `e58a2ec` del Product Lead y de los comentarios de cierre de los 13 issues del milestone 1, sin modificar archivos.
* **IA Utilizada:** Claude Code (aplicación de escritorio) — Claude Opus 5.5.
* **Solicitud (Prompt):**
  > *"Ya cerraron todas las issues, dime qué se hizo y qué se solucionó, no edites nada, y partamos de ahí."*
* **Resultado Obtenido:**
  Confirmación de que las 13 inconsistencias se resolvieron (ADR-006 y ADR-007 incluidos) y detección de pendientes: códigos de error distintos entre `architecture.md` y `api.md`, marcas `[PENDIENTE PL]` restantes, `data-model.md` desactualizado, orden de validación al cancelar, ejemplos de `booking_id` fuera del alfabeto definido y endpoint de cancelación sin decidir.
* **Decisión Tomada:**
  Abrir una rama nueva para completar el milestone 2 (`data-model.md`, alineación de `architecture.md` y `api.md`, ADR del stack) y reportar al Product Lead los puntos que le corresponden.

---

### Entrada 10: Modelo de Datos, Alineación del Contrato API y ADR del Stack (Milestone 2)
* **Fecha:** 2026-11-15
* **Responsable:** Estudiante 2 — Architecture / Development Lead (David)
* **Actividad:** Completar el diseño técnico del milestone 2 siguiendo el flujo issue → rama → PR: issue #21 (Dev Lead) e issue #22 (pendientes para el Product Lead), rama `feature/21-data-model-api`.
* **IA Utilizada:** Claude Code (aplicación de escritorio) — Claude Opus 5.5, usando GitHub CLI (`gh`).
* **Solicitud (Prompt):**
  > *"Aplica las opciones recomendadas y conviértelo en una rama; siempre haz un issue y asígnalo a la milestone correspondiente; luego crea la PR a partir de ese issue con lo que se resolvió."*
* **Resultado Obtenido:**
  * `specs/data-model.md`: diagrama entidad-relación, tablas `courts`, `bookings` y `booking_events` (#14), índices, columna generada `active_slot`, restricciones `CHECK`, datos semilla y DDL de referencia para MySQL 8.4.
  * `specs/architecture.md` (v1.1.0): códigos de error unificados con `api.md`, cancha inactiva → 404, orden de validación al cancelar, `429 RATE_LIMITED` y sin marcas `[PENDIENTE PL]`.
  * `specs/api.md` (v1.1.0): cancelación con `POST /api/v1/bookings/{booking_id}/cancel`, `429 RATE_LIMITED` y respuestas de error de la disponibilidad.
  * `docs/decisions.md`: ADR-008. `specs/implementation-plan.md`: TASK-07 a TASK-09 marcadas como completadas.
* **Decisión Tomada:**
  Opciones recomendadas por el Dev Lead: catálogo de errores de `api.md` como fuente única; `POST .../cancel` en lugar de `DELETE`; clave interna `BIGINT` separada de `booking_code`; `DATE` + `TIME` en hora de Panamá con marcas técnicas en UTC; `COMPLETADA` calculado al leer sin escribir en `GET`. El DDL no se ejecutó todavía contra MySQL; se validará al crear el esquema de Prisma (TASK-10).

---

*(Nuevas entradas se añadirán conforme los Estudiantes 2 y 3 avancen en arquitectura, implementación y testing, o cuando se aplique el cambio inesperado de requerimiento).*
