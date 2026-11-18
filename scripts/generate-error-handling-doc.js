const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');

const root = path.resolve(__dirname, '..');
const markdown = new MarkdownIt();
const defaultLinkOpen = markdown.renderer.rules.link_open ||
  ((tokens, index, options, env, renderer) => renderer.renderToken(tokens, index, options));

// Source links in Markdown are relative to docs/; generated pages live in docs/dev/.
markdown.renderer.rules.link_open = (tokens, index, options, env, renderer) => {
  const href = tokens[index].attrGet('href');
  if (href && href.startsWith('../src/')) {
    tokens[index].attrSet('href', `https://github.com/hetalang/heta-compiler/blob/master/${href.slice(3)}`);
  }
  return defaultLinkOpen(tokens, index, options, env, renderer);
};

const pages = [
  {name: 'error-handling', title: 'Error handling recommendations'},
  {name: 'diagnostic-codes-structure', title: 'Diagnostic code structure'},
];

for (const {name, title} of pages) {
  const source = fs.readFileSync(path.join(root, 'docs', `${name}.md`), 'utf8');
  const content = markdown.render(source);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link rel="stylesheet" href="styles/jsdoc-default.css">
</head>
<body>
  <div id="main">
    <p><a href="index.html">JavaScript API</a></p>
    <section><article>${content}</article></section>
  </div>
</body>
</html>
`;

  fs.writeFileSync(path.join(root, 'docs', 'dev', `${name}.html`), html, 'utf8');
}
