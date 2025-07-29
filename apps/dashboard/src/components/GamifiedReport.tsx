import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface DigitalizationScore {
  total: number;
  web_presence: number;
  local_seo: number;
  social_media: number;
  technical: number;
  engagement: number;
}

interface GamifiedReportProps {
  score: DigitalizationScore;
  companyName: string;
}

const GamifiedReport: React.FC<GamifiedReportProps> = ({ score, companyName }) => {
  const getScoreLevel = (total: number): { level: string; color: string; emoji: string } => {
    if (total >= 80) return { level: 'Excelente', color: 'bg-green-500', emoji: '🟢' };
    if (total >= 60) return { level: 'Bueno', color: 'bg-yellow-500', emoji: '🟡' };
    if (total >= 40) return { level: 'Intermedio', color: 'bg-orange-500', emoji: '🟠' };
    return { level: 'Básico', color: 'bg-red-500', emoji: '🔴' };
  };

  const getOpportunityPercentage = (total: number): number => {
    return Math.round((100 - total) * 0.8); // 80% del espacio restante
  };

  const scoreLevel = getScoreLevel(score.total);
  const opportunityPercentage = getOpportunityPercentage(score.total);

  const categories = [
    { name: 'Presencia Web', score: score.web_presence, icon: '🌐' },
    { name: 'SEO Local', score: score.local_seo, icon: '📍' },
    { name: 'Redes Sociales', score: score.social_media, icon: '📱' },
    { name: 'Técnico', score: score.technical, icon: '⚙️' },
    { name: 'Engagement', score: score.engagement, icon: '💬' },
  ];

  return (
    <div className="space-y-6">
      {/* Header con scoring principal */}
      <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            {companyName}
          </CardTitle>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-4xl">{scoreLevel.emoji}</span>
            <div>
              <div className="text-lg font-semibold text-gray-700">
                Nivel de Digitalización: {scoreLevel.level}
              </div>
              <div className="text-sm text-gray-600">
                Presencia Digital: {score.total}%
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Barra de progreso principal */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Puntuación Total</span>
                <span className="font-bold text-blue-600">{score.total}/100</span>
              </div>
              <Progress value={score.total} className="h-3" />
            </div>

            {/* Oportunidad de mejora */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">💡</span>
                <span className="font-semibold text-yellow-800">
                  ¡Oportunidad de Mejora!
                </span>
              </div>
              <p className="text-sm text-yellow-700">
                Tienes un {opportunityPercentage}% de oportunidad para mejorar tu presencia digital
                y captar más clientes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categorías detalladas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{category.icon}</span>
                <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Puntuación</span>
                  <span className="font-semibold">{category.score}/100</span>
                </div>
                <Progress value={category.score} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Básico</span>
                  <span>Excelente</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Badges de logros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🏆 Logros y Reconocimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {score.web_presence >= 70 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                🌐 Sitio Web Profesional
              </Badge>
            )}
            {score.local_seo >= 60 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                📍 SEO Local Optimizado
              </Badge>
            )}
            {score.social_media >= 50 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                📱 Presencia en Redes
              </Badge>
            )}
            {score.technical >= 75 && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                ⚙️ Técnicamente Sólido
              </Badge>
            )}
            {score.engagement >= 65 && (
              <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                💬 Buen Engagement
              </Badge>
            )}
            {score.total >= 60 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                🚀 Digitalmente Competitivo
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="text-2xl font-bold text-gray-800">
              ¿Quieres mejorar tu presencia digital?
            </div>
            <p className="text-gray-600">
              Nuestros agentes IA pueden ayudarte a optimizar cada aspecto de tu presencia online
              y aumentar tu puntuación de digitalización.
            </p>
            <div className="flex justify-center space-x-4">
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                Activar Agente de Ventas
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Optimizar SEO
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamifiedReport; 