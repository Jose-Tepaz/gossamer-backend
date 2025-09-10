const express = require('express');
const cors = require('cors');

console.log('🔧 Iniciando servidor simple...');

const app = express();
app.use(cors());
app.use(express.json());

console.log('✅ Middleware configurado');

// Mock endpoints sin SnapTrade SDK
app.post('/api/snaptrade/register-user', (req, res) => {
  console.log('📨 POST /api/snaptrade/register-user');
  console.log('Body:', req.body);
  
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId es requerido' });
  }
  
  // Simular respuesta de SnapTrade
  const response = {
    userId: userId,
    userSecret: `secret-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
  
  console.log('✅ Respuesta:', response);
  res.json(response);
});

app.post('/api/snaptrade/connect-portal-url', (req, res) => {
  console.log('📨 POST /api/snaptrade/connect-portal-url');
  console.log('Body:', req.body);
  
  const { userId, userSecret, broker } = req.body;
  
  if (!userId || !userSecret || !broker) {
    return res.status(400).json({ error: 'userId, userSecret y broker son requeridos' });
  }
  
  const response = {
    redirectUri: {
      redirectURI: `https://app.snaptrade.com/mock-portal?userId=${userId}&broker=${broker}`,
      sessionId: `session-${Date.now()}`
    }
  };
  
  console.log('✅ Respuesta:', response);
  res.json(response);
});

app.get('/api/snaptrade/list-accounts', (req, res) => {
  console.log('📨 GET /api/snaptrade/list-accounts');
  console.log('Query:', req.query);
  
  const { userId, userSecret } = req.query;
  
  if (!userId || !userSecret) {
    return res.status(400).json({ error: 'userId y userSecret son requeridos' });
  }
  
  const response = {
    accounts: [
      {
        accountId: 'mock-account-1',
        broker: 'etrade',
        accountName: 'E*TRADE Account',
        status: 'connected'
      }
    ]
  };
  
  console.log('✅ Respuesta:', response);
  res.json(response);
});

app.get('/api/snaptrade/list-account-holdings', (req, res) => {
  console.log('📨 GET /api/snaptrade/list-account-holdings');
  console.log('Query:', req.query);
  
  const { accountId, userId, userSecret } = req.query;
  
  if (!accountId || !userId || !userSecret) {
    return res.status(400).json({ error: 'accountId, userId y userSecret son requeridos' });
  }
  
  const response = {
    accountId: accountId,
    balances: [{ currency: 'USD', amount: 10000, type: 'cash' }],
    positions: [{ symbol: 'AAPL', quantity: 10, marketValue: 1500 }],
    orders: []
  };
  
  console.log('✅ Respuesta:', response);
  res.json(response);
});

const PORT = 4000;
console.log('🔄 Iniciando servidor en puerto:', PORT);

app.listen(PORT, () => {
  console.log(`🚀 Servidor simple corriendo en puerto ${PORT}`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`  - POST http://localhost:${PORT}/api/snaptrade/register-user`);
  console.log(`  - POST http://localhost:${PORT}/api/snaptrade/connect-portal-url`);
  console.log(`  - GET  http://localhost:${PORT}/api/snaptrade/list-accounts`);
  console.log(`  - GET  http://localhost:${PORT}/api/snaptrade/list-account-holdings`);
  console.log('✅ Servidor listo para recibir peticiones');
});

console.log('🎯 Servidor configurado exitosamente');
