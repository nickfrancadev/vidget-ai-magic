import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, productImage, userPhoto, category } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('🎨 Iniciando geração de imagem');
    console.log('Has product image:', !!productImage);
    console.log('Has user photo:', !!userPhoto);
    console.log('Category:', category);

    // IMPORTANTE: google/gemini-2.5-flash-image-preview é para GERAR imagens, não EDITAR
    // Quando temos userPhoto + productImage, precisamos usar o modelo padrão Gemini que aceita multimodal
    
    let finalPrompt: string;
    let modelToUse: string;
    let content: any;

    if (userPhoto && productImage) {
      // MODO EDIÇÃO: usar gemini-2.5-flash que aceita imagens como input
      modelToUse = 'google/gemini-2.5-flash';
      finalPrompt = `You are an expert at virtual try-on and product visualization. 

I will provide you with two images:
1. A photo of a person
2. A product image (clothing item)

Your task: Describe in extreme detail how the product would look if the person was wearing it. Include:
- Exact product colors, textures, patterns from the reference image
- How it would fit on the person's body type
- Natural lighting and shadows
- Realistic fabric draping and movement
- The person's exact pose, background, and facial features maintained

Product details to preserve:
- ${prompt || 'All visible details, colors, textures, and design elements'}

Be extremely descriptive about colors, materials, fit, and how the clothing would interact with the person's body and the lighting in the scene.`;

      // Construir content multimodal
      content = [
        {
          type: 'text',
          text: finalPrompt
        },
        {
          type: 'image_url',
          image_url: { url: userPhoto }
        },
        {
          type: 'image_url',
          image_url: { url: productImage }
        }
      ];
      
      console.log('📝 Using EDIT mode with gemini-2.5-flash + multimodal input');
    } else {
      // MODO GERAÇÃO: usar image generation model
      modelToUse = 'google/gemini-2.5-flash-image-preview';
      finalPrompt = prompt || 'Generate a professional product image';
      content = finalPrompt; // Apenas texto
      
      console.log('📝 Using GENERATION mode with flash-image-preview + text-only');
    }

    console.log('📦 Model:', modelToUse);
    console.log('📦 Content type:', typeof content === 'string' ? 'text-only' : 'multimodal array');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          {
            role: 'user',
            content: content
          }
        ],
        modalities: modelToUse.includes('image-preview') ? ['image', 'text'] : undefined,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Limite de requisições excedido. Aguarde um momento e tente novamente.');
      }
      if (response.status === 402) {
        throw new Error('Pagamento necessário. Adicione créditos ao seu workspace.');
      }
      
      throw new Error(`Erro ao gerar imagem: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('📦 Response keys:', Object.keys(data));
    console.log('📦 Choices:', data.choices?.length);
    
    // Extrair a imagem gerada
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error('❌ Nenhuma imagem encontrada na resposta');
      console.error('📦 Estrutura completa da resposta:', JSON.stringify(data, null, 2));
      console.error('📦 Message:', JSON.stringify(data.choices?.[0]?.message, null, 2));
      throw new Error('Nenhuma imagem foi gerada pela IA');
    }

    console.log('✅ Imagem gerada com sucesso!');

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          url: imageUrl,
          type: 'image'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro na função generate-image:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
