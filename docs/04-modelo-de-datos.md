# 1.4 — Modelo de Datos

> **Proyecto — Agenda Inteligente WhatsApp CRM**

El sistema cuenta con una base de datos relacional en PostgreSQL (Neon) gestionada con Prisma. Para soportar clientes recurrentes, la arquitectura separa los datos de la persona de sus solicitudes de trabajo (Relación 1 a N).

### Entidades principales

#### Tabla `Cliente` (Datos estáticos)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK) | Identificador interno único del cliente |
| nombre | TEXT | Nombre extraído por la IA |
| telefono | TEXT (UNIQUE) | Número de WhatsApp del cliente. Actúa como llave principal de búsqueda. |
| direccion | TEXT | Dirección extraída por la IA (opcional) |
| createdAt | DATETIME | Fecha en que el cliente se contactó por primera vez |

#### Tabla `Turno` (Trabajos / Solicitudes)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK) | Identificador único del trabajo a realizar |
| clienteId | UUID (FK) | Relación con la tabla Cliente |
| motivo | TEXT | Razón del trabajo o consulta extraída por la IA |
| estado | ENUM/TEXT | Estados transicionales: `"PENDIENTE"`, `"AGENDADO"`, `"COMPLETADO"`, `"CANCELADO"` |
| fechaTurno | DATETIME | Fecha asignada al arrastrar en el calendario (opcional) |
| createdAt | DATETIME | Fecha en que se registró esta solicitud específica |
| updatedAt | DATETIME | Última fecha de modificación |

---

## Manejo de Inconsistencias y Recurrencia

Cuando el Webhook recibe un mensaje, se evalúa si el `telefono` ya existe en la tabla `Cliente`:

1. **Cliente Nuevo:** Se crea el registro en `Cliente` y se crea un nuevo `Turno` en estado "PENDIENTE".
2. **Cliente Existente con Turno Activo:** Si el cliente ya existe y tiene un `Turno` con estado "PENDIENTE" o "AGENDADO" (es decir, la fecha aún no pasó o el trabajo no se marcó como completado), el sistema **actualiza** el `motivo` de ese turno activo, concatenando la nueva información.
3. **Cliente Existente con Turno Vencido:** Si el cliente ya existe, pero todos sus turnos anteriores están "COMPLETADOS", "CANCELADOS" o su `fechaTurno` ya pasó, el sistema **crea un nuevo registro** en la tabla `Turno` asociado a ese mismo cliente.