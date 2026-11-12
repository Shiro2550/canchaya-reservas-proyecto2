# Criterios de Aceptación (SDD — Acceptance Criteria)

**Proyecto:** Sistema de Reservas Especializado de Canchas Deportivas (`CanchaYa`)  
**Curso:** Tópicos Especiales II — Prof. Regis Rivera  
**Rol Responsable:** Estudiante 1 — Product / Spec Lead (Ivan Wu)  
**Destinatarios:** Estudiante 2 (Dev Lead) y Estudiante 3 (QA / DevOps Lead)  
**Formato:** BDD / Gherkin (Given-When-Then)  
**Versión:** 1.0.0  

---

## Característica 1: Prevención Obligatoria de Doble Reserva (Regla Crítica BR-01)

```gherkin
Característica: Prevención de doble reserva y solapamiento de horarios
  Como sistema de gestión de canchas deportivas
  Quiero rechazar cualquier solicitud que coincida total o parcialmente con una reserva activa
  Para garantizar que nunca se solapen dos partidos en la misma cancha física.

  Antecedentes:
    Dado que existe la cancha "Cancha 1 - Fútbol 7" con ID "C1"
    Y la cancha "C1" ya tiene una reserva confirmada con ID "CY-EXISTENTE-01" 
      para la fecha "2026-11-20" en el intervalo de "18:00" a "19:00"

  Escenario: Intento de reserva en el mismo horario exacto (Solapamiento Total)
    Cuando un cliente intenta reservar la cancha "C1" para la fecha "2026-11-20"
      a las "18:00" con cliente "Carlos Méndez"
    Entonces el sistema debe rechazar la creación de la reserva
    Y debe responder con un código de estado 409 Conflicto
    Y el cuerpo de la respuesta debe indicar "La cancha solicitada no está disponible en el horario seleccionado"
    Y no debe registrarse ninguna nueva reserva en la base de datos.

  Escenario: Intento de reserva con hora no exacta (Violación de modularidad BR-02)
    Cuando un cliente intenta enviar una solicitud para la cancha "C1" para la fecha "2026-11-20"
      con hora de inicio "17:30"
    Entonces el sistema debe rechazar la solicitud en la fase de validación horaria
    Y debe retornar código 400 Solicitud Incorrecta
    Y el mensaje debe indicar "El inicio del turno debe coincidir con una hora exacta (en punto)".

  # Nota de trazabilidad con BR-01:
  # Los 5 casos teóricos de solapamiento de la regla matemática BR-01 (total, interno, envolvente,
  # por inicio y por fin) se verifican exhaustivamente a nivel de dominio mediante pruebas unitarias
  # en tests/unit/collision.test.ts. En la API REST pública, las solicitudes con minutos fraccionados
  # se rechazan previamente con HTTP 400 según el pipeline de validación.

  Escenario: Reserva exitosa en horario contiguo inmediato (Sin solapamiento)
    Cuando un cliente solicita reservar la cancha "C1" para la fecha "2026-11-20"
      a las "19:00" con datos válidos
    Entonces el sistema debe autorizar la creación de la reserva
    Y debe responder con código 201 Creado
    Y el estado de la reserva debe ser "CONFIRMADA"
    Y la respuesta debe incluir "end_time" igual a "20:00"
    Y debe retornar un código identificador único de reserva "booking_id" de 8 caracteres con prefijo "CY-".

  Escenario: Reserva en cancha diferente en el mismo horario
    Dado que existe otra cancha "Cancha 2 - Pádel" con ID "C2"
    Cuando un cliente intenta reservar la cancha "C2" para la fecha "2026-11-20"
      a las "18:00"
    Entonces el sistema debe autorizar la creación de la reserva
    Y debe retornar código 201 Creado.

  Escenario: Reserva en horario que pertenecía a una reserva previamente cancelada
    Dado que la reserva "CY-EXISTENTE-01" en la cancha "C1" para las "18:00" fue "CANCELADA"
    Cuando un nuevo cliente solicita reservar la cancha "C1" para esa misma fecha a las "18:00"
    Entonces el sistema debe permitir la reserva exitosamente
    Y debe retornar código 201 Creado.
```

---

## Característica 2: Creación de Reserva Sin Cuenta y Generación de ID Único (BR-02 y BR-03)

```gherkin
Característica: Registro de reserva sin fricción de login
  Como jugador de deportes recreativos
  Quiero reservar una cancha ingresando únicamente mis datos de contacto
  Para completar mi reserva en menos de un minuto sin crear contraseñas.

  Escenario: Creación de reserva con datos de contacto válidos
    Dado que la cancha "C1" está libre el día "2026-11-25" a las "10:00"
    Cuando envío una solicitud de reserva con los datos:
      | Campo            | Valor                       |
      | court_id         | C1                          |
      | date             | 2026-11-25                  |
      | start_time       | 10:00                       |
      | customer_name    | Juan Pérez                  |
      | customer_email   | juan.perez@example.com      |
      | customer_phone   | +507 6123-4567              |
    Entonces la respuesta debe tener código 201 Creado
    Y la respuesta debe contener un campo "booking_id" que inicie con "CY-" y contenga 8 caracteres criptográficos
    Y la respuesta debe incluir "end_time" calculado automáticamente como "11:00"
    Y el estado de la reserva debe ser "CONFIRMADA".

  Escenario: Rechazo de reserva con correo electrónico inválido
    Cuando intento registrar una reserva con el correo "correo-invalido-sin-arroba"
    Entonces el sistema debe rechazar la solicitud con código 422 Entidad No Procesable
    Y debe informar el error específico en la validación del correo.

  Escenario: Rechazo de reserva con teléfono inválido (menos de 7 dígitos)
    Cuando intento registrar una reserva con el teléfono "12345"
    Entonces el sistema debe rechazar la solicitud con código 422 Entidad No Procesable
    Y debe informar que el teléfono debe contener entre 7 y 15 dígitos numéricos.

  Escenario: Rechazo de reserva fuera del horario operativo (BR-02)
    Cuando intento reservar una cancha para las "06:00" (antes de la apertura 08:00)
    O cuando intento reservar para las "23:00" (igual o posterior al cierre operativo)
    Entonces el sistema debe responder con código 400 Solicitud Incorrecta
    Y el mensaje debe indicar "El horario solicitado se encuentra fuera del rango operativo (08:00 - 23:00)".

  Escenario: Rechazo de reserva en el pasado (Hora local de Panamá)
    Cuando intento reservar una cancha con una fecha y hora anterior a la hora actual en zona America/Panama
    Entonces el sistema debe responder con código 400 Solicitud Incorrecta
    Y debe rechazar la transacción indicando "No se pueden agendar reservas en fechas u horas pasadas.".

  Escenario: Rechazo de reserva que excede el límite de 30 días de anticipación (BR-02)
    Dado que la fecha actual es "2026-11-20"
    Cuando intento reservar una cancha para la fecha "2026-12-22" (a 32 días de anticipación)
    Entonces el sistema debe responder con código 400 Solicitud Incorrecta
    Y el mensaje debe indicar "No se pueden realizar reservas con más de 30 días de anticipación.".

  Escenario: Reserva exitosa en el límite exacto de 30 días de anticipación (BR-02)
    Dado que la fecha actual es "2026-11-20"
    Cuando intento reservar una cancha para la fecha "2026-12-20" (a exactamente 30 días de anticipación) a las "10:00" con datos válidos
    Entonces el sistema debe autorizar la creación de la reserva
    Y debe responder con código 201 Creado
    Y el estado de la reserva debe ser "CONFIRMADA".
```

---

## Característica 3: Consulta y Cancelación de Reserva Mediante Código Único (BR-04 y BR-05)

```gherkin
Característica: Autogestión de reserva por código identificador
  Como cliente que posee un código de reserva
  Quiero consultar los detalles o cancelar mi turno
  Para gestionar mi horario sin depender de una llamada telefónica.

  Escenario: Consulta exitosa de reserva por código
    Dado que existe una reserva confirmada con código "CY-7K3M9QXA"
    Cuando solicito la consulta del turno con el código "CY-7K3M9QXA"
    Entonces el sistema debe retornar código 200 OK
    Y debe mostrar la cancha asignada, fecha, hora de inicio, hora de fin y estado "CONFIRMADA".

  Escenario: Consulta con código de reserva inexistente
    Cuando solicito la consulta de un código "CY-INEXISTENTE-99"
    Entonces el sistema debe responder con código 404 No Encontrado
    Y el mensaje debe indicar "No se encontró ninguna reserva asociada al código provisto".

  Escenario: Cancelación a tiempo (Mayor o igual a 2 horas de anticipación)
    Dado que la hora actual es "14:00" del día "2026-11-20" en zona America/Panama
    Y existe una reserva activa "CY-8M2K1L90" para las "18:00" del mismo día (4 horas de anticipación)
    Cuando el cliente solicita cancelar la reserva "CY-8M2K1L90"
    Entonces el sistema debe responder con código 200 OK
    Y el estado de la reserva debe cambiar a "CANCELADA"
    Y el slot de las "18:00" debe quedar disponible inmediatamente para otros usuarios.

  Escenario: Rechazo de cancelación fuera de plazo (Menor a 2 horas de anticipación)
    Dado que la hora actual es "17:15" del día "2026-11-20" en zona America/Panama
    Y existe una reserva activa "CY-9N4P2Q81" para las "18:00" del mismo día (45 minutos de anticipación)
    Cuando el cliente solicita cancelar la reserva "CY-9N4P2Q81"
    Entonces el sistema debe rechazar la cancelación con código 400 Solicitud Incorrecta
    Y el mensaje debe indicar "No es posible cancelar la reserva: el plazo límite es de 2 horas previas al inicio del turno."
    Y la reserva debe permanecer en estado "CONFIRMADA".
```

---

## 4. Guía para el Estudiante 3 (QA / DevOps Lead)

* **Convención de Nombres y Stack de Testing:** Siguiendo la arquitectura TypeScript (Vitest + Supertest), la suite se organizará en:
  * **Prueba Primordial de Anticolisión (OBLIGATORIA):** `tests/integration/conflict.test.ts` implementa las aserciones de concurrencia y conflicto (Característica 1).
  * **Prueba de Dominio Matemático BR-01:** `tests/unit/collision.test.ts` valida los 5 casos teóricos de solapamiento del algoritmo anticolisión.
  * **Prueba de Cancelación y Ventana de 2 horas:** `tests/integration/cancellation.test.ts` valida con mocks de reloj la regla BR-05 (Característica 3).
  * **Prueba de Reglas de Negocio y Validación:** `tests/integration/booking-rules.test.ts` valida horarios operativos, anticipación de 30 días, fechas pasadas y validaciones de formato (Característica 2).
* **Automatización en CI:** Todos los tests deben ejecutarse en verde en el flujo de GitHub Actions.
