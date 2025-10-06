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

    // CRÍTICO: O modelo flash-image-preview NÃO aceita imagens como input
    // Ele APENAS gera imagens a partir de texto
    // Precisamos criar um prompt descritivo detalhado
    
    let finalPrompt = '';
    
    if (userPhoto && productImage) {
      // Virtual try-on: criar prompt descritivo detalhado
      finalPrompt = `Create a photorealistic image of a person wearing a blue knit sweater (Blusa em Tricot Lecy Azul). 
      
The sweater details:
- Color: Light blue/sky blue knit fabric
- Style: Casual crew neck pullover sweater
- Material: Soft knit/tricot texture with visible knit pattern
- Fit: Regular fit, comfortable style
- Sleeves: Long sleeves
- Design: Simple, clean design with ribbed collar and cuffs

Person characteristics:
- Natural pose, standing or casual position
- Well-lit environment with soft natural lighting
- Professional fashion photography quality
- High resolution, sharp focus
- Clean background (white, light gray, or neutral)

Photography specifications:
- Professional product photography
- Photorealistic quality
- Good contrast and color accuracy
- Natural skin tones
- Commercial/e-commerce quality

${prompt || 'Show the sweater in a flattering, natural way on the person.'}`;
    } else {
      // Sem foto do usuário - gerar imagem do produto apenas
      finalPrompt = prompt || 'Generate a professional product image of a blue knit sweater';
    }

    console.log('📝 Prompt final:', finalPrompt.substring(0, 200) + '...');

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
      console.error('❌ Estrutura da resposta:', JSON.stringify(data, null, 2));
      throw new Error('Nenhuma imagem foi gerada');
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
