import test from 'node:test';
import assert from 'node:assert/strict';
import { getGarmentsList } from '../src/data/fashionData.js';
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
  components: ['None (Standard Structure)','Gum Sole','None (Standard Structure)'],
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
  externalDesignReference: false,
  externalFaceReference: false,
  footwear: {
    toe:'Preserve silhouette',
    upper:'Classic panelled upper',
    lacing:'Standard laces',
    midsole:'Classic cupsole',
    outsole:'Gum outsole',
    heel:'Standard heel counter',
    distress:'Pristine / new'
  }
};

test('canonical footwear prompt preserves silhouette authority and panel identity', () => {
  const { prompt } = buildPrompt(baseSettings);
  assert.match(prompt, /Air Force 1 is the structural authority/);
  assert.match(prompt, /PRODUCT CONSISTENCY LOCK/);
  assert.match(prompt, /Pharrell Williams, 40% influence/);
  assert.match(prompt, /Classic panelled upper/);
  assert.match(prompt, /Gum outsole/);
  assert.doesNotMatch(prompt, /--v 6\.0/);
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

test('Panel Prompt Pack creates four single-view prompts', () => {
  const { prompt } = buildPrompt({...baseSettings, outputMode:'Panel Prompt Pack'});
  assert.match(prompt, /01 HERO \/ LATERAL/);
  assert.match(prompt, /02 ON-BODY \/ ON-FOOT/);
  assert.match(prompt, /03 STRUCTURAL DETAIL/);
  assert.match(prompt, /04 TOP \/ THREE-QUARTER/);
  assert.match(prompt, /Generate only this single view/);
});

test('white-label mode warns when branding collab scope is enabled', () => {
  const spec = buildDesignSpec({...baseSettings, whiteLabel:true});
  assert.ok(spec.warnings.some(x => /White-label mode overrides/.test(x)));
  const { prompt } = buildPrompt({...baseSettings, whiteLabel:true});
  assert.match(prompt, /WHITE LABEL/);
});
