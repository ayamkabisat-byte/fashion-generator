import {
  AESTHETIC_THEMES,
  ASPECT_RATIOS,
  BACKGROUND_STYLES,
  COLLAB_ARTISTS,
  FASHION_CATEGORIES,
  BRAND_PATTERNS
} from '../data/fashionData.js';
import {
  BRAND_DESIGN_DNA,
  CATEGORY_DESIGN_DNA
} from '../data/designDNA.js';

const FALLBACK_BG = 'Clean seamless neutral studio background with physically plausible product lighting.';

const aestheticProductOverrides = {
  'Opiumcore': {
    Footwear: 'dark distressed leather, elongated aggressive lines, oxidized metal accents and shadow-heavy gothic streetwear detailing',
    Accessories: 'dark leather, aged silver hardware, elongated gothic proportions and decadent distressed finishing'
  },
  'Gothic': {
    Footwear: 'black leather, pointed or armored panel cues, silver hardware, restrained Victorian detailing',
    Accessories: 'black structured forms, silver gothic hardware, dark leather and cathedral-inspired geometry'
  },
  'Dark Academia': {
    Footwear: 'polished leather or suede, heritage court/loafer cues, restrained earth tones and scholarly vintage detailing',
    Accessories: 'structured leather goods, brass hardware, archival bookish proportions and understated heritage finish'
  },
  'Old Money': {
    Footwear: 'quiet luxury materials, restrained leather/suede blocking, classic proportions and minimal visible branding',
    Accessories: 'clean structured luxury forms, premium leather, subtle hardware and discreet branding'
  },
  'Cyberpunk': {
    Footwear: 'segmented TPU overlays, reflective piping, technical mesh, asymmetrical closures and engineered exoskeletal detailing',
    Accessories: 'modular technical compartments, reflective surfaces, cyber utility hardware and engineered strap systems'
  },
  'Synthwave / Retrowave': {
    Footwear: 'retro-futurist 1980s runner geometry, neon accent piping, glossy synthetic panels and gradient color blocking',
    Accessories: 'retro electronics-inspired geometry, neon edge accents and glossy synthetic surfaces'
  },
  'Y2K': {
    Footwear: 'early-2000s tech-runner layering, metallic mesh, glossy synthetic overlays, rounded chunky cushioning and playful color hits',
    Accessories: 'miniature glossy forms, metallic finishes, translucent plastic details and playful Y2K hardware'
  },
  'Frutiger Aero': {
    Footwear: 'clean optimistic 2000s tech styling, translucent aqua details, rounded aerodynamic forms and glossy white/blue surfaces',
    Accessories: 'bright translucent plastics, rounded optimistic tech forms and clean aqua/green highlights'
  },
  'Gorpcore': {
    Footwear: 'trail-derived tread, protective toe construction, speed-lacing, technical mesh and weather-ready overlays',
    Accessories: 'ripstop utility, bungee systems, technical webbing and outdoor compartment logic'
  }
};

const normalize = value => String(value ?? '').trim();

export function getBrandDNA(brand, category) {
  return BRAND_DESIGN_DNA[brand] || {
    designLanguage: CATEGORY_DESIGN_DNA[category] || FASHION_CATEGORIES[category]?.description || 'recognizable contemporary fashion design language',
    construction: 'preserve the selected silhouette while applying brand-appropriate construction logic',
    branding: 'use restrained, plausible brand placement rather than floating logos',
    materialBias: 'use materials appropriate to the selected product and silhouette'
  };
}

export function getAestheticProductDNA(aestheticName, productType) {
  if (!aestheticName || aestheticName === 'None (Standard Fashion)') return '';
  const explicit = aestheticProductOverrides[aestheticName]?.[productType];
  if (explicit) return explicit;
  const theme = AESTHETIC_THEMES[aestheticName];
  if (!theme) return aestheticName;
  if (productType === 'Apparel') return theme.clothing;
  if (productType === 'Footwear') {
    return `translate the ${aestheticName} language into footwear through color, material zoning, construction details and surface treatment; do not turn the shoe into a costume. Source mood: ${theme.clothing}`;
  }
  return `translate the ${aestheticName} language into functional accessory form, hardware, material zoning and surface treatment; avoid literal costume props. Source mood: ${theme.clothing}`;
}

export function normalizeComponents(components = []) {
  const clean = [...new Set(components.filter(Boolean).filter(x => !String(x).includes('None')))];
  const warnings = [];
  const soleSystems = clean.filter(x => /Clear Outsole|Gum Sole|Vibram Sole|Platform \/ Stacked Sole/i.test(x));
  if (soleSystems.length > 2) {
    warnings.push('Too many competing sole systems selected; keep no more than two structural sole ideas for a coherent product.');
  }
  if (clean.includes('Clear Outsole') && clean.includes('Gum Sole')) {
    warnings.push('Clear Outsole and Gum Sole are visually competing outsole treatments.');
  }
  return { components: clean, warnings };
}

function formatColors(colors = []) {
  if (!colors.length) return 'Color palette: allow a coherent material-led neutral palette.';
  if (colors.length === 1) return `Color palette: monochromatic ${colors[0]}.`;
  if (colors.length === 2) return `Color palette: two-tone ${colors[0]} + ${colors[1]}.`;
  return `Color palette: base ${colors[0]}, secondary ${colors[1]}, accent ${colors[2]}.`;
}

function collabName(settings) {
  if (settings.collabType === 'Artist' && settings.collabArtist && settings.collabArtist !== 'None') return settings.collabArtist;
  if (settings.collabType === 'IP' && settings.collabIP && settings.collabIP !== 'None') {
    return settings.collabIP === 'Custom IP (Type Manual)' ? normalize(settings.customIPText) : normalize(settings.collabCharacter);
  }
  return '';
}

function collabDescription(settings) {
  const name = collabName(settings);
  if (!name) return '';
  if (settings.collabType === 'Artist') return COLLAB_ARTISTS[name] || name;
  return `${name} visual identity`;
}

function referenceInstructions(settings, productOnly) {
  const parts = [];
  if (settings.useUploadedProductBase) {
    parts.push('BASE PRODUCT REFERENCE: Use the uploaded product image as the structural authority. Preserve its recognizable overall silhouette, proportions, major panel geometry, sole/base profile, closure and functional shape. Apply the selected brand, collaboration, materials, colors and graphics as redesign layers without replacing the base product shape.');
  }
  if (settings.externalFaceReference && !productOnly) {
    parts.push('MODEL REFERENCE: preserve the referenced model identity and facial structure while allowing styling, pose, lighting and background to follow this design brief.');
  }
  return parts;
}

export function buildDesignSpec(settings) {
  const base = settings.baseGarment || { name: 'Custom Design', traits: 'custom product silhouette' };
  const layout = ASPECT_RATIOS[settings.aspectRatio] || Object.values(ASPECT_RATIOS)[0];
  const productOnly = !!layout.productOnly;
  const brandDNA = getBrandDNA(settings.brand, settings.category);
  const coBrandDNA = settings.coBrand && settings.coBrand !== 'None' ? getBrandDNA(settings.coBrand, settings.coBrandCategory || settings.category) : null;
  const collab = collabName(settings);
  const strength = Number(settings.collabStrength ?? 40);
  const scopes = Object.entries(settings.collabScopes || {}).filter(([,v])=>v).map(([k])=>k);
  const componentResult = normalizeComponents(settings.components || []);

  const activeColors = (settings.colors || []).filter((_,i)=>settings.colorActive?.[i] !== false);
  const aestheticName = settings.selectedAesthetic || 'None (Standard Fashion)';
  const aestheticTheme = AESTHETIC_THEMES[aestheticName] || null;
  const background = settings.backgroundStyle === 'Auto (Match Aesthetic)'
    ? (aestheticTheme?.background ? `Setting & decor: ${aestheticTheme.background}.` : FALLBACK_BG)
    : (BACKGROUND_STYLES[settings.backgroundStyle] || FALLBACK_BG);

  const useUploadedProductBase = !!settings.useUploadedProductBase;
  const footwear = settings.productType === 'Footwear' ? {
    sole: settings.footwear?.sole || 'Preserve base sole'
  } : null;

  const warnings = [...componentResult.warnings];
  if (settings.whiteLabel && scopes.includes('branding')) warnings.push('White-label mode overrides collab/brand branding scope.');
  if (settings.whiteLabel && scopes.includes('typography')) warnings.push('White-label mode overrides collab typography/text scope.');
  if (settings.productType === 'Footwear' && /Platform \/ Stacked/i.test(footwear?.sole || '') && settings.fitStyle === 'Sleek / Aerodynamic') {
    warnings.push('Platform / stacked sole conflicts with a sleek/aerodynamic fit direction.');
  }
  if (settings.productType === 'Footwear' && /Vibram|Lugged/i.test(footwear?.sole || '') && settings.fitStyle === 'Sleek / Aerodynamic') {
    warnings.push('Heavy lugged sole conflicts with a sleek/aerodynamic fit direction.');
  }
  if (settings.collabStrength >= 80 && scopes.includes('construction') && !useUploadedProductBase && !String(base.name).startsWith('Generic ')) {
    warnings.push('Dominant collab + Construction scope may compete with the named silhouette. The silhouette remains structural authority.');
  }
  if (settings.whiteLabel && BRAND_PATTERNS[settings.brand]?.includes(settings.selectedPattern)) {
    warnings.push('White Label is active while a brand-specific iconic pattern is selected; the motif may still communicate brand identity.');
  }
  if (productOnly && settings.externalFaceReference) {
    warnings.push('External Face Reference is ignored in product-only layouts because no model is rendered.');
  }
  if (useUploadedProductBase && !settings.uploadedProductName) {
    warnings.push('Uploaded Product Base is active. Attach the same product image in the target image generator when using the prompt.');
  }

  return {
    productType: settings.productType,
    category: settings.category,
    brand: settings.brand,
    coBrand: settings.coBrand || 'None',
    brandStyle: FASHION_CATEGORIES[settings.category]?.description || '',
    brandDNA,
    coBrandDNA,
    baseSource: useUploadedProductBase ? 'uploaded' : 'database',
    silhouette: useUploadedProductBase
      ? { name: 'Uploaded Product Reference', traits: 'the exact visible structural form of the uploaded product' }
      : { name: base.name, traits: base.traits },
    databaseSilhouette: { name: base.name, traits: base.traits },
    materials: settings.materials || [],
    fitStyle: settings.fitStyle,
    designStyle: settings.designStyle || 'Balanced / Product-led',
    components: componentResult.components,
    footwear,
    pattern: settings.selectedPattern,
    aesthetic: {
      name: aestheticName,
      productDNA: getAestheticProductDNA(aestheticName, settings.productType),
      model: aestheticTheme?.makeup || '',
      lighting: aestheticTheme?.lighting || ''
    },
    colors: activeColors,
    colorText: formatColors(activeColors),
    collab: {
      type: settings.collabType,
      name: collab,
      description: collabDescription(settings),
      strength,
      scopes
    },
    whiteLabel: !!settings.whiteLabel,
    model: {
      gender: settings.gender || 'Female',
      background
    },
    presentation: {
      aspectRatio: settings.aspectRatio,
      ratio: layout.ratio,
      layoutType: layout.layoutType,
      productOnly,
      layoutPos: settings.layoutPos || 'Center',
      outputMode: settings.outputMode || 'Composite Sheet',
      outputTarget: settings.outputTarget || 'Universal'
    },
    references: referenceInstructions(settings, productOnly),
    warnings
  };
}

function fusionLabel(spec) {
  return [spec.brand, spec.coBrand !== 'None' ? spec.coBrand : '', spec.collab.name]
    .filter(Boolean)
    .join(' x ');
}

function conceptLine(spec) {
  const baseText = spec.baseSource === 'uploaded'
    ? 'the exact structural shape shown in the uploaded product reference'
    : `${spec.silhouette.name} (${spec.silhouette.traits})`;
  const style = spec.brandStyle ? ` (${spec.category} style: ${spec.brandStyle})` : '';
  return `Concept: A fashion crossover ${spec.productType.toLowerCase()} design combining ${fusionLabel(spec)}${style} with the structural silhouette of ${baseText}.`;
}

function collabInjectionLine(spec) {
  if (!spec.collab.name) return '';
  if (spec.collab.type === 'IP') {
    return `Pop-Culture Injection: themed around ${spec.collab.name}, translating its recognizable colorways, motifs and graphic language into the product design without turning the product into a costume prop.`;
  }
  return `Aesthetic Injection: ${spec.collab.description}.`;
}

function materialLine(spec) {
  const mats = spec.materials.length ? spec.materials.join(' + ') : 'context-appropriate materials';
  return `Primary Materials: ${mats}.`;
}

function componentLine(spec) {
  return spec.components.length ? `Structural Modification: ${spec.components.join(' + ')}.` : '';
}

function soleLine(spec) {
  if (!spec.footwear || !spec.footwear.sole || spec.footwear.sole === 'Preserve base sole') return '';
  return `Sole Modification: ${spec.footwear.sole}.`;
}

function brandingLine(spec) {
  if (spec.whiteLabel) return 'Branding: white-label treatment, no visible logos or signature brand marks.';
  return 'Feature signature branding prominently, integrated physically into the product design.';
}

function consistencyLock(spec) {
  return `Consistency: keep the exact same ${spec.productType.toLowerCase()} design, silhouette, materials, color blocking and branding across every panel.`;
}

function modelDescription(spec) {
  const g = spec.model.gender.toLowerCase();
  const hijab = /hijab/i.test(spec.model.gender) ? ' wearing a coordinated fashion hijab' : '';
  return `${g.replace(' (with hijab)','')} model${hijab}`;
}

function productViews(spec) {
  const model = modelDescription(spec);
  if (spec.productType === 'Footwear') {
    return {
      hero: 'Lateral outer-side profile product view, showing the complete footwear silhouette clearly.',
      detail: 'Alternative top-down or outsole/detail view showing tread, material texture and construction.',
      model: `Dynamic lookbook shot focused on a ${model}'s feet wearing the exact same footwear design.`,
      extra: 'Alternative three-quarter footwear view showing the same design and sole profile.'
    };
  }
  if (spec.productType === 'Apparel') {
    return {
      hero: 'Front-view flat lay / tech-pack presentation showing the complete garment cut and tailoring.',
      detail: 'Back-view flat lay / tech-pack presentation showing rear tailoring and construction.',
      model: `Full-body fashion lookbook shot of a ${model} wearing the exact same garment.`,
      extra: 'Three-quarter garment detail view showing material and construction.'
    };
  }
  return {
    hero: 'Front-facing detailed product shot showing the complete accessory shape and structure.',
    detail: 'Alternative-angle product shot showing side, back, hardware or functional structural details.',
    model: `Fashion lookbook shot of a ${model} carrying, displaying or interacting naturally with the exact same accessory.`,
    extra: 'Three-quarter accessory product view showing material, hardware and functional details.'
  };
}

function coreBrief(spec) {
  const lines = [
    conceptLine(spec),
    collabInjectionLine(spec),
    spec.aesthetic.name !== 'None (Standard Fashion)' ? `Aesthetic Core: ${spec.aesthetic.name}. ${spec.aesthetic.productDNA}` : '',
    materialLine(spec),
    `Design Fit/Structure: ${spec.fitStyle}.`,
    componentLine(spec),
    soleLine(spec),
    `Design Approach: ${spec.designStyle}.`,
    spec.pattern && spec.pattern !== 'Solid Color (No Pattern)' ? `Pattern / Surface Detail: ${spec.pattern}.` : '',
    spec.colorText,
    brandingLine(spec),
    consistencyLock(spec),
    ...spec.references
  ];
  return lines.filter(Boolean).join('\n');
}

function compositePrompt(spec) {
  const views = productViews(spec);
  let intro;
  let panels;

  if (spec.presentation.layoutType === 'diptych-horizontal') {
    intro = 'A photorealistic product editorial photography, diptych layout split cleanly into 2 panels.';
    panels = `Left Panel: ${views.hero}\nRight Panel: ${views.detail}`;
  } else if (spec.presentation.layoutType === 'diptych-vertical') {
    intro = 'A photorealistic fashion editorial photography, vertical diptych split into 2 stacked panels.';
    panels = `Top Panel: ${views.model}\nBottom Panel: ${views.hero}`;
  } else {
    intro = 'A photorealistic product and fashion editorial photography, triptych layout split cleanly into 3 vertical panels.';
    const order = spec.presentation.layoutPos === 'Left'
      ? [views.model, views.hero, views.detail]
      : spec.presentation.layoutPos === 'Right'
        ? [views.hero, views.detail, views.model]
        : [views.hero, views.model, views.detail];
    panels = `Left Panel: ${order[0]}\nCenter Panel: ${order[1]}\nRight Panel: ${order[2]}`;
  }

  return `${intro}\n${panels}\n\n${coreBrief(spec)}\n\n${spec.model.background}\nStyle details: photorealistic material textures, clean fashion/product editorial photography, believable construction and realistic studio or environmental lighting.`;
}

function panelPack(spec) {
  const views = productViews(spec);
  const base = coreBrief(spec);
  return [
    ['01 HERO / LATERAL', views.hero],
    ['02 ON-BODY / ON-FOOT', views.model],
    ['03 STRUCTURAL DETAIL', views.detail],
    ['04 TOP / THREE-QUARTER', views.extra]
  ].map(([title,view])=>`### ${title}\n${base}\n\nVIEW: ${view}\n${spec.model.background}\nGenerate only this single view, using the exact same product design described above.`).join('\n\n---\n\n');
}

function negativeText(spec) {
  const negatives = [
    'design mutation between views',
    'different colorway between panels',
    'different product structure between panels',
    'impossible material transitions',
    'floating logos',
    'random typography',
    'watermark',
    'UI overlay',
    'caption text',
    'extra product duplicates'
  ];
  if (spec.whiteLabel) negatives.push('brand logos','trademarks','signature wordmarks');
  if (spec.presentation.productOnly) negatives.push('humans','models','faces','hands','bodies');
  return negatives.join(', ');
}

export function adaptPrompt(universal, spec) {
  const target = spec.presentation.outputTarget;
  if (target === 'Midjourney') {
    const ar = spec.presentation.ratio || '--ar 16:9';
    return `${universal}\n\n--no ${negativeText(spec)} ${ar}`;
  }
  if (target === 'Flux') {
    return `${universal}\n\nNEGATIVE PROMPT: ${negativeText(spec)}`;
  }
  if (target === 'Gemini / Nano Banana') {
    return `${universal}\n\nGeneration constraints: maintain exact product identity across views; render text/logos only when explicitly requested and physically plausible. Avoid: ${negativeText(spec)}.`;
  }
  return `${universal}\n\nNEGATIVE / AVOID: ${negativeText(spec)}`;
}

export function buildPrompt(settings) {
  const spec = buildDesignSpec(settings);
  const universal = spec.presentation.outputMode === 'Panel Prompt Pack' ? panelPack(spec) : compositePrompt(spec);
  return { spec, prompt: adaptPrompt(universal, spec) };
}

export function catalogStats(iconicDb) {
  const footwear = Object.values(iconicDb?.Footwear || {}).flat().length;
  const accessories = Object.values(iconicDb?.Accessories || {}).flat().length;
  return { footwear, accessories, total: footwear + accessories };
}
