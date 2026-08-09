const sharp = require('sharp');
const path = require('path');

async function generate() {
  const input = path.join(__dirname, 'public/logofm2.png');
  const out192 = path.join(__dirname, 'public/icon-192.png');
  const out512 = path.join(__dirname, 'public/icon-512.png');

  // Resize to 130x130 and extend to 192x192
  await sharp(input)
    .resize(130, 130, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 31, bottom: 31, left: 31, right: 31,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(out192);

  // Resize to 340x340 and extend to 512x512
  await sharp(input)
    .resize(340, 340, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 86, bottom: 86, left: 86, right: 86,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(out512);
    
  console.log('Icons generated successfully.');
}

generate().catch(console.error);
