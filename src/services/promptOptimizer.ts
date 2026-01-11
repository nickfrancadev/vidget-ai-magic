interface ProductCategory {
  keywords: string[];
  anatomicRule: string;
  positioningInstructions: string;
}

interface ProductCategories {
  [key: string]: ProductCategory;
}

interface OptimizationResult {
  optimizedPrompt: string;
  negativePrompt: string;
  detectedCategory: string;
  anatomicRule: string;
  metadata: {
    originalPrompt: string;
    contentType: string;
    hasCategoryContext: boolean;
  };
}

export class PromptOptimizer {
  private productCategories: ProductCategories = {
    'calcados': {
      keywords: ['tênis', 'tenis', 'sapato', 'bota', 'sandália', 'sandalia', 'chinelo', 'sapatilha', 'mocassim', 'sneaker', 'shoe'],
      anatomicRule: 'FEET',
      positioningInstructions: `
CALÇADOS - POSICIONAMENTO OBRIGATÓRIO NOS PÉS:
- O produto DEVE estar CALÇADO nos pés da pessoa
- SUBSTITUA completamente o calçado original visível nos pés
- Cada pé deve ter um calçado do par
- Os calçados devem estar:
  * Encaixados corretamente nos pés
  * Com cadarços/fechos na posição real de uso
  * Tocando o chão de forma natural
  * Respeitando a anatomia do pé (dedos na frente, calcanhar atrás)
- NUNCA coloque calçados flutuando, ao lado, entre pessoas, ou no chão
- NUNCA mostre calçados sem estar nos pés
- A pessoa deve parecer estar usando/calçando o produto naturalmente
- Se houver chinelos/calçados originais, REMOVA-OS completamente e coloque o produto nos pés
      `
    },
    'roupas_superiores': {
      keywords: ['camisa', 'camiseta', 'blusa', 'suéter', 'sweater', 'jaqueta', 'casaco', 'blazer', 'colete', 'shirt', 't-shirt', 'jacket'],
      anatomicRule: 'TORSO',
      positioningInstructions: `
ROUPAS SUPERIORES - POSICIONAMENTO OBRIGATÓRIO NO TRONCO:
- O produto DEVE estar VESTIDO no tronco da pessoa
- SUBSTITUA completamente a roupa superior original
- A peça deve:
  * Cobrir o tronco adequadamente
  * Gola/decote na posição correta do pescoço
  * Mangas (se houver) nos braços
  * Caimento natural seguindo a forma do corpo
  * Dobras e vincos realistas do tecido
- NUNCA mostre a roupa flutuando ou ao lado da pessoa
- A pessoa deve parecer estar vestindo o produto naturalmente
      `
    },
    'roupas_inferiores': {
      keywords: ['calça', 'short', 'bermuda', 'saia', 'legging', 'jeans', 'pants'],
      anatomicRule: 'LEGS',
      positioningInstructions: `
ROUPAS INFERIORES - POSICIONAMENTO OBRIGATÓRIO NAS PERNAS:
- O produto DEVE estar VESTIDO nas pernas/quadril da pessoa
- SUBSTITUA completamente a roupa inferior original
- A peça deve:
  * Cintura na altura do quadril
  * Cobrir as pernas apropriadamente
  * Caimento natural seguindo a forma das pernas
  * Dobras realistas do tecido ao sentar/andar
- NUNCA mostre a roupa flutuando ou ao lado da pessoa
- A pessoa deve parecer estar vestindo o produto naturalmente
      `
    },
    'acessorios_cabeca': {
      keywords: ['boné', 'bone', 'chapéu', 'chapeu', 'gorro', 'touca', 'viseira', 'turbante', 'cap', 'hat'],
      anatomicRule: 'HEAD',
      positioningInstructions: `
ACESSÓRIOS DE CABEÇA - ENCAIXE PERFEITO (NÃO MOCKUP 3D):
- OBJETIVO: Editar a foto para que pareça uma FOTO REAL da pessoa usando o boné/chapéu
- O resultado deve parecer uma FOTOGRAFIA GENUÍNA, não um render 3D ou mockup digital

CRÍTICO - ÂNGULO E ENCAIXE:
- O boné DEVE seguir EXATAMENTE o ângulo/inclinação 3D da cabeça da pessoa
- Se a cabeça está inclinada para a esquerda, o boné inclina para a esquerda
- Se a cabeça está virada para o lado, o boné segue essa rotação
- O boné deve estar ENCAIXADO/JUSTO na cabeça, não solto ou flutuando por cima
- A aba frontal deve alinhar com a direção do rosto

CONFORMAÇÃO À CABEÇA:
- O boné deve ENVOLVER o contorno do crânio, não sentar plano acima dele
- Ajuste à curvatura 3D da cabeça
- Cabelo visível nas bordas, naturalmente sob/ao redor do boné

SOMBRAS OBRIGATÓRIAS:
- Sombra da aba do boné no rosto/testa (seguindo direção de luz)
- Oclusão ambiente onde o boné encontra o cabelo/cabeça
- Iluminação e temperatura de cor devem corresponder à foto original

PROIBIDO:
- Boné sentado plano/horizontal quando cabeça está inclinada
- Boné flutuando acima da cabeça sem contato
- Ângulo do boné não correspondendo ao ângulo da cabeça
- Aparência de mockup 3D, CGI ou render digital
      `
    },
    'bolsas': {
      keywords: ['bolsa', 'mochila', 'pochete', 'carteira grande', 'shoulder bag', 'tote', 'backpack', 'bag'],
      anatomicRule: 'CARRY',
      positioningInstructions: `
BOLSAS - POSICIONAMENTO NATURAL SENDO CARREGADA:
- O produto DEVE estar sendo CARREGADO pela pessoa
- Posicionamento pode ser:
  * No ombro (com alça pendurada)
  * Na mão (sendo segurada)
  * Cruzada no corpo (crossbody)
  * Nas costas (mochila)
- Alças devem:
  * Estar em contato com o corpo da pessoa
  * Ter tensão natural do peso
  * Seguir a física (gravidade, apoio)
- NUNCA mostre a bolsa flutuando ou no chão
- A pessoa deve estar segurando/usando de forma natural e confortável
      `
    },
    'acessorios_pulso': {
      keywords: ['relógio', 'relogio', 'pulseira', 'bracelete', 'smartwatch', 'watch'],
      anatomicRule: 'WRIST',
      positioningInstructions: `
ACESSÓRIOS DE PULSO - POSICIONAMENTO NO PULSO:
- O produto DEVE estar NO PULSO da pessoa
- Posicionamento:
  * Ajustado ao redor do pulso
  * Logo acima do osso do pulso
  * Visível e claro
  * Tamanho proporcional ao pulso
- NUNCA mostre flutuando ou na mão
- Deve parecer estar sendo usado naturalmente
      `
    },
    'oculos': {
      keywords: ['óculos', 'oculos', 'óculos de sol', 'oculos de sol', 'óculos de grau', 'sunglasses', 'glasses'],
      anatomicRule: 'FACE',
      positioningInstructions: `
ÓCULOS - POSICIONAMENTO NO ROSTO:
- O produto DEVE estar NO ROSTO da pessoa
- Posicionamento:
  * Hastes atrás das orelhas
  * Apoio no nariz
  * Lentes na frente dos olhos
  * Alinhamento horizontal correto
- NUNCA mostre flutuando ou na mão
- Deve parecer estar sendo usado naturalmente
      `
    },
    'joias': {
      keywords: ['colar', 'brinco', 'anel', 'pingente', 'corrente', 'necklace', 'earring', 'ring'],
      anatomicRule: 'JEWELRY',
      positioningInstructions: `
JOIAS - POSICIONAMENTO ANATÔMICO CORRETO:
- Colar/corrente: NO PESCOÇO
- Brinco: NAS ORELHAS (um em cada)
- Anel: NO DEDO especificado
- Pingente: PENDURADO no pescoço
- Deve estar fixado naturalmente no corpo
- NUNCA flutuando ou separado da pessoa
      `
    }
  };

  detectProductCategory(productName: string, userPrompt: string): { category: string; anatomicRule: string; instructions: string } | null {
    const combinedText = `${productName} ${userPrompt}`.toLowerCase();
    
    for (const [category, config] of Object.entries(this.productCategories)) {
      for (const keyword of config.keywords) {
        if (combinedText.includes(keyword.toLowerCase())) {
          return {
            category,
            anatomicRule: config.anatomicRule,
            instructions: config.positioningInstructions
          };
        }
      }
    }
    
    return null;
  }

  optimizeImagePrompt(userPrompt: string, productName: string): string {
    const productCategory = this.detectProductCategory(productName, userPrompt);
    
    let categoryInstructions = '';
    if (productCategory) {
      categoryInstructions = `
${productCategory.instructions}

CRITICAL: This is a ${productCategory.anatomicRule} product. Follow the anatomical positioning rules above STRICTLY.
`;
    }

    return `
CRITICAL PRESERVATION INSTRUCTIONS:
Using the provided product image as the PRIMARY reference, you MUST:

1. PRODUCT FIDELITY (ABSOLUTE PRIORITY):
   - Preserve EXACTLY the product's shape, dimensions, and proportions from the reference image
   - Maintain ALL visible details: textures, patterns, logos, stitching, materials, hardware, zippers, buttons
   - Keep the EXACT color palette, including subtle color variations and gradients
   - Reproduce any branding, labels, or distinctive marks with 100% accuracy
   - Do NOT alter, simplify, or stylize the product in any way
   - The product must be immediately recognizable as the exact same item from the reference

${categoryInstructions}

2. ANATOMICAL INTEGRATION (CRITICAL):
   - The product MUST be positioned EXACTLY where it belongs on the human body
   - REPLACE the original item in the reference photo completely
   - Ensure natural contact between product and body
   - Follow gravity and physics
   - Show realistic interaction (weight, pressure, draping)
   - NEVER show the product floating, hovering, or disconnected from the person
   - The product must look like it's ACTUALLY being worn/used/carried

3. LIGHTING PRESERVATION:
   - Analyze and replicate the lighting characteristics from the reference image:
     * Light source direction and intensity
     * Shadow depth and softness on the product
     * Highlight positions and intensity
     * Overall brightness and contrast levels
   - Product shadows must fall naturally on the person and ground
   - Maintain the same lighting quality (natural/artificial, warm/cool tone)
   - Preserve specular highlights on reflective surfaces

4. MATERIAL ACCURACY:
   - Leather: grain texture, natural imperfections, sheen level, how it bends
   - Fabric: weave pattern, thread density, material drape, wrinkles
   - Metal: reflectivity, finish (matte/glossy), how it catches light
   - Rubber/Sole: texture, grip pattern, wear marks if realistic
   - Canvas: texture, structure, how it holds shape
   - Maintain the exact material properties visible in the reference

5. PHOTOREALISTIC QUALITY:
   - Ultra-high resolution product photography standard
   - Professional e-commerce quality
   - Crisp focus on the product
   - Natural color grading matching the reference image
   - Show product in actual use context

6. SCENE INTEGRATION:
   - User request: ${userPrompt}
   - Integrate the preserved product naturally into the scene
   - Product must interact realistically with the person and environment
   - Maintain physical plausibility (gravity, physics, proportions, anatomy)
   - Product should show appropriate wear/stress (fabric tension, creases where natural)

 7. PERSON/BODY INTEGRATION (ABSOLUTELY CRITICAL):
    - Keep the person's identity EXACTLY the same
    - DO NOT change facial features (eyes, nose, mouth, jawline), body shape, weight, age, skin texture, hairline, tattoos, or any physical characteristics
    - DO NOT beautify/retouch the person (no skin smoothing, no "make prettier", no reshaping)
    - DO NOT warp/stretch/distort the original photo geometry
    - ONLY replace/modify the specific area where the product goes
    - Maintain the same camera perspective and image orientation (do NOT rotate the photo)
    - Body position should make sense for using/wearing the product

8. TECHNICAL SPECIFICATIONS:
   - Color space: sRGB
   - Lighting consistency: match reference image's color temperature
   - Detail level: e-commerce/editorial photography standard
   - No filters, no artistic interpretation of the product itself
   - Product must be clearly visible and in focus

FORBIDDEN ACTIONS:
❌ NEVER place footwear anywhere except ON THE FEET
❌ NEVER show shoes/sneakers floating, between people, on furniture, or in hands
❌ NEVER place clothing items floating in space
❌ NEVER show products disconnected from the person's body
❌ NEVER alter the product's original appearance from the reference
❌ NEVER simplify or stylize the product

OUTPUT REQUIREMENTS:
- The product must appear as if the person is ACTUALLY wearing/using it in this exact moment
- Perfect anatomical positioning following the category rules
- Zero deviation from the product's original appearance
- Professional commercial photography quality
- Photorealistic integration of product into the scene

Remember: The reference product is SACRED. The product must be placed EXACTLY where it belongs on the human body according to its category. A shoe MUST be on a foot, a shirt MUST be on the torso, etc.
`.trim();
  }

  optimizeVideoPrompt(userPrompt: string, productName: string): string {
    const productCategory = this.detectProductCategory(productName, userPrompt);
    
    let categoryInstructions = '';
    if (productCategory) {
      categoryInstructions = `
${productCategory.instructions}

CRITICAL: This is a ${productCategory.anatomicRule} product. Follow the anatomical positioning rules above STRICTLY in EVERY FRAME.
`;
    }

    return `
CRITICAL PRESERVATION INSTRUCTIONS FOR VIDEO:
Using the provided product image as the PRIMARY reference, you MUST:

1. PRODUCT FIDELITY (ABSOLUTE PRIORITY - ALL FRAMES):
   - The product MUST maintain EXACT appearance throughout ALL frames:
     * Exact shape, dimensions, proportions
     * All visible details: textures, patterns, logos, stitching, materials
     * Exact color palette and color variations
     * All branding and distinctive marks with 100% accuracy
   - Product consistency is MORE important than scene variety
   - The product should be immediately recognizable in every frame

${categoryInstructions}

2. ANATOMICAL INTEGRATION THROUGHOUT VIDEO (CRITICAL):
   - The product MUST remain positioned EXACTLY where it belongs on the body in ALL frames
   - NEVER show the product detaching, floating, or moving unnaturally
   - Product must move WITH the person naturally
   - Show realistic physics:
     * Footwear: stays on feet, flexes with walking
     * Clothing: moves with body, natural fabric dynamics
     * Bags: sway with movement, straps stay on shoulder/hand
     * Accessories: stay in position but can shift slightly naturally
   - Maintain constant contact between product and body

3. LIGHTING PRESERVATION THROUGHOUT VIDEO:
   - Replicate the lighting characteristics from the reference image
   - Maintain consistent lighting as the product moves through the scene
   - Product shadows should move naturally with the person
   - Preserve the original color temperature and lighting mood

4. MOTION & ANIMATION:
   - User request: ${userPrompt}
   - Natural, smooth movement appropriate to the scene
   - Realistic physics (gravity, momentum, fabric drape)
   - Product moves naturally with the person's body
   - Camera movement should show the product clearly

5. MATERIAL BEHAVIOR IN MOTION:
   - Leather: natural flexibility, creasing with movement
   - Fabric: realistic draping, wrinkle patterns, weight
   - Rubber soles: flex with walking, realistic grip
   - Straps/laces: natural movement, tension
   - Materials must behave realistically as product moves with the person

6. SCENE INTEGRATION:
   - Integrate the preserved product naturally into the animated scene
   - Product must always be in contact with/on the person
   - Realistic interaction: product shadows, reflections, occlusions
   - Maintain physical plausibility throughout motion

7. TECHNICAL SPECIFICATIONS:
   - 8 seconds duration, 720p, 24fps
   - Consistent product positioning across all frames
   - Smooth, professional cinematography
   - E-commerce/commercial video quality

FORBIDDEN ACTIONS (IN ANY FRAME):
❌ NEVER show footwear leaving the feet
❌ NEVER show products floating or disconnected from person
❌ NEVER place products in wrong anatomical positions
❌ NEVER show person without the product suddenly
❌ NEVER alter product appearance between frames

OUTPUT REQUIREMENTS:
- Every frame must show the product CORRECTLY positioned on the person's body
- Product appearance consistency is the #1 priority
- Natural movement of person wearing/using the product
- Zero artistic interpretation of the product itself

Remember: The reference product is SACRED and must be correctly positioned on the body throughout the entire video. A shoe stays on the foot in every frame. A shirt stays on the torso. Anatomical positioning is NON-NEGOTIABLE.
`.trim();
  }

  getNegativePrompt(contentType: 'image' | 'video', productCategory: string | null): string {
    const commonNegatives = [
      'product alteration',
      'simplified product',
      'stylized product',
      'cartoon product',
      'distorted product',
      'wrong colors',
      'missing details',
      'blurry product',
      'low quality',
      'unrealistic materials',
      'wrong proportions',
      'altered branding',
      'floating product',
      'disconnected product',
      'product not being used',
      'product on wrong place'
    ];

    const categoryNegatives: { [key: string]: string[] } = {
      'calcados': [
        'shoes not on feet',
        'shoes floating',
        'shoes between people',
        'shoes on furniture',
        'shoes in hands',
        'footwear not being worn',
        'bare feet with shoes visible',
        'shoes on ground',
        'shoes hovering'
      ],
      'roupas_superiores': [
        'shirt floating',
        'clothing not on body',
        'shirt disconnected from person',
        'torso not covered'
      ],
      'roupas_inferiores': [
        'pants floating',
        'pants not on legs',
        'clothing disconnected from body'
      ],
      'acessorios_cabeca': [
        'hat floating',
        'hat not on head',
        'headwear in hand',
        '3D render',
        '3D mockup',
        'CGI',
        'digital art',
        'synthetic look',
        'plastic texture',
        'no shadows',
        'flat lighting'
      ],
      'bolsas': [
        'bag on ground',
        'bag floating',
        'bag not being carried',
        'straps disconnected'
      ]
    };

    if (productCategory && categoryNegatives[productCategory]) {
      commonNegatives.push(...categoryNegatives[productCategory]);
    }

    if (contentType === 'video') {
      commonNegatives.push(
        'inconsistent product appearance',
        'morphing product',
        'changing colors',
        'flickering',
        'product disappearing',
        'product appearing suddenly'
      );
    }

    return commonNegatives.join(', ');
  }

  optimize(userPrompt: string, productName: string, contentType: 'image' | 'video'): OptimizationResult {
    const productCategory = this.detectProductCategory(productName, userPrompt);
    
    const optimizedPrompt = contentType === 'image' 
      ? this.optimizeImagePrompt(userPrompt, productName)
      : this.optimizeVideoPrompt(userPrompt, productName);

    const negativePrompt = this.getNegativePrompt(
      contentType, 
      productCategory?.category || null
    );

    return {
      optimizedPrompt,
      negativePrompt,
      detectedCategory: productCategory?.category || 'unknown',
      anatomicRule: productCategory?.anatomicRule || 'GENERIC',
      metadata: {
        originalPrompt: userPrompt,
        contentType,
        hasCategoryContext: productCategory !== null
      }
    };
  }
}
