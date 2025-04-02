import express, { Request, Response } from "express";
import { Snaptrade } from "snaptrade-typescript-sdk";
import dotenv from "dotenv";

dotenv.config();

// Clase personalizada para errores de SnapTrade
class SnapTradeError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SnapTradeError';
  }
}

const router = express.Router();

const snaptrade = new Snaptrade({
  clientId: process.env.CLIENT_ID!,
  consumerKey: process.env.CONSUMER_SECRET!,
});

// Middleware para manejar errores
const errorHandler = (err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Error:', err);

  if (err instanceof SnapTradeError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details
    });
  }

  // Error por defecto
  return res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message
  });
};

router.post("/register-user", async (req: Request, res: Response, next: express.NextFunction) => {
  const { userId } = req.body;

  if (!userId) {
    throw new SnapTradeError(400, "userId es requerido");
  }

  try {
    const response = await snaptrade.authentication.registerSnapTradeUser({ userId });
    const { userId: returnedUserId, userSecret } = response.data;

    return res.status(200).json({
      userId: returnedUserId,
      userSecret,
    });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    const errorDetails = error.response?.data || {};
    
    throw new SnapTradeError(
      error.response?.status || 500,
      errorMessage,
      errorDetails
    );
  }
});

router.post("/connect-portal-url", async (req: Request, res: Response) => {
  const { userId, userSecret, broker, immediateRedirect, customRedirect } = req.body;

  // Validación mínima
  if (!userId || !userSecret) {
    return res.status(400).json({
      error: "userId y userSecret son requeridos",
    });
  }

  try {
    // Llamada a loginSnapTradeUser con tus parámetros
    const response = await snaptrade.authentication.loginSnapTradeUser({
      userId,
      userSecret,
      broker,
      immediateRedirect,
      customRedirect,
    });

    // La API de SnapTrade devuelve el link en response.data
    return res.status(200).json({
      redirectUri: response.data,
    });
  } catch (error: any) {
    console.error("Error al generar connect-portal-url:", error);

    // Tomamos el código de estado si está presente; si no, usamos 500
    const statusCode = error.response?.status || 500;

    // Enviamos exactamente el objeto de error que devuelva la API de SnapTrade
    return res.status(statusCode).json(error.response?.data || { message: error.responseBody });
  }
});

// Aplicar el middleware de manejo de errores
router.use(errorHandler);

export default router;
