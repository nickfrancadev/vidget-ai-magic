import { useState } from 'react';
import { Download, Share2, Heart, MoreHorizontal, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GeneratedContent {
  id: string;
  type: 'video' | 'image';
  url: string;
  thumbnail?: string;
  prompt: string;
  model: string;
  createdAt: string;
  duration?: string;
  resolution: string;
}

// Mock data for demonstration
const mockResults: GeneratedContent[] = [
  {
    id: '1',
    type: 'video',
    url: '/mock-video.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    prompt: 'Uma mulher elegante usando bolsa de couro, caminhando em Paris',
    model: 'VEO3',
    createdAt: '2024-01-15 14:30',
    duration: '0:15',
    resolution: '1920x1080'
  },
  {
    id: '2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
    prompt: 'Homem moderno com tênis branco em ambiente urbano',
    model: 'NanoBanana',
    createdAt: '2024-01-15 14:25',
    resolution: '1024x768'
  }
];

interface GenerationResultsProps {
  isGenerating?: boolean;
  results: GeneratedContent[];
}

export const GenerationResults = ({ isGenerating = false, results = [] }: GenerationResultsProps) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  if (isGenerating) {
    return (
      <Card className="ai-card p-8">
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-gradient-ai rounded-full mx-auto mb-4 animate-glow"></div>
          </div>
          <h3 className="text-lg font-semibold text-text-primary">
            Gerando seu conteúdo...
          </h3>
          <p className="text-text-muted">
            Isso pode levar alguns minutos. Estamos criando algo incrível para você!
          </p>
          <div className="w-full bg-surface-muted rounded-full h-2">
            <div className="bg-gradient-ai h-2 rounded-full w-1/3 animate-pulse"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="ai-card p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Resultados Gerados
        </h3>

        <div className="grid gap-4">
          {results.map((result) => (
            <div
              key={result.id}
              className="ai-card border border-border p-4 hover:shadow-ai-md transition-all duration-300"
            >
              <div className="flex gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-surface-muted">
                    {result.type === 'video' ? (
                      <div className="relative w-full h-full">
                        <img
                          src={result.thumbnail}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={result.url}
                        alt="Generated content"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <Badge 
                    className="absolute -top-2 -right-2 text-xs"
                    variant={result.type === 'video' ? 'default' : 'secondary'}
                  >
                    {result.type === 'video' ? '🎥' : '🖼️'}
                  </Badge>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-text-primary text-sm line-clamp-2">
                        {result.prompt}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {result.model}
                        </Badge>
                        <span className="text-xs text-text-muted">
                          {result.resolution}
                        </span>
                        {result.duration && (
                          <span className="text-xs text-text-muted">
                            {result.duration}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(result.id)}
                      className={`p-1 ${
                        favorites.includes(result.id) 
                          ? 'text-red-500' 
                          : 'text-text-muted hover:text-red-500'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${
                        favorites.includes(result.id) ? 'fill-current' : ''
                      }`} />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">
                      {result.createdAt}
                    </span>
                    
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="p-1">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-1">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-1">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && !isGenerating && (
          <div className="text-center py-8 text-text-muted">
            <p>Nenhum conteúdo gerado ainda.</p>
            <p className="text-sm">Selecione produtos e configure seu prompt para começar.</p>
          </div>
        )}
      </div>
    </Card>
  );
};