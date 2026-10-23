import {
  FASHION_CATEGORIES,
  ALL_BRANDS,
  COLLAB_ARTISTS,
  COLLAB_IPS,
  IP_CHARACTER_COLOR_DNA,
  BRAND_PATTERNS,
  ARTIST_PATTERNS,
  GLOBAL_PATTERNS,
  BRAND_COLOR_DNA,
  ARTIST_COLOR_DNA,
  AESTHETIC_COLOR_DNA,
  AESTHETIC_THEMES,
  getGarmentMenuCategories,
  getGarmentsList,
  DYNAMIC_FITS,
  DESIGN_COMPONENTS,
  DESIGN_STYLES,
  GENDERS,
  ASPECT_RATIOS
} from '../data/fashionData.js';
import { FOOTWEAR_OPTIONS } from '../data/designDNA.js';

export const SMART_LOCK_DEFS = [
  ['product', 'Product Type'],
  ['brand', 'Brand + Category'],
  ['coBrand', 'Co-Brand'],
  ['collab', 'Collaboration'],
  ['silhouette', 'Base Silhouette'],
  ['materials', 'Materials'],
  ['structure', 'Fit + Structure'],
  ['aesthetic', 'Aesthetic'],
  ['designStyle', 'Design Approach'],
  ['pattern', 'Pattern'],
  ['colors', 'Colors'],
  ['model', 'Model'],
  ['background', 'Background'],
  ['layout', '2/3 Panel Layout']
];

export const EMPTY_RANDOM_LOCKS = Object.fromEntries(SMART_LOCK_DEFS.map(([key]) => [key, false]));

const choice = (items, rng) => items[Math.floor(rng() * items.length)];
const shuffled = (items, rng) => [...items].sort(() => rng() - 0.5);

function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function sensiblePalette(rng) {
  const baseHue = Math.floor(rng() * 360);
  const isDark = rng() > 0.5;
  const baseL = isDark ? 15 + rng() * 20 : 75 + rng() * 15;
  const baseS = 30 + rng() * 50;
  const color1 = hslToHex(baseHue, baseS, baseL);
  const secHue = (baseHue + (rng() > 0.5 ? 30 : -30) + 360) % 360;
  const color2 = hslToHex(secHue, 10 + rng() * 20, isDark ? 65 + rng() * 20 : 25 + rng() * 20);
  const accentHue = (baseHue + 180 + (rng() * 40 - 20)) % 360;
  const color3 = hslToHex(accentHue, 70 + rng() * 30, 45 + rng() * 15);
  return [color1, color2, color3];
}

function brandCategory(brand, fallback) {
  return Object.entries(FASHION_CATEGORIES).find(([,value]) => value.brands.includes(brand))?.[0] || fallback;
}

export function deriveEffectiveLocks(current, locks = {}) {
  const effective = { ...EMPTY_RANDOM_LOCKS, ...locks };
  const dependencies = [];

  if (effective.silhouette) {
    if (!effective.product) dependencies.push('Base Silhouette lock also pins Product Type.');
    if (!effective.brand) dependencies.push('Base Silhouette lock also pins Brand + Category.');
    effective.product = true;
    effective.brand = true;
  }

  if (effective.structure && !effective.product) {
    effective.product = true;
    dependencies.push('Fit + Structure lock also pins Product Type.');
  }

  if (effective.materials && !effective.product) {
    effective.product = true;
    dependencies.push('Materials lock also pins Product Type so locked materials stay meaningful.');
  }

  if (effective.pattern) {
    const pattern = current.selectedPattern;
    if (BRAND_PATTERNS[current.brand]?.includes(pattern) && !effective.brand) {
      effective.brand = true;
      dependencies.push('Locked brand-specific Pattern also pins Brand + Category.');
    }
    if (current.coBrand !== 'None' && BRAND_PATTERNS[current.coBrand]?.includes(pattern) && !effective.coBrand) {
      effective.coBrand = true;
      dependencies.push('Locked co-brand Pattern also pins Co-Brand.');
    }
    if (
      current.collabType === 'Artist' &&
      current.collabArtist !== 'None' &&
      ARTIST_PATTERNS[current.collabArtist]?.includes(pattern) &&
      !effective.collab
    ) {
      effective.collab = true;
      dependencies.push('Locked artist Pattern also pins Collaboration.');
    }
  }

  if (effective.background && current.backgroundStyle === 'Auto (Match Aesthetic)' && !effective.aesthetic) {
    dependencies.push('Background is locked to Auto, so its resolved scene can still follow a randomized Aesthetic.');
  }

  return { effective, dependencies };
}

function randomCollab(rng) {
  if (rng() < 0.35) {
    return {
      collabType: 'Artist',
      collabArtist: 'None',
      collabIP: 'None',
      collabCharacter: '',
      customIPText: '',
      collabStrength: 40,
      collabScopes: { color: true, motif: true, material: false, construction: false, typography: false, branding: false }
    };
  }

  const useIP = rng() > 0.5;
  const strengthRoll = rng();
  const strength = strengthRoll < 0.25 ? 20 : strengthRoll < 0.7 ? 40 : strengthRoll < 0.93 ? 60 : 80;
  const scopes = {
    color: rng() > 0.15,
    motif: rng() > 0.1,
    material: rng() > 0.65,
    construction: rng() > 0.78,
    typography: rng() > 0.5,
    branding: rng() > 0.55
  };
  if (!Object.values(scopes).some(Boolean)) scopes.motif = true;

  if (useIP) {
    const ips = Object.keys(COLLAB_IPS).filter(k => !['None', 'Custom IP (Type Manual)'].includes(k));
    const collabIP = choice(ips, rng);
    return {
      collabType: 'IP',
      collabArtist: 'None',
      collabIP,
      collabCharacter: choice(COLLAB_IPS[collabIP], rng),
      customIPText: '',
      collabStrength: strength,
      collabScopes: scopes
    };
  }

  const artists = Object.keys(COLLAB_ARTISTS).filter(k => k !== 'None');
  return {
    collabType: 'Artist',
    collabArtist: choice(artists, rng),
    collabIP: 'None',
    collabCharacter: '',
    customIPText: '',
    collabStrength: strength,
    collabScopes: scopes
  };
}

function randomPattern({ brand, coBrand, collabType, collabArtist, collabScopes, whiteLabel }, rng) {
  if (rng() < 0.5) return 'Solid Color (No Pattern)';
  const global = Object.values(GLOBAL_PATTERNS).flat();
  const contextual = whiteLabel ? [] : [
    ...(BRAND_PATTERNS[brand] || []),
    ...(coBrand !== 'None' ? BRAND_PATTERNS[coBrand] || [] : []),
    ...(collabScopes?.motif && collabType === 'Artist' && collabArtist !== 'None' ? ARTIST_PATTERNS[collabArtist] || [] : [])
  ];
  const pool = contextual.length && rng() < 0.7 ? contextual : global;
  return choice(pool, rng);
}

function smartDesignStyle(aesthetic, rng) {
  const name = String(aesthetic).toLowerCase();
  let pool = Object.keys(DESIGN_STYLES);
  if (/cyber|tech|gorpcore|y2k|frutiger/.test(name)) {
    pool = ['Techwear / Tactical', 'Performance Engineering', 'Material Experiment', 'Deconstructed / Inside-Out'];
  } else if (/old money|academia|minimal|quiet/.test(name)) {
    pool = ['Quiet Luxury', 'Heritage Rework', 'Minimalist / Clean', 'Material Experiment'];
  } else if (/opium|goth/.test(name)) {
    pool = ['Deconstructed / Inside-Out', 'Sculptural / Avant-Garde', 'Material Experiment', 'Authentic & Ornate'];
  } else if (/pop|fairy|kawaii|frutiger/.test(name)) {
    pool = ['Playful / Pop', 'Material Experiment', 'Sculptural / Avant-Garde', 'Minimalist / Clean'];
  }
  return choice(pool.filter(x => DESIGN_STYLES[x]), rng);
}

function smartBackground(aesthetic, rng) {
  if (rng() < 0.62) return 'Auto (Match Aesthetic)';
  const name = String(aesthetic).toLowerCase();
  let pool = ['Clean Studio', 'Soft Gray Studio', 'Industrial Concrete', 'Urban / Street'];
  if (/cyber|opium|goth|synth|y2k/.test(name)) pool = ['Night Direct Flash', 'Industrial Concrete', 'Brutalist Gallery', 'Urban / Street'];
  else if (/gorpcore|outdoor|hiking|nature/.test(name)) pool = ['Outdoor Trail', 'Industrial Concrete', 'Auto (Match Aesthetic)'];
  else if (/old money|quiet|academia|minimal/.test(name)) pool = ['Soft Gray Studio', 'Luxury Showroom', 'Brutalist Gallery', 'Clean Studio'];
  else if (/cottage|resort|summer/.test(name)) pool = ['White Sand Beach', 'Clean Studio', 'Auto (Match Aesthetic)'];
  return choice(pool, rng);
}

function randomFootwear(baseName, rng) {
  const result = Object.fromEntries(Object.entries(FOOTWEAR_OPTIONS).map(([key]) => [
    key,
    key === 'distress' ? 'Pristine / new' : 'Preserve silhouette'
  ]));

  const structuralKeys = ['toe', 'upper', 'lacing', 'midsole', 'outsole', 'heel'];
  const overrideCountRoll = rng();
  const overrideCount = overrideCountRoll < 0.28 ? 0 : overrideCountRoll < 0.68 ? 1 : overrideCountRoll < 0.92 ? 2 : 3;
  const selectedKeys = shuffled(structuralKeys, rng).slice(0, overrideCount);

  for (const key of selectedKeys) {
    let options = FOOTWEAR_OPTIONS[key].filter(v => v !== 'Preserve silhouette');
    if (
      key === 'lacing' &&
      /Air Force|Dunk|Jordan 1|Blazer|Chuck|Old Skool|Samba|Gazelle|Superstar/i.test(baseName)
    ) {
      options = options.filter(v => v !== 'Slip-on construction');
    }
    result[key] = choice(options, rng);
  }

  if (rng() > 0.72) {
    result.distress = choice(FOOTWEAR_OPTIONS.distress.slice(1), rng);
  }

  return result;
}

function compatibleComponents(productType, footwear, rng) {
  const all = DESIGN_COMPONENTS[productType];
  const none = all[0];
  if (rng() < 0.38) return [none, none, productType === 'Footwear' ? none : all[0]];

  let pool = all.slice(1);
  if (productType === 'Footwear' && footwear) {
    if (/Gum outsole/i.test(footwear.outsole)) pool = pool.filter(v => v !== 'Gum Sole');
    if (/Vibram/i.test(footwear.outsole)) pool = pool.filter(v => v !== 'Vibram Sole');
    if (/Stacked platform/i.test(footwear.midsole)) pool = pool.filter(v => v !== 'Platform / Stacked Sole');
    if (/Zip\/shroud/i.test(footwear.lacing)) pool = pool.filter(v => v !== 'Zipper System / Zip-Up Shroud');
  }

  const count = rng() < 0.75 ? 1 : 2;
  const picked = shuffled(pool, rng).slice(0, count);
  return [
    picked[0] || none,
    picked[1] || none,
    productType === 'Footwear' ? none : all[0]
  ];
}

function chooseSilhouette(productType, brand, lockedMaterials, rng) {
  const menus = shuffled(getGarmentMenuCategories(productType), rng);
  const candidates = [];
  for (const menu of menus) {
    for (const garment of getGarmentsList(productType, menu, brand)) {
      const compatible = !lockedMaterials?.length || lockedMaterials.every(mat => garment.allowedMats?.includes(mat));
      if (compatible) candidates.push({ menu, garment });
    }
  }
  if (!candidates.length) return null;
  return choice(candidates, rng);
}

function paletteFor(next, rng) {
  if (rng() < 0.12) return { colorMode: 'Random', colors: sensiblePalette(rng) };

  if (rng() < 0.22 && next.selectedAesthetic !== 'None (Standard Fashion)' && AESTHETIC_COLOR_DNA[next.selectedAesthetic]) {
    return { colorMode: 'Aesthetic', colors: AESTHETIC_COLOR_DNA[next.selectedAesthetic] };
  }

  let palette = BRAND_COLOR_DNA[next.brand] || sensiblePalette(rng);
  if (next.collabScopes?.color && next.collabType === 'Artist' && next.collabArtist !== 'None') {
    palette = ARTIST_COLOR_DNA[next.collabArtist] || palette;
  } else if (next.collabScopes?.color && next.collabType === 'IP' && next.collabCharacter) {
    palette = IP_CHARACTER_COLOR_DNA[next.collabCharacter] || palette;
  }
  const co = next.coBrand !== 'None' ? BRAND_COLOR_DNA[next.coBrand] : null;
  return {
    colorMode: 'Auto',
    colors: [palette[0], palette[1] || '#FFFFFF', co?.[0] || palette[2] || '#000000']
  };
}

export function createSmartRandomState(current, locks = {}, rng = Math.random) {
  const { effective, dependencies } = deriveEffectiveLocks(current, locks);
  const next = { ...current };
  const notes = [...dependencies];

  if (!effective.product) next.productType = choice(['Apparel', 'Footwear', 'Accessories'], rng);

  if (!effective.brand) {
    const categories = Object.keys(FASHION_CATEGORIES);
    let category = choice(categories, rng);
    let candidates = FASHION_CATEGORIES[category].brands.filter(b => !effective.coBrand || b !== current.coBrand);
    if (!candidates.length) {
      category = brandCategory(current.brand, current.category);
      candidates = FASHION_CATEGORIES[category].brands.filter(b => b !== current.coBrand);
    }
    next.category = category;
    next.brand = choice(candidates, rng);
  } else {
    next.category = brandCategory(current.brand, current.category);
    next.brand = current.brand;
  }

  if (!effective.coBrand) {
    const coCandidates = ALL_BRANDS.filter(b => b !== next.brand);
    next.coBrandCat = 'All';
    next.coBrand = rng() > 0.8 ? choice(coCandidates, rng) : 'None';
  } else if (current.coBrand === next.brand) {
    next.coBrand = 'None';
    notes.push('Locked Co-Brand matched the randomized Main Brand, so Co-Brand was cleared to prevent self-collaboration.');
  }

  if (!effective.collab) {
    Object.assign(next, randomCollab(rng));
    if (effective.colors && next.collabScopes.color) {
      next.collabScopes = { ...next.collabScopes, color:false };
      notes.push('Collab Color scope was disabled because Colors are locked.');
    }
    if (effective.materials && next.collabScopes.material) {
      next.collabScopes = { ...next.collabScopes, material:false };
      notes.push('Collab Material scope was disabled because Materials are locked.');
    }
    if (effective.structure && next.collabScopes.construction) {
      next.collabScopes = { ...next.collabScopes, construction:false };
      notes.push('Collab Construction scope was disabled because Fit + Structure are locked.');
    }
    if (current.whiteLabel && (next.collabScopes.branding || next.collabScopes.typography)) {
      next.collabScopes = { ...next.collabScopes, branding:false, typography:false };
      notes.push('Branding/Typography collab scopes were disabled because White Label is active.');
    }
  } else if (current.whiteLabel && (current.collabScopes?.branding || current.collabScopes?.typography)) {
    notes.push('White Label and the locked Collaboration both request branding/typography; White Label will win in the final prompt.');
  }

  if (!effective.silhouette) {
    const lockedMaterials = effective.materials ? current.materials : null;
    const picked = chooseSilhouette(next.productType, next.brand, lockedMaterials, rng);
    if (picked) {
      next.menuCategory = picked.menu;
      next.baseGarment = picked.garment;
      next.availableGarments = getGarmentsList(next.productType, picked.menu, next.brand);
      next.customShapeText = '';
    } else {
      next.productType = current.productType;
      next.category = current.category;
      next.brand = current.brand;
      next.menuCategory = current.menuCategory;
      next.baseGarment = current.baseGarment;
      next.availableGarments = current.availableGarments;
      notes.push('No randomized silhouette was compatible with the locked materials; current product/brand/silhouette were preserved.');
    }
  } else {
    next.menuCategory = current.menuCategory;
    next.baseGarment = current.baseGarment;
    next.availableGarments = current.availableGarments;
  }

  if (
    !effective.collab &&
    next.collabStrength >= 80 &&
    next.collabScopes?.construction &&
    !String(next.baseGarment?.name || '').startsWith('Generic ')
  ) {
    next.collabStrength = 60;
    notes.push('Dominant Construction collab was reduced to 60% to preserve the named base silhouette.');
  }

  if (!effective.materials) {
    const allowed = next.baseGarment?.allowedMats?.length ? next.baseGarment.allowedMats : [];
    if (allowed.length) {
      const count = Math.min(allowed.length, 1 + Math.floor(rng() * 3));
      next.materials = shuffled(allowed, rng).slice(0, count);
    }
  }

  if (!effective.structure) {
    next.fitStyle = choice(DYNAMIC_FITS[next.productType], rng);
    next.footwear = next.productType === 'Footwear'
      ? randomFootwear(next.baseGarment?.name || '', rng)
      : current.footwear;

    const comps = compatibleComponents(next.productType, next.footwear, rng);
    next.designComponent1 = comps[0];
    next.designComponent2 = comps[1];
    next.designComponent3 = comps[2];

    if (next.productType === 'Footwear') {
      if (next.footwear.midsole === 'Stacked platform midsole' && next.fitStyle === 'Sleek / Aerodynamic') {
        next.fitStyle = 'Chunky / Oversized Sole';
        notes.push('Smart Random changed Fit to Chunky because a stacked platform midsole conflicts with Sleek / Aerodynamic.');
      }
      if (/Lugged trail|Vibram/.test(next.footwear.outsole) && next.fitStyle === 'Sleek / Aerodynamic') {
        next.fitStyle = 'Standard Profile';
        notes.push('Smart Random softened the Fit because a heavy trail outsole conflicts with Sleek / Aerodynamic.');
      }
    }
  }

  if (!effective.aesthetic) {
    const aesthetics = Object.keys(AESTHETIC_THEMES);
    next.selectedAesthetic = rng() > 0.28 ? choice(aesthetics, rng) : 'None (Standard Fashion)';
  }

  if (!effective.designStyle) next.designStyle = smartDesignStyle(next.selectedAesthetic, rng);
  if (!effective.pattern) next.selectedPattern = randomPattern(next, rng);
  if (!effective.background) next.backgroundStyle = smartBackground(next.selectedAesthetic, rng);
  if (!effective.model) next.gender = choice(GENDERS, rng);

  if (!effective.layout) {
    const ratios = Object.keys(ASPECT_RATIOS);
    const roll = rng();
    if (current.externalFaceReference) {
      next.aspectRatio = roll < 0.72 ? ratios[0] : ratios[2];
      if (ASPECT_RATIOS[next.aspectRatio]?.productOnly) next.aspectRatio = ratios[0];
    } else {
      next.aspectRatio = roll < 0.58 ? ratios[0] : roll < 0.82 ? ratios[1] : ratios[2];
    }
    next.layoutPos = ASPECT_RATIOS[next.aspectRatio]?.layoutType === 'triptych'
      ? choice(['Left', 'Center', 'Right'], rng)
      : current.layoutPos;
  }

  if (!effective.colors) {
    const resolved = paletteFor(next, rng);
    next.colorMode = resolved.colorMode;
    next.colors = [...resolved.colors];
    const activeCount = 1 + Math.floor(rng() * 3);
    next.c1Active = true;
    next.c2Active = activeCount >= 2;
    next.c3Active = activeCount >= 3;
  }

  return { next, effectiveLocks: effective, notes };
}
