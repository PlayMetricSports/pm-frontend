const sharp = require('sharp');

async function processLogo() {
  try {
    const inputPath = '/Users/sandhikshyanroy/.gemini/antigravity/brain/81eefd00-8ba3-4dfb-ad17-78d4049a8d29/playmetric_icon_5_darkmode_1779048651201.png';
    const outputPath = 'public/logo.png';
    
    const { data, info } = await sharp(inputPath)
      .extract({ left: 150, top: 150, width: 724, height: 600 })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Threshold logic to avoid harsh edges (optional anti-aliasing logic)
    // We will do a smooth fade for dark pixels.
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Calculate brightness (average)
      const brightness = (r + g + b) / 3;
      
      if (brightness < 20) {
        // purely transparent
        data[i + 3] = 0;
      } else if (brightness < 40) {
        // fade it to avoid jaggies
        data[i + 3] = Math.floor((brightness - 20) / 20 * 255);
      }
    }

    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png()
    .toFile(outputPath);

    console.log("Successfully made transparent with sharp!");
  } catch (error) {
    console.error("Error with sharp:", error);
  }
}

processLogo();
