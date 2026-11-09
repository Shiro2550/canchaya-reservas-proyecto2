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
      desde "18:00" hasta "19:00" con cliente "Carlos Méndez"
    Entonces el sistema debe rechazar la creación de la reserva
    Y debe responder con un código de estado 409 Conflicto
    Y el cuerpo de la respuesta debe indicar "La cancha solicitada no está disponible en el horario seleccionado"
    Y no debe registrarse ninguna nueva reserva en la base de datos.

  Escenario: Intento de reserva con solapamiento parcial al inicio
    Cuando un cliente intenta reservar la cancha "C1" para la fecha "2026-11-20"
      desde "17:30" hasta "18:30"
    Entonces el sistema debe rechazar la creación de la reserva
    Y debe retornar código 409 Conflicto.

  Escenario: Intento de reserva con solapamiento parcial al final
    Cuando un cliente intenta reservar la cancha "C1" para la fecha "2026-11-20"
      desde "18:30" hasta "19:30"
    Entonces el sistema debe rechazar la creación de la reserva
    Y debe retornar código 409 Conflicto.

  Escenario: Reserva exitosa en horario contiguo inmediato (Sin solapamiento)
    Cuando un cliente solicita reservar la cancha "C1" para la fecha "2026-11-20"
      desde "19:00" hasta "20:00" con datos válidos
    Entonces el sistema debe autorizar la creación de la reserva
    Y debe responder con código 201 Creado
    Y el estado de la reserva debe ser "CONFIRMADA"
    Y debe retornar un código identificador único de reserva "booking_id".

  Escenario: Reserva en cancha diferente en el mismo horario
    Dado que existe otra cancha "Cancha 2 - Pádel" con ID "C2"
    Cuando un cliente intenta reservar la cancha "C2" para la fecha "2026-11-20"
      desde "18:00" hasta "19:00"
    Entonces el sistema debe autorizar la creación de la reserva
    Y debe retornar código 201 Creado.

  Escenario: Reserva en horario que pertenecía a una reserva previamente cancelada
    Dado que la reserva "CY-EXISTENTE-01" en la cancha "C1" para las "18:00" a "19:00" fue "CANCELADA"
    Cuando un nuevo cliente solicita reservar la cancha "C1" para esa misma fecha de "18:00" a "19:00"
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
    Dado que la cancha "Cancha 1" está libre el día "2026-11-25" de "10:00" a "11:00"
    Cuando envío una solicitud de reserva con los datos:
      | Campo            | Valor                       |
      | court_id         | C1                          |
      | date             | 2026-11-25                  |
      | start_time       | 10:00                       |
      | end_time         | 11:00                       |
      | customer_name    | Juan Pérez                  |
      | customer_email   | juan.perez@example.com      |
      | customer_phone   | +507 6123-4567              |
    Entonces la respuesta debe tener código 201
    Y la respuesta debe contener un campo "booking_id" de formato alfanumérico no vacío
    Y el estado de la reserva debe ser "CONFIRMADA".

  Escenario: Rechazo de reserva con correo electrónico inválido
    Cuando intento registrar una reserva con el correo "correo-invalido-sin-arroba"
    Entonces el sistema debe rechazar la solicitud con código 422 o 400
    Y debe informar el error específico en la validación del correo.

  Escenario: Rechazo de reserva fuera del horario operativo (BR-02)
    Cuando intento reservar una cancha para las "06:00" a "07:00" (antes de la apertura 08:00)
    O cuando intento reservar para las "23:00" a "00:00" (después del cierre)
    Entonces el sistema debe responder con código 400 Solicitud Incorrecta
    Y el mensaje debe indicar "El horario solicitado se encuentra fuera del rango operativo (08:00 - 23:00)".

  Escenario: Rechazo de reserva en el pasado
    Cuando intento reservar una cancha con una fecha y hora anterior a la hora actual del servidor
    Entonces el sistema debe responder con código 400
    Y debe rechazar la transacción indicando "No se pueden agendar reservas en fechas pasadas".
```

---

## Característica 3: Consulta y Cancelación de Reserva Mediante Código Único (BR-04 y BR-05)

```gherkin
Característica: Autogestión de reserva por código identificador
  Como cliente que posee un código de reserva
  Quiero consultar los detalles o cancelar mi turno
  Para gestionar mi horario sin depender de una llamada telefónica.

  Escenario: Consulta exitosa de reserva por código
    Dado que existe una reserva confirmada con código "CY-2026-W981"
    Cuando solicito la consulta del turno con el código "CY-2026-W981"
    Entonces el sistema debe retornar código 200 OK
    Y debe mostrar la cancha asignada, fecha, hora de inicio, hora de fin y estado "CONFIRMADA".

  Escenario: Consulta con código de reserva inexistente
    Cuando solicito la consulta de un código "CY-INEXISTENTE-99"
    Entonces el sistema debe responder con código 404 No Encontrado
    Y el mensaje debe indicar "No se encontró ninguna reserva asociada al código provisto".

  Escenario: Cancelación a tiempo (Mayor o igual a 2 horas de anticipación)
    Dado que la hora actual es "14:00" del día "2026-11-20"
    Y existe una reserva activa "CY-2026-T100" para las "18:00" del mismo día (4 horas de anticipación)
    Cuando el cliente solicita cancelar la reserva "CY-2026-T100"
    Entonces el sistema debe responder con código 200 OK
    Y el estado de la reserva debe cambiar a "CANCELADA"
    Y el slot de las "18:00" debe quedar disponible inmediatamente para otros usuarios.

  Escenario: Rechazo de cancelación fuera de plazo (Menor a 2 horas de anticipación)
    Dado que la hora actual es "17:15" del día "2026-11-20"
    Y existe una reserva activa "CY-2026-T200" para las "18:00" del mismo día (45 minutos de anticipación)
    Cuando el cliente solicita cancelar la reserva "CY-2026-T200"
    Entonces el sistema debe rechazar la cancelación con código 422 o 400
    Y el mensaje debe indicar "No es posible cancelar la reserva: el plazo límite es de 2 horas previas al inicio del turno"
    Y la reserva debe permanecer en estado "CONFIRMADA".
```

---

## 4. Guía para el Estudiante 3 (QA / DevOps Lead)

* **Prueba Primordial de Evaluación:** El archivo `tests/test_conflict_booking.py` (o equivalente según lenguaje) debe implementar como mínimo las aserciones de la **Característica 1**.
* **Prueba de Cancelación y Restricción de 2 horas:** Debe implementarse con mocks de tiempo en `tests/test_cancellation.py`.
* **Automatización en CI:** Estos escenarios deben ser ejecutados en verde en el pipeline de GitHub Actions o suite de pruebas automatizadas.
