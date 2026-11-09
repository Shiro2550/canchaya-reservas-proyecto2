# Especificación de Requisitos (SDD — Requirements)

**Proyecto:** Sistema de Reservas Especializado de Canchas Deportivas (`CanchaYa`)  
**Curso:** Tópicos Especiales II — Prof. Regis Rivera  
**Rol Responsable:** Estudiante 1 — Product / Spec Lead (Ivan Wu)  
**Versión:** 1.0.0  
**Fecha:** Noviembre 2026  

---

## 1. Visión del Producto

`CanchaYa` es una plataforma web ligera y especializada para la gestión y reserva de turnos en complejos deportivos (canchas de fútbol sintético, pádel, tenis y básquetbol). Está diseñada con enfoque de **cero fricción**: no exige creación previa de cuenta ni login, gestionando todo el ciclo de vida del turno a través de un **Código Único de Reserva** (`booking_id`).

---

## 2. Actores del Sistema (User Personas)

1. **Cliente / Jugador (Sin Cuenta):**
   * Usuario que desea consultar disponibilidad en una fecha determinada y apartar una cancha introduciendo únicamente sus datos de contacto (Nombre completo, Teléfono, Correo electrónico).
   * Puede consultar y cancelar su reserva mediante su `booking_id`.
2. **Administrador / Operador del Complejo:**
   * Responsable de supervisar la grilla de reservas, verificar los turnos del día y dar de alta/bloquear canchas por mantenimiento.

---

## 3. Historias de Usuario (User Stories)

### US-01: Consulta de Canchas y Disponibilidad de Horarios
* **Como** cliente interesado en organizar un partido deportivo,
* **Quiero** seleccionar una cancha, un deporte y una fecha en el calendario,
* **Para** visualizar los bloques de horarios disponibles y los que ya se encuentran reservados sin tener que iniciar sesión.

### US-02: Creación de Reserva Sin Cuenta
* **Como** cliente que encontró un horario disponible,
* **Quiero** ingresar mi nombre, teléfono y correo electrónico para confirmar la reserva,
* **Para** apartar el espacio de forma inmediata y obtener mi comprobante con un código identificador único.

### US-03: Rechazo de Reserva en Conflicto (Anticolisión)
* **Como** usuario del sistema,
* **Quiero** que el sistema impida reservar un horario que ya fue tomado por otro usuario,
* **Para** garantizar que nunca existan dos partidos agendados en la misma cancha en el mismo horario.

### US-04: Consulta de Estado de Reserva mediante Código Único
* **Como** cliente que ya reservó previamente,
* **Quiero** ingresar mi código identificador de reserva (`booking_id`),
* **Para** consultar los detalles de mi turno (cancha, fecha, hora, estado: Pendiente/Confirmada/Cancelada).

### US-05: Cancelación de Reserva por el Cliente
* **Como** cliente que no podrá asistir a su turno,
* **Quiero** cancelar mi reserva usando mi código identificador con al menos 2 horas de anticipación,
* **Para** liberar la cancha y permitir que otro equipo pueda aprovechar el horario.

### US-06: Visualización de Agenda General (Administrador)
* **Como** operador del complejo deportivo,
* **Quiero** listar todas las reservas activas y filtradas por fecha o cancha,
* **Para** organizar el acceso al complejo y coordinar el encendido de reflectores y mantenimiento.

---

## 4. Requisitos Funcionales (RF)

| ID | Módulo | Requisito Funcional | Prioridad |
| :--- | :--- | :--- | :--- |
| **RF-01** | Catálogo | El sistema debe listar las canchas deportivas activas, indicando nombre, tipo de deporte (Fútbol 7, Pádel, Tenis), tarifa por hora y estado operativo. | Alta (Must) |
| **RF-02** | Disponibilidad | El sistema debe calcular y presentar los slots horarios de 60 minutos (dentro del rango 08:00 a 23:00) para una fecha y cancha seleccionada, distinguiendo entre `DISPONIBLE` y `OCUPADO`. | Alta (Must) |
| **RF-03** | Registro de Reserva | El sistema debe permitir registrar una reserva recibiendo: ID de cancha, fecha, hora de inicio, nombre del cliente, teléfono y email de contacto. No se solicitará contraseña ni autenticación previa. | Alta (Must) |
| **RF-04** | Generación de ID Único | Tras crear exitosamente la reserva, el sistema debe generar y retornar un identificador alfanumérico único no predecible (ej. formato `CY-2026-XXXX` o UUID truncado de 8 caracteres alfanuméricos). | Alta (Must) |
| **RF-05** | Prevención de Doble Reserva | El sistema debe validar que no exista una reserva con estado `CONFIRMADA` o `ACTIVA` para la misma cancha en el mismo intervalo de tiempo. Si hay conflicto, debe rechazar la transacción con código de error `409 Conflict`. | Crítica (Must) |
| **RF-06** | Consulta por Código | El sistema debe proveer una función/endpoint para consultar una reserva específica mediante su `booking_id`, devolviendo todos los datos del turno. | Alta (Must) |
| **RF-07** | Cancelación Autónoma | El sistema debe permitir cambiar el estado de la reserva a `CANCELADA` si la solicitud ocurre con al menos 2 horas de anticipación respecto a la hora de inicio pactada. | Media (Should) |
| **RF-08** | Control de Estados | Cada reserva debe transicionar entre los estados canónicos: `CONFIRMADA` $\rightarrow$ `CANCELADA` o `FINALIZADA`. | Alta (Must) |

---

## 5. Requisitos No Funcionales (RNF)

| ID | Categoría | Requisito No Funcional |
| :--- | :--- | :--- |
| **RNF-01** | **Concurrencia e Integridad Transaccional** | El motor de base de datos y la capa de servicios deben garantizar aislamiento de transacciones (o bloqueo optimista/pesimista) para que dos solicitudes concurrentes para el mismo slot no resulten en doble inserción. |
| **RNF-02** | **Simplicidad de Arquitectura** | La persistencia debe resolverse con una base de datos relacional ligera (ej. SQLite / PostgreSQL) sin dependencias pesadas ni servidores externos complejos, facilitando despliegue local o en contenedor. |
| **RNF-03** | **Tiempo de Respuesta** | La consulta de disponibilidad y la creación de reserva deben ejecutarse en menos de 200 milisegundos en condiciones normales de red. |
| **RNF-04** | **Compatibilidad y Portabilidad** | El sistema debe ser desacoplado; backend API RESTful y frontend web responsivo apto para navegadores móviles y desktop. |
| **RNF-05** | **Testabilidad (Testability)** | Toda la lógica de negocio y validación de colisiones debe ser testeable de manera automatizada mediante pruebas unitarias y de integración sin necesidad de interfaz gráfica. |
| **RNF-06** | **Trazabilidad de Registro** | Toda operación de reserva o cancelación debe generar un registro de log de auditoría con timestamp UTC. |

---

## 6. Trazabilidad con el Documento del Proyecto

* **Cumplimiento ODD $\rightarrow$ SDD:** Los RF-01 al RF-05 dan soporte directo a los outcomes fijados en `specs/outcomes.md`.
* **Entrega al Dev Lead (David):** Este documento define el contrato de funcionalidades que guiarán `specs/architecture.md`, `specs/data-model.md` y `specs/api.md`.
