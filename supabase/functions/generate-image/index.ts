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
    const { prompt, productImage, userPhoto, negativePrompt, category } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('🔍 DEBUGANDO GERAÇÃO DE ROUPA');
    console.log('Categoria recebida:', category);
    console.log('Has product image:', !!productImage);
    console.log('Has user photo:', !!userPhoto);
    console.log('Tamanho do prompt:', prompt?.length || 0);
    console.log('Primeiros 1000 chars do prompt:', prompt?.substring(0, 1000));

    // Determinar o modelo baseado na categoria
    let modelToUse = 'google/gemini-2.5-flash-image-preview';
    
    // Testar modelo alternativo para roupas
    if (category === 'roupas_superiores' || 
        category === 'roupas_inferiores' || 
        category?.includes('vestido') ||
        category === 'Roupas') {
      console.log('🎯 Detectado categoria de roupa, tentando modelo alternativo');
      // Primeiro tentar gemini-2.0-flash-exp
      modelToUse = 'google/gemini-2.0-flash-exp';
    }
    
    console.log('Modelo selecionado:', modelToUse);

    // Construir o conteúdo com imagens
    const content: any[] = [
      {
        type: 'text',
        text: prompt
      }
    ];

    // Adicionar imagem do produto
    if (productImage) {
      content.push({
        type: 'image_url',
        image_url: {
          url: productImage
        }
      });
    }

    // Adicionar foto do usuário se fornecida
    if (userPhoto) {
      content.push({
        type: 'image_url',
        image_url: {
          url: userPhoto
        }
      });
    }

    // Configuração de geração especial para vestidos/roupas
    const requestBody: any = {
      model: modelToUse,
      messages: [
        {
          role: 'user',
          content: content
        }
      ],
      modalities: ['image', 'text']
    };

    // Adicionar configurações específicas para roupas
    if (category === 'roupas_superiores' || 
        category === 'roupas_inferiores' || 
        category?.includes('vestido') ||
        category === 'Roupas') {
      requestBody.temperature = 0.4;
      requestBody.top_p = 0.8;
      console.log('⚙️ Config de geração para roupas:', JSON.stringify({
        temperature: requestBody.temperature,
        top_p: requestBody.top_p
      }));
    }

    console.log('📤 Enviando request para Lovable AI Gateway');
    console.log('Config completa:', JSON.stringify(requestBody, null, 2));

    // Call Lovable AI Gateway for image generation
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      if (response.status === 402) {
        throw new Error('Payment required. Please add credits to your workspace.');
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('📦 Response type:', typeof data);
    console.log('📦 Response keys:', Object.keys(data));
    console.log('📦 Choices:', data.choices?.length);
    console.log('📦 Message keys:', data.choices?.[0]?.message ? Object.keys(data.choices[0].message) : 'N/A');
    console.log('📦 Images na resposta:', data.choices?.[0]?.message?.images?.length);
    console.log('✅ Image generated successfully');

    // Extract the image from the response
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('No image data in response');
    }

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
    console.error('Error in generate-image function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
