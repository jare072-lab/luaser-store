const sharp = require('sharp');

const imagePath = 'C:\\Users\\jorge\\CLAUDE\\public\\tmp-carousel\\cristo\\cristo-hero-final.png';

(async () => {
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    console.log('=== METADATA ===');
    console.log(`Dimensiones: ${metadata.width} × ${metadata.height} px`);
    console.log(`Formato: ${metadata.format}`);
    console.log(`Canal alfa: ${metadata.hasAlpha ? 'SÍ' : 'NO'}`);
    console.log(`Canales: ${metadata.channels}`);

    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    const width = metadata.width;
    const height = metadata.height;
    const channels = info.channels;

    let minX = width, maxX = -1, minY = height, maxY = -1;
    let bgPixels = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        if (lum < 140) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }

        if (lum >= 225) {
          bgPixels.push({ r, g, b, lum });
        }
      }
    }

    const rule1 = (width === 2048 && height === 2048) ? 'CUMPLE' : 'NO CUMPLE';
    console.log(`\n=== REGLA 1 ===\n${width} × ${height}\n${rule1}`);

    const rule2 = (metadata.format === 'png' || metadata.format === 'webp') && !metadata.hasAlpha
      ? 'CUMPLE' : 'NO CUMPLE';
    console.log(`\n=== REGLA 2 ===\nFormato: ${metadata.format}, alfa: ${metadata.hasAlpha}\n${rule2}`);

    const marginLeft = (minX / width) * 100;
    const marginRight = ((width - maxX - 1) / width) * 100;
    const marginTop = (minY / height) * 100;
    const marginBottom = ((height - maxY - 1) / height) * 100;
    const minMargin = Math.min(marginLeft, marginRight, marginTop, marginBottom);
    const rule3 = minMargin >= 9 ? 'CUMPLE' : 'NO CUMPLE';

    console.log(`\n=== REGLA 3 ===\nBbox: (${minX}, ${minY}) a (${maxX}, ${maxY})\nMárgenes: L=${marginLeft.toFixed(1)}% R=${marginRight.toFixed(1)}% T=${marginTop.toFixed(1)}% B=${marginBottom.toFixed(1)}%\nMín: ${minMargin.toFixed(1)}%\n${rule3}`);

    let maxSatBg = 0;
    let sumSatBg = 0;
    for (const px of bgPixels) {
      const sat = Math.max(px.r, px.g, px.b) - Math.min(px.r, px.g, px.b);
      maxSatBg = Math.max(maxSatBg, sat);
      sumSatBg += sat;
    }
    const meanSatBg = bgPixels.length > 0 ? sumSatBg / bgPixels.length : 0;
    const rule8 = maxSatBg <= 12 ? 'CUMPLE' : 'NO CUMPLE';

    console.log(`\n=== REGLA 8 ===\nPíxeles fondo (lum≥225): ${bgPixels.length}\nSat max: ${maxSatBg}\nSat media: ${meanSatBg.toFixed(2)}\n${rule8}`);

    const bboxCenterX = (minX + maxX) / 2;
    const imageCenterX = width / 2;
    const deviationPct = Math.abs(bboxCenterX - imageCenterX) / imageCenterX * 100;
    const rule9 = deviationPct <= 4 ? 'CUMPLE' : 'NO CUMPLE';

    console.log(`\n=== REGLA 9 ===\nDesvío horizontal: ${deviationPct.toFixed(2)}%\n${rule9}`);

  } catch (err) {
    console.error('Error:', err.message);
  }
})();
