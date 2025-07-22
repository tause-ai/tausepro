// Versión ultra-simple para debuggear
export default function AdminDashboardPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: 'green', fontSize: '32px' }}>
        ✅ TausePro Admin Dashboard FUNCIONANDO
      </h1>
      <p style={{ fontSize: '18px', marginTop: '20px' }}>
        🎯 Si ves este mensaje, el dashboard está renderizando correctamente.
      </p>
      <div style={{ 
        border: '2px solid green', 
        padding: '20px', 
        marginTop: '20px',
        backgroundColor: '#f0f8ff' 
      }}>
        <h2>📊 Métricas Demo:</h2>
        <ul>
          <li>🏢 Total Tenants: 127</li>
          <li>💰 Revenue: $45.6M COP</li>
          <li>🔥 API Calls: 1.25M</li>
          <li>⚡ Uptime: 99.9%</li>
        </ul>
      </div>
      <p style={{ marginTop: '20px', color: 'blue' }}>
        🕒 Última actualización: {new Date().toLocaleString()}
      </p>
    </div>
  )
} 