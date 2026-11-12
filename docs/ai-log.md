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

*(Nuevas entradas se añadirán conforme los Estudiantes 2 y 3 avancen en arquitectura, implementación y testing, o cuando se aplique el cambio inesperado de requerimiento).*
