import { useState } from 'react';
import { Sparkles, Zap, Video, Image as ImageIcon } from 'lucide-react';
import { ProductSelector } from '@/components/ProductSelector';
import { ModelSelector } from '@/components/ModelSelector';
import { PromptEditor } from '@/components/PromptEditor';
import { GenerationResults } from '@/components/GenerationResults';

const Index = () => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const getContentType = (): 'video' | 'image' => {
    if (selectedModel === 'veo3') return 'video';
    return 'image';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-ai rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">
                  Vidget AI Creator
                </h1>
                <p className="text-xs text-text-muted">
                  Gerador de conteúdo com IA
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Zap className="h-4 w-4 text-ai-primary" />
                <span>Powered by AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-ai-primary/10 text-ai-primary rounded-full text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Crie conteúdo incrível com IA
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-text-primary">
                Transforme produtos em 
                <span className="gradient-text"> conteúdo viral</span>
              </h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Selecione produtos do seu e-commerce e gere vídeos e imagens profissionais 
                usando os modelos de IA mais avançados do mercado.
              </p>
            </div>

            {/* Step 1: Product Selection */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-ai-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h3 className="font-semibold text-text-primary">Selecione os produtos</h3>
              </div>
              <ProductSelector
                selectedProducts={selectedProducts}
                onProductSelect={handleProductSelect}
              />
            </div>

            {/* Step 2: Model Selection */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-ai-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h3 className="font-semibold text-text-primary">Escolha o modelo de IA</h3>
              </div>
              <ModelSelector
                selectedModel={selectedModel}
                onModelSelect={handleModelSelect}
              />
            </div>

            {/* Step 3: Prompt Configuration */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-ai-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <h3 className="font-semibold text-text-primary">Configure seu prompt</h3>
              </div>
              <PromptEditor
                prompt={prompt}
                onPromptChange={setPrompt}
                contentType={getContentType()}
              />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <div className="sticky top-24">
              <GenerationResults isGenerating={isGenerating} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-surface-muted/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-text-muted">
            <p className="text-sm">
              © 2024 Vidget AI Creator. Criando o futuro do marketing digital.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
