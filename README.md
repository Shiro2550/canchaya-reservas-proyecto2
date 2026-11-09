# CanchaYa — Sistema Especializado de Reserva de Canchas Deportivas

> **Proyecto #2 — Desarrollo Orientado por Especificaciones y Resultados (ODD / SDD)**  
> **Cátedra:** Tópicos Especiales II  
> **Profesor:** Regis Rivera  
> **Universidad Tecnológica de Panamá (UTP)** — 2026  

---

## 1. Visión General del Proyecto

`CanchaYa` es una solución especializada para la gestión y reserva de turnos en complejos deportivos (fútbol sintético, pádel, tenis, básquet). Se desarrolló aplicando el marco de trabajo:

$$\text{ODD (Outcomes)} \longrightarrow \text{SDD (Specs)} \longrightarrow \text{Código} \longrightarrow \text{Pruebas} \longrightarrow \text{Valor al Usuario}$$

### Principio Clave de Producto: **Zero-Auth Guest Booking**
Para maximizar la conversión y reducir fricción:
* **Sin Registro de Cuentas:** El usuario no requiere crear un perfil ni recordar contraseñas.
* **Identificador Único (`booking_id`):** Al reservar con sus datos básicos de contacto, el sistema genera un código alfanumérico único para consultar, verificar y cancelar el turno.
* **Garantía Absoluta de Cero Doble Reserva:** Motor de validación temporal estricto para evitar solapamientos entre turnos.

---

## 2. Roles del Equipo de Desarrollo

| Rol | Integrante | Responsabilidad Principal |
| :--- | :--- | :--- |
| **Estudiante 1 — Product / Spec Lead** | **Ivan Wu** | Requisitos, ODD, SDD, Reglas de Negocio, Criterios de Aceptación, Backlog y Gestión de Cambios. |
| **Estudiante 2 — Architecture / Dev Lead** | **David** | Arquitectura del software, Modelo de Datos, Contrato API e Implementación en `src/`. |
| **Estudiante 3 — QA / DevOps Lead** | *(Compañero 3)* | Estrategia de testing, pruebas automatizadas en `tests/`, verificación de doble reserva y CI/CD. |

---

## 3. Estructura del Repositorio

El proyecto cumple estrictamente con la estructura solicitada en la guía de evaluación:

```text
├── README.md                          # Visión general, roles y guía del proyecto
├── .gitignore                         # Archivos ignorados por Git
├── .specify/                          # Andamiaje y plantillas oficiales de GitHub Spec-Kit
│
├── specs/                             # Especificaciones (SDD y ODD)
│   ├── outcomes.md                    # Fase 1 ODD: Problemas, resultados esperados y valor
│   ├── requirements.md                # Historias de usuario, requisitos funcionales y no funcionales
│   ├── business-rules.md              # Reglas de negocio críticas (Anticolisión BR-01, horarios, etc.)
│   ├── architecture.md                # Decisiones arquitectónicas y stack técnico (Estudiante 2)
│   ├── data-model.md                  # Modelo entidad-relación y tablas (Estudiante 2)
│   ├── api.md                         # Contrato de endpoints REST (Estudiante 2)
│   ├── acceptance-criteria.md         # Criterios de aceptación en sintaxis Gherkin (BDD)
│   └── implementation-plan.md         # Plan de tareas, backlog e hitos de entrega
│
├── docs/                              # Gobernanza y auditoría
│   ├── ai-log.md                      # Bitácora obligatoria de uso de Inteligencia Artificial
│   ├── decisions.md                   # Registro de decisiones de producto y arquitectura (ADRs)
│   └── testing.md                     # Plan y estrategia de testing automatizado (Estudiante 3)
│
├── src/                               # Código fuente de la aplicación (Estudiante 2)
│   └── .gitkeep
│
└── tests/                             # Suites de pruebas automatizadas (Estudiante 3)
    └── .gitkeep
```

---

## 4. Metodología de Desarrollo: ODD y SDD con Spec-Kit

1. **Fase 1 — ODD (`specs/outcomes.md`):** Identificación de fricciones en el cliente y definición de resultados cuantitativos de valor antes de considerar cualquier línea de código.
2. **Fase 2 — SDD (`specs/`):** Modelado formal y exhaustivo de requerimientos, reglas matemáticas de concurrencia y criterios de aceptación en formato BDD/Gherkin.
3. **Herramienta Spec-Kit:** Se inicializó el andamiaje del proyecto utilizando la CLI oficial de Spec-Kit (`specify-cli`) apalancada por `uv`:
   ```bash
   uvx --from specify-cli specify check
   ```

---

## 5. Simulación de Cambio Inesperado de Requerimiento (Trazabilidad)

Para cumplir con la sección 13 de la rúbrica del proyecto (*"Introducir un cambio inesperado a mitad de desarrollo y mostrar evidencia de su ciclo completo"*), el equipo tiene formalizado el flujo trazable:
1. **Cambio Solicitado:** Introducción de un *Margen de Mantenimiento / Buffer Obligatorio de 15 minutos entre turnos*.
2. **Ciclo de Trazabilidad:**
   * Actualización de `specs/business-rules.md` (Product Lead).
   * Actualización de `specs/acceptance-criteria.md` (Product Lead).
   * Actualización de `specs/implementation-plan.md` (Product Lead).
   * Modificación de lógica en `src/` (Dev Lead).
   * Modificación de aserciones en `tests/` (QA Lead).
   * Verificación de resultados en verde.

---

## 6. Próximos Pasos (Paso de Testigo a Estudiante 2 y 3)

* **Estudiante 2 (David):**
  1. Revisar `specs/requirements.md` y `specs/business-rules.md`.
  2. Completar `specs/architecture.md`, `specs/data-model.md` y `specs/api.md`.
  3. Implementar el backend y frontend en `src/`.
* **Estudiante 3 (QA):**
  1. Diseñar el plan en `docs/testing.md`.
  2. Implementar la prueba prioritaria de anticolisión en `tests/test_conflict.py`.
