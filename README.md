# 🚀 TausePro

**La navaja suiza de IA para PYMEs colombianas**

TausePro es una plataforma SaaS multi-tenant que democratiza el acceso a tecnología de IA avanzada para las PYMEs colombianas, funcionando como una "navaja suiza" de Model Context Protocol (MCP) que integra e-commerce, agentes inteligentes, procesamiento de pagos colombianos y comunicación omnicanal.

## 🎯 Misión

Empoderar a las 2.5 millones de PYMEs colombianas (97% del tejido empresarial) con herramientas de IA de clase mundial, sin requerir conocimientos técnicos.

## 🏗️ Arquitectura

### Relación con TauseStack
- **TauseStack**: Framework open-source para desarrolladores (tausestack.dev)
- **TausePro**: Plataforma no-code para PYMEs basada en TauseStack (tause.pro)

### Stack Tecnológico

**Frontend:**
- Landing: Astro + React + Tailwind CSS
- Dashboard: Vite + React + shadcn/ui + TypeScript
- Mobile: React Native + Expo

**Backend:**
- Core: Go + Fiber + PocketBase
- E-commerce: Medusa.js optimizado para Colombia
- Cache/Paywall: Redis
- Analytics: PostgreSQL

**Infraestructura:**
- Containerización: Docker + Docker Compose
- Orquestación: Kubernetes + Helm
- CI/CD: GitHub Actions + Make
- Monitoreo: Prometheus + Grafana

## 🇨🇴 Contexto Colombia

### Integraciónes Nativas
- **Pagos**: PSE, Nequi, Wompi, DaviPlata, Efecty
- **Logística**: Servientrega, TCC, Coordinadora
- **Compliance**: DIAN, Habeas Data, Cámara de Comercio
- **Impuestos**: IVA (0%, 5%, 19%), ReteFuente, ICA

### Características Específicas
- Moneda: COP (sin decimales)
- Documentos: CC, NIT, CE, TI con validación
- Direcciones: Nomenclatura colombiana
- Facturación electrónica DIAN

## 💰 Modelo de Negocio (Paywall)

### Planes
- **Gratis**: 100 API calls, 3 agentes MCP, 50 mensajes WhatsApp
- **Starter**: $49.900 COP/mes - 5.000 API calls, 10 agentes
- **Growth**: $149.900 COP/mes - 25.000 API calls, 50 agentes  
- **Scale**: $499.900 COP/mes - Ilimitado

### Enforcement
- Redis counters para usage tracking
- Go middleware para límites duros
- 402 Payment Required con upgrade flows

## 🚀 Quick Start

### Prerequisitos
- Docker & Docker Compose
- Go 1.21+
- Node.js 18+
- Make

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tausepro/tausepro.git
cd tausepro

# Ejecutar setup automático
chmod +x setup.sh
./setup.sh
```

### URLs de Desarrollo
- **Landing**: http://localhost:3000 (tause.pro)
- **Dashboard**: http://localhost:5173 (app.tause.pro)
- **API**: http://localhost:8080 (api.tause.pro)
- **PocketBase Admin**: http://localhost:8090/_/

## 🛠️ Comandos Útiles

```bash
# Desarrollo
make dev              # Iniciar ambiente completo
make install          # Instalar dependencias
make monitor          # Ver logs en tiempo real

# Testing
make test             # Tests generales
make test-colombia    # Tests específicos Colombia
make test-paywall     # Probar límites del paywall

# Deploy
make build            # Build para producción
make deploy-staging   # Deploy a staging

# Colombia
make seed-colombia    # Cargar datos de Colombia
make generate-invoice # Generar factura DIAN de prueba
```

## 📁 Estructura del Proyecto

```
tausepro/
├── apps/
│   ├── landing/           # Landing page (Astro)
│   ├── dashboard/         # Dashboard PYMEs (React)
│   ├── chat-widget/       # Widget chat embebido
│   └── mobile/            # App móvil (React Native)
├── services/
│   ├── mcp-server/        # Core MCP server (Go)
│   ├── e-commerce/        # E-commerce (Medusa.js)
│   ├── chat-service/      # Chat/WhatsApp service
│   ├── analytics/         # Analytics service
│   └── billing/           # Billing/Paywall service
├── packages/
│   ├── colombia-sdk/      # SDK Colombia (Go)
│   ├── ui-components/     # Componentes UI compartidos
│   └── mcp-protocol/      # MCP protocol implementation
├── infrastructure/
│   ├── docker/            # Dockerfiles
│   ├── k8s/              # Kubernetes manifests
│   ├── nginx/            # Nginx configs
│   └── terraform/        # Infrastructure as Code
└── tools/
    ├── task-master-ai/    # AI task automation
    └── scripts/          # Utility scripts
```

## 🎯 Features Core

### Para PYMEs
- **Dashboard No-Code**: Interfaz simple para no técnicos
- **Agentes MCP**: Ventas, soporte, contabilidad, logística
- **E-commerce Turnkey**: Tienda lista con pagos colombianos
- **WhatsApp Business**: Integración nativa
- **Facturación DIAN**: Automática y compliant

### Para Desarrolladores
- **MCP SDK**: Desarrollo de agentes personalizados
- **Multi-tenant**: Aislamiento completo de datos
- **APIs RESTful**: Documentación completa
- **Webhooks**: Eventos en tiempo real
- **White-label**: Customización por tenant

## 🧪 Testing Colombia

```bash
# Test integración PSE
make test-pse

# Test facturación DIAN
make test-dian

# Test validación NIT
make test-nit

# Test envío Servientrega
make test-shipping
```

## 🔐 Seguridad & Compliance

- **Auth**: JWT (15min) + Refresh tokens (7 días)
- **Encryption**: TLS 1.3 tránsito, AES-256 reposo
- **Compliance**: Habeas Data, PCI DSS, ISO 27001
- **Colombia**: Ley 1581/2012, Circular Externa 002/2018

## 📈 Performance

- **Latencia API**: <200ms p99 desde Colombia
- **Uptime**: 99.9%
- **Usuarios concurrentes**: 10,000+
- **RPS**: 100,000+
- **Costo infraestructura**: <$50 USD/mes para 1,000 tenants

## 🤝 Contribuir

1. Fork el repositorio
2. Crear feature branch: `git checkout -b feature/nueva-integracion-colombia`
3. Commit cambios: `git commit -m 'feat: integración con Bancolombia'`
4. Push branch: `git push origin feature/nueva-integracion-colombia`
5. Abrir Pull Request

### Convenciones
- Código comentado en español
- Tests obligatorios
- Considerar paywall en nuevas features
- UX simple para PYMEs no técnicas

## 📞 Soporte

- **Documentación**: [docs.tause.pro](https://docs.tause.pro)
- **Discord**: [discord.gg/tausepro](https://discord.gg/tausepro)
- **Email**: soporte@tause.pro
- **WhatsApp**: +57 300 123 4567

## 📄 Licencia

Copyright (c) 2024 TausePro - Todos los derechos reservados.

---

**¿Listo para sacar TausePro del estadio? 🚀🇨🇴** 