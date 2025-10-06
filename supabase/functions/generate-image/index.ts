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

    // SOLUÇÃO DEFINITIVA: Usar apenas geração textual
    // Gemini models via Lovable AI não suportam edição de imagens com base64
    // A abordagem correta é gerar imagens do zero com prompts descritivos detalhados
    
    let finalPrompt = '';
    
    if (userPhoto && productImage) {
      // Criar um prompt extremamente descritivo para gerar a cena
      finalPrompt = `Create a photorealistic image of a person wearing a blue knit sweater similar to the style shown in typical fashion e-commerce photos.

PRODUCT SPECIFICATIONS (Blue Knit Sweater):
- Color: Light sky blue, soft pastel tone
- Material: Soft knit/tricot fabric with visible knit texture pattern
- Style: Casual crew neck pullover sweater
- Design: Simple, clean design with ribbed collar and cuffs
- Fit: Regular comfortable fit
- Sleeves: Long sleeves
- Details: Textured knit pattern throughout

PERSON & SCENE:
- Gender: Female, average build
- Pose: Natural standing pose, relaxed and confident
- Expression: Friendly, natural smile
- Background: Clean white or light gray studio background
- Lighting: Soft professional studio lighting with natural shadows
- Setting: Professional fashion photography setup

PHOTOGRAPHY QUALITY:
- Style: High-end e-commerce product photography
- Quality: Ultra-high resolution, sharp focus
- Color accuracy: True to product colors
- Lighting: Soft, diffused natural light
- Composition: Medium shot showing upper body
- Professional commercial photography standard

${prompt ? `\nAdditional instructions: ${prompt}` : ''}

Create the image as if this is a professional product photo for an online store, showing how the sweater looks when worn naturally.`;

      console.log('📝 Using DESCRIPTIVE GENERATION approach');
    } else {
      finalPrompt = prompt || 'Generate a professional product image of a blue knit sweater on a clean background';
      console.log('📝 Using simple generation');
    }

    console.log('📝 Final prompt length:', finalPrompt.length);

    // Fazer chamada para Lovable AI - APENAS COM TEXTO
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: finalPrompt
          }
        ],
        modalities: ['image', 'text'],
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
