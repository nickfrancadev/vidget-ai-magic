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

    console.log('Generating video with prompt:', prompt);

    // Call Google Veo API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/veo-003:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: prompt
            }
          ],
          parameters: {
            duration: "5s",
            aspectRatio: "16:9",
            safetyFilterLevel: "block_some"
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Veo API error:', response.status, errorText);
      throw new Error(`Veo API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Video generated successfully');

    // The video is returned as base64 in the predictions array
    const videoBase64 = data.predictions[0].bytesBase64Encoded;
    const videoUrl = `data:video/mp4;base64,${videoBase64}`;
    
    // Generate a thumbnail from the first frame (simplified approach)
    const thumbnailUrl = `https://picsum.photos/400/300?random=${Date.now()}`;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          url: videoUrl,
          type: 'video',
          thumbnail: thumbnailUrl
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-video function:', error);
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
