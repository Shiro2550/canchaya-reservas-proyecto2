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

## 6. Stack Tecnológico (ADR-008)

| Capa | Tecnología |
| :--- | :--- |
| Lenguaje | TypeScript (backend y frontend) |
| API | Fastify + Zod |
| Base de datos | MySQL 8.4 con Prisma (migraciones y datos semilla) |
| Frontend | React + Vite + Tailwind CSS + shadcn/ui |
| Pruebas | Vitest + Supertest |

Detalle en `specs/architecture.md`, `specs/data-model.md` y `specs/api.md`.

---

## 7. Cómo Ejecutar el Proyecto

Hay dos formas. Si solo quieres **probar la aplicación**, usa la opción A: no necesitas instalar Node ni MySQL.

| | Opción A — Todo con Docker | Opción B — Desarrollo con npm |
| :--- | :--- | :--- |
| Para qué | Probar la app completa (QA, profesor, compañeros) | Programar y ejecutar las pruebas |
| Necesitas | Git + Docker | Git + Node.js 24 o superior + MySQL 8.4 (instalado o con Docker) |
| Dirección | http://localhost:8080 | http://localhost:5173 |

### Opción A — Todo con Docker (recomendada para probar)

**Requisitos:** [Git](https://git-scm.com/) y Docker con Compose v2 (en Windows y macOS: *Docker Desktop* abierto; en Linux: *Docker Engine*). Comprueba con `docker compose version`.

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/Shiro2550/canchaya-reservas-proyecto2.git
   cd canchaya-reservas-proyecto2
   ```
2. **Construye y levanta los contenedores** (la primera vez descarga las imágenes de MySQL y Node y tarda unos minutos):
   ```bash
   docker compose up -d --build
   ```
3. **Espera a que ambos digan `healthy`:**
   ```bash
   docker compose ps
   ```
   Al arrancar, la app aplica sola las migraciones y carga las canchas C1–C4.
4. **Abre la aplicación:**
   * Web: **http://localhost:8080**
   * Documentación interactiva de la API: **http://localhost:8080/docs**

**Comandos útiles:**

| Comando | Qué hace |
| :--- | :--- |
| `docker compose logs -f app` | Ver los registros de la app (Ctrl+C para salir) |
| `docker compose stop` | Detener sin borrar nada |
| `docker compose up -d` | Volver a encender |
| `docker compose up -d --build` | Reconstruir la imagen después de un `git pull` |
| `docker compose down` | Apagar y quitar los contenedores (las reservas se conservan) |
| `docker compose down -v` | Apagar y **borrar también la base de datos** |

**¿Puerto ocupado?** Si ya tienes MySQL instalado (puerto 3306) o algo usa el 8080, cambia los puertos al levantar (o guárdalos como `MYSQL_PORT` / `APP_PORT` en un archivo `.env`):

```bash
MYSQL_PORT=3307 APP_PORT=8081 docker compose up -d --build
```
En Windows (PowerShell):
```powershell
$env:MYSQL_PORT=3307; $env:APP_PORT=8081; docker compose up -d --build
```

### Opción B — Desarrollo local con npm

**Requisitos:** Git, **Node.js 24 o superior** (trae npm 11; comprueba con `node -v`) y MySQL 8.4.

1. **Clona el repositorio** (igual que en la opción A).
2. **Crea tu archivo de variables** a partir del ejemplo:
   ```bash
   cp .env.example .env
   ```
   En Windows (PowerShell): `Copy-Item .env.example .env`
3. **Prepara MySQL 8.4** (elige una):
   * **Con Docker, solo la base de datos:** `docker compose up -d mysql`. Crea las bases `canchaya`, `canchaya_shadow` y `canchaya_test` y el usuario `canchaya`.
     Si **ya tienes MySQL instalado** (puerto 3306 ocupado), antes edita `.env`: pon `MYSQL_PORT=3307` y cambia `3306` por `3307` en las tres URL. Docker Compose lee ese mismo archivo, así que el puerto queda guardado.
   * **Con MySQL instalado:** entra como root (`mysql -u root -p`) y ejecuta:
     ```sql
     CREATE DATABASE canchaya; CREATE DATABASE canchaya_shadow; CREATE DATABASE canchaya_test;
     CREATE USER 'canchaya'@'localhost' IDENTIFIED BY 'canchaya';
     GRANT ALL PRIVILEGES ON canchaya.* TO 'canchaya'@'localhost';
     GRANT ALL PRIVILEGES ON canchaya_shadow.* TO 'canchaya'@'localhost';
     GRANT ALL PRIVILEGES ON canchaya_test.* TO 'canchaya'@'localhost';
     ```
4. **Instala las dependencias** (también genera el cliente de Prisma):
   ```bash
   npm install
   ```
5. **Crea las tablas y carga las canchas:**
   ```bash
   npm run db:deploy
   npm run db:seed
   ```
6. **Arranca la API y la web** (Ctrl+C para detener):
   ```bash
   npm run dev
   ```
   * Web: **http://localhost:5173**
   * API y documentación: **http://127.0.0.1:3000/docs**
7. **Ejecuta las pruebas automatizadas** (usan la base `canchaya_test`, que se vacía en cada ejecución):
   ```bash
   npm test
   ```

Otros comandos: `npm run typecheck` (verificar tipos), `npm run build` (compilar), `npm run db:reset` (borrar y recrear la base de desarrollo). Más detalle en `specs/architecture.md`, sección 13.

### Recorrido de prueba (2 minutos)

1. En la página de inicio, elige una cancha y pulsa **Ver horarios**.
2. Elige un día y un turno **verde**. En el formulario escribe un correo sin `@` para ver la validación; luego corrígelo y pulsa **Reservar ahora**.
3. Copia el **código `CY-…`** de la confirmación.
4. Ve a **Mi reserva**, pega el código y pulsa **Cancelar reserva**: el turno vuelve a quedar libre.
5. **Doble reserva:** abre la misma cancha y el mismo día en dos pestañas, reserva un turno en la primera e intenta reservarlo en la segunda. Debe aparecer *"Ese turno ya no está disponible"* y el turno pasa a **Ocupado**.
6. Explora la API en `/docs` (*Try it out*).

### Problemas frecuentes

| Síntoma | Solución |
| :--- | :--- |
| `port is already allocated` al levantar Docker | Cambia `MYSQL_PORT` o `APP_PORT` (ver «¿Puerto ocupado?»). |
| `docker compose ps` muestra la app `unhealthy` o reiniciándose | Revisa `docker compose logs app`. Si MySQL todavía estaba arrancando, espera unos segundos: la app se reinicia sola. |
| La web dice "No pudimos cargar las canchas" (opción B) | La API no está corriendo: revisa que `npm run dev` muestre `[api] … Server listening`. |
| `npm test` falla con "No se pudieron aplicar las migraciones" | MySQL está apagado o `TEST_DATABASE_URL` de `.env` apunta a otro puerto o base. |
| Errores de Prisma después de un `git pull` | Ejecuta `npm install` y luego `npm run db:deploy`. |
| Tu `.env` antiguo tiene `PORT` y `HOST` | Renómbralas a `API_PORT` y `API_HOST` (ver `.env.example`). |

---

## 8. Estado y Próximos Pasos

| Milestone | Estado |
| :--- | :--- |
| 1. Corrección de Inconsistencias de Specs | ✅ Completado |
| 2. Arquitectura y Diseño Técnico | ✅ Completado (PR #23 y #24) |
| 3. Implementación Core | ✅ Completado (PR #30, #31, #32 y Docker) |
| 4. Pruebas Automatizadas y CI | 🔄 Siguiente — QA Lead (101 pruebas ya disponibles como base) |
| 5. Cambio de Requerimiento: Buffer 15 min | ⏳ Tras la primera versión funcional — todo el equipo |

**Flujo de trabajo:** cada trabajo se registra como issue en su milestone, se desarrolla en una rama con el número del issue (`feature/<n>-<nombre>`) y se integra con un Pull Request que cierra ese issue. Cada paso con IA se documenta en `docs/ai-log.md`.
