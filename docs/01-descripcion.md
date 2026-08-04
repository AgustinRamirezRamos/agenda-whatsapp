# 1.1 — Descripción del Sistema

> **Proyecto — Agenda Inteligente WhatsApp CRM (SaaS)**

## ¿Qué problema resuelve?
El sistema centraliza y resguarda la información de los clientes que se comunican a través de WhatsApp Business, eliminando la dependencia exclusiva de la aplicación móvil. Funciona como una plataforma Multi-Tenant (SaaS), permitiendo que múltiples negocios gestionen sus agendas de forma aislada. A través de Inteligencia Artificial, automatiza la extracción de datos y permite la gestión visual de turnos, optimizando el tiempo del prestador de servicios.

## Actores del sistema

| Actor | Descripción |
|-------|-------------|
| Administrador (Dueño/Tenant) | Usuario registrado en el sistema que administra un `Negocio`. Visualiza los clientes entrantes de su local, arrastra las tarjetas al calendario para asignar turnos y gestiona el estado de los trabajos. |
| Cliente | Persona externa que se comunica mediante WhatsApp Business. Interactúa indirectamente con el sistema al proveer sus datos básicos a través del chat de un negocio específico. |
| Sistema IA(Gemini) | Actor automatizado encargado de procesar los mensajes crudos entrantes y extraer la información estructurada (nombre, teléfono, dirección, motivo). |

## Alcance y Limitaciones
El enfoque principal de la aplicación es exclusivamente la sincronización, registro y confirmación de agendas mediante procesamiento de lenguaje natural. Por definición de alcance, el diseño de la plataforma excluye cualquier integración, modelo de datos o simulaciones para pasarelas de pago del mundo real (como Mercado Pago o Stripe).

## Flujo principal de uso

1. Un cliente nuevo envía un mensaje al WhatsApp de un negocio registrado.
2. WhatsApp Business responde automáticamente pidiendo nombre, dirección y motivo.
3. El cliente responde con sus datos. La WhatsApp Cloud API captura este mensaje y lo envía al Webhook del sistema, adjuntando el número de destino para identificar al negocio.
4. El sistema recibe el mensaje, identifica el `Negocio` y envía el texto a la API de Gemini (IA) con un prompt estricto.
5. La IA devuelve un JSON estructurado, y el sistema guarda el registro en la base de datos (Neon/PostgreSQL) con estado "PENDIENTE", asociado al `negocioId`.
6. El Administrador inicia sesión en la plataforma web mediante Clerk.
7. En el panel principal (Inbox), el Administrador visualiza únicamente las tarjetas de los clientes de su negocio.
8. El Administrador arrastra la tarjeta hacia un día específico en el calendario, actualizando la fecha del turno en la base de datos.