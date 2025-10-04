import { PromptOptimizer } from './promptOptimizer';
import { SmartProductDetector } from './smartProductDetector';
import { EnhancedPromptOptimizer } from './promptOptimizerV2';

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
  userPhoto?: File | null;
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
  private static promptOptimizer = new PromptOptimizer();
  
  // Instruções críticas para preservação de produto em imagens (DEPRECATED - usando PromptOptimizer)
  private static readonly IMAGE_CRITICAL_INSTRUCTIONS = `
CRITICAL PRESERVATION INSTRUCTIONS:
Using the provided product image as the PRIMARY reference, you MUST:

1. PRODUCT FIDELITY (ABSOLUTE PRIORITY):
   - Preserve EXACTLY the product's shape, dimensions, and proportions from the reference image
   - Maintain ALL visible details: textures, patterns, logos, stitching, materials, hardware, zippers, buttons
   - Keep the EXACT color palette, including subtle color variations and gradients
   - Reproduce any branding, labels, or distinctive marks with 100% accuracy
   - Do NOT alter, simplify, or stylize the product in any way
   - The product must be immediately recognizable as the exact same item from the reference

2. LIGHTING PRESERVATION:
   - Analyze and replicate the lighting characteristics from the reference image:
     * Light source direction and intensity
     * Shadow depth and softness
     * Highlight positions and intensity
     * Overall brightness and contrast levels
   - Maintain the same lighting quality (natural/artificial, warm/cool tone)
   - Preserve specular highlights on reflective surfaces
   - Keep shadow patterns consistent with the original lighting setup

3. MATERIAL ACCURACY:
   - Leather: grain texture, natural imperfections, sheen level
   - Fabric: weave pattern, thread density, material drape
   - Metal: reflectivity, finish (matte/glossy), oxidation or patina
   - Plastic: transparency level, surface texture, color depth
   - Maintain the exact material properties visible in the reference

4. PHOTOREALISTIC QUALITY:
   - Ultra-high resolution product photography standard
   - Professional e-commerce quality
   - Crisp focus on the product with accurate depth of field
   - Natural color grading matching the reference image
   - No artificial enhancement or beautification of the product itself

5. CONTEXT INTEGRATION:
   - Integrate the preserved product naturally into this new context
   - Adjust ONLY the background/environment and person/model (if applicable)
   - Ensure the product interacts realistically with the new scene (shadows, reflections, scale)
   - Maintain physical plausibility (gravity, physics, proportions)

6. TECHNICAL SPECIFICATIONS:
   - Color space: sRGB
   - Lighting consistency: match reference image's color temperature
   - Detail level: e-commerce/editorial photography standard
   - No filters, no artistic interpretation of the product itself

OUTPUT REQUIREMENTS:
- The product must appear as if it was photographed in the new scene with the SAME camera and lighting setup as the reference
- Zero deviation from the product's original appearance
- Professional commercial photography quality
- Photorealistic integration of product into new context

Remember: The reference product is SACRED. Change the world around it, but NOT the product itself.
`;

  // Instruções críticas para preservação de produto em vídeos
  private static readonly VIDEO_CRITICAL_INSTRUCTIONS = `
CRITICAL PRESERVATION INSTRUCTIONS FOR VIDEO:
Using the provided product image as the PRIMARY reference, you MUST:

1. PRODUCT FIDELITY (ABSOLUTE PRIORITY):
   - The product MUST maintain EXACT appearance throughout ALL frames:
     * Exact shape, dimensions, proportions
     * All visible details: textures, patterns, logos, stitching, materials
     * Exact color palette and color variations
     * All branding and distinctive marks with 100% accuracy
   - Product consistency is MORE important than scene variety
   - The product should be immediately recognizable in every frame
   - Do NOT alter, simplify, or stylize the product at any moment

2. LIGHTING PRESERVATION THROUGHOUT VIDEO:
   - Replicate the lighting characteristics from the reference image:
     * Light source direction and intensity
     * Shadow behavior and softness
     * Highlight consistency
     * Overall brightness matching reference
   - Maintain consistent lighting as the product moves through the scene
   - Natural light adaptation only (if moving from shade to sun, etc.)
   - Preserve the original color temperature and lighting mood

3. MOTION & ANIMATION:
   - Natural, smooth movement appropriate to the scene
   - Realistic physics (gravity, momentum, fabric drape)
   - If product is carried/worn: natural interaction with person
   - If product moves: maintain structural integrity and material properties
   - Camera movement should complement, not distract from product

4. MATERIAL BEHAVIOR IN MOTION:
   - Leather: natural flexibility, creasing behavior
   - Fabric: realistic draping, wrinkle patterns, weight
   - Metal: consistent reflectivity, rigid movement
   - Straps/handles: natural hanging, swinging physics
   - Materials must behave realistically as product moves

5. SCENE INTEGRATION:
   - Integrate the preserved product naturally into the animated scene
   - Adjust ONLY the background/environment and actors
   - Realistic interaction: product shadows, reflections, occlusions
   - Maintain physical plausibility throughout motion
   - Scale consistency across all frames

6. TECHNICAL SPECIFICATIONS:
   - 8 seconds duration, 720p, 24fps
   - Consistent lighting across all frames
   - No sudden product appearance changes
   - Smooth, professional cinematography
   - E-commerce/commercial video quality
   - Natural ambient audio if applicable

7. CINEMATOGRAPHY GUIDELINES:
   - Professional commercial video quality
   - Product should be clearly visible in majority of frames
   - Smooth camera movements (no jerky motion)
   - Appropriate depth of field keeping product in focus
   - Natural color grading matching reference image

OUTPUT REQUIREMENTS:
- Every frame must show the SAME product from the reference
- Product appearance consistency is the #1 priority
- Cinematic quality with natural movement
- Zero artistic interpretation of the product itself
- The product must appear as if filmed in the scene with the SAME lighting as reference

Remember: The reference product is SACRED throughout the entire video. Animate the world around it, maintain the product's exact appearance in every single frame.
`;
  
  static async generateContent(request: GenerationRequest): Promise<GenerationResponse> {
    const { prompt, model, selectedProducts, userPhoto } = request;
    
    console.log('🔍 AIServices - selectedProducts recebido:', selectedProducts);
    console.log('🔍 AIServices - model:', model);
    
    // Preparar o prompt com referência aos produtos selecionados e instruções críticas
    const enhancedPrompt = this.enhancePromptWithProducts(prompt, selectedProducts, model);
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (model === 'veo3') {
        return await this.generateVideo(enhancedPrompt);
      } else if (model === 'nanobanana') {
        // Validar se há produtos selecionados
        if (!selectedProducts || selectedProducts.length === 0) {
          throw new Error('Selecione pelo menos um produto para gerar imagem');
        }
        
        // Converter imagem do produto para base64
        const primaryProduct = selectedProducts[0];
        if (!primaryProduct || !primaryProduct.image) {
          throw new Error('Produto selecionado não possui imagem válida');
        }
        
        const productImageBase64 = await this.imageToBase64(primaryProduct.image);
        
        // Converter foto do usuário para base64, se fornecida
        let userPhotoBase64: string | undefined;
        if (userPhoto) {
          userPhotoBase64 = await this.imageToBase64(userPhoto);
        }
        
        return await this.generateImage(enhancedPrompt, productImageBase64, userPhotoBase64);
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

  private static enhancePromptWithProducts(prompt: string, products: Product[], model: string): string {
    if (products.length === 0) return prompt;
    
    const primaryProduct = products[0];
    
    // Substituir [produto] pelo nome do primeiro produto selecionado
    let userPromptText = prompt.replace(/\[produto\]/gi, primaryProduct.name.toLowerCase());
    
    // Se não houver [produto] no prompt, adicionar referência ao produto
    if (!prompt.toLowerCase().includes('[produto]') && !prompt.toLowerCase().includes(primaryProduct.name.toLowerCase())) {
      userPromptText = `${prompt}, featuring ${primaryProduct.name}`;
    }
    
    // Usar o PromptOptimizer para gerar instruções específicas por categoria
    const contentType = model === 'veo3' ? 'video' : 'image';
    const optimization = this.promptOptimizer.optimize(
      userPromptText,
      primaryProduct.name,
      contentType
    );
    
    console.log('Categoria detectada:', optimization.detectedCategory);
    console.log('Regra anatômica:', optimization.anatomicRule);
    
    return optimization.optimizedPrompt;
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

  private static async generateImage(
    prompt: string, 
    productImage: string,
    userPhoto?: string
  ): Promise<GenerationResponse> {
    console.log('Gerando imagem com NanoBanana');
    
    try {
      // Detecção automática e otimização de prompt
      let finalPrompt = prompt;
      let negativePrompt = '';
      
      try {
        if (userPhoto && import.meta.env.VITE_GEMINI_API_KEY) {
          const detector = new SmartProductDetector();
          const detection = await detector.processAutomatically(
            productImage,
            userPhoto,
            prompt
          );

          console.log('🔍 Produto detectado:', detection.productAnalysis.product_name);
          console.log('📦 Categoria:', detection.productAnalysis.category);

          const optimizer = new EnhancedPromptOptimizer();
          const optimized = optimizer.optimize(
            detection.internalPrompt,
            'image'
          );

          console.log('📝 Prompt otimizado gerado');
          console.log('🚫 Negative prompt:', optimized.negativePrompt);

          finalPrompt = optimized.optimizedPrompt;
          negativePrompt = optimized.negativePrompt;
        }
      } catch (detectionError) {
        console.warn('Falha na detecção automática, usando prompt original:', detectionError);
        // Fallback: usar prompt original
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            prompt: finalPrompt,
            productImage,
            userPhoto,
            negativePrompt
          })
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

  private static async imageToBase64(imageSource: string | File): Promise<string> {
    if (typeof imageSource === 'string') {
      // Se for uma URL de imagem do projeto, buscar e converter
      const response = await fetch(imageSource);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      // Se for um File object
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageSource);
      });
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