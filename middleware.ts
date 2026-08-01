import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Definimos qué rutas son públicas. 
// El webhook TIENE que ser público para que Meta nos pueda mandar los mensajes sin chocar con la seguridad.
const isPublicRoute = createRouteMatcher([
  '/api/webhook/whatsapp',
  '/sign-in(.*)',
  '/sign-up(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    // Ejecutamos protect directamente sobre el parámetro auth
    await auth.protect(); 
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};