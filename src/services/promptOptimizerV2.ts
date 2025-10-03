export interface OptimizationResult {
  optimizedPrompt: string;
  negativePrompt: string;
  detectedCategory: string;
}

export class PromptOptimizerV2 {
  private productCategories = {
    'calcados': {
      keywords: ['tênis', 'tenis', 'sapato', 'bota', 'sandália', 'sandalia', 'chinelo', 'sapatilha', 'mocassim']
    },
    'roupas_superiores': {
      keywords: ['camisa', 'camiseta', 'blusa', 'suéter', 'sweater', 'jaqueta', 'casaco', 'blazer', 'colete']
    },
    'roupas_inferiores': {
      keywords: ['calça', 'short', 'bermuda', 'saia', 'legging', 'jeans']
    },
    'bolsas': {
      keywords: ['bolsa', 'mochila', 'pochete', 'carteira grande', 'shoulder bag', 'tote']
    },
    'acessorios_cabeca': {
      keywords: ['boné', 'bone', 'chapéu', 'chapeu', 'gorro', 'touca']
    },
    'acessorios_pulso': {
      keywords: ['relógio', 'relogio', 'pulseira', 'bracelete', 'smartwatch']
    },
    'oculos': {
      keywords: ['óculos', 'oculos', 'óculos de sol', 'oculos de sol']
    }
  };

  detectProductCategory(userPrompt: string): string {
    const promptLower = userPrompt.toLowerCase();
    
    for (const [category, config] of Object.entries(this.productCategories)) {
      for (const keyword of config.keywords) {
        if (promptLower.includes(keyword)) {
          return category;
        }
      }
    }
    
    return 'unknown';
  }

  optimize(userPrompt: string, contentType: 'image' | 'video'): OptimizationResult {
    const category = this.detectProductCategory(userPrompt);
    
    let optimizedPrompt = '';
    let negativePrompt = '';

    if (category === 'calcados') {
      optimizedPrompt = `CRITICAL INSTRUCTIONS - FOOTWEAR POSITIONING:

STEP 1: IDENTIFY THE FEET
- Locate both feet of each person in the image
- Feet are at the BOTTOM of the legs, touching the ground

STEP 2: REMOVE ORIGINAL FOOTWEAR
- Delete/erase the current footwear (flip-flops, sandals, or any shoes)
- Keep the feet visible

STEP 3: PLACE NEW FOOTWEAR ON FEET
- Take the product shoes from the reference image
- Place ONE shoe on the LEFT foot
- Place ONE shoe on the RIGHT foot
- The shoes MUST be WORN ON THE FEET
- The feet MUST be INSIDE the shoes

STEP 4: VERIFY POSITIONING
✅ Are the shoes ON the feet? (NOT in hands, NOT floating, NOT on lap)
✅ Are BOTH feet wearing the shoes?
✅ Are the shoes touching the ground where feet naturally rest?

FORBIDDEN POSITIONS - NEVER DO THIS:
❌ Shoes in person's hands - WRONG!
❌ Shoes floating in air - WRONG!
❌ Shoes on lap/between people - WRONG!
❌ Person holding/showing shoes - WRONG!
❌ Shoes separate from feet - WRONG!

CORRECT POSITION - ONLY THIS:
✅ Shoes ON feet, being WORN
✅ Person's feet INSIDE the shoes
✅ Natural wearing position

REPLACEMENT TASK:
- Remove the original footwear from the feet
- Insert the new product shoes in THE EXACT SAME POSITION
- The shoes must look like they're being WORN, not displayed

USER REQUEST: ${userPrompt}

REMEMBER: Shoes are WORN on FEET, not held in HANDS!`;

      negativePrompt = 'shoes in hands, holding shoes, showing shoes, shoes floating, shoes on lap, shoes between people, displaying sneakers, person holding footwear, shoes not on feet, bare feet with shoes visible';
    } else if (category === 'roupas_superiores') {
      optimizedPrompt = `CRITICAL INSTRUCTIONS - UPPER BODY CLOTHING:

The clothing MUST be WORN on the person's TORSO:
- Replace the current upper body garment
- The garment must cover the torso naturally
- Collar/neckline at the neck
- Sleeves on arms (if applicable)
- Natural fabric draping

FORBIDDEN:
❌ Clothing floating or separate from body
❌ Garment in hands
❌ Not being worn

USER REQUEST: ${userPrompt}`;

      negativePrompt = 'clothing floating, garment in hands, not being worn, clothing separate from body';
    } else if (category === 'roupas_inferiores') {
      optimizedPrompt = `CRITICAL INSTRUCTIONS - LOWER BODY CLOTHING:

The clothing MUST be WORN on the person's LEGS/HIPS:
- Replace the current lower body garment
- Waistband at the hips
- Covers legs appropriately
- Natural fabric draping

FORBIDDEN:
❌ Clothing floating or separate from body
❌ Garment in hands
❌ Not being worn

USER REQUEST: ${userPrompt}`;

      negativePrompt = 'clothing floating, pants in hands, not being worn, clothing separate from body';
    } else if (category === 'bolsas') {
      optimizedPrompt = `CRITICAL INSTRUCTIONS - BAG POSITIONING:

The bag MUST be CARRIED by the person:
- On shoulder (strap over shoulder)
- In hand (being held)
- On back (backpack style)
- Crossbody (strap across body)

FORBIDDEN:
❌ Bag on ground
❌ Bag floating
❌ Bag not being carried

USER REQUEST: ${userPrompt}`;

      negativePrompt = 'bag on ground, bag floating, bag not being carried, straps disconnected';
    } else {
      // Generic fallback
      optimizedPrompt = `${userPrompt}

Maintain photorealistic quality and natural integration of the product into the scene.`;
      
      negativePrompt = 'unrealistic, floating objects, disconnected items, wrong positioning';
    }

    return {
      optimizedPrompt,
      negativePrompt,
      detectedCategory: category
    };
  }
}
