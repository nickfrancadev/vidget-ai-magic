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

    console.log('🔍 DEBUGANDO GERAÇÃO DE VIRTUAL TRY-ON');
    console.log('Categoria recebida:', category);
    console.log('Has product image:', !!productImage);
    console.log('Has user photo:', !!userPhoto);

    // Para virtual try-on, usamos uma abordagem em 2 etapas:
    // 1. Analisar as imagens com Gemini Flash (multimodal)
    // 2. Gerar a imagem final com Image Preview
    
    if (userPhoto && productImage) {
      console.log('🎨 ETAPA 1: Analisando imagens com Gemini Flash');
      
      // Primeiro, usar Gemini Flash para analisar as imagens e criar descrição detalhada
      const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analise estas duas imagens e crie uma descrição fotorrealista DETALHADA para gerar uma nova imagem.

IMAGEM 1 (pessoa): Descreva em detalhes:
- Características físicas da pessoa (tom de pele, tipo de corpo, postura)
- Posição e pose exata
- Expressão facial
- Cabelo (cor, estilo, comprimento)
- Ambiente e fundo (iluminação, localização, elementos ao redor)
- Roupas atuais (para saber o que substituir)

IMAGEM 2 (produto): Descreva em detalhes:
- Tipo exato de roupa/acessório
- Cor precisa
- Textura e material
- Padrões ou detalhes
- Estilo e corte

SAÍDA REQUERIDA:
Crie um prompt de geração de imagem fotorrealista que combine a PESSOA da imagem 1 com o PRODUTO da imagem 2.
O prompt deve ser extremamente detalhado, focando em:
1. Manter a mesma pessoa, pose, expressão e fundo
2. Substituir apenas a roupa pelo produto
3. Iluminação natural e realista
4. Qualidade fotográfica profissional

Responda APENAS com o prompt de geração, sem explicações adicionais.`
                },
                {
                  type: 'image_url',
                  image_url: { url: userPhoto }
                },
                {
                  type: 'image_url',
                  image_url: { url: productImage }
                }
              ]
            }
          ],
          temperature: 0.3,
        }),
      });

      if (!analysisResponse.ok) {
        const errorText = await analysisResponse.text();
        console.error('❌ Analysis error:', analysisResponse.status, errorText);
        throw new Error(`Erro na análise: ${analysisResponse.status}`);
      }

      const analysisData = await analysisResponse.json();
      const generationPrompt = analysisData.choices?.[0]?.message?.content;

      if (!generationPrompt) {
        throw new Error('Não foi possível gerar descrição');
      }

      console.log('📝 Descrição gerada:', generationPrompt.substring(0, 200) + '...');
      console.log('🎨 ETAPA 2: Gerando imagem final com Image Preview');

      // Agora gerar a imagem usando o prompt detalhado
      const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              content: generationPrompt
            }
          ],
          modalities: ['image', 'text'],
          temperature: 0.4,
        }),
      });

      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error('❌ Image generation error:', imageResponse.status, errorText);
        
        if (imageResponse.status === 429) {
          throw new Error('Limite de requisições excedido. Aguarde um momento e tente novamente.');
        }
        if (imageResponse.status === 402) {
          throw new Error('Pagamento necessário. Adicione créditos ao seu workspace.');
        }
        
        throw new Error(`Erro ao gerar imagem: ${imageResponse.status}`);
      }

      const imageData = await imageResponse.json();
      const generatedImageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!generatedImageUrl) {
        throw new Error('Nenhuma imagem foi gerada');
      }

      console.log('✅ Imagem gerada com sucesso!');

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            url: generatedImageUrl,
            type: 'image'
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fallback: geração simples se não tiver userPhoto
    console.log('🎨 Geração simples (sem virtual try-on)');
    
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
            content: prompt || 'Generate a product image'
          }
        ],
        modalities: ['image', 'text'],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Generation error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Limite de requisições excedido. Aguarde um momento e tente novamente.');
      }
      if (response.status === 402) {
        throw new Error('Pagamento necessário. Adicione créditos ao seu workspace.');
      }
      
      throw new Error(`Erro ao gerar imagem: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('Nenhuma imagem foi gerada');
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
