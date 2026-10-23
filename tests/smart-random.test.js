import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getGarmentsList,
  BRAND_COLOR_DNA
} from '../src/data/fashionData.js';
import {
  createSmartRandomState,
  deriveEffectiveLocks,
  EMPTY_RANDOM_LOCKS
} from '../src/engine/smartRandomEngine.js';

const airForce = getGarmentsList('Footwear', 'Iconic Silhouette', 'Nike').find(x => x.name === 'Air Force 1');

const current = {
  productType: 'Footwear',
  category: 'Sport',
  brand: 'Nike',
  coBrandCat: 'All',
  coBrand: 'None',
  collabType: 'Artist',
  collabArtist: 'Pharrell Williams',
  collabIP: 'None',
  collabCharacter: '',
  customIPText: '',
  collabStrength: 40,
  collabScopes: { color:false, motif:true, material:false, construction:false, typography:true, branding:true },
  menuCategory: 'Iconic Silhouette',
  availableGarments: getGarmentsList('Footwear', 'Iconic Silhouette', 'Nike'),
  baseGarment: airForce,
  customShapeText: '',
  materials: ['Leather / Faux Leather'],
  fitStyle: 'Standard Profile',
  designComponent1: 'None (Standard Structure)',
  designComponent2: 'None (Standard Structure)',
  footwear: { sole:'Preserve base sole' },
  selectedAesthetic: 'Y2K',
  designStyle: 'Heritage Rework',
  selectedPattern: 'Solid Color (No Pattern)',
  backgroundStyle: 'Auto (Match Aesthetic)',
  gender: 'Female',
  aspectRatio: '16:9 (Desktop/Landscape)',
  layoutPos: 'Center',
  colorMode: 'Auto',
  colors: ['#111111','#222222','#333333'],
  c1Active: true,
  c2Active: true,
  c3Active: true,
  useUploadedProductBase: false,
  externalFaceReference: false,
  whiteLabel: false
};

const constantRng = value => () => value;

test('silhouette lock pins product type and brand/category', () => {
  const { effective } = deriveEffectiveLocks(current, { ...EMPTY_RANDOM_LOCKS, silhouette:true });
  assert.equal(effective.silhouette, true);
  assert.equal(effective.product, true);
  assert.equal(effective.brand, true);
});

test('uploaded product base pins product type and structural base during Smart Random', () => {
  const { effective, dependencies } = deriveEffectiveLocks({...current, useUploadedProductBase:true}, EMPTY_RANDOM_LOCKS);
  assert.equal(effective.product, true);
  assert.equal(effective.silhouette, true);
  assert.ok(dependencies.some(x => /Uploaded Product Base/.test(x)));
});

test('locking every randomizable group preserves the current design state', () => {
  const locks = Object.fromEntries(Object.keys(EMPTY_RANDOM_LOCKS).map(k => [k,true]));
  const { next } = createSmartRandomState(current, locks, constantRng(0.99));
  assert.deepEqual(next.baseGarment, current.baseGarment);
  assert.deepEqual(next.materials, current.materials);
  assert.deepEqual(next.footwear, current.footwear);
  assert.deepEqual(next.colors, current.colors);
});

test('collab color scope OFF prevents artist palette from overriding main brand palette', () => {
  const locks = Object.fromEntries(Object.keys(EMPTY_RANDOM_LOCKS).map(k => [k,true]));
  locks.colors = false;
  const { next } = createSmartRandomState(current, locks, constantRng(0.5));
  assert.equal(next.colors[0], BRAND_COLOR_DNA.Nike[0]);
});

test('smart footwear randomization changes only the sole plus at most two obvious add-ons', () => {
  const locks = {
    ...EMPTY_RANDOM_LOCKS,
    product:true, brand:true, coBrand:true, collab:true, silhouette:true,
    materials:true, aesthetic:true, designStyle:true, pattern:true,
    colors:true, model:true, background:true, layout:true
  };
  locks.structure = false;
  const { next } = createSmartRandomState(current, locks, constantRng(0.99));
  assert.ok(next.footwear.sole);
  const selected = [next.designComponent1,next.designComponent2].filter(x => !x.includes('None'));
  assert.ok(selected.length <= 2);
  assert.equal(Object.keys(next.footwear).length, 1);
});

test('locked materials remain compatible with a randomized silhouette', () => {
  const locks = { ...EMPTY_RANDOM_LOCKS, materials:true, colors:true };
  const { next } = createSmartRandomState(current, locks, constantRng(0.42));
  assert.deepEqual(next.materials, current.materials);
  assert.ok(current.materials.every(mat => next.baseGarment.allowedMats.includes(mat)));
});

test('triptych remains the dominant layout path in Smart Random', () => {
  const locks = { ...EMPTY_RANDOM_LOCKS, product:true, brand:true, silhouette:true, materials:true, structure:true, collab:true, aesthetic:true, designStyle:true, pattern:true, colors:true, model:true, background:true };
  locks.layout = false;
  const { next } = createSmartRandomState(current, locks, constantRng(0.5));
  assert.equal(next.aspectRatio, '16:9 (Desktop/Landscape)');
  assert.ok(['Left','Center','Right'].includes(next.layoutPos));
});

test('Colors lock suppresses randomly generated collab Color scope', () => {
  const locks = {
    ...EMPTY_RANDOM_LOCKS,
    product:true, brand:true, silhouette:true, materials:true, structure:true,
    aesthetic:true, designStyle:true, pattern:true, colors:true, model:true,
    background:true, layout:true, coBrand:true
  };
  locks.collab = false;
  const { next } = createSmartRandomState(current, locks, constantRng(0.99));
  assert.equal(next.collabScopes.color, false);
});

test('External Face Reference prevents Smart Random from choosing product-only diptych', () => {
  const locks = {
    ...EMPTY_RANDOM_LOCKS,
    product:true, brand:true, silhouette:true, materials:true, structure:true,
    collab:true, aesthetic:true, designStyle:true, pattern:true, colors:true,
    model:true, background:true
  };
  locks.layout = false;
  const { next } = createSmartRandomState({ ...current, externalFaceReference:true }, locks, constantRng(0.8));
  assert.notEqual(next.aspectRatio, '16:9 (Diptych - Product Only)');
});
