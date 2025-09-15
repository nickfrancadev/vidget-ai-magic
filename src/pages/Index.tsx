import { useState } from 'react';
import { Sparkles, Zap, Video, Image as ImageIcon } from 'lucide-react';
import { ProductSelector } from '@/components/ProductSelector';
import { ModelSelector } from '@/components/ModelSelector';
import { PromptEditor } from '@/components/PromptEditor';
import { GenerationResults } from '@/components/GenerationResults';
import { useToast } from '@/components/ui/use-toast';
import { AIServices } from '@/services/aiServices';
import sampleBag from '@/assets/sample-product-bag.jpg';
import sampleShoes from '@/assets/sample-product-shoes.jpg';
import sampleWatch from '@/assets/sample-product-watch.jpg';

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

interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
}

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Bolsa de Couro Premium',
    image: sampleBag,
    category: 'Acessórios'
  },
  {
    id: '2',
    name: 'Tênis Esportivo Branco',
    image: sampleShoes,
    category: 'Calçados'
  },
  {
    id: '3',
    name: 'Relógio de Luxo',
    image: sampleWatch,
    category: 'Acessórios'
  }
];

const Index = () => {
  const { toast } = useToast();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<GeneratedContent[]>([]);

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

  const handleGenerate = async () => {
    if (!selectedModel || selectedProducts.length === 0 || !prompt.trim()) {
      toast({
        title: "Configuração incompleta",
        description: "Selecione produtos, modelo de IA e escreva um prompt para gerar conteúdo.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Obter produtos selecionados
      const selectedProductsData = sampleProducts.filter(product => 
        selectedProducts.includes(product.id)
      );
      
      // Chamar serviço de IA real
      const response = await AIServices.generateContent({
        prompt,
        model: selectedModel,
        selectedProducts: selectedProductsData
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Falha na geração de conteúdo');
      }
      
      const contentType = response.data.type;
      const modelName = selectedModel === 'veo3' ? 'VEO3' : 
                       selectedModel === 'nanobanana' ? 'NanoBanana' : 'Creative AI';
      
      const newResult: GeneratedContent = {
        id: Date.now().toString(),
        type: contentType,
        url: response.data.url,
        thumbnail: response.data.thumbnail,
        prompt: prompt,
        model: modelName,
        createdAt: new Date().toLocaleString('pt-BR'),
        duration: contentType === 'video' ? '0:15' : undefined,
        resolution: contentType === 'video' ? '1920x1080' : '1024x768'
      };

      setGeneratedResults(prev => [newResult, ...prev]);
      
      toast({
        title: "Conteúdo gerado com sucesso!",
        description: `${contentType === 'video' ? 'Vídeo' : 'Imagem'} criado usando ${modelName}`,
      });
      
    } catch (error) {
      console.error('Erro na geração:', error);
      toast({
        title: "Erro na geração",
        description: error instanceof Error ? error.message : "Houve um problema ao gerar o conteúdo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getContentType = (): 'video' | 'image' => {
    if (selectedModel === 'veo3') return 'video';
    return 'image';
  };

  const canGenerate = selectedProducts.length > 0 && selectedModel && prompt.trim().length > 0;

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
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                canGenerate={canGenerate}
              />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <div className="sticky top-24">
              <GenerationResults 
                isGenerating={isGenerating} 
                results={generatedResults} 
              />
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
