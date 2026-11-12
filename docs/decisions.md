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
* [ADR-006: Módulo de Administrador y Gestión Dinámica de Canchas Fuera de Alcance en v1](#adr-006-módulo-de-administrador-y-gestión-dinámica-de-canchas-fuera-de-alcance-en-v1)
* [ADR-007: Zona Horaria Oficial (America/Panama), Unificación de Estados y Evaluación Perezosa](#adr-007-zona-horaria-oficial-americapanama-unificación-de-estados-y-evaluación-perezosa)

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

### ADR-002: Modelo de Reserva Sin Login (Guest Booking con Código Único Reforzado)
* **Estado:** Aceptado (Actualizado en Milestone 1)
* **Fecha:** 2026-11-09 (Actualizado: 2026-11-11)
* **Autores:** Ivan Wu (Product Lead) y David (Architecture Lead)
* **Contexto:**  
  Exigir cuentas con usuario, contraseña y JWT incrementa la fricción del usuario final e introduce complejidad de autenticación que desvía el foco de la evaluación (la cual premia ODD y SDD). Sin embargo, como el localizador es la única credencial para consultar y cancelar turnos, un formato corto (ej. 4 caracteres) presentaba riesgos de ataques de enumeración y fuerza bruta.
* **Decisión:**  
  Permitir que cualquier usuario reserve ingresando únicamente nombre, email y teléfono. El sistema genera un código localizador alfanumérico único (`booking_id`) con prefijo `CY-` y 8 caracteres generados con CSPRNG bajo alfabeto base32 sin caracteres ambiguos (`23456789ABCDEFGHJKLMNPQRSTUVWXYZ`), ofreciendo un espacio de más de 1 billón de combinaciones ($32^8 \approx 1.099 \times 10^{12}$). Se complementa con limitación de tasa (*rate limiting*) por IP en los endpoints de consulta y cancelación.
* **Consecuencias:**  
  * *Positivas:* Cumplimiento de Outcome OC-02 (reserva en < 60 segundos). Menor cantidad de tablas en la base de datos (se omite tabla `users`/`auth_tokens`). Alta resistencia contra intentos de adivinación de códigos.
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

---

### ADR-006: Módulo de Administrador y Gestión Dinámica de Canchas Fuera de Alcance en v1
* **Estado:** Aceptado
* **Fecha:** 2026-11-11
* **Autores:** Ivan Wu (Product Lead) y David (Architecture Lead)
* **Contexto:**  
  La especificación original contemplaba un actor Administrador y la historia US-06 (visualización de agenda general y bloqueo de canchas por mantenimiento). Sin embargo, implementar un panel de administración exigiría autenticación de operadores, control de accesos o endpoints protegidos, lo cual contradice la simplicidad de RNF-02 y el enfoque "Zero-Auth Guest Booking" del proyecto v1.
* **Decisión:**  
  Declarar formalmente el módulo de administración, US-06 y la gestión dinámica de canchas como **fuera de alcance en la v1** (diferido al backlog v2). El catálogo de canchas operativas se precarga mediante datos semilla (*database seed*) directamente en MySQL / Prisma.
* **Consecuencias:**  
  * *Positivas:* Enfoque 100% centrado en la experiencia del cliente y la robustez de la regla anticolisión BR-01. Elimina complejidad de seguridad administrativa no solicitada en la rúbrica.
  * *Negativas:* El mantenimiento de canchas en v1 debe gestionarse a nivel de datos o scripts de base de datos.

---

### ADR-007: Zona Horaria Oficial (America/Panama), Unificación de Estados y Evaluación Perezosa
* **Estado:** Aceptado
* **Fecha:** 2026-11-11
* **Autores:** Ivan Wu (Product Lead) y David (Architecture Lead)
* **Contexto:**  
  Existían ambigüedades respecto a la zona horaria en la que se calculaban las 2 horas de anticipación para cancelación y la prohibición de reservas en el pasado. Además, los estados de la reserva tenían discrepancias entre documentos (`FINALIZADA` vs `COMPLETADA` vs `ACTIVA`), y no se definía el mecanismo de transición a `COMPLETADA`.
* **Decisión:**  
  1. Fijar como zona horaria oficial del complejo **`America/Panama` (UTC−5, sin DST)** para todas las reglas de negocio, apertura/cierre y cálculo de anticipación. Timestamps de persistencia y auditoría (`booking_events`) se almacenan en **UTC**.
  2. Unificar estrictamente los estados canónicos en tres: `CONFIRMADA`, `CANCELADA` y `COMPLETADA`.
  3. Implementar la transición hacia `COMPLETADA` mediante **evaluación perezosa (*lazy evaluation*) al consultar el recurso**: si una reserva `CONFIRMADA` tiene hora de fin ya superada en tiempo local de Panamá, se expone como `COMPLETADA`, eliminando la necesidad de tareas programadas (*cron jobs*) o demonios en segundo plano.
* **Consecuencias:**  
  * *Positivas:* Coherencia absoluta entre especificaciones y código; simplificación operacional del backend (RNF-02) sin workers externos.
  * *Negativas:* Requiere manejo estricto de conversión de zonas horarias en la capa de servicios (`date-fns-tz`).
