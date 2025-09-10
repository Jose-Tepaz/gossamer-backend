# Gossamer Backend - Documentación del Proyecto

## 📋 Descripción General

**Gossamer Backend** es una aplicación backend desarrollada en Node.js con TypeScript que actúa como intermediario entre una aplicación frontend y la API de SnapTrade. El proyecto proporciona una capa de abstracción para gestionar usuarios, cuentas de trading y operaciones financieras a través de la plataforma SnapTrade.

## 🏗️ Arquitectura del Proyecto

### Estructura de Archivos
```
gossamer-backend/
├── index.ts                 # Punto de entrada principal del servidor
├── routes/
│   └── snaptrade.ts        # Rutas y lógica de negocio para SnapTrade
├── package.json            # Configuración de dependencias y scripts
├── tsconfig.json          # Configuración de TypeScript
└── README.md              # Documentación básica
```

## 🛠️ Tecnologías Utilizadas

### Dependencias Principales
- **Express.js** (v4.21.2): Framework web para Node.js
- **TypeScript** (v5.8.2): Lenguaje de programación tipado
- **SnapTrade TypeScript SDK** (v9.0.93): SDK oficial para integración con SnapTrade
- **CORS** (v2.8.5): Middleware para manejo de Cross-Origin Resource Sharing
- **dotenv** (v16.4.7): Gestión de variables de entorno

### Dependencias de Desarrollo
- **tsx** (v4.7.1): Ejecutor de TypeScript para desarrollo
- **@types/***: Definiciones de tipos para TypeScript
- **rimraf** (v6.0.1): Utilidad para limpieza de archivos

## 🚀 Configuración y Ejecución

### Variables de Entorno Requeridas
```env
CLIENT_ID=tu_client_id_de_snaptrade
CONSUMER_SECRET=tu_consumer_secret_de_snaptrade
PORT=4000  # Puerto opcional (por defecto 4000)
```

### Scripts Disponibles
```bash
# Desarrollo
npm run dev          # Ejecuta el servidor en modo desarrollo con tsx

# Producción
npm run build        # Compila TypeScript a JavaScript
npm run start        # Ejecuta la versión compilada
npm run clean        # Limpia la carpeta dist
```

## 📡 API Endpoints

### Base URL
```
http://localhost:4000/api/snaptrade
```

### 1. Registro de Usuario
**POST** `/register-user`

Registra un nuevo usuario en SnapTrade.

**Request Body:**
```json
{
  "userId": "string"
}
```

**Response:**
```json
{
  "userId": "string",
  "userSecret": "string"
}
```

### 2. Generar URL de Conexión
**POST** `/connect-portal-url`

Genera una URL para conectar la cuenta del usuario con un broker.

**Request Body:**
```json
{
  "userId": "string",
  "userSecret": "string",
  "broker": "string",           // Opcional
  "immediateRedirect": boolean, // Opcional
  "customRedirect": "string"    // Opcional
}
```

**Response:**
```json
{
  "redirectUri": "string"
}
```

### 3. Listar Usuarios
**GET** `/list-users`

Obtiene la lista de todos los usuarios registrados en SnapTrade.

**Response:**
```json
{
  "users": [...]
}
```

### 4. Eliminar Usuario
**DELETE** `/delete-user`

Elimina un usuario de SnapTrade.

**Request Body:**
```json
{
  "userId": "string"
}
```

**Response:**
```json
{
  "message": "Usuario eliminado correctamente",
  "data": {...}
}
```

### 5. Listar Cuentas
**GET** `/list-accounts`

Obtiene las cuentas asociadas a un usuario.

**Query Parameters:**
- `userId`: ID del usuario
- `userSecret`: Secreto del usuario

**Response:**
```json
{
  "accounts": [...]
}
```

### 6. Listar Tencencias de Cuenta
**GET** `/list-account-holdings`

Obtiene las tenencias (holdings) de una cuenta específica.

**Query Parameters:**
- `accountId`: ID de la cuenta
- `userId`: ID del usuario
- `userSecret`: Secreto del usuario

**Response:**
```json
{
  "holdings": [...]
}
```

## 🔧 Características Técnicas

### Manejo de Errores
El proyecto implementa un sistema robusto de manejo de errores:

1. **Clase personalizada `SnapTradeError`**: Extiende la clase Error nativa para manejar errores específicos de SnapTrade con códigos de estado HTTP.

2. **Middleware de errores**: Captura y procesa todos los errores de manera consistente, proporcionando respuestas estructuradas.

3. **Manejo específico por endpoint**: Cada endpoint maneja errores específicos como:
   - 400: Parámetros faltantes o inválidos
   - 401: Errores de autenticación
   - 404: Recursos no encontrados
   - 500: Errores internos del servidor

### Configuración del Servidor
- **Puerto dinámico**: Si el puerto especificado está en uso, automáticamente intenta con el siguiente puerto disponible.
- **CORS habilitado**: Permite peticiones desde diferentes orígenes.
- **JSON parsing**: Middleware para procesar cuerpos de petición en formato JSON.

### Configuración de TypeScript
- **Target**: ES2020 para compatibilidad moderna
- **Module**: NodeNext para soporte de módulos ES
- **Strict mode**: Habilitado para mayor seguridad de tipos
- **Output**: Compilación a la carpeta `dist/`

## 🔐 Seguridad

### Autenticación
- Utiliza las credenciales de SnapTrade (`CLIENT_ID` y `CONSUMER_SECRET`) para autenticación con la API.
- Cada usuario tiene un `userSecret` único generado durante el registro.

### Validación de Datos
- Validación de parámetros requeridos en cada endpoint.
- Manejo de errores de autenticación con respuestas específicas.

## 📊 Flujo de Trabajo Típico

1. **Registro**: El usuario se registra mediante `/register-user`
2. **Conexión**: Se genera una URL de conexión con `/connect-portal-url`
3. **Autenticación**: El usuario completa la autenticación con su broker
4. **Consulta**: Se pueden consultar cuentas y tenencias con los endpoints correspondientes

## 🚨 Consideraciones Importantes

### Limitaciones
- Dependiente de la disponibilidad de la API de SnapTrade
- Requiere credenciales válidas de SnapTrade para funcionar
- No incluye persistencia de datos local (todos los datos se obtienen de SnapTrade)

### Mejoras Futuras Sugeridas
1. **Logging**: Implementar un sistema de logging más robusto
2. **Validación**: Añadir validación más estricta de datos de entrada
3. **Rate Limiting**: Implementar límites de velocidad para prevenir abuso
4. **Testing**: Añadir tests unitarios y de integración
5. **Documentación API**: Generar documentación automática con Swagger/OpenAPI
6. **Base de datos**: Considerar persistencia local para cache o datos de sesión

## 📝 Notas de Desarrollo

- El proyecto utiliza módulos ES (ESM) como se indica en `"type": "module"` en package.json
- La configuración de TypeScript está optimizada para Node.js moderno
- El servidor maneja automáticamente conflictos de puerto
- Todos los endpoints incluyen manejo de errores específico y logging

---

**Versión**: 1.0.0  
**Autor**: Desarrollado para integración con SnapTrade  
**Licencia**: ISC
