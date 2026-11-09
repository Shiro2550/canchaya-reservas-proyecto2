# Registro de Decisiones de Producto y Arquitectura (Decision Records)

**Proyecto:** Sistema de Reservas Especializado de Canchas Deportivas (`CanchaYa`)  
**Curso:** Tópicos Especiales II — Prof. Regis Rivera  
**Ubicación:** `docs/decisions.md`  

---

## Índice de Decisiones (ADRs)

* [ADR-001: Selección del Dominio Especializado — Canchas Deportivas](#adr-001-selección-del-dominio-especializado--canchas-deportivas)
* [ADR-002: Modelo de Reserva Sin Login (Guest Booking con Código Único)](#adr-002-modelo-de-reserva-sin-login-guest-booking-con-código-único)
* [ADR-003: Lógica Matemática de Anticolisión de Horarios a Nivel de Especificación](#adr-003-lógica-matemática-de-anticolisión-de-horarios-a-nivel-de-especificación)
* [ADR-004: Adopción del Ecosistema GitHub Spec-Kit y uv para SDD](#adr-004-adopción-del-ecosistema-github-spec-kit-y-uv-para-sdd)
* [ADR-005: Estrategia para el Cambio Inesperado de Requerimiento a Mitad de Ciclo](#adr-005-estrategia-para-el-cambio-inesperado-de-requerimiento-a-mitad-de-ciclo)

---

### ADR-001: Selección del Dominio Especializado — Canchas Deportivas
* **Estado:** Aceptado
* **Fecha:** 2026-11-09
* **Autores:** Equipo de Proyecto (Liderado por Estudiante 1 / Ivan Wu)
* **Contexto:**  
  La guía del proyecto permite seleccionar entre varias opciones (citas médicas, barberías, canchas deportivas, restaurantes, etc.). El equipo buscaba un dominio con reglas de conflicto temporal estrictas pero conceptualmente limpio para modelar en base de datos.
* **Decisión:**  
  Seleccionar el **Sistema de Reservas de Canchas Deportivas (`CanchaYa`)**.
* **Consecuencias:**  
  * *Positivas:* La regla obligatoria de no doble reserva es natural y fundamental para el negocio. Es muy intuitivo para presentar al profesor.
  * *Negativas:* Requiere definir claramente la granularidad de los turnos (bloques fijos de 60 minutos) para evitar complejidad innecesaria de microfracciones.

---

### ADR-002: Modelo de Reserva Sin Login (Guest Booking con Código Único)
* **Estado:** Aceptado
* **Fecha:** 2026-11-09
* **Autores:** Ivan Wu (Product Lead) y David (Architecture Lead)
* **Contexto:**  
  Exigir cuentas con usuario, contraseña y JWT incrementa la fricción del usuario final e introduce complejidad de autenticación que desvía el foco de la evaluación (la cual premia ODD y SDD).
* **Decisión:**  
  Permitir que cualquier usuario reserve ingresando únicamente nombre, email y teléfono. El sistema genera un código localizador alfanumérico único (`booking_id`, ej: `CY-2026-XXXX`). Este código sirve como identificador para consultar o cancelar el turno.
* **Consecuencias:**  
  * *Positivas:* Cumplimiento de Outcome OC-02 (reserva en < 60 segundos). Menor cantidad de tablas en la base de datos (se omite tabla `users`/`auth_tokens`).
  * *Negativas:* El usuario depende de conservar su código de reserva para cualquier reclamo o cancelación.

---

### ADR-003: Lógica Matemática de Anticolisión de Horarios a Nivel de Especificación
* **Estado:** Aceptado
* **Fecha:** 2026-11-09
* **Autores:** Ivan Wu (Product Lead)
* **Contexto:**  
  La consigna del profesor exige explícitamente: *"La regla de no permitir doble reserva debería tener obligatoriamente una prueba automatizada"*. Para que el Dev y el QA implementen la lógica sin inconsistencias, la especificación debe definir con exactitud la fórmula de detección de conflicto.
* **Decisión:**  
  Definir en `specs/business-rules.md` la condición de conflicto basada en intervalos semiabiertos:
  $$\text{Conflicto} \iff (N_{start} < E_{end}) \land (N_{end} > E_{start})$$
  para reservas donde `court_id` sea idéntico y `status = 'CONFIRMADA'`.
* **Consecuencias:**  
  * *Positivas:* Elimina cualquier margen de error en el desarrollo de David y facilita las pruebas de límites del QA Lead.

---

### ADR-004: Adopción del Ecosistema GitHub Spec-Kit y uv para SDD
* **Estado:** Aceptado
* **Fecha:** 2026-11-09
* **Autores:** Ivan Wu (Product Lead)
* **Contexto:**  
  El equipo acordó utilizar Spec-Kit de GitHub ejecutado con `uv` para estandarizar el proceso de Desarrollo Guiado por Especificaciones.
* **Decisión:**  
  Inicializar el repositorio mediante `uvx --from specify-cli specify init` y mantener la estructura exigida en el PDF del curso, incorporando plantillas de especificaciones en `.specify/`.
* **Consecuencias:**  
  * *Positivas:* Flujo de trabajo formal y trazable conforme a los estándares de ingeniería de software con IA.

---

### ADR-005: Estrategia para el Cambio Inesperado de Requerimiento a Mitad de Ciclo
* **Estado:** Aceptado
* **Fecha:** 2026-11-09
* **Autores:** Ivan Wu (Product Lead)
* **Contexto:**  
  El profesor exige introducir un cambio de requerimiento imprevisto a mitad del proyecto y documentar el ciclo completo: cambio solicitado $\rightarrow$ actualizar especificación $\rightarrow$ actualizar criterios de aceptación $\rightarrow$ actualizar tareas $\rightarrow$ modificar código $\rightarrow$ modificar pruebas $\rightarrow$ ver resultados.
* **Decisión:**  
  Diseñar con anticipación la regla de "Buffer de 15 minutos de mantenimiento entre turnos". Dicha regla será formalizada en un commit posterior una vez que el Estudiante 2 complete la primera versión funcional, asegurando evidencia clara en el historial de Git.
