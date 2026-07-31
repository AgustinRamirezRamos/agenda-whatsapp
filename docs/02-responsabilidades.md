# 1.2 — Asignación de Responsabilidades y Arquitectura

> **Proyecto — Agenda Inteligente WhatsApp CRM**

## Distribución de la Aplicación

Este sistema operará como un monolito moderno (Next.js App Router) que integra tanto el Frontend interactivo (Drag & Drop) como la API (Backend). 

* **Repositorio:** `agenda-whatsapp`
* **Framework:** Next.js (TypeScript)
* **Base de Datos:** PostgreSQL (Neon) gestionado con Prisma ORM
* **Autenticación:** Clerk
* **Servicios Externos:** Meta Developers (WhatsApp API), Google AI Studio (Gemini API)

---

## Interacciones con Sistemas Externos

| Sistema Externo | Acción / dato necesario | Dirección de la comunicación |
|-----------------|------------------------|------------------------------|
| **WhatsApp Cloud API** | Meta verifica la validez del webhook configurado | GET /api/webhook/whatsapp |
| **WhatsApp Cloud API** | Meta notifica la llegada de un nuevo mensaje de texto | POST /api/webhook/whatsapp |
| **Google Gemini API** | El sistema envía el texto crudo para obtener el JSON estructurado | Llamada interna del Backend -> Google |
| **Clerk** | Validación de identidad para proteger el Dashboard | Middleware de Next.js -> Clerk |