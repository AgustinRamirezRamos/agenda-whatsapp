# 1.3 — Diseño de APIs Internas e Integraciones

> **Proyecto — Agenda Inteligente WhatsApp CRM**

Documentación de los endpoints expuestos por el backend en Next.js. El sistema cuenta con integraciones externas (WhatsApp Cloud API) y rutas internas protegidas para el consumo del Frontend.

---

## Integraciones Externas (WhatsApp / Meta)

### 1. GET /api/webhook/whatsapp

**Quién llama**: WhatsApp Cloud API (Meta).
**Propósito**: Endpoint de verificación obligatorio. Meta lo llama una única vez cuando se configura el Webhook en el panel de desarrolladores para asegurarse de que el servidor responde correctamente.

**Request (Query Params)**:
* `hub.mode`: "subscribe"
* `hub.verify_token`: (Token secreto definido en nuestro .env)
* `hub.challenge`: (Un número aleatorio generado por Meta)

**Response**:
Se debe devolver exactamente el valor recibido en `hub.challenge` en formato de texto plano con un status `200 OK`.

---

### 2. POST /api/webhook/whatsapp

**Quién llama**: WhatsApp Cloud API (Meta).
**Propósito**: Recibir en tiempo real cada mensaje que un cliente envía al número de WhatsApp Business del Administrador. Este endpoint procesa el texto con la IA (Gemini) y lo guarda en la base de datos.

**Request (JSON Body - Payload estándar de Meta)**:
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "changes": [
        {
          "value": {
            "messages": [
              {
                "from": "549112345678",
                "text": {
                  "body": "Soy Carlos, vivo en San Martin 123, necesito arreglar la persiana"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}

**Response**:
{
  "status": "success"
}
*(Debe devolver status 200 OK inmediatamente para que Meta no reintente enviar el mismo mensaje).*

---

## Rutas Internas (Frontend <-> Backend)

*Nota: Todas estas rutas requieren una sesión activa validada por el middleware de Clerk.*

### 3. GET /api/clientes/pendientes

**Quién llama**: Frontend (Panel "Inbox" del Administrador).
**Propósito**: Obtener el listado de clientes nuevos que la IA procesó pero que aún no tienen una fecha asignada en el calendario.

**Request**: Ninguno.

**Response**:
[
  {
    "id": "uuid-123",
    "nombre": "Carlos",
    "telefono": "549112345678",
    "direccion": "San Martin 123",
    "motivo": "Arreglar la persiana",
    "estado": "PENDIENTE",
    "fechaTurno": null,
    "createdAt": "2026-07-24T10:00:00Z"
  }
]

---

### 4. GET /api/clientes/agendados

**Quién llama**: Frontend (Vista del Calendario).
**Propósito**: Obtener los clientes que ya tienen una fecha asignada para pintarlos en los días correspondientes.

**Request**: 
(Opcional) Query params para filtrar por mes/semana: `?start_date=2026-07-01&end_date=2026-07-31`

**Response**:
[
  {
    "id": "uuid-456",
    "nombre": "María",
    "telefono": "549119876543",
    "direccion": "Av. Alem 450",
    "motivo": "Revisión de cañerías",
    "estado": "AGENDADO",
    "fechaTurno": "2026-07-28T15:00:00Z",
    "createdAt": "2026-07-22T09:15:00Z"
  }
]

---

### 5. PATCH /api/clientes/{id_cliente}/agendar

**Quién llama**: Frontend (Acción Drag & Drop en el calendario).
**Propósito**: Actualizar la fecha del turno cuando el Administrador arrastra la tarjeta de un cliente hacia un día específico.

**Request**:
{
  "estado": "AGENDADO",
  "fechaTurno": "2026-07-28T15:00:00Z"
}

**Response**:
{
  "id": "uuid-123",
  "estado": "AGENDADO",
  "fechaTurno": "2026-07-28T15:00:00Z",
  "updatedAt": "2026-07-24T10:30:00Z"
}

---

### 6. PATCH /api/clientes/{id_cliente}/estado

**Quién llama**: Frontend.
**Propósito**: Permitir al Administrador marcar un trabajo como "COMPLETADO" o "CANCELADO" para limpiar el calendario.

**Request**:
{
  "estado": "COMPLETADO"
}

**Response**:
{
  "id": "uuid-456",
  "estado": "COMPLETADO",
  "updatedAt": "2026-07-28T16:30:00Z"
}