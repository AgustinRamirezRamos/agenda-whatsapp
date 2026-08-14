export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma"; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("¡Webhook verificado por Meta exitosamente!");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Token inválido" }, { status: 403 });
}

export async function POST(request: Request) {
  console.log("=== PING REAL DESDE META ===");
  try {
    const body = await request.json();

    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];
      
      //Extraer el número del negocio (destinatario)
      const numeroNegocio = value?.metadata?.display_phone_number;

      if (message && message.type === "text" && numeroNegocio) {
        const numeroCliente = message.from;
        const textoMensaje = message.text.body;

        //Buscar el negocio en la base de datos
        const negocio = await prisma.negocio.findUnique({
          where: { telefonoOficial: numeroNegocio }
        });

        if (!negocio) {
          console.error("Negocio no encontrado para el número:", numeroNegocio);
          return NextResponse.json({ status: "success" }, { status: 200 });
        }

        //Procesar el texto con Gemini 2.5 Flash
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash-001",
          systemInstruction: "Sos un asistente de extracción de datos para turnos. Analizá el mensaje del cliente y devolvé ÚNICAMENTE un objeto JSON válido con las claves: 'nombre', 'direccion' (si no hay, null) y 'motivo'. No incluyas markdown ni texto extra."
        });

        const result = await model.generateContent(textoMensaje);
        const responseText = result.response.text();
        
        //Limpiar posible formato markdown (```json ... ```)
        const jsonLimpiado = responseText.replace(/```json|```/g, '').trim();
        const datosExtraidos = JSON.parse(jsonLimpiado);

        //Lógica de Base de Datos
        let cliente = await prisma.cliente.findUnique({
          where: {
            telefono_negocioId: {
              telefono: numeroCliente,
              negocioId: negocio.id,
            },
          },
        });

        if (!cliente) {
          //Cliente Nuevo
          cliente = await prisma.cliente.create({
            data: {
              telefono: numeroCliente,
              nombre: datosExtraidos.nombre,
              negocioId: negocio.id,
              turnos: {
                create: {
                  motivo: datosExtraidos.motivo || "Sin especificar",
                  fechaHora: new Date(), //Fecha temporal hasta que se asigne en el calendario
                  estado: "PENDIENTE",
                  negocioId: negocio.id
                }
              }
            }
          });
        } else {
          //Cliente Existente
          const turnoActivo = await prisma.turno.findFirst({
            where: {
              clienteId: cliente.id,
              negocioId: negocio.id,
              estado: { in: ["PENDIENTE", "AGENDADO"] }
            }
          });

          if (turnoActivo) {
            //Tiene un turno activo: actualizamos el motivo
            await prisma.turno.update({
              where: { id: turnoActivo.id },
              data: {
                motivo: `${turnoActivo.motivo} | Agregado: ${datosExtraidos.motivo}`
              }
            });
          } else {
            //Turnos anteriores finalizados: creamos uno nuevo
            await prisma.turno.create({
              data: {
                clienteId: cliente.id,
                negocioId: negocio.id,
                motivo: datosExtraidos.motivo || "Sin especificar",
                fechaHora: new Date(),
                estado: "PENDIENTE"
              }
            });
          }
        }
      }
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
    
  } catch (error) {
    console.error("Error procesando el mensaje:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}