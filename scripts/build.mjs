// Copies app/ to dist/ and stamps the build sha into <meta name="build"> and the footer.
import { cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';

const sha = process.env.BUILD_SHA || execSync('git rev-parse HEAD').toString().trim();
rmSync('dist', { recursive: true, force: true });
cpSync('app', 'dist', { recursive: true });
const html = readFileSync('dist/index.html', 'utf8')
  .replace('<meta name="build" content="dev" />', `<meta name="build" content="${sha}" />`)
  .replace('<code data-testid="build-sha">dev</code>', `<code data-testid="build-sha">${sha}</code>`);
writeFileSync('dist/index.html', html);
console.log(`dist/ built at ${sha}`);