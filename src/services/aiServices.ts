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
    // SIMULAÇÃO: Em produção, isso seria uma chamada real para VEO3 API através do backend
    console.log('Gerando vídeo com prompt:', prompt);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Retornar URL de vídeo de exemplo
    const videoUrls = [
      'https://www.w3schools.com/html/mov_bbb.mp4',
      'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    ];
    
    const randomVideo = videoUrls[Math.floor(Math.random() * videoUrls.length)];
    
    return {
      success: true,
      data: {
        url: randomVideo,
        type: 'video',
        thumbnail: `https://picsum.photos/400/300?random=${Date.now()}`
      }
    };
  }

  private static async generateImage(prompt: string): Promise<GenerationResponse> {
    // SIMULAÇÃO: Em produção, isso seria uma chamada real para Imagen API através do backend
    console.log('Gerando imagem com prompt:', prompt);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Gerar URL de imagem única baseada no prompt
    const seed = prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageUrl = `https://picsum.photos/1024/768?random=${seed}`;
    
    return {
      success: true,
      data: {
        url: imageUrl,
        type: 'image'
      }
    };
  }

  static downloadContent(url: string, filename: string): void {
    // Criar um link temporário para download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    
    // Para URLs externas, abrir em nova aba
    if (url.startsWith('http')) {
      link.setAttribute('rel', 'noopener noreferrer');
      window.open(url, '_blank');
    } else {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}