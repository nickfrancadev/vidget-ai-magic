import { useState } from 'react';
import { Wand2, Lightbulb, Copy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const promptSuggestions = [
  "uma mulher elegante usando [produto], caminhando em uma rua europeia ao pôr do sol",
  "um homem moderno com [produto], em um ambiente urbano contemporâneo",
  "uma pessoa jovem usando [produto], em uma praia tropical durante o dia",
  "um modelo profissional apresentando [produto] em um estúdio minimalista",
  "uma cena lifestyle com [produto] em um café parisiense",
];

interface PromptEditorProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  contentType: 'video' | 'image';
  onGenerate: () => void;
  isGenerating: boolean;
  canGenerate: boolean | string;
}

export const PromptEditor = ({ 
  prompt, 
  onPromptChange, 
  contentType, 
  onGenerate, 
  isGenerating, 
  canGenerate 
}: PromptEditorProps) => {

  const handleSuggestionClick = (suggestion: string) => {
    onPromptChange(suggestion);
  };

  const clearPrompt = () => {
    onPromptChange('');
  };

  return (
    <Card className="ai-card p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wand2 className="h-5 w-5 text-ai-primary" />
            <h3 className="text-lg font-semibold text-text-primary">
              Editor de Prompt
            </h3>
          </div>
          <Badge variant="outline" className="text-xs">
            {contentType === 'video' ? '🎥 Vídeo' : '🖼️ Imagem'}
          </Badge>
        </div>

        <div className="space-y-3">
          <Textarea
            placeholder={`Descreva como você quer que seja ${contentType === 'video' ? 'o vídeo' : 'a imagem'}. Exemplo: "Crie ${contentType === 'video' ? 'um vídeo' : 'uma imagem'} de uma mulher usando esta bolsa, passeando em uma rua europeia"`}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="ai-input min-h-[120px] resize-none"
          />
          
          <div className="flex items-center gap-2">
            <Button
              onClick={clearPrompt}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Limpar
            </Button>
            <span className="text-xs text-text-muted">
              {prompt.length}/500 caracteres
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-ai-primary" />
            <span className="text-sm font-medium text-text-primary">
              Sugestões de Prompt
            </span>
          </div>
          
          <div className="grid gap-2">
            {promptSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-left p-3 rounded-lg bg-surface-muted hover:bg-ai-primary/10 transition-colors text-sm text-text-secondary hover:text-text-primary border border-transparent hover:border-ai-primary/20"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <Button
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating}
            className="ai-button-primary w-full relative z-10"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                Gerando {contentType === 'video' ? 'Vídeo' : 'Imagem'}...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Gerar {contentType === 'video' ? 'Vídeo' : 'Imagem'}
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};