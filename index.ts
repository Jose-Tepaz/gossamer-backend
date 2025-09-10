import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import snaptradeRoutes from "./routes/snaptrade.js";

dotenv.config();

console.log('🔧 Iniciando servidor...');
console.log('Variables de entorno:');
console.log('PORT:', process.env.PORT || 'No definido (usando 4000)');

const app = express();
app.use(cors());
app.use(express.json());

console.log('✅ Express configurado');

console.log('🔄 Cargando rutas de SnapTrade...');
app.use("/api/snaptrade", snaptradeRoutes);
console.log('✅ Rutas configuradas');

const PORT = Number(process.env.PORT) || 4000;
console.log('🔄 Iniciando servidor en puerto:', PORT);

const startServer = (port: number): Promise<void> => {

  return new Promise((resolve, reject) => {
    const server = app.listen(port)
      .on('listening', () => {
        console.log(`🚀 Servidor corriendo en puerto ${port}`);
        console.log(`📊 Endpoints disponibles:`);
        console.log(`  - POST http://localhost:${port}/api/snaptrade/register-user`);
        console.log(`  - POST http://localhost:${port}/api/snaptrade/connect-portal-url`);
        console.log(`  - GET  http://localhost:${port}/api/snaptrade/list-accounts`);
        console.log(`  - GET  http://localhost:${port}/api/snaptrade/list-account-holdings`);
        resolve();
      })
      .on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          console.log(`Puerto ${port} en uso, intentando puerto ${port + 1}`);
          server.close();
          startServer(port + 1)
            .then(resolve)
            .catch(reject);
        } else {
          reject(error);
        }
      });
  });
};

startServer(PORT).catch(error => {
  console.error('Error al iniciar el servidor:', error);
  process.exit(1);
});
