# Google MCP Server para TausePro

Servidor MCP (Model Context Protocol) para integración con servicios de Google (Gmail, Calendar, Drive) en TausePro.

## 🚀 Características

- **Autenticación OAuth2** con Google
- **Gmail API** - Leer, analizar y buscar emails
- **Google Calendar API** - Gestionar eventos y calendarios
- **Análisis inteligente** de emails y eventos
- **API REST** para integración con TausePro

## 📋 Requisitos

- Node.js 18+
- Cuenta de Google Cloud Platform
- Credenciales OAuth2 de Google

## 🔧 Configuración

### 1. Configurar Google Cloud Platform

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las APIs:
   - Gmail API
   - Google Calendar API
   - Google Drive API
4. Crea credenciales OAuth2:
   - Tipo: Aplicación web
   - URIs autorizados: `http://localhost:3001`
   - URIs de redirección: `http://localhost:3001/auth/callback`

### 2. Configurar variables de entorno

Copia `env.example` a `.env` y configura:

```bash
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/callback

# Server Configuration
PORT=3001
NODE_ENV=development

# Google API Scopes
GOOGLE_SCOPES=gmail.readonly,calendar.readonly,drive.readonly,calendar.events
```

### 3. Instalar dependencias

```bash
npm install
```

## 🚀 Uso

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run build
npm start
```

## 📡 API Endpoints

### Autenticación

- `POST /auth/url` - Generar URL de autenticación
- `POST /auth/exchange` - Intercambiar código por tokens

### Gmail

- `GET /gmail/messages` - Leer mensajes
- `POST /gmail/analyze` - Analizar email
- `GET /gmail/search` - Buscar emails

### Calendar

- `GET /calendar/events` - Leer eventos
- `POST /calendar/events` - Crear evento
- `POST /calendar/analyze` - Analizar evento

### Utilidades

- `GET /health` - Health check
- `GET /stats` - Estadísticas

## 🔗 Integración con TausePro

### 1. Conectar desde el dashboard

```typescript
// En el dashboard de TausePro
const connectGoogle = async () => {
  const response = await fetch('http://localhost:3001/auth/url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: 'tausepro' })
  })
  
  const { authUrl } = await response.json()
  window.location.href = authUrl
}
```

### 2. Procesar callback

```typescript
// Después de la autenticación
const exchangeCode = async (code: string) => {
  const response = await fetch('http://localhost:3001/auth/exchange', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  })
  
  const { tokens, user } = await response.json()
  // Guardar tokens en TausePro
}
```

### 3. Usar servicios

```typescript
// Leer emails
const getEmails = async () => {
  const response = await fetch('http://localhost:3001/gmail/messages?maxResults=10')
  const { messages } = await response.json()
  return messages
}

// Analizar email
const analyzeEmail = async (messageId: string) => {
  const response = await fetch('http://localhost:3001/gmail/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageId })
  })
  
  const { analysis } = await response.json()
  return analysis
}
```

## 🧠 Análisis Inteligente

### Análisis de Emails

- **Sentimiento**: Positivo, negativo, neutral
- **Categorización**: Billing, support, sales, meeting
- **Elementos de acción**: Tareas pendientes
- **Prioridad**: Alta, media, baja

### Análisis de Eventos

- **Conflictos**: Eventos solapados
- **Sugerencias**: Optimización de horarios
- **Duración**: Análisis de tiempo
- **Asistentes**: Gestión de participantes

## 🔒 Seguridad

- Tokens OAuth2 seguros
- Validación de scopes
- Manejo de errores robusto
- Logs estructurados

## 📊 Monitoreo

```bash
# Health check
curl http://localhost:3001/health

# Estadísticas
curl http://localhost:3001/stats
```

## 🐛 Troubleshooting

### Error de autenticación

1. Verifica las credenciales OAuth2
2. Confirma que las APIs están habilitadas
3. Revisa los URIs autorizados

### Error de permisos

1. Verifica los scopes configurados
2. Confirma que el usuario autorizó los permisos
3. Revisa los logs del servidor

## 📝 Logs

Los logs incluyen:
- Autenticación exitosa/fallida
- Operaciones de Gmail/Calendar
- Errores de API
- Estadísticas de uso

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama feature
3. Implementa cambios
4. Ejecuta tests
5. Envía pull request

## 📄 Licencia

MIT License - ver LICENSE para detalles. 