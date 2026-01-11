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

    // Preparar prompt baseado na situação - enfatizar FOTOREALISMO + PRESERVAÇÃO TOTAL DA PESSOA (sem distorção)
    const textPrompt = userPhoto && productImage
      ? `PHOTOREALISTIC VIRTUAL TRY-ON - PHOTO EDITING TASK:

CRITICAL: This must look like a REAL PHOTOGRAPH, NOT a 3D render, CGI, or digital mockup!

Edit this person's photograph to show them actually wearing/using the product from the reference image.

NON-NEGOTIABLE IDENTITY PRESERVATION:
- DO NOT change the person in ANY way: no face reshaping, no eye/nose/mouth/jaw changes, no body reshaping, no beautification
- DO NOT warp/stretch/distort the original photo geometry
- Keep the exact pose, expression, hair, skin tone, tattoos, and background
- Keep the SAME orientation as the uploaded photo (DO NOT rotate 90°, do NOT change aspect ratio)

CRITICAL FOR HEADWEAR (caps, hats, beanies):
- The cap/hat MUST follow the EXACT 3D angle and tilt of the person's head
- If head is tilted, the cap tilts the same way
- If head is turned to the side, the cap follows that rotation
- The cap must be FITTED/SNUG on the head, NOT floating or loosely placed on top
- The cap should WRAP around the skull contour, conforming to the head's 3D shape
- The brim direction must align with the face direction
- Add shadow from cap brim onto forehead/face

REQUIREMENTS FOR PHOTOREALISM:
- Match the exact lighting direction and color temperature of the original photo
- Add realistic shadows where the product meets the person
- Integrate naturally with the person's hair/skin and existing clothing
- Preserve the person's exact features and proportions
- The product should appear to have weight and rest naturally on the body

AVOID: 3D mockup look, CGI appearance, synthetic/plastic textures, floating products, missing shadows, cap not following head angle

${prompt || 'Apply the product naturally to the person while maintaining strict identity preservation and photorealistic quality.'}`
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
        temperature: 0.4,
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
