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
    
    console.log('Video generation requested:', prompt);

    // NOTA: O Lovable AI Gateway não suporta geração de vídeo ainda.
    // VEO3 requer operações longas (10+ minutos) que não são ideais para web apps interativas.
    // Retornando uma simulação por enquanto.
    
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simular processamento

    // Usar vídeos de exemplo de alta qualidade
    const sampleVideos = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://www.w3schools.com/html/mov_bbb.mp4',
      'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4'
    ];
    
    const randomVideo = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          url: randomVideo,
          type: 'video',
          thumbnail: `https://picsum.photos/400/300?random=${Date.now()}`
        },
        note: 'VEO3 video generation requires long-running operations (10+ minutes). Using sample video for demo.'
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
