import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ProductAnalysis {
  category: string;
  product_name: string;
  key_features: string[];
  primary_color: string;
  material: string;
  style: string;
}

export interface SceneAnalysis {
  number_of_people: number;
  setting: string;
  people_activities: string;
  detected_items_to_replace: Record<string, string>;
  lighting: string;
  mood: string;
}

export interface AutoDetectionResult {
  productAnalysis: ProductAnalysis;
  sceneAnalysis: SceneAnalysis;
  internalPrompt: string;
}

export class SmartProductDetector {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY não configurada');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async analyzeProductImage(imageBase64: string): Promise<ProductAnalysis> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      
      const prompt = `Analyze this product image and return ONLY a JSON object with this exact structure:
{
  "category": "one of: calcados, roupas_superiores, roupas_inferiores, acessorios_cabeca, bolsas, acessorios_pulso, oculos",
  "product_name": "specific product name in Portuguese",
  "key_features": ["feature1", "feature2", "feature3"],
  "primary_color": "main color",
  "material": "main material",
  "style": "style description"
}

Be precise and return ONLY the JSON, no additional text.`;

      const imagePart = {
        inlineData: {
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
          mimeType: "image/jpeg"
        }
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      // Extrair JSON do texto
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta inválida da API');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Erro ao analisar produto:', error);
      throw error;
    }
  }

  async analyzeSceneImage(imageBase64: string): Promise<SceneAnalysis> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      
      const prompt = `Analyze this scene/person image and return ONLY a JSON object with this exact structure:
{
  "number_of_people": 0,
  "setting": "description of the setting/location",
  "people_activities": "what people are doing",
  "detected_items_to_replace": {
    "item_type": "item_description"
  },
  "lighting": "lighting description",
  "mood": "overall mood"
}

For detected_items_to_replace, identify items people are wearing/using that could be replaced (e.g., {"footwear": "flip-flops", "bag": "backpack"}).

Be precise and return ONLY the JSON, no additional text.`;

      const imagePart = {
        inlineData: {
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
          mimeType: "image/jpeg"
        }
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      // Extrair JSON do texto
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta inválida da API');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Erro ao analisar cena:', error);
      throw error;
    }
  }

  async processAutomatically(
    productImage: string,
    sceneImage: string,
    userPrompt?: string
  ): Promise<AutoDetectionResult> {
    try {
      // Analisar produto e cena em paralelo
      const [productAnalysis, sceneAnalysis] = await Promise.all([
        this.analyzeProductImage(productImage),
        this.analyzeSceneImage(sceneImage)
      ]);

      // Gerar prompt interno automático
      const internalPrompt = this.generateInternalPrompt(
        productAnalysis,
        sceneAnalysis,
        userPrompt
      );

      return {
        productAnalysis,
        sceneAnalysis,
        internalPrompt
      };
    } catch (error) {
      console.error('Erro no processamento automático:', error);
      throw error;
    }
  }

  private generateInternalPrompt(
    product: ProductAnalysis,
    scene: SceneAnalysis,
    userPrompt?: string
  ): string {
    const categoryInstructions: Record<string, string> = {
      'calcados': `Replace the footwear on each person's feet with the ${product.product_name}. The shoes MUST be worn ON the feet, not held in hands.`,
      'roupas_superiores': `Replace the upper body clothing with the ${product.product_name}. The garment MUST be worn ON the torso.`,
      'roupas_inferiores': `Replace the lower body clothing with the ${product.product_name}. The garment MUST be worn ON the legs.`,
      'bolsas': `Add the ${product.product_name} being carried by the person (shoulder, hand, or back).`,
      'acessorios_cabeca': `Add the ${product.product_name} ON the person's head.`,
      'acessorios_pulso': `Add the ${product.product_name} ON the person's wrist.`,
      'oculos': `Add the ${product.product_name} ON the person's face.`
    };

    const baseInstruction = categoryInstructions[product.category] || 
      `Integrate the ${product.product_name} naturally into the scene.`;

    const prompt = `${baseInstruction}

PRODUCT DETAILS:
- Name: ${product.product_name}
- Color: ${product.primary_color}
- Material: ${product.material}
- Style: ${product.style}
- Key features: ${product.key_features.join(', ')}

SCENE CONTEXT:
- Setting: ${scene.setting}
- Number of people: ${scene.number_of_people}
- Activity: ${scene.people_activities}
- Lighting: ${scene.lighting}
- Mood: ${scene.mood}
${Object.keys(scene.detected_items_to_replace).length > 0 ? `- Items to replace: ${JSON.stringify(scene.detected_items_to_replace)}` : ''}

${userPrompt ? `USER REQUEST: ${userPrompt}` : ''}

Maintain photorealistic quality, preserve exact product appearance, and ensure natural integration.`;

    return prompt;
  }
}
