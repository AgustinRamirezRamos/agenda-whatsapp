import { PrismaClient } from '@prisma/client';
import { neon } from '@neondatabase/serverless';
import { PrismaNeonHttp } from '@prisma/adapter-neon';

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL || '';
  
  const sql = neon(connectionString);
  const adapter = new PrismaNeonHttp(sql as any, {});
  
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;