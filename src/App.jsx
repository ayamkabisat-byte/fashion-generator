import React, { useState } from 'react';
import { Copy, Sparkles, Wand2, CheckCircle2, Shirt, Footprints, Briefcase, Camera, UploadCloud, Ghost, Palette, Gamepad2, Lock, Unlock } from 'lucide-react';

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
  ALL_MATS,
  UNRESTRICTED_MATS,
  ICONIC_DB,
  getGarmentMenuCategories,
  getGarmentsList,
  DYNAMIC_FITS,
  DESIGN_COMPONENTS,
  DESIGN_STYLES,
  BACKGROUND_STYLES,
  GENDERS,
  ASPECT_RATIOS
} from './data/fashionData.js';
import { FOOTWEAR_OPTIONS, COLLAB_SCOPE_OPTIONS, OUTPUT_TARGETS, OUTPUT_MODES } from './data/designDNA.js';
import { buildPrompt, catalogStats } from './engine/designEngine.js';
import { createSmartRandomState, SMART_LOCK_DEFS, EMPTY_RANDOM_LOCKS } from './engine/smartRandomEngine.js';

// --- HELPER FUNGSI WARNA ---
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

const generateSensiblePalette = () => {
  const baseHue = Math.floor(Math.random() * 360);
  const isDark = Math.random() > 0.5;
  const baseL = isDark ? 15 + Math.random() * 20 : 75 + Math.random() * 15;
  const baseS = 30 + Math.random() * 50;
  const color1 = hslToHex(baseHue, baseS, baseL);
  const secHue = (baseHue + (Math.random() > 0.5 ? 30 : -30) + 360) % 360;
  const secS = 10 + Math.random() * 20;
  const secL = isDark ? 65 + Math.random() * 20 : 25 + Math.random() * 20;
  const color2 = hslToHex(secHue, secS, secL);
  const accentHue = (baseHue + 180 + (Math.random() * 40 - 20)) % 360;
  const accentS = 70 + Math.random() * 30;
  const accentL = 45 + Math.random() * 15;
  const color3 = hslToHex(accentHue, accentS, accentL);
  return [color1, color2, color3];
};



export default function App() {
  // --- STATE: PRODUCT SELECTION ---
  const [productType, setProductType] = useState('Apparel');
  const [category, setCategory] = useState('Streetwear');
  const [brand, setBrand] = useState('Off-White');
  const [coBrandCat, setCoBrandCat] = useState('All');
  const [coBrand, setCoBrand] = useState('None');
  const [collabType, setCollabType] = useState('Artist');
  const [collabArtist, setCollabArtist] = useState('None');
  const [collabIP, setCollabIP] = useState('None');
  const [collabCharacter, setCollabCharacter] = useState('');
  const [customIPText, setCustomIPText] = useState('');

  const [menuCategory, setMenuCategory] = useState('Casual Wear');
  const [availableGarments, setAvailableGarments] = useState(getGarmentsList('Apparel', 'Casual Wear', 'Off-White'));
  const [baseGarment, setBaseGarment] = useState(availableGarments[0]);
  const [customShapeText, setCustomShapeText] = useState('');

  const [materials, setMaterials] = useState(['Cotton / Canvas']);
  const [fitStyle, setFitStyle] = useState('Regular Fit');
  const [designComponent1, setDesignComponent1] = useState('None (Standard Cut)');
  const [designComponent2, setDesignComponent2] = useState('None (Standard Cut)');
  const [designComponent3, setDesignComponent3] = useState('None (Standard Structure)');

  const [selectedAesthetic, setSelectedAesthetic] = useState('None (Standard Fashion)');
  const [designStyle, setDesignStyle] = useState('Authentic & Ornate');
  const [selectedPattern, setSelectedPattern] = useState("Solid Color (No Pattern)");
  const [backgroundStyle, setBackgroundStyle] = useState('Auto (Match Aesthetic)');

  const [gender, setGender] = useState('Female');
  const [aspectRatio, setAspectRatio] = useState("16:9 (Desktop/Landscape)");
  const [layoutPos, setLayoutPos] = useState('Center');
  const [whiteLabel, setWhiteLabel] = useState(false);
  const [externalDesignReference, setExternalDesignReference] = useState(false);
  const [externalFaceReference, setExternalFaceReference] = useState(false);
  const [collabStrength, setCollabStrength] = useState(40);
  const [collabScopes, setCollabScopes] = useState({
    color: true, motif: true, material: false, construction: false, typography: true, branding: true
  });
  const [outputTarget, setOutputTarget] = useState('Universal');
  const [outputMode, setOutputMode] = useState('Composite Sheet');
  const [footwear, setFootwear] = useState({
    toe: 'Preserve silhouette',
    upper: 'Preserve silhouette',
    lacing: 'Preserve silhouette',
    midsole: 'Preserve silhouette',
    outsole: 'Preserve silhouette',
    heel: 'Preserve silhouette',
    distress: 'Pristine / new'
  });
  const [warnings, setWarnings] = useState([]);
  const [randomLocks, setRandomLocks] = useState({ ...EMPTY_RANDOM_LOCKS });
  const [randomizerNotes, setRandomizerNotes] = useState([]);

  // --- STATE: COLORS (WITH INDIVIDUAL TOGGLES) ---
  const [colorMode, setColorMode] = useState('Brand');
  const [colors, setColors] = useState(['#FFFFFF', '#000000', '#FF0000']);
  const [c1Active, setC1Active] = useState(true);
  const [c2Active, setC2Active] = useState(true);
  const [c3Active, setC3Active] = useState(true);

  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const catalog = catalogStats(ICONIC_DB);
  const currentPatternChoices = [
    ...Object.values(GLOBAL_PATTERNS).flat(),
    ...(BRAND_PATTERNS[brand] || []),
    ...(coBrand !== 'None' ? BRAND_PATTERNS[coBrand] || [] : []),
    ...(collabType === 'Artist' && collabArtist !== 'None' ? ARTIST_PATTERNS[collabArtist] || [] : [])
  ];
  const lockedPatternOutsideCurrentMenu = randomLocks.pattern && !currentPatternChoices.includes(selectedPattern);

  // --- HANDLERS ---
  const handleProductTypeChange = (type) => {
    setProductType(type);
    setFitStyle(DYNAMIC_FITS[type][0]);
    setDesignComponent1(DESIGN_COMPONENTS[type][0]);
    setDesignComponent2(DESIGN_COMPONENTS[type][0]);
    setDesignComponent3(DESIGN_COMPONENTS[type][0]);
    setCustomShapeText('');
    const newMenuCat = type === 'Apparel' ? "Casual Wear" : "Iconic Silhouette";
    setMenuCategory(newMenuCat);

    const newGarments = getGarmentsList(type, newMenuCat, brand);
    setAvailableGarments(newGarments);
    setBaseGarment(newGarments[0]);

    // Reset materials based on new garment
    const firstAllowed = newGarments[0]?.allowedMats?.[0] || ALL_MATS[0];
    setMaterials([firstAllowed]);
  };

  const handleMenuCategoryChange = (mCat) => {
    setMenuCategory(mCat);
    const newGarments = getGarmentsList(productType, mCat, brand);
    setAvailableGarments(newGarments);
    setBaseGarment(newGarments[0]);
    setCustomShapeText('');

    const firstAllowed = newGarments[0]?.allowedMats?.[0] || ALL_MATS[0];
    setMaterials([firstAllowed]);
  };

  const handleBrandChange = (bName) => {
    setBrand(bName);
    setSelectedPattern("Solid Color (No Pattern)");
    if (BRAND_COLOR_DNA[bName]) applyAutoColors(bName, coBrand);

    if (productType !== 'Apparel' && menuCategory === 'Iconic Silhouette') {
      const newGarments = getGarmentsList(productType, 'Iconic Silhouette', bName);
      setAvailableGarments(newGarments);
      setBaseGarment(newGarments[0]);
      setCustomShapeText('');

      const firstAllowed = newGarments[0]?.allowedMats?.[0] || ALL_MATS[0];
      setMaterials([firstAllowed]);
    }
  };

  const handleGarmentChange = (gName) => {
    const selected = availableGarments.find(g => g.name === gName);
    if (selected) {
      setBaseGarment(selected);
      setCustomShapeText('');
      const validMaterials = materials.filter(m => selected.allowedMats.includes(m));
      if (validMaterials.length === 0) setMaterials([selected.allowedMats[0]]);
      else setMaterials(validMaterials);
    }
  };

  const toggleMaterial = (mat) => {
    if (materials.includes(mat)) {
      if (materials.length > 1) setMaterials(materials.filter(m => m !== mat));
    } else {
      if (materials.length < 3) setMaterials([...materials, mat]);
    }
  };

  const handleAestheticChange = (value) => {
    setSelectedAesthetic(value);
    if (colorMode === 'Aesthetic') {
      const aesColor = AESTHETIC_COLOR_DNA[value];
      if (aesColor) {
        setColors([aesColor[0], aesColor[1], aesColor[2]]);
        setC1Active(true); setC2Active(true); setC3Active(true);
      }
    }
  };

  // --- COLOR SYSTEM HANDLERS ---
  const applyAutoColors = (currentBrand = brand, currentCoBrand = coBrand) => {
    setColorMode('Auto');
    let bColor = BRAND_COLOR_DNA[currentBrand];
    let cbColor = currentCoBrand !== "None" ? BRAND_COLOR_DNA[currentCoBrand] : null;

    if (collabScopes.color && collabType === 'Artist' && collabArtist !== "None") bColor = ARTIST_COLOR_DNA[collabArtist] || bColor;
    else if (collabScopes.color && collabType === 'IP' && collabCharacter !== "") bColor = IP_CHARACTER_COLOR_DNA[collabCharacter] || bColor;

    if (bColor) {
      setColors([bColor[0], bColor[1] || '#FFFFFF', cbColor ? cbColor[0] : (bColor[2] || '#000000')]);
      setC1Active(true); setC2Active(true); setC3Active(true);
    }
  };

  const handleColorChange = (index, value) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
    setColorMode('Custom');
    if (index === 0) setC1Active(true);
    if (index === 1) setC2Active(true);
    if (index === 2) setC3Active(true);
  };

  const applyRandomPalette = () => {
    setColorMode('Random');
    const newColors = generateSensiblePalette();
    setColors([newColors[0], newColors[1], newColors[2]]);
    setC1Active(true); setC2Active(true); setC3Active(true);
  };

  const applyAestheticColors = () => {
    setColorMode('Aesthetic');
    const aesColor = AESTHETIC_COLOR_DNA[selectedAesthetic];
    if (aesColor) {
      setColors([aesColor[0], aesColor[1], aesColor[2]]);
      setC1Active(true); setC2Active(true); setC3Active(true);
    }
  };

  const toggleCollabScope = (key) => {
    setCollabScopes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateFootwear = (key, value) => {
    setFootwear(prev => ({ ...prev, [key]: value }));
  };

  const toggleRandomLock = (key) => {
    setRandomLocks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const lockAllRandom = () => {
    setRandomLocks(Object.fromEntries(SMART_LOCK_DEFS.map(([key]) => [key, true])));
  };

  const unlockAllRandom = () => {
    setRandomLocks({ ...EMPTY_RANDOM_LOCKS });
  };

  const getCoBrandList = () => {
    if (coBrandCat === 'All') return ALL_BRANDS.filter(b => b !== brand);
    return FASHION_CATEGORIES[coBrandCat].brands.filter(b => b !== brand);
  };

  const smartRandomize = () => {
    const current = {
      productType, category, brand, coBrandCat, coBrand,
      collabType, collabArtist, collabIP, collabCharacter, customIPText,
      collabStrength, collabScopes,
      menuCategory, availableGarments, baseGarment, customShapeText,
      materials, fitStyle,
      designComponent1, designComponent2, designComponent3,
      footwear,
      selectedAesthetic, designStyle, selectedPattern, backgroundStyle,
      gender, aspectRatio, layoutPos,
      colorMode, colors, c1Active, c2Active, c3Active
    };

    const { next, notes } = createSmartRandomState(current, randomLocks);

    setProductType(next.productType);
    setCategory(next.category);
    setBrand(next.brand);
    setCoBrandCat(next.coBrandCat);
    setCoBrand(next.coBrand);

    setCollabType(next.collabType);
    setCollabArtist(next.collabArtist);
    setCollabIP(next.collabIP);
    setCollabCharacter(next.collabCharacter);
    setCustomIPText(next.customIPText);
    setCollabStrength(next.collabStrength);
    setCollabScopes(next.collabScopes);

    setMenuCategory(next.menuCategory);
    setAvailableGarments(next.availableGarments);
    setBaseGarment(next.baseGarment);
    setCustomShapeText(next.customShapeText);
    setMaterials(next.materials);

    setFitStyle(next.fitStyle);
    setDesignComponent1(next.designComponent1);
    setDesignComponent2(next.designComponent2);
    setDesignComponent3(next.designComponent3);
    setFootwear(next.footwear);

    setSelectedAesthetic(next.selectedAesthetic);
    setDesignStyle(next.designStyle);
    setSelectedPattern(next.selectedPattern);
    setBackgroundStyle(next.backgroundStyle);

    setGender(next.gender);
    setAspectRatio(next.aspectRatio);
    setLayoutPos(next.layoutPos);

    setColorMode(next.colorMode);
    setColors(next.colors);
    setC1Active(next.c1Active);
    setC2Active(next.c2Active);
    setC3Active(next.c3Active);

    setRandomizerNotes(notes);
    setWarnings([]);
    setPrompt('');
  };

  const generatePrompt = () => {
    let resolvedBase = baseGarment;
    if (productType === 'Accessories' && baseGarment?.name === "Custom Shape (Type Manual)" && customShapeText.trim()) {
      resolvedBase = {
        name: customShapeText.trim(),
        traits: `literal functional ${customShapeText.trim().toLowerCase()} structural form`,
        allowedMats: baseGarment.allowedMats
      };
    }

    const result = buildPrompt({
      productType, category, brand, coBrand, coBrandCategory: coBrandCat,
      collabType, collabArtist, collabIP, collabCharacter, customIPText,
      collabStrength, collabScopes,
      baseGarment: resolvedBase,
      materials, fitStyle, designStyle: DESIGN_STYLES[designStyle],
      components: [designComponent1, designComponent2, designComponent3],
      selectedAesthetic, selectedPattern, backgroundStyle,
      colors, colorActive: [c1Active, c2Active, c3Active],
      whiteLabel, gender, aspectRatio, layoutPos,
      outputTarget, outputMode, footwear,
      externalDesignReference, externalFaceReference
    });
    setPrompt(result.prompt);
    setWarnings(result.spec.warnings);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (prompt) {
      const el = document.createElement('textarea');
      el.value = prompt;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderVisualPreview = () => {
    const currentLayoutData = ASPECT_RATIOS[aspectRatio];
    if (outputMode === 'Panel Prompt Pack') {
      return (
        <div className="w-full grid grid-cols-2 gap-2 mb-5">
          {['01 HERO','02 ON-BODY','03 DETAIL','04 TOP / 3Q'].map((label,i)=>(
            <div key={label} className="aspect-[4/3] rounded-xl border border-neutral-800 bg-neutral-950 flex items-center justify-center relative">
              {i===1 ? <span className="text-2xl">📸</span> : productType==='Footwear' ? <Footprints className="w-7 h-7 text-neutral-600"/> : productType==='Accessories' ? <Briefcase className="w-7 h-7 text-neutral-600"/> : <Shirt className="w-7 h-7 text-neutral-600"/>}
              <span className="absolute bottom-2 text-[8px] font-bold tracking-wider text-neutral-500">{label}</span>
            </div>
          ))}
        </div>
      );
    }
    let bgStyleStr = '#e5e5e5';

    if (selectedAesthetic !== "None (Standard Fashion)") {
      const aesName = selectedAesthetic.toLowerCase();
      if (aesName.includes('opium') || aesName.includes('cyber') || aesName.includes('dark')) bgStyleStr = 'linear-gradient(to bottom, #1a0b16, #000000)';
      else if (aesName.includes('cottage') || aesName.includes('forest')) bgStyleStr = 'linear-gradient(to bottom, #dcedc8, #aed581)';
      else if (aesName.includes('y2k') || aesName.includes('fairy')) bgStyleStr = 'linear-gradient(to bottom, #ff4081, #7c4dff)';
    } else {
      if (backgroundStyle === 'Cyberpunk City') bgStyleStr = 'linear-gradient(to bottom, #2b0b3a, #0f172a)';
      if (backgroundStyle === 'Urban / Street') bgStyleStr = 'linear-gradient(to bottom, #1a1a2e, #0f172a)';
      if (backgroundStyle === 'White Sand Beach') bgStyleStr = 'linear-gradient(to bottom, #00BFFF, #F5DEB3)';
    }

    const ProductIcon = productType === 'Footwear' ? Footprints : productType === 'Accessories' ? Briefcase : Shirt;

    const ModelNode = (
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-[1.02]" style={{ background: bgStyleStr }}>
        <span className={`absolute text-[9px] font-bold bottom-2 tracking-widest ${backgroundStyle === 'Clean Studio' ? 'text-neutral-500' : 'text-red-400 mix-blend-difference'}`}>MODEL / LIFESTYLE</span>
        <div className={`w-8 h-20 md:h-24 rounded-full flex items-center justify-center ${backgroundStyle === 'Clean Studio' ? 'bg-neutral-300' : 'bg-white/20 border border-white/50 shadow-lg relative'}`}>
          📸
          {externalFaceReference && <span className="absolute -top-2 -right-2 text-[10px]" title="Strict Face Protection">🔒</span>}
        </div>
      </div>
    );

    const FrontNode = (
      <div className="flex-1 border-neutral-800/50 flex flex-col items-center justify-center relative bg-white/5 border-r border-t transition-all duration-300 hover:bg-white/10">
        <span className="absolute text-[9px] font-bold text-neutral-500 bottom-2 tracking-widest">PRODUCT</span>
        <ProductIcon className="w-8 h-8 text-neutral-600 opacity-50" />
      </div>
    );

    const BackNode = (
      <div className="flex-1 border-neutral-800/50 flex flex-col items-center justify-center relative bg-white/5 border-l transition-all duration-300 hover:bg-white/10">
        <span className="absolute text-[9px] font-bold text-neutral-500 bottom-2 tracking-widest">DETAIL</span>
        <div className="w-8 h-8 md:w-10 md:h-10 border-2 border-dashed border-neutral-600 rounded-md opacity-40"></div>
      </div>
    );

    if (currentLayoutData.layoutType === 'diptych-vertical') {
      return (
        <div className="aspect-[9/16] w-[160px] md:w-[200px] mx-auto bg-neutral-950 border border-neutral-800 rounded-2xl mb-5 flex flex-col overflow-hidden shadow-inner transition-all duration-300 hover:shadow-xl hover:border-neutral-700">
          {ModelNode}
          {FrontNode}
        </div>
      );
    } else if (currentLayoutData.layoutType === 'diptych-horizontal') {
      return (
        <div className="aspect-[16/9] w-full bg-neutral-950 border border-neutral-800 rounded-2xl mb-5 flex overflow-hidden shadow-inner transition-all duration-300 hover:shadow-xl hover:border-neutral-700">
          {FrontNode}
          {BackNode}
        </div>
      );
    }

    const getNodes = () => {
      if (layoutPos === 'Center') return [FrontNode, ModelNode, BackNode];
      if (layoutPos === 'Left') return [ModelNode, FrontNode, BackNode];
      return [FrontNode, BackNode, ModelNode];
    };

    return (
      <div className="aspect-[16/9] w-full bg-neutral-950 border border-neutral-800 rounded-2xl mb-5 flex overflow-hidden shadow-inner transition-all duration-300 hover:shadow-xl hover:border-neutral-700">
        {getNodes().map((node, i) => React.cloneElement(node, { key: i }))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 p-2 md:p-6 font-sans selection:bg-red-500/30">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 backdrop-blur-sm transition-all duration-300 hover:bg-neutral-900/70">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 hidden md:flex transition-transform duration-300 hover:scale-105">
              <Gamepad2 className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Fashion Design Lab <span className="text-red-500">Ultimate</span></h1>
              <p className="text-neutral-400 text-[11px] md:text-xs font-medium">Canonical Product Design Engine · {catalog.footwear} footwear + {catalog.accessories} accessory silhouettes · Consistency Lock</p>
            </div>
          </div>
          <button onClick={smartRandomize} className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)]">
            <Sparkles className="w-4 h-4 transition-transform duration-500 group-hover:rotate-12" /> SMART RANDOMIZE {Object.values(randomLocks).some(Boolean) ? `· ${Object.values(randomLocks).filter(Boolean).length} LOCKED` : ''}
          </button>
        </div>

        <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-3 md:p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest text-neutral-300 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Smart Random Locks
                <span className="text-[9px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                  {Object.values(randomLocks).filter(Boolean).length} locked
                </span>
              </div>
              <p className="text-[9px] text-neutral-500 mt-1">Locks affect SMART RANDOMIZE only. You can still edit every parameter manually.</p>
            </div>
            <div className="flex gap-1.5">
              <button type="button" onClick={lockAllRandom} className="text-[9px] font-bold px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20">
                Lock All
              </button>
              <button type="button" onClick={unlockAllRandom} className="text-[9px] font-bold px-2.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white">
                Unlock All
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SMART_LOCK_DEFS.map(([key,label]) => (
              <button key={key} type="button" onClick={() => toggleRandomLock(key)}
                className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${randomLocks[key] ? 'border-amber-500/50 bg-amber-500/15 text-amber-200' : 'border-neutral-800 bg-neutral-950 text-neutral-500 hover:text-neutral-300'}`}
                title={randomLocks[key] ? `Unlock ${label} from Smart Random` : `Lock ${label} from Smart Random`}>
                {randomLocks[key] ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {label}
              </button>
            ))}
          </div>
          {randomizerNotes.length > 0 && (
            <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-2.5 text-[9px] text-cyan-200">
              <b className="block mb-1">Smart Random resolver</b>
              {randomizerNotes.map((note,i)=><div key={i}>• {note}</div>)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <div className="lg:col-span-8 space-y-5 bg-[#0a0a0a] border border-neutral-800 p-4 lg:p-6 rounded-[2rem] shadow-2xl transition-all duration-300 hover:shadow-red-500/5">

            {/* TABS: PRODUCT TYPE */}
            <div className="flex bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
              {['Apparel', 'Footwear', 'Accessories'].map(type => (
                <button key={type} onClick={() => handleProductTypeChange(type)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                    productType === type ? 'bg-red-500 text-white shadow-md scale-[1.02]' : 'text-neutral-500 hover:text-white hover:bg-neutral-800'
                  } focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-900`}>
                  {type === 'Apparel' && <Shirt className="w-4 h-4" />}
                  {type === 'Footwear' && <Footprints className="w-4 h-4" />}
                  {type === 'Accessories' && <Briefcase className="w-4 h-4" />}
                  {type}
                </button>
              ))}
            </div>

            {/* STEP 1: Brand & Collab */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-[9px] text-red-500">1</span>
                  Brand Concept & Collab
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-neutral-500 flex items-center gap-1"><Ghost className="w-3 h-3" /> WHITE LABEL</span>
                  <button
                    role="switch"
                    aria-checked={whiteLabel}
                    onClick={() => setWhiteLabel(!whiteLabel)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-900 ${
                      whiteLabel ? 'bg-red-500' : 'bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
                        whiteLabel ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-6 gap-1 p-1 bg-neutral-900 rounded-xl border border-neutral-800 mb-2">
                {Object.keys(FASHION_CATEGORIES).map(cat => (
                  <button key={cat} onClick={() => { setCategory(cat); handleBrandChange(FASHION_CATEGORIES[cat].brands[0]); }}
                    className={`text-[10px] font-bold py-2 px-1 rounded-lg transition-all text-center duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      category === cat ? 'bg-neutral-800 text-white shadow border border-neutral-700' : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50'
                    }`}>
                    {cat.split('/')[0].trim()}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* MAIN BRAND & CO-BRAND */}
                <div className="flex flex-col gap-2">
                  <select value={brand} onChange={(e) => handleBrandChange(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm font-bold rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none p-2.5 transition-all duration-200 hover:border-neutral-700">
                    {FASHION_CATEGORIES[category].brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>

                  <div className="flex gap-1">
                    <select value={coBrandCat} onChange={(e) => { setCoBrandCat(e.target.value); setCoBrand("None"); }} className="w-1/3 bg-neutral-900 border border-neutral-800 text-neutral-400 text-[10px] font-bold rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none p-2.5 text-center transition-all duration-200 hover:border-neutral-700">
                      <option value="All">All Cats</option>
                      {Object.keys(FASHION_CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={coBrand} onChange={(e) => setCoBrand(e.target.value)} className="w-2/3 bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-bold rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none p-2.5 pl-4 transition-all duration-200 hover:border-neutral-700">
                      <option value="None">-- No Co-Brand --</option>
                      {getCoBrandList().map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                {/* IP / ARTIST COLLAB */}
                <div className="bg-red-950/10 border border-red-500/20 rounded-xl p-2 flex flex-col gap-2 transition-all duration-200 hover:border-red-500/40">
                  <div className="flex bg-neutral-950 rounded-lg p-0.5">
                    <button onClick={() => setCollabType('Artist')} className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      collabType === 'Artist' ? 'bg-red-500 text-white' : 'text-neutral-500 hover:text-neutral-300'
                    }`}>Designer / Artist</button>
                    <button onClick={() => setCollabType('IP')} className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      collabType === 'IP' ? 'bg-blue-500 text-white' : 'text-neutral-500 hover:text-neutral-300'
                    }`}>Pop-Culture IP</button>
                  </div>

                  {collabType === 'Artist' ? (
                    <select value={collabArtist} onChange={(e) => setCollabArtist(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 text-red-300 text-xs font-bold rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none p-2 transition-all duration-200 hover:border-neutral-700">
                      {Object.keys(COLLAB_ARTISTS).map(c => <option key={c} value={c} className="text-white">{c}</option>)}
                    </select>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <select value={collabIP} onChange={(e) => { setCollabIP(e.target.value); if(e.target.value !== "None" && e.target.value !== "Custom IP (Type Manual)") setCollabCharacter(COLLAB_IPS[e.target.value][0]); }} className="w-1/2 bg-neutral-900 border border-neutral-800 text-blue-300 text-xs font-bold rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none p-2 transition-all duration-200 hover:border-neutral-700">
                          <option value="None">-- No IP --</option>
                          {Object.keys(COLLAB_IPS).filter(k => k !== "None").map(ip => <option key={ip} value={ip} className="text-white">{ip}</option>)}
                        </select>
                        <select value={collabCharacter} onChange={(e) => setCollabCharacter(e.target.value)} disabled={collabIP === "None" || collabIP === "Custom IP (Type Manual)"} className={`w-1/2 bg-neutral-900 border border-neutral-800 text-blue-300 text-[10px] font-bold rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none p-2 transition-all duration-200 ${
                          (collabIP === "None" || collabIP === "Custom IP (Type Manual)") ? 'opacity-50' : 'hover:border-neutral-700'
                        }`}>
                          {collabIP !== "None" && collabIP !== "Custom IP (Type Manual)" && COLLAB_IPS[collabIP].map(char => <option key={char} value={char} className="text-white">{char}</option>)}
                          {collabIP === "None" && <option>Select IP First</option>}
                          {collabIP === "Custom IP (Type Manual)" && <option>Custom Entry</option>}
                        </select>
                      </div>
                      {collabIP === "Custom IP (Type Manual)" && (
                        <input
                          type="text"
                          value={customIPText}
                          onChange={(e) => setCustomIPText(e.target.value)}
                          placeholder="Type character or IP name (e.g., Optimus Prime)"
                          className="w-full bg-neutral-900 border border-blue-500/50 text-white text-xs p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3 bg-neutral-900/50 border border-neutral-800 rounded-xl p-3">
              <label className="text-[10px] font-bold text-neutral-400">
                COLLAB INFLUENCE
                <select value={collabStrength} onChange={(e)=>setCollabStrength(Number(e.target.value))}
                  className="mt-1 w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white text-xs">
                  <option value={20}>Subtle · 20%</option>
                  <option value={40}>Balanced · 40%</option>
                  <option value={60}>Strong · 60%</option>
                  <option value={80}>Dominant · 80%</option>
                </select>
              </label>
              <div>
                <div className="text-[10px] font-bold text-neutral-400 mb-1">COLLAB SCOPE</div>
                <div className="flex flex-wrap gap-1.5">
                  {COLLAB_SCOPE_OPTIONS.map(([key,label]) => (
                    <button key={key} type="button" onClick={()=>toggleCollabScope(key)}
                      className={`text-[9px] px-2 py-1.5 rounded-lg border transition-all ${collabScopes[key] ? 'bg-red-500/20 border-red-500 text-red-200' : 'bg-neutral-950 border-neutral-800 text-neutral-500'}`}>
                      {collabScopes[key] ? '✓ ' : ''}{label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-neutral-800/50"></div>

            {/* STEP 2: Base Inspiration */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-[10px] text-red-500">2</span>
                Base Inspiration ({productType}) · {availableGarments.length} options
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select value={menuCategory} onChange={(e) => handleMenuCategoryChange(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs font-bold rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none p-3 transition-all duration-200 hover:border-neutral-700">
                  {getGarmentMenuCategories(productType).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select value={baseGarment?.name || ""} onChange={(e) => handleGarmentChange(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs font-semibold rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none p-3 transition-all duration-200 hover:border-neutral-700">
                  {availableGarments.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
                </select>
              </div>
              {baseGarment && (
                <div className={`text-[10px] rounded-xl border p-2.5 ${baseGarment.name.startsWith('Generic ') ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-neutral-800 bg-neutral-950 text-neutral-500'}`}>
                  <b className="text-neutral-300">{baseGarment.name}</b> — {baseGarment.traits}
                  {baseGarment.name.startsWith('Generic ') && <span className="block mt-1 text-amber-300">Generic fallback: no named archival silhouette is stored for this brand/product combination.</span>}
                </div>
              )}

              {productType === 'Accessories' && baseGarment?.name === "Custom Shape (Type Manual)" && (
                <input
                  type="text"
                  value={customShapeText}
                  onChange={(e) => setCustomShapeText(e.target.value)}
                  placeholder="Describe custom shape (e.g., Brick Shape, Plastic Bag, Helmet)"
                  className="w-full bg-neutral-950 border border-orange-500/50 text-orange-200 font-bold text-xs p-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200"
                />
              )}
            </div>

            {/* STEP 3: Multi-Material */}
            <div className="space-y-3 bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 transition-all duration-200 hover:border-neutral-700">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-500/30 flex items-center justify-center text-[10px] text-red-500">3</span>
                  Mixed Materials (Max 3)
                </label>
                <span className={`text-[10px] font-bold px-2 py-1 rounded transition-colors duration-200 ${
                  materials.length === 3 ? 'bg-red-500 text-white' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {materials.length} / 3
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {ALL_MATS.map(mat => {
                  const isAllowed = baseGarment?.allowedMats?.includes(mat) ?? false;
                  const isSelected = materials.includes(mat);
                  const isMaxedOut = !isSelected && materials.length >= 3;
                  const isDisabled = !isAllowed || isMaxedOut;

                  return (
                    <button key={mat} onClick={() => toggleMaterial(mat)} disabled={isDisabled}
                      className={`text-left text-[10px] p-2 rounded-lg border transition-all duration-200 ${
                        isSelected ? 'border-red-500 bg-red-500/20 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)] scale-[1.02]' :
                        isDisabled ? 'border-neutral-800/50 bg-neutral-950 text-neutral-600 cursor-not-allowed opacity-30' :
                        'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200 hover:bg-neutral-800'
                      } focus:outline-none focus:ring-2 focus:ring-red-500`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold block truncate">{mat}</span>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-red-500 flex-shrink-0" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-[9px] text-red-500">4</span>
                  Structure & Components
                </label>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {DYNAMIC_FITS[productType].map(fit => (
                    <button key={fit} onClick={() => setFitStyle(fit)}
                      className={`text-left text-[10px] p-2.5 rounded-xl border transition-all duration-200 ${
                        fitStyle === fit ? 'border-red-500 bg-red-500/10 text-white' : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800'
                      } focus:outline-none focus:ring-2 focus:ring-red-500`}>
                      <span className="block font-bold">{fit}</span>
                    </button>
                  ))}
                </div>

                <div className={`grid gap-2 ${productType === 'Footwear' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <select value={designComponent1} onChange={(e) => setDesignComponent1(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-[10px] font-bold rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none p-2 truncate transition-all duration-200 hover:border-neutral-700">
                    {DESIGN_COMPONENTS[productType].map(comp => <option key={comp} value={comp}>Add: {comp}</option>)}
                  </select>
                  <select value={designComponent2} onChange={(e) => setDesignComponent2(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-[10px] font-bold rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none p-2 truncate transition-all duration-200 hover:border-neutral-700">
                    {DESIGN_COMPONENTS[productType].map(comp => <option key={comp} value={comp}>Add: {comp}</option>)}
                  </select>
                  {productType === 'Footwear' && (
                    <select value={designComponent3} onChange={(e) => setDesignComponent3(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 text-white text-[10px] font-bold rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none p-2 truncate transition-all duration-200 hover:border-neutral-700">
                      {DESIGN_COMPONENTS[productType].map(comp => <option key={comp} value={comp}>Add: {comp}</option>)}
                    </select>
                  )}
                </div>
              </div>

              {productType === 'Footwear' && (
                <div className="md:col-span-2 space-y-2 bg-orange-500/5 border border-orange-500/20 rounded-xl p-3">
                  <div className="text-[10px] font-black uppercase tracking-wider text-orange-300">Footwear Anatomy · optional overrides</div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {Object.entries(FOOTWEAR_OPTIONS).map(([key,values]) => (
                      <label key={key} className="text-[9px] uppercase text-neutral-500 font-bold">
                        {key}
                        <select value={footwear[key]} onChange={(e)=>updateFootwear(key,e.target.value)}
                          className="mt-1 w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-[10px] rounded-lg p-2 normal-case">
                          {values.map(v=><option key={v} value={v}>{v}</option>)}
                        </select>
                      </label>
                    ))}
                  </div>
                  <p className="text-[9px] text-neutral-500">“Preserve silhouette” keeps the selected iconic model authoritative; overrides modify only that anatomical layer.</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-[9px] text-red-500">5</span>
                  Aesthetic & Pattern
                </label>
                <select value={selectedAesthetic} onChange={(e) => handleAestheticChange(e.target.value)}
                  className="w-full bg-indigo-950 border border-indigo-500/50 text-indigo-200 text-xs font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none p-2.5 transition-all duration-200 hover:border-indigo-500">
                  <option value="None (Standard Fashion)">Select Aesthetic: None (Standard)</option>
                  {Object.values(AESTHETIC_THEMES).reduce((acc, aes) => {
                    if (!aes) return acc;
                    if (!acc.includes(aes.group)) acc.push(aes.group);
                    return acc;
                  }, []).map(group => (
                    <optgroup key={group} label={group}>
                      {Object.entries(AESTHETIC_THEMES).filter(([,v]) => v && v.group === group).map(([k]) => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                <select value={designStyle} onChange={(e) => setDesignStyle(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs font-bold rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none p-2.5 mt-2 transition-all duration-200 hover:border-neutral-700">
                  {Object.keys(DESIGN_STYLES).map(style => <option key={style} value={style}>{style}</option>)}
                </select>

                <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl p-2 mt-2 transition-all duration-200 hover:border-neutral-700">
                  <Palette className="w-4 h-4 text-red-500 flex-shrink-0 ml-1" />
                  <select value={selectedPattern} onChange={(e) => setSelectedPattern(e.target.value)} className="w-full bg-transparent text-xs text-red-300 font-bold focus:ring-0 p-1 truncate transition-all duration-200">
                    {lockedPatternOutsideCurrentMenu && <option value={selectedPattern} className="bg-neutral-900 text-amber-300">🔒 Locked: {selectedPattern}</option>}
                    {Object.entries(GLOBAL_PATTERNS).map(([region, patterns]) => (
                      <optgroup key={region} label={`Global: ${region}`}>
                        {patterns.map(p => <option key={p} value={p} className="bg-neutral-900 text-white">{p}</option>)}
                      </optgroup>
                    ))}
                    {BRAND_PATTERNS[brand] && (
                      <optgroup label={`${brand} Iconic Patterns`}>
                        {BRAND_PATTERNS[brand].map(p => <option key={p} value={p} className="bg-neutral-900 text-white">{p}</option>)}
                      </optgroup>
                    )}
                    {coBrand !== "None" && BRAND_PATTERNS[coBrand] && (
                      <optgroup label={`${coBrand} (Co-Brand) Patterns`}>
                        {BRAND_PATTERNS[coBrand].map(p => <option key={p} value={p} className="bg-neutral-900 text-yellow-300">{p}</option>)}
                      </optgroup>
                    )}
                    {collabType === 'Artist' && collabArtist !== "None" && ARTIST_PATTERNS[collabArtist] && (
                      <optgroup label={`${collabArtist} Patterns`}>
                        {ARTIST_PATTERNS[collabArtist].map(p => <option key={p} value={p} className="bg-neutral-900 text-cyan-300">{p}</option>)}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-neutral-800/50"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* WARNA DENGAN CHECKBOX INDIVIDUAL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-[9px] text-red-500">6</span>
                    Intelligent Color Logic
                  </label>
                </div>

                <div className="bg-neutral-900 p-2 rounded-xl border border-neutral-800 flex flex-col gap-2 transition-all duration-200 hover:border-neutral-700">
                  <div className="flex flex-wrap gap-1 bg-neutral-950 p-1 rounded-lg">
                    <button onClick={() => applyAutoColors()} className="flex-1 text-[9px] font-bold py-1.5 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white transition-all duration-200 border border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500">Brand / Collab</button>
                    <button onClick={applyAestheticColors} disabled={selectedAesthetic === "None (Standard Fashion)"} className="flex-1 text-[9px] font-bold py-1.5 rounded bg-fuchsia-500/20 text-fuchsia-300 hover:bg-fuchsia-500 hover:text-white transition-all border border-fuchsia-500/30 disabled:opacity-30">Aesthetic</button>
                    <button onClick={applyRandomPalette} className="flex-1 text-[9px] font-bold py-1.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white transition-all duration-200 border border-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500">Random</button>
                  </div>

                  <div className="flex justify-around py-2">
                    {/* COLOR 1 */}
                    <div className="flex flex-col items-center gap-2">
                      <input type="checkbox" checked={c1Active} onChange={(e) => setC1Active(e.target.checked)} className="w-3 h-3 rounded border-neutral-700 text-red-500 bg-neutral-950 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Toggle main color" title="Main Color" />
                      <input type="color" value={colors[0]} onChange={(e) => handleColorChange(0, e.target.value)} className={`w-10 h-10 rounded-full cursor-pointer bg-transparent border-0 p-0 shadow-sm transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 ${!c1Active ? 'opacity-20 grayscale' : ''}`} aria-label="Main color picker" />
                    </div>
                    {/* COLOR 2 */}
                    <div className="flex flex-col items-center gap-2">
                      <input type="checkbox" checked={c2Active} onChange={(e) => setC2Active(e.target.checked)} className="w-3 h-3 rounded border-neutral-700 text-red-500 bg-neutral-950 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Toggle secondary color" title="Secondary Color" />
                      <input type="color" value={colors[1]} onChange={(e) => handleColorChange(1, e.target.value)} className={`w-10 h-10 rounded-full cursor-pointer bg-transparent border-0 p-0 shadow-sm transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 ${!c2Active ? 'opacity-20 grayscale' : ''}`} aria-label="Secondary color picker" />
                    </div>
                    {/* COLOR 3 */}
                    <div className="flex flex-col items-center gap-2">
                      <input type="checkbox" checked={c3Active} onChange={(e) => setC3Active(e.target.checked)} className="w-3 h-3 rounded border-neutral-700 text-red-500 bg-neutral-950 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Toggle accent color" title="Accent Color" />
                      <input type="color" value={colors[2]} onChange={(e) => handleColorChange(2, e.target.value)} className={`w-10 h-10 rounded-full cursor-pointer bg-transparent border-0 p-0 shadow-sm transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 ${!c3Active ? 'opacity-20 grayscale' : ''}`} aria-label="Accent color picker" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-[9px] text-red-500">7</span>
                  Layout & Personalization
                </label>

                <select value={backgroundStyle} onChange={(e) => setBackgroundStyle(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs font-bold rounded-xl p-3 mb-2 focus:ring-2 focus:ring-red-500 focus:outline-none">
                  {Object.keys(BACKGROUND_STYLES).map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}
                    className="bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-bold rounded-xl p-2.5">
                    {Object.keys(ASPECT_RATIOS).map(ar => <option key={ar} value={ar}>{ar.split(' ')[0]}</option>)}
                  </select>
                  <select value={outputMode} onChange={(e)=>setOutputMode(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 text-white text-xs rounded-xl p-2.5">
                    {OUTPUT_MODES.map(v=><option key={v}>{v}</option>)}
                  </select>
                  <select value={outputTarget} onChange={(e)=>setOutputTarget(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 text-cyan-300 text-xs rounded-xl p-2.5">
                    {OUTPUT_TARGETS.map(v=><option key={v}>{v}</option>)}
                  </select>
                  {ASPECT_RATIOS[aspectRatio].layoutType === 'triptych' ? (
                    <select value={layoutPos} onChange={(e) => setLayoutPos(e.target.value)}
                      className="bg-neutral-900 border border-neutral-800 text-white text-xs rounded-xl p-2.5">
                      <option value="Left">Model Left</option>
                      <option value="Center">Model Center</option>
                      <option value="Right">Model Right</option>
                    </select>
                  ) : <div />}
                </div>

                {!ASPECT_RATIOS[aspectRatio].productOnly && (
                  <select value={gender} onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 text-red-400 text-xs font-bold rounded-xl p-2.5 mt-2">
                    {GENDERS.map(g => <option key={g} value={g}>Model: {g}</option>)}
                  </select>
                )}

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <label className={`flex items-center justify-center cursor-pointer gap-2 p-2.5 rounded-xl border ${externalDesignReference ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-neutral-900 border-neutral-800 text-neutral-400'}`}>
                    <input type="checkbox" checked={externalDesignReference} onChange={(e) => setExternalDesignReference(e.target.checked)} className="sr-only" />
                    <UploadCloud className="w-3 h-3" /> <span className="text-[9px] font-bold">External Design Ref</span>
                  </label>
                  <label className={`flex items-center justify-center cursor-pointer gap-2 p-2.5 rounded-xl border ${externalFaceReference ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-neutral-900 border-neutral-800 text-neutral-400'}`}>
                    <input type="checkbox" checked={externalFaceReference} onChange={(e) => setExternalFaceReference(e.target.checked)} className="sr-only" />
                    <Camera className="w-3 h-3" /> <span className="text-[9px] font-bold">External Face Ref</span>
                  </label>
                </div>
                {(externalDesignReference || externalFaceReference) && (
                  <p className="text-[9px] text-neutral-500">Reference toggle adds instructions for an image you attach in the downstream generator; this web app does not pretend to upload or bind a reference by itself.</p>
                )}
              </div>
            </div>

            <button onClick={generatePrompt}
              className="w-full py-4 mt-2 bg-gradient-to-r from-red-600 to-orange-500 text-white hover:opacity-90 rounded-2xl font-black flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-4 focus:ring-offset-neutral-900">
              <Wand2 className="w-4 h-4" /> GENERATE MASTERPIECE
            </button>
          </div>

          {/* RIGHT PANEL: RESULT */}
          <div className="lg:col-span-4 h-full flex flex-col gap-4">
            <div className="bg-[#0a0a0a] border border-neutral-800 p-4 rounded-3xl shadow-2xl flex flex-col items-center justify-center min-h-[250px] transition-all duration-300 hover:border-neutral-700 hover:shadow-xl">
              {renderVisualPreview()}
            </div>

            <div className="bg-[#0a0a0a] border border-neutral-800 p-4 rounded-3xl shadow-2xl flex-1 flex flex-col relative overflow-hidden transition-all duration-300 hover:border-neutral-700">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[11px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> RESULT
                </label>
                {prompt && (
                  <button onClick={copyToClipboard}
                    className="text-[9px] font-bold flex items-center gap-1 bg-neutral-800 text-white border border-neutral-700 px-3 py-1.5 rounded-lg hover:text-red-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500">
                    {copied ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'COPIED' : 'COPY'}
                  </button>
                )}
              </div>

              {warnings.length > 0 && (
                <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[10px] text-amber-200">
                  <b className="block mb-1">Compatibility warnings</b>
                  {warnings.map((w,i)=><div key={i}>• {w}</div>)}
                </div>
              )}

              {prompt ? (
                <div className="flex-1 bg-black border border-neutral-800 rounded-2xl p-3 font-mono text-[10px] text-neutral-300 leading-relaxed overflow-y-auto custom-scrollbar shadow-inner relative whitespace-pre-wrap transition-all duration-300 animate-in fade-in">
                  {prompt}
                </div>
              ) : (
                <div className="flex-1 border-2 border-dashed border-neutral-800 rounded-2xl flex flex-col items-center justify-center text-neutral-600 p-6 text-center bg-black">
                  <Shirt className="w-8 h-8 mb-2 opacity-20 text-red-500" />
                  <p className="text-[10px] font-bold tracking-wide uppercase">Waiting for input</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ef4444;
          border-radius: 10px;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
