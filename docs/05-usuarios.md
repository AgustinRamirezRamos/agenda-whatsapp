# 1.5 — Gestión de Usuarios y Autenticación

> **Proyecto — Agenda Inteligente WhatsApp CRM**

El sistema utiliza **Clerk** para la gestión de acceso, garantizando que los datos de los clientes estén completamente restringidos al dueño del negocio.

---

## Estrategia de Acceso

1. **Plataforma Privada:** El registro libre (`Sign Up`) estará desactivado desde el panel de Clerk para evitar que personas externas creen cuentas.
2. **Cuenta Única:** El acceso estará configurado exclusivamente para la casilla de correo o el número de teléfono del Administrador (Dueño).
3. **Protección de Rutas:** El middleware de Next.js interceptará cualquier intento de acceso a `/dashboard` o a las rutas `/api/clientes/*` que no contenga un token de sesión válido de Clerk.
4. **Excepción de Seguridad:** La única ruta pública y exenta de la validación de Clerk será el Webhook (`/api/webhook/whatsapp`), la cual validará su origen a través de un token estático proporcionado por Meta (WhatsApp API).