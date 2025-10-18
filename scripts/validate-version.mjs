import fs from 'node:fs';
import path from 'node:path';

const [,, tag] = process.argv;

if (!tag) {
  console.error('Usage: node scripts/validate-version.mjs <tag>');
  process.exit(1);
}

if (!/^v\d+\.\d+\.\d+$/.test(tag)) {
  console.error(`Tag "${tag}" is not in the expected format v<major>.<minor>.<patch>.`);
  process.exit(1);
}

const packageJsonPath = path.resolve('package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('package.json not found.');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const packageVersion = packageJson.version;
const expectedTag = `v${packageVersion}`;

if (expectedTag !== tag) {
  console.error(`Version mismatch: tag ${tag} does not match package.json version ${packageVersion}.`);
  process.exit(1);
}

console.log(`Validated release tag ${tag} against package version ${packageVersion}.`);
