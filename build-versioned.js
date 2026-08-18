const fs = require('fs');
const path = require('path');

const BUILD_ID = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const ROOT = __dirname;

const assets = {
  'style.css': `style.${BUILD_ID}.css`,
  'main.js': `main.${BUILD_ID}.js`,
};

function safeUnlink(filePath) {
  try { fs.unlinkSync(filePath); } catch (e) { /* ignore missing files */ }
}

// Clean up old versioned files
for (const [src, dst] of Object.entries(assets)) {
  const baseName = src.replace(/\.\w+$/, '');
  const ext = src.replace(/^.*\./, '');
  const pattern = new RegExp(`^${baseName}\\.\\d{4}-\\d{2}-\\d{2}T\\d{2}-\\d{2}-\\d{2}\\.${ext}$`);
  let files;
  try {
    files = fs.readdirSync(ROOT).filter(f => pattern.test(f));
  } catch (e) {
    console.error(`Failed to read directory for ${src}:`, e.message);
    continue;
  }
  for (const oldFile of files) {
    if (oldFile !== dst) {
      safeUnlink(path.join(ROOT, oldFile));
    }
  }
}

// Create new versioned files
for (const [src, dst] of Object.entries(assets)) {
  const srcPath = path.join(ROOT, src);
  const dstPath = path.join(ROOT, dst);
  try {
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, dstPath);
      console.log(`  ${src} -> ${dst}`);
    }
  } catch (e) {
    console.error(`Failed to copy ${src}:`, e.message);
  }
}

// Update HTML files
let htmlFiles;
try {
  htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
} catch (e) {
  console.error('Failed to read HTML files:', e.message);
  process.exit(1);
}

for (const fname of htmlFiles) {
  const fpath = path.join(ROOT, fname);
  let content, original;
  try {
    content = fs.readFileSync(fpath, 'utf8');
    original = content;
  } catch (e) {
    console.error(`Failed to read ${fname}:`, e.message);
    continue;
  }

  // Update asset references
  for (const [src, dst] of Object.entries(assets)) {
    const baseName = src.replace(/\.\w+$/, '');
    const ext = src.replace(/^.*\./, '');
    content = content.replace(new RegExp(`href="${baseName}\\.\\d{4}-\\d{2}-\\d{2}T\\d{2}-\\d{2}-\\d{2}\\.${ext}"`, 'g'), `href="${dst}"`);
    content = content.replace(new RegExp(`src="${baseName}\\.\\d{4}-\\d{2}-\\d{2}T\\d{2}-\\d{2}-\\d{2}\\.${ext}"`, 'g'), `src="${dst}"`);
    content = content.replace(new RegExp(`href="${src}"`, 'g'), `href="${dst}"`);
    content = content.replace(new RegExp(`src="${src}"`, 'g'), `src="${dst}"`);
  }

  // Add/replace version check script - runs IMMEDIATELY before rendering
  const versionCheck = `<script>window.__BUILD__='${BUILD_ID}';</script>`;
  const versionReload = `<script>if(window.__BUILD__!=='${BUILD_ID}'){window.location.reload(true);}</script>`;
  
  // Inject/update version check right after <head> tag (first thing in head)
  if (content.includes('window.__BUILD__=')) {
    content = content.replace(/<script>window\.__BUILD__='[^']*';<\/script>/, versionCheck);
  } else {
    content = content.replace('<head>', '<head>\n  ' + versionCheck);
  }
  
  // Replace any existing reload/version scripts with our current version check
  content = content.replace(/<script>window\.__BUILD__='[^']*';<\/script>/g, versionCheck);
  content = content.replace(/<script>if\(window\.__BUILD__!=='[^']*'\)\{window\.location\.reload\(true\);\}<\/script>/g, versionReload);
  if (!content.includes(versionReload)) {
    content = content.replace('</body>', '  ' + versionReload + '\n</body>');
  }

  if (content !== original) {
    try {
      fs.writeFileSync(fpath, content, 'utf8');
      console.log(`  Updated ${fname}`);
    } catch (e) {
      console.error(`Failed to write ${fname}:`, e.message);
    }
  } else {
    console.log(`  No changes in ${fname}`);
  }
}

console.log(`\nBuild ID: ${BUILD_ID}`);
