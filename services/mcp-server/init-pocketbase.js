// Script para inicializar PocketBase con la colección de API keys
// Ejecutar: node init-pocketbase.js

import PocketBase from 'pocketbase';

const POCKETBASE_URL = 'http://localhost:8090';
const ADMIN_EMAIL = 'admin@tause.pro';
const ADMIN_PASSWORD = 'admin123';

async function initPocketBase() {
    const pb = new PocketBase(POCKETBASE_URL);

    try {
        console.log('🔐 Autenticando con PocketBase...');
        
        // Autenticar como admin
        await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
        console.log('✅ Autenticación exitosa');

        // Crear colección de API keys
        console.log('📝 Creando colección api_keys...');
        
        const apiKeysCollection = {
            name: 'api_keys',
            type: 'base',
            system: false,
            schema: [
                {
                    name: 'service',
                    type: 'text',
                    required: true,
                    options: {
                        min: 1,
                        max: 50
                    }
                },
                {
                    name: 'api_key',
                    type: 'text',
                    required: true,
                    options: {
                        min: 1,
                        max: 500
                    }
                },
                {
                    name: 'is_active',
                    type: 'bool',
                    required: true,
                    options: {
                        default: true
                    }
                },
                {
                    name: 'last_used',
                    type: 'date',
                    required: false
                },
                {
                    name: 'usage',
                    type: 'json',
                    required: false
                },
                {
                    name: 'config',
                    type: 'json',
                    required: false
                }
            ],
            indexes: [
                {
                    name: 'idx_service',
                    type: 'single',
                    options: {
                        fields: ['service']
                    }
                }
            ]
        };

        try {
            await pb.collections.create(apiKeysCollection);
            console.log('✅ Colección api_keys creada exitosamente');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('ℹ️  La colección api_keys ya existe');
            } else {
                throw error;
            }
        }

        // Crear API key de ejemplo para Tavily
        console.log('🔑 Creando API key de ejemplo para Tavily...');
        
        try {
            const exampleKey = {
                service: 'tavily',
                api_key: 'tvly-dev-example-key-for-testing',
                is_active: false,
                last_used: new Date().toISOString(),
                usage: {
                    requests: 0,
                    tokens: 0,
                    cost: 0,
                    last_reset: new Date().toISOString()
                },
                config: {
                    search_depth: 'advanced'
                }
            };

            await pb.collection('api_keys').create(exampleKey);
            console.log('✅ API key de ejemplo creada');
        } catch (error) {
            if (error.message.includes('duplicate')) {
                console.log('ℹ️  La API key de ejemplo ya existe');
            } else {
                console.log('⚠️  Error creando API key de ejemplo:', error.message);
            }
        }

        console.log('\n🎉 Inicialización completada exitosamente!');
        console.log('\n📋 Próximos pasos:');
        console.log('1. Configura tu API key real de Tavily en el Super Admin');
        console.log('2. Prueba el análisis de empresas');
        console.log('3. Verifica que las API keys se lean desde PocketBase');

    } catch (error) {
        console.error('❌ Error durante la inicialización:', error.message);
        process.exit(1);
    }
}

// Ejecutar si es el script principal
if (import.meta.url === `file://${process.argv[1]}`) {
    initPocketBase();
}

export { initPocketBase }; 