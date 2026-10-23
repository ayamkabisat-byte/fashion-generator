import {
  AESTHETIC_THEMES,
  ASPECT_RATIOS,
  BACKGROUND_STYLES,
  COLLAB_ARTISTS,
  FASHION_CATEGORIES
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
  if (settings.externalDesignReference) {
    parts.push('If a product/design reference image is attached in the target image generator, preserve its intended graphic placement and structural cues only where they do not conflict with the selected base silhouette.');
  }
  if (settings.externalFaceReference && !productOnly) {
    parts.push('If a human reference image is attached in the target image generator, preserve that model identity and facial structure while allowing wardrobe, pose, lighting and background to follow this design brief.');
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

  const footwear = settings.productType === 'Footwear' ? {
    toe: settings.footwear?.toe || 'Preserve silhouette',
    upper: settings.footwear?.upper || 'Preserve silhouette',
    lacing: settings.footwear?.lacing || 'Preserve silhouette',
    midsole: settings.footwear?.midsole || 'Preserve silhouette',
    outsole: settings.footwear?.outsole || 'Preserve silhouette',
    heel: settings.footwear?.heel || 'Preserve silhouette',
    distress: settings.footwear?.distress || 'Pristine / new'
  } : null;

  const warnings = [...componentResult.warnings];
  if (settings.whiteLabel && scopes.includes('branding')) warnings.push('White-label mode overrides collab/brand branding scope.');
  if (settings.productType === 'Footwear' && footwear?.lacing === 'Slip-on construction' && /Air Force|Dunk|Jordan 1|Blazer|Chuck|Old Skool/i.test(base.name)) {
    warnings.push('Slip-on construction is a strong departure from the selected lace-based heritage silhouette.');
  }
  if (settings.productType === 'Footwear' && footwear?.midsole === 'Stacked platform midsole' && settings.fitStyle === 'Sleek / Aerodynamic') {
    warnings.push('Stacked platform midsole conflicts with a sleek/aerodynamic fit direction.');
  }

  return {
    productType: settings.productType,
    category: settings.category,
    brand: settings.brand,
    coBrand: settings.coBrand || 'None',
    brandStyle: FASHION_CATEGORIES[settings.category]?.description || '',
    brandDNA,
    coBrandDNA,
    silhouette: { name: base.name, traits: base.traits },
    materials: settings.materials || [],
    fitStyle: settings.fitStyle,
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

function footwearArchitecture(spec) {
  if (!spec.footwear) return '';
  const f = spec.footwear;
  return `Footwear architecture: toe=${f.toe}; upper=${f.upper}; closure=${f.lacing}; midsole=${f.midsole}; outsole=${f.outsole}; heel=${f.heel}; finish=${f.distress}.`;
}

function collabLine(spec) {
  if (!spec.collab.name) return 'Collaboration layer: none.';
  const scope = spec.collab.scopes.length ? spec.collab.scopes.join(', ') : 'general aesthetic cues';
  return `Collaboration layer: ${spec.collab.name}, ${spec.collab.strength}% influence, scoped to ${scope}. Use ${spec.collab.description}. The collab must modify only the selected scopes; it must not erase the base silhouette.`;
}

function brandHierarchy(spec) {
  const co = spec.coBrand && spec.coBrand !== 'None'
    ? ` Secondary brand DNA: ${spec.coBrand} — ${spec.coBrandDNA?.designLanguage || 'secondary brand cues'}.`
    : '';
  return `Design hierarchy: ${spec.silhouette.name} is the structural authority. Preserve its recognizable proportion, stance and core geometry. Primary ${spec.brand} DNA: ${spec.brandDNA.designLanguage}; construction: ${spec.brandDNA.construction}; branding logic: ${spec.brandDNA.branding}.${co}`;
}

function materialLine(spec) {
  const mats = spec.materials.length ? spec.materials.join(' + ') : 'context-appropriate materials';
  return `Materials: ${mats}. Respect realistic thickness, stitching, seams, flex points, joins and material behavior.`;
}

function componentLine(spec) {
  return spec.components.length ? `Structural additions: ${spec.components.join('; ')}.` : 'Structural additions: none beyond the selected silhouette and anatomy controls.';
}

function brandingLine(spec) {
  if (spec.whiteLabel) return 'Branding policy: WHITE LABEL. No logos, trademarks, signature typography or brand marks. Retain only non-logo structural design language.';
  return 'Branding policy: branding may appear only in plausible physical placement on the product; no floating or decorative random logos.';
}

function consistencyLock(spec) {
  return `PRODUCT CONSISTENCY LOCK: every view must depict the exact same ${spec.productType.toLowerCase()} design. Keep identical silhouette, proportions, panel geometry, material zoning, color blocking, closures, sole/base construction, hardware and branding placement across all panels. No redesign, mutation, color drift or material drift between views.`;
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
      hero: 'Lateral outer-side product view at shoe level, clean perspective, entire footwear visible with no perspective distortion hiding the silhouette.',
      detail: 'True outsole bottom view showing tread geometry, rubber zones and sole construction.',
      model: `On-foot fashion lookbook view of a ${model}, framed primarily from knee-down so the exact footwear remains the hero.`,
      extra: 'True top-down dorsal view showing toe shape, eyestay/closure, tongue and material zoning.'
    };
  }
  if (spec.productType === 'Apparel') {
    return {
      hero: 'Front garment view / clean editorial flat lay showing full cut and tailoring.',
      detail: 'Back garment view showing rear construction, seams and details.',
      model: `Full-body lookbook view of a ${model} wearing the exact same garment design.`,
      extra: 'Three-quarter detail view showing material, hardware and construction.'
    };
  }
  return {
    hero: 'Front product view showing full accessory structure and proportions.',
    detail: 'Rear or underside product view showing functional construction.',
    model: `Lookbook view of a ${model} naturally carrying or interacting with the exact same accessory.`,
    extra: 'Three-quarter detail view showing hardware, compartments and material transitions.'
  };
}

function coreBrief(spec) {
  return [
    `PRODUCT: ${spec.productType} — ${spec.silhouette.name}.`,
    brandHierarchy(spec),
    `Base silhouette traits: ${spec.silhouette.traits}.`,
    collabLine(spec),
    `Aesthetic direction: ${spec.aesthetic.name}. ${spec.aesthetic.productDNA}`,
    materialLine(spec),
    `Fit / proportion direction: ${spec.fitStyle}.`,
    footwearArchitecture(spec),
    componentLine(spec),
    spec.pattern && spec.pattern !== 'Solid Color (No Pattern)' ? `Surface pattern: ${spec.pattern}; adapt it to real panel geometry rather than pasting it uniformly over every surface.` : 'Surface pattern: solid / material-led unless otherwise specified.',
    spec.colorText,
    brandingLine(spec),
    consistencyLock(spec),
    ...spec.references
  ].filter(Boolean).join('\n');
}

function compositePrompt(spec) {
  const views = productViews(spec);
  let panels;
  if (spec.presentation.layoutType === 'diptych-horizontal') {
    panels = `DIPTYCH PRODUCT SHEET, two equal panels.\nLEFT — ${views.hero}\nRIGHT — ${views.detail}`;
  } else if (spec.presentation.layoutType === 'diptych-vertical') {
    panels = `VERTICAL DIPTYCH, two stacked panels.\nTOP — ${views.model}\nBOTTOM — ${views.hero}`;
  } else {
    const order = spec.presentation.layoutPos === 'Left'
      ? [views.model, views.hero, views.detail]
      : spec.presentation.layoutPos === 'Right'
        ? [views.hero, views.detail, views.model]
        : [views.hero, views.model, views.detail];
    panels = `TRIPTYCH PRODUCT SHEET, exactly three clean vertical panels with equal visual weight.\nLEFT — ${order[0]}\nCENTER — ${order[1]}\nRIGHT — ${order[2]}`;
  }
  return `${coreBrief(spec)}\n\nPRESENTATION:\n${panels}\n${spec.model.background}\nLighting should reveal real material texture and construction without changing the product between panels. Avoid fake UI, captions, borders inside panels, floating text and watermark artifacts.`;
}

function panelPack(spec) {
  const views = productViews(spec);
  const base = coreBrief(spec);
  return [
    ['01 HERO / LATERAL', views.hero],
    ['02 ON-BODY / ON-FOOT', views.model],
    ['03 STRUCTURAL DETAIL', views.detail],
    ['04 TOP / THREE-QUARTER', views.extra]
  ].map(([title,view])=>`### ${title}\n${base}\n\nVIEW: ${view}\n${spec.model.background}\nGenerate only this single view. Do not add a collage or extra panels.`).join('\n\n---\n\n');
}

function negativeText(spec) {
  const negatives = [
    'design mutation between views',
    'different colorway between panels',
    'different lacing or hardware between panels',
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
