// tools/task-master-ai/task-master-config.js
import TaskMaster from 'task-master-ai'

export const taskMaster = new TaskMaster({
  project: 'tausepro',
  language: 'es',
  
  tasks: {
    'create:mcp-agent': {
      description: 'Crear nuevo agente MCP para PYMEs',
      prompts: [
        { name: 'agentName', message: 'Nombre del agente:' },
        { name: 'description', message: 'Descripción para PYMEs:' },
        { name: 'category', message: 'Categoría:', choices: ['ventas', 'soporte', 'contabilidad', 'logistica'] }
      ],
      template: 'templates/mcp-agent.go.tmpl',
      output: 'services/mcp-server/internal/agents/{{kebabCase agentName}}.go'
    },
    
    'create:colombia-integration': {
      description: 'Crear integración con servicio colombiano',
      prompts: [
        { name: 'service', message: 'Servicio:', choices: ['DIAN', 'PSE', 'Wompi', 'Nequi', 'Servientrega'] },
        { name: 'module', message: 'Módulo:', choices: ['payment', 'tax', 'shipping', 'invoice'] }
      ],
      template: 'templates/colombia-integration.tmpl',
      output: 'packages/colombia-sdk/{{kebabCase service}}/client.go'
    },
    
    'add:tenant': {
      description: 'Agregar nuevo tenant (PYME)',
      script: `
        echo "Creando tenant PYME..."
        go run cmd/cli/main.go tenant create \\
          --name "{{name}}" \\
          --subdomain "{{subdomain}}" \\
          --plan "{{plan}}" \\
          --nit "{{nit}}" \\
          --city "{{city}}"
      `
    },
    
    'test:paywall': {
      description: 'Probar límites del paywall',
      script: 'go test ./services/mcp-server/internal/middleware/paywall_test.go -v'
    },
    
    'deploy:staging': {
      description: 'Deploy a staging Colombia',
      steps: [
        'make test',
        'make test-colombia',
        'make build',
        'kubectl apply -f k8s/staging/',
        'make smoke-test-colombia'
      ]
    },
    
    'generate:invoice': {
      description: 'Generar factura DIAN de prueba',
      prompts: [
        { name: 'nit', message: 'NIT del cliente:' },
        { name: 'amount', message: 'Monto (COP):' },
        { name: 'iva', message: 'IVA %:', choices: ['0', '5', '19'] }
      ],
      script: 'go run tools/scripts/generate-invoice.go --nit={{nit}} --amount={{amount}} --iva={{iva}}'
    }
  },
  
  workflows: {
    'pyme:onboard': [
      'add:tenant',
      'create:mcp-agent',
      'test:paywall',
      'generate:invoice'
    ],
    
    'feature:colombia': [
      'create:colombia-integration',
      'test:colombia',
      'git add .',
      'git commit -m "feat: integración {{service}} para PYMEs"'
    ]
  }
}) 