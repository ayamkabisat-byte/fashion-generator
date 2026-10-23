import test from 'node:test';
import assert from 'node:assert/strict';
import { getGarmentsList, DESIGN_STYLES } from '../src/data/fashionData.js';
import { buildPrompt, buildDesignSpec } from '../src/engine/designEngine.js';

const baseSettings = {
  productType: 'Footwear',
  category: 'Sport',
  brand: 'Nike',
  coBrand: 'None',
  coBrandCategory: 'All',
  collabType: 'Artist',
  collabArtist: 'Pharrell Williams',
  collabIP: 'None',
  collabCharacter: '',
  customIPText: '',
  collabStrength: 40,
  collabScopes: { color:true, motif:true, material:false, construction:false, typography:true, branding:true },
  baseGarment: getGarmentsList('Footwear','Iconic Silhouette','Nike').find(x => x.name === 'Air Force 1'),
  materials: ['Leather / Faux Leather'],
  fitStyle: 'Standard Profile',
  designStyle: DESIGN_STYLES['Minimalist / Clean'],
  components: ['Ankle Strap / Velcro Support','None (Standard Structure)'],
  selectedAesthetic: 'Y2K',
  selectedPattern: 'Solid Color (No Pattern)',
  backgroundStyle: 'Clean Studio',
  colors: ['#e5d3e8','#4d3f48','#15f12f'],
  colorActive: [true,true,true],
  whiteLabel: false,
  gender: 'Female',
  aspectRatio: '16:9 (Desktop/Landscape)',
  layoutPos: 'Center',
  outputTarget: 'Universal',
  outputMode: 'Composite Sheet',
  useUploadedProductBase: false,
  uploadedProductName: '',
  externalFaceReference: false,
  footwear: {
    sole:'Gum Sole'
  }
};

test('footwear prompt stays concise while preserving the useful visual modifiers', () => {
  const { prompt } = buildPrompt(baseSettings);
  assert.match(prompt, /triptych layout/i);
  assert.match(prompt, /Air Force 1/);
  assert.match(prompt, /Ankle Strap \/ Velcro Support/);
  assert.match(prompt, /Sole Modification: Gum Sole/);
  assert.match(prompt, /Primary Materials: Leather \/ Faux Leather/);
  assert.match(prompt, /Consistency:/);
  assert.doesNotMatch(prompt, /Footwear architecture:/);
  assert.doesNotMatch(prompt, /toe=/);
  assert.doesNotMatch(prompt, /construction: clean athletic panel logic/);
  assert.doesNotMatch(prompt, /--v 6\.0/);
});

test('uploaded product base becomes the structural authority', () => {
  const { prompt, spec } = buildPrompt({
    ...baseSettings,
    useUploadedProductBase:true,
    uploadedProductName:'local-shoe.jpg'
  });
  assert.equal(spec.baseSource, 'uploaded');
  assert.match(prompt, /uploaded product reference/i);
  assert.match(prompt, /structural authority/i);
  assert.doesNotMatch(prompt, /structural silhouette of Air Force 1/i);
});

test('uploaded product base without a local file produces an honest warning', () => {
  const spec = buildDesignSpec({...baseSettings, useUploadedProductBase:true, uploadedProductName:''});
  assert.ok(spec.warnings.some(x => /Attach the same product image/.test(x)));
});

test('Universal output contains no model-specific aspect flag', () => {
  const { prompt } = buildPrompt(baseSettings);
  assert.doesNotMatch(prompt, /--ar/);
});

test('Midjourney adapter adds aspect ratio but no hardcoded version', () => {
  const { prompt } = buildPrompt({...baseSettings, outputTarget:'Midjourney'});
  assert.match(prompt, /--ar 16:9/);
  assert.doesNotMatch(prompt, /--v\s/);
});

test('Panel Prompt Pack still creates four single-view prompts', () => {
  const { prompt } = buildPrompt({...baseSettings, outputMode:'Panel Prompt Pack'});
  assert.match(prompt, /01 HERO \/ LATERAL/);
  assert.match(prompt, /02 ON-BODY \/ ON-FOOT/);
  assert.match(prompt, /03 STRUCTURAL DETAIL/);
  assert.match(prompt, /04 TOP \/ THREE-QUARTER/);
});

test('white-label mode warns when branding collab scope is enabled', () => {
  const spec = buildDesignSpec({...baseSettings, whiteLabel:true});
  assert.ok(spec.warnings.some(x => /White-label mode overrides/.test(x)));
  const { prompt } = buildPrompt({...baseSettings, whiteLabel:true});
  assert.match(prompt, /white-label treatment/);
});
