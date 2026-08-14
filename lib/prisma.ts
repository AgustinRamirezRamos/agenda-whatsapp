import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Necesario para que Neon funcione correctamente en entornos Node.js / Vercel
neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
  // Leemos la URL de la base de datos de forma segura
  const connectionString = "postgresql://neondb_owner:npg_hIYZme6Wi9yc@ep-damp-river-aco2x2b9-pooler.sa-east-1.aws.neon.tech/neondb";
  
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool as any);
  
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;