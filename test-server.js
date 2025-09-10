const express = require('express');
const cors = require('cors');

console.log('🔧 Iniciando servidor de prueba...');

const app = express();
app.use(cors());
app.use(express.json());

console.log('✅ Express configurado');

// Endpoint de prueba simple
app.post('/api/snaptrade/register-user', (req, res) => {
  console.log('📨 Recibida petición:', req.body);
  res.json({
    userId: req.body.userId,
    userSecret: `test-secret-${Date.now()}`
  });
});

app.get('/api/snaptrade/list-accounts', (req, res) => {
  console.log('📨 Recibida petición de cuentas');
  res.json({
    accounts: []
  });
});

const PORT = 4000;
console.log('🔄 Iniciando servidor en puerto:', PORT);

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor de prueba corriendo en puerto ${PORT}`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`  - POST http://localhost:${PORT}/api/snaptrade/register-user`);
  console.log(`  - GET  http://localhost:${PORT}/api/snaptrade/list-accounts`);
});

server.on('error', (error) => {
  console.error('❌ Error del servidor:', error);
});

console.log('✅ Servidor iniciado correctamente');
