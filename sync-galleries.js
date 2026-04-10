/**
 * sync-galleries.js
 *
 * Scans each project's asset directory and updates index.html automatically.
 *
 * - If a project card already has a data-gallery → updates the image list.
 * - If the project card is still a placeholder → activates it into a real
 *   gallery card (adds data-gallery, replaces the SVG thumb with a photo).
 *
 * Usage: node sync-galleries.js
 *
 * To add a new project:
 *   1. Create the folder under assets/ (e.g. assets/my-project/)
 *   2. Add an entry to PROJECTS below
 *   3. Make sure index.html has a <!-- GALLERY:my-project --> marker above
 *      the project card (placeholder or real)
 *   4. Run: node sync-galleries.js
 *
 * Image order: alphabetical with numeric awareness (1, 2, … 10, 11).
 * Rename files with a numeric prefix (01_, 02_ …) to control display order.
 * The first sorted image becomes the project thumbnail.
 */

const fs   = require('fs');
const path = require('path');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const PROJECTS = [
  { key: 'house1-architecture', dir: 'assets/house1-architecture' },
  { key: 'house1-interior',     dir: 'assets/house1-interior'     },
  { key: 'house2-architecture', dir: 'assets/house2-architecture' },
  { key: 'house2-interior',     dir: 'assets/house2-interior'     },
  { key: 'house2-basement',     dir: 'assets/house2-basement'     },
];

let html = fs.readFileSync('index.html', 'utf8');
let changed = false;

for (const { key, dir } of PROJECTS) {
  if (!fs.existsSync(dir)) {
    console.warn(`  [skip] Directory not found: ${dir}`);
    continue;
  }

  const images = fs.readdirSync(dir)
    .filter(f => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map(f => `${dir}/${f}`);

  if (images.length === 0) {
    console.warn(`  [skip] No images in ${dir}`);
    continue;
  }

  // Build the gallery JSON array string (indented to match HTML style)
  const itemIndent  = '        '; // 8 spaces
  const newGallery  = '[\n' + images.map(p => `${itemIndent}"${p}"`).join(',\n') + '\n      ]';

  // Detect whether this card is still a placeholder (has no data-gallery yet).
  // Use \s* only — no cross-section [\s\S]* — so we only look at the immediate next div.
  const isPlaceholder = new RegExp(
    `<!-- GALLERY:${key} -->\\s*\\n\\s*<div class="proj proj--placeholder">`
  ).test(html);

  if (isPlaceholder) {
    // ── Activate placeholder ──────────────────────────────────────────────

    // Extract proj-name from within this section only (stop before next comment)
    const sectionRe = new RegExp(
      `<!-- GALLERY:${key} -->((?:(?!<!--)[\\s\\S])*)`
    );
    const sectionMatch = html.match(sectionRe);
    const sectionHtml  = sectionMatch ? sectionMatch[1] : '';
    const nameMatch    = sectionHtml.match(/<div class="proj-name">([^<]+)<\/div>/);
    const altText      = nameMatch ? nameMatch[1] : key;

    // Step 1 — upgrade the opening <div> tag: remove placeholder class, add data-gallery
    html = html.replace(
      new RegExp(`(<!-- GALLERY:${key} -->\\s*\\n\\s*)<div class="proj proj--placeholder">`),
      (_, before) =>
        `${before}<div class="proj" data-description="Write your description here." data-gallery='${newGallery}'>`
    );

    // Step 2 — swap the SVG placeholder thumb for a real <img>.
    // Anchored tightly: the thumb div is always the first element inside the proj div,
    // so we match from the (now-updated) proj opening tag to the end of the thumb div.
    html = html.replace(
      new RegExp(
        `(<!-- GALLERY:${key} -->\\s*\\n\\s*<div class="proj"[^>]*>\\s*)` +
        `(<div class="proj-thumb proj-thumb--ph"[^>]*>[\\s\\S]*?<\\/div>)` +
        `(\\s*<div class="proj-info">)`
      ),
      (_, before, _oldThumb, after) => {
        const newThumb =
          `<div class="proj-thumb">\n` +
          `          <img src="${images[0]}" alt="${altText}" loading="lazy" />\n` +
          `          <div class="proj-overlay"><span>View project →</span></div>\n` +
          `        </div>`;
        return `${before}${newThumb}${after}`;
      }
    );

    console.log(`  [activated] ${key}: ${images.length} image(s), thumb → ${path.basename(images[0])}`);
    changed = true;

  } else {
    // ── Update existing gallery ───────────────────────────────────────────

    // Operate only within this section (stop before the next HTML comment)
    const sectionRe = new RegExp(
      `(<!-- GALLERY:${key} -->)((?:(?!<!--)[\\s\\S])*)`
    );
    let foundGallery = false;
    const htmlAfter = html.replace(sectionRe, (_, marker, section) => {
      if (!section.includes("data-gallery='")) return marker + section;
      foundGallery = true;
      const updated = section
        .replace(/(data-gallery=')([\s\S]*?)(')/, (_, pre, _old, post) => pre + newGallery + post)
        .replace(/(<img src=")([^"]+)(")/, (_, pre, _old, post) => pre + images[0] + post);
      return marker + updated;
    });

    if (!foundGallery) {
      console.warn(`  [warn] data-gallery not found for: ${key} — is the HTML marker present?`);
    } else {
      if (htmlAfter !== html) changed = true;
      html = htmlAfter;
    }

    console.log(`  [ok] ${key}: ${images.length} image(s), thumb → ${path.basename(images[0])}`);
  }
}

if (changed) {
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('\nindex.html updated.');
} else {
  console.log('\nNothing to update.');
}
