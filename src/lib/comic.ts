import fs from 'node:fs';
import path from 'node:path';

export interface ComicPage {
  name: string;
  order: number;
  width: number;
  height: number;
}

export interface ComicCollection {
  id: string;
  label: string;
  directory: string;
  pages: ComicPage[];
  stageRatio: number;
}

// Read metadata only: the source PNG is never rewritten or converted.
function pngDimensions(file: string): { width: number; height: number } {
  const header = Buffer.alloc(24);
  const descriptor = fs.openSync(file, 'r');
  try {
    const bytes = fs.readSync(descriptor, header, 0, header.length, 0);
    if (
      bytes !== header.length ||
      header.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' ||
      header.toString('ascii', 12, 16) !== 'IHDR'
    ) {
      throw new Error(`Invalid comic PNG: ${file}`);
    }
  } finally {
    fs.closeSync(descriptor);
  }
  const width = header.readUInt32BE(16);
  const height = header.readUInt32BE(20);
  if (!width || !height) throw new Error(`Invalid comic dimensions: ${file}`);
  return { width, height };
}

export function discoverComicCollections(publicRoot: string, colorDirectory: string): ComicCollection[] {
  const chapterDirectory = path.posix.dirname(colorDirectory);
  const definitions = [
    { id: 'color', label: 'Color', directory: colorDirectory },
    { id: 'black-white', label: 'Black & White', directory: `${chapterDirectory}/black-white` },
    { id: 'reels', label: 'Reels', directory: `${chapterDirectory}/reels` },
  ];

  return definitions.flatMap((definition) => {
    const directory = path.resolve(publicRoot, definition.directory.replace(/^\/+/, ''));
    const relative = path.relative(path.resolve(publicRoot), directory);
    if (relative.startsWith(`..${path.sep}`) || relative === '..' || path.isAbsolute(relative)) {
      throw new Error('Comic directories must stay inside public/');
    }

    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }

    const pages = entries
      .filter((entry) => entry.isFile() && /^\d+\.png$/i.test(entry.name))
      .map((entry) => ({ name: entry.name, order: Number.parseInt(entry.name, 10) }))
      .filter((entry) => Number.isSafeInteger(entry.order))
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
      .map((entry) => ({ ...entry, ...pngDimensions(path.join(directory, entry.name)) }));

    if (pages.length === 0) return [];
    return [{
      ...definition,
      pages,
      // Reserve one frame per collection, even if individual page sizes vary.
      stageRatio: Math.min(...pages.map((page) => page.width / page.height)),
    }];
  });
}
