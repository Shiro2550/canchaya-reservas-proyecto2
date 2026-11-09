# Fase 1: ODD — Outcome-Driven Development (Resultados y Valor de Negocio)

**Proyecto:** Sistema de Reservas Especializado de Canchas Deportivas (`CanchaYa`)  
**Curso:** Tópicos Especiales II — Prof. Regis Rivera  
**Rol Responsable:** Estudiante 1 — Product / Spec Lead (Ivan Wu)  
**Fecha:** Noviembre 2026  
**Estado:** Aprobado para Especificación (SDD)

---

## 1. Filosofía de Desarrollo Orientado por Resultados (ODD)

El objetivo de esta fase no es responder a la pregunta *"¿Qué aplicación queremos programar?"*, sino responder con precisión:
> **"¿Qué resultado medible de valor queremos conseguir para el usuario y el negocio de alquiler de canchas deportivas?"**

---

## 2. Diagnóstico del Problema (Pain Points Actuales)

Actualmente, los centros de complejos deportivos gestionan sus reservas a través de llamadas telefónicas, mensajes informales de WhatsApp o agendas físicas de papel:

* **P1. Cruces y Solapamiento de Horarios (Doble Reserva):** Dos grupos de jugadores llegan a la misma cancha a la misma hora creyendo tenerla reservada, generando discusiones, pérdida de clientes y daño reputacional.
* **P2. Fricción por Registro Obligatorio:** Los usuarios abandonan las plataformas de reserva cuando se les exige crear una cuenta con contraseña, validación de correo y perfiles engorrosos antes de ver la disponibilidad.
* **P3. Dependencia del Personal Administrativo:** Fuera del horario de atención del administrador o durante horas pico, los clientes no pueden confirmar disponibilidad inmediata.
* **P4. Gestión Caótica de Cancelaciones y Modificaciones:** Cancelar o consultar el estado de un turno requiere llamar de nuevo o enviar mensajes que tardan horas en ser respondidos.

---

## 3. Resultados Esperados (Target Outcomes)

| ID | Outcome Esperado | Métrica de Éxito / Indicador |
| :--- | :--- | :--- |
| **OC-01** | **Cero Conflictos de Horario:** Imposibilitar matemáticamente la doble reserva o solapamiento de partidos en la misma cancha. | Tasa de solapamientos = 0.0% (Validación estricta a nivel de backend y motor transaccional). |
| **OC-02** | **Reserva de Fricción Mínima (Sin Login):** Permitir que un usuario reserve un espacio en menos de 60 segundos solo con sus datos de contacto básicos (Nombre, Teléfono, Correo). | Tiempo medio de reserva < 60 segundos; 0 cuentas requeridas. |
| **OC-03** | **Trazabilidad Inmediata y Autogestión:** Entregar al cliente un Identificador / Código Único de Reserva (`booking_id`) con el que pueda consultar su estado o cancelar de manera autónoma. | 100% de reservas disponen de un localizador alfanumérico único para consulta y cancelación. |
| **OC-04** | **Visibilidad de Disponibilidad en Tiempo Real:** Proveer al cliente una grilla visual clara con los bloques libres y ocupados para cada fecha y tipo de cancha. | Reducción del 90% en consultas telefónicas y por WhatsApp al administrador. |
| **OC-05** | **Previsibilidad Operativa:** Asegurar que los turnos respeten estrictamente los rangos operativos (08:00 a 23:00) y bloques estándar (60 min). | 100% de las reservas se alinean a slots canónicos del centro deportivo. |

---

## 4. Preguntas y Afirmaciones de Exploración de Valor

### Preguntas al Cliente / Usuario:
1. *¿Qué pasa si dos personas intentan reservar la cancha para las 20:00 al mismo tiempo?*  
   **Respuesta ODD:** El sistema debe manejar concurrencia. La primera solicitud que confirme la transacción bloquea el slot; la segunda recibe un mensaje claro de no disponibilidad sin degradar el sistema.
2. *¿Es necesario recordar un usuario y contraseña para jugar un partido semanal?*  
   **Respuesta ODD:** No. El identificador de la reserva (ej. `CY-2026-X89J`) enviado al correo/pantalla es suficiente para consultar o cancelar.
3. *¿Hasta cuándo puede un equipo cancelar si llueve o no completan los jugadores?*  
   **Respuesta ODD:** Debe existir una regla de ventana temporal (ej. hasta 2 horas antes de la hora de inicio). Pasado ese límite, el turno se considera fijo.

### Afirmaciones de Valor (Value Statements):
* *"Para el jugador de fútbol/pádel, el valor reside en saber en 10 segundos si la cancha está libre a las 7:00 PM y apartarla sin llenar formularios innecesarios."*
* *"Para el administrador de la cancha, el valor es que la agenda nunca presente dos partidos asignados en la misma hora, sin importar cuántas reservas ocurran en paralelo."*

---

## 5. Criterio de Transición a Fase 2 (SDD)

Con los outcomes claramente fijados, se procede a la **Fase 2 (SDD - Spec-Driven Development)** para formalizar:
1. Requisitos funcionales y no funcionales estructurados (`requirements.md`).
2. Reglas de negocio deterministas (`business-rules.md`).
3. Criterios de aceptación verificables mediante BDD/Gherkin (`acceptance-criteria.md`).
4. Backlog de implementación para los roles de Arquitectura/Desarrollo y DevOps/QA (`implementation-plan.md`).
