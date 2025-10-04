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
    console.log('Primeiros 500 chars do prompt:', prompt?.substring(0, 500));

    // Determinar o modelo baseado na categoria
    let modelToUse = 'google/gemini-2.5-flash-image-preview';
    
    // Testar modelo alternativo para roupas
    if (category === 'roupas_superiores' || 
        category === 'roupas_inferiores' || 
        category?.includes('vestido') ||
        category === 'Roupas') {
      console.log('🎯 Detectado categoria de roupa, usando modelo alternativo');
      modelToUse = 'google/gemini-2.0-flash-exp';
    }
    
    console.log('📤 Modelo selecionado:', modelToUse);

    // Se temos userPhoto, usar abordagem de EDIÇÃO de imagem
    // em vez de geração, pois queremos editar a foto aplicando o produto
    if (userPhoto && productImage) {
      console.log('🎨 Usando abordagem de EDIÇÃO com 2 imagens');
      
      // Para edição, enviamos a imagem do usuário como imagem base
      // e incluímos a imagem do produto no prompt como referência
      const editContent = [
        {
          type: 'text',
          text: `CRITICAL EDITING TASK: Apply the clothing/accessory product from the second image onto THE SAME PERSON shown in the first image.

CRITICAL RULES - MUST FOLLOW:
1. SINGLE PERSON ONLY: Keep ONLY the person from the first image. DO NOT add, duplicate, or create any additional people.
2. EXACT PERSON PRESERVATION: The person's face, body, pose, and position must remain EXACTLY as shown in the first image.
3. PRODUCT APPLICATION: Replace ONLY the corresponding clothing item with the product from the second image.
4. BACKGROUND PRESERVATION: Keep the entire background, environment, and all other elements from the first image unchanged.

FORBIDDEN ACTIONS:
❌ DO NOT add any extra people to the scene
❌ DO NOT duplicate the person
❌ DO NOT create a second person
❌ DO NOT modify the person's face, hair, or body structure
❌ DO NOT change the background or environment

REQUIRED OUTPUT:
✓ Same exact person from first image
✓ Same pose and position
✓ Same background and environment
✓ Only the clothing item replaced with the product
✓ Natural, photorealistic integration
✓ Proper lighting and shadows matching the original scene

${prompt || 'Apply the product naturally on the person.'}`
        },
        {
          type: 'image_url',
          image_url: {
            url: userPhoto  // Foto do usuário é a base para edição
          }
        },
        {
          type: 'image_url',
          image_url: {
            url: productImage  // Produto como referência
          }
        }
      ];

      const editResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              content: editContent
            }
          ],
          modalities: ['image', 'text'],
          temperature: 0.4,
          top_p: 0.8
        }),
      });

      if (!editResponse.ok) {
        const errorText = await editResponse.text();
        console.error('❌ Lovable AI error:', editResponse.status, errorText);
        
        if (editResponse.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        if (editResponse.status === 402) {
          throw new Error('Payment required. Please add credits to your workspace.');
        }
        
        throw new Error(`AI Gateway error: ${editResponse.status}`);
      }

      const editData = await editResponse.json();
      
      console.log('📦 Edit Response type:', typeof editData);
      console.log('📦 Edit Response keys:', Object.keys(editData));
      console.log('📦 Edit Choices:', editData.choices?.length);
      console.log('📦 Edit Images na resposta:', editData.choices?.[0]?.message?.images?.length);
      console.log('✅ Image edited successfully');

      // Extract the image from the response
      const editedImageUrl = editData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!editedImageUrl) {
        throw new Error('No image data in edit response');
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            url: editedImageUrl,
            type: 'image'
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fallback: geração normal se não tiver userPhoto
    console.log('🎨 Usando geração de imagem simples (sem userPhoto)');
    
    const content: any[] = [
      {
        type: 'text',
        text: prompt
      }
    ];

    if (productImage) {
      content.push({
        type: 'image_url',
        image_url: {
          url: productImage
        }
      });
    }

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
        modalities: ['image', 'text'],
        temperature: 0.4,
        top_p: 0.8
      }),
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
