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

    // Preparar prompt baseado na situação
    const textPrompt = userPhoto && productImage
      ? `${prompt || 'Replace the clothing item on the person with the product shown in the reference image. Maintain photorealistic quality, natural appearance, exact pose, facial features, background, and body position.'}`
      : prompt || 'Generate a professional product image';

    console.log('📝 Prompt de texto:', textPrompt);

    // Construir content array multimodal
    const content: any[] = [
      {
        type: 'text',
        text: textPrompt
      }
    ];

    // Adicionar foto do usuário se disponível
    if (userPhoto) {
      content.push({
        type: 'image_url',
        image_url: {
          url: userPhoto // Já vem em base64 do frontend
        }
      });
      console.log('📷 User photo added to content');
    }

    // Adicionar imagem do produto se disponível
    if (productImage) {
      content.push({
        type: 'image_url',
        image_url: {
          url: productImage // Já vem em base64 do frontend
        }
      });
      console.log('👕 Product image added to content');
    }

    console.log('📦 Total items in content:', content.length);
    console.log('📦 Content types:', content.map(c => c.type).join(', '));

    // Chamar Lovable AI com conteúdo multimodal
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
            content: content // Array multimodal com texto + imagens
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
