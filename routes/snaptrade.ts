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

// Log de configuración
console.log('🔧 Configuración de SnapTrade:');
console.log('CLIENT_ID:', process.env.CLIENT_ID ? '✅ Configurado' : '❌ No configurado');
console.log('CONSUMER_SECRET:', process.env.CONSUMER_SECRET ? '✅ Configurado (usado como consumerKey)' : '❌ No configurado');

// Verificar que las variables estén configuradas antes de inicializar
if (!process.env.CLIENT_ID || !process.env.CONSUMER_SECRET) {
  console.error('❌ Variables de entorno faltantes para SnapTrade');
  console.error('Asegúrate de tener CLIENT_ID y CONSUMER_SECRET en tu .env');
  process.exit(1);
}

let snaptrade: Snaptrade;

try {
  console.log('🔄 Inicializando cliente de SnapTrade...');
  snaptrade = new Snaptrade({
    clientId: process.env.CLIENT_ID!,
    consumerKey: process.env.CONSUMER_SECRET!,
  });
  console.log('✅ Cliente de SnapTrade inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando SnapTrade:', error);
  process.exit(1);
}

router.post("/register-user", async (req: Request, res: Response, next: express.NextFunction) => {
  console.log('📨 POST /register-user - Iniciando...');
  console.log('Body recibido:', req.body);
  
  const { userId } = req.body;

  if (!userId) {
    console.log('❌ userId faltante');
    return res.status(400).json({ error: "userId es requerido" });
  }

  try {
    console.log('🔄 Llamando a SnapTrade API para registrar usuario:', userId);
    console.log('🔧 Configuración del SDK:');
    console.log('- CLIENT_ID:', process.env.CLIENT_ID ? 'Configurado' : 'No configurado');
    console.log('- CONSUMER_SECRET:', process.env.CONSUMER_SECRET ? 'Configurado' : 'No configurado');
    
    const response = await snaptrade.authentication.registerSnapTradeUser({ 
      userId: userId.toString() 
    });
    console.log('✅ Respuesta de SnapTrade recibida');
    console.log('✅ Response status:', response.status);
    console.log('✅ Response data:', JSON.stringify(response.data, null, 2));
    
    const { userId: returnedUserId, userSecret } = response.data;
    console.log('✅ Usuario registrado exitosamente:', returnedUserId);

    return res.status(200).json({
      userId: returnedUserId,
      userSecret,
    });
  } catch (error: any) {
    console.error('❌ Error completo:', error);
    console.error('❌ Error en registerSnapTradeUser:', error.message);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error stack:', error.stack);
    
    // Intentar acceder a diferentes propiedades del error
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('❌ Response headers:', JSON.stringify(error.response.headers, null, 2));
    }
    
    if (error.request) {
      console.error('❌ Request:', error.request);
    }
    
    const errorMessage = error.response?.data?.message || error.message;
    const errorDetails = error.response?.data || {};
    
    // No hacer throw, devolver el error como respuesta JSON
    return res.status(error.response?.status || 500).json({
      error: true,
      message: errorMessage,
      details: errorDetails,
      snaptradeError: true,
      fullError: error.toString()
    });
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
/**
 * Espera una solicitud DELETE a /delete-user con el siguiente formato en el body (JSON):
 * {
 *   "userId": "string" // El ID único del usuario que se desea eliminar en SnapTrade
 * }
 * 
 * Ejemplo de uso con fetch:
 * fetch('/api/snaptrade/delete-user', {
 *   method: 'DELETE',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ userId: 'usuario123' })
 * })
 */

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
