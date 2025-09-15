/* 
IMPORTANTE: Integração Real com APIs Google Gemini

Este arquivo demonstra como seria a integração real com as APIs do Google Gemini.
Em produção, as chamadas de API devem ser feitas através de um backend por questões de:

1. SEGURANÇA: API keys não devem ser expostas no frontend
2. CORS: APIs do Google não permitem chamadas diretas do frontend
3. RATE LIMITING: Controle de uso deve ser feito no servidor

IMPLEMENTAÇÃO RECOMENDADA PARA PRODUÇÃO:

1. Backend (Node.js/Express):
```javascript
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Endpoint para geração de vídeo
app.post('/api/generate-video', async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: "veo3" });
    
    const result = await model.generateVideo({
      prompt: prompt,
      config: {
        duration: 15,
        resolution: '1920x1080'
      }
    });
    
    res.json({ 
      success: true, 
      data: {
        url: result.videoUrl,
        thumbnail: result.thumbnailUrl,
        type: 'video'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para geração de imagem
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: "imagen3" });
    
    const result = await model.generateImage({
      prompt: prompt,
      config: {
        resolution: '1024x768',
        style: 'photographic'
      }
    });
    
    res.json({ 
      success: true, 
      data: {
        url: result.imageUrl,
        type: 'image'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

2. Frontend atualizado:
```typescript
private static async generateVideo(prompt: string): Promise<GenerationResponse> {
  const response = await fetch('/api/generate-video', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });
  
  return await response.json();
}

private static async generateImage(prompt: string): Promise<GenerationResponse> {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });
  
  return await response.json();
}
```

3. Variáveis de ambiente (.env):
```
GOOGLE_API_KEY=sua_chave_api_real_aqui
```

PARA TESTAR AGORA:
- O código atual simula as respostas das APIs
- VEO3 retorna vídeos de exemplo
- NanoBanana/Imagen retorna imagens geradas do Picsum
- O download funciona para todos os tipos de mídia

*/

export const PRODUCTION_NOTES = {
  security: "API keys devem ficar no backend",
  cors: "APIs Google não permitem chamadas diretas do frontend",
  architecture: "Use backend como proxy para as APIs",
  testing: "Código atual simula respostas reais"
};