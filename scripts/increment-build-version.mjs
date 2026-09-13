import { readFile, writeFile } from 'node:fs/promises';

const versionFile = new URL('../src/version.ts', import.meta.url);
const source = await readFile(versionFile, 'utf8');
const match = source.match(/APP_VERSION = '(\d+)\.(\d+)\.(\d+)'/);

if (!match) {
  throw new Error('Could not find APP_VERSION in src/version.ts');
}

const [, major, minor, patch] = match;
const nextVersion = `${major}.${minor}.${Number(patch) + 1}`;
const nextSource = source.replace(
  /APP_VERSION = '\d+\.\d+\.\d+'/,
  `APP_VERSION = '${nextVersion}'`
);

await writeFile(versionFile, nextSource);
console.log(`Building MatteT1 ${nextVersion}`);