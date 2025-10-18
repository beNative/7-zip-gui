import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const tag = args[0];
const outputPath = args[1] ?? 'release-notes.md';

if (!tag) {
  console.error('Usage: node scripts/extract-changelog.mjs <tag> [output]');
  process.exit(1);
}

const version = tag.startsWith('v') ? tag.slice(1) : tag;

const changelogPath = path.resolve('CHANGELOG.md');
if (!fs.existsSync(changelogPath)) {
  console.error('CHANGELOG.md not found.');
  process.exit(1);
}

const changelog = fs.readFileSync(changelogPath, 'utf8');
const heading = `## [${version}]`;
const startIndex = changelog.indexOf(heading);

if (startIndex === -1) {
  console.error(`Unable to locate changelog entry for version ${version}.`);
  process.exit(1);
}

const afterHeading = changelog.slice(startIndex);
const nextHeadingMatch = /\n## \[/.exec(afterHeading.slice(heading.length));
let endIndex;
if (nextHeadingMatch) {
  endIndex = startIndex + heading.length + nextHeadingMatch.index;
} else {
  endIndex = changelog.length;
}

const entry = changelog.slice(startIndex, endIndex).trim();
const header = `# Release Notes for ${version}\n`;
const body = `${header}\n${entry}\n`;

fs.writeFileSync(outputPath, body, 'utf8');
console.log(`Extracted changelog entry for version ${version} to ${outputPath}.`);
