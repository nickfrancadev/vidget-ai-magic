import { useState } from 'react';
import { Download, Share2, Heart, MoreHorizontal, Play, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AIServices } from '@/services/aiServices';
import generatedResult1 from '@/assets/generated-result-1.jpg';
import generatedResult2 from '@/assets/generated-result-2.jpg';
import generatedResult3 from '@/assets/generated-result-3.jpg';

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

const generatedImages = [generatedResult1, generatedResult2, generatedResult3];

interface GenerationResultsProps {
  isGenerating?: boolean;
  results: GeneratedContent[];
}

export const GenerationResults = ({ isGenerating = false, results = [] }: GenerationResultsProps) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<GeneratedContent | null>(null);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const getImageForResult = (result: GeneratedContent, index: number) => {
    // Se o resultado tem uma URL real (da API), usar ela
    if (result.url && result.url !== 'generated') {
      return result.url;
    }
    // Caso contrário, usar imagem de fallback
    return generatedImages[index % generatedImages.length];
  };

  const getThumbnailForResult = (result: GeneratedContent, index: number) => {
    if (result.thumbnail) {
      return result.thumbnail;
    }
    return getImageForResult(result, index);
  };

  const handleDownload = (result: GeneratedContent) => {
    const filename = `${result.type}-${result.id}.${result.type === 'video' ? 'mp4' : 'jpg'}`;
    AIServices.downloadContent(result.url, filename);
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
    <>
      <Card className="ai-card p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">
            Resultados Gerados
          </h3>

          <div className="grid gap-4">
            {results.map((result, index) => {
              const displayUrl = getImageForResult(result, index);
              const thumbnailUrl = getThumbnailForResult(result, index);
              
              return (
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
                              src={thumbnailUrl}
                              alt="Video thumbnail"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Play className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={displayUrl}
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-1"
                                onClick={() => setSelectedMedia(result)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl w-full p-0">
                              <div className="relative">
                                {result.type === 'video' ? (
                                  <video
                                    src={result.url}
                                    controls
                                    className="w-full h-auto max-h-[80vh] object-contain"
                                    poster={thumbnailUrl}
                                  >
                                    Seu navegador não suporta o elemento de vídeo.
                                  </video>
                                ) : (
                                  <img
                                    src={displayUrl}
                                    alt={result.prompt}
                                    className="w-full h-auto max-h-[80vh] object-contain"
                                  />
                                )}
                                <div className="absolute top-4 right-4">
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="bg-black/50 text-white hover:bg-black/70">
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                                  <h3 className="text-white font-semibold mb-2">{result.prompt}</h3>
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-white/20 text-white">
                                      {result.model}
                                    </Badge>
                                    <span className="text-white/80 text-sm">
                                      {result.resolution}
                                    </span>
                                    {result.duration && (
                                      <span className="text-white/80 text-sm">
                                        {result.duration}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1"
                            onClick={() => handleDownload(result)}
                          >
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
              );
            })}
          </div>

          {results.length === 0 && !isGenerating && (
            <div className="text-center py-8 text-text-muted">
              <p>Nenhum conteúdo gerado ainda.</p>
              <p className="text-sm">Selecione produtos e configure seu prompt para começar.</p>
            </div>
          )}
        </div>
      </Card>
    </>
  );
};