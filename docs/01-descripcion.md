# 1.1 — Descripción del Sistema

> **Proyecto — Agenda Inteligente WhatsApp CRM**

## ¿Qué problema resuelve?
El sistema centraliza y resguarda la información de los clientes que se comunican a través de WhatsApp Business, eliminando la dependencia exclusiva de la aplicación móvil. A través de Inteligencia Artificial, automatiza la extracción de datos y permite la gestión visual de turnos, evitando la pérdida de información y optimizando el tiempo del prestador de servicios.

## Actores del sistema

| Actor | Descripción |
|-------|-------------|
| Administrador (Dueño) | Usuario único del sistema de gestión. Visualiza los clientes entrantes, arrastra las tarjetas al calendario para asignar turnos y gestiona el estado de los trabajos. |
| Cliente | Persona externa que se comunica mediante WhatsApp Business. Interactúa indirectamente con el sistema al proveer sus datos básicos a través del chat. |
| Sistema IA (Gemini) | Actor automatizado encargado de procesar los mensajes crudos entrantes y extraer la información estructurada (nombre, teléfono, dirección, motivo). |

## Flujo principal de uso

1. Un cliente nuevo envía un mensaje al WhatsApp Business del Administrador.
2. WhatsApp Business responde automáticamente pidiendo nombre, dirección y motivo de la consulta.
3. El cliente responde con sus datos. La WhatsApp Cloud API captura este mensaje y lo envía al Webhook del sistema.
4. El sistema recibe el mensaje y lo envía a la API de Gemini (IA) con un prompt estricto para extraer la información.
5. La IA devuelve un JSON estructurado, y el sistema guarda el registro en la base de datos (Neon/PostgreSQL) con estado "PENDIENTE".
6. El Administrador inicia sesión en la plataforma web mediante Clerk.
7. En el panel principal (Inbox), el Administrador visualiza la tarjeta del nuevo cliente.
8. El Administrador arrastra la tarjeta hacia un día específico en el calendario. El frontend emite una petición para actualizar la fecha del turno en la base de datos.