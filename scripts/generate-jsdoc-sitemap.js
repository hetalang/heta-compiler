const fs = require('fs');
const path = require('path');
const { SitemapStream, streamToPromise } = require('sitemap');

const siteUrl = 'https://hetalang.github.io/heta-compiler/dev/';
const docsDevDir = path.resolve(__dirname, '..', 'docs', 'dev');
const outputFile = path.join(docsDevDir, 'sitemap.xml');

function urlPathForHtml(filename) {
  return filename === 'index.html' ? './' : filename;
}

async function main() {
  if (!fs.existsSync(docsDevDir)) {
    throw new Error(`JSDoc output directory does not exist: ${docsDevDir}`);
  }

  const htmlFiles = fs.readdirSync(docsDevDir)
    .filter((filename) => filename.endsWith('.html'))
    .sort((a, b) => {
      if (a === 'index.html') return -1;
      if (b === 'index.html') return 1;
      return a.localeCompare(b);
    });

  if (htmlFiles.length === 0) {
    throw new Error(`No HTML files found in ${docsDevDir}`);
  }

  const sitemap = new SitemapStream({ hostname: siteUrl });

  htmlFiles.forEach((filename) => {
    sitemap.write({ url: urlPathForHtml(filename) });
  });
  sitemap.end();

  const xml = await streamToPromise(sitemap);
  fs.writeFileSync(outputFile, xml.toString(), 'utf8');

  console.log(`Generated ${outputFile} with ${htmlFiles.length} URLs.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
