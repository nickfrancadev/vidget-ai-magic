export interface OptimizationResult {
  optimizedPrompt: string;
  negativePrompt: string;
  detectedCategory: string;
}

export class EnhancedPromptOptimizer {
  private productCategories = {
    'calcados': {
      keywords: ['tênis', 'tenis', 'sapato', 'bota', 'sandália', 'sandalia', 'chinelo', 'sapatilha', 'mocassim', 'shoe', 'sneaker', 'boot']
    },
    'roupas_superiores': {
      keywords: ['camisa', 'camiseta', 'blusa', 'suéter', 'sweater', 'jaqueta', 'casaco', 'blazer', 'colete', 'shirt', 't-shirt', 'jacket', 'coat']
    },
    'roupas_inferiores': {
      keywords: ['calça', 'short', 'bermuda', 'saia', 'legging', 'jeans', 'pants', 'skirt', 'shorts']
    },
    'bolsas': {
      keywords: ['bolsa', 'mochila', 'pochete', 'carteira grande', 'shoulder bag', 'tote', 'bag', 'backpack', 'purse']
    },
    'acessorios_cabeca': {
      keywords: ['boné', 'bone', 'chapéu', 'chapeu', 'gorro', 'touca', 'cap', 'hat', 'beanie']
    },
    'acessorios_pulso': {
      keywords: ['relógio', 'relogio', 'pulseira', 'bracelete', 'smartwatch', 'watch', 'bracelet', 'wristband']
    },
    'oculos': {
      keywords: ['óculos', 'oculos', 'óculos de sol', 'oculos de sol', 'glasses', 'sunglasses', 'eyewear']
    },
    'joias': {
      keywords: ['colar', 'brinco', 'anel', 'corrente', 'necklace', 'earring', 'ring', 'chain', 'jewelry', 'jewellery']
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
      optimizedPrompt = `⚠️ CRITICAL INSTRUCTIONS - FOOTWEAR POSITIONING

ANATOMICAL POSITION: FEET (bottom of legs, touching the ground)

MANDATORY STEPS:

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

❌ FORBIDDEN POSITIONS - NEVER DO THIS:
- Shoes in person's hands - WRONG!
- Shoes floating in air - WRONG!
- Shoes on lap/between people - WRONG!
- Person holding/showing shoes - WRONG!
- Shoes separate from feet - WRONG!

✅ REQUIRED POSITION - ONLY THIS:
- Shoes ON feet, being WORN
- Person's feet INSIDE the shoes
- Natural wearing position

USER REQUEST: ${userPrompt}

REMEMBER: Shoes are WORN on FEET, not held in HANDS!`;

      negativePrompt = 'shoes in hands, holding shoes, showing shoes, shoes floating, shoes on lap, shoes between people, displaying sneakers, person holding footwear, shoes not on feet, bare feet with shoes visible';

    } else if (category === 'roupas_superiores') {
      optimizedPrompt = `⚠️ CRITICAL INSTRUCTIONS - UPPER BODY CLOTHING POSITIONING

ANATOMICAL POSITION: TORSO (chest, shoulders, back)

MANDATORY STEPS:

STEP 1: IDENTIFY THE TORSO
- Locate the upper body of the person
- Torso includes chest, shoulders, and back area

STEP 2: REMOVE ORIGINAL GARMENT
- Delete/erase the current upper body clothing
- Keep the torso area visible

STEP 3: PLACE NEW GARMENT ON TORSO
- Take the product garment from the reference image
- Place it naturally on the torso
- Collar/neckline must be at the NECK
- Sleeves on ARMS (if applicable)
- Natural fabric draping and fit

STEP 4: VERIFY POSITIONING
✅ Is the garment ON the torso? (NOT in hands, NOT floating)
✅ Is the person WEARING the garment?
✅ Does it look naturally worn?

❌ FORBIDDEN POSITIONS - NEVER DO THIS:
- Clothing in person's hands - WRONG!
- Clothing floating or hovering - WRONG!
- Person holding/displaying the garment - WRONG!
- Garment separate from body - WRONG!

✅ REQUIRED POSITION - ONLY THIS:
- Garment ON torso, being WORN
- Person's body INSIDE the garment
- Natural wearing position with proper fit

USER REQUEST: ${userPrompt}

REMEMBER: Upper clothing is WORN on TORSO, not held in HANDS!`;

      negativePrompt = 'clothing in hands, holding garment, displaying clothes, clothing floating, garment hovering, person showing clothing, clothes not being worn, garment separate from body';

    } else if (category === 'roupas_inferiores') {
      optimizedPrompt = `⚠️ CRITICAL INSTRUCTIONS - LOWER BODY CLOTHING POSITIONING

ANATOMICAL POSITION: LEGS/HIPS (waist to ankles)

MANDATORY STEPS:

STEP 1: IDENTIFY THE LOWER BODY
- Locate the legs and hips of the person
- Lower body includes waist, hips, and legs

STEP 2: REMOVE ORIGINAL GARMENT
- Delete/erase the current lower body clothing
- Keep the legs area visible

STEP 3: PLACE NEW GARMENT ON LEGS
- Take the product garment from the reference image
- Waistband must be at the HIPS/WAIST
- Garment must cover LEGS appropriately
- Natural fabric draping and fit

STEP 4: VERIFY POSITIONING
✅ Is the garment ON the legs? (NOT in hands, NOT floating)
✅ Is the person WEARING the garment?
✅ Does it look naturally worn?

❌ FORBIDDEN POSITIONS - NEVER DO THIS:
- Clothing in person's hands - WRONG!
- Clothing floating or hovering - WRONG!
- Person holding/displaying the pants - WRONG!
- Garment separate from body - WRONG!

✅ REQUIRED POSITION - ONLY THIS:
- Garment ON legs, being WORN
- Person's legs INSIDE the garment
- Natural wearing position with proper fit

USER REQUEST: ${userPrompt}

REMEMBER: Lower clothing is WORN on LEGS, not held in HANDS!`;

      negativePrompt = 'pants in hands, holding clothing, displaying pants, clothing floating, garment hovering, person showing clothes, pants not being worn, garment separate from body';

    } else if (category === 'acessorios_cabeca') {
      optimizedPrompt = `⚠️ CRITICAL INSTRUCTIONS - PHOTOREALISTIC HEAD ACCESSORY VIRTUAL TRY-ON

THIS IS A PHOTO EDITING TASK - NOT A 3D MOCKUP OR RENDERING!

OBJECTIVE: Edit the person's photo to show them ACTUALLY WEARING the cap/hat from the product image.

PHOTOREALISM REQUIREMENTS:
- This must look like a REAL PHOTOGRAPH, not a 3D render or digital mockup
- The result should be indistinguishable from a photo of someone actually wearing the cap
- Match the lighting, shadows, and color temperature of the original person's photo
- The cap should have natural fabric texture, creases, and imperfections
- Add realistic shadows under the cap brim onto the forehead/face
- The cap should conform to the shape of the person's head naturally

ANATOMICAL POSITION: HEAD (on top of the head)

MANDATORY STEPS:

STEP 1: ANALYZE THE PERSON'S PHOTO
- Study the lighting direction on the person's face
- Note the head angle and position
- Identify where natural shadows fall

STEP 2: PLACE CAP ON HEAD REALISTICALLY
- Position the cap ON TOP of the HEAD
- The cap must SIT on the head, not float above it
- Front of cap should rest slightly above the forehead/hairline
- Cap should appear to have weight and rest naturally on the head
- Adjust cap angle to match the person's head tilt

STEP 3: INTEGRATE LIGHTING & SHADOWS
- Add shadow from cap brim onto forehead and face (if brim faces forward)
- Match the cap's lighting to the photo's lighting direction
- The cap should have the same color temperature as the rest of the photo
- Add subtle ambient occlusion where cap meets hair/head

STEP 4: HAIR INTEGRATION
- Some hair may be visible around the cap edges
- Hair should look naturally tucked under or around the cap
- Maintain realistic interaction between cap and hair

QUALITY CHECKLIST:
✅ Does this look like a real photo? (NOT a 3D render)
✅ Are shadows realistic and matching the photo's lighting?
✅ Does the cap conform to the head shape naturally?
✅ Is there proper integration with the person's hair?
✅ Does the cap have natural fabric texture, not synthetic/plastic look?

❌ FORBIDDEN - AVOID THESE:
- 3D mockup appearance - WRONG!
- CGI/rendered look - WRONG!
- Cap floating above head - WRONG!
- Missing shadows from cap brim - WRONG!
- Unnatural plastic/synthetic material look - WRONG!
- Cap in person's hands - WRONG!
- Perfect/sterile appearance without natural imperfections - WRONG!

USER REQUEST: ${userPrompt}

FINAL OUTPUT: A photorealistic image that looks like a genuine photograph of this person wearing this exact cap.`;

      negativePrompt = '3D render, 3D mockup, CGI, digital art, synthetic look, plastic texture, floating hat, hat in hands, holding cap, no shadows, flat lighting, unnatural appearance, computer generated, artificial look, perfect sterile appearance';

    } else if (category === 'bolsas') {
      optimizedPrompt = `⚠️ CRITICAL INSTRUCTIONS - BAG POSITIONING

ANATOMICAL POSITION: BEING CARRIED (shoulder, hand, back)

MANDATORY STEPS:

STEP 1: IDENTIFY CARRYING POSITION
- Determine where the bag should be carried
- Options: shoulder strap, hand-held, backpack style, crossbody

STEP 2: REMOVE ORIGINAL BAG (if any)
- Delete/erase any current bag
- Keep the person visible

STEP 3: PLACE NEW BAG IN CARRYING POSITION
- Take the product bag from the reference image
- Position straps OVER shoulder, ACROSS body, or IN hand
- Straps must TOUCH the person's body
- Bag must appear to have weight and gravity

STEP 4: VERIFY POSITIONING
✅ Is the bag BEING CARRIED? (NOT on ground, NOT floating)
✅ Are straps connected to the person?
✅ Does it look natural with proper weight distribution?

❌ FORBIDDEN POSITIONS - NEVER DO THIS:
- Bag on the ground - WRONG!
- Bag floating in air - WRONG!
- Straps disconnected from person - WRONG!
- Bag not being carried - WRONG!

✅ REQUIRED POSITION - ONLY THIS:
- Bag BEING CARRIED by the person
- Straps touching body (shoulder/across chest)
- Natural carrying position
- Realistic weight and gravity

USER REQUEST: ${userPrompt}

REMEMBER: Bags are CARRIED by people, not placed on GROUND!`;

      negativePrompt = 'bag on ground, bag floating, straps disconnected, bag not being carried, bag hovering, unnatural positioning, bag separate from person';

    } else if (category === 'acessorios_pulso') {
      optimizedPrompt = `⚠️ CRITICAL INSTRUCTIONS - WRIST ACCESSORY POSITIONING

ANATOMICAL POSITION: WRIST (around the wrist bone)

MANDATORY STEPS:

STEP 1: IDENTIFY THE WRIST
- Locate the wrist of the person
- Wrist is the joint between hand and forearm
- Wrist bone is the prominent bone area

STEP 2: REMOVE ORIGINAL ACCESSORY (if any)
- Delete/erase any current wrist accessory
- Keep the wrist visible

STEP 3: PLACE NEW ACCESSORY ON WRIST
- Take the product accessory from the reference image
- Place it AROUND the wrist bone area
- Must wrap around the wrist naturally
- Proper fit (not too tight, not too loose)

STEP 4: VERIFY POSITIONING
✅ Is the accessory ON the wrist? (NOT in palm, NOT floating)
✅ Is the person WEARING the accessory?
✅ Does it wrap around the wrist naturally?

❌ FORBIDDEN POSITIONS - NEVER DO THIS:
- Accessory in palm of hand - WRONG!
- Accessory floating near hand - WRONG!
- Person holding the accessory - WRONG!
- Accessory not around wrist - WRONG!

✅ REQUIRED POSITION - ONLY THIS:
- Accessory AROUND wrist, being WORN
- Natural wrapping around wrist bone
- Proper positioning on forearm area

USER REQUEST: ${userPrompt}

REMEMBER: Wrist accessories are WORN around WRIST, not held in PALM!`;

      negativePrompt = 'watch in palm, holding watch, wrist accessory floating, watch hovering, not on wrist, in hand, watch separate from wrist, unnatural positioning';

    } else if (category === 'oculos') {
      optimizedPrompt = `⚠️ CRITICAL INSTRUCTIONS - EYEWEAR POSITIONING

ANATOMICAL POSITION: FACE (on nose, in front of eyes)

MANDATORY STEPS:

STEP 1: IDENTIFY THE FACE
- Locate the face of the person
- Identify nose bridge and eye area
- Face is the front part of the head

STEP 2: REMOVE ORIGINAL EYEWEAR (if any)
- Delete/erase any current glasses or sunglasses
- Keep the face visible

STEP 3: PLACE NEW EYEWEAR ON FACE
- Take the product eyewear from the reference image
- Position bridge on the NOSE
- Lenses in FRONT of the EYES
- Temples (arms) over the EARS
- Natural wearing position

STEP 4: VERIFY POSITIONING
✅ Are the glasses ON the face? (NOT in hands, NOT on top of head)
✅ Is the person WEARING the eyewear?
✅ Are lenses in front of eyes?

❌ FORBIDDEN POSITIONS - NEVER DO THIS:
- Glasses in person's hands - WRONG!
- Glasses on top of head - WRONG!
- Glasses floating near face - WRONG!
- Person holding/displaying glasses - WRONG!

✅ REQUIRED POSITION - ONLY THIS:
- Eyewear ON face, being WORN
- Bridge on nose, lenses in front of eyes
- Natural wearing position

USER REQUEST: ${userPrompt}

REMEMBER: Eyewear is WORN on FACE, not held in HANDS or on HEAD!`;

      negativePrompt = 'glasses in hands, holding eyewear, glasses on top of head, eyewear floating, glasses hovering, not on face, glasses separate from face, displaying sunglasses';

    } else if (category === 'joias') {
      optimizedPrompt = `⚠️ CRITICAL INSTRUCTIONS - JEWELRY POSITIONING

ANATOMICAL POSITION: Depends on type (neck, ears, fingers, wrist)

MANDATORY STEPS:

STEP 1: IDENTIFY THE JEWELRY TYPE AND POSITION
- Necklace/Chain: NECK area
- Earrings: EARS (earlobes or ear area)
- Ring: FINGERS (on finger)
- Bracelet: WRIST

STEP 2: REMOVE ORIGINAL JEWELRY (if any)
- Delete/erase any current jewelry of the same type
- Keep the body part visible

STEP 3: PLACE NEW JEWELRY ON CORRECT BODY PART
- Take the product jewelry from the reference image
- For NECKLACE: around the NECK
- For EARRINGS: on the EARS
- For RING: on a FINGER
- For BRACELET: around the WRIST
- Natural positioning for each type

STEP 4: VERIFY POSITIONING
✅ Is the jewelry ON the body? (NOT in hands, NOT floating)
✅ Is the person WEARING the jewelry?
✅ Is it on the correct body part?

❌ FORBIDDEN POSITIONS - NEVER DO THIS:
- Jewelry in person's hands - WRONG!
- Jewelry floating in air - WRONG!
- Person holding/displaying jewelry - WRONG!
- Jewelry separate from body - WRONG!

✅ REQUIRED POSITION - ONLY THIS:
- Jewelry ON body, being WORN
- Correct body part for the type
- Natural wearing position

USER REQUEST: ${userPrompt}

REMEMBER: Jewelry is WORN on BODY, not held in HANDS!`;

      negativePrompt = 'jewelry in hands, holding jewelry, necklace floating, earrings hovering, ring not on finger, jewelry separate from body, displaying jewelry, person showing jewelry';

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
