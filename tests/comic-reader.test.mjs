import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test, mock } from 'node:test';
import { discoverComicCollections } from '../src/lib/comic.ts';
import { createComicNavigation } from '../src/lib/comic-navigation.ts';

const publicRoot = path.resolve('public');
const colorDirectory = '/images/sagas/virtual-world/chapters/01-welcome-world/pages';
const realPage = path.join(publicRoot, colorDirectory.slice(1), '1.PNG');
const realPortrait = path.resolve('src/assets/heroes/unrealyria-welcome-world-hero-mobile-v1.png');
const originalOpen = fs.openSync;
const file = (name, regular = true) => ({ name, isFile: () => regular });
const missing = () => Object.assign(new Error('Missing collection'), { code: 'ENOENT' });

// Virtual directory listings, backed by read-only access to existing PNGs.
// No image fixture is generated, copied or written into public/.
function mockCollections(t, listings, portrait = () => false) {
  t.after(() => mock.restoreAll());
  mock.method(fs, 'readdirSync', (directory) => {
    if (path.dirname(directory) !== path.dirname(path.dirname(realPage))) throw missing();
    const entries = listings[path.basename(directory)];
    if (!entries) throw missing();
    return entries;
  });
  mock.method(fs, 'openSync', (filename) => originalOpen(portrait(filename) ? realPortrait : realPage, 'r'));
}

test('the published Color collection still contains all 21 original pages', () => {
  const collections = discoverComicCollections(publicRoot, colorDirectory);
  const color = collections.find((group) => group.id === 'color');
  assert.ok(color);
  assert.deepEqual(color.pages.map((page) => page.order), Array.from({ length: 21 }, (_, i) => i + 1));
  assert.ok(color.pages.every((page) => page.width === 1280 && page.height === 720));
  assert.equal(color.stageRatio, 16 / 9);
});

test('each directory sorts numeric PNGs independently and preserves original filenames', (t) => {
  mockCollections(t, {
    pages: [file('10.PNG'), file('2.pNg'), file('1.png'), file('cover.png'), file('3.PNG', false), file('4.jpg')],
    'black-white': [file('12.PNG'), file('3.png')],
    reels: [file('9.PnG')],
  });
  const collections = discoverComicCollections(publicRoot, colorDirectory);
  assert.deepEqual(collections.map((group) => group.label), ['Color', 'Black & White', 'Reels']);
  assert.deepEqual(collections.map((group) => group.pages.map((page) => page.order)), [[1, 2, 10], [3, 12], [9]]);
  assert.equal(collections[0].pages[1].name, '2.pNg');
});

test('empty and missing collections create no edition or page references', (t) => {
  mockCollections(t, { pages: [file('1.PNG')], 'black-white': [file('.gitkeep'), file('preview.png')] });
  assert.deepEqual(discoverComicCollections(publicRoot, colorDirectory).map((group) => group.id), ['color']);
  assert.deepEqual(discoverComicCollections(publicRoot, '/missing/pages'), []);
});

test('mixed proportions reserve the tallest page ratio for the entire collection', (t) => {
  mockCollections(t, { pages: [file('1.PNG'), file('2.PNG')] }, (filename) => path.basename(filename) === '2.PNG');
  const [collection] = discoverComicCollections(publicRoot, colorDirectory);
  assert.ok(collection.pages[1].height > collection.pages[1].width);
  assert.equal(collection.stageRatio, collection.pages[1].width / collection.pages[1].height);
});

test('collection discovery cannot escape public/', () => {
  assert.throws(() => discoverComicCollections(publicRoot, '/../../outside/pages'), /inside public/);
});

test('permission failures are reported rather than disguised as empty collections', (t) => {
  t.after(() => mock.restoreAll());
  mock.method(fs, 'readdirSync', () => { throw Object.assign(new Error('Denied'), { code: 'EACCES' }); });
  assert.throws(() => discoverComicCollections(publicRoot, colorDirectory), /Denied/);
});

test('truncated PNG metadata fails explicitly instead of rendering a broken image', (t) => {
  mockCollections(t, { pages: [file('1.PNG')] });
  mock.method(fs, 'readSync', () => 0);
  assert.throws(() => discoverComicCollections(publicRoot, colorDirectory), /Invalid comic PNG/);
});

test('collection changes reset to the first page and respect the new collection bounds', () => {
  const navigation = createComicNavigation([21, 3, 1]);
  assert.equal(navigation.go(-1), false);
  for (let i = 1; i < 21; i++) assert.equal(navigation.go(1), true);
  assert.equal(navigation.index, 20);
  assert.equal(navigation.go(1), false);
  assert.equal(navigation.select(1), true);
  assert.equal(navigation.index, 0);
  assert.equal(navigation.total, 3);
  assert.equal(navigation.go(2), true);
  assert.equal(navigation.go(1), false);
  assert.equal(navigation.select(2), true);
  assert.equal(navigation.index, 0);
  assert.equal(navigation.total, 1);
  assert.equal(navigation.go(1), false);
  assert.equal(navigation.select(0), true);
  assert.equal(navigation.index, 0);
  assert.equal(navigation.total, 21);
  assert.equal(navigation.select(3), false);
  assert.equal(navigation.select(-1), false);
  assert.equal(navigation.collection, 0);
});
