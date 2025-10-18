import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = new Map();
  for (let i = 2; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key.startsWith('--')) {
      throw new Error(`Unexpected argument ${key}.`);
    }
    if (typeof value === 'undefined') {
      throw new Error(`Missing value for ${key}.`);
    }
    args.set(key.slice(2), value);
  }
  return args;
}

function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

try {
  const args = parseArgs(process.argv);
  const platform = args.get('platform');
  const directory = args.get('directory');
  const tag = args.get('tag');
  const repository = args.get('repository');
  const output = args.get('output') ?? 'asset-manifest.json';

  if (!platform || !directory || !tag || !repository) {
    throw new Error('Missing required arguments. Expected --platform, --directory, --tag, and --repository.');
  }

  if (!fs.existsSync(directory)) {
    throw new Error(`Build output directory not found: ${directory}`);
  }

  const files = collectFiles(directory);

  if (files.length === 0) {
    throw new Error(`No files found in build output directory: ${directory}`);
  }

  const manifest = {
    platform,
    generatedAt: new Date().toISOString(),
    files: files.map((filePath) => {
      const relativePath = path.relative(directory, filePath).split(path.sep).join('/');
      const fileName = path.basename(filePath);
      return {
        name: fileName,
        relativePath,
        absolutePath: filePath,
        downloadUrl: `https://github.com/${repository}/releases/download/${tag}/${encodeURIComponent(fileName)}`
      };
    })
  };

  fs.writeFileSync(output, JSON.stringify(manifest, null, 2));
  console.log(`Wrote asset manifest for ${platform} to ${output}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
