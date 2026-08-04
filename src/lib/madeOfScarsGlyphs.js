const SOURCES = {
  'Î': 'https://media.base44.com/images/public/6a68e00e568a670980669b9d/3f23c7957_1.png',
  'Â': 'https://media.base44.com/images/public/6a68e00e568a670980669b9d/c9cbf5c9b_2.png',
  'Ă': 'https://media.base44.com/images/public/6a68e00e568a670980669b9d/f2b644e55_3.png',
  'Ș': 'https://media.base44.com/images/public/6a68e00e568a670980669b9d/1bdb5b794_4.png',
  'Ț': 'https://media.base44.com/images/public/6a68e00e568a670980669b9d/2fc3ca249_5.png',
  'Ş': 'https://media.base44.com/images/public/6a68e00e568a670980669b9d/5db469728_6.png',
  "'": 'https://media.base44.com/images/public/6a68e00e568a670980669b9d/5c52ccecd_72.png',
};

const TARGET = /[ÎÂĂȘȚŞ']/;
const masks = new Map();

function cutOut(url, inverse = false, retried = false) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      const { width, height } = canvas;
      const dark = new Uint8Array(width * height);
      for (let i = 0; i < dark.length; i += 1) {
        const p = i * 4;
        const lightness = pixels.data[p] + pixels.data[p + 1] + pixels.data[p + 2];
        dark[i] = inverse ? Number(lightness > 650) : Number(lightness < 420);
      }
      const outside = new Uint8Array(dark.length);
      const queue = [];
      const add = (index) => { if (dark[index] && !outside[index]) { outside[index] = 1; queue.push(index); } };
      for (let x = 0; x < width; x += 1) { add(x); add((height - 1) * width + x); }
      for (let y = 0; y < height; y += 1) { add(y * width); add(y * width + width - 1); }
      for (let q = 0; q < queue.length; q += 1) {
        const i = queue[q]; const x = i % width; const y = Math.floor(i / width);
        if (x) add(i - 1); if (x < width - 1) add(i + 1);
        if (y) add(i - width); if (y < height - 1) add(i + width);
      }
      let left = width; let top = height; let right = 0; let bottom = 0;
      for (let i = 0; i < dark.length; i += 1) if (dark[i] && !outside[i]) {
        const x = i % width; const y = Math.floor(i / width);
        left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
      if (left > right) {
        if (!retried) return cutOut(url, !inverse, true).then(resolve, reject);
        return resolve(null);
      }
      const output = document.createElement('canvas');
      output.width = right - left + 5; output.height = bottom - top + 5;
      const out = output.getContext('2d');
      out.fillStyle = '#fff';
      for (let y = top; y <= bottom; y += 1) for (let x = left; x <= right; x += 1) {
        const i = y * width + x;
        if (dark[i] && !outside[i]) out.fillRect(x - left + 2, y - top + 2, 1, 1);
      }
      resolve({ url: output.toDataURL('image/png'), ratio: output.width / output.height });
    };
    image.onerror = reject;
    image.src = url;
  });
}

function replaceText(node) {
  if (!node.nodeValue || !TARGET.test(node.nodeValue)) return;
  const parent = node.parentElement;
  if (!parent || parent.closest('[data-mos-glyph], input, textarea, script, style, [contenteditable="true"]')) return;
  if (!getComputedStyle(parent).fontFamily.includes('Made Of Scars')) return;
  const fragment = document.createDocumentFragment();
  for (const character of node.nodeValue.split(/([ÎÂĂȘȚŞ'])/)) {
    const mask = masks.get(character);
    if (!mask) { fragment.append(character); continue; }
    const glyph = document.createElement('span');
    glyph.className = `mos-glyph${character === "'" ? ' mos-apostrophe' : ''}`;
    glyph.dataset.mosGlyph = character;
    glyph.setAttribute('role', 'img'); glyph.setAttribute('aria-label', character);
    glyph.style.setProperty('--mos-mask', `url("${mask.url}")`);
    glyph.style.setProperty('--mos-ratio', mask.ratio);
    fragment.append(glyph);
  }
  node.replaceWith(fragment);
}

function scan(root) {
  if (root.nodeType === Node.TEXT_NODE) return replaceText(root);
  if (!(root instanceof Element) || root.closest('[data-mos-glyph]')) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(replaceText);
}

export async function installMadeOfScarsGlyphs() {
  const loaded = await Promise.all(Object.entries(SOURCES).map(async ([character, url]) => [character, await cutOut(url, character === "'")]));
  loaded.forEach(([character, mask]) => { if (mask) masks.set(character, mask); });
  scan(document.body);
  const observer = new MutationObserver((changes) => changes.forEach((change) => {
    if (change.type === 'characterData') scan(change.target);
    change.addedNodes.forEach(scan);
  }));
  observer.observe(document.body, { childList: true, characterData: true, subtree: true });
  return () => observer.disconnect();
}