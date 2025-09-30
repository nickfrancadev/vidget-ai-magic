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

    console.log('Starting video generation with Veo 3:', prompt);

    // Call Veo 3 API (long-running operation)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/veo-3.0-generate-001:predictLongRunning`,
      {
        method: 'POST',
        headers: {
          'x-goog-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{
            prompt: prompt
          }]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Veo API error:', response.status, errorText);
      throw new Error(`Veo API error: ${response.status}`);
    }

    const operationData = await response.json();
    const operationName = operationData.name;
    console.log('Video generation started, operation:', operationName);

    // Poll the operation status
    let isDone = false;
    let videoUri = null;
    const maxAttempts = 60; // 10 minutes max (10s intervals)
    let attempts = 0;

    while (!isDone && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      attempts++;

      const statusResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${operationName}`,
        {
          headers: {
            'x-goog-api-key': apiKey,
          },
        }
      );

      const statusData = await statusResponse.json();
      isDone = statusData.done === true;

      if (isDone) {
        videoUri = statusData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
        console.log('Video generation complete, URI:', videoUri);
      } else {
        console.log(`Polling attempt ${attempts}/${maxAttempts}...`);
      }
    }

    if (!videoUri) {
      throw new Error('Video generation timeout or failed');
    }

    // Download the video
    const videoResponse = await fetch(videoUri, {
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    const videoBlob = await videoResponse.arrayBuffer();
    const videoBase64 = btoa(String.fromCharCode(...new Uint8Array(videoBlob)));
    const videoUrl = `data:video/mp4;base64,${videoBase64}`;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          url: videoUrl,
          type: 'video',
          thumbnail: `https://picsum.photos/400/300?random=${Date.now()}`
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
