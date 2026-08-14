import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

//Definimos qué rutas son públicas (nuestro webhook y la página de login)
const isPublicRoute = createRouteMatcher([
  '/api/webhook/whatsapp(.*)', 
  '/sign-in(.*)'
]);

export default clerkMiddleware(async (auth, request) => {
  //Si la ruta NO es pública, le pedimos a Clerk que la proteja
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};