import fs from 'node:fs';
import path from 'node:path';

function readManifests(manifestDir) {
  if (!fs.existsSync(manifestDir)) {
    throw new Error(`Manifest directory not found: ${manifestDir}`);
  }
  const files = fs.readdirSync(manifestDir).filter((file) => file.endsWith('.json'));
  if (files.length === 0) {
    throw new Error(`No manifest files found in ${manifestDir}.`);
  }
  return files.map((file) => {
    const filePath = path.join(manifestDir, file);
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return manifest;
  });
}

function buildHtml({ version, tag, manifests }) {
  const title = `7-Zip GUI ${version} Downloads`;
  const sections = manifests.map((manifest) => {
    const links = manifest.files
      .map((file) => `<li><a href="${file.downloadUrl}" rel="noopener">${file.name}</a></li>`)
      .join('\n');
    return `      <section class="platform">
        <h2>${manifest.platform.charAt(0).toUpperCase()}${manifest.platform.slice(1)}</h2>
        <ul>
${links}
        </ul>
      </section>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      :root {
        color-scheme: light dark;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.6;
      }
      body {
        margin: 0;
        padding: 2rem;
        background: radial-gradient(circle at top, #1f2933, #111827);
        color: #f9fafb;
      }
      main {
        max-width: 960px;
        margin: 0 auto;
        background: rgba(15, 23, 42, 0.85);
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.8);
      }
      header {
        text-align: center;
        margin-bottom: 2rem;
      }
      h1 {
        margin-bottom: 0.5rem;
        font-size: clamp(2rem, 4vw, 2.75rem);
      }
      p.subtitle {
        margin: 0;
        font-size: 1.1rem;
        color: #cbd5f5;
      }
      .platforms {
        display: grid;
        gap: 1.5rem;
      }
      @media (min-width: 768px) {
        .platforms {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      .platform {
        background: rgba(30, 41, 59, 0.9);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        border: 1px solid rgba(148, 163, 184, 0.2);
      }
      .platform h2 {
        margin-top: 0;
        font-size: 1.5rem;
      }
      .platform ul {
        list-style: none;
        padding-left: 1rem;
      }
      .platform li {
        margin-bottom: 0.5rem;
      }
      a {
        color: #60a5fa;
        text-decoration: none;
        font-weight: 600;
      }
      a:hover, a:focus {
        text-decoration: underline;
      }
      footer {
        margin-top: 2rem;
        text-align: center;
        font-size: 0.9rem;
        color: #cbd5f5;
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>${title}</h1>
        <p class="subtitle">Tag ${tag}</p>
        <p class="subtitle">Choose your platform to download the latest binaries.</p>
      </header>
      <div class="platforms">
${sections}
      </div>
      <footer>
        Generated automatically during the release workflow.
      </footer>
    </main>
  </body>
</html>`;
}

try {
  const [, , manifestDir, version, tag, outputPath] = process.argv;

  if (!manifestDir || !version || !tag || !outputPath) {
    throw new Error('Usage: node scripts/generate-download-page.mjs <manifestDir> <version> <tag> <output>');
  }

  const manifests = readManifests(manifestDir);
  const html = buildHtml({ version, tag, manifests });
  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`Generated download page at ${outputPath}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
