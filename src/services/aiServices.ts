interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
}

interface GenerationRequest {
  prompt: string;
  model: string;
  selectedProducts: Product[];
}

interface GenerationResponse {
  success: boolean;
  data?: {
    url: string;
    type: 'video' | 'image';
    thumbnail?: string;
  };
  error?: string;
}

// Service para integração com Google Gemini APIs
export class AIServices {
  // NOTA: Em produção, as chaves de API devem ficar no backend por segurança
  // As APIs do Google não podem ser chamadas diretamente do frontend devido a CORS
  
  static async generateContent(request: GenerationRequest): Promise<GenerationResponse> {
    const { prompt, model, selectedProducts } = request;
    
    // Preparar o prompt com referência aos produtos selecionados
    const enhancedPrompt = this.enhancePromptWithProducts(prompt, selectedProducts);
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (model === 'veo3') {
        return await this.generateVideo(enhancedPrompt);
      } else if (model === 'nanobanana') {
        return await this.generateImage(enhancedPrompt);
      } else {
        throw new Error('Modelo não suportado');
      }
    } catch (error) {
      console.error('Erro na geração de conteúdo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  private static enhancePromptWithProducts(prompt: string, products: Product[]): string {
    if (products.length === 0) return prompt;
    
    // Substituir [produto] pelo nome do primeiro produto selecionado
    const primaryProduct = products[0];
    let enhancedPrompt = prompt.replace(/\[produto\]/gi, primaryProduct.name.toLowerCase());
    
    // Se não houver [produto] no prompt, adicionar referência ao produto
    if (!prompt.toLowerCase().includes('[produto]') && !prompt.toLowerCase().includes(primaryProduct.name.toLowerCase())) {
      enhancedPrompt = `${prompt}, featuring ${primaryProduct.name}`;
    }
    
    return enhancedPrompt;
  }

  private static async generateVideo(prompt: string): Promise<GenerationResponse> {
    console.log('Gerando vídeo com VEO3:', prompt);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-video`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar vídeo');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao chamar generate-video:', error);
      throw error;
    }
  }

  private static async generateImage(prompt: string): Promise<GenerationResponse> {
    console.log('Gerando imagem com NanoBanana:', prompt);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar imagem');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao chamar generate-image:', error);
      throw error;
    }
  }

  static downloadContent(url: string, filename: string): void {
    // Criar um link temporário para download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Para data URLs (base64), fazer download direto
    if (url.startsWith('data:')) {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (url.startsWith('http')) {
      // Para URLs externas, abrir em nova aba
      link.target = '_blank';
      link.setAttribute('rel', 'noopener noreferrer');
      window.open(url, '_blank');
    }
  }
}