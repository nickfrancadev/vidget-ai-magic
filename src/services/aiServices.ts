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
  private static readonly GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'; // Em produção, isso viria de variáveis de ambiente
  private static readonly VEO3_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/veo3:generateVideo';
  private static readonly IMAGEN_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/imagen3:generateImage';

  static async generateContent(request: GenerationRequest): Promise<GenerationResponse> {
    const { prompt, model, selectedProducts } = request;
    
    // Preparar o prompt com referência aos produtos selecionados
    const enhancedPrompt = this.enhancePromptWithProducts(prompt, selectedProducts);
    
    try {
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
    // Simulação da chamada para VEO3 API
    // Em produção, você faria a chamada real para a API do Google
    const response = await fetch(this.VEO3_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        model: 'veo3',
        config: {
          duration: 15, // 15 segundos
          resolution: '1920x1080',
          fps: 30
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API VEO3: ${response.statusText}`);
    }

    // Por enquanto, simulamos o retorno com um vídeo de exemplo
    // Em produção, você processaria a resposta real da API
    return {
      success: true,
      data: {
        url: this.generateMockVideoUrl(),
        type: 'video',
        thumbnail: this.generateMockThumbnailUrl()
      }
    };
  }

  private static async generateImage(prompt: string): Promise<GenerationResponse> {
    // Simulação da chamada para Imagen API
    // Em produção, você faria a chamada real para a API do Google
    const response = await fetch(this.IMAGEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        model: 'imagen3',
        config: {
          resolution: '1024x768',
          style: 'photographic'
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API Imagen: ${response.statusText}`);
    }

    // Por enquanto, simulamos o retorno com uma imagem de exemplo
    // Em produção, você processaria a resposta real da API
    return {
      success: true,
      data: {
        url: this.generateMockImageUrl(),
        type: 'image'
      }
    };
  }

  private static generateMockVideoUrl(): string {
    // Em produção, isso retornaria a URL real do vídeo gerado
    const mockVideos = [
      'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      'https://www.w3schools.com/html/mov_bbb.mp4'
    ];
    return mockVideos[Math.floor(Math.random() * mockVideos.length)];
  }

  private static generateMockThumbnailUrl(): string {
    // Em produção, isso seria gerado automaticamente ou fornecido pela API
    return `https://picsum.photos/400/300?random=${Date.now()}`;
  }

  private static generateMockImageUrl(): string {
    // Em produção, isso retornaria a URL real da imagem gerada
    return `https://picsum.photos/1024/768?random=${Date.now()}`;
  }

  static downloadContent(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}