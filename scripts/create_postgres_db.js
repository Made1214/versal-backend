import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '..', '.env') });

const { Client } = pg;

async function createDatabase() {
  // Parsear la URL de la base de datos
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ Error: DATABASE_URL no está definida en .env');
    process.exit(1);
  }

  // Extraer información de la URL
  const urlMatch = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  
  if (!urlMatch) {
    console.error('❌ Error: DATABASE_URL tiene un formato inválido');
    console.log('Formato esperado: postgresql://user:password@host:port/database');
    process.exit(1);
  }

  const [, user, password, host, port, database] = urlMatch;

  console.log('🔧 Configuración de base de datos:');
  console.log(`   Host: ${host}`);
  console.log(`   Port: ${port}`);
  console.log(`   User: ${user}`);
  console.log(`   Database: ${database}`);
  console.log('');

  // Conectar a la base de datos 'postgres' (base de datos por defecto)
  const client = new Client({
    user,
    password,
    host,
    port: parseInt(port),
    database: 'postgres', // Conectar a la BD por defecto
  });

  try {
    console.log('📡 Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Verificar si la base de datos ya existe
    const checkDbQuery = `
      SELECT 1 FROM pg_database WHERE datname = $1
    `;
    const result = await client.query(checkDbQuery, [database]);

    if (result.rows.length > 0) {
      console.log(`ℹ️  La base de datos '${database}' ya existe`);
    } else {
      // Crear la base de datos
      console.log(`🔨 Creando base de datos '${database}'...`);
      await client.query(`CREATE DATABASE "${database}"`);
      console.log(`✅ Base de datos '${database}' creada exitosamente`);
    }

    console.log('');
    console.log('✨ Proceso completado');
    console.log('');
    console.log('Próximos pasos:');
    console.log('  1. Ejecutar migraciones: npm run db:migrate');
    console.log('  2. Generar cliente Prisma: npm run prisma:generate');
    console.log('  3. Iniciar servidor: npm run dev');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 Sugerencias:');
      console.log('  - Verifica que PostgreSQL esté corriendo');
      console.log('  - Verifica el host y puerto en DATABASE_URL');
      console.log('  - En Windows, inicia PostgreSQL desde Services');
      console.log('  - En Linux/Mac: sudo service postgresql start');
    } else if (error.code === '28P01') {
      console.log('');
      console.log('💡 Sugerencias:');
      console.log('  - Verifica el usuario y contraseña en DATABASE_URL');
      console.log('  - Asegúrate de que el usuario tenga permisos');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Ejecutar
createDatabase();
