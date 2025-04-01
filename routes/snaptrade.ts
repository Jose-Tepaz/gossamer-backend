import express, { Request, Response } from "express";
import { Snaptrade } from "snaptrade-typescript-sdk";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const snaptrade = new Snaptrade({
  clientId: process.env.CLIENT_ID!,
  consumerKey: process.env.CONSUMER_SECRET!,
});

router.post("/register-user", async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId es requerido" });
  }

  try {
    const response = await snaptrade.authentication.registerSnapTradeUser({ userId });

    // La respuesta YA incluye el userSecret
    const { userId: returnedUserId, userSecret } = response.data;

    return res.status(200).json({
      userId: returnedUserId,
      userSecret,
    });
  } catch (error: any) {
    console.error("SnapTrade ERROR:", error.response?.data || error.message);
    return res.status(500).json(error.response?.data || { message: error.message });
  }
});



router.post("/connect-portal-url", async (req: Request, res: Response) => {
  const { userId, userSecret } = req.body;

  if (!userId || !userSecret) {
    return res.status(400).json({ error: "userId y userSecret son requeridos" });
  }

  try {
    const response = await snaptrade.authentication.loginSnapTradeUser({
      userId,
      userSecret,
      immediateRedirect: false, // Te da el URL en vez de redirigir directamente
    });

    return res.status(200).json({
      redirectUri: response.data, // Este es el link que usarás para redirigir al usuario
    });
  } catch (error: any) {
    console.error("SnapTrade Connect Portal ERROR:", error.response?.data || error.message);
    return res.status(500).json(error.response?.data || { message: error.message });
  }
});




export default router;
