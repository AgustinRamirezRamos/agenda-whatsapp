# 1.4 — Modelo de Datos

> **Proyecto — Agenda Inteligente WhatsApp CRM (SaaS)**

El sistema cuenta con una base de datos relacional en PostgreSQL (Neon) gestionada con Prisma. Para soportar múltiples negocios sin cruzar información (Multi-Tenant), la arquitectura aísla los datos asegurando que todas las entidades orbiten alrededor de un `Negocio` específico. 

### Entidades principales

#### Tabla `Negocio` (Inquilino / Empresa)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK) | Identificador interno único del negocio |
| nombre | TEXT | Nombre del local o empresa |
| telefonoOficial | TEXT (UNIQUE) | Número de WhatsApp del local. Clave para enrutar los mensajes entrantes del Webhook. |
| creadoEn | DATETIME | Fecha de registro en la plataforma |

#### Tabla `Usuario` (Administradores)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK) | Identificador interno único del usuario |
| clerkId | TEXT (UNIQUE) | Vinculación con el sistema de autenticación de Clerk |
| nombre | TEXT | Nombre del administrador |
| email | TEXT (UNIQUE) | Correo electrónico de contacto |
| negocioId | UUID (FK) | Relación obligatoria con el `Negocio` que administra |

#### Tabla `Cliente` (Datos estáticos)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK) | Identificador interno único del cliente |
| telefono | TEXT | Número de WhatsApp del cliente |
| nombre | TEXT | Nombre extraído por la IA (opcional) |
| negocioId | UUID (FK) | Relación con el negocio con el que se contactó |

> **Nota importante:** La combinación de `telefono` y `negocioId` es `UNIQUE`[cite: 1]. Esto significa que un mismo número de celular puede existir como cliente de la Peluquería y de la Ferretería de forma independiente en la base de datos[cite: 1].

#### Tabla `Turno` (Trabajos / Solicitudes)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID (PK) | Identificador único del trabajo a realizar |
| fechaHora | DATETIME | Fecha asignada al arrastrar en el calendario |
| estado | ENUM/TEXT | Estados transicionales: `"PENDIENTE"`, `"AGENDADO"`, `"COMPLETADO"`, `"CANCELADO"` |
| clienteId | UUID (FK) | Relación con la tabla `Cliente` |
| negocioId | UUID (FK) | Relación directa con el `Negocio` (facilita el filtrado rápido) |

---

## Manejo de Inconsistencias y Recurrencia

Cuando el Webhook recibe un mensaje, primero busca el `Negocio` usando el teléfono de destino (`metadata.display_phone_number`). Luego evalúa el `telefono` del remitente (el cliente):

1. **Cliente Nuevo:** Se crea el registro en `Cliente` asociado al `negocioId` y se crea un nuevo `Turno` en estado "PENDIENTE".
2. **Cliente Existente con Turno Activo:** Si el cliente ya existe para ese `negocioId` y tiene un `Turno` con estado "PENDIENTE" o "AGENDADO" (es decir, la fecha aún no pasó o el trabajo no se marcó como completado), el sistema **actualiza** los detalles de ese turno activo, concatenando la nueva información.
3. **Cliente Existente con Turno Finalizado:** Si el cliente ya existe en ese negocio, pero todos sus turnos anteriores están "COMPLETADOS" o "CANCELADOS", el sistema **crea un nuevo registro** en la tabla `Turno` asociado a ese mismo cliente y negocio.