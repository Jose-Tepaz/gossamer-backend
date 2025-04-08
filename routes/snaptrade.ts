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

    // Manejo específico para error de autenticación
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: "Error de autenticación",
        message: "Las credenciales proporcionadas (userId o userSecret) no son válidas",
        details: error.response?.data || {}
      });
    }

    // Para otros errores
    const statusCode = error.response?.status || 500;
    return res.status(statusCode).json(error.response?.data || { 
      error: "Error al conectar con SnapTrade",
      message: error.message 
    });
  }
});


// Nuevo endpoint para listar usuarios registrados en SnapTrade
router.get("/list-users", async (req: Request, res: Response, next: express.NextFunction) => {
    console.log("GET /list-users endpoint reached");
    try {
      const response = await snaptrade.authentication.listSnapTradeUsers();
      return res.status(200).json(response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      const errorDetails = error.response?.data || {};
      next(
        new SnapTradeError(
          error.response?.status || 500,
          errorMessage,
          errorDetails
        )
      );
    }
  }
);

// Endpoint para eliminar un usuario de SnapTrade
router.delete("/delete-user", async (req: Request, res: Response, next: express.NextFunction) => {
  console.log("DELETE /delete-user endpoint reached");
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      error: "userId es requerido para eliminar el usuario",
    });
  }

  try {
    const response = await snaptrade.authentication.deleteSnapTradeUser({
      userId,
    });
    
    return res.status(200).json({
      message: "Usuario eliminado correctamente",
      data: response.data
    });
  } catch (error: any) {
    console.error("Error al eliminar usuario:", error);
    
    // Manejo específico para error de autenticación
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: "Error de autenticación",
        message: "Las credenciales proporcionadas no son válidas",
        details: error.response?.data || {}
      });
    }
    
    // Manejo específico para usuario no encontrado
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: "Usuario no encontrado",
        message: "El usuario especificado no existe en SnapTrade",
        details: error.response?.data || {}
      });
    }
    
    // Para otros errores
    const statusCode = error.response?.status || 500;
    return res.status(statusCode).json(error.response?.data || { 
      error: "Error al eliminar el usuario",
      message: error.message 
    });
  }
});

// Endpoint para listar las cuentas de un usuario
router.get("/list-accounts", async (req: Request, res: Response, next: express.NextFunction) => {
  console.log("GET /list-accounts endpoint reached");
  const { userId, userSecret } = req.query;

  if (!userId || !userSecret) {
    return res.status(400).json({
      error: "userId y userSecret son requeridos como parámetros de consulta",
    });
  }

  try {
    const response = await snaptrade.accountInformation.listUserAccounts({
      userId: userId as string,
      userSecret: userSecret as string,
    });
    
    return res.status(200).json({
      accounts: response.data
    });
  } catch (error: any) {
    console.error("Error al listar cuentas:", error);
    
    // Manejo específico para error de autenticación
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: "Error de autenticación",
        message: "Las credenciales proporcionadas no son válidas",
        details: error.response?.data || {}
      });
    }
    
    // Para otros errores
    const statusCode = error.response?.status || 500;
    return res.status(statusCode).json(error.response?.data || { 
      error: "Error al listar las cuentas",
      message: error.message 
    });
  }
});

// Endpoint para listar las tenencias (holdings) de una cuenta
router.get("/list-account-holdings", async (req: Request, res: Response, next: express.NextFunction) => {
  console.log("GET /list-account-holdings endpoint reached");
  const { accountId, userId, userSecret } = req.query;

  if (!accountId || !userId || !userSecret) {
    return res.status(400).json({
      error: "accountId, userId y userSecret son requeridos como parámetros de consulta",
    });
  }

  try {
    const response = await snaptrade.accountInformation.getUserHoldings({
      accountId: accountId as string,
      userId: userId as string,
      userSecret: userSecret as string,
    });
    
    return res.status(200).json({
      holdings: response.data
    });
  } catch (error: any) {
    console.error("Error al listar tenencias de la cuenta:", error);
    
    // Manejo específico para error de autenticación
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: "Error de autenticación",
        message: "Las credenciales proporcionadas no son válidas",
        details: error.response?.data || {}
      });
    }
    
    // Manejo específico para cuenta no encontrada
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: "Cuenta no encontrada",
        message: "La cuenta especificada no existe o no pertenece al usuario",
        details: error.response?.data || {}
      });
    }
    
    // Para otros errores
    const statusCode = error.response?.status || 500;
    return res.status(statusCode).json(error.response?.data || { 
      error: "Error al listar las tenencias de la cuenta",
      message: error.message 
    });
  }
});

// Middleware para manejar errores
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: express.NextFunction
) => {
  console.error("Error:", err);

  if (err instanceof SnapTradeError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
  }

  return res.status(500).json({
    error: "Error interno del servidor",
    message: err.message,
  });
};
router.use(errorHandler);

export default router;
