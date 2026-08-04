# 1.5 — Gestión de Usuarios y Autenticación

> **Proyecto — Agenda Inteligente WhatsApp CRM (SaaS)**

El sistema utiliza **Clerk** para la gestión de acceso, garantizando el aislamiento absoluto de los datos mediante una estrategia Multi-Tenant.

---

## Estrategia de Acceso e Inquilinos (Tenants)

1. **Autenticación B2B:** Los dueños de los negocios pueden crear sus cuentas en la plataforma (`Sign Up`). Al registrarse, el sistema genera automáticamente un nuevo registro en la tabla `Negocio` y vincula al nuevo `Usuario` con ese negocio.
2. **Aislamiento de Datos:** El middleware de Next.js intercepta cualquier intento de acceso a rutas protegidas. Una vez dentro de un endpoint de la API, el backend captura el `clerkId` de la sesión actual, busca su `negocioId` en la base de datos, y utiliza ese ID como filtro obligatorio (`WHERE`) para cualquier lectura o escritura.
3. **Excepción de Seguridad:** La única ruta pública es el Webhook (`/api/webhook/whatsapp`), la cual no valida usuarios de Clerk, sino que valida su origen a través del token estático de configuración (Meta API).