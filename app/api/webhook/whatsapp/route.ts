import { NextResponse } from "next/server";

//Sirve para que Meta verifique nuestro Webhook al configurarlo
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

//Acá van a llegar los mensajes de los clientes
export async function POST(request: Request) {
  try {
    const body = await request.json();

    //Verificamos que sea un mensaje de WhatsApp válido
    if (body.object === "whatsapp_business_account") {
      
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message && message.type === "text") {
        const numeroCliente = message.from;
        const textoMensaje = message.text.body;

        console.log(`Mensaje recibido de ${numeroCliente}: ${textoMensaje}`);
        
        //ACÁ PRONTO AGREGAREMOS LA CONEXIÓN CON GEMINI PARA PROCESAR EL TEXTO
      }
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
    
  } catch (error) {
    console.error("Error procesando el mensaje:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}