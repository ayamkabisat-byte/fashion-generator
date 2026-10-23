import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FASHION_CATEGORIES,
  ICONIC_DB,
  BRAND_COLOR_DNA,
  COLLAB_ARTISTS,
  ARTIST_COLOR_DNA,
  COLLAB_IPS,
  IP_CHARACTER_COLOR_DNA
} from '../src/data/fashionData.js';
import { catalogStats } from '../src/engine/designEngine.js';

test('full iconic catalog is preserved', () => {
  const stats = catalogStats(ICONIC_DB);
  assert.equal(stats.footwear, 231);
  assert.equal(stats.accessories, 180);
  assert.equal(stats.total, 411);
  assert.ok(ICONIC_DB.Footwear.Nike.some(x => x.name === 'Air Max 1'));
  assert.ok(ICONIC_DB.Footwear.Nike.some(x => x.name === 'Air Max 97'));
  assert.ok(ICONIC_DB.Footwear.Adidas.length >= 14);
  assert.ok(ICONIC_DB.Footwear['Air Jordan'].length >= 11);
});

test('every iconic entry has usable design metadata', () => {
  for (const section of Object.values(ICONIC_DB)) {
    for (const [brand, entries] of Object.entries(section)) {
      assert.ok(entries.length > 0, `${brand} should have entries`);
      for (const entry of entries) {
        assert.ok(entry.name?.trim(), `${brand} entry missing name`);
        assert.ok(entry.traits?.trim(), `${brand}/${entry.name} missing traits`);
        assert.ok(Array.isArray(entry.allowedMats) && entry.allowedMats.length > 0, `${brand}/${entry.name} missing allowed materials`);
      }
    }
  }
});

test('all listed brands have color DNA after restoration', () => {
  const brands = [...new Set(Object.values(FASHION_CATEGORIES).flatMap(x => x.brands))];
  const missing = brands.filter(x => !BRAND_COLOR_DNA[x]);
  assert.deepEqual(missing, []);
});

test('all artist collabs have color DNA', () => {
  const artists = Object.keys(COLLAB_ARTISTS).filter(x => x !== 'None');
  const missing = artists.filter(x => !ARTIST_COLOR_DNA[x]);
  assert.deepEqual(missing, []);
});

test('all IP characters have color DNA', () => {
  const characters = Object.entries(COLLAB_IPS)
    .filter(([name]) => !['None','Custom IP (Type Manual)'].includes(name))
    .flatMap(([, values]) => values);
  const missing = characters.filter(x => !IP_CHARACTER_COLOR_DNA[x]);
  assert.deepEqual(missing, []);
});
