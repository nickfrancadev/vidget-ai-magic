import { useState } from 'react';
import { Check, Zap, Video, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AIModel {
  id: string;
  name: string;
  description: string;
  type: 'video' | 'image';
  features: string[];
  quality: 'standard' | 'premium' | 'ultra';
  icon: React.ReactNode;
}

const aiModels: AIModel[] = [
  {
    id: 'veo3',
    name: 'VEO3',
    description: 'Modelo avançado para geração de vídeos realistas com alta qualidade',
    type: 'video',
    features: ['4K Quality', 'Realismo Avançado', 'Movimento Natural'],
    quality: 'ultra',
    icon: <Video className="h-5 w-5" />
  },
  {
    id: 'nanobanana',
    name: 'NanoBanana',
    description: 'IA especializada em imagens comerciais e produtos',
    type: 'image',
    features: ['Alta Resolução', 'Foco em Produtos', 'Renderização Rápida'],
    quality: 'premium',
    icon: <ImageIcon className="h-5 w-5" />
  },
  {
    id: 'creative-ai',
    name: 'Creative AI',
    description: 'Modelo versátil para criação artística e conceitual',
    type: 'image',
    features: ['Estilo Artístico', 'Criatividade', 'Flexibilidade'],
    quality: 'standard',
    icon: <Sparkles className="h-5 w-5" />
  }
];

const qualityColors = {
  standard: 'bg-blue-100 text-blue-800',
  premium: 'bg-purple-100 text-purple-800',
  ultra: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
};

interface ModelSelectorProps {
  selectedModel: string | null;
  onModelSelect: (modelId: string) => void;
}

export const ModelSelector = ({ selectedModel, onModelSelect }: ModelSelectorProps) => {
  return (
    <Card className="ai-card p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-ai-primary" />
          <h3 className="text-lg font-semibold text-text-primary">
            Escolha o Modelo de IA
          </h3>
        </div>

        <div className="grid gap-4">
          {aiModels.map((model) => {
            const isSelected = selectedModel === model.id;
            
            return (
              <div
                key={model.id}
                className={`relative cursor-pointer transition-all duration-300 ${
                  isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                }`}
                onClick={() => onModelSelect(model.id)}
              >
                <div className={`ai-card border-2 p-4 ${
                  isSelected 
                    ? 'border-ai-primary shadow-ai-glow' 
                    : 'border-transparent hover:border-ai-primary/30'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      isSelected 
                        ? 'bg-ai-primary text-white' 
                        : 'bg-surface-muted text-ai-primary'
                    }`}>
                      {model.icon}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-text-primary">{model.name}</h4>
                        <Badge className={qualityColors[model.quality]} variant="secondary">
                          {model.quality === 'ultra' ? 'Ultra' : 
                           model.quality === 'premium' ? 'Premium' : 'Standard'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {model.type === 'video' ? '🎥 Vídeo' : '🖼️ Imagem'}
                        </Badge>
                      </div>
                      
                      <p className="text-text-secondary text-sm">{model.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {model.features.map((feature, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-surface-muted text-text-muted rounded-md"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute top-3 right-3 bg-ai-primary text-white rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};