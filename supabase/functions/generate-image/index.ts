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
    const { prompt } = await req.json();
    const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');

    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY not configured');
    }

    console.log('Generating image with Gemini:', prompt);

    // Call Gemini API for image generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent`,
      {
        method: 'POST',
        headers: {
          'x-goog-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Image generated successfully');

    // Extract the image from the response (inline_data)
    const parts = data.candidates[0].content.parts;
    let imageBase64 = null;

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        imageBase64 = part.inlineData.data;
        break;
      }
    }

    if (!imageBase64) {
      throw new Error('No image data in response');
    }

    const imageUrl = `data:image/png;base64,${imageBase64}`;

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
