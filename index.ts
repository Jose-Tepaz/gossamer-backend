import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import snaptradeRoutes from "./routes/snaptrade.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/snaptrade", snaptradeRoutes);

const PORT = Number(process.env.PORT) || 4000;

const startServer = (port: number): Promise<void> => {

  return new Promise((resolve, reject) => {
    const server = app.listen(port)
      .on('listening', () => {
        console.log(`Servidor corriendo en puerto ${port}`);
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
