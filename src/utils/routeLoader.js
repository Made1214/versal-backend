/**
 * Auto-loader de rutas
 * Carga automáticamente todas las rutas desde la carpeta features
 * Convención: cada feature tiene un archivo [feature].routes.js
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Carga todas las rutas automáticamente desde la carpeta features
 * @param {FastifyInstance} fastify - Instancia de Fastify
 * @param {string} featuresDir - Ruta a la carpeta de features (puede ser absoluta o relativa)
 */
export async function loadRoutes(fastify, featuresDir = "../features") {
  // Si es un path relativo, resolverlo desde __dirname
  const resolvedPath = path.isAbsolute(featuresDir) 
    ? featuresDir 
    : path.resolve(__dirname, featuresDir);

  try {
    const features = await fs.readdir(resolvedPath);

    for (const feature of features) {
      const featurePath = path.join(resolvedPath, feature);
      const stat = await fs.stat(featurePath);

      // Solo procesar directorios
      if (!stat.isDirectory()) continue;

      const routeFile = path.join(featurePath, `${feature}.routes.js`);

      try {
        // Verificar que el archivo existe
        await fs.stat(routeFile);

        // Importar dinámicamente el archivo de rutas
        const { default: routes } = await import(`file://${routeFile}`);

        // Registrar las rutas con prefijo /api
        // Cada feature define sus propias rutas relativas a /api
        await fastify.register(routes, { prefix: '/api' });

        fastify.log.info(`✓ Rutas cargadas: ${feature}`);
      } catch (err) {
        // Ignorar si no existe el archivo de rutas
        if (err.code !== "ENOENT") {
          fastify.log.warn(`⚠ Error cargando rutas de ${feature}:`, err.message);
        }
      }
    }

    fastify.log.info("✓ Todas las rutas han sido cargadas automáticamente");
  } catch (err) {
    fastify.log.error("✗ Error al cargar rutas:", err);
    throw err;
  }
}
